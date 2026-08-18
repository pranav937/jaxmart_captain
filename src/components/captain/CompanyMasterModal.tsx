import React, { useState } from 'react';
import {
  X, Building2, MapPin, Users, FileText, Landmark, Award, Plus, Trash2, CheckCircle2, ChevronRight, ChevronLeft
} from 'lucide-react';
import {
  OnboardedCompany, CompanyAddress, CompanyContact, CompanyDocument, CompanyBankAccount, CompanyCertification
} from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (company: OnboardedCompany) => void;
  captainId: string;
}

export const CompanyMasterModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, captainId }) => {
  const [activeTab, setActiveTab] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  // 1. Master Profile Form State
  const [companyName, setCompanyName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [companyType, setCompanyType] = useState('Manufacturer');
  const [brandName, setBrandName] = useState('');
  const [registrationNo, setRegistrationNo] = useState('');
  const [gstin, setGstin] = useState('');
  const [pan, setPan] = useState('');
  const [country, setCountry] = useState('India');
  const [state, setState] = useState('Gujarat');
  const [city, setCity] = useState('Ahmedabad');
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('30 Days');
  const [creditLimit, setCreditLimit] = useState('₹10,00,000');
  const [rating, setRating] = useState('A');
  const [sellingCategories, setSellingCategories] = useState('Steel & Metals, Hardware');

  // 2. Addresses State
  const [addresses, setAddresses] = useState<CompanyAddress[]>([]);
  const [newAddr, setNewAddr] = useState<CompanyAddress>({
    addressType: 'Registered',
    addressLine1: '',
    addressLine2: '',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pincode: '',
    country: 'India',
    isPrimary: true
  });

  // 3. Contacts State
  const [contacts, setContacts] = useState<CompanyContact[]>([]);
  const [newCt, setNewCt] = useState<CompanyContact>({
    name: '',
    designation: 'Sales Director',
    phone: '',
    email: '',
    isPrimary: true
  });

  // 4. Documents State
  const [documents, setDocuments] = useState<CompanyDocument[]>([]);
  const [newDoc, setNewDoc] = useState<CompanyDocument>({
    docType: 'GST Certificate',
    docNumber: '',
    fileUrl: '',
    status: 'VERIFIED'
  });

  // 5. Bank Accounts State
  const [bankAccounts, setBankAccounts] = useState<CompanyBankAccount[]>([]);
  const [newBank, setNewBank] = useState<CompanyBankAccount>({
    accountName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    branch: '',
    accountType: 'Current',
    isPrimary: true
  });

  // 6. Certifications State
  const [certifications, setCertifications] = useState<CompanyCertification[]>([]);
  const [newCert, setNewCert] = useState<CompanyCertification>({
    certName: 'ISO 9001:2015',
    certNumber: '',
    issuingAuthority: 'TUV SUD',
    validTill: '2028-12-31'
  });

  if (!isOpen) return null;

  // Handlers for adding sub-table items
  const addAddress = () => {
    if (!newAddr.addressLine1) return;
    setAddresses([...addresses, newAddr]);
    setNewAddr({
      addressType: 'Factory',
      addressLine1: '',
      addressLine2: '',
      city: city || 'Ahmedabad',
      state: state || 'Gujarat',
      pincode: '',
      country: 'India',
      isPrimary: false
    });
  };

  const removeAddress = (idx: number) => {
    setAddresses(addresses.filter((_, i) => i !== idx));
  };

  const addContact = () => {
    if (!newCt.name) return;
    setContacts([...contacts, newCt]);
    setNewCt({ name: '', designation: 'Manager', phone: '', email: '', isPrimary: false });
  };

  const removeContact = (idx: number) => {
    setContacts(contacts.filter((_, i) => i !== idx));
  };

  const addDocument = () => {
    if (!newDoc.docNumber && !newDoc.docType) return;
    setDocuments([...documents, newDoc]);
    setNewDoc({ docType: 'PAN Card', docNumber: '', fileUrl: '', status: 'VERIFIED' });
  };

  const removeDocument = (idx: number) => {
    setDocuments(documents.filter((_, i) => i !== idx));
  };

  const addBank = () => {
    if (!newBank.accountNumber) return;
    setBankAccounts([...bankAccounts, newBank]);
    setNewBank({ accountName: companyName, bankName: '', accountNumber: '', ifscCode: '', branch: '', accountType: 'Current', isPrimary: false });
  };

  const removeBank = (idx: number) => {
    setBankAccounts(bankAccounts.filter((_, i) => i !== idx));
  };

  const addCert = () => {
    if (!newCert.certName) return;
    setCertifications([...certifications, newCert]);
    setNewCert({ certName: '', certNumber: '', issuingAuthority: '', validTill: '' });
  };

  const removeCert = (idx: number) => {
    setCertifications(certifications.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      alert('Company Name is required.');
      return;
    }

    setLoading(true);

    const fullPayload: Partial<OnboardedCompany> = {
      captainId: captainId || 'USR-CAP-201',
      companyName: companyName.trim(),
      legalName: legalName.trim() || companyName.trim(),
      companyType,
      brandName,
      registrationNo,
      ownerName: contactPerson || legalName,
      gstin,
      pan,
      country,
      state,
      city,
      address,
      website,
      contactPerson,
      phone,
      mobile: phone,
      email,
      paymentTerms,
      creditLimit,
      rating,
      sellingCategories,
      status: 'PENDING',
      addresses,
      contacts,
      documents,
      bankAccounts,
      certifications
    };

    try {
      const res = await fetch('http://localhost:5000/api/captain/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullPayload)
      });
      const data = await res.json();
      if (data.success) {
        onSuccess(data.company || fullPayload);
        onClose();
      } else {
        alert(data.error || 'Failed to onboard company');
      }
    } catch (err: any) {
      alert('Server Connection Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 1, name: '1. Master Profile', icon: Building2 },
    { id: 2, name: `2. Addresses (${addresses.length})`, icon: MapPin },
    { id: 3, name: `3. Contacts (${contacts.length})`, icon: Users },
    { id: 4, name: `4. Documents (${documents.length})`, icon: FileText },
    { id: 5, name: `5. Bank Details (${bankAccounts.length})`, icon: Landmark },
    { id: 6, name: `6. Certifications (${certifications.length})`, icon: Award }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-8 transition-all">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-jaxmart-navy to-slate-900 px-6 py-4 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-jaxmart-blue/20 border border-jaxmart-blue/30 flex items-center justify-center text-jaxmart-gold font-bold">
              <Building2 className="w-5 h-5 text-jaxmart-blue" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Company / Manufacturer Master Onboarding</h2>
              <p className="text-xs text-slate-300">Complete enterprise profile & database registration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b border-slate-200 bg-slate-50 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
                  isActive
                    ? 'border-jaxmart-navy text-jaxmart-navy bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-jaxmart-blue' : 'text-slate-400'}`} />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 max-h-[65vh] overflow-y-auto">

            {/* TAB 1: MASTER PROFILE */}
            {activeTab === 1 && (
              <div className="space-y-6">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">Core Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Company ID</label>
                      <input
                        type="text"
                        disabled
                        value="COMP-AUTO (Generated)"
                        className="w-full text-xs p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Company Name <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. ABC Steel Industries"
                        value={companyName}
                        onChange={e => setCompanyName(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-jaxmart-blue outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Legal Name</label>
                      <input
                        type="text"
                        placeholder="e.g. ABC Steel Industries Pvt Ltd"
                        value={legalName}
                        onChange={e => setLegalName(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-jaxmart-blue outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Company Type</label>
                      <select
                        value={companyType}
                        onChange={e => setCompanyType(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-jaxmart-blue outline-none"
                      >
                        <option value="Manufacturer">Manufacturer</option>
                        <option value="Distributor">Distributor</option>
                        <option value="Trader">Trader</option>
                        <option value="Exporter">Exporter</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Brand Name</label>
                      <input
                        type="text"
                        placeholder="e.g. ABC"
                        value={brandName}
                        onChange={e => setBrandName(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-jaxmart-blue outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Registration No. (CIN/Reg)</label>
                      <input
                        type="text"
                        placeholder="e.g. U27100GJ2020PTC123456"
                        value={registrationNo}
                        onChange={e => setRegistrationNo(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-jaxmart-blue outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">Tax & Location Master</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">GSTIN</label>
                      <input
                        type="text"
                        placeholder="e.g. 24AAAAA0000A1Z5"
                        value={gstin}
                        onChange={e => setGstin(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-jaxmart-blue outline-none font-mono uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">PAN Card No.</label>
                      <input
                        type="text"
                        placeholder="e.g. ABCDE1234F"
                        value={pan}
                        onChange={e => setPan(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-jaxmart-blue outline-none font-mono uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Country</label>
                      <input
                        type="text"
                        value={country}
                        onChange={e => setCountry(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-jaxmart-blue outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">State</label>
                      <input
                        type="text"
                        placeholder="e.g. Gujarat"
                        value={state}
                        onChange={e => setState(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-jaxmart-blue outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">City</label>
                      <input
                        type="text"
                        placeholder="e.g. Ahmedabad"
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-jaxmart-blue outline-none"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-xs font-medium text-slate-700 mb-1">Primary Registered Address</label>
                      <input
                        type="text"
                        placeholder="e.g. Plot No 45, GIDC Industrial Estate, Odhav"
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-jaxmart-blue outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">Contact & Commercial Terms</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Contact Person</label>
                      <input
                        type="text"
                        placeholder="e.g. Rajesh Shah"
                        value={contactPerson}
                        onChange={e => setContactPerson(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-jaxmart-blue outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Phone / Mobile</label>
                      <input
                        type="text"
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-jaxmart-blue outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        placeholder="contact@abcsteel.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-jaxmart-blue outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Website</label>
                      <input
                        type="text"
                        placeholder="https://www.abcsteel.com"
                        value={website}
                        onChange={e => setWebsite(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-jaxmart-blue outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Payment Terms</label>
                      <input
                        type="text"
                        placeholder="e.g. 30 Days"
                        value={paymentTerms}
                        onChange={e => setPaymentTerms(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-jaxmart-blue outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Credit Limit</label>
                      <input
                        type="text"
                        placeholder="e.g. ₹10,00,000"
                        value={creditLimit}
                        onChange={e => setCreditLimit(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-jaxmart-blue outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Company Rating</label>
                      <select
                        value={rating}
                        onChange={e => setRating(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-jaxmart-blue outline-none font-bold text-jaxmart-navy"
                      >
                        <option value="A+">A+ (Premium)</option>
                        <option value="A">A (Standard)</option>
                        <option value="B">B (Moderate)</option>
                        <option value="C">C (Basic)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Selling Categories</label>
                      <input
                        type="text"
                        placeholder="e.g. TMT Bars, Pipes, Hardware"
                        value={sellingCategories}
                        onChange={e => setSellingCategories(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-jaxmart-blue outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ADDRESSES */}
            {activeTab === 2 && (
              <div className="space-y-6">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-jaxmart-blue" /> Add Company Address
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Address Type</label>
                      <select
                        value={newAddr.addressType}
                        onChange={e => setNewAddr({ ...newAddr, addressType: e.target.value as any })}
                        className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg"
                      >
                        <option value="Registered">Registered</option>
                        <option value="Factory">Factory</option>
                        <option value="Warehouse">Warehouse</option>
                        <option value="Billing">Billing</option>
                        <option value="Shipping">Shipping</option>
                      </select>
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-xs font-medium text-slate-700 mb-1">Address Line 1</label>
                      <input
                        type="text"
                        placeholder="Street / Building / Plot No"
                        value={newAddr.addressLine1}
                        onChange={e => setNewAddr({ ...newAddr, addressLine1: e.target.value })}
                        className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Address Line 2</label>
                      <input
                        type="text"
                        placeholder="Landmark / Area"
                        value={newAddr.addressLine2}
                        onChange={e => setNewAddr({ ...newAddr, addressLine2: e.target.value })}
                        className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">City</label>
                      <input
                        type="text"
                        value={newAddr.city}
                        onChange={e => setNewAddr({ ...newAddr, city: e.target.value })}
                        className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">State</label>
                      <input
                        type="text"
                        value={newAddr.state}
                        onChange={e => setNewAddr({ ...newAddr, state: e.target.value })}
                        className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Pincode</label>
                      <input
                        type="text"
                        placeholder="380001"
                        value={newAddr.pincode}
                        onChange={e => setNewAddr({ ...newAddr, pincode: e.target.value })}
                        className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={addAddress}
                    className="px-4 py-2 bg-jaxmart-navy text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Address to List
                  </button>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-700 mb-2">Added Addresses ({addresses.length})</h4>
                  {addresses.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No custom addresses added yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {addresses.map((a, idx) => (
                        <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl flex justify-between items-center text-xs">
                          <div>
                            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold mr-2">{a.addressType}</span>
                            <span className="font-medium text-slate-800">{a.addressLine1}, {a.city}, {a.state} - {a.pincode}</span>
                          </div>
                          <button type="button" onClick={() => removeAddress(idx)} className="text-red-500 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: CONTACTS */}
            {activeTab === 3 && (
              <div className="space-y-6">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-jaxmart-blue" /> Add Key Contact Person
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Amit Patel"
                        value={newCt.name}
                        onChange={e => setNewCt({ ...newCt, name: e.target.value })}
                        className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Designation</label>
                      <input
                        type="text"
                        placeholder="e.g. VP Operations"
                        value={newCt.designation}
                        onChange={e => setNewCt({ ...newCt, designation: e.target.value })}
                        className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number</label>
                      <input
                        type="text"
                        placeholder="+91 98980 12345"
                        value={newCt.phone}
                        onChange={e => setNewCt({ ...newCt, phone: e.target.value })}
                        className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        placeholder="amit@company.com"
                        value={newCt.email}
                        onChange={e => setNewCt({ ...newCt, email: e.target.value })}
                        className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={addContact}
                    className="px-4 py-2 bg-jaxmart-navy text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Contact
                  </button>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-700 mb-2">Added Contact Persons ({contacts.length})</h4>
                  {contacts.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No additional contacts added yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {contacts.map((c, idx) => (
                        <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold text-slate-800 mr-2">{c.name}</span>
                            <span className="text-slate-500 mr-3">({c.designation})</span>
                            <span className="text-slate-600 mr-2">📞 {c.phone}</span>
                            <span className="text-slate-600">✉️ {c.email}</span>
                          </div>
                          <button type="button" onClick={() => removeContact(idx)} className="text-red-500 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: DOCUMENTS */}
            {activeTab === 4 && (
              <div className="space-y-6">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-jaxmart-blue" /> Add Document Record
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Document Type</label>
                      <select
                        value={newDoc.docType}
                        onChange={e => setNewDoc({ ...newDoc, docType: e.target.value as any })}
                        className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg"
                      >
                        <option value="GST Certificate">GST Certificate</option>
                        <option value="PAN Card">PAN Card</option>
                        <option value="MSME Registration">MSME Registration</option>
                        <option value="Cancelled Cheque">Cancelled Cheque</option>
                        <option value="Incorporation Certificate">Incorporation Certificate</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Document Reg / Ref Number</label>
                      <input
                        type="text"
                        placeholder="e.g. DOC-98765432"
                        value={newDoc.docNumber}
                        onChange={e => setNewDoc({ ...newDoc, docNumber: e.target.value })}
                        className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">File URL / Attachment</label>
                      <input
                        type="text"
                        placeholder="https://docs.cloud/file.pdf"
                        value={newDoc.fileUrl}
                        onChange={e => setNewDoc({ ...newDoc, fileUrl: e.target.value })}
                        className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={addDocument}
                    className="px-4 py-2 bg-jaxmart-navy text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Document Record
                  </button>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-700 mb-2">Attached Documents ({documents.length})</h4>
                  {documents.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No document records added yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {documents.map((d, idx) => (
                        <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl flex justify-between items-center text-xs">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-jaxmart-blue" />
                            <span className="font-bold text-slate-800">{d.docType}:</span>
                            <span className="font-mono text-slate-600">{d.docNumber || 'Uploaded File'}</span>
                          </div>
                          <button type="button" onClick={() => removeDocument(idx)} className="text-red-500 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: BANK ACCOUNTS */}
            {activeTab === 5 && (
              <div className="space-y-6">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-jaxmart-blue" /> Add Bank Account Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Account Holder Name</label>
                      <input
                        type="text"
                        placeholder="Company Account Name"
                        value={newBank.accountName}
                        onChange={e => setNewBank({ ...newBank, accountName: e.target.value })}
                        className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Bank Name</label>
                      <input
                        type="text"
                        placeholder="HDFC Bank / ICICI Bank"
                        value={newBank.bankName}
                        onChange={e => setNewBank({ ...newBank, bankName: e.target.value })}
                        className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Account Number</label>
                      <input
                        type="text"
                        placeholder="50200012345678"
                        value={newBank.accountNumber}
                        onChange={e => setNewBank({ ...newBank, accountNumber: e.target.value })}
                        className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">IFSC Code</label>
                      <input
                        type="text"
                        placeholder="HDFC0001234"
                        value={newBank.ifscCode}
                        onChange={e => setNewBank({ ...newBank, ifscCode: e.target.value })}
                        className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg font-mono uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Branch</label>
                      <input
                        type="text"
                        placeholder="Odhav Branch, Ahmedabad"
                        value={newBank.branch}
                        onChange={e => setNewBank({ ...newBank, branch: e.target.value })}
                        className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Account Type</label>
                      <select
                        value={newBank.accountType}
                        onChange={e => setNewBank({ ...newBank, accountType: e.target.value as any })}
                        className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg"
                      >
                        <option value="Current">Current Account</option>
                        <option value="Savings">Savings Account</option>
                        <option value="Overdraft">Overdraft (OD)</option>
                      </select>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={addBank}
                    className="px-4 py-2 bg-jaxmart-navy text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Bank Account
                  </button>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-700 mb-2">Registered Bank Accounts ({bankAccounts.length})</h4>
                  {bankAccounts.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No bank account details added yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {bankAccounts.map((b, idx) => (
                        <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold text-slate-800 mr-2">{b.bankName}</span>
                            <span className="font-mono text-slate-600 mr-3">Acc: {b.accountNumber}</span>
                            <span className="font-mono text-slate-500">IFSC: {b.ifscCode}</span>
                          </div>
                          <button type="button" onClick={() => removeBank(idx)} className="text-red-500 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 6: CERTIFICATIONS */}
            {activeTab === 6 && (
              <div className="space-y-6">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-jaxmart-blue" /> Add Quality / Industrial Certification
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Certification Name</label>
                      <input
                        type="text"
                        placeholder="ISO 9001, BIS Hallmark, CE"
                        value={newCert.certName}
                        onChange={e => setNewCert({ ...newCert, certName: e.target.value })}
                        className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Cert / License No.</label>
                      <input
                        type="text"
                        placeholder="ISO-9001-2024-88"
                        value={newCert.certNumber}
                        onChange={e => setNewCert({ ...newCert, certNumber: e.target.value })}
                        className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Issuing Authority</label>
                      <input
                        type="text"
                        placeholder="TUV SUD / Bureau Veritas"
                        value={newCert.issuingAuthority}
                        onChange={e => setNewCert({ ...newCert, issuingAuthority: e.target.value })}
                        className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Valid Till</label>
                      <input
                        type="date"
                        value={newCert.validTill}
                        onChange={e => setNewCert({ ...newCert, validTill: e.target.value })}
                        className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={addCert}
                    className="px-4 py-2 bg-jaxmart-navy text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Certification
                  </button>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-700 mb-2">Registered Certifications ({certifications.length})</h4>
                  {certifications.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No certifications added yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {certifications.map((cert, idx) => (
                        <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold text-jaxmart-navy mr-2">{cert.certName}</span>
                            <span className="text-slate-600 mr-3">By {cert.issuingAuthority}</span>
                            <span className="text-slate-500">Valid: {cert.validTill}</span>
                          </div>
                          <button type="button" onClick={() => removeCert(idx)} className="text-red-500 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Footer Controls */}
          <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 flex justify-between items-center">
            <div className="flex gap-2">
              {activeTab > 1 && (
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab - 1)}
                  className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous Step
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>

              {activeTab < 6 ? (
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab + 1)}
                  className="px-5 py-2 bg-jaxmart-navy text-white text-xs font-bold rounded-lg hover:bg-slate-800 flex items-center gap-1"
                >
                  Next Step <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-lg shadow-emerald-600/20 flex items-center gap-2"
                >
                  {loading ? 'Registering...' : <><CheckCircle2 className="w-4 h-4" /> Complete Onboarding & Submit</>}
                </button>
              )}
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
