'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { showToast } from '@/lib/toast';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { AuthResponse, LoginResponse, RegisterResponse } from '@/types';
import type { User } from '@/types';

type OtpFormData = { email: string; otp: string };
type PasswordFormData = { email: string; password: string };
type Mode = 'login' | 'register';
type LoginMethod = 'password' | 'code';

const BRAND_NAME = 'Softnex'; // change to your product name
const IS_DEV = process.env.NODE_ENV !== 'production';
const RESEND_SECONDS = 30;
const EMAIL_PATTERN = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

// ─── Copy (Bengali). Edit here only. ─────────────────────

const T = {
  modeLogin: 'লগইন',
  modeRegister: 'নতুন রেজিস্ট্রেশন',
  freeBadge: 'বিনামূল্যে',

  login: {
    title: 'লগইন করুন',
    sub: 'আপনার ড্যাশবোর্ডে ফিরে যেতে ইমেইল ও পাসওয়ার্ড দিন।',
    button: 'লগইন করুন',
    loading: 'লগইন হচ্ছে…',
    useCode: 'পাসওয়ার্ড ছাড়াই, ইমেইলে কোড পাঠিয়ে লগইন করুন',
    usePassword: 'পাসওয়ার্ড দিয়ে লগইন করুন',
    switchText: 'নতুন ব্যবহারকারী?',
    switchLink: 'বিনামূল্যে রেজিস্ট্রেশন করুন',
  },
  loginCode: {
    title: 'ইমেইল কোড দিয়ে লগইন',
    sub: 'আপনার ইমেইলে ৬ সংখ্যার একটি কোড পাঠানো হবে।',
    verifyButton: 'যাচাই করে লগইন করুন',
  },
  register: {
    title: 'বিনামূল্যে রেজিস্ট্রেশন করুন',
    sub: 'ইমেইল দিন, কোড যাচাই করুন, তারপর আপনার অনলাইন দোকান সাজানো শুরু করুন।',
    verifyButton: 'যাচাই করে রেজিস্ট্রেশন সম্পূর্ণ করুন',
    switchText: 'আগে থেকেই অ্যাকাউন্ট আছে?',
    switchLink: 'লগইন করুন',
  },
  otp: {
    title: 'কোড যাচাই করুন',
    sub: 'আপনার ইমেইলে পাঠানো ৬ সংখ্যার কোডটি দিন।',
    sentTo: 'পাঠানো হয়েছে',
    change: 'পরিবর্তন',
    noCode: 'কোড পাননি?',
    resend: 'আবার কোড পাঠান',
    resendIn: (s: number) => `${s} সেকেন্ড পর আবার পাঠান`,
    verifying: 'যাচাই হচ্ছে…',
  },
  sendCode: 'কোড পাঠান',
  sending: 'পাঠানো হচ্ছে…',
  email: 'ইমেইল',
  password: 'পাসওয়ার্ড',
  passwordPlaceholder: 'আপনার পাসওয়ার্ড দিন',
  errors: {
    emailRequired: 'ইমেইল দিন',
    emailInvalid: 'সঠিক ইমেইল দিন',
    passwordRequired: 'পাসওয়ার্ড দিন',
    passwordShort: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে',
    otpRequired: '৬ সংখ্যার কোড দিন',
    otpInvalid: 'কোড ৬ সংখ্যার হতে হবে',
  },
  panel: {
    loginTitle: 'আপনার পুরো দোকান চালান এক ড্যাশবোর্ড থেকে।',
    loginSub:
      'অর্ডার, স্টক আর কাস্টমার সবকিছু একসাথে সিঙ্ক থাকে, তাই আলাদা আলাদা টুলে ঘোরাঘুরি না করে আপনি বিক্রির দিকে মনোযোগ দিতে পারেন।',
    registerTitle: 'বিনামূল্যে শুরু করুন আপনার অনলাইন দোকান।',
    registerSub: 'অর্ডার, স্টক আর কাস্টমার এক জায়গায়। শুরু করতে লাগবে মাত্র তিনটি ধাপ।',
    steps: [
      { title: 'ইমেইল দিন', text: 'আপনার ইমেইলে একটি কোড যাবে।' },
      { title: 'কোড যাচাই করুন', text: 'কোডটি দিলেই অ্যাকাউন্ট তৈরি হবে।' },
      { title: 'দোকান সাজান', text: 'ড্যাশবোর্ডে ঢুকে কাজ শুরু করুন।' },
    ],
    previewTitle: 'আজকের সারসংক্ষেপ',
    previewStats: [
      { label: 'অর্ডার', value: '24' },
      { label: 'কম স্টক', value: '3' },
      { label: 'নতুন কাস্টমার', value: '9' },
    ],
    previewChart: 'এই সপ্তাহের বিক্রি',
  },
};

