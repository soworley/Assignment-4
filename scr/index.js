// Import the Express framework
const express = require("express");
const app = express();

// Define the port (matches Dockerfile EXPOSE 3000)
const PORT = 3000;

// Root route: simple HTML message
app.get("/", (req, res) => {
  res.send(`
    <h1>🚀 Node.js App Running in Docker!</h1>
    <p>If you can see this, your Docker container is working correctly.</p>
    <p>Try accessing the API endpoint at <a href="/api/status">/api/status</a>.</p>
  `);
});

// API route: returns a JSON response
app.get("/api/status", (req, res) => {
  res.json({
    status: "ok",
    message: "Your Docker containerized Node.js app is running successfully!"
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
