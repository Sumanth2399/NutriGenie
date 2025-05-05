import React, { useState, useContext } from "react"; // ✅ added useContext
import { Link, useNavigate } from "react-router-dom";
import API from "../api";
import { AuthContext } from "../context/authContext"; // ✅ added AuthContext
import "../styles/auth.css";

const Login = () => {
    const { login } = useContext(AuthContext); // ✅ grab login function from context
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const res = await API.post("/auth/login", { email, password });
            login(res.data.token, res.data.user); // ✅ update context
            navigate("/dashboard");
        } catch (error) {
            alert("Login failed");
        }
    };

    return (
        <div className="auth-container">
            <h2>Login</h2>
            <form autoComplete="off">
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="button" onClick={handleLogin}>Login</button>
            </form>
            <p>Don't have an account? <Link to="/register">Register here</Link></p>
        </div>
    );
};

export default Login;
