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

function createRevenueVsQtyChart(data) {
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

  const groupedData = data.reduce(
    (acc, { transaction_date, transaction_qty, revenue }) => {
      const [month, day, year] = transaction_date.split("/");
      const formattedDate = `${day} ${monthNames[month - 1]}`;

      if (!acc[formattedDate]) {
        acc[formattedDate] = {
          label: formattedDate,
          transaction_qty: 0,
          revenue: 0,
        };
      }
      acc[formattedDate].transaction_qty += transaction_qty;
      acc[formattedDate].revenue += revenue;
      return acc;
    },
    {}
  );

  const labels = Object.keys(groupedData).sort((a, b) => {
    const [aDay, aMonth] = a.split(" ");
    const [bDay, bMonth] = b.split(" ");
    return (
      new Date(`2023 ${aMonth} ${aDay}`) - new Date(`2023 ${bMonth} ${bDay}`)
    );
  });

  const transactionQtyData = labels.map(
    (label) => groupedData[label].transaction_qty
  );
  const revenueData = labels.map((label) => groupedData[label].revenue);

  const ctx = document.getElementById("revenueVsQtyChart").getContext("2d");

  if (window.revenueVsQtyChart) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  window.revenueVsQtyChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Revenue",
          data: revenueData,
          borderColor: "#5e3229",
          backgroundColor: "#5e3229",
          borderWidth: 1.2,
          fill: false,
          yAxisID: "y",
          tension: 0.4,
          pointRadius: 0,
        },
        {
          label: "Total Sales",
          data: transactionQtyData,
          borderColor: "#90C114",
          backgroundColor: "#90C114",
          borderWidth: 1.2,
          fill: false,
          yAxisID: "y1",
          tension: 0.4,
          pointRadius: 0,
        },
      ],
    },
    options: {
      scales: {
        x: {
          title: {
            display: true,
            text: "Transaction Date",
            font: {
              weight: "bold",
            },
          },
        },

        y: {
          title: {
            display: true,
            text: "Revenue",
            font: { weight: "bold" },
          },
          position: "left",
          ticks: { stepSize: 200 },
        },
        y1: {
          title: {
            display: true,
            text: "Total Sales",
            font: { weight: "bold" },
          },
          position: "right",
          ticks: { stepSize: 200 },
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
