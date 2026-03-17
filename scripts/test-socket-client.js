// Usage:
// node scripts/test-socket-client.js <serverUrl> <storeId> <userId>

// Example:
// node scripts/test-socket-client.js http://localhost:3000 665ab111 665ab999

const { io } = require("socket.io-client");

const [serverUrlArg, storeId, userId] = process.argv.slice(2);

const defaultUrl = "http://localhost:3000";
const serverUrl = serverUrlArg || defaultUrl;

if (!storeId && !userId) {
  console.error("Usage: node scripts/test-socket-client.js <serverUrl> <storeId> <userId>");
  process.exit(1);
}

const socket = io(serverUrl, {
  transports: ["websocket"],
  reconnectionAttempts: 3,
  reconnectionDelay: 1000
});

socket.on("connect", () => {
  console.log("✅ Connected to server:", serverUrl);
  console.log("Socket ID:", socket.id);

  // Join store room
  if (storeId) {
    socket.emit("joinStoreRoom", storeId);
    console.log(`➡️ Joined store room: store_${storeId}`);
  }

  // Join user room
  if (userId) {
    socket.emit("joinUserRoom", userId);
    console.log(`➡️ Joined user room: user_${userId}`);
  }
});


// Store receives new order
socket.on("newOrder", (data) => {
  console.log("📩 Store received newOrder:", data);
});

// Customer receives order updates
socket.on("orderStatusUpdate", (data) => {
  console.log("📦 Customer order update:", data);
});

// Order taken by another store
socket.on("orderTaken", (data) => {
  console.log("⚠️ Order already taken:", data);
});

socket.on("disconnect", (reason) => {
  console.log("🔌 Disconnected:", reason);
});

socket.on("connect_error", (err) => {
  console.log("⚠️ Connection error:", err.message);
});