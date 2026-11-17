// Entry point for running the API as a long-lived process (Docker).
// Vercel keeps using api/index.js directly; nothing there depends on this file.
const express = require('express');
const app = require('./api/index');

const server = express();

// Behind Traefik and Cloudflare: take the client address from the forwarded headers,
// so the license log keeps recording the caller's IP as it did on Vercel.
server.set('trust proxy', true);
app.set('trust proxy', true);

// Traefik replaces X-Forwarded-For with the address of the Cloudflare edge. Cloudflare
// passes the real client address in CF-Connecting-IP; hand that to Express as req.ip.
server.use((req, res, next) => {
	const clientIp = req.headers['cf-connecting-ip'];
	if (clientIp) req.headers['x-forwarded-for'] = clientIp;
	next();
});

// vercel.json sets these headers on every /api/* response. Keep them as defaults so
// callers see the same responses; the app overrides them for allowed origins.
server.use('/api', (req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	next();
});

// One JSON line per request. No bodies, no query values except the Airtable target,
// which is recorded to learn which bases and tables are really in use.
server.use((req, res, next) => {
	const startedAt = Date.now();
	// Mounted routers rewrite req.path while they handle a request; keep the original.
	const path = req.path;
	res.on('finish', () => {
		if (path === '/health') return;
		const entry = {
			time: new Date().toISOString(),
			method: req.method,
			path,
			status: res.statusCode,
			durationMs: Date.now() - startedAt,
			origin: req.headers.origin || null,
			userAgent: req.headers['user-agent'] || null,
		};
		if (path === '/api/airtable') {
			entry.airtable = { base: req.query.base || null, table: req.query.table || null, fields: req.query.fields || null };
		}
		console.log(JSON.stringify(entry));
	});
	next();
});

server.get('/health', (req, res) => res.json({ status: 'ok' }));
server.use(app);

const port = Number(process.env.PORT || 3000);
const listener = server.listen(port, '0.0.0.0', () => console.log(JSON.stringify({ msg: 'listening', port })));

for (const signal of ['SIGTERM', 'SIGINT']) {
	process.on(signal, () => listener.close(() => process.exit(0)));
}
