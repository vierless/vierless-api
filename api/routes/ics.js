const express = require('express');
const router = express.Router();

// Convert raw content to ICS file (original endpoint)
router.post('/convert', (req, res) => {
	try {
		const { content, filename, contentType } = req.body;

		if (!content) {
			return res.status(400).json({ error: 'Content is required' });
		}

		const outputFilename = filename || `calendar-${Date.now()}.ics`;
		const mimeType = contentType || 'text/calendar';

		res.setHeader('Content-Type', mimeType);
		res.setHeader('Content-Disposition', `attachment; filename="${outputFilename}"`);
		res.setHeader('Cache-Control', 'no-cache');

		res.send(content);
	} catch (error) {
		console.error('Error in ICS convert endpoint:', error);
		res.status(500).json({ error: 'Failed to convert content to file' });
	}
});

// Generate ICS file from structured data
router.post('/generate', (req, res) => {
	try {
		console.log('=== ICS Generate Request ===');
		console.log('Request body:', JSON.stringify(req.body, null, 2));

		const {
			summary,
			description,
			startDateTime,
			endDateTime,
			organizer,
			attendees = [],
			location,
			url,
			uid,
			reminder,
			filename
		} = req.body;

		console.log('Extracted fields:', { summary, startDateTime, endDateTime });

		if (!summary || !startDateTime || !endDateTime) {
			return res.status(400).json({
				error: 'Required fields missing',
				required: ['summary', 'startDateTime', 'endDateTime']
			});
		}

		// Generate UID if not provided
		const eventUid = uid || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@vierless.de`;

		// Format datetime (expect ISO format, convert to ICS format)
		const formatDateTime = (isoString) => {
			console.log('Formatting datetime:', isoString);
			const result = new Date(isoString).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
			console.log('Formatted result:', result);
			return result;
		};

		console.log('Formatting dates...');
		const dtStart = formatDateTime(startDateTime);
		const dtEnd = formatDateTime(endDateTime);
		const dtStamp = formatDateTime(new Date().toISOString());
		console.log('All dates formatted successfully');

		// Build ICS content
		let icsContent = `BEGIN:VCALENDAR
PRODID:-//VIERLESS//Calendar Export//EN
VERSION:2.0
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${eventUid}
DTSTAMP:${dtStamp}
DTSTART:${dtStart}
DTEND:${dtEnd}
SUMMARY:${summary}`;

		if (description) {
			icsContent += `\nDESCRIPTION:${description.replace(/\n/g, '\\n')}`;
		}

		if (organizer) {
			icsContent += `\nORGANIZER:mailto:${organizer}`;
		}

		if (attendees && attendees.length > 0) {
			attendees.forEach(email => {
				icsContent += `\nATTENDEE;PARTSTAT=NEEDS-ACTION;RSVP=TRUE;ROLE=REQ-PARTICIPANT:mailto:${email}`;
			});
		}

		if (location) {
			icsContent += `\nLOCATION:${location}`;
		}

		if (url) {
			icsContent += `\nURL:${url}`;
		}

		icsContent += `\nSTATUS:CONFIRMED
SEQUENCE:0`;

		if (reminder) {
			const reminderMinutes = parseInt(reminder) || 15;
			icsContent += `\nBEGIN:VALARM
ACTION:EMAIL
TRIGGER:-PT${reminderMinutes}M
DESCRIPTION:Reminder
SUMMARY:Reminder: ${summary}`;

			if (attendees && attendees.length > 0) {
				attendees.forEach(email => {
					icsContent += `\nATTENDEE:mailto:${email}`;
				});
			}

			icsContent += `\nEND:VALARM`;
		}

		icsContent += `\nEND:VEVENT
END:VCALENDAR`;

		const outputFilename = filename || `${summary.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.ics`;

		console.log('ICS content length:', icsContent.length);
		console.log('Output filename:', outputFilename);
		console.log('Setting headers and sending response...');

		res.setHeader('Content-Type', 'text/calendar');
		res.setHeader('Content-Disposition', `attachment; filename="${outputFilename}"`);
		res.setHeader('Cache-Control', 'no-cache');

		res.send(icsContent);
		console.log('Response sent successfully');
	} catch (error) {
		console.error('Error in ICS generate endpoint:', error);
		res.status(500).json({ error: 'Failed to generate ICS file', details: error.message });
	}
});

module.exports = router;