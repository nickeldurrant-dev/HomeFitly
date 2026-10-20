import { describe, it, expect, vi } from 'vitest';
import { callbackParameters, recoverySession, changePassword } from './recovery';
const config = { url: 'https://auth.example', key: 'public-test-key' };
const response = (body: object, status = 200) => new Response(JSON.stringify(body), { status });

describe('account recovery', () => {
  it('reads a recovery token from the email fragment', async () => {
    const params = callbackParameters(new URL('https://homefitly.com/auth/callback#access_token=test&type=recovery'));
    const request = vi.fn<typeof fetch>().mockResolvedValue(response({ id: 'account' }));
    await expect(recoverySession(params, config, request)).resolves.toEqual({ token: 'test', recovery: true });
    expect(request.mock.calls[0][1]?.headers).toMatchObject({ Authorization: 'Bearer test' });
  });
  it('verifies token-hash links before showing the form', async () => {
    const params = new URLSearchParams({ token_hash: 'hash', type: 'recovery' });
    const request = vi.fn<typeof fetch>().mockResolvedValueOnce(response({ access_token: 'verified-token' })).mockResolvedValueOnce(response({ id: 'account' }));
    await expect(recoverySession(params, config, request)).resolves.toMatchObject({ token: 'verified-token', recovery: true });
    expect(JSON.parse(String(request.mock.calls[0][1]?.body))).toEqual({ token_hash: 'hash', type: 'recovery' });
  });
  it('handles email confirmation without offering a password reset', async () => {
    const request = vi.fn<typeof fetch>().mockResolvedValue(response({ id: 'account' }));
    await expect(recoverySession(new URLSearchParams('access_token=test&type=signup'), config, request)).resolves.toMatchObject({ recovery: false });
  });
  it('rejects expired, incomplete, and invalid links', async () => {
    const request = vi.fn<typeof fetch>().mockResolvedValue(response({}, 401));
    await expect(recoverySession(new URLSearchParams('error=expired&type=recovery'), config, request)).rejects.toThrow(/expired/);
    await expect(recoverySession(new URLSearchParams('type=recovery'), config, request)).rejects.toThrow(/incomplete/);
    await expect(recoverySession(new URLSearchParams('access_token=test&type=recovery'), config, request)).rejects.toThrow(/expired/);
    expect(request).toHaveBeenCalledTimes(1);
  });
  it('validates matching passwords before sending a request', async () => {
    const request = vi.fn<typeof fetch>();
    await expect(changePassword('short', 'short', 'token', config, request)).rejects.toThrow(/8 characters/);
    await expect(changePassword('long-enough', 'different', 'token', config, request)).rejects.toThrow(/do not match/);
    expect(request).not.toHaveBeenCalled();
  });
  it('updates the password and reports failures honestly', async () => {
    const request = vi.fn<typeof fetch>().mockResolvedValueOnce(response({})).mockResolvedValueOnce(response({}, 500));
    await changePassword('new-password', 'new-password', 'token', config, request);
    expect(request.mock.calls[0][1]?.method).toBe('PUT');
    expect(JSON.parse(String(request.mock.calls[0][1]?.body))).toEqual({ password: 'new-password' });
    await expect(changePassword('new-password', 'new-password', 'token', config, request)).rejects.toThrow(/could not be changed/);
  });
});
