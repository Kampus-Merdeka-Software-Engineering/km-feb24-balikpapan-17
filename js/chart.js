Chart.defaults.font.family = "Urbanist, sans-serif";

async function initIndexedDB() {
  const request = indexedDB.open("dataDB", 1);
  request.onupgradeneeded = (event) => {
    const db = event.target.result;
    db.createObjectStore("dataStore", { keyPath: "id" });
  };
  return new Promise((resolve, reject) => {
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

async function saveDataToIndexedDB(db, data) {
  const transaction = db.transaction(["dataStore"], "readwrite");
  const store = transaction.objectStore("dataStore");
  const request = store.put({ id: "data", value: data });
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve();
    request.onerror = (event) => reject(event.target.error);
  });
}

async function loadDataFromIndexedDB(db) {
  const transaction = db.transaction(["dataStore"], "readonly");
  const store = transaction.objectStore("dataStore");
  const request = store.get("data");
  return new Promise((resolve, reject) => {
    request.onsuccess = (event) =>
      resolve(event.target.result ? event.target.result.value : null);
    request.onerror = (event) => reject(event.target.error);
  });
}

async function loadAndInitialize() {
  try {
    showLoadingScreen();
    const db = await initIndexedDB();
    let data = await loadDataFromIndexedDB(db);
    if (!data) {
      const response = await fetch("../data/data.json");
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      data = await response.json();
      await saveDataToIndexedDB(db, data);
    }
    window.data = data;
    populateMonthFilter(data);
    populateCategoryFilter(data);
    loadMonthFilters();
    loadCategoryFilters();
    const selectedStartMonth =
      localStorage.getItem("selectedStartMonth") || "Jan";
    const selectedEndMonth = localStorage.getItem("selectedEndMonth") || "Jun";
    const selectedCategories = JSON.parse(
      localStorage.getItem("selectedCategories")
    ) || ["all"];
    const sortOrder = "default";
    await updateDashboard(selectedStartMonth, selectedEndMonth, sortOrder);
    updateFilterInfo(selectedStartMonth, selectedEndMonth, selectedCategories);
    updateDropdownBtnText(selectedCategories);
  } catch (error) {
    console.error("Error fetching data:", error);
  } finally {
    hideLoadingScreen();
  }
}

// ## ALL HANDLE ##
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { day: "2-digit", month: "short", year: "numeric" };
  return date.toLocaleDateString("en-GB", options);
}

const showErrorModal = (message) => {
  Swal.fire({
    title: "Error!",
    text: message,
    iconHtml: "<i class='fa-solid fa-bug'></i>",
    width: 600,
    padding: "3em",
    showClass: { popup: "swipe-in-from-bottom" },
    hideClass: { popup: "swipe-out-to-bottom" },
    customClass: {
      title: "my-title-class",
      content: "my-content-class",
      confirmButton: "my-confirm-button-class",
    },
    buttonsStyling: false,
  });
};

// ## MONTH FILTER ##
function populateMonthFilter(data) {
  const startMonthFilter = document.getElementById("startMonthFilter");
  const endMonthFilter = document.getElementById("endMonthFilter");

  const months = [
    ...new Set(data.map((item) => item.month_name).filter((month) => month)),
  ];

  startMonthFilter.innerHTML = "";
  endMonthFilter.innerHTML = "";

  months.forEach((month) => {
    const optionStart = document.createElement("option");
    optionStart.value = month;
    optionStart.textContent = month;
    startMonthFilter.appendChild(optionStart);

    const optionEnd = document.createElement("option");
    optionEnd.value = month;
    optionEnd.textContent = month;
    endMonthFilter.appendChild(optionEnd);
  });

  startMonthFilter.value = localStorage.getItem("selectedStartMonth") || "Jan";
  endMonthFilter.value = localStorage.getItem("selectedEndMonth") || "Jun";
}

