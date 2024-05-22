function loadAndInitialize() {
  fetch("../data/data.json")
    .then((response) => response.json())
    .then((data) => {
      // window.data = data;
      window.data = data.filter((item) => item.product_category !== "");
      populateMonthFilter(data);
      populateCategoryFilter(data);
      loadMonthFilter();
      loadCategoryFilters();

      const selectedMonth = document.getElementById("monthFilter").value;
      updateDashboard(selectedMonth);
    })
    .catch((error) => console.error("Error fetching data:", error));
}

function populateMonthFilter(data) {
  const monthFilter = document.getElementById("monthFilter");
  monthFilter.innerHTML = '<option value="all">All Month</option>';

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

      saveCategoryFilters();
      updateDashboard(document.getElementById("monthFilter").value);
    });
  });

  document
    .getElementById("monthFilter")
    .addEventListener("change", function () {
      const selectedMonth = this.value;
      saveMonthFilter(selectedMonth);
      updateDashboard(selectedMonth);
    });
}

function saveMonthFilter(selectedMonth) {
  localStorage.setItem("selectedMonth", selectedMonth);
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

function loadMonthFilter() {
  const selectedMonth = localStorage.getItem("selectedMonth");
  if (selectedMonth) {
    document.getElementById("monthFilter").value = selectedMonth;
  }
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

function updateFilterInfoFromLocalStorage() {
  const selectedMonth = localStorage.getItem("selectedMonth") || "all";
  const selectedCategories =
    JSON.parse(localStorage.getItem("selectedCategories")) || [];

  updateFilterInfo(selectedMonth, selectedCategories);
}

function updateFilterInfo(selectedMonth, selectedCategories) {
  const filterInfo = document.getElementById("filterInfo");

  let monthText = selectedMonth === "all" ? "All Months" : selectedMonth;

  let categoriesText = "";
  if (selectedCategories.includes("all") || selectedCategories.length === 0) {
    categoriesText = "All Categories";
  } else {
    categoriesText = `<ul>${selectedCategories
      .map((product_category) => `<li>${product_category}</li>`)
      .join("")}</ul>`;
  }

  filterInfo.innerHTML = `<p>Month: ${monthText}</p>
                          <p>Categories: ${categoriesText}</p>`;
}

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
          ticks: {
            beginAtZero: true,
          },
          grid: {
            color: "#212121",
            lineWidth: 0.2,
          },
        },
        x: {
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
      },
    },
  });
}

function createRevenueAndSalesChart(data) {
  const groupedData = data.reduce((acc, curr) => {
    if (!acc[curr.month_year]) {
      acc[curr.month_year] = { revenue: 0, sales: 0 };
    }
    acc[curr.month_year].revenue += curr.revenue;
    acc[curr.month_year].sales += curr.transaction_qty;
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
          ticks: {
            beginAtZero: true,
          },
          grid: {
            color: "#212121",
            lineWidth: 0.2,
          },
        },
        x: {
          ticks: {
            beginAtZero: true,
          },
          grid: {
            color: "rgba(200, 200, 200,0)",
            lineWidth: 1,
          },
        },
      },
    },
  });
}

