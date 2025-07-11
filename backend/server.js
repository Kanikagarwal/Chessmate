import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./server/routes/UserRoutes.js";
import codeRoutes from "./server/routes/CodeRoutes.js";
import http from "http";
import { Server } from "socket.io";

dotenv.config();

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTURL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});
const rooms = {};

io.on("connection", (socket) => {
  socket.on("join-room", ({ roomCode, username, playerColor }) => {
    if (!rooms[roomCode]) rooms[roomCode] = [];

    // Prevent duplicate users
    const alreadyInRoom = rooms[roomCode].find((p) => p.username === username);
    if (alreadyInRoom) {
      // Update socket ID if user reconnected
      alreadyInRoom.id = socket.id;
      socket.join(roomCode);
      socket.emit("joined", { playerColor: alreadyInRoom.color });
      return;
    }

    // Reject if room full
    if (rooms[roomCode].length >= 2) {
      socket.emit("room-full");
      return;
    }

    // Assign color or use stored playerColor if valid
    let assignedColor;
    if (playerColor && (playerColor === "white" || playerColor === "black")) {
      assignedColor = playerColor;
    } else {
      assignedColor = rooms[roomCode].length === 0 ? "white" : "black";
    }

    rooms[roomCode].push({ id: socket.id, username, color: assignedColor });
    socket.join(roomCode);

    // Confirm join
    socket.emit("joined", { playerColor: assignedColor });

    // Notify both players
    if (rooms[roomCode].length === 2) {
      io.to(roomCode).emit("start-game");
    }
  });

  socket.on("make-move", ({ roomCode, from, to, promotion }) => {
    socket.to(roomCode).emit("opponent-move", { from, to, promotion });
  });
  socket.on("tokenCaptured", ({ move, roomCode }) => {
    console.log("Move calture confirme 2");
    io.to(roomCode).emit("capture", move);
  });
  socket.on("checkMateConfirmed", ({ roomCode, loserColor }) => {
    console.log("checkmateconfirmed");
    io.to(roomCode).emit("checkmate", { loserColor });
  });
  socket.on("checkConfirmed", ({ roomCode, loserColor }) => {
    console.log("checkconfirmed");
    io.to(roomCode).emit("check", { loserColor });
  });

  socket.on("checkRemovedConfirmed", ({ roomCode }) => {
    console.log("checkRemoveconfirmed");
    io.to(roomCode).emit("checkRemove");
  });
  socket.on("stalemateConfirmed", ({ roomCode }) => {
    console.log("stalemate confirmed");
    io.to(roomCode).emit("stalemate");
  });

  socket.on("disconnect", () => {
    for (const room in rooms) {
      const index = rooms[room].findIndex((p) => p.id === socket.id);
      if (index !== -1) {
        rooms[room].splice(index, 1);
        if (rooms[room].length === 0) delete rooms[room];
      }
    }
  });
});

app.use(
  cors({
    origin: process.env.FRONTURL,
    credentials: true,
  })
);

app.use(express.json());
app.use("/api/auth", userRoutes);
app.use("/api/code", codeRoutes);

mongoose
  .connect(process.env.MONGOURL)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("Mongo error:", err));

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`App is listening at port ${PORT}`);
});
