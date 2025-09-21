import { useState, useEffect, createContext } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [authUser, setAuthUser] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [socket, setSocket] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check if user is authenticated and if so, set the user data and connect the socket
    const checkAuth = async () => {
        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            axios.defaults.headers.common["token"] = token;
            const { data } = await axios.get("/api/auth/check");
            if (data.success) {
                setAuthUser(data.user);
                connectSocket(data.user);
            } else {
                // Token is invalid, clear it
                localStorage.removeItem("token");
                setToken(null);
                axios.defaults.headers.common["token"] = null;
            }
        } catch (error) {
            console.error("Auth check failed:", error.message);
            // If auth check fails, clear the token
            localStorage.removeItem("token");
            setToken(null);
            axios.defaults.headers.common["token"] = null;
        } finally {
            setIsLoading(false);
        }
    };

    // Login function to handle user authentication and socket connection
    const login = async (state, Credentials) => {
        try {
            const { data } = await axios.post(`/api/auth/${state}`, Credentials);
            if (data.success) {
                setAuthUser(data.userData);
                connectSocket(data.userData);
                axios.defaults.headers.common["token"] = data.token;
                setToken(data.token);
                localStorage.setItem("token", data.token);
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Logout function to handle user logout and socket disconnection
    const logout = async () => {
        localStorage.removeItem("token");
        setToken(null);
        setAuthUser(null);
        setOnlineUsers([]);
        axios.defaults.headers.common["token"] = null;
        toast.success("Logout successful");

        if (socket) {
            socket.disconnect();
            setSocket(null);
        }
    };

    // Update profile function to handle user profile updates
    const updateProfile = async (body) => {
        try {
            const { data } = await axios.put("/api/auth/update-profile", body);
            if (data.success) {
                setAuthUser(data.user);
                toast.success("Profile updated successfully");
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Connect socket function to handle socket connection and online users updates
    const connectSocket = (userData) => {
        if (!userData) return;

        // Disconnect existing socket if any
        if (socket) {
            socket.disconnect();
        }

        const newSocket = io(backendUrl, {
            query: {
                userId: userData._id
            },
            transports: ['websocket', 'polling']
        });

        newSocket.connect();

        newSocket.on("connect", () => {
            console.log("Socket connected successfully");
        });

        newSocket.on("getOnlineUsers", (userIds) => {
            console.log("Online users updated:", userIds);
            setOnlineUsers(userIds);
        });

        newSocket.on("disconnect", () => {
            console.log("Socket disconnected");
        });

        newSocket.on("connect_error", (error) => {
            console.error("Socket connection error:", error);
        });

        setSocket(newSocket);
    };

    // Initialize authentication on mount
    useEffect(() => {
        checkAuth();
    }, []);

    // Handle token changes
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common["token"] = token;
            if (!authUser && !isLoading) {
                checkAuth();
            }
        } else {
            axios.defaults.headers.common["token"] = null;
            setAuthUser(null);
            setOnlineUsers([]);
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
        }
    }, [token]);

    const value = {
        axios,
        authUser,
        onlineUsers,
        socket,
        login,
        logout,
        updateProfile,
        isLoading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
