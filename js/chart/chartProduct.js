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
  const backgroundColors = labels.map((label) => getColor(label));

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
          backgroundColor: backgroundColors,
          borderColor: backgroundColors,
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
  const backgroundColors = labels.map((label) => getColor(label));

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
          backgroundColor: backgroundColors,
          borderColor: backgroundColors,
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
