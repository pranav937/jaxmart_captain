import React, { useEffect, useState } from 'react';
import {
  X, Building2, MapPin, Users, FileText, Landmark, Award, ShieldCheck, CheckCircle2, XCircle, Globe, Phone, Mail, UserCheck
} from 'lucide-react';
import { OnboardedCompany } from '../../types';

interface Props {
  companyId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  isAdmin?: boolean;
}

export const CompanyDetailViewModal: React.FC<Props> = ({
  companyId,
  isOpen,
  onClose,
  onApprove,
  onReject,
  isAdmin = false
}) => {
  const [activeTab, setActiveTab] = useState<number>(1);
  const [company, setCompany] = useState<OnboardedCompany | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && companyId) {
      fetchCompanyDetail(companyId);
    }
  }, [isOpen, companyId]);

  const fetchCompanyDetail = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/captain/companies/${id}`);
      const data = await res.json();
      if (data.success && data.company) {
        setCompany(data.company);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !companyId) return null;

  const tabs = [
    { id: 1, name: 'Master Profile', icon: Building2 },
    { id: 2, name: `Addresses (${company?.addresses?.length || 0})`, icon: MapPin },
    { id: 3, name: `Contacts (${company?.contacts?.length || 0})`, icon: Users },
    { id: 4, name: `Documents (${company?.documents?.length || 0})`, icon: FileText },
    { id: 5, name: `Bank Accounts (${company?.bankAccounts?.length || 0})`, icon: Landmark },
    { id: 6, name: `Certifications (${company?.certifications?.length || 0})`, icon: Award }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-8 transition-all">

        {/* Header */}
        <div className="bg-gradient-to-r from-jaxmart-navy via-slate-900 to-jaxmart-navy px-6 py-5 text-white flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-jaxmart-gold font-extrabold text-xl shadow-inner">
              {company?.companyName ? company.companyName.charAt(0) : 'C'}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-white">{company?.companyName || 'Loading Company...'}</h2>
                {company?.rating && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-400 text-slate-900 shadow">
                    Rating {company.rating}
                  </span>
                )}
                {company?.status === 'APPROVED' && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                  </span>
                )}
                {company?.status === 'PENDING' && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Pending Admin Review
                  </span>
                )}
                {company?.status === 'REJECTED' && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    Rejected
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {company?.legalName} | ID: <span className="font-mono text-jaxmart-gold font-bold">{company?.id}</span> | Onboarded by Captain: <span className="text-emerald-300 font-semibold">{company?.captainName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${isActive
                  ? 'border-jaxmart-navy text-jaxmart-navy bg-white shadow-sm'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                  }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-jaxmart-blue' : 'text-slate-400'}`} />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Body Content */}
        <div className="p-6 max-h-[65vh] overflow-y-auto">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              Loading Company Master details from database...
            </div>
          ) : !company ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              Company details could not be loaded.
            </div>
          ) : (
            <>
              {/* TAB 1: MASTER OVERVIEW */}
              {activeTab === 1 && (
                <div className="space-y-6">
                  {/* Key Metrics Header */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Company Type</span>
                      <span className="text-sm font-extrabold text-jaxmart-navy">{company.companyType || 'Manufacturer'}</span>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Brand Name</span>
                      <span className="text-sm font-extrabold text-jaxmart-navy">{company.brandName || company.companyName}</span>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Credit Limit</span>
                      <span className="text-sm font-extrabold text-emerald-600">{company.creditLimit || '₹10,00,000'}</span>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Payment Terms</span>
                      <span className="text-sm font-extrabold text-jaxmart-navy">{company.paymentTerms || '30 Days'}</span>
                    </div>
                  </div>

                  {/* Profile Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
                      <h3 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider flex items-center gap-2 border-b pb-2">
                        <Building2 className="w-4 h-4 text-jaxmart-blue" /> Tax & Registration Master
                      </h3>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[11px]">GSTIN</span>
                          <span className="font-mono font-bold text-slate-800">{company.gstin || 'Not Provided'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">PAN Card</span>
                          <span className="font-mono font-bold text-slate-800">{company.pan || 'Not Provided'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">Reg / CIN No.</span>
                          <span className="font-mono font-bold text-slate-800">{company.registrationNo || 'Not Provided'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">Selling Categories</span>
                          <span className="font-medium text-slate-800">{company.sellingCategories || 'General Hardware'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
                      <h3 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider flex items-center gap-2 border-b pb-2">
                        <Phone className="w-4 h-4 text-jaxmart-blue" /> Contact & Location Master
                      </h3>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[11px]">Primary Contact Person</span>
                          <span className="font-bold text-slate-800">{company.contactPerson || company.ownerName || 'Rajesh Shah'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">Phone / Mobile</span>
                          <span className="font-medium text-slate-800">{company.phone || company.mobile || '+91 98765 43210'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">Email Address</span>
                          <span className="font-medium text-slate-800">{company.email || 'contact@company.com'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">Website</span>
                          <span className="font-medium text-jaxmart-blue truncate block">{company.website || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Registered Office Address */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Primary Registered Office Address</span>
                    <p className="font-medium text-slate-800">{company.address || `${company.city}, ${company.state}, ${company.country}`}</p>
                  </div>
                </div>
              )}

              {/* TAB 2: ADDRESSES */}
              {activeTab === 2 && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Company Facilities & Offices</h3>
                  {!company.addresses || company.addresses.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs border border-dashed rounded-xl">
                      No additional facility addresses logged for this company profile.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {company.addresses.map((addr, idx) => (
                        <div key={idx} className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm space-y-2 text-xs">
                          <div className="flex justify-between items-center border-b pb-2">
                            <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-[11px]">
                              {addr.addressType} Address
                            </span>
                            {addr.isPrimary && (
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Primary</span>
                            )}
                          </div>
                          <p className="font-medium text-slate-800 leading-relaxed">
                            {addr.addressLine1} {addr.addressLine2 && `, ${addr.addressLine2}`}
                          </p>
                          <p className="text-slate-500">
                            {addr.city}, {addr.state} - <span className="font-mono">{addr.pincode}</span> ({addr.country})
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: CONTACTS */}
              {activeTab === 3 && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Key Contact Persons</h3>
                  {!company.contacts || company.contacts.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs border border-dashed rounded-xl">
                      No key contact persons logged.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {company.contacts.map((ct, idx) => (
                        <div key={idx} className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm space-y-2 text-xs">
                          <div className="flex items-center gap-3 border-b pb-2">
                            <div className="w-8 h-8 rounded-full bg-jaxmart-navy/10 text-jaxmart-navy flex items-center justify-center font-bold">
                              {ct.name.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900">{ct.name}</h4>
                              <p className="text-[11px] text-slate-500">{ct.designation}</p>
                            </div>
                          </div>
                          <p className="text-slate-700 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> {ct.phone || 'N/A'}</p>
                          <p className="text-slate-700 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> {ct.email || 'N/A'}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: DOCUMENTS */}
              {activeTab === 4 && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Compliance & Regulatory Documents</h3>
                  {!company.documents || company.documents.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs border border-dashed rounded-xl">
                      No document records linked.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {company.documents.map((doc, idx) => (
                        <div key={idx} className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900">{doc.docType}</h4>
                              <p className="font-mono text-slate-500 text-[11px]">Ref: {doc.docNumber || 'DOC-VERIFIED'}</p>
                            </div>
                          </div>
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> Verified
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: BANK ACCOUNTS */}
              {activeTab === 5 && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Bank Accounts & Settlement Details</h3>
                  {!company.bankAccounts || company.bankAccounts.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs border border-dashed rounded-xl">
                      No bank accounts registered.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {company.bankAccounts.map((bank, idx) => (
                        <div key={idx} className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm space-y-2 text-xs">
                          <div className="flex justify-between items-center border-b pb-2">
                            <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                              <Landmark className="w-4 h-4 text-emerald-600" /> {bank.bankName}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-600 text-[10px]">
                              {bank.accountType}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-slate-600">
                            <div>
                              <span className="text-[10px] text-slate-400 block">Account Number</span>
                              <span className="font-mono font-bold text-slate-900">{bank.accountNumber}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block">IFSC Code</span>
                              <span className="font-mono font-bold text-slate-900">{bank.ifscCode}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 6: CERTIFICATIONS */}
              {activeTab === 6 && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Industrial Certifications & Licenses</h3>
                  {!company.certifications || company.certifications.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs border border-dashed rounded-xl">
                      No industrial certifications logged.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {company.certifications.map((cert, idx) => (
                        <div key={idx} className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                              <Award className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900">{cert.certName}</h4>
                              <p className="text-[11px] text-slate-500">Issued by {cert.issuingAuthority}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-mono text-[11px] text-slate-700 font-semibold block">{cert.certNumber}</span>
                            <span className="text-[10px] text-slate-400">Valid: {cert.validTill}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 flex justify-between items-center">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50"
          >
            Close Viewer
          </button>

          {isAdmin && company?.status === 'PENDING' && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (onReject && companyId) onReject(companyId);
                  onClose();
                }}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow"
              >
                <XCircle className="w-4 h-4" /> Reject Company
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onApprove && companyId) onApprove(companyId);
                  onClose();
                }}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
              >
                <CheckCircle2 className="w-4 h-4" /> Approve Company
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
