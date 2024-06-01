document.addEventListener("DOMContentLoaded", function () {
  loadAll();
});

async function loadAll() {
  loadAndInitialize();
  await checkAuthStatus();
  updateFilterInfoFromLocalStorage();
  loadMonthFilters();
  setupSidebarLinks();
  setupDropdownMenu();
}

async function checkAuthStatus() {
  showLoadingScreen();

  auth.onAuthStateChanged(async (user) => {
    try {
      if (user) {
        const doc = await firestore.collection("users").doc(user.uid).get();
        if (doc.exists) {
          const userData = doc.data();
          const userRole = userData.role;

          handleUserAccess(userRole);
        } else {
          handleUserDataNotFound();
        }
      } else {
        handleUserSignedOut();
      }
    } catch (error) {
      handleError(error);
    } finally {
      hideLoadingScreen();
    }
  });
}

function handleUserAccess(userRole) {
  console.log("Welcome User!");
  document.getElementById("transaction").style.display = "block";
}

function handleUserDataNotFound() {
  console.log("User data not found");
  redirectToAuthPage();
}

function handleUserSignedOut() {
  console.log("User is signed out");
  redirectToAuthPage();
}

function handleError(error) {
  console.error("Error:", error);
  const errorMessage =
    error instanceof Error ? error.message : "An unknown error occurred.";
  sessionStorage.setItem("activePage", "dashboard");
  redirectToAuthPage(errorMessage);
}

function redirectToAuthPage(errorMessage) {
  const url = new URL("../pages/auth.html", window.location.href);
  url.searchParams.append("error", errorMessage);
  window.location.href = url.href;
}

function showLoadingScreen() {
  document.getElementById("loadingScreen").style.display = "block";
}

function hideLoadingScreen() {
  document.getElementById("loadingScreen").style.display = "none";
}

function setupSidebarLinks() {
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
        sessionStorage.setItem("activePage", "dashboard");
        window.location.hash = "#";
      } else {
        const newUrl = window.location.pathname + "#" + contentId;
        history.pushState(null, "", newUrl);
        sessionStorage.setItem("activePage", contentId);
      }

      window.location.reload();
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
}

function setupDropdownMenu() {
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
    if (
      event.target !== dropdownBtn &&
      !dropdownContent.contains(event.target)
    ) {
      dropdownContent.classList.remove("show");
    }
  });
}

async function loadPage(pageName) {
  try {
    showLoadingScreen();

    if (!pageName) {
      pageName = sessionStorage.getItem("activePage") || "dashboard";
    }

    const response = await fetch(`${pageName}.html`);
    if (!response.ok) {
      throw new Error(`Page ${pageName}.html not found.`);
    }

    const html = await response.text();
    displayPage(html, pageName);
  } catch (error) {
    handleError(error);
  }
}

function displayPage(html, pageName) {
  if (pageName !== "dashboard") {
    document.getElementById("main-content").innerHTML = html;
  }

  initializePage(pageName);
}

function initializePage(pageName) {
  switch (pageName) {
    case "dashboard":
      break;
    case "transaction":
      break;
    case "sales":
      break;
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
    dropdownContent.classList.toggle("showFilter");
    event.stopPropagation();
  });

window.addEventListener("click", function (event) {
  var dropdownContent = document.getElementById("categoryFilterContainer");
  var dropdownBtn = document.getElementById("dropdownBtn");
  if (event.target !== dropdownBtn && !dropdownContent.contains(event.target)) {
    dropdownContent.classList.remove("showFilter");
  }
});
