# HelpTheWeb Accessibility Engine API

RESTful API for the HelpTheWeb accessibility testing engine.

## Quick Start

### Local Development
```bash
# Install dependencies
npm install

# Start the API server
npm run api

# Or using Node directly
node src/api/index.js
```

### Using Docker
```bash
# Build and run with Docker Compose
docker-compose up

# Or build manually
docker build -t helptheweb-api .
docker run -p 3000:3000 helptheweb-api
```

## API Endpoints (v1)

Base URL: `http://localhost:3000/api/v1`

### Health Check
```
GET /health
```

### Single URL Scan
```
POST /api/v1/scan
Content-Type: application/json

{
  "url": "https://example.com",
  "options": {
    "maxElements": 1000,
    "timeout": 30000,
    "rules": ["wcag22a", "wcag22aa"]  // optional
  }
}
```

Response:
```json
{
  "url": "https://example.com",
  "timestamp": "2025-06-19T12:00:00.000Z",
  "scanDuration": "2341ms",
  "summary": {
    "totalIssues": 15,
    "critical": 3,
    "serious": 5,
    "moderate": 7,
    "minor": 0
  },
  "violations": [
    {
      "rule": "img-alt",
      "impact": "critical",
      "message": "Image missing alt attribute",
      "explanation": "Images need text descriptions so screen reader users know what the image shows.",
      "selector": "img",
      "html": "<img src=\"logo.png\">",
      "howToFix": "Add an alt attribute to the image element"
    }
  ]
}
```

### Batch URL Scan
```
POST /api/v1/scan/batch
Content-Type: application/json

{
  "urls": [
    "https://example.com",
    "https://example.com/about"
  ],
  "options": {
    "maxElements": 500
  }
}
```

### Sitemap Scan
```
POST /api/v1/scan/sitemap
Content-Type: application/json

{
  "sitemapUrl": "https://example.com/sitemap.xml",
  "options": {
    "maxUrls": 10
  }
}
```

### List All Rules
```
GET /api/v1/rules
GET /api/v1/rules?tag=wcag22a
GET /api/v1/rules?impact=critical
```

### Get Rule Details
```
GET /api/v1/rules/img-alt
```

## Rate Limiting

- 100 requests per 15 minutes per IP address
- Returns 429 status code when limit exceeded
- Rate limit info provided in `RateLimit-*` headers

### Exemptions
The following are exempt from rate limiting:
- Localhost connections (127.0.0.1, ::1)
- Trusted IPs (configure via `TRUSTED_IPS` environment variable)
- Requests with valid internal API key (`INTERNAL_API_KEY` environment variable)
- Requests from HelpTheWeb domains:
  - https://helptheweb.org
  - https://www.helptheweb.org
  - https://app.helptheweb.org

## Environment Variables

- `PORT` - API server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `TRUSTED_IPS` - Comma-separated list of IPs exempt from rate limiting
- `INTERNAL_API_KEY` - API key for internal services (bypasses rate limiting)

## Integration Examples

### JavaScript/Node.js
```javascript
const response = await fetch('http://localhost:3000/api/v1/scan', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    url: 'https://example.com'
  })
});

const results = await response.json();
console.log(`Found ${results.summary.totalIssues} accessibility issues`);
```

### cURL
```bash
curl -X POST http://localhost:3000/api/v1/scan \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

### Python
```python
import requests

response = requests.post(
    'http://localhost:3000/api/v1/scan',
    json={'url': 'https://example.com'}
)

results = response.json()
print(f"Found {results['summary']['totalIssues']} issues")
```

## Error Responses

```json
{
  "error": "URL is required",
  "example": {
    "url": "https://example.com",
    "options": { "maxElements": 1000 }
  }
}
```

## Future Enhancements

- Webhook support for async scanning
- Caching layer for repeated scans
- Authentication & API keys
- Usage analytics
- WebSocket support for real-time scanning
- GraphQL endpoint
