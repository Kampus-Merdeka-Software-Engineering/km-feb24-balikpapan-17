// worker.js

self.onmessage = function (e) {
  const message = e.data;
  switch (message.type) {
    case "processDataAndCharts":
      const processedData = processDataAndCharts(message.payload);

      self.postMessage({ type: "processedData", payload: processedData });
      break;

    default:
      console.error("Invalid message type from main thread");
      break;
  }
};

function processDataAndCharts(data) {
  const selectedStartMonth = document.getElementById("startMonthFilter").value;
  const selectedEndMonth = document.getElementById("endMonthFilter").value;
  const selectedCategories = Array.from(
    document.querySelectorAll(".categoryFilter:checked")
  ).map((cb) => cb.value);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const startIndex = months.indexOf(selectedStartMonth);
  const endIndex = months.indexOf(selectedEndMonth);
  const filteredByMonth = data.filter((item) => {
    const itemMonthIndex = months.indexOf(item.month_name);
    return itemMonthIndex >= startIndex && itemMonthIndex <= endIndex;
  });

  const filteredByCategory = selectedCategories.includes("all")
    ? filteredByMonth
    : filteredByMonth.filter((item) =>
        selectedCategories.includes(item.product_category)
      );

  const revenueAndSalesChartData =
    createRevenueAndSalesChart(filteredByCategory);
  const forecastChartData = createForecastChart(filteredByCategory);
  const productSalesChartData = createProductSalesChart(filteredByCategory);
  const topSellingProductsChartData =
    createTopSellingProductsChart(filteredByCategory);
  const productChartData = createProductChart(filteredByCategory);
  const revenueByProductDoughnutChartData =
    createRevenueByProductDoughnutChart(filteredByCategory);
  const revenueBySalesDoughnutChartData =
    createRevenueBySalesDoughnutChart(filteredByCategory);
  const revenueByProductChartData =
    createRevenueByProductChart(filteredByCategory);
  const revenueByMonthChartData = createRevenueByMonthChart(filteredByCategory);
  const salesRevenueRelationChartData =
    createSalesRevenueRelationChart(filteredByCategory);
  const revenueGrowthChartData = createRevenueGrowthChart(filteredByCategory);

  return {
    revenueAndSalesChartData,
    forecastChartData,
    productSalesChartData,
    topSellingProductsChartData,
    productChartData,
    revenueByProductDoughnutChartData,
    revenueBySalesDoughnutChartData,
    revenueByProductChartData,
    revenueByMonthChartData,
    salesRevenueRelationChartData,
    revenueGrowthChartData,
  };
}

self.onmessage = function (e) {
  const data = e.data;

  if (data && data.type === "processDataAndCharts" && data.payload) {
    const processedData = processDataAndCharts(data.payload);

    self.postMessage({ type: "processedData", payload: processedData });
  }
};
