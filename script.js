const CHART_COLORS = {
  blue: "rgb(59, 130, 246)",
  green: "rgb(34, 197, 94)",
  purple: "rgb(168, 85, 247)",
  orange: "rgb(249, 115, 22)",
  red: "rgb(239, 68, 68)",
  cyan: "rgb(6, 182, 212)",
  pink: "rgb(236, 72, 153)",
};

const CHART_DEFAULTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: { color: "#e5e7eb" },
    },
  },
  scales: {
    x: {
      type: "time",
      time: { unit: "day" },
      ticks: { color: "#9ca3af" },
      grid: { color: "#374151" },
    },
    y: {
      ticks: { color: "#9ca3af" },
      grid: { color: "#374151" },
    },
  },
};

async function loadData() {
  const response = await fetch("public/data.json");
  return response.json();
}

function formatDate(dateStr) {
  return new Date(dateStr);
}

function createSleepScoreChart(dailySleep) {
  const ctx = document.getElementById("sleep-score-chart").getContext("2d");
  new Chart(ctx, {
    type: "line",
    data: {
      labels: dailySleep.map((d) => formatDate(d.day)),
      datasets: [
        {
          label: "Sleep Score",
          data: dailySleep.map((d) => d.score),
          borderColor: CHART_COLORS.blue,
          backgroundColor: CHART_COLORS.blue + "33",
          fill: true,
          tension: 0.3,
        },
      ],
    },
    options: {
      ...CHART_DEFAULTS,
      scales: {
        ...CHART_DEFAULTS.scales,
        y: { ...CHART_DEFAULTS.scales.y, min: 0, max: 100 },
      },
    },
  });
}

function createSleepStagesChart(sleep) {
  const ctx = document.getElementById("sleep-stages-chart").getContext("2d");

  // Convert seconds to hours
  const toHours = (seconds) => (seconds ? seconds / 3600 : 0);

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: sleep.map((d) => formatDate(d.day)),
      datasets: [
        {
          label: "Deep Sleep (hrs)",
          data: sleep.map((d) => toHours(d.deep_sleep_duration)),
          backgroundColor: CHART_COLORS.purple,
        },
        {
          label: "REM Sleep (hrs)",
          data: sleep.map((d) => toHours(d.rem_sleep_duration)),
          backgroundColor: CHART_COLORS.cyan,
        },
        {
          label: "Light Sleep (hrs)",
          data: sleep.map((d) => toHours(d.light_sleep_duration)),
          backgroundColor: CHART_COLORS.blue,
        },
      ],
    },
    options: {
      ...CHART_DEFAULTS,
      scales: {
        ...CHART_DEFAULTS.scales,
        x: { ...CHART_DEFAULTS.scales.x, stacked: true },
        y: { ...CHART_DEFAULTS.scales.y, stacked: true },
      },
    },
  });
}

function createReadinessChart(dailyReadiness) {
  const ctx = document.getElementById("readiness-chart").getContext("2d");
  new Chart(ctx, {
    type: "line",
    data: {
      labels: dailyReadiness.map((d) => formatDate(d.day)),
      datasets: [
        {
          label: "Readiness Score",
          data: dailyReadiness.map((d) => d.score),
          borderColor: CHART_COLORS.green,
          backgroundColor: CHART_COLORS.green + "33",
          fill: true,
          tension: 0.3,
        },
      ],
    },
    options: {
      ...CHART_DEFAULTS,
      scales: {
        ...CHART_DEFAULTS.scales,
        y: { ...CHART_DEFAULTS.scales.y, min: 0, max: 100 },
      },
    },
  });
}

function createReadinessContributorsChart(dailyReadiness) {
  const ctx = document
    .getElementById("readiness-contributors-chart")
    .getContext("2d");

  // Get latest entry with contributors
  const latest = dailyReadiness.filter((d) => d.contributors).slice(-7);

  new Chart(ctx, {
    type: "line",
    data: {
      labels: latest.map((d) => formatDate(d.day)),
      datasets: [
        {
          label: "HRV Balance",
          data: latest.map((d) => d.contributors?.hrv_balance),
          borderColor: CHART_COLORS.purple,
          tension: 0.3,
        },
        {
          label: "Resting HR",
          data: latest.map((d) => d.contributors?.resting_heart_rate),
          borderColor: CHART_COLORS.red,
          tension: 0.3,
        },
        {
          label: "Body Temperature",
          data: latest.map((d) => d.contributors?.body_temperature),
          borderColor: CHART_COLORS.orange,
          tension: 0.3,
        },
      ],
    },
    options: {
      ...CHART_DEFAULTS,
      scales: {
        ...CHART_DEFAULTS.scales,
        y: { ...CHART_DEFAULTS.scales.y, min: 0, max: 100 },
      },
    },
  });
}

function createActivityChart(dailyActivity) {
  const ctx = document.getElementById("activity-chart").getContext("2d");
  new Chart(ctx, {
    type: "line",
    data: {
      labels: dailyActivity.map((d) => formatDate(d.day)),
      datasets: [
        {
          label: "Activity Score",
          data: dailyActivity.map((d) => d.score),
          borderColor: CHART_COLORS.orange,
          backgroundColor: CHART_COLORS.orange + "33",
          fill: true,
          tension: 0.3,
        },
      ],
    },
    options: {
      ...CHART_DEFAULTS,
      scales: {
        ...CHART_DEFAULTS.scales,
        y: { ...CHART_DEFAULTS.scales.y, min: 0, max: 100 },
      },
    },
  });
}

function createStepsChart(dailyActivity) {
  const ctx = document.getElementById("steps-chart").getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: dailyActivity.map((d) => formatDate(d.day)),
      datasets: [
        {
          label: "Steps",
          data: dailyActivity.map((d) => d.steps),
          backgroundColor: CHART_COLORS.green,
        },
        {
          label: "Active Calories",
          data: dailyActivity.map((d) => d.active_calories),
          backgroundColor: CHART_COLORS.orange,
        },
      ],
    },
    options: CHART_DEFAULTS,
  });
}

async function init() {
  try {
    const data = await loadData();

    // Update last updated timestamp
    const lastUpdated = document.getElementById("last-updated");
    lastUpdated.textContent = `Last updated: ${new Date(data.lastUpdated).toLocaleString()}`;

    // Create charts if data exists
    if (data.dailySleep?.length) {
      createSleepScoreChart(data.dailySleep);
    }
    if (data.sleep?.length) {
      createSleepStagesChart(data.sleep);
    }
    if (data.dailyReadiness?.length) {
      createReadinessChart(data.dailyReadiness);
      createReadinessContributorsChart(data.dailyReadiness);
    }
    if (data.dailyActivity?.length) {
      createActivityChart(data.dailyActivity);
      createStepsChart(data.dailyActivity);
    }
  } catch (err) {
    console.error("Failed to load data:", err);
  }
}

init();
