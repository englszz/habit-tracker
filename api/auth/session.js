export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'DELETE') {
        res.setHeader('Set-Cookie', 'session=; Path=/; HttpOnly; Max-Age=0');
        return res.status(200).json({ ok: true });
    }

    const sessionCookie = (req.headers.cookie || '').split(';')
        .map(c => c.trim())
        .find(c => c.startsWith('session='));

    if (!sessionCookie) {
        return res.status(200).json({ logged_in: false });
    }

    try {
        const payload = JSON.parse(atob(sessionCookie.split('=')[1]));
        if (payload.exp < Date.now() / 1000) {
            return res.status(200).json({ logged_in: false });
        }
        return res.status(200).json({
            logged_in: true,
            user: {
                id: payload.sub,
                login: payload.login,
                name: payload.name,
                avatar: payload.avatar,
            },
        });
    } catch {
        return res.status(200).json({ logged_in: false });
    }
}