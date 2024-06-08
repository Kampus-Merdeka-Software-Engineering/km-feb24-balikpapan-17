document.addEventListener("DOMContentLoaded", function () {
  loadAll();
});

async function loadAll() {
  loadAndInitialize();
  await checkAuthStatus();
  updateFilterInfoFromLocalStorage();
  loadMonthFilters();
  setupDropdownMenu();
  setupNavLinks();
  setupButtons();
}

async function checkAuthStatus() {
  showLoadingScreen();

  const hasLoggedIn = localStorage.getItem("hasLoggedIn");

  if (hasLoggedIn) {
    return;
  }

  auth.onAuthStateChanged(async (user) => {
    try {
      if (user) {
        const hasSeenWelcomeAlert = localStorage.getItem("hasSeenWelcomeAlert");

        if (!hasSeenWelcomeAlert) {
          await Swal.fire({
            title: "Welcome!",
            icon: "success",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
          localStorage.setItem("hasSeenWelcomeAlert", "true");
        }

        localStorage.setItem("hasLoggedIn", "true");

        console.log("hi");
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

function handleUserAccess() {
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

function setupDropdownMenu() {
  const dropdownBtn = document.getElementById("dropdownBtn");
  if (dropdownBtn) {
    dropdownBtn.addEventListener("click", function (event) {
      var dropdownContent = document.getElementById("categoryFilterContainer");
      dropdownContent.classList.toggle("show");
      event.stopPropagation();
    });

    window.addEventListener("click", function (event) {
      var dropdownContent = document.getElementById("categoryFilterContainer");
      if (
        event.target !== dropdownBtn &&
        !dropdownContent.contains(event.target)
      ) {
        dropdownContent.classList.remove("show");
      }
    });
  }
}

function setupNavLinks() {
  var activeContentId = localStorage.getItem("activeContentId");
  var activeNavId = localStorage.getItem("activeNavId");
  if (activeContentId) {
    showContent(activeContentId);
  } else {
    showContent("content-overview");
  }

  if (!activeNavId) {
    activeNavId = "dashboard";
    localStorage.setItem("activeNavId", activeNavId);
  }

  var navItems = document.getElementsByClassName("nav-list-link");
  for (var i = 0; i < navItems.length; i++) {
    navItems[i].addEventListener("click", function (event) {
      event.preventDefault();
      var current = document.getElementsByClassName("active");
      if (current.length > 0) {
        current[0].classList.remove("active");
      }
      this.classList.add("active");
      var contentId = this.getAttribute("data-content");
      showContent(contentId);

      localStorage.setItem("activeContentId", contentId);
      localStorage.setItem("activeNavId", this.id);
    });
  }

  var previouslyActiveNavId = localStorage.getItem("activeNavId");
  if (previouslyActiveNavId) {
    document.getElementById(previouslyActiveNavId).classList.add("active");
  }
}

function setupButtons() {
  const filterButton = document.querySelector(".filter-button");
  if (filterButton) {
    filterButton.addEventListener("click", function () {
      document.querySelector(".app-right").classList.add("show");
    });
  }

  const closeRightButton = document.querySelector(".close-right");
  if (closeRightButton) {
    closeRightButton.addEventListener("click", function () {
      document.querySelector(".app-right").classList.remove("show");
    });
  }

  const menuButton = document.querySelector(".menu-button");
  if (menuButton) {
    menuButton.addEventListener("click", function () {
      document.querySelector(".app-left").classList.add("show");
    });
  }

  const closeMenuButton = document.querySelector(".close-menu");
  if (closeMenuButton) {
    closeMenuButton.addEventListener("click", function () {
      document.querySelector(".app-left").classList.remove("show");
    });
  }

  const dropdownBtn = document.getElementById("dropdownBtn");
  if (dropdownBtn) {
    dropdownBtn.addEventListener("click", function (event) {
      var dropdownContent = document.getElementById("categoryFilterContainer");
      dropdownContent.classList.toggle("showFilter");
      event.stopPropagation();
    });

    window.addEventListener("click", function (event) {
      var dropdownContent = document.getElementById("categoryFilterContainer");
      if (
        event.target !== dropdownBtn &&
        !dropdownContent.contains(event.target)
      ) {
        dropdownContent.classList.remove("showFilter");
      }
    });
  }
}

function showContent(contentId) {
  var contents = document.getElementsByClassName("content");
  for (var i = 0; i < contents.length; i++) {
    contents[i].style.display = "none";
  }
  document.getElementById(contentId).style.display = "block";
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
