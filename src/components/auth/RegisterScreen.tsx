import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';
import { Store, UserCheck, CheckCircle2, ArrowRight, ArrowLeft, Shield, Mail, Lock, Building, Phone } from 'lucide-react';

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
  const { addCaptain, addSeller } = useAuth();
  const [targetRole, setTargetRole] = useState<'CAPTAIN' | 'SELLER'>('SELLER');
  const [currentStep, setCurrentStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    companyName: '',
    gstin: '',
    businessType: 'Wholesaler / Manufacturer',
    city: 'Ahmedabad',
    state: 'Gujarat',
    password: '',
    confirmPassword: '',
    referralCode: 'CAP-AMIT-201',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (targetRole === 'CAPTAIN') {
      addCaptain({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        mobile: formData.mobile,
      });
    } else {
      addSeller({
        firstName: formData.firstName,
        lastName: formData.lastName,
        companyName: formData.companyName,
        email: formData.email,
        mobile: formData.mobile,
      });
    }
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-jaxmart-bg flex flex-col justify-center items-center p-4">
        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-jaxmart-lg text-center max-w-lg w-full space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-extrabold text-jaxmart-navy">Registration Submitted!</h2>
          <p className="text-sm text-gray-600">
            Your application for a <strong>{targetRole}</strong> account has been submitted and is pending verification by Super Admin.
          </p>

          <div className="bg-jaxmart-bg p-4 rounded-lg text-left text-xs border border-gray-200 space-y-1">
            <div className="font-bold text-jaxmart-navy">Audit Trail Triggered:</div>
            <div className="text-jaxmart-teal font-mono">
              "Public Registration Request submitted for {formData.firstName} {formData.lastName} ({targetRole})"
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={onSuccessRegister}
              className="px-5 py-2.5 bg-jaxmart-primary text-white rounded-lg text-sm font-semibold hover:bg-jaxmart-navy transition-colors shadow-sm"
            >
              Go to Admin Portal
            </button>
            <button
              onClick={onNavigateLanding}
              className="px-5 py-2.5 bg-jaxmart-bg border border-gray-300 text-jaxmart-navy rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors"
            >
              Return to Landing Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  const steps = [
    { step: 1, label: 'Personal Info' },
    { step: 2, label: 'Business & GST' },
    { step: 3, label: 'Credentials' },
    { step: 4, label: 'Review & Submit' },
  ];

  return (
    <div className="min-h-screen bg-jaxmart-bg flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center mb-6">
        <button
          onClick={onNavigateLanding}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-jaxmart-teal hover:underline mb-4"
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
          B2B Partner Registration
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Apply for a Captain or Seller account on the Jaxmart Network
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 shadow-jaxmart-lg rounded-xl border border-gray-200 sm:px-10 space-y-6">
          
          {/* Target Role Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-jaxmart-mediumBlue mb-2">
              Select Desired Account Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTargetRole('SELLER')}
                className={`p-3 rounded-lg border text-left flex items-center space-x-3 transition-all ${
                  targetRole === 'SELLER'
                    ? 'border-jaxmart-teal bg-teal-50/50 text-jaxmart-navy ring-2 ring-jaxmart-teal/20'
                    : 'border-gray-200 bg-jaxmart-bg text-gray-600 hover:border-gray-300'
                }`}
              >
                <div className={`p-2 rounded-lg ${targetRole === 'SELLER' ? 'bg-jaxmart-teal text-white' : 'bg-gray-200 text-gray-600'}`}>
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold">Seller Partner</div>
                  <div className="text-[10px] text-gray-500">Sell products & catalog</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTargetRole('CAPTAIN')}
                className={`p-3 rounded-lg border text-left flex items-center space-x-3 transition-all ${
                  targetRole === 'CAPTAIN'
                    ? 'border-jaxmart-primary bg-blue-50/50 text-jaxmart-navy ring-2 ring-jaxmart-primary/20'
                    : 'border-gray-200 bg-jaxmart-bg text-gray-600 hover:border-gray-300'
                }`}
              >
                <div className={`p-2 rounded-lg ${targetRole === 'CAPTAIN' ? 'bg-jaxmart-primary text-white' : 'bg-gray-200 text-gray-600'}`}>
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold">Captain Partner</div>
                  <div className="text-[10px] text-gray-500">Manage regional sellers</div>
                </div>
              </button>
            </div>
          </div>

          {/* Stepper Progress */}
          <div className="flex items-center justify-between border-b pb-4">
            {steps.map(({ step, label }) => (
              <div key={step} className="flex flex-col items-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    currentStep >= step
                      ? 'bg-jaxmart-primary text-white'
                      : 'bg-gray-100 text-gray-400 border border-gray-300'
                  }`}
                >
                  {step}
                </div>
                <span className={`text-[10px] font-semibold mt-1 ${currentStep === step ? 'text-jaxmart-primary' : 'text-gray-400'}`}>
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* Form Wizard */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* STEP 1: Personal Info */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-jaxmart-navy border-b pb-1">
                  Contact Person Details
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-jaxmart-navy mb-1">First Name *</label>
                    <input
                      type="text"
                      required
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-jaxmart-bg border border-gray-300 rounded-lg text-sm"
                      placeholder="Rahul"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-jaxmart-navy mb-1">Last Name *</label>
                    <input
                      type="text"
                      required
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-jaxmart-bg border border-gray-300 rounded-lg text-sm"
                      placeholder="Shah"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-jaxmart-navy mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-jaxmart-bg border border-gray-300 rounded-lg text-sm"
                      placeholder="rahul@company.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-jaxmart-navy mb-1">Mobile Phone *</label>
                    <input
                      type="tel"
                      required
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-jaxmart-bg border border-gray-300 rounded-lg text-sm"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Business Info */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-jaxmart-navy border-b pb-1">
                  Business & GST Details
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-jaxmart-navy mb-1">Registered Company Name *</label>
                  <input
                    type="text"
                    required
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-jaxmart-bg border border-gray-300 rounded-lg text-sm"
                    placeholder="Apex Supplies Pvt Ltd"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-jaxmart-navy mb-1">GSTIN Number</label>
                    <input
                      type="text"
                      name="gstin"
                      value={formData.gstin}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-jaxmart-bg border border-gray-300 rounded-lg text-sm font-mono"
                      placeholder="24AAAAA0000A1Z5"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-jaxmart-navy mb-1">Business Type</label>
                    <select
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-jaxmart-bg border border-gray-300 rounded-lg text-sm"
                    >
                      <option>Manufacturer</option>
                      <option>Wholesaler / Distributor</option>
                      <option>Retail Enterprise</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Credentials */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-jaxmart-navy border-b pb-1">
                  Account Password & Referral
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-jaxmart-navy mb-1">Password *</label>
                    <input
                      type="password"
                      required
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-jaxmart-bg border border-gray-300 rounded-lg text-sm"
                      placeholder="••••••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-jaxmart-navy mb-1">Confirm Password *</label>
                    <input
                      type="password"
                      required
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-jaxmart-bg border border-gray-300 rounded-lg text-sm"
                      placeholder="••••••••••••"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-jaxmart-navy mb-1">Referral / Captain Code (Optional)</label>
                  <input
                    type="text"
                    name="referralCode"
                    value={formData.referralCode}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-jaxmart-bg border border-gray-300 rounded-lg text-sm font-mono"
                  />
                </div>
              </div>
            )}

            {/* STEP 4: Review */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-jaxmart-navy border-b pb-1">
                  Review & Submit
                </h3>

                <div className="bg-jaxmart-bg p-4 rounded-lg border border-gray-200 space-y-2 text-xs">
                  <div><span className="text-gray-500">Selected Role:</span> <strong className="text-jaxmart-teal">{targetRole}</strong></div>
                  <div><span className="text-gray-500">Applicant:</span> <strong className="text-jaxmart-navy">{formData.firstName} {formData.lastName}</strong></div>
                  <div><span className="text-gray-500">Company:</span> <strong className="text-jaxmart-navy">{formData.companyName || 'Not specified'}</strong></div>
                  <div><span className="text-gray-500">Email:</span> <strong className="text-jaxmart-navy">{formData.email}</strong></div>
                </div>
              </div>
            )}

            {/* Stepper Controls */}
            <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
              <button
                type="button"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200 disabled:opacity-30 flex items-center space-x-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-5 py-2 bg-jaxmart-primary text-white rounded-lg text-xs font-semibold hover:bg-jaxmart-navy transition-colors flex items-center space-x-1"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-jaxmart-teal text-white rounded-lg text-xs font-bold hover:bg-teal-600 shadow-md transition-colors flex items-center space-x-1"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Partner Registration</span>
                </button>
              )}
            </div>

          </form>

          {/* Footer link to Login */}
          <div className="text-center pt-2 border-t border-gray-100 text-xs text-gray-500">
            Already have an active account?{' '}
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
