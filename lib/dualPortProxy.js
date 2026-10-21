const http = require('http');
const net = require('net');

const TARGET_PORT = 3001;
const LISTEN_PORT = 3000;

const server = http.createServer((req, res) => {
  const options = {
    hostname: '127.0.0.1',
    port: TARGET_PORT,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: `localhost:${TARGET_PORT}` }
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end(`Proxy to Next.js on port ${TARGET_PORT} failed: ${err.message}`);
  });

  req.pipe(proxyReq, { end: true });
});

// Handle WebSocket upgrades for Next.js Fast Refresh (Turbopack HMR)
server.on('upgrade', (req, clientSocket, head) => {
  const serverSocket = net.connect(TARGET_PORT, '127.0.0.1', () => {
    serverSocket.write(
      `${req.method} ${req.url} HTTP/${req.httpVersion}\r\n` +
      Object.entries(req.headers)
        .map(([k, v]) => `${k}: ${v}`)
        .join('\r\n') +
      '\r\n\r\n'
    );
    if (head && head.length > 0) serverSocket.write(head);
    clientSocket.pipe(serverSocket).pipe(clientSocket);
  });

  serverSocket.on('error', () => clientSocket.destroy());
  clientSocket.on('error', () => serverSocket.destroy());
});

server.listen(LISTEN_PORT, '0.0.0.0', () => {
  console.log(`Port ${LISTEN_PORT} proxy active -> forwarding to http://localhost:${TARGET_PORT}`);
});
