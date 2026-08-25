const salesData = {
  "2026-06-27": {
    report_date: "2026-06-27",
    total_units_sold: 950,
    total_revenue: 612000,
    top_country: "Thailand",
    activation_success_rate: 88.5,
    units_trend: "-5% vs previous day",
    revenue_trend: "Revenue slightly down",
    activation_status: "Needs attention",
    trend_type: "negative",
    insight: "Thailand had the highest SIM demand on this date, but activation success needs attention."
  },
  "2026-06-28": {
    report_date: "2026-06-28",
    total_units_sold: 1120,
    total_revenue: 735000,
    top_country: "Singapore",
    activation_success_rate: 90.8,
    units_trend: "+8% vs previous day",
    revenue_trend: "Revenue improved",
    activation_status: "Stable operations",
    trend_type: "positive",
    insight: "Singapore sales improved with better activation performance and stronger revenue."
  },
  "2026-06-29": {
    report_date: "2026-06-29",
    total_units_sold: 1280,
    total_revenue: 845000,
    top_country: "UAE",
    activation_success_rate: 92.4,
    units_trend: "+12% vs previous day",
    revenue_trend: "Strong revenue day",
    activation_status: "Healthy operations",
    trend_type: "positive",
    insight: "UAE is leading sales for the selected report date. Activation performance is healthy."
  },
  "2026-06-30": {
    report_date: "2026-06-30",
    total_units_sold: 1400,
    total_revenue: 910000,
    top_country: "Saudi Arabia",
    activation_success_rate: 93.1,
    units_trend: "+9% vs previous day",
    revenue_trend: "Highest revenue in period",
    activation_status: "Very healthy operations",
    trend_type: "positive",
    insight: "Saudi Arabia showed strong growth with the highest revenue and healthy activation performance."
  }
};

module.exports = function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const { report_date } = req.query || {};

  if (!report_date || report_date === "all") {
    const dates = Object.keys(salesData);
    const summary = dates.map((date) => ({
      date,
      units: salesData[date].total_units_sold,
      revenue: salesData[date].total_revenue,
      topCountry: salesData[date].top_country
    }));

    return res.status(200).json({
      dates,
      summary,
      sales: salesData
    });
  }

  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!datePattern.test(report_date)) {
    return res.status(400).json({
      error: "Invalid date format. Use YYYY-MM-DD."
    });
  }

  const data = salesData[report_date];
  if (!data) {
    return res.status(404).json({
      error: "No sales data found for this report date"
    });
  }

  return res.status(200).json(data);
};
