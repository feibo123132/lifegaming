type LoginMode = 'code' | 'password';

interface LoginCredentialEnv {
  VITE_DEFAULT_LOGIN_EMAIL?: string;
}

export interface DefaultLoginCredentials {
  email: string;
}

export const LAST_LOGIN_EMAIL_STORAGE_KEY = 'design_life_user_email';

const cleanEmailValue = (value: unknown): string =>
  typeof value === 'string' ? value.trim().toLowerCase() : '';

export const getRememberedLoginEmail = (
  storage: Pick<Storage, 'getItem'>
): string => {
  try {
    return cleanEmailValue(storage.getItem(LAST_LOGIN_EMAIL_STORAGE_KEY));
  } catch {
    return '';
  }
};

export const rememberLoginEmail = (
  storage: Pick<Storage, 'setItem'>,
  email: string
): string => {
  const normalizedEmail = cleanEmailValue(email);
  if (!normalizedEmail) return '';

  try {
    storage.setItem(LAST_LOGIN_EMAIL_STORAGE_KEY, normalizedEmail);
  } catch {
    // Login should still succeed when browser storage is unavailable.
  }

  return normalizedEmail;
};

export const getDefaultLoginCredentials = (
  env: LoginCredentialEnv,
  rememberedEmail = ''
): DefaultLoginCredentials => ({
  email: cleanEmailValue(env.VITE_DEFAULT_LOGIN_EMAIL) || cleanEmailValue(rememberedEmail)
});

export const getInitialLoginMode = (credentials: DefaultLoginCredentials): LoginMode =>
  credentials.email ? 'password' : 'code';
