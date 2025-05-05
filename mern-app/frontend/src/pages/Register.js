import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";
import "../styles/auth.css"; 

const Register = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleRegister = async () => {
        try {
            await API.post("/auth/register", { name, email, password });
            navigate("/");
        } catch (error) {
            alert("Registration failed");
        }
    };

    return (
        <div className="auth-container">
            <h2>Register</h2>
            <form autoComplete="off">
                <input 
                    type="text" 
                    placeholder="Name" 
                    name="user_fullname"  // ✅ Changed Name
                    autoComplete="off" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                />
                <input 
                    type="email" 
                    placeholder="Email" 
                    name="user_email"  // ✅ Changed Name
                    autoComplete="off" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    name="user_password"  // ✅ Changed Name
                    autoComplete="new-password"  // ✅ Forces browsers to ignore saved passwords
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                />
                <button type="button" onClick={handleRegister}>Register</button>
            </form>
            <p>Already have an account? <Link to="/">Login</Link></p>
        </div>
    );
};

export default Register;
