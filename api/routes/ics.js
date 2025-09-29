const express = require('express');
const router = express.Router();

console.log('ICS route module loading...');

router.post('/convert', (req, res) => {
	console.log('=== ICS Convert Request START ===');

	try {
		console.log('Request method:', req.method);
		console.log('Request path:', req.path);
		console.log('Request body exists:', !!req.body);
		console.log('Request body type:', typeof req.body);

		if (req.body) {
			console.log('Request body keys:', Object.keys(req.body));
		}

		const { content, filename, contentType } = req.body || {};

		console.log('Content length:', content ? content.length : 'no content');
		console.log('Filename:', filename);

		if (!content) {
			console.log('ERROR: No content provided');
			return res.status(400).json({ error: 'Content is required' });
		}

		const outputFilename = filename || `calendar-${Date.now()}.ics`;
		const mimeType = contentType || 'text/calendar';

		console.log('Setting response headers...');
		res.setHeader('Content-Type', mimeType);
		res.setHeader('Content-Disposition', `attachment; filename="${outputFilename}"`);
		res.setHeader('Cache-Control', 'no-cache');

		console.log('Sending response...');
		res.send(content);
		console.log('Response sent successfully');

	} catch (error) {
		console.error('=== ERROR in ICS endpoint ===');
		console.error('Error message:', error.message);
		console.error('Error stack:', error.stack);
		res.status(500).json({
			error: 'Failed to convert content to file',
			details: error.message,
			stack: error.stack
		});
	}

	console.log('=== ICS Convert Request END ===');
});

console.log('ICS route module loaded successfully');
module.exports = router;