export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const state = crypto.randomUUID();
    const cookie = `gh_oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`;
    res.setHeader('Set-Cookie', cookie);

    const params = new URLSearchParams({
        client_id: process.env.GITHUB_CLIENT_ID,
        scope: 'read:user',
        state,
    });

    res.redirect(302, `https://github.com/login/oauth/authorize?${params}`);
}