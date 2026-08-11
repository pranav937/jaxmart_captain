import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Store, UserCheck, CheckCircle2, ArrowRight, ArrowLeft, Mail, Lock, User, AlertTriangle } from 'lucide-react';

interface RegisterScreenProps {
  onSuccessRegister: () => void;
  onNavigateLogin: () => void;
  onNavigateLanding: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onSuccessRegister,
  onNavigateLogin,
  onNavigateLanding,
}) => {
  const { registerCaptainAccount, addSeller } = useAuth();
  const [targetRole, setTargetRole] = useState<'CAPTAIN' | 'SELLER'>('CAPTAIN');
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Captain Registration Form Fields: Name, Email, Password, Confirm Password
  const [captainName, setCaptainName] = useState('');
  const [captainEmail, setCaptainEmail] = useState('');
  const [captainPassword, setCaptainPassword] = useState('');
  const [captainConfirmPassword, setCaptainConfirmPassword] = useState('');

  // Seller Form Fields
  const [sellerName, setSellerName] = useState('');
  const [sellerEmail, setSellerEmail] = useState('');
  const [sellerCompany, setSellerCompany] = useState('');

  const handleCaptainSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!captainName.trim() || !captainEmail.trim() || !captainPassword || !captainConfirmPassword) {
      setErrorMessage('Please fill in all required fields (Name, Email, Password, Confirm Password).');
      return;
    }

    if (captainPassword !== captainConfirmPassword) {
      setErrorMessage('Password and Confirm Password do not match.');
      return;
    }

    if (captainPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    const res = registerCaptainAccount({
      name: captainName,
      email: captainEmail,
      password: captainPassword,
    });

    if (!res.success) {
      setErrorMessage(res.message || 'Registration failed.');
    } else {
      setIsSuccess(true);
    }
  };

  const handleSellerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addSeller({
      firstName: sellerName,
      email: sellerEmail,
      companyName: sellerCompany,
    });
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-jaxmart-bg flex flex-col justify-center items-center p-4 font-sans">
        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-jaxmart-lg text-center max-w-lg w-full space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-extrabold text-jaxmart-navy">
            Captain Registration Submitted!
          </h2>
          <p className="text-sm text-gray-600">
            Captain <strong>{captainName || 'Account'}</strong> ({captainEmail}) has been registered!
          </p>

          <div className="p-4 bg-amber-50 rounded-lg text-left text-xs border border-amber-200 space-y-1 text-amber-900">
            <div className="font-bold flex items-center space-x-1">
              <AlertTriangle className="w-4 h-4 text-amber-600 mr-1" />
              <span>Pending Admin Activation Required:</span>
            </div>
            <p>
              Your account is saved as <strong className="underline">INACTIVE</strong>. Admin Rahul Sharma must log in and click <strong>"Activate Captain"</strong> before you can sign in with your Email & Password.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={onNavigateLogin}
              className="px-5 py-2.5 bg-jaxmart-primary text-white rounded-lg text-xs font-bold hover:bg-jaxmart-navy transition-colors shadow-sm"
            >
              Go to Login Page
            </button>
            <button
              onClick={onNavigateLanding}
              className="px-5 py-2.5 bg-jaxmart-bg border border-gray-300 text-jaxmart-navy rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors"
            >
              Return to Landing Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-jaxmart-bg flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-4">
        <button
          onClick={onNavigateLanding}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-jaxmart-teal hover:underline mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Landing Page</span>
        </button>

        <div className="flex justify-center items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-jaxmart-primary flex items-center justify-center text-white font-bold text-2xl shadow-jaxmart-card">
            J
          </div>
          <span className="text-3xl font-black text-jaxmart-navy tracking-tight">
            Jaxmart<span className="text-jaxmart-teal">.</span>
          </span>
        </div>
        <h2 className="mt-3 text-2xl font-bold text-jaxmart-navy">
          Captain Registration
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Register Captain account with Name, Email, Password & Confirm Password
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-jaxmart-lg rounded-xl border border-gray-200 sm:px-8 space-y-5">
          
          {/* Target Role Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-jaxmart-mediumBlue mb-2">
              Select Registration Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTargetRole('CAPTAIN')}
                className={`p-3 rounded-lg border text-left flex items-center space-x-2 transition-all ${
                  targetRole === 'CAPTAIN'
                    ? 'border-jaxmart-primary bg-blue-50/50 text-jaxmart-navy ring-2 ring-jaxmart-primary/20 font-bold'
                    : 'border-gray-200 bg-jaxmart-bg text-gray-600 hover:border-gray-300'
                }`}
              >
                <UserCheck className="w-5 h-5 text-jaxmart-primary" />
                <div>
                  <div className="text-xs">Captain Registration</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTargetRole('SELLER')}
                className={`p-3 rounded-lg border text-left flex items-center space-x-2 transition-all ${
                  targetRole === 'SELLER'
                    ? 'border-jaxmart-teal bg-teal-50/50 text-jaxmart-navy ring-2 ring-jaxmart-teal/20 font-bold'
                    : 'border-gray-200 bg-jaxmart-bg text-gray-600 hover:border-gray-300'
                }`}
              >
                <Store className="w-5 h-5 text-jaxmart-teal" />
                <div>
                  <div className="text-xs">Seller Registration</div>
                </div>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-jaxmart-error font-semibold flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-jaxmart-error shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* CAPTAIN REGISTRATION FORM: Name, Email, Password, Confirm Password */}
          {targetRole === 'CAPTAIN' ? (
            <form onSubmit={handleCaptainSubmit} className="space-y-4">
              
              {/* Field 1: Captain Name */}
              <div>
                <label className="block text-xs font-bold text-jaxmart-navy mb-1">
                  Captain Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={captainName}
                    onChange={(e) => setCaptainName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-jaxmart-bg border border-gray-300 rounded-lg text-xs font-semibold text-jaxmart-navy"
                    placeholder="Amit Verma"
                  />
                </div>
              </div>

              {/* Field 2: Captain Email */}
              <div>
                <label className="block text-xs font-bold text-jaxmart-navy mb-1">
                  Captain Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={captainEmail}
                    onChange={(e) => setCaptainEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-jaxmart-bg border border-gray-300 rounded-lg text-xs font-semibold text-jaxmart-navy"
                    placeholder="captain.amit@jaxmart.com"
                  />
                </div>
              </div>

              {/* Field 3: Password */}
              <div>
                <label className="block text-xs font-bold text-jaxmart-navy mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={captainPassword}
                    onChange={(e) => setCaptainPassword(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-jaxmart-bg border border-gray-300 rounded-lg text-xs font-semibold text-jaxmart-navy"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>

              {/* Field 4: Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-jaxmart-navy mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={captainConfirmPassword}
                    onChange={(e) => setCaptainConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-jaxmart-bg border border-gray-300 rounded-lg text-xs font-semibold text-jaxmart-navy"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-jaxmart-primary text-white rounded-lg text-xs font-bold hover:bg-jaxmart-navy transition-all shadow-sm flex justify-center items-center space-x-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Register Captain Account</span>
              </button>
            </form>
          ) : (
            /* SELLER FORM */
            <form onSubmit={handleSellerSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-jaxmart-navy mb-1">Seller Full Name *</label>
                <input
                  type="text"
                  required
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  className="w-full px-3 py-2 bg-jaxmart-bg border border-gray-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-jaxmart-navy mb-1">Official Email *</label>
                <input
                  type="email"
                  required
                  value={sellerEmail}
                  onChange={(e) => setSellerEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-jaxmart-bg border border-gray-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-jaxmart-navy mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={sellerCompany}
                  onChange={(e) => setSellerCompany(e.target.value)}
                  className="w-full px-3 py-2 bg-jaxmart-bg border border-gray-300 rounded-lg text-xs"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 px-4 bg-jaxmart-teal text-white rounded-lg text-xs font-bold hover:bg-teal-600"
              >
                Submit Seller Registration
              </button>
            </form>
          )}

          {/* Footer link to Login */}
          <div className="text-center pt-3 border-t border-gray-100 text-xs text-gray-500">
            Already registered?{' '}
            <button
              type="button"
              onClick={onNavigateLogin}
              className="text-jaxmart-teal font-bold hover:underline"
            >
              Sign In Here
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};
