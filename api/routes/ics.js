const express = require('express');
const router = express.Router();

router.post('/convert', (req, res) => {
	try {
		console.log('=== ICS Convert Debug ===');
		console.log('Request body exists:', !!req.body);
		console.log('Request body type:', typeof req.body);

		if (req.body) {
			console.log('Body keys:', Object.keys(req.body));
			console.log('Content exists:', !!req.body.content);
			if (req.body.content) {
				console.log('Content type:', typeof req.body.content);
				console.log('Content length:', req.body.content.length);
				console.log('Content first 100 chars:', req.body.content.substring(0, 100));
				console.log('Content has newlines:', req.body.content.includes('\n'));
			}
		}

		const { content, filename, contentType } = req.body;

		if (!content) {
			console.log('No content provided');
			return res.status(400).json({ error: 'Content is required' });
		}

		const outputFilename = filename || `calendar-${Date.now()}.ics`;
		const mimeType = contentType || 'text/calendar';

		console.log('Setting headers and sending response...');
		res.setHeader('Content-Type', mimeType);
		res.setHeader('Content-Disposition', `attachment; filename="${outputFilename}"`);
		res.setHeader('Cache-Control', 'no-cache');

		res.send(content);
		console.log('Response sent successfully');
	} catch (error) {
		console.error('Error in ICS endpoint:', error);
		console.error('Error stack:', error.stack);
		res.status(500).json({ error: 'Failed to convert content to file', details: error.message });
	}
});

module.exports = router;