// ─── Small UI pieces ─────────────────────────────────────

const iconProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

function Spinner() {
  return (
    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function EyeIcon({ off }: { off: boolean }) {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" {...iconProps}>
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
      {off && <path d="M3 3l18 18" />}
    </svg>
  );
}

function LockIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" {...iconProps}>
      <rect x="4" y="11" width="16" height="9" rx="2.5" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function UserPlusIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" {...iconProps}>
      <circle cx="10" cy="8" r="4" />
      <path d="M2.5 20a7.5 7.5 0 0 1 15 0" />
      <path d="M19 8v6M16 11h6" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" {...iconProps}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" {...iconProps} strokeWidth={3}>
      <path d="m5 12 5 5 9-10" />
    </svg>
  );
}

function SubmitButton({ loading, label, loadingLabel }: { loading: boolean; label: string; loadingLabel: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-600 text-base font-semibold text-white shadow-sm shadow-red-600/25 transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-600/25 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading && <Spinner />}
      {loading ? loadingLabel : label}
    </button>
  );
}

const inputClass = (hasError: boolean) =>
  `h-12 w-full rounded-xl border bg-white px-4 text-base text-stone-900 placeholder:text-stone-400 transition focus:outline-none focus:ring-4 ${
    hasError
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/15'
      : 'border-stone-300 hover:border-stone-400 focus:border-red-600 focus:ring-red-600/15'
  }`;

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-sm text-red-600">
      {message}
    </p>
  );
}

/** Six boxes that behave like one field: auto-advance, backspace, paste, autofill. */
function OtpInput({ value, onChange, hasError }: { value: string; onChange: (v: string) => void; hasError: boolean }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const focusBox = (i: number) => refs.current[Math.max(0, Math.min(5, i))]?.focus();

  return (
    <div className="flex justify-between gap-2 sm:gap-3" role="group" aria-label="6-digit code">
      {Array.from({ length: 6 }, (_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={value[i] ?? ''}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={6}
          aria-label={`Digit ${i + 1}`}
          aria-invalid={hasError}
          autoFocus={i === 0}
          onFocus={(e) => {
            if (i > value.length) focusBox(value.length);
            else e.currentTarget.select();
          }}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, '');
            const next = (value.slice(0, i) + digits + value.slice(i + 1)).slice(0, 6);
            onChange(next);
            if (digits) focusBox(i + digits.length);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && !value[i]) focusBox(i - 1);
            if (e.key === 'ArrowLeft') focusBox(i - 1);
            if (e.key === 'ArrowRight') focusBox(i + 1);
          }}
          onPaste={(e) => {
            e.preventDefault();
            const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
            if (!digits) return;
            onChange(digits);
            focusBox(digits.length);
          }}
          className={`h-14 w-full min-w-0 rounded-xl border bg-white text-center text-2xl font-semibold text-stone-900 transition focus:outline-none focus:ring-4 sm:h-16 ${
            hasError
              ? 'border-red-500 focus:ring-red-500/15'
              : 'border-stone-300 focus:border-red-600 focus:ring-red-600/15'
          }`}
        />
      ))}
    </div>
  );
}

