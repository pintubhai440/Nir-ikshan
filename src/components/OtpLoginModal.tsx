import React, { useState, useEffect } from 'react';
import { ShieldCheck, User, CheckCircle2, AlertCircle, X, RefreshCw, KeyRound, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLanguage } from '../context/LanguageContext';

interface OtpLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (userData: { name: string; phone: string }) => void;
}

export const OtpLoginModal: React.FC<OtpLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const { t } = useLanguage();
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState('4402');
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let timer: any;
    if (step === 'otp' && resendTimer > 0) {
      timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendTimer]);

  if (!isOpen) return null;

  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setError('');
    // Generate random 4-digit OTP with default fallback
    const randomCode = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(randomCode);
    setResendTimer(30);
    setStep('otp');
    setOtp(['', '', '', '']);
  };

  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) {
      val = val.slice(-1);
    }
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    // Auto-focus next input
    if (val && index < 3) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleAutoFillOtp = () => {
    const digits = generatedOtp.split('');
    setOtp(digits);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const enteredOtp = otp.join('');
    // Reliable verification with dummy fallback (accepts generated code, 4402, 1234, or any 4 digit code)
    if (enteredOtp.length === 4) {
      setTimeout(() => {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
        onLoginSuccess({
          name: name.trim() || t('verifiedCitizen'),
          phone: phone.trim() || '9848012345',
        });
        setIsSubmitting(false);
        onClose();
        // Reset
        setStep('details');
        setName('');
        setPhone('');
        setOtp(['', '', '', '']);
      }, 400);
    } else {
      setIsSubmitting(false);
      setError('Please enter the 4-digit verification code');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-[#03045E] via-[#0077B6] to-[#00B4D8] text-white p-6 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none"></div>

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-white shadow-md">
                <ShieldCheck className="w-6 h-6 text-[#CAF0F8]" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-white tracking-tight flex items-center gap-1.5">
                  <span>{t('loginTitle')}</span>
                </h3>
                <p className="text-xs text-[#CAF0F8] font-medium">
                  {t('loginSubtitle')}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {step === 'details' ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {t('fullNameLabel')} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder={t('fullNamePlaceholder')}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0077B6] focus:bg-white transition-all text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {t('mobileNumberLabel')} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-500 font-mono">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:border-[#0077B6] focus:bg-white transition-all text-slate-800"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {t('mobileNumberHint')}
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-[#0077B6] hover:bg-[#03045E] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <KeyRound className="w-4 h-4 text-[#CAF0F8]" />
                  <span>{t('btnSendOtp')}</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              {/* OTP Sent Banner with Auto-fill helper */}
              <div className="bg-[#CAF0F8]/50 border border-[#00B4D8]/30 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">
                    {t('otpSentTo')} <strong className="text-slate-900">+91 {phone}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setStep('details')}
                    className="text-[#0077B6] hover:underline font-bold text-[11px] cursor-pointer"
                  >
                    {t('changeNumber')}
                  </button>
                </div>

                <div className="flex items-center justify-between bg-white border border-[#00B4D8]/40 p-2 rounded-xl">
                  <span className="text-xs font-mono font-bold text-[#03045E] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#0077B6]" />
                    <span>{t('demoOtpText')} <strong>{generatedOtp}</strong></span>
                  </span>
                  <button
                    type="button"
                    onClick={handleAutoFillOtp}
                    className="px-2.5 py-1 bg-[#0077B6] hover:bg-[#03045E] text-white text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    {t('btnAutoFill')}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block text-center mb-2">
                  {t('enterOtpLabel')}
                </label>
                <div className="flex justify-center gap-3">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-input-${idx}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className="w-12 h-14 text-center text-xl font-mono font-bold bg-slate-50 border-2 border-slate-200 focus:border-[#0077B6] focus:bg-white rounded-xl focus:outline-none transition-all text-slate-900 shadow-xs"
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-[#0077B6] hover:bg-[#03045E] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#CAF0F8]" />
                  <span>{isSubmitting ? '...' : t('btnVerifyProceed')}</span>
                </button>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{t('didntReceiveOtp')}</span>
                  {resendTimer > 0 ? (
                    <span className="font-mono text-slate-400">{t('resendOtpIn')} {resendTimer}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        const randomCode = Math.floor(1000 + Math.random() * 9000).toString();
                        setGeneratedOtp(randomCode);
                        setResendTimer(30);
                      }}
                      className="text-[#0077B6] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>{t('btnResendOtp')}</span>
                    </button>
                  )}
                </div>
              </div>
            </form>
          )}

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>{t('secureNodeText')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
