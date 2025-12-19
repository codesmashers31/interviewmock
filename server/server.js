import express from "express";
import path from "path";
import cors from "cors";
import { config } from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";

import { seedTestSession } from "./services/sessionService.js";
import attachSignaling from "./websocket/signaling.js";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import expertRoutes from "./routes/expertRoutes.js";
import userProfileRoutes from "./routes/userProfileRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";

config();
await connectDB();
// Seeding on startup
await seedTestSession();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

attachSignaling(io);

// Middleware
app.use(cors());
app.use(express.json());

// serve uploaded images (dev)
app.use("/uploads/profileImages", express.static(path.join(process.cwd(), "uploads/profileImages")));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
// mount routers
// mount routers
app.use("/api/auth", authRoutes);
app.use("/api/expert", expertRoutes);
app.use("/api/user", userProfileRoutes);
app.use("/api/sessions", sessionRoutes);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
