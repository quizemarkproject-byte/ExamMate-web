export const environment = {
    production: false,
    // Allow build-time override via BACKEND_URL, otherwise default to localhost for local development
    backend_url: process.env['BACKEND_URL'] || '',
}