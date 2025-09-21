import express from 'express';
import "dotenv/config"
import cors from 'cors';
import http from 'http';
import { connectDB } from './lib/db.js';
import userRouter from './routes/userRoutes.js';
import messageRouter from './routes/messageRouter.js';
import { Server } from 'socket.io';

// create express app and http server
const app = express();
const server = http.createServer(app);

// Initialize socket.io server
export const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})

// Store online users
// { userId: socketId }
export const userSocketMap = {};

// socket.io connection handler
io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    console.log("User Connected:", userId);
    console.log("Socket ID:", socket.id);

    if (userId && userId !== 'undefined' && userId !== 'null') {
        userSocketMap[userId] = socket.id;
        console.log("User socket map updated:", userSocketMap);

        // Emit online users to all connected clients
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    } else {
        console.log("Invalid userId provided:", userId);
    }

    socket.on("disconnect", () => {
        console.log("User Disconnected:", userId);
        if (userId && userId !== 'undefined' && userId !== 'null') {
            delete userSocketMap[userId];
            console.log("Updated user socket map after disconnect:", userSocketMap);
            io.emit("getOnlineUsers", Object.keys(userSocketMap));
        }
    });

    // Add error handling
    socket.on("error", (error) => {
        console.error("Socket error:", error);
    });

    // Handle connection errors
    socket.on("connect_error", (error) => {
        console.error("Connection error:", error);
    });
})

// Middleware setup
app.use(express.json({limit: "4mb"}))
app.use(cors());

// Routes setup
app.use("/api/status", (req, res) => res.send("Server is live"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter)

// Connect to MongoDB
await connectDB();


    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log("Server is running on PORT:" 
        + PORT));
