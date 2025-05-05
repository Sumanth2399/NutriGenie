import React, { useState, useEffect, useContext, useCallback } from "react";
import { Outlet, useLocation } from "react-router-dom";
import API from "../api";
import { AuthContext } from "../context/authContext";
import CalendarView from "../components/CalendarView";
import Navbar from "../components/Navbar";
import "../styles/dashboard.css";

const Dashboard = () => {
  const { user, token } = useContext(AuthContext);
  const [dailyData, setDailyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  const fetchFitnessData = useCallback(async () => {
    try {
      console.log("📡 Fetching Daily Fitness Data...");
      const dailyRes = await API.get("/api/fitness/daily");
      setDailyData(dailyRes.data);

      console.log("📡 Fetching Monthly Fitness Data...");
      const monthlyRes = await API.get("/api/fitness/monthly");
      setMonthlyData(monthlyRes.data);
    } catch (err) {
      console.error("🚨 Error Fetching Data:", err.response?.data || err.message);
      setError("Failed to fetch fitness data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchFitnessData();
    }
  }, [token, fetchFitnessData]);

  const handleSync = async () => {
    try {
      const res = await API.get("/api/auth/google", { withCredentials: true });
      if (res.data.authUrl) {
        window.location.href = res.data.authUrl;
      }
    } catch (err) {
      console.error("🚨 Error Initiating Google OAuth:", err);
      setError("Failed to initiate Google OAuth.");
    }
  };

  // Check if we are on the main dashboard page only
  const isMainDashboard = location.pathname === "/dashboard";

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        {isMainDashboard && (
          <>
            <h2>Welcome, {user ? user.name : "User"}!</h2>
            <p>Your Fitness Overview</p>

            <button className="sync-button" onClick={handleSync}>
              Sync with Google Fit
            </button>

            {loading && <p>Loading fitness data...</p>}
            {error && <p className="error">{error}</p>}

            {!loading && !error && (
              <div className="fitness-data">
                {monthlyData && (
                  <div className="data-card">
                    <h3>Monthly Fitness Data</h3>
                    <p>
                      <strong>Total Steps:</strong> {monthlyData.months[0].steps}
                    </p>
                    <p>
                      <strong>Total Calories Burned:</strong>{" "}
                      {monthlyData.months[0].caloriesExpended} kcal
                    </p>
                    <p>
                      <strong>Total Distance:</strong> {monthlyData.months[0].distance} km
                    </p>
                  </div>
                )}

                {dailyData.length > 0 && (
                  <div className="calendar-section">
                    <CalendarView dailyData={dailyData} />
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* This is where child routes like calorie-tracker will render */}
        <Outlet />
      </div>
    </>
  );
};

export default Dashboard;
