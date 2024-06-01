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
