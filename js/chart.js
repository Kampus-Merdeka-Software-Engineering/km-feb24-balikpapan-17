function loadAndInitialize() {
  $.ajax({
    url: "../data/data.json",
    dataType: "json",
    success: function (data) {
      window.data = data;

      populateMonthFilter(data);
      populateCategoryFilter(data);
      loadMonthFilters();
      loadCategoryFilters();

      const selectedStartMonth =
        localStorage.getItem("selectedStartMonth") || "Jan";
      const selectedEndMonth =
        localStorage.getItem("selectedEndMonth") || "Jun";
      const selectedCategories = JSON.parse(
        localStorage.getItem("selectedCategories")
      ) || ["all"];

      updateDashboard(selectedStartMonth, selectedEndMonth);
      updateFilterInfo(
        selectedStartMonth,
        selectedEndMonth,
        selectedCategories
      );
      updateDropdownBtnText(selectedCategories);
    },
    error: function (xhr, status, error) {
      console.error("Error fetching data:", error);
    },
  });
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
    showClass: {
      popup: "swipe-in-from-bottom",
    },
    hideClass: {
      popup: "swipe-out-to-bottom",
    },
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

  startMonthFilter.value = "Jan";
  endMonthFilter.value = "Jun";
}

const handleMonthFilterChange = (changedMonth) => {
  const selectedStartMonth = document.getElementById("startMonthFilter").value;
  const selectedEndMonth = document.getElementById("endMonthFilter").value;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

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

  updateDashboard(selectedStartMonth, selectedEndMonth);
  updateFilterInfo(selectedStartMonth, selectedEndMonth, selectedCategories);
};

document
  .getElementById("startMonthFilter")
  .addEventListener("change", function () {
    handleMonthFilterChange(this, document.getElementById("endMonthFilter"));
  });

