const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
let studentCounter = 1;
const students = {}; // Mapping of studentId to WebSocket connection

app.use(express.static("public"));

wss.on("connection", (ws) => {
  // Assign a new ID to each student who joins
  let studentId = "student" + studentCounter++;
  students[studentId] = ws;

  // Notify the student of their assigned ID
  ws.send(JSON.stringify({ type: "assignId", data: { studentId } }));
  console.log(`${studentId} has joined`);

  ws.on("message", (message) => {
    try {
      const parsedMessage = JSON.parse(message);
      const { type, data } = parsedMessage;

      switch (type) {
        case "studentMessage":
          console.log(`Message from ${data.studentId}: ${data.message}`);
          // Broadcast to all admins
          wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({ type: "messageFromStudent", data }));
            }
          });
          break;

        case "adminMessage":
          const { studentId, message: adminMessage } = data;
          const studentWs = students[studentId];
          if (studentWs && studentWs.readyState === WebSocket.OPEN) {
            studentWs.send(
              JSON.stringify({
                type: "messageFromAdmin",
                data: { message: adminMessage },
              })
            );
            console.log(`Admin to ${studentId}: ${adminMessage}`);
          }
          break;

        case "adminBroadcastMessage":
          const { message: broadcastMessage } = data;
          for (const id in students) {
            const studentWs = students[id];
            if (studentWs && studentWs.readyState === WebSocket.OPEN) {
              studentWs.send(
                JSON.stringify({
                  type: "messageFromAdmin",
                  data: { message: broadcastMessage },
                })
              );
            }
          }
          console.log(`Admin broadcast: ${broadcastMessage}`);
          break;

        default:
          console.log(`Unknown message type: ${type}`);
      }
    } catch (err) {
      console.error("Error parsing message:", err);
    }
  });

  ws.on("close", () => {
    console.log(`${studentId} disconnected`);
    delete students[studentId];
  });
});

server.listen(3000, () => {
  console.log("Server listening on port 3000");
});
