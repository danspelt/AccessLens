import { describe, expect, it } from 'vitest';
import {
  SSO_PROVIDER_ID,
  buildSsoProvider,
  isSsoConfigured,
  isVerifiedSsoProfile,
  safeCallbackPath,
  ssoDisplayName,
} from './sso';

const env = {
  SSO_ISSUER: 'https://example-abc.zitadel.cloud',
  SSO_CLIENT_ID: 'client-id',
  SSO_CLIENT_SECRET: 'client-secret',
};

describe('isSsoConfigured', () => {
  it('requires issuer, client id and client secret', () => {
    expect(isSsoConfigured(env)).toBe(true);
    expect(isSsoConfigured({ ...env, SSO_ISSUER: '' })).toBe(false);
    expect(isSsoConfigured({ ...env, SSO_CLIENT_ID: undefined })).toBe(false);
    expect(isSsoConfigured({ ...env, SSO_CLIENT_SECRET: undefined })).toBe(false);
  });
});

describe('ssoDisplayName', () => {
  it('uses SSO_DISPLAY_NAME or a generic label', () => {
    expect(ssoDisplayName({ SSO_DISPLAY_NAME: ' Dan ID ' })).toBe('Dan ID');
    expect(ssoDisplayName({})).toBe('single sign-on');
  });
});

describe('isVerifiedSsoProfile', () => {
  it('accepts a profile with sub and a verified email', () => {
    expect(isVerifiedSsoProfile({ sub: '123', email: 'a@b.ca', email_verified: true })).toBe(true);
  });

  it('rejects unverified, missing-email, missing-sub and non-object profiles', () => {
    expect(isVerifiedSsoProfile({ sub: '123', email: 'a@b.ca', email_verified: false })).toBe(false);
    expect(isVerifiedSsoProfile({ sub: '123', email: 'a@b.ca', email_verified: 'true' })).toBe(false);
    expect(isVerifiedSsoProfile({ sub: '123', email_verified: true })).toBe(false);
    expect(isVerifiedSsoProfile({ email: 'a@b.ca', email_verified: true })).toBe(false);
    expect(isVerifiedSsoProfile(null)).toBe(false);
    expect(isVerifiedSsoProfile(undefined)).toBe(false);
  });
});

describe('buildSsoProvider', () => {
  const provider = buildSsoProvider(env);

  it('is an OIDC provider with the stable callback id', () => {
    expect(provider.id).toBe(SSO_PROVIDER_ID);
    expect(provider.type).toBe('oidc');
    expect(provider.issuer).toBe(env.SSO_ISSUER);
  });

  it('keeps PKCE, state and nonce checks', () => {
    expect(provider.checks).toEqual(expect.arrayContaining(['pkce', 'state', 'nonce']));
  });

  it('never links accounts by email alone', () => {
    expect(provider.allowDangerousEmailAccountLinking).toBeFalsy();
  });

  it('keys the user by sub and normalizes email', () => {
    const user = provider.profile!(
      { sub: 'sub-1', email: 'Dan@Example.CA', email_verified: true, name: 'Dan' },
      {}
    );
    expect(user).toMatchObject({ id: 'sub-1', email: 'dan@example.ca', name: 'Dan' });
  });

  it('does not persist OAuth tokens', () => {
    const stored = provider.account!({
      access_token: 'at',
      refresh_token: 'rt',
      id_token: 'it',
      token_type: 'bearer',
    });
    expect(stored).toEqual({});
  });
});

describe('safeCallbackPath', () => {
  it('keeps same-origin relative paths', () => {
    expect(safeCallbackPath('/places/abc?x=1')).toBe('/places/abc?x=1');
  });

  it('rejects external, protocol-relative and backslash URLs', () => {
    expect(safeCallbackPath('https://attacker.example')).toBe('/dashboard');
    expect(safeCallbackPath('//attacker.example')).toBe('/dashboard');
    expect(safeCallbackPath('/\\attacker.example')).toBe('/dashboard');
    expect(safeCallbackPath('javascript:alert(1)')).toBe('/dashboard');
  });

  it('falls back when empty', () => {
    expect(safeCallbackPath(null)).toBe('/dashboard');
    expect(safeCallbackPath('', '/settings')).toBe('/settings');
  });
});