document
  .getElementById("endMonthFilter")
  .addEventListener("change", function () {
    handleMonthFilterChange(this, document.getElementById("startMonthFilter"));
  });

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

      saveCategoryFilters();
      updateDashboard(selectedStartMonth, selectedEndMonth);
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
      .map((product_category) => `<li>${product_category}</li>`)
      .join("")}</ul>`;
  }

  filterInfo.innerHTML = `<p>Selected Categories :${categoriesText}</p>`;
}

function updateDashboard(selectedStartMonth, selectedEndMonth) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const startIndex = months.indexOf(selectedStartMonth);
  const endIndex = months.indexOf(selectedEndMonth);

  if (startIndex > endIndex) {
    showErrorModal("End month cannot be before start month.");
    return;
  }

  var filteredData = window.data.filter((item) => {
    const itemMonthIndex = months.indexOf(item.month_name);
    return itemMonthIndex >= startIndex && itemMonthIndex <= endIndex;
  });

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

  createProductSalesChart(filteredData);
  createProductChart(filteredData);
  createRevenueAndSalesChart(filteredData);
  createForecastChart(filteredData);
  createRevenueByMonthChart(filteredData);
  createRevenueGrowthChart(filteredData);
  createTopSellingProductsChart(filteredData);
  createRevenueByProductChart(filteredData);
  createRevenueByProductDoughnutChart(filteredData);
  createRevenueBySalesDoughnutChart(filteredData);
  createSalesRevenueRelationChart(filteredData);
  updateTopSellingProductsList(filteredData);

  let timeFrame = selectedStartMonth;
  if (selectedStartMonth !== selectedEndMonth) {
    timeFrame += ` - ${selectedEndMonth}`;
  }

  const timeFrameElements = document.querySelectorAll("#timeFrame");
  timeFrameElements.forEach((element) => {
    element.textContent = timeFrame;
  });
}

// ## METRICS ##

function updateTable(filteredData) {
  var table = $("#transactionTable").DataTable({
    scrollX: true,
    responsive: true,
    pageLength: 25,
    retrieve: true,
  });
  table.clear();

  filteredData.forEach(function (item, index) {
    table.row.add([
      index + 1,
      formatDate(item.transaction_date),
      item.transaction_time,
      item.product_id,
      item.product_category,
      item.transaction_qty,
      item.unit_price,
    ]);
  });

  table.draw();
}

function updateMetrics(filteredData) {
  function formatValue(value) {
    return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : `${value}k`;
  }

  const totalRevenue = Math.round(
    filteredData.reduce((acc, curr) => acc + curr.revenue, 0) / 1000
  );
  document.getElementById("totalRevenue").textContent =
    formatValue(totalRevenue);

  const totalTransaction = Math.round(
    filteredData.reduce((acc, curr) => acc + curr.transaction_qty, 0) / 1000
  );
  document.getElementById("totalTransaction").textContent =
    formatValue(totalTransaction);

  const salesAmount = Math.round(
    filteredData.reduce(
      (acc, curr) => acc + curr.revenue * curr.transaction_qty,
      0
    ) / 1000
  );
  document.getElementById("salesAmount").textContent = formatValue(salesAmount);

  const groupedData = filteredData.reduce((acc, curr) => {
    if (!acc[curr.month_name]) {
      acc[curr.month_name] = [];
    }
    acc[curr.month_name].push(curr.growth_rev);
    return acc;
  }, {});

  const totalMonthlyGrowthByMonth = {};
  for (const monthYear in groupedData) {
    const totalMonthlyGrowth = groupedData[monthYear].reduce(
      (acc, curr) => acc + curr,
      0
    );
    totalMonthlyGrowthByMonth[monthYear] = totalMonthlyGrowth;
  }
  const monthsCount = Object.keys(groupedData).length;
  const totalMonthlyGrowth = Object.values(totalMonthlyGrowthByMonth).reduce(
    (acc, curr) => acc + curr,
    0
  );
  const averageMonthlyGrowth = totalMonthlyGrowth / monthsCount;
  const roundedAverageMonthlyGrowth = (averageMonthlyGrowth / 10000).toFixed(2);
  document.getElementById(
    "averageRevenueGrowth"
  ).textContent = `${roundedAverageMonthlyGrowth}%`;
}

function updateTopSellingProductsList(data) {
  const productSalesPerMonth = {};
  const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

  const selectedStartMonth =
    localStorage.getItem("selectedStartMonth") || "Jan";
  const selectedEndMonth = localStorage.getItem("selectedEndMonth") || "Jun";
  const startMonthIndex = monthOrder.indexOf(selectedStartMonth);
  const endMonthIndex = monthOrder.indexOf(selectedEndMonth);

  data.forEach((entry) => {
    const month = entry.month_name;
    const monthIndex = monthOrder.indexOf(month);
    if (monthIndex >= startMonthIndex && monthIndex <= endMonthIndex) {
      if (!productSalesPerMonth[month]) {
        productSalesPerMonth[month] = {};
      }
      const category = entry.product_category;
      if (productSalesPerMonth[month][category]) {
        productSalesPerMonth[month][category] += entry.transaction_qty;
      } else {
        productSalesPerMonth[month][category] = entry.transaction_qty;
      }
    }
  });

  let totalTransactionsInRange = 0;
  for (
    let monthIndex = startMonthIndex;
    monthIndex <= endMonthIndex;
    monthIndex++
  ) {
    const month = monthOrder[monthIndex];
    if (productSalesPerMonth[month]) {
      for (const category in productSalesPerMonth[month]) {
        totalTransactionsInRange += productSalesPerMonth[month][category];
      }
    }
  }

  const topProductsOverall = {};

  for (const month in productSalesPerMonth) {
    for (const category in productSalesPerMonth[month]) {
      if (topProductsOverall[category]) {
        topProductsOverall[category] += productSalesPerMonth[month][category];
      } else {
        topProductsOverall[category] = productSalesPerMonth[month][category];
      }
    }
  }

  let timeFrame = selectedStartMonth;
  if (selectedStartMonth !== selectedEndMonth) {
    timeFrame += ` - ${selectedEndMonth}`;
  }

  const sortedCategoriesOverall = Object.entries(topProductsOverall)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  let listHTML = "";

  listHTML += `
    <div class="chart-container-header">
      <h2>Top 5 Product</h2>
      <span>${timeFrame}</span>
    </div>
    <div class="acquisitions-bar">`;

  sortedCategoriesOverall.forEach((category, index) => {
    const totalSales = category[1];
    const percentage = ((totalSales / totalTransactionsInRange) * 100).toFixed(
      2
    );

    let progressClass = "";
    switch (index) {
      case 0:
        progressClass = "applications";
        break;
      case 1:
        progressClass = "shortlisted";
        break;
      case 2:
        progressClass = "on-hold";
        break;
      case 3:
        progressClass = "rejected";
        break;
      case 4:
        progressClass = "fivt";
        break;
      default:
        progressClass = "";
    }

    const barWidth = percentage + "%";

    listHTML += `
      <span class="bar-progress ${progressClass}" style="width: ${barWidth}"></span>
    `;
  });

  listHTML += `</div>`;

  sortedCategoriesOverall.forEach((category, index) => {
    const totalSales = category[1];
    let progressClass = "";
    switch (index) {
      case 0:
        progressClass = "applications";
        break;
      case 1:
        progressClass = "shortlisted";
        break;
      case 2:
        progressClass = "on-hold";
        break;
      case 3:
        progressClass = "rejected";
        break;
      case 4:
        progressClass = "fivt";
        break;
      default:
        progressClass = "";
    }

    listHTML += `<div class="progress-bar-info ${progressClass}">
      <span class="progress-color ${progressClass}"></span>
      <span class="progress-type">${category[0]}</span>
      <span class="progress-amount">${totalSales} units</span>
    </div>`;
  });

  document.getElementById("chartContainer").innerHTML = listHTML;
}

// ## OVERVIEW CHART ##

function createRevenueAndSalesChart(data) {
  const groupedData = data.reduce((acc, curr) => {
    if (!acc[curr.month_name]) {
      acc[curr.month_name] = { revenue: 0, sales: 0 };
    }
    acc[curr.month_name].revenue += curr.revenue;
    acc[curr.month_name].sales += curr.transaction_qty;
    return acc;
  }, {});

  const labels = Object.keys(groupedData);
  const revenueData = Object.values(groupedData).map((item) => item.revenue);
  const salesData = Object.values(groupedData).map((item) => item.sales);

  var ctx = document.getElementById("revenueAndSalesChart").getContext("2d");

  if (window.revenueAndSalesChart) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  window.revenueAndSalesChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Revenue",
          data: revenueData,
          backgroundColor: "#5e3229",
          borderWidth: 1,
        },
        {
          label: "Total Sales",
          data: salesData,
          backgroundColor: "#90C114",
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          title: {
            display: true,
            text: "Revenue",
            font: {
              weight: "bold",
            },
          },
          ticks: {
            beginAtZero: true,
          },
          grid: {
            color: "#212121",
            lineWidth: 0.2,
          },
        },
        x: {
          title: {
            display: true,
            text: "Month",
            font: {
              weight: "bold",
            },
          },
          ticks: {
            beginAtZero: true,
          },
          grid: {
            color: "#21212100",
            lineWidth: 0.2,
          },
        },
      },
    },
  });
}

function createForecastChart(data) {
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const monthlyRevenue = data.reduce((acc, transaction) => {
    const month = new Date(transaction.transaction_date).getMonth() + 1;
    acc[month] = (acc[month] || 0) + transaction.revenue;
    return acc;
  }, {});

  const revenueData = Object.keys(monthlyRevenue).map((month) => ({
    bulan: parseInt(month),
    pendapatan: monthlyRevenue[month],
    monthName: monthNames[parseInt(month) - 1],
  }));

  function linearRegression(data) {
    const n = data.length;
    const sumX = data.reduce((sum, point) => sum + point.bulan, 0);
    const sumY = data.reduce((sum, point) => sum + point.pendapatan, 0);
    const sumXY = data.reduce(
      (sum, point) => sum + point.bulan * point.pendapatan,
      0
    );
    const sumX2 = data.reduce(
      (sum, point) => sum + point.bulan * point.bulan,
      0
    );

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  }

  function forecastPendapatan(data, startMonth, endMonth) {
    const { slope, intercept } = linearRegression(data);
    const forecast = [];

    for (let bulan = startMonth; bulan <= endMonth; bulan++) {
      const prediksiPendapatan = slope * bulan + intercept;
      forecast.push({
        bulan,
        pendapatan: prediksiPendapatan,
        monthName: monthNames[bulan - 1],
      });
    }

    return forecast;
  }

  const forecastData = forecastPendapatan(revenueData, 7, 12);
  const combinedData = revenueData.concat(forecastData);

  const labels = combinedData.map((point) => point.monthName);
  const pendapatanActual = combinedData
    .slice(0, 6)
    .map((point) => point.pendapatan);
  const pendapatanForecast = combinedData.map((point) => point.pendapatan);

  var ctx = document.getElementById("forecastChart").getContext("2d");

  if (window.forecastChart) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  window.forecastChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Monthly Revenue",
          data: pendapatanActual,
          borderColor: "#5e3229",
          backgroundColor: "#5e3229",
          borderWidth: 2,
          fill: false,
        },
        {
          label: "Forecast",
          data: pendapatanForecast,
          borderColor: "#CCFF00",
          backgroundColor: "#CCFF00",
          borderWidth: 3,
          fill: false,
          borderDash: [10, 10],
          pointHitRadius: 5,
          pointBorderWidth: 1,
          pointBorderColor: "#CCFF0000",
        },
      ],
    },
    options: {
      scales: {
        y: {
          title: {
            display: true,
            text: "Monthly Revenue vs Forecast",
            font: {
              weight: "bold",
            },
          },
          ticks: {
            beginAtZero: true,
            stepSize: 25000,
          },
          stacked: false,
          grid: {
            color: "#212121",
            lineWidth: 0.2,
          },
        },
        x: {
          title: {
            display: true,
            text: "Month",
            font: {
              weight: "bold",
            },
          },
          ticks: {
            beginAtZero: true,
          },
          stacked: false,
          grid: {
            color: "#212121",
            lineWidth: 0.2,
          },
        },
      },
    },
  });
}

function createProductSalesChart(data) {
  const productSales = {};
  data.forEach((entry) => {
    if (productSales[entry.product_category]) {
      productSales[entry.product_category] += entry.transaction_qty;
    } else {
      productSales[entry.product_category] = entry.transaction_qty;
    }
  });

  const sortedProductSales = Object.entries(productSales).sort(
    (a, b) => b[1] - a[1]
  );

  const labels = sortedProductSales.map(([product]) => product);
  const dataValues = sortedProductSales.map(([_, value]) => value);

  const ctx = document.getElementById("productSalesChart").getContext("2d");
  const globalFontFamily = "Urbanist";
  Chart.defaults.font.family = globalFontFamily;

  window.productSalesChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Total Product Sales",
          data: dataValues,
          backgroundColor: "#90C114",
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          title: {
            display: true,
            text: "Total Product Sales",
            font: {
              weight: "bold",
            },
          },
          ticks: {
            beginAtZero: true,
          },
          grid: {
            color: "#212121",
            lineWidth: 0.2,
          },
        },
        x: {
          title: {
            display: true,
            text: "Product Category",
            font: {
              weight: "bold",
            },
          },
          ticks: {
            beginAtZero: true,
          },
          grid: {
            color: "#21212100",
            lineWidth: 0.2,
          },
        },
      },
    },
  });
}

// ## SALES CHART ##

function createRevenueByMonthChart(data) {
  const groupedData = data.reduce((acc, curr) => {
    if (!acc[curr.month_name]) {
      acc[curr.month_name] = {
        totalRevenue: 0,
        count: 0,
      };
    }
    acc[curr.month_name].totalRevenue += curr.revenue || 0;
    acc[curr.month_name].count++;
    return acc;
  }, {});

  const labels = Object.keys(groupedData);
  const revenueData = labels.map((month) => groupedData[month].totalRevenue);
  const totalRevenue = revenueData.reduce((acc, value) => acc + value, 0);
  const totalCount = labels.length;
  const averageRevenue =
    totalCount !== 0 ? (totalRevenue / totalCount).toFixed(2) : 0;

  const averageRevenueData = labels.map(() => averageRevenue);

  var ctx = document.getElementById("revenueByMonthChart").getContext("2d");

  if (window.revenueByMonthChart) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  window.revenueByMonthChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Revenue",
          data: revenueData,
          backgroundColor: "#5e3229",
          borderColor: "#5e3229",
          borderWidth: 1,
          fill: false,
        },
        {
          label: "Average Revenue",
          data: averageRevenueData,
          backgroundColor: "#CCFF00",
          borderColor: "#CCFF00",
          borderWidth: 5,
          fill: false,
          borderDash: [10, 10],
          pointHitRadius: 5,
          pointBorderWidth: 1,
          pointBorderColor: "#CCFF0000",
        },
      ],
    },
    options: {
      scales: {
        y: {
          title: {
            display: true,
            text: "Revenue & Average Revenue",
            font: {
              weight: "bold",
            },
          },
          min: 0,
          ticks: {
            stepSize: 10000,
          },
          grid: {
            color: "#212121",
            lineWidth: 0.2,
          },
        },
        x: {
          title: {
            display: true,
            text: "Month",
            font: {
              weight: "bold",
            },
          },
          min: 0,
          ticks: {
            beginAtZero: true,
          },
          grid: {
            color: "#212121",
            lineWidth: 0.2,
          },
        },
      },
    },
  });
}

function createSalesRevenueRelationChart(data) {
  const groupedData = data.reduce((acc, curr) => {
    const key = formatDate(curr.transaction_date);
    if (!acc[key]) {
      acc[key] = {
        totalRevenue: 0,
        totalTransactions: 0,
      };
    }
    acc[key].totalRevenue += curr.revenue;
    acc[key].totalTransactions += curr.transaction_qty;
    return acc;
  }, {});

  const salesRevenueData = Object.entries(groupedData).map(
    ([date, values]) => ({
      x: values.totalRevenue,
      y: values.totalTransactions,
      r: 7,
      date: date,
    })
  );

  const ctx = document
    .getElementById("salesRevenueRelationChart")
    .getContext("2d");
  if (window.salesRevenueRelationChart instanceof Chart) {
    window.salesRevenueRelationChart.destroy();
  }
  window.salesRevenueRelationChart = new Chart(ctx, {
    type: "bubble",
    data: {
      datasets: [
        {
          label: "Sales & Revenue Relation",
          data: salesRevenueData,
          backgroundColor: "rgba(94, 50, 41, 1)",
          borderColor: "rgba(242, 242, 242, 1)",
        },
      ],
    },
    options: {
      scales: {
        x: {
          title: {
            display: true,
            text: "Revenue",
            font: {
              weight: "bold",
            },
          },
          min: 0,
          ticks: {
            stepSize: 500,
          },
          grid: {
            color: "#212121",
            lineWidth: 0.2,
          },
        },
        y: {
          title: {
            display: true,
            text: "Total Sales",
            font: {
              weight: "bold",
            },
          },
          min: 0,
          ticks: {
            stepSize: 250,
          },
          grid: {
            color: "#212121",
            lineWidth: 0.2,
          },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (context) => {
              const data = context.raw;
              return [
                `Date: ${data.date}`,
                `-`,
                `Revenue: $${data.x.toFixed(0)}`,
                `Total Sales: ${data.y}`,
              ];
            },
          },
        },
      },
    },
  });
}

function createRevenueGrowthChart(data) {
  const groupedData = data.reduce((acc, curr) => {
    if (!acc[curr.month_name]) {
      acc[curr.month_name] = [];
    }
    acc[curr.month_name].push(curr.growth_rev);
    return acc;
  }, {});

  const labels = Object.keys(groupedData);
  const growthData = labels.map((month) => {
    const growthValues = groupedData[month];
    const minGrowth = Math.min(...growthValues);
    return minGrowth.toFixed(2);
  });

  var ctx = document.getElementById("revenueGrowthChart").getContext("2d");

  if (window.revenueGrowthChart) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  window.revenueGrowthChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Revenue Growth (%)",
          data: growthData,
          borderColor: "#5e3229",
          backgroundColor: "#CCFF00",
          borderWidth: 1,
          fill: false,
          tension: 0.3,
        },
      ],
    },
    options: {
      scales: {
        y: {
          title: {
            display: true,
            text: "Revenue Growth(%)",
            font: {
              weight: "bold",
            },
          },
          ticks: {
            beginAtZero: true,
          },
          grid: {
            color: "#212121",
            lineWidth: 0.2,
          },
        },
        x: {
          title: {
            display: true,
            text: "Month",
            font: {
              weight: "bold",
            },
          },
          ticks: {
            beginAtZero: true,
          },
          grid: {
            color: "#212121",
            lineWidth: 0.2,
          },
        },
      },
    },
  });
}

// ## PRODUCT CHART ##

function createTopSellingProductsChart(data) {
  const productSales = {};
  data.forEach((entry) => {
    if (productSales[entry.product_category]) {
      productSales[entry.product_category] += entry.transaction_qty;
    } else {
      productSales[entry.product_category] = entry.transaction_qty;
    }
  });

  const sortedCategories = Object.entries(productSales)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const labels = sortedCategories.map((category) => category[0]);
  const dataValues = sortedCategories.map((category) => category[1]);

  var ctx = document.getElementById("topSellingProductsChart").getContext("2d");
  if (window.topSellingProductsChart) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  window.topSellingProductsChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Total Product Sales",
          data: dataValues,
          backgroundColor: "#90C114",
          borderColor: "#90C114",
          borderWidth: 1,
        },
      ],
    },
    options: {
      indexAxis: "y",
      scales: {
        y: {
          title: {
            display: true,
            text: "Product Category",
            font: {
              weight: "bold",
            },
          },
          grid: {
            display: false,
          },
        },
        x: {
          title: {
            display: true,
            text: "Total Product Sales",
            font: {
              weight: "bold",
            },
          },
          ticks: {
            beginAtZero: true,
          },
          grid: {
            color: "#212121",
            lineWidth: 0.2,
          },
        },
      },
    },
  });
}

function createProductChart(data) {
  const productSales = {};
  data.forEach((entry) => {
    if (productSales[entry.product_category]) {
      productSales[entry.product_category] += entry.transaction_qty;
    } else {
      productSales[entry.product_category] = entry.transaction_qty;
    }
  });

  const labels = Object.keys(productSales);
  const dataValues = Object.values(productSales);

  var ctx = document.getElementById("productChart").getContext("2d");

  if (window.productChart) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  window.productChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Total Product Sales",
          data: dataValues,
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          ticks: {
            beginAtZero: true,
          },
          grid: {
            color: "rgba(200, 200, 200, 0.08)",
            lineWidth: 1,
          },
        },
        x: {
          title: {
            display: true,
            text: "Month",
            font: {
              weight: "bold",
            },
          },
          ticks: {
            beginAtZero: true,
          },
          grid: {
            color: "#21212100",
            lineWidth: 0.2,
          },
        },
      },
    },
  });
}

function createRevenueByProductDoughnutChart(data) {
  const productRev = {};
  data.forEach((entry) => {
    if (productRev[entry.product_category]) {
      productRev[entry.product_category] += entry.revenue;
    } else {
      productRev[entry.product_category] = entry.revenue;
    }
  });

  const totalRev = Object.values(productRev).reduce(
    (acc, curr) => acc + curr,
    0
  );

  const productsWithPercentage = Object.entries(productRev).map(
    ([product, revenue]) => ({
      product,
      revenue,
      percentage: ((revenue / totalRev) * 100).toFixed(2),
    })
  );

  const sortedProducts = productsWithPercentage.sort(
    (a, b) => b.revenue - a.revenue
  );

  const labels = sortedProducts.map(({ product }) => product);
  const revenueData = sortedProducts.map(({ revenue }) => revenue);
  const percentageData = sortedProducts.map(({ percentage }) => percentage);
  const backgroundColors = labels.map((product) => getColor(product));

  const ctx = document
    .getElementById("revenueByProductDoughnutChart")
    .getContext("2d");

  window.revenueByProductDoughnutChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Revenue",
          data: revenueData,
          backgroundColor: backgroundColors,
          borderColor: "#f2f2f200",
        },
      ],
    },
    options: {
      responsive: true,
      animation: {
        duration: 1000,
        easing: "easeOutBack",
      },
      layout: {
        padding: 30,
      },
      plugins: {
        legend: {
          display: true,
          position: "right",
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || "";
              const value = context.raw || 0;
              const percentage = percentageData[context.dataIndex] || "0.00";
              return `${label}: $${value.toLocaleString()} (${percentage}%)`;
            },
          },
        },
      },
    },
  });
}

function createRevenueBySalesDoughnutChart(filteredData) {
  const productSales = {};
  filteredData.forEach((entry) => {
    if (productSales[entry.product_category]) {
      productSales[entry.product_category] += entry.transaction_qty;
    } else {
      productSales[entry.product_category] = entry.transaction_qty;
    }
  });

  const totalSales = Object.values(productSales).reduce(
    (acc, curr) => acc + curr,
    0
  );

  const productsWithPercentage = Object.entries(productSales).map(
    ([product, sales]) => ({
      product,
      sales,
      percentage: ((sales / totalSales) * 100).toFixed(2),
    })
  );

  const sortedProducts = productsWithPercentage.sort(
    (a, b) => b.sales - a.sales
  );

  const labels = sortedProducts.map(({ product }) => product);
  const salesData = sortedProducts.map(({ sales }) => sales);
  const percentageData = sortedProducts.map(({ percentage }) => percentage);
  const backgroundColors = labels.map((product) => getColor(product));

  const ctx = document
    .getElementById("revenueBySalesDoughnutChart")
    .getContext("2d");

  window.revenueBySalesDoughnutChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Sales",
          data: salesData,
          backgroundColor: backgroundColors,
          borderColor: "#f2f2f200",
        },
      ],
    },
    options: {
      responsive: true,
      animation: {
        duration: 1000,
        easing: "easeOutBack",
      },
      layout: {
        padding: 30,
      },
      plugins: {
        legend: {
          display: true,
          position: "right",
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || "";
              const value = context.raw || 0;
              const percentage = percentageData[context.dataIndex] || "0.00";
              return `${label}: ${value.toLocaleString()} (${percentage}%)`;
            },
          },
        },
      },
    },
  });
}

function createRevenueByProductChart(data) {
  const productRevenue = {};
  data.forEach((entry) => {
    if (productRevenue[entry.product_category]) {
      productRevenue[entry.product_category] += entry.revenue;
    } else {
      productRevenue[entry.product_category] = entry.revenue;
    }
  });

  const sortedProducts = Object.entries(productRevenue).sort(
    (a, b) => b[1] - a[1]
  );

  const labels = sortedProducts.map((product) => product[0]);
  const dataValues = sortedProducts.map((product) => product[1]);

  var ctx = document.getElementById("revenueByProductChart").getContext("2d");
  if (window.revenueByProductChart) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  window.revenueByProductChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Product Revenue",
          data: dataValues,
          backgroundColor: "#90C114",
          borderColor: "#90C114",
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          title: {
            display: true,
            text: "Product Revenue",
            font: {
              weight: "bold",
            },
          },
          ticks: {
            beginAtZero: true,
          },
          grid: {
            color: "rgba(200, 200, 200, 0.08)",
            lineWidth: 1,
          },
        },
        x: {
          title: {
            display: true,
            text: "Product Category",
            font: {
              weight: "bold",
            },
          },
          ticks: {
            beginAtZero: false,
          },
        },
      },
    },
  });
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

document.addEventListener("DOMContentLoaded", () => {
  updateFilterInfoFromLocalStorage();
  loadMonthFilters();
});

loadAndInitialize();
