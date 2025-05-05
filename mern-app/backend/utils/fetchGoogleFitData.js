const axios = require("axios");
const Big = require("big.js");

const fetchGoogleFitData = async (accessToken) => {
  const now = new Date();

  const dailyStartTime = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1)).getTime();
  const dailyEndTime = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)).getTime();

  const fetchData = async (start, end, dataType) => {
    const response = await axios.post(
      "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate",
      {
        aggregateBy: [{ dataTypeName: dataType }],
        bucketByTime: { durationMillis: 86400000 },
        startTimeMillis: start,
        endTimeMillis: end,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  };

  const stepsRes = await fetchData(dailyStartTime, dailyEndTime, "com.google.step_count.delta");
  const distanceRes = await fetchData(dailyStartTime, dailyEndTime, "com.google.distance.delta");
  const caloriesRes = await fetchData(dailyStartTime, dailyEndTime, "com.google.calories.expended");

  console.log("📅 Google Fit Raw Daily Buckets:");
  console.dir(stepsRes.bucket, { depth: null });

  // Build daily map
  const dailyMap = {};

  const processBuckets = (res, key, valueType) => {
    if (!res || !res.bucket) return;

    res.bucket.forEach((bucket) => {
      const dateStr = new Date(parseInt(bucket.startTimeMillis)).toISOString().split("T")[0];
      const value = bucket.dataset[0]?.point[0]?.value?.[0]?.[valueType] || 0;

      if (!dailyMap[dateStr]) {
        dailyMap[dateStr] = { date: dateStr, steps: 0, distance: 0, caloriesExpended: 0 };
      }
      dailyMap[dateStr][key] = new Big(dailyMap[dateStr][key]).plus(value).toNumber();
    });
  };

  processBuckets(stepsRes, "steps", "intVal");
  processBuckets(distanceRes, "distance", "fpVal");
  processBuckets(caloriesRes, "caloriesExpended", "fpVal");

  return Object.values(dailyMap); // returns [{ date, steps, distance, caloriesExpended }, ...]
};

module.exports = fetchGoogleFitData;
