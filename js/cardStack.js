document.addEventListener("DOMContentLoaded", function () {
  fetch("../data/stack.json")
    .then((response) => response.json())
    .then((data) => {
      const stackContent = document.getElementById("stack-content");
      data.forEach((item, index) => {
        const stackContainer = document.createElement("a");
        stackContainer.href = item.link;
        stackContainer.target = "_blank";
        stackContainer.className = "stack-container";
        stackContainer.setAttribute("data-aos", "fade-up");
        stackContainer.setAttribute("data-aos-delay", (index + 1) * 100);

        const stackLogo = document.createElement("div");
        stackLogo.className = "stack-logo";

        const img = document.createElement("img");
        img.src = item.image;
        img.alt = item.alt;

        const span = document.createElement("span");
        span.className = "stack-name";
        span.textContent = item.name;

        stackLogo.appendChild(img);
        stackLogo.appendChild(span);
        stackContainer.appendChild(stackLogo);
        stackContent.appendChild(stackContainer);
      });
    })
    .catch((error) => console.error("Error loading stack data:", error));
});
