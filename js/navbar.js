var navbarLinks = document.querySelectorAll(".nav-menu li a");

function toggleDropdown() {
  const dropdownContent = document.querySelector(".dropdown-content");
  dropdownContent.classList.toggle("show");
}

window.addEventListener("click", function (event) {
  const dropdownContent = document.querySelector(".dropdown-content");
  const dropbtn = document.querySelector(".dropbtn");
  if (
    !event.target.matches(".dropbtn") &&
    !event.target.matches(".dropdown-content") &&
    dropdownContent.classList.contains("show")
  ) {
    dropdownContent.classList.remove("show");
  }
});

document.addEventListener("DOMContentLoaded", function () {
  var targetElement = document.getElementById("maven");

  var callback = function (entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        document.getElementById("logoImage").src = "./assets/images/lgo.png";
      } else {
        document.getElementById("logoImage").classList.add("logo-img");
        document.getElementById("logoImage").src = "./assets/images/nvlg.png";
        document.getElementById("logoImage").style.opacity = "1";
      }
    });
  };

  var observer = new IntersectionObserver(callback);

  observer.observe(targetElement);
});

window.addEventListener("scroll", function () {
  var navbar = document.getElementById("navbar");
  var aboutSection = document.getElementById("menu");

  if (window.scrollY > 50) {
    navbar.classList.add("navbar-scrolled");
  } else {
    navbar.classList.remove("navbar-scrolled");
  }

  var aboutPosition = aboutSection.getBoundingClientRect();
  if (aboutPosition.top <= 0 && aboutPosition.bottom >= 0) {
    navbar.classList.add("navbar-about");
  } else {
    navbar.classList.remove("navbar-about");
  }
});

function updateActiveLinks() {
  var scrollPosition = window.scrollY;

  document.querySelectorAll(".section").forEach(function (section) {
    var sectionId = section.getAttribute("id");
    var sectionOffset = section.offsetTop;
    var sectionHeight = section.offsetHeight;

    if (
      scrollPosition >= sectionOffset &&
      scrollPosition < sectionOffset + sectionHeight
    ) {
      document
        .querySelectorAll(".nav-menu a, .dropdown-content a")
        .forEach(function (link) {
          var href = link.getAttribute("href");
          if (href) {
            link.classList.toggle("active", href.slice(1) === sectionId);
          }
        });
    }
  });
}

function initScrollListener() {
  window.addEventListener("scroll", updateActiveLinks, { passive: true });
  updateActiveLinks();
}

function observeMutations(targetNodes) {
  var config = { childList: true, subtree: true };

  var callback = function (mutationsList, observer) {
    for (var mutation of mutationsList) {
      if (mutation.type === "childList") {
        updateActiveLinks();
      }
    }
  };

  var observer = new MutationObserver(callback);
  targetNodes.forEach(function (node) {
    if (node) {
      observer.observe(node, config);
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  initScrollListener();
  observeMutations([
    document.querySelector(".nav-menu"),
    document.querySelector(".dropdown-content"),
  ]);
});

updateActiveLinks();
