// Simple sitemap parser for API usage
export async function getUrlsFromSitemap(sitemapUrl) {
  try {
    const response = await fetch(sitemapUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch sitemap: ${response.statusText}`);
    }

    const text = await response.text();
    
    // Simple regex to extract URLs from sitemap
    const urlMatches = text.match(/<loc>(.*?)<\/loc>/g);
    if (!urlMatches) {
      throw new Error('No URLs found in sitemap');
    }

    const urls = urlMatches.map(match => 
      match.replace(/<\/?loc>/g, '').trim()
    );

    return [...new Set(urls)]; // Remove duplicates
  } catch (error) {
    throw new Error(`Sitemap parsing error: ${error.message}`);
  }
}
