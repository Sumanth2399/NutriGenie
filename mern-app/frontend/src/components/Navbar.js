import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import "../styles/navbar.css";

const Navbar = () => {
  const { logout } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // ✅ detect path change

  // ✅ Close menu when location/path changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="custom-navbar">
      <div className="navbar-left">
        <button
          className="hamburger"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          ☰
        </button>
        <Link to="/dashboard" className="navbar-logo">
          NutriGenie
        </Link>
      </div>

      <div className="logout-button-container">
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>

      {/* Fullscreen Menu Overlay */}
      {menuOpen && (
        <div className="fullscreen-menu" onClick={() => setMenuOpen(false)}>
          <ul className="menu-items" onClick={(e) => e.stopPropagation()}>
            <li><Link to="/dashboard/calorie-tracker">Calorie Tracker</Link></li>
            <li><Link to="/dashboard/analytics">Analytics</Link></li>
            <li><Link to="/dashboard/recommendations">Recommendations</Link></li>
            <li><Link to="/progress">Progress</Link></li>
            <li><Link to="/settings">Settings</Link></li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
