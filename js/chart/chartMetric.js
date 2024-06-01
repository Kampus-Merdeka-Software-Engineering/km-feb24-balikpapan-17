// chartMetric.js
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
    return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : `${value}`;
  }

  let totalRevenue = 0;
  let totalTransaction = 0;
  let salesAmount = 0;

  filteredData.forEach((item) => {
    totalRevenue += item.revenue;
    totalTransaction += item.transaction_qty;
    salesAmount += item.revenue * item.transaction_qty;
  });

  document.getElementById("totalRevenue").textContent =
    formatValue(totalRevenue);
  document.getElementById("totalTransaction").textContent =
    formatValue(totalTransaction);
  document.getElementById("salesAmount").textContent = formatValue(salesAmount);

  const monthsCount = new Set(filteredData.map((item) => item.month_name)).size;
  const totalMonthlyGrowth = filteredData.reduce(
    (acc, curr) => acc + curr.growth_rev,
    0
  );
  const averageMonthlyGrowth = (
    totalMonthlyGrowth /
    monthsCount /
    10000
  ).toFixed(2);
  document.getElementById(
    "averageRevenueGrowth"
  ).textContent = `${averageMonthlyGrowth}%`;
}

function updateTopSellingProductsList(data) {
  const productSalesPerMonth = {};

  data.forEach((entry) => {
    const month = entry.month_name;
    const category = entry.product_category;
    const sales = entry.transaction_qty;

    if (!productSalesPerMonth[category]) {
      productSalesPerMonth[category] = 0;
    }
    productSalesPerMonth[category] += sales;
  });

  const sortedCategoriesOverall = Object.entries(productSalesPerMonth)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const totalTransactionsInRange = sortedCategoriesOverall.reduce(
    (acc, curr) => acc + curr[1],
    0
  );

  let timeFrame = `${localStorage.getItem("selectedStartMonth") || "Jan"} - ${
    localStorage.getItem("selectedEndMonth") || "Jun"
  }`;

  let listHTML = `
      <div class="chart-container-header">
        <h2>Top 5 Products</h2>
        <span>${timeFrame}</span>
      </div>
      <div class="acquisitions-bar">
    `;

  sortedCategoriesOverall.forEach((category, index) => {
    const totalSales = category[1];
    const percentage = ((totalSales / totalTransactionsInRange) * 100).toFixed(
      2
    );
    const progressClass = [
      "applications",
      "shortlisted",
      "on-hold",
      "rejected",
      "fivt",
    ][index];

    listHTML += `
        <span class="bar-progress ${progressClass}" style="width: ${percentage}%"></span>
      `;
  });

  listHTML += `</div>`;

  sortedCategoriesOverall.forEach((category, index) => {
    const totalSales = category[1];
    const progressClass = [
      "applications",
      "shortlisted",
      "on-hold",
      "rejected",
      "fivt",
    ][index];

    listHTML += `
        <div class="progress-bar-info ${progressClass}">
          <span class="progress-color ${progressClass}"></span>
          <span class="progress-type">${category[0]}</span>
          <span class="progress-amount">${totalSales} units</span>
        </div>
      `;
  });

  document.getElementById("chartContainer").innerHTML = listHTML;
}