function updateMonthFilters(selectedStartMonth, selectedEndMonth) {
  const startMonthFilter = document.getElementById("startMonthFilter");
  const endMonthFilter = document.getElementById("endMonthFilter");

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

  startMonthFilter.innerHTML = "";
  endMonthFilter.innerHTML = "";

  months.forEach((month) => {
    const optionStart = document.createElement("option");
    optionStart.value = month;
    optionStart.textContent = month;
    startMonthFilter.appendChild(optionStart);

    const optionEnd = document.createElement("option");
    optionEnd.value = month;
    optionEnd.textContent = month;
    endMonthFilter.appendChild(optionEnd);
  });

  startMonthFilter.value = selectedStartMonth;
  endMonthFilter.value = selectedEndMonth;
}

const handleMonthFilterChange = () => {
  const selectedStartMonth = document.getElementById("startMonthFilter").value;
  const selectedEndMonth = document.getElementById("endMonthFilter").value;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  let sortOrder = "default";

  const startIndex = months.indexOf(selectedStartMonth);
  const endIndex = months.indexOf(selectedEndMonth);

  if (startIndex > endIndex) {
    showErrorModal("End month cannot be before start month.");
    document.getElementById("startMonthFilter").value =
      localStorage.getItem("selectedStartMonth") || "Jan";
    document.getElementById("endMonthFilter").value =
      localStorage.getItem("selectedEndMonth") || "Jun";
    return;
  }

  saveMonthFilters(selectedStartMonth, selectedEndMonth);
  const selectedCategories = Array.from(
    document.querySelectorAll(".categoryFilter:checked")
  ).map((cb) => cb.value);

  updateDashboard(selectedStartMonth, selectedEndMonth, sortOrder);
  updateFilterInfo(selectedStartMonth, selectedEndMonth, selectedCategories);
};

document
  .getElementById("startMonthFilter")
  .addEventListener("change", handleMonthFilterChange);
document
  .getElementById("endMonthFilter")
  .addEventListener("change", handleMonthFilterChange);

function saveMonthFilters(selectedStartMonth, selectedEndMonth) {
  localStorage.setItem("selectedStartMonth", selectedStartMonth);
  localStorage.setItem("selectedEndMonth", selectedEndMonth);
}

function loadMonthFilters() {
  const selectedStartMonth = localStorage.getItem("selectedStartMonth");
  const selectedEndMonth = localStorage.getItem("selectedEndMonth");
  if (selectedStartMonth) {
    document.getElementById("startMonthFilter").value = selectedStartMonth;
  }
  if (selectedEndMonth) {
    document.getElementById("endMonthFilter").value = selectedEndMonth;
  }
}

// ## CATEGORY FILTER ##
function populateCategoryFilter(data) {
  const categoryFilterContainer = document.getElementById(
    "categoryFilterContainer"
  );
  categoryFilterContainer.innerHTML = "";

  const categories = [
    ...new Set(
      data.map((item) => item.product_category).filter((category) => category)
    ),
  ];

  const allLabel = document.createElement("label");
  const allCheckbox = document.createElement("input");
  allCheckbox.type = "checkbox";
  allCheckbox.className = "categoryFilter";
  allCheckbox.value = "all";
  allCheckbox.checked = true;
  allLabel.appendChild(allCheckbox);
  allLabel.appendChild(document.createTextNode("All"));
  categoryFilterContainer.appendChild(allLabel);

  categories.forEach((category) => {
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "categoryFilter";
    checkbox.value = category;
    checkbox.checked = true;
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(category));
    categoryFilterContainer.appendChild(label);
  });

  document.querySelectorAll(".categoryFilter").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const allCheckbox = document.querySelector(
        '.categoryFilter[value="all"]'
      );
      const categoryCheckboxes = document.querySelectorAll(
        '.categoryFilter:not([value="all"])'
      );

      if (checkbox.value === "all" && checkbox.checked) {
        categoryCheckboxes.forEach((cb) => (cb.checked = true));
      } else if (checkbox.value === "all" && !checkbox.checked) {
        categoryCheckboxes.forEach((cb) => (cb.checked = false));
      } else if (!checkbox.checked) {
        allCheckbox.checked = false;
      } else {
        const allChecked = Array.from(categoryCheckboxes).every(
          (cb) => cb.checked
        );
        allCheckbox.checked = allChecked;
      }
      const selectedStartMonth =
        document.getElementById("startMonthFilter").value;
      const selectedEndMonth = document.getElementById("endMonthFilter").value;
      const selectedCategories = Array.from(
        document.querySelectorAll(".categoryFilter:checked")
      ).map((cb) => cb.value);
      let sortOrder = "default";

      saveCategoryFilters();
      updateDashboard(selectedStartMonth, selectedEndMonth, sortOrder);
      updateFilterInfo(
        selectedStartMonth,
        selectedEndMonth,
        selectedCategories
      );
      updateDropdownBtnText(selectedCategories);
    });
  });
}

