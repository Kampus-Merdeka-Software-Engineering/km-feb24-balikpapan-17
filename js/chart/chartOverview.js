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
  const datasets = Object.values(groupedData);

  const ctx = document.getElementById("revenueAndSalesChart").getContext("2d");
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
          data: datasets.map((item) => item.revenue),
          backgroundColor: "#5e3229",
          borderWidth: 1,
        },
        {
          label: "Total Sales",
          data: datasets.map((item) => item.sales),
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
  const productSales = data.reduce((acc, curr) => {
    acc[curr.product_category] =
      (acc[curr.product_category] || 0) + curr.transaction_qty;
    return acc;
  }, {});

  const labels = Object.keys(productSales);
  const dataValues = Object.values(productSales);

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
