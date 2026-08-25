console.log("International SIM Sales Dashboard connected");

// Fallback data in case of offline/direct file access
const fallbackSalesData = {
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

let cachedTrends = {};

function formatCurrency(amount) {
  if (typeof amount !== "number" || isNaN(amount)) return "₹0";
  return "\u20b9" + amount.toLocaleString("en-IN");
}

function setTrendClass(elementId, trendType) {
  const element = document.getElementById(elementId);
  if (!element) return;

  element.classList.remove("positive", "negative", "neutral");

  if (trendType === "positive") {
    element.classList.add("positive");
  } else if (trendType === "negative") {
    element.classList.add("negative");
  } else {
    element.classList.add("neutral");
  }
}

function renderTrendBars(selectedDate, trendsData) {
  const dates = Object.keys(trendsData);
  if (dates.length === 0) return;

  const maxUnits = Math.max(...dates.map(function (d) {
    return trendsData[d].total_units_sold || trendsData[d].totalUnits || trendsData[d].units || 1;
  }), 1400);

  dates.forEach(function (date) {
    const bar = document.getElementById("bar-" + date);
    if (!bar) return;

    const units = trendsData[date].total_units_sold || trendsData[date].totalUnits || trendsData[date].units || 0;
    const widthPercentage = Math.round((units / maxUnits) * 100);

    bar.style.width = widthPercentage + "%";

    if (date === selectedDate) {
      bar.classList.add("active");
    } else {
      bar.classList.remove("active");
    }
  });
}

function applyDataToDOM(data, reportDate) {
  const units = data.total_units_sold !== undefined ? data.total_units_sold : data.totalUnits;
  const revenue = data.total_revenue !== undefined ? data.total_revenue : data.totalRevenue;
  const country = data.top_country || data.topCountry || "-";
  const rate = data.activation_success_rate !== undefined ? data.activation_success_rate : data.activationRate;
  const unitsTrend = data.units_trend || data.unitsTrend || "";
  const revenueTrend = data.revenue_trend || data.revenueTrend || "";
  const activationStatus = data.activation_status || data.activationStatus || "";
  const insight = data.insight || "";
  const trendType = data.trend_type || data.trendType || "neutral";

  const totalUnitsEl = document.getElementById("totalUnits");
  const totalRevenueEl = document.getElementById("totalRevenue");
  const topCountryEl = document.getElementById("topCountry");
  const activationRateEl = document.getElementById("activationRate");
  const unitsTrendEl = document.getElementById("unitsTrend");
  const revenueTrendEl = document.getElementById("revenueTrend");
  const activationStatusEl = document.getElementById("activationStatus");
  const insightTextEl = document.getElementById("insightText");

  if (totalUnitsEl) totalUnitsEl.textContent = (units !== undefined ? units.toLocaleString() : "0");
  if (totalRevenueEl) totalRevenueEl.textContent = formatCurrency(revenue);
  if (topCountryEl) topCountryEl.textContent = country;
  if (activationRateEl) activationRateEl.textContent = (rate !== undefined ? rate + "%" : "0%");

  if (unitsTrendEl) unitsTrendEl.textContent = unitsTrend;
  if (revenueTrendEl) revenueTrendEl.textContent = revenueTrend;
  if (activationStatusEl) activationStatusEl.textContent = activationStatus;
  if (insightTextEl) insightTextEl.textContent = insight;

  setTrendClass("unitsTrend", trendType);
  setTrendClass("revenueTrend", trendType);

  if (rate >= 90) {
    setTrendClass("activationStatus", "positive");
  } else {
    setTrendClass("activationStatus", "negative");
  }

  renderTrendBars(reportDate, cachedTrends);
}

async function fetchTrendsOverview() {
  try {
    const response = await fetch("/api/sales");
    if (response.ok) {
      const data = await response.json();
      if (data.sales) {
        cachedTrends = data.sales;
        return;
      }
    }
  } catch (err) {
    console.warn("Could not fetch trends overview from API, using fallback data:", err);
  }
  cachedTrends = fallbackSalesData;
}

async function updateDashboard(reportDate) {
  const insightTextEl = document.getElementById("insightText");

  try {
    const apiUrl = "/api/sales?report_date=" + encodeURIComponent(reportDate);
    const response = await fetch(apiUrl);

    if (response.ok) {
      const data = await response.json();
      applyDataToDOM(data, reportDate);
      return;
    }

    const errorData = await response.json().catch(function () { return {}; });
    console.warn("API responded with error:", errorData);
  } catch (error) {
    console.warn("Fetch error, switching to cached/fallback data:", error);
  }

  // Graceful fallback if offline or backend is starting
  if (fallbackSalesData[reportDate]) {
    applyDataToDOM(fallbackSalesData[reportDate], reportDate);
  } else if (insightTextEl) {
    insightTextEl.textContent = "Unable to load sales data for selected date.";
  }
}

// Attach event listeners
const reportDateSelect = document.getElementById("reportDate");

if (reportDateSelect) {
  reportDateSelect.addEventListener("change", function () {
    const selectedDate = reportDateSelect.value;
    updateDashboard(selectedDate);
  });
}

// Make trend bar rows clickable to select date
document.querySelectorAll(".bar-row").forEach(function (row) {
  const dateSpan = row.querySelector("span");
  if (dateSpan) {
    const dateStr = dateSpan.textContent.trim();
    row.style.cursor = "pointer";
    row.setAttribute("title", "Click to view " + dateStr + " metrics");
    row.addEventListener("click", function () {
      if (reportDateSelect && reportDateSelect.value !== dateStr) {
        reportDateSelect.value = dateStr;
        updateDashboard(dateStr);
      }
    });
  }
});

// Initialize dashboard
async function init() {
  await fetchTrendsOverview();
  const initialDate = reportDateSelect ? reportDateSelect.value : "2026-06-27";
  await updateDashboard(initialDate);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
