export type AuthConfig = { url: string; key: string };
export function callbackParameters(url: URL) {
  return new URLSearchParams(`${url.search.slice(1)}&${url.hash.slice(1)}`);
}

export async function recoverySession(params: URLSearchParams, config: AuthConfig, request: typeof fetch = fetch) {
  if (!config.url || !config.key) throw new Error('Password recovery is temporarily unavailable. Please try again later.');
  if (params.has('error') || params.has('error_code')) throw new Error('This link has expired or has already been used. Request a new link in HomeFitly.');
  const type = params.get('type');
  if (!type || !['recovery', 'signup', 'email', 'magiclink'].includes(type)) throw new Error('Open the full link from your HomeFitly email to continue.');
  let token = params.get('access_token');
  if (params.has('token_hash')) {
    const response = await request(`${config.url}/auth/v1/verify`, {
      method: 'POST', headers: { apikey: config.key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ token_hash: params.get('token_hash'), type }),
    });
    if (!response.ok) throw new Error('This link has expired or has already been used. Request a new link in HomeFitly.');
    token = (await response.json()).access_token;
  }
  if (!token) throw new Error('This link is incomplete. Request a new link in HomeFitly.');
  const response = await request(`${config.url}/auth/v1/user`, { headers: { apikey: config.key, Authorization: `Bearer ${token}` } });
  if (!response.ok) throw new Error('This link has expired. Request a new link in HomeFitly.');
  return { token, recovery: type === 'recovery' };
}

export async function changePassword(password: string, confirmation: string, token: string, config: AuthConfig, request: typeof fetch = fetch) {
  if (password.length < 8) throw new Error('Use at least 8 characters for your new password.');
  if (password !== confirmation) throw new Error('The passwords do not match.');
  const response = await request(`${config.url}/auth/v1/user`, {
    method: 'PUT', headers: { apikey: config.key, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  if (!response.ok) throw new Error(response.status === 401 ? 'This link has expired. Request a new link in HomeFitly.' : 'Your password could not be changed. Try a different password or request a new link.');
}
