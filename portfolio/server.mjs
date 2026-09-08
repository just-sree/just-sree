import http from 'node:http';
import handleRequest from './http-app.mjs';
import { getAIStatus } from './ai-config.mjs';

const port = Number(process.env.PORT || 4173);
const hostname = process.env.HOST || '127.0.0.1';
const server = http.createServer(handleRequest);
server.requestTimeout = 60000;
server.headersTimeout = 15000;
server.listen(port, hostname, () => console.log(`Sree portfolio: http://${hostname}:${port} (${getAIStatus().mode})`));
