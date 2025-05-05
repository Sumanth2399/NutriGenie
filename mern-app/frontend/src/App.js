import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CalorieTracker from "./pages/CalorieTracker";
import Analytics from "./pages/Analytics";
import { AuthProvider } from "./context/authContext";  // ✅ Import the context
import Recommendations from "./pages/Recommendations";

function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} >
                <Route path="calorie-tracker" element={<CalorieTracker />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="recommendations" element = {<Recommendations />} />
                </Route>
            </Routes>
        </AuthProvider>
    );
}

export default App;
