const express = require('express');
const router = express.Router();

router.post('/convert', (req, res) => {
	try {
		const { content, filename, contentType } = req.body;

		if (!content) {
			return res.status(400).json({ error: 'Content is required' });
		}

		const outputFilename = filename || `file-${Date.now()}.ics`;
		const mimeType = contentType || 'text/calendar';

		res.setHeader('Content-Type', mimeType);
		res.setHeader('Content-Disposition', `attachment; filename="${outputFilename}"`);
		res.setHeader('Cache-Control', 'no-cache');

		res.send(content);
	} catch (error) {
		console.error('Error converting to binary file:', error);
		res.status(500).json({ error: 'Failed to convert content to file' });
	}
});

module.exports = router;