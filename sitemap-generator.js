// sitemap-generator.js
// This script generates an XML sitemap for discoun3ree.com

const fs = require('fs');

const SITE_URL = 'https://discoun3ree.com';

// Static routes from your application
const staticRoutes = [
  // Main pages
  { path: '/', priority: 1.0, changefreq: 'daily' },
  { path: '/stores', priority: 0.9, changefreq: 'daily' },
  { path: '/offers', priority: 0.9, changefreq: 'daily' },
  { path: '/hotdeals', priority: 0.9, changefreq: 'daily' },
  
  // Authentication
  { path: '/accounts/sign-in', priority: 0.5, changefreq: 'monthly' },
  { path: '/accounts/sign-up', priority: 0.5, changefreq: 'monthly' },
  
  // User pages
  { path: '/profile', priority: 0.6, changefreq: 'weekly' },
  { path: '/chat', priority: 0.6, changefreq: 'weekly' },
  { path: '/my-bookings', priority: 0.6, changefreq: 'weekly' },
  { path: '/my-vouchers', priority: 0.6, changefreq: 'weekly' },
  { path: '/favourites', priority: 0.6, changefreq: 'weekly' },
  { path: '/followed-stores', priority: 0.6, changefreq: 'weekly' },
  { path: '/search', priority: 0.7, changefreq: 'daily' },
  { path: '/request-service', priority: 0.7, changefreq: 'monthly' },
  
  // Footer pages
  { path: '/about-us', priority: 0.6, changefreq: 'monthly' },
  { path: '/contact-us', priority: 0.7, changefreq: 'monthly' },
  { path: '/faq', priority: 0.7, changefreq: 'monthly' },
  { path: '/careers', priority: 0.6, changefreq: 'monthly' },
  { path: '/terms-conditions', priority: 0.5, changefreq: 'yearly' },
  { path: '/privacy-policy', priority: 0.5, changefreq: 'yearly' }
];

// Function to format date to W3C format (YYYY-MM-DD)
function getCurrentDate() {
  return new Date().toISOString().split('T')[0];
}

// Generate XML sitemap
function generateSitemap(routes, dynamicUrls = {}) {
  const currentDate = getCurrentDate();
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  // Add static routes
  routes.forEach(route => {
    xml += '  <url>\n';
    xml += `    <loc>${SITE_URL}${route.path}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
    xml += `    <priority>${route.priority}</priority>\n`;
    xml += '  </url>\n';
  });
  
  // Add dynamic routes (stores, offers, services)
  // Stores
  if (dynamicUrls.stores && dynamicUrls.stores.length > 0) {
    dynamicUrls.stores.forEach(storeId => {
      xml += '  <url>\n';
      xml += `    <loc>${SITE_URL}/store/${storeId}</loc>\n`;
      xml += `    <lastmod>${currentDate}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += '  </url>\n';
    });
  }
  
  // Offers
  if (dynamicUrls.offers && dynamicUrls.offers.length > 0) {
    dynamicUrls.offers.forEach(offerId => {
      xml += '  <url>\n';
      xml += `    <loc>${SITE_URL}/offer/${offerId}</loc>\n`;
      xml += `    <lastmod>${currentDate}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += '  </url>\n';
    });
  }
  
  // Services
  if (dynamicUrls.services && dynamicUrls.services.length > 0) {
    dynamicUrls.services.forEach(serviceId => {
      xml += '  <url>\n';
      xml += `    <loc>${SITE_URL}/service/${serviceId}</loc>\n`;
      xml += `    <lastmod>${currentDate}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += '  </url>\n';
    });
  }
  
  xml += '</urlset>';
  
  return xml;
}

// Example: Fetch dynamic URLs from your API
async function fetchDynamicUrls() {
  // Replace with actual API calls to your backend
  try {
    // Example API endpoints (adjust to your actual API)
    const storesResponse = await fetch(`${SITE_URL}/api/v1/stores`);
    const offersResponse = await fetch(`${SITE_URL}/api/v1/offers`);
    const servicesResponse = await fetch(`${SITE_URL}/api/v1/services`);
    
    const stores = await storesResponse.json();
    const offers = await offersResponse.json();
    const services = await servicesResponse.json();
    
    return {
      stores: stores.data?.map(store => store.id) || [],
      offers: offers.data?.map(offer => offer.id) || [],
      services: services.data?.map(service => service.id) || []
    };
  } catch (error) {
    console.error('Error fetching dynamic URLs:', error);
    return { stores: [], offers: [], services: [] };
  }
}

// Main function
async function main() {
  console.log('Generating sitemap for discoun3ree.com...');
  
  // Fetch dynamic URLs from your API
  const dynamicUrls = await fetchDynamicUrls();
  
  // Generate sitemap XML
  const sitemapXml = generateSitemap(staticRoutes, dynamicUrls);
  
  // Save to file
  fs.writeFileSync('public/sitemap.xml', sitemapXml);
  console.log('✅ Sitemap generated successfully at public/sitemap.xml');
  console.log(`Total URLs: ${staticRoutes.length + 
    (dynamicUrls.stores?.length || 0) + 
    (dynamicUrls.offers?.length || 0) + 
    (dynamicUrls.services?.length || 0)}`);
}

// If running as standalone script
if (require.main === module) {
  main().catch(console.error);
}

// Export for use in build scripts
module.exports = { generateSitemap, staticRoutes, SITE_URL };