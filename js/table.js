document.addEventListener("DOMContentLoaded", function () {
  $.ajax({
    url: "../data/data.json",
    dataType: "json",
    success: function (data) {
      var table = $("#transactionTable").DataTable({
        scrollX: true,
        responsive: true,
        pageLength: 25,
      });

      data.forEach(function (item) {
        if (!isIgnoredDate(item.date)) {
          table.row.add([
            item.date,
            item.transaction_time,
            item.product_id,
            item.product_category,
            item.transaction_qty,
            item.unit_price,
          ]);
        }
      });

      table.draw();
    },
    error: function (xhr, status, error) {
      console.error("Failed to load data:", error);
    },
  });
});

function isIgnoredDate(date) {
  var ignoredDates = [
    "7/1/2023",
    "7/2/2023",
    "7/3/2023",
    "8/1/2023",
    "8/2/2023",
    "8/3/2023",
    "9/1/2023",
    "9/2/2023",
    "9/3/2023",
    "10/1/2023",
    "10/2/2023",
    "10/3/2023",
    "11/1/2023",
    "11/2/2023",
    "11/3/2023",
    "12/1/2023",
    "12/2/2023",
    "12/3/2023",
  ];
  return ignoredDates.includes(date);
}
