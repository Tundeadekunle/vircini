import { createServer, IncomingMessage, ServerResponse } from 'http';
import { WebSocketServer, WebSocket } from 'ws';

const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  // Handle HTTP requests for notifications from Next.js API routes
  if (req.method === 'POST' && req.url === '/notify') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const { userId, type, payload } = data;

        // Send to specific user if connected
        if (userId && userClients[userId]) {
          const msg = JSON.stringify({ type, payload });
          for (const client of userClients[userId]) {
            if (client.readyState === WebSocket.OPEN) {
              client.send(msg);
            }
          }
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (e) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

const wss = new WebSocketServer({ server });

// Map of sessionId to set of WebSocket clients (for watch parties)
const sessionClients: Record<string, Set<WebSocket>> = {};
// Map of userId to set of WebSocket clients (for direct notifications)
const userClients: Record<string, Set<WebSocket>> = {};

wss.on('connection', (ws, req) => {
  let currentSessionId: string | null = null;
  let currentUserId: string | null = null;

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());

      // JOIN event
      if (msg.type === 'join') {
        if (msg.userId) {
          currentUserId = msg.userId;
          if (!userClients[currentUserId!]) userClients[currentUserId!] = new Set();
          userClients[currentUserId!].add(ws);
        }

        if (msg.sessionId) {
          currentSessionId = msg.sessionId;
          if (!sessionClients[currentSessionId!]) sessionClients[currentSessionId!] = new Set();
          sessionClients[currentSessionId!].add(ws);
        }
      }
      // CHAT event
      else if (msg.type === 'chat' && currentSessionId) {
        const payload = JSON.stringify({
          type: 'chat',
          userId: msg.userId,
          message: msg.message,
          timestamp: new Date().toISOString(),
        });
        broadcastToSession(currentSessionId, payload);
      }
      // SYNC event (play, pause, seek, rate)
      else if (msg.type === 'sync' && currentSessionId) {
        const payload = JSON.stringify({
          type: 'sync',
          action: msg.action, // 'play', 'pause', 'seek'
          time: msg.time,
          rate: msg.rate,
          timestamp: Date.now()
        });
        // Broadcast to everyone EXCEPT sender (usually) or ALL? 
        // For simplicity, broadcast to all, client ignores if it originated from self or handles gracefully
        // Better: broadcast to others
        broadcastToSession(currentSessionId, payload, ws);
      }
    } catch { }
  });

  ws.on('close', () => {
    if (currentSessionId && sessionClients[currentSessionId]) {
      sessionClients[currentSessionId].delete(ws);
      if (sessionClients[currentSessionId].size === 0) delete sessionClients[currentSessionId];
    }
    if (currentUserId && userClients[currentUserId]) {
      userClients[currentUserId].delete(ws);
      if (userClients[currentUserId].size === 0) delete userClients[currentUserId];
    }
  });
});

function broadcastToSession(sessionId: string, data: string, excludeWs?: WebSocket) {
  if (!sessionClients[sessionId]) return;
  for (const client of sessionClients[sessionId]) {
    if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  }
}

const PORT = 3002;
server.listen(PORT, () => {
  console.log(`WebSocket server running on ws://localhost:${PORT}`);
});
