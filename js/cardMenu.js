fetch("../data/menu.json")
  .then((response) => response.json())
  .then((data) => {
    const menuContainer = document.getElementById("menu-content");
    const createMenuDiv = (item, index) => {
      const menuTextDelay = index * 50;
      const imageDelay = index * 50 + 5;

      if (index % 2 === 0) {
        return `
              <div class="menu-container">
                  <div class="menu-content">
                      <div class="menu-text" data-aos="fade-down" data-aos-delay="${menuTextDelay}">
                          <h1>${item.name}</h1>
                          <p>${item.description}</p>
                          <button class="price">$ ${item.price}</button>
                      </div>
                      <img src="${item.image}" alt="${item.name}" class="main-image" data-aos="fade-down" data-aos-delay="${imageDelay}" />
                  </div>
              </div>
          `;
      } else {
        return `
              <div class="menu-container">
                  <div class="menu-content">
                      <img src="${item.image}" alt="${
          item.name
        }" class="main-image" data-aos="fade-right" data-aos-delay="${imageDelay}" />
                      <div class="menu-text" data-aos="fade-right" data-aos-delay="${
                        menuTextDelay + 100
                      }">
                          <h1>${item.name}</h1>
                          <p>${item.description}</p>
                          <button class="price">$ ${item.price}</button>
                      </div>
                  </div>
              </div>
          `;
      }
    };
    menuContainer.innerHTML = data.map(createMenuDiv).join("");
  })
  .catch((error) => console.error("Error loading menu:", error));
