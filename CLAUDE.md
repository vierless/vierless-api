# VIERLESS Agency API

## Project Overview
Node.js/Express API deployed on Vercel for VIERLESS agency operations.

## Architecture
- **Main Entry**: `api/index.js` - Express server with security middleware
- **Deployment**: Vercel with configuration in `vercel.json`
- **Security**: Domain-restricted CORS for `vierless.de`, `cf-vierless.webflow.io`, `slack.com`

## API Endpoints
- `/api/airtable` - Airtable integration for data management
- `/api/error` - Error handling and custom error pages
- `/api/image` - Image processing using Sharp library
- `/api/wp-credentials` - WordPress credentials management
- `/api/slack` - Slack integration for notifications

## Key Dependencies
- `express` - Web framework
- `airtable` - Airtable API client
- `axios` - HTTP requests
- `sharp` - Image processing
- `helmet` - Security headers
- `uuid` - UUID generation
- `@vercel/node` - Vercel deployment

## Environment Variables
- `AIRTABLE_API_KEY` - Airtable API access
- `ALFREDS_TOOLBOX_LICENSE_BASE_ID` - Airtable base ID

## Development Commands
- No specific test or build commands configured in package.json
- Deployed automatically via Vercel

## Security Features
- CORS protection with domain whitelist
- Security headers (XSS, content-type, frame options)
- Credential-based access control

## File Structure
```
api/
├── index.js           # Main Express server
├── middleware/
│   └── security.js    # CORS and security middleware
└── routes/
    ├── airtable.js    # Airtable operations
    ├── error.js       # Error handling
    ├── imageProcessing.js # Image processing
    ├── slack.js       # Slack integration
    └── wpCredentials.js # WordPress credentials
```