import { createFileRoute } from '@tanstack/react-router';
// Public, read-only: returns only the hosting edge's country, never IP or customer data.
export const Route = createFileRoute('/api/public/ad-region')({
  server: { handlers: { GET: ({ request }) => {
    const hosted = process.env['VERCEL'] === '1';
    const candidate = hosted ? request.headers.get('x-vercel-ip-country') : null;
    const country = candidate && /^[A-Z]{2}$/.test(candidate) ? candidate : null;
    return Response.json({ country }, { headers: { 'Cache-Control': 'private, no-store', 'Vary': 'x-vercel-ip-country' } });
  } } },
});
