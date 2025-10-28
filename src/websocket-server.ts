import { createServer } from 'http';
import { WebSocketServer } from 'ws';

const server = createServer();
const wss = new WebSocketServer({ server });

// Map of sessionId to set of WebSocket clients
const sessionClients: Record<string, Set<any>> = {};

wss.on('connection', (ws, req) => {
  let sessionId: string | null = null;

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'join' && msg.sessionId) {
        sessionId = msg.sessionId;
        if (sessionId) {
          if (!sessionClients[sessionId]) sessionClients[sessionId] = new Set();
          sessionClients[sessionId].add(ws);
        }
      } else if (msg.type === 'chat' && sessionId) {
        // Broadcast to all clients in the session
        const payload = JSON.stringify({
          type: 'chat',
          userId: msg.userId,
          message: msg.message,
          timestamp: new Date().toISOString(),
        });
        for (const client of sessionClients[sessionId] || []) {
          if (client.readyState === ws.OPEN) {
            client.send(payload);
          }
        }
      }
    } catch {}
  });

  ws.on('close', () => {
    if (sessionId && sessionClients[sessionId]) {
      sessionClients[sessionId].delete(ws);
      if (sessionClients[sessionId].size === 0) delete sessionClients[sessionId];
    }
  });
});

const PORT = 3002;
server.listen(PORT, () => {
  console.log(`WebSocket server running on ws://localhost:${PORT}`);
});
