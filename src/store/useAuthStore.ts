import { create } from 'zustand';
import { auth, ENV_ID } from '../lib/cloudbase';
import {
  PASSWORD_LOGIN_DISABLED_MESSAGE,
  getErrorMessage,
  isPasswordLoginDisabledError
} from '../lib/authErrors';

interface User {
  uid: string;
  email?: string;
  isAnonymous?: boolean;
}

interface ConfirmPasswordSetupResult {
  autoLoggedIn: boolean;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  verificationContext: any | null;
  initAuth: () => Promise<void>;
  sendCode: (email: string) => Promise<boolean>;
  loginWithCode: (email: string, code: string) => Promise<void>;
  loginWithPassword: (email: string, password: string) => Promise<void>;
  requestPasswordSetup: (email: string) => Promise<boolean>;
  confirmPasswordSetup: (email: string, code: string, newPassword: string) => Promise<ConfirmPasswordSetupResult>;
  logout: () => Promise<void>;
}

const USER_EMAIL_STORAGE_KEY = 'design_life_user_email';

const syncUserToStore = (set: (state: Partial<AuthState>) => void, loginState: any) => {
  if (loginState?.user?.email) {
    localStorage.setItem(USER_EMAIL_STORAGE_KEY, loginState.user.email);
  } else {
    localStorage.removeItem(USER_EMAIL_STORAGE_KEY);
  }

  set({
    user: loginState?.user
      ? {
          uid: loginState.user.uid,
          email: loginState.user.email,
          isAnonymous: loginState.user.isAnonymous
        }
      : null
  });
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  error: null,
  verificationContext: null,

  initAuth: async () => {
    if (!ENV_ID) {
      set({ isLoading: false });
      return;
    }

    auth.onLoginStateChanged((loginState: any) => {
      if (loginState?.user) {
        syncUserToStore(set, loginState);
        set({ isLoading: false });
        return;
      }

      localStorage.removeItem(USER_EMAIL_STORAGE_KEY);
      set({ user: null, isLoading: false });
    });

    try {
      const loginState: any = await auth.getLoginState();
      if (loginState?.user) {
        syncUserToStore(set, loginState);
      }
      set({ isLoading: false });
    } catch (err) {
      console.error('Init auth failed:', err);
      set({ isLoading: false });
    }
  },

  sendCode: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await auth.getVerification({ email });
      if (!response) return false;

      set({ verificationContext: response });
      return true;
    } catch (err: any) {
      console.error('Send code failed:', err);
      set({ error: getErrorMessage(err, '发送验证码失败，请稍后重试') });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  loginWithCode: async (email: string, code: string) => {
    set({ isLoading: true, error: null });

    const context = get().verificationContext;
    if (!context) {
      set({ error: '验证上下文丢失，请重新发送验证码', isLoading: false });
      return;
    }

    try {
      await auth.signInWithEmail({
        email,
        verificationCode: code,
        verificationInfo: context
      });

      set({ verificationContext: null });

      const loginState: any = await auth.getLoginState();
      if (!loginState?.user) {
        throw new Error('登录状态未生效，请稍后重试');
      }
      syncUserToStore(set, loginState);
    } catch (err: any) {
      console.error('Login with code failed:', err);
      set({ error: getErrorMessage(err, '登录失败，验证码可能已过期') });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  loginWithPassword: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const result: any = await auth.signInWithPassword({ email, password });
      if (result?.error) {
        throw new Error(getErrorMessage(result.error, '密码登录失败，请检查账号和密码'));
      }

      const loginState: any = await auth.getLoginState();
      if (!loginState?.user) {
        throw new Error('登录状态未生效，请稍后重试');
      }
      syncUserToStore(set, loginState);
    } catch (err: any) {
      console.error('Password login failed:', err);
      if (isPasswordLoginDisabledError(err)) {
        set({ error: PASSWORD_LOGIN_DISABLED_MESSAGE });
        throw new Error(PASSWORD_LOGIN_DISABLED_MESSAGE);
      }
      set({ error: getErrorMessage(err, '密码登录失败，请检查账号和密码') });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  requestPasswordSetup: async (email: string) => {
    return get().sendCode(email);
  },

  confirmPasswordSetup: async (email: string, code: string, newPassword: string) => {
    set({ isLoading: true, error: null });

    const context = get().verificationContext;
    if (!context) {
      set({ error: '验证上下文丢失，请重新发送验证码', isLoading: false });
      throw new Error('missing verification context');
    }

    let passwordResetDone = false;
    try {
      const verifyRes: any = await auth.verify({
        verification_id: context.verification_id,
        verification_code: code
      } as any);
      const verificationToken = verifyRes?.verification_token;
      if (!verificationToken) {
        throw new Error('验证码校验失败，请重试');
      }

      await auth.resetPassword({
        email,
        new_password: newPassword,
        verification_token: verificationToken
      } as any);
      passwordResetDone = true;

      try {
        const signInRes: any = await auth.signInWithPassword({ email, password: newPassword });
        if (signInRes?.error) {
          throw signInRes.error;
        }
      } catch (signInErr: any) {
        if (isPasswordLoginDisabledError(signInErr)) {
          set({ verificationContext: null, error: null });
          return { autoLoggedIn: false };
        }
        throw signInErr;
      }

      const loginState: any = await auth.getLoginState();
      if (!loginState?.user) {
        throw new Error('密码设置成功，但自动登录未生效，请手动登录');
      }

      set({ verificationContext: null });
      syncUserToStore(set, loginState);
      return { autoLoggedIn: true };
    } catch (err: any) {
      console.error('Confirm password setup failed:', err);
      if (isPasswordLoginDisabledError(err)) {
        const message = passwordResetDone
          ? '密码已设置成功，但当前环境未开启密码登录。请先使用邮箱验证码登录。'
          : PASSWORD_LOGIN_DISABLED_MESSAGE;
        set({ error: message });
        throw new Error(message);
      }
      set({ error: getErrorMessage(err, '设置密码失败，请确认验证码和密码后重试') });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      await auth.signOut();
      localStorage.removeItem(USER_EMAIL_STORAGE_KEY);
      set({ user: null });
    } catch (err) {
      console.error('Logout failed:', err);
    }
  }
}));
