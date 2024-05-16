fetch("../js/data.json")
  .then((response) => response.json())
  .then((data) => {
    const totalRevenue = Math.round(
      data.reduce((acc, curr) => acc + curr.revenue, 0) / 1000
    );
    const formattedTotalRevenue =
      totalRevenue >= 1000
        ? `$${(totalRevenue / 1000).toFixed(1)}k`
        : `$${totalRevenue}k`;
    document.getElementById("totalRevenue").textContent = formattedTotalRevenue;

    const totalTransaction = Math.round(
      data.reduce((acc, curr) => acc + curr.transaction_qty, 0) / 1000
    );
    const formattedTotalTransaction =
      totalTransaction >= 1000
        ? `${(totalTransaction / 1000).toFixed(1)}k`
        : `${totalTransaction}k`;
    document.getElementById("totalTransaction").textContent =
      formattedTotalTransaction;

    const salesAmount = Math.round(
      data.reduce((acc, curr) => acc + curr.revenue * curr.transaction_qty, 0) /
        1000
    );
    const formattedSalesAmount =
      salesAmount >= 1000
        ? `${(salesAmount / 1000).toFixed(1)}k`
        : `${salesAmount}k`;
    document.getElementById("salesAmount").textContent = formattedSalesAmount;

    const groupedData = data.reduce((acc, curr) => {
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

    Object.values(window).forEach((item) => {
      if (item instanceof Chart) {
        item.destroy();
      }
    });

    createProductSalesChart(data);
    createProductChart(data);
    createRevenueAndSalesChart(data);
    createForecastChart(data);
    createRevenueByMonthChart(data);
    createRevenueGrowthChart(data);
    createTopSellingProductsChart(data);
    createRevenueByProductChart(data);
    createRevenueByProductDoughnutChart(data);
  })
  .catch((error) => console.error("Error fetching data:", error));

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

  if (window.productSalesChart) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  window.productSalesChart = new Chart(ctx, {
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
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
        },
        {
          label: "Total Sales",
          data: salesData,
          backgroundColor: "rgba(54, 162, 235, 0.2)",
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

  // Hancurkan grafik yang sudah ada dengan membersihkan kanvas
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
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderWidth: 1,
          fill: false,
        },
        {
          label: "Forecast",
          data: mergedData.map((item) => item.forecast),
          borderColor: "rgba(255, 99, 132, 1)",
          backgroundColor: "rgba(255, 99, 132, 0.2)",
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
            color: "rgba(200, 200, 200, 0.08)",
            lineWidth: 1,
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

  // Hancurkan grafik yang sudah ada dengan membersihkan kanvas
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
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
        },
        {
          label: "Average Revenue",
          data: averageRevenueData,
          backgroundColor: "rgba(54, 162, 235, 0.2)",
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

  // Hancurkan grafik yang sudah ada dengan membersihkan kanvas
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
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
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
            color: "rgba(200, 200, 200, 0.08)",
            lineWidth: 1,
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
          label: "Total Sales",
          data: dataValues,
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      indexAxis: "y",
    },
  });
}

function createRevenueByProductChart(data) {
  const productRevenue = {};
  data.forEach((entry) => {
    if (productRevenue[entry.product_unique]) {
      productRevenue[entry.product_unique] += entry.product_revenue_total;
    } else {
      productRevenue[entry.product_unique] = entry.product_revenue_total;
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
          label: "Total Revenue",
          data: dataValues,
          backgroundColor: "rgba(255, 159, 64, 0.2)",
          borderColor: "rgba(255, 159, 64, 1)",
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
  ];
  const borderColors = [
    "rgba(255, 99, 132, 1)",
    "rgba(54, 162, 235, 1)",
    "rgba(255, 206, 86, 1)",
    "rgba(75, 192, 192, 1)",
    "rgba(153, 102, 255, 1)",
  ];

  var ctx = document
    .getElementById("revenueByProductDoughnutChart")
    .getContext("2d");
  if (window.revenueByProductDoughnutChart) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  window.revenueByProductDoughnutChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Revenue",
          data: revenueData,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1,
        },
        {
          label: "Percentage",
          data: percentageData,
        },
      ],
    },
    options: {
      responsive: true,
      legend: {
        position: "left",
      },
      tooltips: {
        callbacks: {
          label: function (tooltipItem, data) {
            const datasetLabel =
              data.datasets[tooltipItem.datasetIndex].label || "";
            const value =
              data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
            const label = data.labels[tooltipItem.index];
            return `${datasetLabel}: $${value}%`;
          },
        },
      },
    },
  });
}