function saveCategoryFilters() {
  const selectedCategories = Array.from(
    document.querySelectorAll(".categoryFilter:checked")
  ).map((cb) => cb.value);
  localStorage.setItem(
    "selectedCategories",
    JSON.stringify(selectedCategories)
  );
}

function loadCategoryFilters() {
  const selectedCategories = JSON.parse(
    localStorage.getItem("selectedCategories")
  );
  if (selectedCategories) {
    document.querySelectorAll(".categoryFilter").forEach((cb) => {
      cb.checked = selectedCategories.includes(cb.value);
    });
  }
}

function updateDropdownBtnText(selectedCategories) {
  const dropdownBtn = document.getElementById("dropdownBtn");
  if (selectedCategories.length === 0) {
    dropdownBtn.textContent = "Select Categories";
  } else if (
    selectedCategories.length === 0 &&
    !selectedCategories.includes("all")
  ) {
    dropdownBtn.textContent = "Select Categories";
  } else {
    dropdownBtn.textContent = `(${selectedCategories.length}) Categories`;
  }

  if (selectedCategories.includes("all") && selectedCategories.length > 0) {
    dropdownBtn.textContent = "All Categories";
  }
}

// ## STORAGE MANAGEMENT ##
function updateFilterInfoFromLocalStorage() {
  const selectedStartMonth =
    localStorage.getItem("selectedStartMonth") || "Jan";
  const selectedEndMonth = localStorage.getItem("selectedEndMonth") || "Jun";
  const selectedCategories = JSON.parse(
    localStorage.getItem("selectedCategories")
  ) || ["all"];

  updateFilterInfo(selectedStartMonth, selectedEndMonth, selectedCategories);
  updateDropdownBtnText(selectedCategories);
}

window.addEventListener("load", () => {
  initIndexedDB().then(() => {
    loadMonthFilters();
    updateFilterInfoFromLocalStorage();
    const selectedStartMonth =
      document.getElementById("startMonthFilter").value;
    const selectedEndMonth = document.getElementById("endMonthFilter").value;
    let sortOrder = "default";
    updateMonthFilters(selectedStartMonth, selectedEndMonth);
    updateDashboard(selectedStartMonth, selectedEndMonth, sortOrder);
  });
});

function updateFilterInfo(
  selectedStartMonth,
  selectedEndMonth,
  selectedCategories
) {
  const filterInfo = document.getElementById("filterInfo");

  let startMonthText =
    selectedStartMonth === "all" ? "All Months" : selectedStartMonth;
  let endMonthText =
    selectedEndMonth === "all" ? "All Months" : selectedEndMonth;

  let categoriesText = "";
  if (selectedCategories.includes("all")) {
    categoriesText = "All";
  } else if (selectedCategories.length === 0) {
    categoriesText = "None";
  } else {
    categoriesText = `<ul>${selectedCategories
      .map((category) => `<li>${category}</li>`)
      .join("")}</ul>`;
  }

  filterInfo.innerHTML = `<p>Selected Categories :${categoriesText}</p>`;
}

