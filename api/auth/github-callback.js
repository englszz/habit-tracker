export default async function handler(req, res) {
    const { code, state } = req.query;

    const cookieState = (req.headers.cookie || '').split(';')
        .map(c => c.trim())
        .find(c => c.startsWith('gh_oauth_state='));

    if (!code || !state || !cookieState || cookieState.split('=')[1] !== state) {
        return res.redirect(302, '/?error=invalid_state');
    }

    try {
        const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code,
            }),
        });

        const tokenData = await tokenRes.json();
        if (!tokenData.access_token) {
            return res.redirect(302, '/?error=token_exchange_failed');
        }

        const userRes = await fetch('https://api.github.com/user', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });
        const user = await userRes.json();

        const payload = {
            sub: String(user.id),
            login: user.login,
            name: user.name || user.login,
            avatar: user.avatar_url,
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
        };

        const session = btoa(JSON.stringify(payload));
        const sessionCookie = `session=${session}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`;
        const clearCookie = 'gh_oauth_state=; Path=/; HttpOnly; Max-Age=0';

        res.setHeader('Set-Cookie', [sessionCookie, clearCookie]);
        res.redirect(302, '/');
    } catch (error) {
        console.error('Auth callback error:', error);
        return res.redirect(302, '/?error=auth_failed');
    }
}