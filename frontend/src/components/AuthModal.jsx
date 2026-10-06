import React, { useState } from 'react';
import { X, Shield, Phone, Mail, ArrowRight, Check, KeyRound, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AuthModal = ({ isOpen, onClose }) => {
  const { loginGoogle, loginPhone, loginDealer } = useAuth();

  const [activeTab, setActiveTab] = useState('customer'); // 'customer' | 'dealer'
  const [customerMode, setCustomerMode] = useState('phone'); // 'phone' | 'google'

  // Phone OTP state
  const [phone, setPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  // Dealer login state
  const [dealerEmail, setDealerEmail] = useState('dealer@wholesale.com');
  const [dealerPassword, setDealerPassword] = useState('dealer123');
  const [dealerPin, setDealerPin] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setError(null);
    setOtpSent(true);
    // In demo mode pre-fill or guide
    setOtpCode('123456');
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode) {
      setError('Please enter the 6-digit OTP');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await loginPhone({
        phone: phone.trim(),
        name: customerName.trim() || `Customer-${phone.slice(-4)}`,
        otp: otpCode
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      // In production, signInWithPopup(auth, googleProvider) produces email and displayName.
      // Here we provide instant seamless Google Auth token generation with fallback:
      await loginGoogle({
        email: 'rahul.wholesale@example.com',
        name: 'Rahul Sharma',
        firebaseUid: 'google_uid_demo_98765'
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Google Sign-In failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDealerLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await loginDealer({
        email: dealerEmail,
        password: dealerPassword,
        pin: dealerPin
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Dealer authentication failed');
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Logins
  const handleDemoCustomer = async (name, phoneNum) => {
    setLoading(true);
    try {
      await loginPhone({
        name,
        phone: phoneNum,
        otp: '123456'
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoDealer = async () => {
    setLoading(true);
    try {
      await loginDealer({
        email: 'dealer@wholesale.com',
        password: 'dealer123'
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Dealer login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-extrabold text-lg text-slate-900">
              {activeTab === 'customer' ? 'Customer Sign In' : 'Dealer Portal Access'}
            </h3>
            <p className="text-xs text-slate-500">
              {activeTab === 'customer'
                ? 'Login via Google or Mobile OTP to place wholesale orders'
                : 'Authorized personnel and warehouse access'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 text-xs font-semibold">
          <button
            onClick={() => { setActiveTab('customer'); setError(null); }}
            className={`flex-1 py-3 text-center border-b-2 transition-all ${
              activeTab === 'customer'
                ? 'border-brand-600 text-brand-700 bg-brand-50/40'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Customer Login (FR-1)
          </button>
          <button
            onClick={() => { setActiveTab('dealer'); setError(null); }}
            className={`flex-1 py-3 text-center border-b-2 transition-all ${
              activeTab === 'dealer'
                ? 'border-dealer-600 text-dealer-700 bg-dealer-50/40'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Dealer Login (FR-6)
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'customer' ? (
            /* Customer Auth Mode */
            <div className="space-y-4">
              {/* Google Sign-in */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-2.5 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-2xs transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27a7.22 7.22 0 0 1 0-4.54V6.58H1.25a11.96 11.96 0 0 0 0 10.84l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-3 text-slate-400 text-[11px] uppercase font-semibold">Or Mobile OTP</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* Mobile OTP Form */}
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Business / Customer Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-brand-500 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mobile Number (10 digits) *
                    </label>
                    <div className="flex rounded-xl overflow-hidden border border-slate-200 bg-slate-50 focus-within:border-brand-500 focus-within:bg-white">
                      <span className="px-3 py-2 text-xs font-semibold text-slate-500 bg-slate-100 border-r border-slate-200 flex items-center">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        maxLength={10}
                        placeholder="9876543210"
                        className="w-full px-3 py-2 bg-transparent text-xs sm:text-sm outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm"
                  >
                    Send Verification OTP
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-3">
                  <div className="p-3 bg-brand-50 border border-brand-200 rounded-xl text-xs text-brand-900">
                    OTP sent to <span className="font-bold">+91 {phone}</span>. (Demo code: <span className="font-mono font-bold">123456</span>)
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Enter 6-digit OTP</label>
                    <input
                      type="text"
                      required
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      maxLength={6}
                      className="w-full text-center tracking-widest font-mono font-bold text-lg px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 outline-none"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="px-3 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-200"
                    >
                      Change Number
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm"
                    >
                      {loading ? 'Verifying...' : 'Verify OTP & Log In'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* Dealer Auth Mode */
            <form onSubmit={handleDealerLogin} className="space-y-3">
              <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-900 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-sky-600 shrink-0" />
                <span>Dealer Access grants product catalog editing and live Google Sheets monitoring.</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Dealer Email</label>
                <input
                  type="email"
                  value={dealerEmail}
                  onChange={(e) => setDealerEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-dealer-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  value={dealerPassword}
                  onChange={(e) => setDealerPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-dealer-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Quick PIN (Optional)</label>
                <input
                  type="password"
                  value={dealerPin}
                  onChange={(e) => setDealerPin(e.target.value)}
                  placeholder="e.g. 123456"
                  maxLength={6}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-dealer-500 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-dealer-900 hover:bg-dealer-800 text-white rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm"
              >
                {loading ? 'Authenticating...' : 'Enter Dealer Portal'}
              </button>
            </form>
          )}

          {/* Quick Demo Test Logins */}
          <div className="pt-3 border-t border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Quick Demo Accounts (1-Click Test)
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleDemoCustomer('Rahul (Delhi)', '9811223344')}
                className="p-2 text-left bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all"
              >
                <p className="font-bold text-slate-800 truncate">Rahul (Delhi)</p>
                <p className="text-[10px] text-slate-500">Customer Demo</p>
              </button>
              <button
                type="button"
                onClick={() => handleDemoCustomer('Jatin (Panipat)', '9988776655')}
                className="p-2 text-left bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all"
              >
                <p className="font-bold text-slate-800 truncate">Jatin (Panipat)</p>
                <p className="text-[10px] text-slate-500">Customer Demo</p>
              </button>
            </div>
            <button
              type="button"
              onClick={handleDemoDealer}
              className="mt-2 w-full p-2 text-center bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-900 font-bold rounded-xl text-xs transition-all"
            >
              Log In as Wholesale Dealer (Jatin Gumber)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
