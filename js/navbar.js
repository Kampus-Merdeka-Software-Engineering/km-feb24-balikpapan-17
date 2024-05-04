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
        document.getElementById("logoImage").src = "./assets/images/nvlogo.png";
        document.getElementById("logoImage").style.opacity = "1";
      }
    });
  };

  var observer = new IntersectionObserver(callback);

  observer.observe(targetElement);
});

window.addEventListener("scroll", function () {
  var navbar = document.getElementById("navbar");
  if (window.scrollY > 50) {
    navbar.classList.add("navbar-scrolled");
  } else {
    navbar.classList.remove("navbar-scrolled");
  }
});

window.addEventListener("scroll", function () {
  var scrollPosition = window.scrollY;

  document.querySelectorAll(".section").forEach(function (section) {
    var sectionId = section.getAttribute("id");

    var sectionOffset = section.offsetTop;

    var sectionHeight = section.offsetHeight;

    if (
      scrollPosition >= sectionOffset &&
      scrollPosition < sectionOffset + sectionHeight
    ) {
      navbarLinks.forEach(function (link) {
        if (link.getAttribute("href").slice(1) === sectionId) {
          link.classList.add("active");
        } else {
          link.classList.remove("active");
        }
      });
    }
  });
});
