import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Role, User } from '../../types';
import { Mail, Lock, ArrowRight, ShieldCheck, AlertTriangle } from 'lucide-react';

interface LoginScreenProps {
  onSuccessLogin: () => void;
  onForgotPasswordClick: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onSuccessLogin, onForgotPasswordClick }) => {
  const { users, loginWithCredentials } = useAuth();
  const [selectedRole, setSelectedRole] = useState<Role>('SUPER_ADMIN');

  // Email & Password Fields (Default Super Admin: Jax@gmail.com / 123456)
  const [emailInput, setEmailInput] = useState('Jax@gmail.com');
  const [passwordInput, setPasswordInput] = useState('123456');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const availableUsers = users.filter(u => u.role === selectedRole);

  const handleRoleChange = (role: Role) => {
    setSelectedRole(role);
    const matched = users.find(u => u.role === role);
    if (matched) {
      setEmailInput(matched.email);
    } else if (role === 'SUPER_ADMIN') {
      setEmailInput('Jax@gmail.com');
    }
    setPasswordInput('123456');
    setErrorMessage(null);
  };

  const handleUserSelect = (user: User) => {
    setEmailInput(user.email);
    setPasswordInput('123456');
    setErrorMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      const res = loginWithCredentials(emailInput, passwordInput, selectedRole);
      setLoading(false);

      if (!res.success) {
        setErrorMessage(res.message || 'Login failed.');
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
          Platform Authentication Portal
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          Super Admin Email: <strong className="text-jaxmart-teal">Jax@gmail.com</strong> | Password: <strong className="text-jaxmart-teal">123456</strong>
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg px-4">
        <div className="bg-white py-8 px-6 shadow-jaxmart-lg rounded-xl border border-gray-200 sm:px-10 space-y-5">

          {/* Step 1: Role Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-jaxmart-mediumBlue mb-2">
              1. Select Role
            </label>
            <div className="grid grid-cols-4 gap-1.5 bg-jaxmart-bg p-1 rounded-lg border border-gray-200">
              {(['SUPER_ADMIN', 'ADMIN', 'CAPTAIN', 'SELLER'] as Role[]).map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => handleRoleChange(r)}
                  className={`py-2 px-1 text-[11px] font-bold rounded text-center transition-all ${selectedRole === r
                    ? 'bg-jaxmart-primary text-white shadow-sm'
                    : 'text-jaxmart-navy hover:bg-gray-200'
                    }`}
                >
                  {r.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Select Accounts List */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-jaxmart-mediumBlue mb-1.5">
              2. Registered {selectedRole.replace('_', ' ')} Accounts
            </label>
            <div className="space-y-2">
              {availableUsers.map((u) => {
                const isSelected = emailInput.toLowerCase() === u.email.toLowerCase();
                const isActive = u.status === 'ACTIVE';

                return (
                  <div
                    key={u.id}
                    onClick={() => handleUserSelect(u)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${isSelected
                      ? isActive
                        ? 'border-jaxmart-teal bg-teal-50/50 ring-2 ring-jaxmart-teal/20 font-bold'
                        : 'border-jaxmart-error bg-red-50/50 ring-2 ring-jaxmart-error/20 font-bold'
                      : 'border-gray-200 bg-jaxmart-bg hover:border-gray-300'
                      }`}
                  >
                    <div className="flex items-center space-x-3">
                      <img src={u.avatarUrl} alt="" className="w-8 h-8 rounded-full border" />
                      <div>
                        <div className="text-xs font-bold text-jaxmart-navy">
                          {u.name}
                        </div>
                        <div className="text-[10px] text-gray-500">{u.email}</div>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-jaxmart-error'
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
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl space-y-2 text-xs text-jaxmart-error">
              <div className="flex items-start space-x-2 font-bold">
                <AlertTriangle className="w-4 h-4 text-jaxmart-error shrink-0 mt-0.5" />
                <span>Authentication Error</span>
              </div>
              <p className="text-gray-700 leading-relaxed">{errorMessage}</p>
            </div>
          )}

          {/* FORM: Registered Email & Password */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-gray-100">

            {/* Field 1: Email */}
            <div>
              <label className="block text-xs font-bold text-jaxmart-navy mb-1">
                Registered Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-jaxmart-bg border border-gray-300 rounded-lg text-xs font-bold text-jaxmart-navy focus:ring-2 focus:ring-jaxmart-primary/20"
                  placeholder="Jax@gmail.com"
                />
              </div>
            </div>

            {/* Field 2: Password */}
            <div>
              <label className="block text-xs font-bold text-jaxmart-navy mb-1">
                Registered Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-jaxmart-bg border border-gray-300 rounded-lg text-xs font-bold text-jaxmart-navy"
                  placeholder="••••••••••••"
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
                <span>Authenticating Credentials...</span>
              ) : (
                <>
                  <span>Sign In as {selectedRole.replace('_', ' ')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-gray-400 flex items-center justify-center space-x-1">
            <ShieldCheck className="w-4 h-4 text-jaxmart-teal" />
            <span>Super Admin: <strong>Jax@gmail.com</strong> | Password: <strong>123456</strong></span>
          </div>

        </div>
      </div>
    </div>
  );
};