/** Illustrative dashboard card for the login side panel. Values are sample UI only. */
function DashboardPreview() {
  const bars = [38, 55, 44, 70, 62, 88, 76];
  return (
    <div className="hidden w-full max-w-md rounded-2xl bg-white p-5 text-stone-900 shadow-2xl shadow-red-950/40 xl:block">
      <p className="text-sm font-semibold text-stone-700">{T.panel.previewTitle}</p>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {T.panel.previewStats.map((s) => (
          <div key={s.label} className="rounded-xl bg-stone-50 px-3 py-3">
            <p className="text-2xl font-bold text-stone-900">{s.value}</p>
            <p className="mt-0.5 text-xs text-stone-500">{s.label}</p>
          </div>
        ))}
      </div>
      <p className="mt-5 text-xs font-medium text-stone-500">{T.panel.previewChart}</p>
      <div className="mt-3 flex h-20 items-end gap-2">
        {bars.map((h, i) => (
          <div
            key={i}
            style={{ height: `${h}%` }}
            className={`flex-1 rounded-md ${i === bars.length - 2 ? 'bg-red-600' : 'bg-red-100'}`}
          />
        ))}
      </div>
    </div>
  );
}

/** The three registration steps. `current` is 0-based and follows the real form step. */
function RegisterSteps({ current }: { current: number }) {
  return (
    <ol className="space-y-6">
      {T.panel.steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={s.title} className="flex gap-4">
            <span
              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition ${
                done
                  ? 'bg-white text-red-700'
                  : active
                    ? 'bg-white text-red-700 ring-4 ring-white/25'
                    : 'border border-white/40 text-white/70'
              }`}
            >
              {done ? <CheckIcon /> : i + 1}
            </span>
            <div className={active || done ? 'opacity-100' : 'opacity-70'}>
              <p className="text-lg font-semibold leading-snug">{s.title}</p>
              <p className="mt-0.5 text-base leading-relaxed text-red-100">{s.text}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

// ─── Page ────────────────────────────────────────────────

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('login');
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('password');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const router = useRouter();
  const { login } = useAuth();
  const otpForm = useForm<OtpFormData>({ defaultValues: { email: '', otp: '' } });
  const passwordForm = useForm<PasswordFormData>();

  // Landing-page CTAs can link to  /login?mode=register  to open the registration view.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('mode') === 'register') {
      setMode('register');
    }
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const isRegister = mode === 'register';
  const usesCode = isRegister || loginMethod === 'code';

  // Route based on tenant status (shared by every login path)
  const routeAfterLogin = (userData: User) => {
    if (userData.role === 'SUPER_ADMIN') {
      router.push('/dashboard');
    } else if (userData.tenantStatus === 'ACTIVE') {
      router.push('/dashboard');
    } else if (
      userData.tenantStatus === 'PENDING_APPROVAL' &&
      userData.paymentStatus === 'PENDING' &&
      !userData.isPaymentSubmitted
    ) {
      router.push('/payment/submit');
    } else if (userData.tenantStatus === 'PENDING_APPROVAL') {
      router.push('/payment/status');
    } else {
      router.push('/dashboard');
    }
  };

  // ─── OTP flow (registration and email-code login) ─────

  const handleEmailSubmit = async (data: OtpFormData) => {
    setLoading(true);
    try {
      const response = await api.post<RegisterResponse>('/auth/register', { email: data.email });

      if (response.data.success) {
        setEmail(data.email);
        setStep('otp');
        setCooldown(RESEND_SECONDS);
        showToast.success(IS_DEV ? 'OTP sent! Check console or terminal for the code.' : 'Code sent. Check your email.');
      } else {
        showToast.error(response.data.message || 'Failed to send OTP');
      }
    } catch (error: any) {
      showToast.error(error.response?.data?.message || 'Failed to send OTP. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (data: OtpFormData) => {
    setLoading(true);
    try {
      const response = await api.post<AuthResponse>(
        '/auth/verify',
        { email, otp: data.otp },
        { validateStatus: (status) => status < 500 }
      );

      if (response.data.success && response.data.data?.token) {
        const userData = response.data.data.user;
        login(response.data.data.token, userData);
        showToast.success(isRegister ? 'Registration successful!' : 'Login successful!');
        routeAfterLogin(userData);
      } else {
        showToast.error(response.data.message || 'Invalid or expired OTP. Please try again.');
      }
    } catch (error: any) {
      showToast.error(error.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const response = await api.post('/auth/resend-otp', { email }, { validateStatus: (status) => status < 500 });
      if (response.data.success) {
        setCooldown(RESEND_SECONDS);
        showToast.success(IS_DEV ? 'OTP resent! Check the terminal for the new code.' : 'New code sent. Check your email.');
      } else {
        showToast.error(response.data.message || 'Failed to resend OTP');
      }
    } catch (error: any) {
      showToast.error(error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setEmail('');
    otpForm.reset();
  };

  // ─── Password login ────────────────────────────────────

  const handlePasswordLogin = async (data: PasswordFormData) => {
    setLoading(true);
    try {
      const response = await api.post<LoginResponse>(
        '/auth/login-password',
        { email: data.email, password: data.password },
        { validateStatus: (status) => status < 500 }
      );

      if (response.data.success && response.data.data?.token) {
        const userData = response.data.data.user;
        login(response.data.data.token, userData);
        showToast.success(`Welcome ${userData.role}!`);
        routeAfterLogin(userData);
      } else {
        showToast.error(response.data.message || 'Invalid email or password.');
      }
    } catch (error: any) {
      showToast.error(error.response?.data?.message || 'Login failed. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Switching ─────────────────────────────────────────

  const resetAll = () => {
    setStep('email');
    setEmail('');
    setCooldown(0);
    otpForm.reset();
    passwordForm.reset();
  };

  const switchMode = (next: Mode) => {
    if (next === mode) return;
    setMode(next);
    setLoginMethod('password');
    resetAll();
  };

  const switchLoginMethod = (next: LoginMethod) => {
    setLoginMethod(next);
    resetAll();
  };

  // ─── Derived copy ──────────────────────────────────────

  const inOtpStep = usesCode && step === 'otp';

  const heading = inOtpStep ? T.otp.title : isRegister ? T.register.title : loginMethod === 'code' ? T.loginCode.title : T.login.title;
  const subheading = inOtpStep ? T.otp.sub : isRegister ? T.register.sub : loginMethod === 'code' ? T.loginCode.sub : T.login.sub;
  const verifyLabel = isRegister ? T.register.verifyButton : T.loginCode.verifyButton;
  const registerStepIndex = step === 'otp' ? 1 : 0;

  // ─── Render ────────────────────────────────────────────

  return (
    <div className="grid min-h-screen bg-stone-50 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      {/* ── Brand panel (changes with mode) ── */}
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-red-700 via-red-700 to-red-900 text-white lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-14">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            maskImage: 'linear-gradient(to bottom right, black, transparent 70%)',
            WebkitMaskImage: 'linear-gradient(to bottom right, black, transparent 70%)',
          }}
        />

        <div className="relative flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg font-bold text-red-700">
            {BRAND_NAME.charAt(0)}
          </span>
          <span className="text-xl font-semibold tracking-tight">{BRAND_NAME}</span>
        </div>

        <div className="relative max-w-md">
          {isRegister ? (
            <>
              <h2 className="text-4xl font-bold leading-[1.35] xl:text-[2.6rem]">{T.panel.registerTitle}</h2>
              <p className="mt-5 text-lg leading-relaxed text-red-100">{T.panel.registerSub}</p>
              <div className="mt-10">
                <RegisterSteps current={registerStepIndex} />
              </div>
            </>
          ) : (
            <>
              <h2 className="text-4xl font-bold leading-[1.35] xl:text-[2.6rem]">{T.panel.loginTitle}</h2>
              <p className="mt-5 text-lg leading-relaxed text-red-100">{T.panel.loginSub}</p>
              <div className="mt-10">
                <DashboardPreview />
              </div>
            </>
          )}
        </div>

        <p className="relative text-sm text-red-200">
          © {new Date().getFullYear()} {BRAND_NAME}
        </p>
      </aside>

      {/* ── Form side ── */}
      <main className="flex flex-col">
        {/* Mobile brand bar */}
        <div className="flex items-center gap-3 px-6 pt-8 lg:hidden">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600 text-base font-bold text-white">
            {BRAND_NAME.charAt(0)}
          </span>
          <span className="text-lg font-semibold tracking-tight text-stone-900">{BRAND_NAME}</span>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-[27rem]">
            {/* ── Mode switch: Login vs Register ── */}
            <div role="tablist" aria-label="Login or register" className="relative grid grid-cols-2 rounded-xl bg-stone-200/70 p-1">
              <span
                aria-hidden="true"
                className={`absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-lg bg-white shadow-sm transition-transform duration-200 ease-out ${
                  isRegister ? 'translate-x-full' : 'translate-x-0'
                }`}
              />
              {(['login', 'register'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  role="tab"
                  aria-selected={mode === m}
                  onClick={() => switchMode(m)}
                  className={`relative z-10 h-11 rounded-lg text-[0.95rem] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-600/20 ${
                    mode === m ? 'text-red-700' : 'text-stone-500 hover:text-stone-700'
                  }`}
                >
                  {m === 'login' ? T.modeLogin : T.modeRegister}
                </button>
              ))}
            </div>

            {/* Mobile-only registration progress */}
            {isRegister && (
              <div className="mt-5 flex gap-2 lg:hidden" aria-hidden="true">
                {[0, 1].map((i) => (
                  <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= registerStepIndex ? 'bg-red-600' : 'bg-stone-200'}`} />
                ))}
              </div>
            )}

            {/* ── Heading ── */}
            <div className="mt-8 flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600 ring-1 ring-red-100">
                {inOtpStep ? <MailIcon /> : isRegister ? <UserPlusIcon /> : <LockIcon />}
              </span>
              <div className="min-w-0">
                {isRegister && (
                  <span className="mb-1.5 inline-block rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-semibold text-white">
                    {T.freeBadge}
                  </span>
                )}
                <h1 className="text-2xl font-bold leading-snug text-stone-900 sm:text-[1.7rem]">{heading}</h1>
              </div>
            </div>
            <p className="mt-3 text-base leading-relaxed text-stone-600">{subheading}</p>

            <div className="mt-8">
              {/* ── Password login ── */}
              {!usesCode && (
                <form onSubmit={passwordForm.handleSubmit(handlePasswordLogin)} className="space-y-5" noValidate>
                  <div>
                    <label htmlFor="p-email" className="mb-2 block text-sm font-medium text-stone-800">
                      {T.email}
                    </label>
                    <input
                      {...passwordForm.register('email', {
                        required: T.errors.emailRequired,
                        pattern: { value: EMAIL_PATTERN, message: T.errors.emailInvalid },
                      })}
                      type="email"
                      id="p-email"
                      autoComplete="email"
                      aria-invalid={!!passwordForm.formState.errors.email}
                      aria-describedby="p-email-error"
                      className={inputClass(!!passwordForm.formState.errors.email)}
                      placeholder="you@example.com"
                    />
                    <FieldError id="p-email-error" message={passwordForm.formState.errors.email?.message} />
                  </div>

                  <div>
                    <label htmlFor="password" className="mb-2 block text-sm font-medium text-stone-800">
                      {T.password}
                    </label>
                    <div className="relative">
                      <input
                        {...passwordForm.register('password', {
                          required: T.errors.passwordRequired,
                          minLength: { value: 6, message: T.errors.passwordShort },
                        })}
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        autoComplete="current-password"
                        aria-invalid={!!passwordForm.formState.errors.password}
                        aria-describedby="password-error"
                        className={`${inputClass(!!passwordForm.formState.errors.password)} pr-12`}
                        placeholder={T.passwordPlaceholder}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-stone-400 transition hover:text-stone-700 focus-visible:text-red-600 focus-visible:outline-none"
                      >
                        <EyeIcon off={showPassword} />
                      </button>
                    </div>
                    <FieldError id="password-error" message={passwordForm.formState.errors.password?.message} />
                  </div>

                  <SubmitButton loading={loading} label={T.login.button} loadingLabel={T.login.loading} />

                  <button
                    type="button"
                    onClick={() => switchLoginMethod('code')}
                    className="w-full rounded-lg py-1 text-center text-sm font-semibold text-red-600 transition hover:text-red-700 focus-visible:underline focus-visible:outline-none"
                  >
                    {T.login.useCode}
                  </button>
                </form>
              )}

              {/* ── Code flow: email step ── */}
              {usesCode && step === 'email' && (
                <form onSubmit={otpForm.handleSubmit(handleEmailSubmit)} className="space-y-5" noValidate>
                  <div>
                    <label htmlFor="o-email" className="mb-2 block text-sm font-medium text-stone-800">
                      {T.email}
                    </label>
                    <input
                      {...otpForm.register('email', {
                        required: T.errors.emailRequired,
                        pattern: { value: EMAIL_PATTERN, message: T.errors.emailInvalid },
                      })}
                      type="email"
                      id="o-email"
                      autoComplete="email"
                      aria-invalid={!!otpForm.formState.errors.email}
                      aria-describedby="o-email-error"
                      className={inputClass(!!otpForm.formState.errors.email)}
                      placeholder="you@example.com"
                    />
                    <FieldError id="o-email-error" message={otpForm.formState.errors.email?.message} />
                  </div>

                  <SubmitButton loading={loading} label={T.sendCode} loadingLabel={T.sending} />

                  {!isRegister && (
                    <button
                      type="button"
                      onClick={() => switchLoginMethod('password')}
                      className="w-full rounded-lg py-1 text-center text-sm font-semibold text-red-600 transition hover:text-red-700 focus-visible:underline focus-visible:outline-none"
                    >
                      {T.login.usePassword}
                    </button>
                  )}
                </form>
              )}

              {/* ── Code flow: verify step ── */}
              {usesCode && step === 'otp' && (
                <form onSubmit={otpForm.handleSubmit(handleOtpSubmit)} className="space-y-6" noValidate>
                  <div>
                    <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white px-4 py-3">
                      <span className="min-w-0 truncate text-sm text-stone-600">
                        {T.otp.sentTo}: <span className="font-medium text-stone-900">{email}</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleBackToEmail}
                        className="shrink-0 text-sm font-semibold text-red-600 transition hover:text-red-700 focus-visible:underline focus-visible:outline-none"
                      >
                        {T.otp.change}
                      </button>
                    </div>

                    <Controller
                      control={otpForm.control}
                      name="otp"
                      rules={{
                        required: T.errors.otpRequired,
                        pattern: { value: /^[0-9]{6}$/, message: T.errors.otpInvalid },
                      }}
                      render={({ field, fieldState }) => (
                        <>
                          <OtpInput value={field.value ?? ''} onChange={field.onChange} hasError={!!fieldState.error} />
                          <FieldError id="otp-error" message={fieldState.error?.message} />
                        </>
                      )}
                    />

                    {IS_DEV && (
                      <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                        Dev: OTP কোডটি backend চলা terminal এ দেখুন
                      </p>
                    )}
                  </div>

                  <SubmitButton loading={loading} label={verifyLabel} loadingLabel={T.otp.verifying} />

                  <p className="text-center text-sm text-stone-600">
                    {T.otp.noCode}{' '}
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={loading || cooldown > 0}
                      className="font-semibold text-red-600 transition hover:text-red-700 focus-visible:underline focus-visible:outline-none disabled:cursor-not-allowed disabled:text-stone-400"
                    >
                      {cooldown > 0 ? T.otp.resendIn(cooldown) : T.otp.resend}
                    </button>
                  </p>
                </form>
              )}
            </div>

            {/* ── Bottom switch link ── */}
            {!inOtpStep && (
              <p className="mt-8 border-t border-stone-200 pt-6 text-center text-sm text-stone-600">
                {isRegister ? T.register.switchText : T.login.switchText}{' '}
                <button
                  type="button"
                  onClick={() => switchMode(isRegister ? 'login' : 'register')}
                  className="font-semibold text-red-600 transition hover:text-red-700 focus-visible:underline focus-visible:outline-none"
                >
                  {isRegister ? T.register.switchLink : T.login.switchLink}
                </button>
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}