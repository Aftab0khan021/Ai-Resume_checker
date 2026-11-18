import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const AuthContext = createContext();

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // ── Logout ─────────────────────────────────────────────────────────────
    // Defined first so it can be referenced in useEffect below.
    const logout = useCallback(() => {
        localStorage.removeItem("token");
        setUser(null);
    }, []);

    // ── Bootstrap from stored token ─────────────────────────────────────
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // Check expiry with a 30-second buffer
                if (decoded.exp * 1000 < Date.now() + 30_000) {
                    logout();
                } else {
                    setUser({ username: decoded.sub });
                }
            } catch {
                logout();
            }
        }
        setLoading(false);
    }, [logout]);

    // ── Login ───────────────────────────────────────────────────────────────
    const login = async (username, password) => {
        const formData = new FormData();
        formData.append("username", username.trim());
        formData.append("password", password);

        const res = await axios.post(`${API_URL}/auth/login`, formData);
        const { access_token } = res.data;

        localStorage.setItem("token", access_token);
        const decoded = jwtDecode(access_token);
        setUser({ username: decoded.sub });
        return true;
    };

    // ── Register ────────────────────────────────────────────────────────────
    const register = async (username, email, password) => {
        await axios.post(`${API_URL}/auth/register`, {
            username: username.trim(),
            email: email ? email.trim() : undefined,
            password,
        });
        return true;
    };

    // ── Provide auth token getter (for API interceptor) ─────────────────
    const getToken = () => localStorage.getItem("token");

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, getToken }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
