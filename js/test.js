function loadAndInitialize() {
  fetch("../data/data.json")
    .then((response) => response.json())
    .then((data) => {
      window.data = data;
      populateMonthFilter(data);
      populateCategoryFilter(data);
      updateDashboard("all");
    })
    .catch((error) => console.error("Error fetching data:", error));
}

function populateMonthFilter(data) {
  const monthFilter = document.getElementById("monthFilter");
  const months = [
    ...new Set(data.map((item) => item.month_name).filter((month) => month)),
  ];

  months.forEach((month) => {
    const option = document.createElement("option");
    option.value = month;
    option.textContent = month;
    monthFilter.appendChild(option);
  });
}

function populateCategoryFilter(data) {
  const categoryFilterContainer = document.getElementById(
    "categoryFilterContainer"
  );
  categoryFilterContainer.innerHTML = ""; // Clear previous categories

  const categories = [...new Set(data.map((item) => item.product_category))];

  const allLabel = document.createElement("label");
  const allCheckbox = document.createElement("input");
  allCheckbox.type = "checkbox";
  allCheckbox.className = "categoryFilter";
  allCheckbox.value = "all";
  allCheckbox.checked = true;
  allLabel.appendChild(allCheckbox);
  allLabel.appendChild(document.createTextNode(" Semua Kategori"));
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

  // Event listener for checkboxes to update dashboard on change
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

      updateDashboard(document.getElementById("monthFilter").value);
    });
  });
}

document.getElementById("monthFilter").addEventListener("change", function () {
  updateDashboard(this.value);
});

document
  .getElementById("categoryFilterContainer")
  .addEventListener("change", function () {
    updateDashboard(document.getElementById("monthFilter").value);
  });

function updateDashboard(selectedMonth) {
  let filteredData = [];
  if (selectedMonth === "all") {
    filteredData = window.data;
  } else {
    filteredData = window.data.filter(
      (item) => item.month_name === selectedMonth
    );
  }

  const selectedCategories = Array.from(
    document.querySelectorAll(".categoryFilter:checked")
  ).map((cb) => cb.value);
  if (!selectedCategories.includes("all")) {
    filteredData = filteredData.filter((item) =>
      selectedCategories.includes(item.product_category)
    );
  }

  const totalRevenue = Math.round(
    filteredData.reduce((acc, curr) => acc + curr.revenue, 0) / 1000
  );
  const formattedTotalRevenue =
    totalRevenue >= 1000
      ? `$${(totalRevenue / 1000).toFixed(1)}k`
      : `$${totalRevenue}k`;
  document.getElementById("totalRevenue").textContent = formattedTotalRevenue;

  const totalTransaction = Math.round(
    filteredData.reduce((acc, curr) => acc + curr.transaction_qty, 0) / 1000
  );
  const formattedTotalTransaction =
    totalTransaction >= 1000
      ? `${(totalTransaction / 1000).toFixed(1)}k`
      : `${totalTransaction}k`;
  document.getElementById("totalTransaction").textContent =
    formattedTotalTransaction;

  const salesAmount = Math.round(
    filteredData.reduce(
      (acc, curr) => acc + curr.revenue * curr.transaction_qty,
      0
    ) / 1000
  );
  const formattedSalesAmount =
    salesAmount >= 1000
      ? `${(salesAmount / 1000).toFixed(1)}k`
      : `${salesAmount}k`;
  document.getElementById("salesAmount").textContent = formattedSalesAmount;

  const groupedData = filteredData.reduce((acc, curr) => {
    if (!acc[curr.month_year]) {
      acc[curr.month_year] = [];
    }
    acc[curr.month_year].push(curr.monthly_growth);
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
  document.getElementById(
    "averageRevenueGrowth"
  ).textContent = `${averageMonthlyGrowth.toFixed(2)}%`;

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
}

function createRevenueByProductDoughnutChart(data) {
  const productRevenue = {};
  data.forEach((entry) => {
    if (productRevenue[entry.product_unique]) {
      productRevenue[entry.product_unique] += entry.product_revenue_total;
    } else {
      productRevenue[entry.product_unique] = entry.product_revenue_total;
    }
  });

  const totalRevenue = Object.values(productRevenue).reduce(
    (acc, curr) => acc + curr,
    0
  );

  const productsWithPercentage = Object.entries(productRevenue).map(
    ([product, revenue]) => ({
      product,
      revenue,
      percentage: ((revenue / totalRevenue) * 100).toFixed(2),
    })
  );

  const sortedProducts = productsWithPercentage.sort(
    (a, b) => b.revenue - a.revenue
  );

  const labels = sortedProducts.map(({ product }) => product);
  const revenueData = sortedProducts.map(({ revenue }) => revenue);
  const percentageData = sortedProducts.map(({ percentage }) => percentage);
  const backgroundColors = [
    "rgba(255, 99, 132, 1)",
    "rgba(54, 162, 235, 1)",
    "rgba(255, 206, 86, 1)",
    "rgba(75, 192, 192, 1)",
    "rgba(153, 102, 255, 1)",
    "rgba(255, 159, 64, 1)",
    "rgba(199, 199, 199, 1)",
  ];

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
        },
      ],
    },
    options: {
      plugins: {
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

function createRevenueBySalesDoughnutChart(data) {
  const productSales = {};
  data.forEach((entry) => {
    if (productSales[entry.product_unique]) {
      productSales[entry.product_unique] += entry.transaction_qty;
    } else {
      productSales[entry.product_unique] = entry.transaction_qty;
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
  const backgroundColors = [
    "rgba(255, 99, 132, 1)",
    "rgba(54, 162, 235, 1)",
    "rgba(255, 206, 86, 1)",
    "rgba(75, 192, 192, 1)",
    "rgba(153, 102, 255, 1)",
    "rgba(255, 159, 64, 1)",
    "rgba(199, 199, 199, 1)",
  ];

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
        },
      ],
    },
    options: {
      plugins: {
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

loadAndInitialize();
