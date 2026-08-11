import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Store, CheckCircle2, ArrowRight, ArrowLeft, Shield } from 'lucide-react';

interface WorkflowProps {
  onComplete: () => void;
}

export const AddSellerWorkflow: React.FC<WorkflowProps> = ({ onComplete }) => {
  const { addSeller, currentUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    gstin: '24AAAAA0000A1Z5',
    email: '',
    mobile: '',
    city: 'Surat',
    state: 'Gujarat',
    username: '',
    password: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addSeller({
      firstName: formData.firstName,
      lastName: formData.lastName,
      companyName: formData.companyName,
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
        <h2 className="text-2xl font-bold text-jaxmart-navy">Seller Created Successfully!</h2>
        <p className="text-sm text-gray-600">
          Seller <strong>{formData.companyName}</strong> has been onboarded under Captain <strong>{currentUser.name}</strong>.
        </p>

        <div className="bg-jaxmart-bg p-4 rounded-lg text-left text-xs border border-gray-200 space-y-1">
          <div className="font-bold text-jaxmart-navy">Audit Activity Recorded:</div>
          <div className="text-jaxmart-teal font-mono">
            "Captain {currentUser.name} created Seller {formData.companyName}"
          </div>
        </div>

        <div className="pt-4 flex justify-center space-x-3">
          <button
            onClick={onComplete}
            className="px-5 py-2.5 bg-jaxmart-teal text-white rounded-lg text-sm font-semibold hover:bg-teal-600 transition-colors shadow-sm"
          >
            Go to Seller List
          </button>
        </div>
      </div>
    );
  }

  const steps = [
    { step: 1, label: 'Seller Info' },
    { step: 2, label: 'Business Info' },
    { step: 3, label: 'Contact Info' },
    { step: 4, label: 'Account Info' },
    { step: 5, label: 'Review & Create' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-jaxmart-card flex items-center justify-between">
        <div>
          <span className="bg-teal-100 text-teal-800 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
            5-Step Seller Onboarding Wizard
          </span>
          <h1 className="text-xl font-bold text-jaxmart-navy mt-1">Add New Seller Account</h1>
          <p className="text-xs text-gray-500">
            Assigned Captain: <strong>{currentUser.name}</strong> ({currentUser.role})
          </p>
        </div>
        <div className="w-10 h-10 bg-jaxmart-teal text-white rounded-xl flex items-center justify-center font-bold">
          <Store className="w-5 h-5" />
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
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isDone
                      ? 'bg-emerald-500 text-white'
                      : isActive
                      ? 'bg-jaxmart-teal text-white ring-4 ring-jaxmart-teal/20'
                      : 'bg-gray-100 text-gray-400 border border-gray-300'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : step}
                </div>
                <span className={`text-[10px] font-semibold mt-1.5 text-center ${isActive ? 'text-jaxmart-teal' : 'text-gray-400'}`}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-jaxmart-card">
        <form onSubmit={handleSubmit}>
          
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-jaxmart-navy uppercase tracking-wider border-b pb-2">
                Step 1: Seller Personal Info
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
                    placeholder="Rajesh"
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
                    placeholder="Mehta"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-jaxmart-navy uppercase tracking-wider border-b pb-2">
                Step 2: Business & GST Verification
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
                  placeholder="ABC Traders Pvt Ltd"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-jaxmart-navy mb-1">GSTIN Number</label>
                <input
                  type="text"
                  name="gstin"
                  value={formData.gstin}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-jaxmart-bg border border-gray-300 rounded-lg text-sm font-mono"
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-jaxmart-navy uppercase tracking-wider border-b pb-2">
                Step 3: Contact & Location
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-jaxmart-navy mb-1">Official Email *</label>
                  <input
                    type="email"
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-jaxmart-bg border border-gray-300 rounded-lg text-sm"
                    placeholder="sales@abctraders.com"
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
                    placeholder="+91 91234 56789"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-jaxmart-navy uppercase tracking-wider border-b pb-2">
                Step 4: Seller Credentials & Status
              </h3>
              <div>
                <label className="block text-xs font-semibold text-jaxmart-navy mb-1">Default Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-jaxmart-bg border border-gray-300 rounded-lg text-sm"
                >
                  <option value="ACTIVE">ACTIVE - Approved immediately</option>
                  <option value="INACTIVE">INACTIVE - Verification pending</option>
                </select>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-jaxmart-navy uppercase tracking-wider border-b pb-2">
                Step 5: Review & Onboard Seller
              </h3>
              <div className="bg-jaxmart-bg p-4 rounded-lg border border-gray-200 space-y-2 text-xs">
                <div><span className="text-gray-500">Company:</span> <strong className="text-jaxmart-navy">{formData.companyName}</strong></div>
                <div><span className="text-gray-500">Contact:</span> <strong className="text-jaxmart-navy">{formData.firstName} {formData.lastName} ({formData.email})</strong></div>
                <div><span className="text-gray-500">Captain Hierarchy:</span> <strong className="text-jaxmart-teal">{currentUser.name}</strong></div>
              </div>
            </div>
          )}

          {/* Navigation controls */}
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

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2 bg-jaxmart-teal text-white rounded-lg text-xs font-semibold hover:bg-teal-600 transition-colors flex items-center space-x-1"
              >
                <span>Next Step</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="submit"
                className="px-6 py-2.5 bg-jaxmart-primary text-white rounded-lg text-xs font-bold hover:bg-jaxmart-navy shadow-md transition-colors flex items-center space-x-1"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Create Seller Account</span>
              </button>
            )}
          </div>

        </form>
      </div>

    </div>
  );
};
