import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Flame, KeyRound, Loader2, Lock, Mail, ShieldCheck, Sparkles, Star, Trophy } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import {
  getDefaultLoginCredentials,
  getInitialLoginMode,
  getRememberedLoginEmail
} from '../lib/defaultLoginCredentials';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

type LoginMode = 'code' | 'password' | 'setup';

interface LocationState {
  from?: {
    pathname?: string;
  };
}

const inputClassName =
  'w-full pl-12 pr-4 py-3.5 rounded-pop bg-white border-4 border-pop-black font-bold text-pop-black placeholder:text-pop-black/35 shadow-pop-sm focus:outline-none focus:shadow-pop focus:-translate-x-0.5 focus:-translate-y-0.5 transition-all disabled:bg-pop-black/5 disabled:text-pop-black/40';

const primaryButtonClassName =
  'w-full py-3.5 bg-pop-red text-white rounded-pop border-4 border-pop-black font-black shadow-pop transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-pop-hover active:translate-x-0.5 active:translate-y-0.5 active:shadow-pop-active';

const ghostButtonClassName =
  'w-full py-2.5 text-pop-black/70 text-sm font-black hover:text-pop-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as LocationState | null)?.from?.pathname || '/';
  const rememberedEmail = getRememberedLoginEmail(window.localStorage);
  const defaultCredentials = getDefaultLoginCredentials(import.meta.env, rememberedEmail);
  const {
    user,
    sendCode,
    loginWithCode,
    loginWithPassword,
    requestPasswordSetup,
    confirmPasswordSetup,
    isLoading,
    error
  } = useAuthStore();

  const [mode, setMode] = useState<LoginMode>(() => getInitialLoginMode(defaultCredentials));
  const [email, setEmail] = useState(defaultCredentials.email);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [setupCode, setSetupCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [setupCodeSent, setSetupCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [setupCountdown, setSetupCountdown] = useState(0);
  const emailFormId = mode === 'password'
    ? 'password-login-form'
    : mode === 'code'
      ? 'code-login-form'
      : undefined;

  useEffect(() => {
    if (user) {
      navigate(redirectTo, { replace: true });
    }
  }, [navigate, redirectTo, user]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    if (setupCountdown <= 0) return;
    const timer = setTimeout(() => setSetupCountdown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [setupCountdown]);

  useEffect(() => {
    setMsg('');
  }, [mode]);

  const validateEmail = () => {
    if (!email) {
      setMsg('请输入邮箱地址');
      return false;
    }
    if (!EMAIL_REGEX.test(email)) {
      setMsg('请输入有效的邮箱地址');
      return false;
    }
    return true;
  };

  const handleSendCode = async () => {
    setMsg('');
    if (!validateEmail()) return;

    const success = await sendCode(email);
    if (success) {
      setCodeSent(true);
      setCountdown(60);
      setMsg('验证码已发送，请查收邮件');
    }
  };

  const handleCodeLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setMsg('');
    if (!validateEmail()) return;
    if (!code) {
      setMsg('请输入验证码');
      return;
    }

    try {
      await loginWithCode(email, code);
      navigate(redirectTo, { replace: true });
    } catch {
      // error is handled in store
    }
  };

  const handlePasswordLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setMsg('');
    if (!validateEmail()) return;
    if (!password) {
      setMsg('请输入密码');
      return;
    }

    try {
      await loginWithPassword(email, password);
      navigate(redirectTo, { replace: true });
    } catch {
      // error is handled in store
    }
  };

  const handleSendSetupCode = async () => {
    setMsg('');
    if (!validateEmail()) return;

    const success = await requestPasswordSetup(email);
    if (success) {
      setSetupCodeSent(true);
      setSetupCountdown(60);
      setMsg('密码设置验证码已发送，请查收邮件');
    }
  };

  const handleSetupPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setMsg('');

    if (!setupCode) {
      setMsg('请输入验证码');
      return;
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setMsg(`密码长度至少 ${MIN_PASSWORD_LENGTH} 位`);
      return;
    }
    if (newPassword !== confirmPassword) {
      setMsg('两次输入的密码不一致');
      return;
    }

    try {
      const result = await confirmPasswordSetup(email, setupCode, newPassword);
      if (result.autoLoggedIn) {
        setMsg('密码设置成功，已自动登录');
        navigate(redirectTo, { replace: true });
        return;
      }

      setMode('code');
      setPassword('');
      setSetupCode('');
      setNewPassword('');
      setConfirmPassword('');
      setSetupCodeSent(false);
      setSetupCountdown(0);
      setMsg('密码已设置成功，请先使用验证码登录。');
    } catch {
      // error is handled in store
    }
  };

  return (
    <div className="min-h-screen bg-pop-yellow text-pop-black relative overflow-hidden">
      <div className="absolute inset-0 pop-dots opacity-[0.08]" />
      <div className="absolute -left-16 top-20 h-40 w-40 rotate-12 rounded-pop-xl border-4 border-pop-black bg-pop-red/70 shadow-pop hidden md:block" />
      <div className="absolute -right-10 bottom-16 h-32 w-32 -rotate-12 rounded-full border-4 border-pop-black bg-pop-blue/80 shadow-pop hidden md:block" />

      <div className="relative min-h-screen flex items-center justify-center px-4 py-8 lg:px-8">
        <div className="w-full max-w-6xl grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <section className="space-y-6">
            <div className="inline-flex items-center gap-3 rounded-pop border-4 border-pop-black bg-white px-4 py-3 shadow-pop">
              <div className="pop-icon-box bg-pop-red h-14 w-14 rounded-full">
                <Flame className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black leading-none">辛苦了，老己</h1>
                <p className="mt-1 text-sm font-black text-pop-black/60">爱自己，是终身美丽的开始</p>
              </div>
            </div>

            <div className="rounded-pop-xl border-4 border-pop-black bg-white p-5 shadow-pop-lg md:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="pop-icon-box bg-pop-yellow h-14 w-14">
                  <Trophy className="h-7 w-7 text-pop-black" />
                </div>
                <div>
                  <p className="text-sm font-black text-pop-black/60">个人身份认证</p>
                  <h2 className="text-2xl font-black">进入你的自律存档</h2>
                </div>
              </div>
              <p className="text-base font-bold leading-relaxed text-pop-black/75">
                完成登录后，任务、积分、复盘和身份状态会进入同一套游戏化界面。今天也从确认身份开始，把进度条往前推一点。
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  { icon: ShieldCheck, label: '邮箱认证', color: 'bg-pop-green' },
                  { icon: Sparkles, label: '积分存档', color: 'bg-pop-red' },
                  { icon: Star, label: '连续打卡', color: 'bg-pop-yellow' }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="rounded-pop border-4 border-pop-black bg-white p-3 shadow-pop-sm">
                      <div className={`mb-2 flex h-10 w-10 items-center justify-center rounded-full border-3 border-pop-black ${item.color}`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <p className="text-sm font-black">{item.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="rounded-pop-xl border-4 border-pop-black bg-white p-5 shadow-pop-lg md:p-8">
            <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border-3 border-pop-black bg-pop-yellow px-3 py-1 text-sm font-black">
                  <KeyRound className="h-4 w-4" />
                  LOGIN
                </div>
                <h2 className="text-3xl font-black leading-tight">
            {mode === 'code' && '验证码登录'}
            {mode === 'password' && '账号密码登录'}
            {mode === 'setup' && '设置/重置密码'}
                </h2>
                <p className="mt-2 text-sm font-bold text-pop-black/60">
            {mode === 'code' && '无需记忆密码，使用邮箱验证码快捷登录'}
            {mode === 'password' && '使用邮箱和密码直接登录'}
            {mode === 'setup' && '通过邮箱验证码设置或重置密码'}
                </p>
              </div>
              <div className="pop-icon-box bg-pop-red h-16 w-16 rounded-full shrink-0">
                <Flame className="h-8 w-8 text-white" />
              </div>
            </div>

            <div className="mb-6 grid grid-cols-3 gap-2 rounded-pop border-4 border-pop-black bg-pop-yellow p-1 shadow-pop-sm">
          <button
            type="button"
            onClick={() => setMode('code')}
                className={`rounded-pop py-2.5 text-sm font-black transition-all ${
                  mode === 'code' ? 'bg-pop-black text-pop-yellow shadow-pop-sm' : 'text-pop-black hover:bg-white'
            }`}
          >
            验证码
          </button>
          <button
            type="button"
            onClick={() => setMode('password')}
                className={`rounded-pop py-2.5 text-sm font-black transition-all ${
                  mode === 'password' ? 'bg-pop-black text-pop-yellow shadow-pop-sm' : 'text-pop-black hover:bg-white'
            }`}
          >
            密码
          </button>
          <button
            type="button"
            onClick={() => setMode('setup')}
                className={`rounded-pop py-2.5 text-sm font-black transition-all ${
                  mode === 'setup' ? 'bg-pop-black text-pop-yellow shadow-pop-sm' : 'text-pop-black hover:bg-white'
            }`}
          >
            设置密码
          </button>
        </div>

        {(mode === 'code' || mode === 'password') && (
              <div className="mb-5">
                <label className="mb-2 block text-sm font-black text-pop-black">邮箱地址</label>
            <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-pop-black/55" size={20} />
              <input
                type="email"
                name="username"
                autoComplete="username"
                form={emailFormId}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                    className={inputClassName}
                placeholder="your-email@example.com"
                disabled={mode === 'code' && codeSent && countdown > 0}
              />
            </div>
          </div>
        )}

        {mode === 'code' && (
          <form id="code-login-form" onSubmit={handleCodeLogin} className="space-y-6">
            {codeSent && (
              <div>
                    <label className="mb-2 block text-sm font-black text-pop-black">验证码</label>
                <input
                  type="text"
                  value={code}
                  onChange={(event) => setCode(event.target.value.trim())}
                      className="w-full rounded-pop border-4 border-pop-black bg-white px-4 py-3.5 text-center font-mono text-lg font-black tracking-widest shadow-pop-sm transition-all placeholder:text-pop-black/35 focus:-translate-x-0.5 focus:-translate-y-0.5 focus:outline-none focus:shadow-pop"
                  placeholder="输入6位验证码"
                  maxLength={6}
                />
              </div>
            )}

            {(error || msg) && (
                  <div className={`rounded-pop border-4 border-pop-black p-3 text-center text-sm font-black shadow-pop-sm ${error ? 'bg-pop-red text-white' : 'bg-pop-blue text-white'}`}>
                {error || msg}
              </div>
            )}

            <div className="space-y-3">
              {!codeSent ? (
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={isLoading}
                      className={primaryButtonClassName}
                >
                  {isLoading && <Loader2 className="animate-spin" size={18} />}
                  发送验证码
                </button>
              ) : (
                <>
                  <button
                    type="submit"
                    disabled={isLoading}
                        className={primaryButtonClassName}
                  >
                    {isLoading && <Loader2 className="animate-spin" size={18} />}
                    确认登录
                  </button>
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={countdown > 0 || isLoading}
                        className={ghostButtonClassName}
                  >
                    {countdown > 0 ? `${countdown} 秒后可重新发送` : '没有收到？重新发送'}
                  </button>
                </>
              )}
            </div>
          </form>
        )}

        {mode === 'password' && (
          <form id="password-login-form" onSubmit={handlePasswordLogin} className="space-y-6">
            <div>
                  <label className="mb-2 block text-sm font-black text-pop-black">密码</label>
              <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-pop-black/55" size={20} />
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                      className={inputClassName}
                  placeholder="请输入密码"
                  autoComplete="current-password"
                />
              </div>
            </div>

            {(error || msg) && (
                  <div className={`rounded-pop border-4 border-pop-black p-3 text-center text-sm font-black shadow-pop-sm ${error ? 'bg-pop-red text-white' : 'bg-pop-blue text-white'}`}>
                {error || msg}
              </div>
            )}

            <div className="space-y-3">
              <button
                type="submit"
                disabled={isLoading}
                    className={primaryButtonClassName}
              >
                {isLoading && <Loader2 className="animate-spin" size={18} />}
                登录
              </button>
              <button
                type="button"
                onClick={() => setMode('setup')}
                    className={ghostButtonClassName}
              >
                忘记密码？去设置/重置
              </button>
            </div>
          </form>
        )}

        {mode === 'setup' && (
          <form onSubmit={handleSetupPassword} className="space-y-6">
            <div>
                  <label className="mb-2 block text-sm font-black text-pop-black">邮箱地址</label>
              <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-pop-black/55" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                      className={inputClassName}
                  placeholder="your-email@example.com"
                  disabled={setupCodeSent && setupCountdown > 0}
                />
              </div>
            </div>

            {setupCodeSent && (
              <>
                <div>
                      <label className="mb-2 block text-sm font-black text-pop-black">验证码</label>
                  <input
                    type="text"
                    value={setupCode}
                    onChange={(event) => setSetupCode(event.target.value.trim())}
                        className="w-full rounded-pop border-4 border-pop-black bg-white px-4 py-3.5 text-center font-mono text-lg font-black tracking-widest shadow-pop-sm transition-all placeholder:text-pop-black/35 focus:-translate-x-0.5 focus:-translate-y-0.5 focus:outline-none focus:shadow-pop"
                    placeholder="输入验证码"
                  />
                </div>
                <div>
                      <label className="mb-2 block text-sm font-black text-pop-black">新密码</label>
                  <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-pop-black/55" size={20} />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                          className={inputClassName}
                      placeholder={`至少 ${MIN_PASSWORD_LENGTH} 位`}
                    />
                  </div>
                </div>
                <div>
                      <label className="mb-2 block text-sm font-black text-pop-black">确认密码</label>
                  <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-pop-black/55" size={20} />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                          className={inputClassName}
                      placeholder="请再次输入新密码"
                    />
                  </div>
                </div>
              </>
            )}

            {(error || msg) && (
                  <div className={`rounded-pop border-4 border-pop-black p-3 text-center text-sm font-black shadow-pop-sm ${error ? 'bg-pop-red text-white' : 'bg-pop-blue text-white'}`}>
                {error || msg}
              </div>
            )}

            <div className="space-y-3">
              {!setupCodeSent ? (
                <button
                  type="button"
                  onClick={handleSendSetupCode}
                  disabled={isLoading}
                      className={primaryButtonClassName}
                >
                  {isLoading && <Loader2 className="animate-spin" size={18} />}
                  发送设置验证码
                </button>
              ) : (
                <>
                  <button
                    type="submit"
                    disabled={isLoading}
                        className={primaryButtonClassName}
                  >
                    {isLoading && <Loader2 className="animate-spin" size={18} />}
                    确认设置密码
                  </button>
                  <button
                    type="button"
                    onClick={handleSendSetupCode}
                    disabled={setupCountdown > 0 || isLoading}
                        className={ghostButtonClassName}
                  >
                    {setupCountdown > 0 ? `${setupCountdown} 秒后可重新发送` : '没有收到？重新发送'}
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => setMode('password')}
                    className={ghostButtonClassName}
              >
                返回密码登录
              </button>
            </div>
          </form>
        )}

            <div className="mt-6 rounded-pop border-3 border-pop-black bg-pop-yellow px-4 py-3 text-center text-xs font-black text-pop-black shadow-pop-sm">
              首次登录可先用验证码，再到“设置密码”完成绑定
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
