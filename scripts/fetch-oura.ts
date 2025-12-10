import { writeFileSync } from "fs";

const OURA_TOKEN = process.env.OURA_TOKEN;

if (!OURA_TOKEN) {
  console.error("OURA_TOKEN environment variable is required");
  process.exit(1);
}

const BASE_URL = "https://api.ouraring.com/v2/usercollection";

// Fetch last 30 days of data
const endDate = new Date().toISOString().split("T")[0];
const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  .toISOString()
  .split("T")[0];

async function fetchOuraEndpoint(endpoint: string) {
  const url = `${BASE_URL}/${endpoint}?start_date=${startDate}&end_date=${endDate}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${OURA_TOKEN}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${endpoint}: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data || [];
}

async function main() {
  console.log(`Fetching Oura data from ${startDate} to ${endDate}...`);

  const [dailySleep, sleep, dailyReadiness, dailyActivity] = await Promise.all([
    fetchOuraEndpoint("daily_sleep"),
    fetchOuraEndpoint("sleep"),
    fetchOuraEndpoint("daily_readiness"),
    fetchOuraEndpoint("daily_activity"),
  ]);

  const data = {
    lastUpdated: new Date().toISOString(),
    dateRange: { start: startDate, end: endDate },
    dailySleep,
    sleep, // Detailed sleep data with stages
    dailyReadiness,
    dailyActivity,
  };

  writeFileSync("public/data.json", JSON.stringify(data, null, 2));
  console.log("Data written to public/data.json");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
