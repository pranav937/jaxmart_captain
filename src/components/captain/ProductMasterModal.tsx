import React, { useState, useEffect } from 'react';
import { X, Package, Building2, Layers, CheckCircle2, Info } from 'lucide-react';
import { OnboardedCompany, ProductMaster } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (productMaster: ProductMaster) => void;
  captainId: string;
  approvedCompanies: OnboardedCompany[];
  defaultCompanyId?: string;
}

export const ProductMasterModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
  captainId,
  approvedCompanies,
  defaultCompanyId
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(
    defaultCompanyId || (approvedCompanies.length > 0 ? approvedCompanies[0].id : '')
  );

  useEffect(() => {
    if (defaultCompanyId) {
      setSelectedCompanyId(defaultCompanyId);
    } else if (approvedCompanies.length > 0 && !selectedCompanyId) {
      setSelectedCompanyId(approvedCompanies[0].id);
    }
  }, [defaultCompanyId, approvedCompanies, isOpen]);
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('Metals');
  const [subCategory, setSubCategory] = useState('Stainless Steel');
  const [productType, setProductType] = useState('Sheet');
  const [baseUom, setBaseUom] = useState('KG');
  const [industry, setIndustry] = useState('Construction');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const categoryMap: Record<string, { subCats: string[]; defaultType: string }> = {
    'Metals': {
      subCats: ['Stainless Steel', 'Carbon Steel', 'Aluminum', 'Copper & Brass', 'Alloy Steel'],
      defaultType: 'Sheet'
    },
    'Industrial Hardware': {
      subCats: ['Power Tools', 'Fasteners & Bolts', 'Bearings & Valves', 'Pneumatics & Fittings'],
      defaultType: 'Tool'
    },
    'Electrical & Electronics': {
      subCats: ['Circuit Breakers', 'Cables & Wires', 'Industrial Switches', 'Transformers'],
      defaultType: 'Cable'
    },
    'Construction Supplies': {
      subCats: ['Scaffolding Fixtures', 'Cement & Adhesives', 'Steel Rods & Rebar', 'Structural Beams'],
      defaultType: 'Rod'
    },
    'Plumbing & Fluid Handling': {
      subCats: ['PVC & CPVC Pipes', 'Industrial Valves', 'Pipe Fittings', 'Pumps'],
      defaultType: 'Pipe'
    }
  };

  const currentSubCats = categoryMap[category]?.subCats || ['General'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) {
      alert('Product Name is required.');
      return;
    }
    if (!selectedCompanyId) {
      alert('Please select an Approved Company.');
      return;
    }

    const selectedCmp = approvedCompanies.find(c => c.id === selectedCompanyId);
    setLoading(true);

    const payload = {
      companyId: selectedCompanyId,
      companyName: selectedCmp?.companyName || 'Company',
      captainId: captainId || 'USR-CAP-201',
      productName: productName.trim(),
      category,
      subCategory,
      productType,
      description,
      baseUom,
      industry
    };

    try {
      const res = await fetch('http://localhost:5000/api/captain/product-masters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        onSuccess(data.productMaster || payload);
        onClose();
      } else {
        alert(data.error || 'Failed to create Product Master');
      }
    } catch (err: any) {
      alert('Server Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-8 transition-all">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-jaxmart-navy via-slate-900 to-jaxmart-navy px-6 py-4 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-jaxmart-blue/20 border border-jaxmart-blue/30 flex items-center justify-center text-jaxmart-gold font-bold">
              <Package className="w-5 h-5 text-jaxmart-blue" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Create Product Master (Product Family)</h2>
              <p className="text-xs text-slate-300">Top-level product family registration (Product ≠ SKU)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* Info Banner */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-800">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Note:</strong> A Product Master defines the top-level product family (e.g. <em>Stainless Steel Sheet</em>). Individual SKUs (sizes, thicknesses, grades, colors) can be linked under this Product Master.
            </div>
          </div>

          {/* Company Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-blue-600" /> Select Approved Manufacturer / Company <span className="text-red-500">*</span>
            </label>
            {approvedCompanies.length === 0 ? (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-semibold">
                ⚠️ No Companies found! Please onboard a company first.
              </div>
            ) : (
              <select
                value={selectedCompanyId}
                onChange={e => setSelectedCompanyId(e.target.value)}
                className="w-full text-xs p-3 bg-white border border-slate-300 rounded-xl font-bold text-jaxmart-navy outline-none focus:ring-2 focus:ring-blue-600 shadow-sm"
              >
                {approvedCompanies.map(c => (
                  <option key={c.id} value={c.id}>
                    🏢 {c.companyName} ({c.city} - {c.companyType || 'Manufacturer'}) [{c.status}]
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Product Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Product Family Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Stainless Steel Sheet, PVC Conduit Pipe, Brass Ball Valve"
              value={productName}
              onChange={e => setProductName(e.target.value)}
              className="w-full text-xs p-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-jaxmart-blue outline-none"
            />
          </div>

          {/* Category & Sub Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={e => {
                  setCategory(e.target.value);
                  const firstSub = categoryMap[e.target.value]?.subCats[0] || 'General';
                  setSubCategory(firstSub);
                }}
                className="w-full text-xs p-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-jaxmart-blue outline-none"
              >
                <option value="Metals">Metals</option>
                <option value="Industrial Hardware">Industrial Hardware</option>
                <option value="Electrical & Electronics">Electrical & Electronics</option>
                <option value="Construction Supplies">Construction Supplies</option>
                <option value="Plumbing & Fluid Handling">Plumbing & Fluid Handling</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Sub Category</label>
              <select
                value={subCategory}
                onChange={e => setSubCategory(e.target.value)}
                className="w-full text-xs p-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-jaxmart-blue outline-none"
              >
                {currentSubCats.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Product Type, Base UOM, Industry */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Product Type</label>
              <input
                type="text"
                placeholder="e.g. Sheet, Pipe, Rod, Valve, Cable"
                value={productType}
                onChange={e => setProductType(e.target.value)}
                className="w-full text-xs p-3 bg-white border border-slate-300 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Base UOM (Unit of Measure)</label>
              <select
                value={baseUom}
                onChange={e => setBaseUom(e.target.value)}
                className="w-full text-xs p-3 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 outline-none"
              >
                <option value="KG">KG (Kilograms)</option>
                <option value="PCS">PCS (Pieces)</option>
                <option value="MTR">MTR (Meters)</option>
                <option value="TON">TON (Metric Tonnes)</option>
                <option value="LTR">LTR (Liters)</option>
                <option value="BOX">BOX (Boxes)</option>
                <option value="SQFT">SQFT (Square Feet)</option>
                <option value="SET">SET (Sets)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Industry</label>
              <input
                type="text"
                placeholder="e.g. Construction, Automotive, Plumbing"
                value={industry}
                onChange={e => setIndustry(e.target.value)}
                className="w-full text-xs p-3 bg-white border border-slate-300 rounded-xl outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Product Family Description</label>
            <textarea
              rows={3}
              placeholder="Provide overview, material standards (e.g. ASTM A240 Grade 304/316), applications, etc."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full text-xs p-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-jaxmart-blue outline-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || approvedCompanies.length === 0}
              className="px-6 py-2.5 bg-jaxmart-navy hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-lg shadow-slate-900/20 flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Creating Product Master...' : <><CheckCircle2 className="w-4 h-4 text-jaxmart-gold" /> Onboard Product Master</>}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
