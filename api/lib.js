export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function validateBody(body) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) return false;
    for (const [dateKey, habits] of Object.entries(body)) {
        if (!DATE_RE.test(dateKey)) {
            if (dateKey === '_habits') {
                if (!Array.isArray(habits)) return false;
                for (const h of habits) {
                    if (!h.id || typeof h.id !== 'string') return false;
                    if (!h.label || typeof h.label !== 'string') return false;
                    if (!h.emoji || typeof h.emoji !== 'string') return false;
                }
            } else {
                return false;
            }
        } else {
            if (typeof habits !== 'object' || habits === null) return false;
            for (const [, val] of Object.entries(habits)) {
                if (typeof val !== 'boolean') return false;
            }
        }
    }
    return true;
}

export function getUserId(req) {
    const sessionCookie = (req.headers.cookie || '').split(';')
        .map(c => c.trim())
        .find(c => c.startsWith('session='));
    if (sessionCookie) {
        try {
            const payload = JSON.parse(atob(sessionCookie.split('=')[1]));
            if (payload.sub && payload.exp > Date.now() / 1000) return payload.sub;
        } catch {}
    }
    return req.query.user || 'default';
}