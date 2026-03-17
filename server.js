const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const main = express();

require("dotenv").config();

const PORT = process.env.PORT || 3000;
const BASE_PATH = process.env.BASE_PATH || "/api/v1";

const app = require("./app");
main.use(BASE_PATH, app);

// create http server
const server = http.createServer(main);

// socket setup
const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

// socket connection
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("joinStoreRoom", (storeId) => {
        socket.join(storeId);
        console.log(`User joined store room: ${storeId}`);
    });

    socket.on("joinUserRoom", (userId) => {
        socket.join(userId);
        console.log(`User joined user room: ${userId}`);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

// make io globally accessible
const socket = require("./src/socket/socket.io");
socket.init(io);

// start server
server.listen(PORT, () => {
    console.log(`Server started at ********** ${PORT}`);
});