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
            sessionStorage.setItem("userRole", userRole);

            const pageName = sessionStorage.getItem("activePage");
            if (pageName === "transaction" && userRole === "user") {
              sessionStorage.setItem("activePage", "dashboard");
              deniedModal(
                "Access denied: Users are not authorized to access the Transaction page."
              ).then(() => {
                window.location.href = "../pages/dashboard.html";
              });
            } else {
              loadPage(pageName || "dashboard");
            }
          } else {
            console.log("User data not found");
            window.location.href = "../index.html";
          }
        })
        .catch((error) => {
          console.error("Error getting user data:", error);
          window.location.href = "../index.html";
        })
        .finally(() => {
          hideLoadingScreen();
        });
    } else {
      deniedModal(
        "Access denied: You must be logged in to access this page."
      ).then(() => {
        window.location.href = "../index.html";
      });
      hideLoadingScreen();
    }
  });
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
      const userRole = sessionStorage.getItem("userRole");

      if (contentId === "transaction" && userRole === "user") {
        deniedModal(
          "Access denied: Users are not authorized to access the Transaction page."
        );
        sessionStorage.setItem("activePage", "dashboard");
        return;
      }

      links.forEach((link) => {
        link.classList.remove("active");
      });

      this.classList.add("active");

      if (contentId === "dashboard") {
        window.location.hash = "#";
        sessionStorage.setItem("activePage", "dashboard");
        loadAndInitialize();
        window.location.reload();
      } else {
        const newUrl = window.location.pathname + "#" + contentId;
        history.pushState(null, "", newUrl);
        sessionStorage.setItem("activePage", contentId);

        loadPage(contentId);
        loadAndInitialize();
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
  if (!pageName) {
    pageName = sessionStorage.getItem("activePage") || "dashboard";
  }

  const userRole = sessionStorage.getItem("userRole");
  if (pageName === "transaction" && userRole === "user") {
    deniedModal(
      "Access denied: Users are not authorized to access the Transaction page."
    );
    sessionStorage.setItem("activePage", "dashboard");
    window.location.href = "../pages/dashboard.html";
    return;
  }

  const xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4) {
      if (this.status == 200) {
        if (pageName !== "dashboard") {
          document.getElementById("main-content").innerHTML = this.responseText;
        }
        initializePage(pageName);
      } else if (this.status == 404) {
        console.error(`Page ${pageName}.html not found.`);
      }
    }
  };
  xhttp.open("GET", `${pageName}.html`, true);
  xhttp.send();
}

function initializePage(pageName) {
  const userRole = sessionStorage.getItem("userRole");

  if (pageName === "transaction" && userRole === "user") {
    deniedModal(
      "Access denied: Users are not authorized to access the Transaction page."
    );
    sessionStorage.setItem("activePage", "dashboard");
    return;
  }

  switch (pageName) {
    case "transaction":
    case "sales":
    case "product":
      break;
    default:
      break;
  }
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

document.addEventListener("DOMContentLoaded", function () {
  checkAuthStatus();
});
