document.addEventListener("DOMContentLoaded", function () {
  loadAndInitialize();
  checkAuthStatus();
});

function checkAuthStatus() {
  showLoadingScreen();

  auth.onAuthStateChanged((user) => {
    if (user) {
      firestore
        .collection("users")
        .doc(user.uid)
        .get()
        .then((doc) => {
          if (doc.exists) {
            const userData = doc.data();
            const userRole = userData.role;

            if (userRole === "admin") {
              handleAdminAccess();
            } else if (userRole === "user") {
              handleUserAccess();
            } else {
              handleUnknownRole();
            }
          } else {
            handleUserDataNotFound();
          }
        })
        .catch(handleError)
        .finally(hideLoadingScreen);
    } else {
      handleUserSignedOut();
      hideLoadingScreen();
    }
  });
}

function handleAdminAccess() {
  console.log("Welcome Admin!");
  document.getElementById("transaction").style.display = "block";
}

function handleUserAccess() {
  console.log("Welcome User!");
  document.getElementById("transaction").style.display = "none";
}

function handleUnknownRole() {
  console.log("User role is not recognized");
  redirectToIndex();
}

function handleUserDataNotFound() {
  console.log("User data not found");
  redirectToAuthPage();
}

function handleError(error) {
  console.error("Error:", error);
  sessionStorage.setItem("activePage", "dashboard");
  redirectToAuthPage();
}

function handleUserSignedOut() {
  console.log("User is signed out");
  redirectToAuthPage();
}

function redirectToIndex() {
  window.location.href = "../index.html";
}

function redirectToAuthPage() {
  window.location.href = "../pages/auth.html";
}

function showLoadingScreen() {
  document.getElementById("loadingScreen").style.display = "block";
}

function hideLoadingScreen() {
  document.getElementById("loadingScreen").style.display = "none";
}

document.addEventListener("DOMContentLoaded", function () {
  const links = document.querySelectorAll(".sidebar a");

  links.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const contentId = this.getAttribute("id");

      links.forEach((link) => {
        link.classList.remove("active");
      });

      this.classList.add("active");

      if (contentId === "dashboard") {
        window.location.hash = "#";
        sessionStorage.setItem("activePage", "dashboard");

        window.location.reload();
      } else {
        const newUrl = window.location.pathname + "#" + contentId;
        history.pushState(null, "", newUrl);
        sessionStorage.setItem("activePage", contentId);

        loadPage(contentId);
        window.location.reload();
      }
    });
  });

  const initialHash = window.location.hash.substring(1);
  const activePage = sessionStorage.getItem("activePage");

  if (activePage) {
    const linkToActivate = document.getElementById(activePage);
    if (linkToActivate) {
      linkToActivate.classList.add("active");
    }
  } else if (initialHash && initialHash !== "dashboard") {
    const activeLink = document.getElementById(initialHash);
    if (activeLink) {
      activeLink.classList.add("active");
    }
  } else {
    const dashboardLink = document.getElementById("dashboard");
    dashboardLink.classList.add("active");
  }

  const initialPage = activePage || initialHash || "dashboard";
  if (initialPage !== "dashboard") {
    loadPage(initialPage);
  }
});

function loadPage(pageName) {
  showLoadingScreen();

  if (!pageName) {
    pageName = sessionStorage.getItem("activePage") || "dashboard";
  }

  fetch(`${pageName}.html`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Page ${pageName}.html not found.`);
      }
      return response.text();
    })
    .then((html) => {
      if (pageName === "transaction") {
        fetchUserDataAndCheckAccess(html, pageName);
      } else {
        displayPage(html, pageName);
      }
    })
    .catch((error) => {
      console.error(error.message);
    });
}

function fetchUserDataAndCheckAccess(html, pageName) {
  auth.onAuthStateChanged((user) => {
    if (user) {
      firestore
        .collection("users")
        .doc(user.uid)
        .get()
        .then((doc) => {
          if (doc.exists) {
            const userData = doc.data();
            const userRole = userData.role;

            if (pageName === "transaction" && userRole === "user") {
              sessionStorage.setItem("activePage", "dashboard");
              deniedModal(
                "Access denied: Users are not authorized to access the Transaction page."
              ).then(() => {
                window.location.href = "../pages/dashboard.html";
              });
            } else {
              displayPage(html, pageName);
            }
          } else {
            console.log("User data not found");
            window.location.href = "../pages/auth.html";
          }
        })
        .catch((error) => {
          console.error("Error getting user data:", error);
        });
    } else {
      console.log("User is signed out");
    }
  });
}

function initializePage(pageName) {
  auth.onAuthStateChanged((user) => {
    if (user) {
      firestore
        .collection("users")
        .doc(user.uid)
        .get()
        .then((doc) => {
          if (doc.exists) {
            const userData = doc.data();
            const userRole = userData.role;

            if (pageName === "transaction" && userRole === "user") {
              deniedModal(
                "Access denied: Users are not authorized to access the Transaction page."
              )
                .then(() => {
                  sessionStorage.setItem("activePage", "dashboard");

                  window.location.href = "../pages/dashboard.html";
                })
                .catch((error) => {
                  console.error(error);
                });
            }
          } else {
            console.log("User data not found");
          }
        })
        .catch((error) => {
          console.error("Error getting user data:", error);
        });
    } else {
      console.log("User is signed out");
    }
  });

  switch (pageName) {
    case "transaction":
      loadAndInitialize();
    case "sales":
    case "product":
      break;
    default:
      break;
  }
}

function displayPage(html, pageName) {
  if (pageName !== "dashboard") {
    document.getElementById("main-content").innerHTML = html;
  }

  initializePage(pageName);
}

function loadScript(scriptName) {
  const script = document.createElement("script");
  script.src = scriptName;
  document.body.appendChild(script);
}

const deniedModal = (message) => {
  Swal.fire({
    title: "Error!",
    text: message,
    iconHtml: "<i class='fa-solid fa-bug'></i>",
    width: 600,
    padding: "3em",
    customClass: {
      title: "my-title-class",
      content: "my-content-class",
      confirmButton: "my-confirm-button-class",
    },
    buttonsStyling: false,
    showCancelButton: false,
  }).then((result) => {
    if (result.isConfirmed) {
      window.location.href = "../pages/dashboard.html";
    }
  });
};

document.querySelector(".filter-button").addEventListener("click", function () {
  document.querySelector(".app-right").classList.add("show");
});

document.querySelector(".close-right").addEventListener("click", function () {
  document.querySelector(".app-right").classList.remove("show");
});

document.querySelector(".menu-button").addEventListener("click", function () {
  document.querySelector(".app-left").classList.add("show");
});

document.querySelector(".close-menu").addEventListener("click", function () {
  document.querySelector(".app-left").classList.remove("show");
});

document
  .getElementById("dropdownBtn")
  .addEventListener("click", function (event) {
    var dropdownContent = document.getElementById("categoryFilterContainer");
    dropdownContent.classList.toggle("show");

    event.stopPropagation();
  });

window.addEventListener("click", function (event) {
  var dropdownContent = document.getElementById("categoryFilterContainer");
  var dropdownBtn = document.getElementById("dropdownBtn");
  if (event.target !== dropdownBtn && !dropdownContent.contains(event.target)) {
    dropdownContent.classList.remove("show");
  }
});