function createForecastChart(data) {
  const monthlyRevenue = data.reduce((acc, curr) => {
    acc[curr.month_S2] = curr.monthly_revenue;
    return acc;
  }, {});

  const forecastData = data.reduce((acc, curr) => {
    acc[curr.month_S2] = curr.Forecast;
    return acc;
  }, {});

  const labels = Object.keys(monthlyRevenue);
  const mergedData = labels.map((month) => {
    return {
      month: month,
      revenue: monthlyRevenue[month],
      forecast: forecastData[month] || 0,
    };
  });

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
          data: mergedData.map((item) => item.revenue),
          borderColor: "#5e3229",
          backgroundColor: "#5e3229",
          borderWidth: 1,
          fill: false,
        },
        {
          label: "Forecast",
          data: mergedData.map((item) => item.forecast),
          borderColor: "#CCFF00",
          backgroundColor: "#CCFF00",
          borderWidth: 1,
          fill: false,
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
            color: "#212121",
            lineWidth: 0.2,
          },
        },
        x: {
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

function createRevenueByMonthChart(data) {
  const groupedData = data.reduce((acc, curr) => {
    if (!acc[curr.month_name]) {
      acc[curr.month_name] = { revenue: 0, count: 0 };
    }
    acc[curr.month_name].revenue += curr.revenue;
    acc[curr.month_name].count++;
    return acc;
  }, {});

  const labels = Object.keys(groupedData);
  const revenueData = Object.values(groupedData).map((item) => item.revenue);
  const averageRevenueData = Object.values(groupedData).map((item) =>
    (item.revenue / item.count).toFixed(2)
  );

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
        },
        {
          label: "Average Revenue",
          data: averageRevenueData,
          backgroundColor: "rgb(54, 162, 235)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          ticks: {
            beginAtZero: true,
            z: 1,
          },
          grid: {
            color: "#212121",
            lineWidth: 0.2,
          },
        },
        x: {
          ticks: {
            beginAtZero: true,
            z: 1,
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

function createRevenueGrowthChart(data) {
  const groupedData = data.reduce((acc, curr) => {
    if (!acc[curr.month_year]) {
      acc[curr.month_year] = [];
    }
    acc[curr.month_year].push(curr.growth_rev);
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
          ticks: {
            beginAtZero: true,
          },
          grid: {
            color: "#212121",
            lineWidth: 0.2,
          },
        },
        x: {
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
        x: {
          ticks: {
            beginAtZero: true,
          },
          grid: {
            color: "#212121",
            lineWidth: 0.2,
          },
        },
        y: {
          grid: {
            display: false,
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
          ticks: {
            beginAtZero: true,
          },
          grid: {
            color: "rgba(200, 200, 200, 0.08)",
            lineWidth: 1,
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

function createSalesRevenueRelationChart(data) {
  const groupedData = data.reduce((acc, curr) => {
    const monthYear = `${curr.month_name} ${curr.year}`;
    if (!acc[monthYear]) {
      acc[monthYear] = {
        totalRevenue: 0,
        totalTransactions: 0,
        transactions: [],
      };
    }
    acc[monthYear].totalRevenue += curr.revenue;
    acc[monthYear].totalTransactions += curr.transaction_qty;
    acc[monthYear].transactions.push({
      date: curr.transaction_date,
      revenue: curr.revenue,
      transaction_qty: curr.transaction_qty,
    });
    return acc;
  }, {});

  const salesRevenueData = Object.entries(groupedData).map(
    ([monthYear, values]) => ({
      r: monthYear,
      y: values.totalTransactions,
      x: values.totalRevenue / 1000,
      transactions: values.transactions,
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
          backgroundColor: "rgba(255, 99, 132, 0.6)",
          borderColor: "rgba(255, 99, 132, 1)",
        },
      ],
    },
    options: {
      scales: {
        x: {
          title: {
            display: true,
            text: "Revenue",
          },
        },
        y: {
          title: {
            display: true,
            text: "Transaction Quantity",
          },
        },
      },
    },
    tooltips: {
      callbacks: {
        label: (tooltipItem, data) => {
          const dataset = data.datasets[tooltipItem.datasetIndex];
          const dataPoint = dataset.data[tooltipItem.index];
          const transactions = dataPoint.transactions.map(
            (transaction) =>
              `Date: ${transaction.date}, Revenue: ${transaction.revenue}, Total Sales: ${transaction.transaction_qty}`
          );
          return transactions.join("\n");
        },
      },
    },
  });
}

window.addEventListener("DOMContentLoaded", () => {
  updateFilterInfoFromLocalStorage();
  loadAndInitialize();
});
