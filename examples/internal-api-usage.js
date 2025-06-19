// Example: Using the HelpTheWeb API with internal API key

// For internal services that need unlimited access
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;
const API_BASE = 'https://api.helptheweb.org/api/v1';

async function scanWithInternalKey(url) {
  const response = await fetch(`${API_BASE}/scan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': INTERNAL_API_KEY  // This bypasses rate limiting
    },
    body: JSON.stringify({ url })
  });

  return response.json();
}

// Example usage in your app.helptheweb.org scanner
async function scanFromWebApp(url) {
  // When calling from helptheweb.org domains, the Origin header
  // will automatically bypass rate limiting, so no API key needed
  const response = await fetch('/api/v1/scan', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ url })
  });

  return response.json();
}

// Example: Batch scanning from CI/CD pipeline
async function ciPipelineScan(urls) {
  const response = await fetch(`${API_BASE}/scan/batch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': INTERNAL_API_KEY  // Use API key for CI/CD
    },
    body: JSON.stringify({ 
      urls,
      options: { maxElements: 500 }
    })
  });

  return response.json();
}
