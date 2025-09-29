const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const securityMiddleware = require('./middleware/security');
const airtableRoute = require('./routes/airtable');
const errorRoute = require('./routes/error');
const imageProcessingRoutes = require('./routes/imageProcessing');
const wpCredentialsRoute = require('./routes/wpCredentials.js');
const slackRoutes = require('./routes/slack');
let icsRoute;
try {
	icsRoute = require('./routes/ics');
	console.log('ICS route loaded successfully');
} catch (error) {
	console.error('Failed to load ICS route:', error);
	icsRoute = express.Router();
	icsRoute.post('/convert', (req, res) => {
		res.status(500).json({ error: 'ICS route failed to load', details: error.message });
	});
}

const app = express();

// Define allowed domains
const allowedDomains = ['https://vierless.de', 'https://cf-vierless.webflow.io', 'https://slack.com', 'https://hook.eu1.make.com', 'https://hook.us1.make.com'];

// Apply security middleware to all routes
app.use(securityMiddleware(allowedDomains, true));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug middleware to log all requests
app.use((req, res, next) => {
	console.log(`=== REQUEST: ${req.method} ${req.path} ===`);
	console.log('Full URL:', req.url);
	console.log('Headers:', req.headers);
	console.log('Body exists:', !!req.body);
	next();
});

// Serve static files from the public directory
app.use(express.static(path.join(process.cwd(), 'public')));

// API routes
app.use('/api/airtable', airtableRoute);
app.use('/api/error', errorRoute);
app.use('/api/image', imageProcessingRoutes);
app.use('/api/wp-credentials', wpCredentialsRoute);
app.use('/api/slack', slackRoutes);
app.use('/api/ics', icsRoute);

// Debug route directly in main app
app.post('/api/ics/test', (req, res) => {
	console.log('=== DIRECT TEST ROUTE HIT ===');
	res.json({ message: 'Direct route works', body: req.body });
});

// Root route
app.get('/', async (req, res, next) => {
	try {
		const landingPath = path.join(process.cwd(), 'public', 'html', 'index.html');
		const content = await fs.readFile(landingPath, 'utf8');
		res.send(content);
	} catch (err) {
		next(err);
	}
});

// Catch-all route for handling 404s
app.use('*', (req, res, next) => {
	res.status(404);
	next(new Error('Not Found'));
});

// Error handler
app.use((err, req, res, next) => {
	const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
	errorRoute.renderErrorPage(req, res, statusCode);
});

module.exports = app;
