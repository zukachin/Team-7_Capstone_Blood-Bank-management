// src/middlewares/verifyUserWithDonor.js
const axios = require('axios');
const DONOR_BASE = process.env.DONOR_BASE || 'http://localhost:4000';
const PROFILE_PATHS = ['/api/profile', '/api/users/me', '/api/users/profile']; // try common variants
const TIMEOUT = 5000;

function extractUserFromResp(resp) {
  // Accept many shapes:
  // { user: {...} }, { data: { user: {...} } }, { data: {...} }, resp.data (direct user)
  if (!resp || !resp.data) return null;
  if (resp.data.user) return resp.data.user;
  if (resp.data.data && resp.data.data.user) return resp.data.data.user;
  if (resp.data.data && typeof resp.data.data === 'object') return resp.data.data;
  // sometimes API returns user directly in data
  if (typeof resp.data === 'object') {
    // If resp.data contains user_id or id, treat as user object
    if ('user_id' in resp.data || 'id' in resp.data || 'email' in resp.data) return resp.data;
  }
  return null;
}

module.exports = async function authenticateUserWithDonor(req, res, next) {
  try {
    const a = req.headers.authorization;
    if (!a || !a.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Missing user token' });
    }
    const token = a.split(' ')[1];

    let lastErr = null;
    for (const p of PROFILE_PATHS) {
      const url = `${DONOR_BASE.replace(/\/$/, '')}${p}`;
      try {
        const resp = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: TIMEOUT
        });

        const user = extractUserFromResp(resp);
        if (!user) {
          // log for debugging, but try next path
          console.warn(`[verifyUserWithDonor] ${url} returned 200 but no user shape found. resp.data keys:`, Object.keys(resp.data || {}));
          lastErr = { status: 500, message: 'Donor returned unexpected response shape', details: resp.data };
          continue;
        }

        // we have a user object — ensure it contains an id
        if (!('user_id' in user) && !('id' in user) && !('email' in user)) {
          console.warn('[verifyUserWithDonor] user object missing user_id/id/email, keys:', Object.keys(user));
          // still attach and continue; downstream code may use `user.user_id` — prefer user.user_id if present
        }

        // normalize: ensure user_id exists (try id -> user_id)
        if (!user.user_id && user.id) user.user_id = user.id;

        req.user = user;
        req.user._token = token;
        return next();
      } catch (err) {
        // If donor returned 401, stop and report invalid token
        if (err.response && err.response.status === 401) {
          console.warn(`[verifyUserWithDonor] ${url} returned 401 for token`);
          return res.status(401).json({ message: 'Invalid user token' });
        }
        // log and try next candidate endpoint
        console.warn(`[verifyUserWithDonor] request to ${url} failed:`, err.message || err);
        lastErr = err;
        continue;
      }
    } // end for

    // if we reach here, all attempts failed
    console.error('[verifyUserWithDonor] All profile endpoints failed. Last error:', lastErr && lastErr.message ? lastErr.message : lastErr);
    return res.status(500).json({ message: 'Failed to validate user token with donor service' });
  } catch (err) {
    console.error('authenticateUserWithDonor unexpected error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
