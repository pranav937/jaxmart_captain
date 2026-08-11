import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserCheck, CheckCircle2, ArrowRight, ArrowLeft, Shield } from 'lucide-react';

interface WorkflowProps {
  onComplete: () => void;
}

export const AddCaptainWorkflow: React.FC<WorkflowProps> = ({ onComplete }) => {
  const { addCaptain, currentUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    company: 'Jaxmart Logistics & Operations',
    address: 'Plot 45, GIDC Industrial Estate',
    city: 'Ahmedabad',
    state: 'Gujarat',
    country: 'India',
    pincode: '380015',
    username: '',
    password: '',
    confirmPassword: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
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
    addCaptain({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      mobile: formData.mobile,
    });
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-jaxmart-card text-center max-w-xl mx-auto space-y-4 my-8">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-jaxmart-navy">Captain Created Successfully!</h2>
        <p className="text-sm text-gray-600">
          Captain <strong>{formData.firstName} {formData.lastName}</strong> has been registered and assigned under <strong>{currentUser.name}</strong>.
        </p>

        <div className="bg-jaxmart-bg p-4 rounded-lg text-left text-xs border border-gray-200 space-y-1">
          <div className="font-bold text-jaxmart-navy">Audit Log Generated Automatically:</div>
          <div className="text-jaxmart-teal font-mono">
            "Admin {currentUser.name} created Captain {formData.firstName} {formData.lastName}"
          </div>
        </div>

        <div className="pt-4 flex justify-center space-x-3">
          <button
            onClick={onComplete}
            className="px-5 py-2.5 bg-jaxmart-primary text-white rounded-lg text-sm font-semibold hover:bg-jaxmart-navy transition-colors shadow-sm"
          >
            Go to Captain List
          </button>
        </div>
      </div>
    );
  }

  const steps = [
    { step: 1, label: 'Basic Information' },
    { step: 2, label: 'Business Information' },
    { step: 3, label: 'Account Information' },
    { step: 4, label: 'Review & Create' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-jaxmart-card flex items-center justify-between">
        <div>
          <span className="bg-teal-100 text-teal-800 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
            Multi-Step Creation Wizard
          </span>
          <h1 className="text-xl font-bold text-jaxmart-navy mt-1">Add New Captain</h1>
          <p className="text-xs text-gray-500">
            Supervising Admin: <strong>{currentUser.name}</strong> ({currentUser.role})
          </p>
        </div>
        <div className="w-10 h-10 bg-jaxmart-primary text-white rounded-xl flex items-center justify-center font-bold">
          <UserCheck className="w-5 h-5" />
        </div>
      </div>

      {/* Stepper Progress Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-jaxmart-sm">
        <div className="flex items-center justify-between relative">
          {steps.map(({ step, label }) => {
            const isActive = currentStep === step;
            const isDone = currentStep > step;
            return (
              <div key={step} className="flex-1 flex flex-col items-center relative z-10">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isDone
                      ? 'bg-emerald-500 text-white'
                      : isActive
                      ? 'bg-jaxmart-primary text-white ring-4 ring-jaxmart-primary/20'
                      : 'bg-gray-100 text-gray-400 border border-gray-300'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-4 h-4" /> : step}
                </div>
                <span className={`text-[11px] font-semibold mt-2 text-center ${isActive ? 'text-jaxmart-primary' : 'text-gray-400'}`}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Wizard Form Body */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-jaxmart-card">
        <form onSubmit={handleSubmit}>
          
          {/* STEP 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-jaxmart-navy uppercase tracking-wider border-b pb-2">
                Step 1: Personal & Contact Information
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-jaxmart-navy mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-jaxmart-bg border border-gray-300 rounded-lg text-sm"
                    placeholder="Amit"
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
                    placeholder="Verma"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-jaxmart-navy mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-jaxmart-bg border border-gray-300 rounded-lg text-sm"
                    placeholder="amit.verma@jaxmart.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-jaxmart-navy mb-1">Mobile Number *</label>
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

          {/* STEP 2: Business Information */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-jaxmart-navy uppercase tracking-wider border-b pb-2">
                Step 2: Business & Regional Location
              </h3>

              <div>
                <label className="block text-xs font-semibold text-jaxmart-navy mb-1">Company / Organization</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-jaxmart-bg border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-jaxmart-navy mb-1">Office Street Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-jaxmart-bg border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-jaxmart-navy mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-jaxmart-bg border border-gray-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-jaxmart-navy mb-1">State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-jaxmart-bg border border-gray-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-jaxmart-navy mb-1">Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-jaxmart-bg border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Account Information */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-jaxmart-navy uppercase tracking-wider border-b pb-2">
                Step 3: Security & Credentials
              </h3>

              <div>
                <label className="block text-xs font-semibold text-jaxmart-navy mb-1">System Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username || formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-jaxmart-bg border border-gray-300 rounded-lg text-sm"
                  placeholder="amit_verma_captain"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-jaxmart-navy mb-1">Temporary Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password || '••••••••••••'}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-jaxmart-bg border border-gray-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-jaxmart-navy mb-1">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword || '••••••••••••'}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-jaxmart-bg border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Review & Create */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-jaxmart-navy uppercase tracking-wider border-b pb-2">
                Step 4: Summary Review
              </h3>

              <div className="bg-jaxmart-bg p-4 rounded-lg border border-gray-200 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-500 block">Full Name:</span>
                    <strong className="text-jaxmart-navy text-sm">{formData.firstName} {formData.lastName}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Assigned Role:</span>
                    <strong className="text-jaxmart-teal">CAPTAIN</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Email Address:</span>
                    <strong className="text-jaxmart-navy">{formData.email}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Mobile Phone:</span>
                    <strong className="text-jaxmart-navy">{formData.mobile}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Assigned Admin:</span>
                    <strong className="text-jaxmart-primary">{currentUser.name}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Location:</span>
                    <strong className="text-jaxmart-navy">{formData.city}, {formData.state}</strong>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 flex items-start space-x-2">
                <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Confirming this form will initialize the Captain record and immediately record an audit log visible to Super Admins.
                </span>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between">
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
                <span>Confirm & Create Captain</span>
              </button>
            )}
          </div>

        </form>
      </div>

    </div>
  );
};
