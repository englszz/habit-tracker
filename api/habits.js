import { Redis } from '@upstash/redis';

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const userId = req.query.user || 'default';
    const key = `habits:${userId}`;

    try {
        if (req.method === 'GET') {
            const data = await redis.get(key);
            return res.status(200).json(data || {});
        }

        if (req.method === 'POST' || req.method === 'PUT') {
            const body = req.body;
            const existing = (await redis.get(key)) || {};
            const updated = { ...existing, ...body };
            await redis.set(key, updated);
            return res.status(200).json({ ok: true, data: updated });
        }

        if (req.method === 'DELETE') {
            await redis.del(key);
            return res.status(200).json({ ok: true });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}