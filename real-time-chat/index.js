`use strict`;
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);

const WebSocket = require("ws");

const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  console.log("Some one connected");

  ws.on("message", (message) => {
    const msg = message.toString();
    wss.clients.forEach((StudentWs) => {
      if (StudentWs && StudentWs.readyState == WebSocket.OPEN) {
        StudentWs.send();
      }
    });
  });
  ws.on("close", () => {
    console.log("Disconnected");
  });
});

server.listen(3000, () => {
  console.log("Port listening 3000");
});
