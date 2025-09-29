const express = require('express');
const router = express.Router();

router.post('/convert', (req, res) => {
	try {
		console.log('ICS Convert Request received');
		console.log('Request body type:', typeof req.body);
		console.log('Request body keys:', Object.keys(req.body || {}));
		console.log('Request headers:', req.headers);

		const { content, filename, contentType } = req.body;

		console.log('Extracted content length:', content ? content.length : 'undefined');
		console.log('Extracted filename:', filename);
		console.log('Extracted contentType:', contentType);

		if (!content) {
			console.log('No content provided, returning 400');
			return res.status(400).json({ error: 'Content is required' });
		}

		const outputFilename = filename || `file-${Date.now()}.ics`;
		const mimeType = contentType || 'text/calendar';

		console.log('Setting headers - filename:', outputFilename, 'mimeType:', mimeType);

		res.setHeader('Content-Type', mimeType);
		res.setHeader('Content-Disposition', `attachment; filename="${outputFilename}"`);
		res.setHeader('Cache-Control', 'no-cache');

		console.log('Sending response with content length:', content.length);
		res.send(content);
	} catch (error) {
		console.error('Error converting to binary file:', error);
		console.error('Error stack:', error.stack);
		res.status(500).json({ error: 'Failed to convert content to file', details: error.message });
	}
});

module.exports = router;