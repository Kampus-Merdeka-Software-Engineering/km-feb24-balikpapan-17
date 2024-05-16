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

function initializePage(pageName) {
  switch (pageName) {
    case "transaction":
    case "sales":
    case "product":
      loadScript("../js/chart.js");
      break;
    default:
      break;
  }
}

function loadPage(pageName) {
  switch (pageName) {
    case "dashboard":
    case "transaction":
    case "sales":
    case "product":
      break;
    default:
      console.error(`Invalid page: ${pageName}`);
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

function loadScript(scriptName) {
  const script = document.createElement("script");
  script.src = scriptName;
  document.body.appendChild(script);
}

document
  .querySelector(".open-right-area")
  .addEventListener("click", function () {
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
