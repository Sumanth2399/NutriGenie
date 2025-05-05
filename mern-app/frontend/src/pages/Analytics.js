import React, { useEffect, useState, useContext } from "react";
import { eachDayOfInterval, format } from "date-fns";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
} from "recharts";
import API from "../api";
import "../styles/analytics.css";
import { AuthContext } from "../context/authContext";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

const Analytics = () => {
  const { user } = useContext(AuthContext);
  const [dailyCalories, setDailyCalories] = useState([]);
  const [mealTypeDist, setMealTypeDist] = useState([]);
  const [topMeals, setTopMeals] = useState([]);
  const [dailyActivity, setDailyActivity] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState([]);
  const [calorieComparison, setCalorieComparison] = useState([]);

  useEffect(() => {
    if (!user) return;

    const fetchAnalytics = async () => {
      try {
        const [
          caloriesRes,
          mealTypeRes,
          topMealsRes,
          activityRes,
          monthlyRes,
          comparisonRes,
        ] = await Promise.all([
          API.get("/api/analytics/daily-calories"),
          API.get("/api/analytics/meal-type-distribution"),
          API.get("/api/analytics/top-meals"),
          API.get("/api/analytics/daily-activity"),
          API.get("/api/analytics/monthly-summary"),
          API.get("/api/analytics/calories-comparison"),
        ]);
 

        const start = new Date("2025-04-01");
const end = new Date("2025-04-30");

// 1. Create all dates with 0s
const allDates = eachDayOfInterval({ start, end }).map(date => ({
  date: format(date, "yyyy-MM-dd"),
  caloriesConsumed: 0,
  caloriesBurned: 0,
}));

// 2. Merge caloriesConsumed from backend
const caloriesConsumedData = comparisonRes.data; // From your API

const mergedComparison = allDates.map(day => {
  const found = caloriesConsumedData.find(item => item.date === day.date);
  return found ? { ...day, caloriesConsumed: found.caloriesConsumed || 0 } : day;
});

// 3. Merge caloriesBurned from activity data
const activityObj = activityRes.data; // { date: { steps, distance, caloriesExpended } }

// Make an array for BarChart (Daily Activity)
const activityArray = Object.entries(activityObj).map(([date, values]) => ({
  date,
  ...values,
}));

const finalComparison = mergedComparison.map(day => {
  const activityDay = activityObj[day.date];
  return activityDay
    ? { ...day, caloriesBurned: activityDay.caloriesExpended || 0 }
    : day;
});

setCalorieComparison(finalComparison);

setDailyCalories(caloriesRes.data);
setMealTypeDist(mealTypeRes.data);
setTopMeals(topMealsRes.data);

// ✅ This will now work because activityArray is defined
setDailyActivity(activityArray);

setMonthlySummary(monthlyRes.data);

      } catch (err) {
        console.error("Error fetching analytics:", err);
      }
    };

    fetchAnalytics();
  }, [user]);

  return (
    <div className="analytics-container">
      <h2 className="analytics-heading">Analytics Dashboard</h2>

      <div className="analytics-section">
        <h3>Daily Calories</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dailyCalories}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="calories" // ✅ fixed from totalCalories
              stroke="#8884d8"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="analytics-section">
        <h3>Meal Type Distribution</h3>
        {mealTypeDist.length > 0 ? (
  <ResponsiveContainer width="100%" height={300}>
    <PieChart>
      <Pie
        data={mealTypeDist}
        dataKey="count"
        nameKey="_id"
        cx="50%"
        cy="50%"
        outerRadius={100}
        label
      >
        {mealTypeDist.map((entry, index) => (
          <Cell
            key={`cell-${index}`}
            fill={COLORS[index % COLORS.length]}
          />
        ))}
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
  </ResponsiveContainer>
) : (
  <p>No data found for this month.</p>
)}

      </div>

      <div className="analytics-section">
        <h3>Top Meals by Calories</h3>
        <ul className="top-meals-list">
          {topMeals.map((meal, idx) => (
            <li key={idx}>
              <strong>{meal.food}</strong>:{" "}
              {meal.totalCalories.toFixed(2)} kcal
            </li>
          ))}
        </ul>
      </div>

      <div className="analytics-section">
        <h3>Daily Activity (Steps)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dailyActivity}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="steps" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="analytics-section">
        <h3>Monthly Summary</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlySummary}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="caloriesConsumed"
              stroke="#ff7300"
              name="Calories Consumed"
            />
            <Line
              type="monotone"
              dataKey="caloriesBurned"
              stroke="#387908"
              name="Calories Burned"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="analytics-section">
        <h3>Calories In vs Calories Out</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={calorieComparison}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="caloriesConsumed" fill="#8884d8" name="Consumed" />
            <Bar dataKey="caloriesBurned" fill="#82ca9d" name="Burned" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Analytics;
