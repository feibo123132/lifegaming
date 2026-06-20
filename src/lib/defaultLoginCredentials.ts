type LoginMode = 'code' | 'password';

interface LoginCredentialEnv {
  VITE_DEFAULT_LOGIN_EMAIL?: string;
  VITE_DEFAULT_LOGIN_PASSWORD?: string;
}

export interface DefaultLoginCredentials {
  email: string;
  password: string;
}

const cleanCredentialValue = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : '';

export const getDefaultLoginCredentials = (env: LoginCredentialEnv): DefaultLoginCredentials => ({
  email: cleanCredentialValue(env.VITE_DEFAULT_LOGIN_EMAIL),
  password: cleanCredentialValue(env.VITE_DEFAULT_LOGIN_PASSWORD)
});

export const getInitialLoginMode = (credentials: DefaultLoginCredentials): LoginMode =>
  credentials.password ? 'password' : 'code';
