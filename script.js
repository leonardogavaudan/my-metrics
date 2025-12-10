const CHART_COLORS = {
  blue: "rgb(59, 130, 246)",
  blueAlpha: "rgba(59, 130, 246, 0.1)",
  green: "rgb(34, 197, 94)",
  greenAlpha: "rgba(34, 197, 94, 0.1)",
  purple: "rgb(168, 85, 247)",
  purpleAlpha: "rgba(168, 85, 247, 0.5)",
  orange: "rgb(249, 115, 22)",
  orangeAlpha: "rgba(249, 115, 22, 0.1)",
  cyan: "rgb(6, 182, 212)",
  cyanAlpha: "rgba(6, 182, 212, 0.5)",
  red: "rgb(239, 68, 68)",
  pink: "rgb(236, 72, 153)",
  lightBlue: "rgba(59, 130, 246, 0.4)",
};

Chart.defaults.color = "#8e8e93";
Chart.defaults.borderColor = "#2a2a3a";
Chart.defaults.font.family = "'Inter', sans-serif";

const CHART_DEFAULTS = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: "index",
    intersect: false,
  },
  plugins: {
    legend: {
      display: true,
      position: "top",
      align: "end",
      labels: {
        boxWidth: 8,
        boxHeight: 8,
        usePointStyle: true,
        padding: 16,
        font: { size: 11 },
      },
    },
    tooltip: {
      backgroundColor: "#1a1a24",
      borderColor: "#2a2a3a",
      borderWidth: 1,
      padding: 12,
      titleFont: { size: 12, weight: "600" },
      bodyFont: { size: 11 },
      cornerRadius: 8,
    },
  },
  scales: {
    x: {
      type: "time",
      time: { unit: "day", displayFormats: { day: "MMM d" } },
      grid: { display: false },
      ticks: { font: { size: 10 }, maxRotation: 0 },
    },
    y: {
      grid: { color: "#1f1f2a" },
      ticks: { font: { size: 10 } },
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

function formatNumber(num) {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "k";
  }
  return num?.toString() || "--";
}

function updateStatCards(data) {
  // Get most recent values
  const latestSleep = data.dailySleep?.[data.dailySleep.length - 1];
  const latestReadiness = data.dailyReadiness?.[data.dailyReadiness.length - 1];
  const latestActivity = data.dailyActivity?.[data.dailyActivity.length - 1];

  document.getElementById("sleep-score").textContent = latestSleep?.score || "--";
  document.getElementById("readiness-score").textContent = latestReadiness?.score || "--";
  document.getElementById("activity-score").textContent = latestActivity?.score || "--";
  document.getElementById("steps-value").textContent = formatNumber(latestActivity?.steps);
}

function createSleepScoreChart(dailySleep) {
  const ctx = document.getElementById("sleep-score-chart").getContext("2d");

  const gradient = ctx.createLinearGradient(0, 0, 0, 280);
  gradient.addColorStop(0, CHART_COLORS.blueAlpha);
  gradient.addColorStop(1, "transparent");

  new Chart(ctx, {
    type: "line",
    data: {
      labels: dailySleep.map((d) => formatDate(d.day)),
      datasets: [
        {
          label: "Score",
          data: dailySleep.map((d) => d.score),
          borderColor: CHART_COLORS.blue,
          backgroundColor: gradient,
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHoverBackgroundColor: CHART_COLORS.blue,
        },
      ],
    },
    options: {
      ...CHART_DEFAULTS,
      scales: {
        ...CHART_DEFAULTS.scales,
        y: { ...CHART_DEFAULTS.scales.y, min: 40, max: 100 },
      },
    },
  });
}

function createSleepStagesChart(sleep) {
  const ctx = document.getElementById("sleep-stages-chart").getContext("2d");

  const toHours = (seconds) => (seconds ? +(seconds / 3600).toFixed(1) : 0);

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: sleep.map((d) => formatDate(d.day)),
      datasets: [
        {
          label: "Deep",
          data: sleep.map((d) => toHours(d.deep_sleep_duration)),
          backgroundColor: CHART_COLORS.purple,
          borderRadius: 2,
        },
        {
          label: "REM",
          data: sleep.map((d) => toHours(d.rem_sleep_duration)),
          backgroundColor: CHART_COLORS.cyan,
          borderRadius: 2,
        },
        {
          label: "Light",
          data: sleep.map((d) => toHours(d.light_sleep_duration)),
          backgroundColor: CHART_COLORS.lightBlue,
          borderRadius: 2,
        },
      ],
    },
    options: {
      ...CHART_DEFAULTS,
      scales: {
        ...CHART_DEFAULTS.scales,
        x: { ...CHART_DEFAULTS.scales.x, stacked: true },
        y: {
          ...CHART_DEFAULTS.scales.y,
          stacked: true,
          title: { display: true, text: "Hours", font: { size: 10 } }
        },
      },
    },
  });
}