async function updateDashboard(
  selectedStartMonth,
  selectedEndMonth,
  sortOrder = "default"
) {
  try {
    const db = await initIndexedDB();
    const cachedData = await loadDataFromIndexedDB(db);
    let filteredData;

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const startIndex = months.indexOf(selectedStartMonth);
    const endIndex = months.indexOf(selectedEndMonth);

    if (startIndex > endIndex) {
      showErrorModal("End month cannot be before start month.");
      return;
    }

    if (cachedData) {
      filteredData = cachedData.filter((item) => {
        const itemMonthIndex = months.indexOf(item.month_name);
        return itemMonthIndex >= startIndex && itemMonthIndex <= endIndex;
      });
    } else {
      filteredData = window.data.filter((item) => {
        const itemMonthIndex = months.indexOf(item.month_name);
        return itemMonthIndex >= startIndex && itemMonthIndex <= endIndex;
      });
      await saveDataToIndexedDB(db, filteredData);
    }

    const selectedCategories = Array.from(
      document.querySelectorAll(".categoryFilter:checked")
    ).map((cb) => cb.value);

    if (!selectedCategories.includes("all")) {
      filteredData = filteredData.filter((item) =>
        selectedCategories.includes(item.product_category)
      );
    }

    updateTable(filteredData);
    updateMetrics(filteredData);

    const charts = [
      "productSalesChart",
      "productChart",
      "revenueAndSalesChart",
      "forecastChart",
      "revenueByMonthChart",
      "revenueGrowthChart",
      "topSellingProductsChart",
      "revenueVsQtyChart",
      "revenueByProductChart",
      "revenueByProductDoughnutChart",
      "revenueBySalesDoughnutChart",
      "salesRevenueRelationChart",
    ];

    charts.forEach((chart) => {
      if (window[chart] && typeof window[chart].destroy === "function") {
        window[chart].destroy();
      }
    });

    const createCharts = [
      createProductSalesChart,
      createRevenueAndSalesChart,
      createForecastChart,
      createRevenueByMonthChart,
      createRevenueGrowthChart,
      createTopSellingProductsChart,
      createRevenueVsQtyChart,
      createRevenueByProductChart,
      createRevenueByProductDoughnutChart,
      createRevenueBySalesDoughnutChart,
      createSalesRevenueRelationChart,
    ];

    createCharts.forEach((createChartFn) => {
      createChartFn(filteredData);
    });

    updateTopSellingProductsList(filteredData);

    let timeFrame = selectedStartMonth;
    if (selectedStartMonth !== selectedEndMonth) {
      timeFrame += ` - ${selectedEndMonth}`;
    }

    const timeFrameElements = document.querySelectorAll("#timeFrame");
    timeFrameElements.forEach((element) => {
      element.textContent = timeFrame;
    });

    updateMonthFilters(selectedStartMonth, selectedEndMonth);
  } catch (error) {
    console.error("Error updating dashboard:", error);
  }
}

function getColor(product) {
  const colorMap = {
    Tea: "rgba(139, 69, 19, 1)",
    "D.Choco": "rgba(210, 105, 30, 1)",
    Coffee: "rgba(75, 54, 33, 1)",
    Bakery: "rgba(255, 223, 186, 1)",
    Flavours: "rgba(238, 130, 238, 1)",
    "Cff.Beans": "rgba(160, 82, 45, 1)",
    "Loose Tea": "rgba(143, 188, 143, 1)",
    "Pack.Choco": "rgba(210, 180, 140, 1)",
    Branded: "rgba(220, 20, 60, 1)",
  };

  return colorMap[product] || "rgba(0, 0, 0, 1)";
}
