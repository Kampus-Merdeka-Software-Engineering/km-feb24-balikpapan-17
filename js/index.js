AOS.init({
  duration: 1000,
  once: false,
  mirror: true,
});

gsap.registerPlugin(TextPlugin);

gsap.to(".maven-coffee", {
  duration: 2,
  delay: 1.8,
  text: "Maven Coffee",
});

function showLoadingScreen() {
  console.log("Loading started...");
  document.getElementById("loadingScreen").style.display = "flex";
}

function hideLoadingScreen() {
  console.log("Loading finished...");
  document.getElementById("loadingScreen").style.display = "none";
}

showLoadingScreen();

setTimeout(hideLoadingScreen, 500);

document.addEventListener("DOMContentLoaded", function () {
  const loginLi = document.getElementById("loginLi");
  const dropdownContent = document.getElementById("dropdownContent");

  auth.onAuthStateChanged((user) => {
    if (!user) {
      loginLi.innerHTML = '<button id="loginButton">LOGIN</button>';
      document
        .getElementById("loginButton")
        .addEventListener("click", function () {
          window.location.href = "./pages/auth.html?#";
        });

      dropdownContent.innerHTML = `
          <a href="#home">HOME</a>
          <a href="#about">ABOUT</a>
          <a href="#menu">MENU</a>
          <a href="#team">TEAM</a>
          <a href="#bottom">CONTACT</a>
          <button id="loginA">LOGIN</button>
        `;
      document.getElementById("loginA").addEventListener("click", function () {
        window.location.href = "./pages/auth.html?#";
      });
    } else {
      loginLi.innerHTML = `
          <a >
            <i class="fa-solid fa-mug-hot fa-lg"></i>
          </a>
          <ul class="submenu">
            <li>
              <a href="./pages/profile.html"><i class="fas fa-user"></i> PROFILE</a>
            </li>
            <li id="dashboardLi">
              <a href="./pages/dashboard.html"><i class="fa-solid fa-chalkboard"></i> DASHBOARD</a>
            </li>
            <li>
              <button  id="logoutButton" onclick="logout()"><i class="fa-solid fa-power-off"></i> LOGOUT</button>
            </li>
          </ul>
        `;

      dropdownContent.innerHTML = `
          <a href="#home">HOME</a>
          <a href="#about">ABOUT</a>
          <a href="#menu">MENU</a>
          <a href="#team">TEAM</a>
          <a href="#bottom">CONTACT</a>
          <a href="./pages/profile.html">PROFILE</a>
          <a id="dropdownDashboardLink" href="./pages/dashboard.html">DASHBOARD</a>
          <a href="#" id="dropdownLogoutButton" onclick="logout()"><i class="fa-solid fa-power-off"></i> LOGOUT</a>
        `;
    }
  });
});

let scrollInterval;

function autoScroll() {
  const scrollStep = 2000;
  const delay = 30;

  scrollInterval = setInterval(() => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
      clearInterval(scrollInterval);
    } else {
      window.scrollBy(0, scrollStep);
    }
  }, delay);
}

function scrollToTop() {
  if (scrollInterval) {
    clearInterval(scrollInterval);
  }
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

document.getElementById("discoverBtn").addEventListener("click", () => {
  autoScroll();
});

document.getElementById("scrollTopBtn").addEventListener("click", () => {
  scrollToTop();
});

window.addEventListener("scroll", () => {
  const scrollTopBtn = document.getElementById("scrollTopBtn");
  if (window.scrollY > window.innerHeight) {
    scrollTopBtn.classList.add("show");
  } else {
    scrollTopBtn.classList.remove("show");
  }
});