function createReadinessChart(dailyReadiness) {
  const ctx = document.getElementById("readiness-chart").getContext("2d");

  const gradient = ctx.createLinearGradient(0, 0, 0, 280);
  gradient.addColorStop(0, CHART_COLORS.greenAlpha);
  gradient.addColorStop(1, "transparent");

  new Chart(ctx, {
    type: "line",
    data: {
      labels: dailyReadiness.map((d) => formatDate(d.day)),
      datasets: [
        {
          label: "Score",
          data: dailyReadiness.map((d) => d.score),
          borderColor: CHART_COLORS.green,
          backgroundColor: gradient,
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHoverBackgroundColor: CHART_COLORS.green,
        },
      ],
    },
    options: {
      ...CHART_DEFAULTS,
      scales: {
        ...CHART_DEFAULTS.scales,
        y: { ...CHART_DEFAULTS.scales.y, min: 40, max: 100 },
      },
    },
  });
}

function createReadinessContributorsChart(dailyReadiness) {
  const ctx = document.getElementById("readiness-contributors-chart").getContext("2d");

  const dataWithContributors = dailyReadiness.filter((d) => d.contributors);

  new Chart(ctx, {
    type: "line",
    data: {
      labels: dataWithContributors.map((d) => formatDate(d.day)),
      datasets: [
        {
          label: "HRV",
          data: dataWithContributors.map((d) => d.contributors?.hrv_balance),
          borderColor: CHART_COLORS.purple,
          backgroundColor: CHART_COLORS.purple,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4,
        },
        {
          label: "Resting HR",
          data: dataWithContributors.map((d) => d.contributors?.resting_heart_rate),
          borderColor: CHART_COLORS.red,
          backgroundColor: CHART_COLORS.red,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4,
        },
        {
          label: "Temperature",
          data: dataWithContributors.map((d) => d.contributors?.body_temperature),
          borderColor: CHART_COLORS.orange,
          backgroundColor: CHART_COLORS.orange,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4,
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

  const gradient = ctx.createLinearGradient(0, 0, 0, 280);
  gradient.addColorStop(0, CHART_COLORS.orangeAlpha);
  gradient.addColorStop(1, "transparent");

  new Chart(ctx, {
    type: "line",
    data: {
      labels: dailyActivity.map((d) => formatDate(d.day)),
      datasets: [
        {
          label: "Score",
          data: dailyActivity.map((d) => d.score),
          borderColor: CHART_COLORS.orange,
          backgroundColor: gradient,
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHoverBackgroundColor: CHART_COLORS.orange,
        },
      ],
    },
    options: {
      ...CHART_DEFAULTS,
      scales: {
        ...CHART_DEFAULTS.scales,
        y: { ...CHART_DEFAULTS.scales.y, min: 40, max: 100 },
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
          borderRadius: 4,
          yAxisID: "y",
        },
        {
          label: "Calories",
          data: dailyActivity.map((d) => d.total_calories),
          backgroundColor: CHART_COLORS.orange,
          borderRadius: 4,
          yAxisID: "y1",
        },
      ],
    },
    options: {
      ...CHART_DEFAULTS,
      scales: {
        ...CHART_DEFAULTS.scales,
        y: {
          ...CHART_DEFAULTS.scales.y,
          position: "left",
          title: { display: true, text: "Steps", font: { size: 10 } },
        },
        y1: {
          ...CHART_DEFAULTS.scales.y,
          position: "right",
          grid: { display: false },
          title: { display: true, text: "Calories", font: { size: 10 } },
        },
      },
    },
  });
}

async function init() {
  try {
    const data = await loadData();

    // Update last updated timestamp
    const lastUpdated = document.getElementById("last-updated");
    const date = new Date(data.lastUpdated);
    lastUpdated.textContent = `Updated ${date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}`;

    // Update stat cards
    updateStatCards(data);

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
