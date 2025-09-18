const axios = require('axios');

const DONOR_BASE = process.env.DONOR_BASE || 'http://localhost:4000';
const PROFILE_PATHS = ['/api/profile', '/api/users/me', '/api/users/profile']; // common variants
const TIMEOUT = 5000;

function extractUserFromResp(resp) {
  if (!resp || !resp.data) return null;

  if (resp.data.user) return resp.data.user;
  if (resp.data.data && resp.data.data.user) return resp.data.data.user;
  if (resp.data.data && typeof resp.data.data === 'object') return resp.data.data;
  if (typeof resp.data === 'object') {
    if ('user_id' in resp.data || 'id' in resp.data || 'email' in resp.data) return resp.data;
  }

  return null;
}

module.exports = async function authenticateUserWithDonor(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Missing or invalid Authorization header' });
    }

    const token = authHeader.split(' ')[1];
    let lastErr = null;

    for (const path of PROFILE_PATHS) {
      const url = `${DONOR_BASE.replace(/\/$/, '')}${path}`;
      try {
        const resp = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: TIMEOUT,
        });

        const user = extractUserFromResp(resp);

        if (!user) {
          console.warn(`[verifyUserWithDonor] ${url} returned 200 but user object not found. Response keys:`, Object.keys(resp.data || {}));
          lastErr = {
            status: 500,
            message: 'Unexpected user response format from donor service',
            url,
            data: resp.data,
          };
          continue;
        }

        // Normalize user_id
        if (!user.user_id && user.id) user.user_id = user.id;

        if (!user.user_id && !user.email) {
          console.warn('[verifyUserWithDonor] Extracted user object missing essential fields:', user);
        }

        req.user = user;
        req.user._token = token;
        return next();
      } catch (err) {
        if (err.response && err.response.status === 401) {
          console.warn(`[verifyUserWithDonor] 401 Unauthorized at ${url}`);
          return res.status(401).json({ message: 'Invalid user token (unauthorized)' });
        }

        console.warn(`[verifyUserWithDonor] Request to ${url} failed:`, err.message || err);
        lastErr = err;
      }
    }

    // All attempts failed
    console.error('[verifyUserWithDonor] Failed to verify user token from donor service.', {
      lastError: lastErr?.message || lastErr,
      triedUrls: PROFILE_PATHS.map(p => `${DONOR_BASE}${p}`),
    });

    return res.status(500).json({
      message: 'Unable to validate user token with donor service',
      triedEndpoints: PROFILE_PATHS,
      donorServiceUrl: DONOR_BASE,
    });

  } catch (err) {
    console.error('authenticateUserWithDonor unexpected error:', err);
    return res.status(500).json({ message: 'Internal server error during donor token validation' });
  }
};
