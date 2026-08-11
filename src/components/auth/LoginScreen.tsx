import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Role, User } from '../../types';
import { Mail, KeyRound, ArrowRight, ShieldCheck, AlertTriangle, CheckCircle2, Lock } from 'lucide-react';

interface LoginScreenProps {
  onSuccessLogin: () => void;
  onForgotPasswordClick: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onSuccessLogin, onForgotPasswordClick }) => {
  const { users, verifyAdminOtp, sendAdminOtp } = useAuth();
  const [selectedRole, setSelectedRole] = useState<Role>('ADMIN');
  const [selectedUser, setSelectedUser] = useState<User>(
    users.find(u => u.role === 'ADMIN') || users[0]
  );
  
  // Both Email ID & OTP fields together on screen as requested
  const [emailInput, setEmailInput] = useState('jaxmart@gmail.com');
  const [otpInput, setOtpInput] = useState('123456');
  
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const availableUsers = users.filter(u => u.role === selectedRole);

  const handleRoleChange = (role: Role) => {
    setSelectedRole(role);
    const matched = users.find(u => u.role === role);
    if (matched) {
      setSelectedUser(matched);
      setEmailInput(matched.email);
    }
    setErrorMessage(null);
  };

  const handleUserSelect = (userId: string) => {
    const matched = users.find(u => u.id === userId);
    if (matched) {
      setSelectedUser(matched);
      setEmailInput(matched.email);
      setErrorMessage(null);
    }
  };

  // Verify Email ID & OTP together
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      // Initialize OTP session in backend
      sendAdminOtp(emailInput);
      
      // Verify both Email ID and OTP 123456
      const res = verifyAdminOtp(emailInput, otpInput);
      setLoading(false);

      if (!res.success) {
        setErrorMessage(res.message || 'Login failed. Invalid Email ID or OTP.');
      } else {
        onSuccessLogin();
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-jaxmart-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      
      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-jaxmart-primary flex items-center justify-center text-white font-bold text-2xl shadow-jaxmart-card">
            J
          </div>
          <span className="text-3xl font-black text-jaxmart-navy tracking-tight">
            Jaxmart<span className="text-jaxmart-teal">.</span>
          </span>
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-jaxmart-navy">
          Admin Portal Authentication
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          Sign in with Email ID & 6-Digit OTP (Default: <strong className="text-jaxmart-teal">123456</strong>)
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg px-4">
        <div className="bg-white py-8 px-6 shadow-jaxmart-lg rounded-xl border border-gray-200 sm:px-10 space-y-5">
          
          {/* Step 1: Select Role Tab */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-jaxmart-mediumBlue mb-2">
              1. Select Authentication Role
            </label>
            <div className="grid grid-cols-4 gap-1.5 bg-jaxmart-bg p-1 rounded-lg border border-gray-200">
              {(['SUPER_ADMIN', 'ADMIN', 'CAPTAIN', 'SELLER'] as Role[]).map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => handleRoleChange(r)}
                  className={`py-2 px-1 text-[11px] font-bold rounded text-center transition-all ${
                    selectedRole === r
                      ? 'bg-jaxmart-primary text-white shadow-sm'
                      : 'text-jaxmart-navy hover:bg-gray-200'
                  }`}
                >
                  {r.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Select Specific Account */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-jaxmart-mediumBlue mb-1.5">
              2. Select Target Account
            </label>
            <div className="space-y-2">
              {availableUsers.map((u) => {
                const isSelected = selectedUser.id === u.id;
                const isActive = u.status === 'ACTIVE';

                return (
                  <div
                    key={u.id}
                    onClick={() => handleUserSelect(u.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? isActive
                          ? 'border-jaxmart-teal bg-teal-50/50 ring-2 ring-jaxmart-teal/20'
                          : 'border-jaxmart-error bg-red-50/50 ring-2 ring-jaxmart-error/20'
                        : 'border-gray-200 bg-jaxmart-bg hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <img src={u.avatarUrl} alt="" className="w-8 h-8 rounded-full border" />
                      <div>
                        <div className="text-xs font-bold text-jaxmart-navy flex items-center space-x-2">
                          <span>{u.name}</span>
                          {u.companyName && <span className="text-[10px] text-gray-500 font-normal">({u.companyName})</span>}
                        </div>
                        <div className="text-[10px] text-gray-500">{u.email}</div>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-jaxmart-error'
                    }`}>
                      {isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl space-y-1.5 text-xs text-jaxmart-error">
              <div className="flex items-center space-x-2 font-bold">
                <AlertTriangle className="w-4 h-4 text-jaxmart-error shrink-0" />
                <span>Authentication Failed</span>
              </div>
              <p className="text-gray-700 leading-relaxed">{errorMessage}</p>

              <div className="pt-2 border-t border-red-200 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (selectedRole === 'CAPTAIN') handleRoleChange('ADMIN');
                    if (selectedRole === 'SELLER') handleRoleChange('CAPTAIN');
                  }}
                  className="px-3 py-1.5 bg-jaxmart-primary text-white rounded text-[11px] font-bold hover:bg-jaxmart-navy"
                >
                  Switch to Admin to Activate Account
                </button>
              </div>
            </div>
          )}

          {/* SINGLE COMBINED FORM: Email ID + OTP Fields Together */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-gray-100">
            
            {/* Field 1: Admin Email ID */}
            <div>
              <label className="block text-xs font-bold text-jaxmart-navy mb-1">
                Admin Email ID *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-jaxmart-bg border border-gray-300 rounded-lg text-xs font-bold text-jaxmart-navy focus:ring-2 focus:ring-jaxmart-primary/20"
                  placeholder="jaxmart@gmail.com"
                />
              </div>
            </div>

            {/* Field 2: 6-Digit OTP */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-jaxmart-navy">
                  6-Digit OTP Code *
                </label>
                <span className="text-[11px] text-jaxmart-teal font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  Default OTP: 123456
                </span>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-jaxmart-bg border border-gray-300 rounded-lg text-sm font-mono font-bold text-jaxmart-navy tracking-widest text-center"
                  placeholder="123456"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center space-x-2 py-3 px-4 rounded-lg shadow-sm text-xs font-bold text-white bg-jaxmart-primary hover:bg-jaxmart-navy transition-all disabled:opacity-50"
            >
              {loading ? (
                <span>Verifying Email & OTP...</span>
              ) : (
                <>
                  <span>Sign In with Email ID & OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-gray-400 flex items-center justify-center space-x-1">
            <ShieldCheck className="w-4 h-4 text-jaxmart-teal" />
            <span>Default Email: <strong>jaxmart@gmail.com</strong> | OTP: <strong>123456</strong></span>
          </div>

        </div>
      </div>
    </div>
  );
};
