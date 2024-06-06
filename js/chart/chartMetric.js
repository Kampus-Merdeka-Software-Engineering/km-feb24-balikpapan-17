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
      productSalesPerMonth[month][category] =
        (productSalesPerMonth[month][category] || 0) + entry.transaction_qty;
    }
  });

  const topProductsOverall = Object.values(productSalesPerMonth).reduce(
    (acc, monthData) => {
      for (const [category, qty] of Object.entries(monthData)) {
        acc[category] = (acc[category] || 0) + qty;
      }
      return acc;
    },
    {}
  );

  const totalTransactionsInRange = Object.values(topProductsOverall).reduce(
    (sum, qty) => sum + qty,
    0
  );
  const sortedCategoriesOverall = Object.entries(topProductsOverall)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const timeFrame =
    selectedStartMonth === selectedEndMonth
      ? selectedStartMonth
      : `${selectedStartMonth} - ${selectedEndMonth}`;

  let listHTML = `
    <div class="chart-container-header">
      <h2>Top 5 Product</h2>
      <span>${timeFrame}</span>
    </div>
    <div class="acquisitions-bar">`;

  sortedCategoriesOverall.forEach(([category, totalSales]) => {
    const percentage = ((totalSales / totalTransactionsInRange) * 100).toFixed(
      2
    );
    listHTML += `<span class="bar-progress" style="width: ${percentage}%; background-color: ${getColor(
      category
    )};"></span>`;
  });

  listHTML += `</div>`;

  sortedCategoriesOverall.forEach(([category, totalSales], index) => {
    const progressClass =
      ["applications", "shortlisted", "on-hold", "rejected", "fivt"][index] ||
      "";
    listHTML += `<div class="progress-bar-info ${progressClass}">
      <span class="progress-color ${progressClass}" style="background-color: ${getColor(
      category
    )};"></span>
      <span class="progress-type">${category}</span>
      <span class="progress-amount">${totalSales} units</span>
    </div>`;
  });

  document.getElementById("chartContainer").innerHTML = listHTML;
}
