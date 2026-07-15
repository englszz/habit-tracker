import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const userId = req.query.user || 'default';

    try {
        if (req.method === 'GET') {
            const data = await kv.get(`habits:${userId}`);
            return res.status(200).json(data || {});
        }

        if (req.method === 'POST' || req.method === 'PUT') {
            const body = req.body;
            const existing = (await kv.get(`habits:${userId}`)) || {};
            const updated = { ...existing, ...body };
            await kv.set(`habits:${userId}`, updated);
            return res.status(200).json({ ok: true, data: updated });
        }

        if (req.method === 'DELETE') {
            const { date } = req.query;
            if (date) {
                const existing = (await kv.get(`habits:${userId}`)) || {};
                delete existing[date];
                await kv.set(`habits:${userId}`, existing);
            } else {
                await kv.del(`habits:${userId}`);
            }
            return res.status(200).json({ ok: true });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}