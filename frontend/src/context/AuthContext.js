import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // You updated backend to run on port 8000 (usually) or as configured. 
    // Adjust base URL if needed.
    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // Check expiry
                if (decoded.exp * 1000 < Date.now()) {
                    logout();
                } else {
                    setUser({ username: decoded.sub });
                }
            } catch (err) {
                logout();
            }
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const formData = new FormData();
            formData.append("username", username);
            formData.append("password", password);

            const res = await axios.post(`${API_URL}/auth/login`, formData);
            const { access_token } = res.data;

            localStorage.setItem("token", access_token);
            const decoded = jwtDecode(access_token);
            setUser({ username: decoded.sub });
            return true;
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    };

    const register = async (username, email, password) => {
        try {
            await axios.post(`${API_URL}/auth/register`, {
                username,
                email,
                password,
            });
            return true;
        } catch (error) {
            console.error("Registration failed:", error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
