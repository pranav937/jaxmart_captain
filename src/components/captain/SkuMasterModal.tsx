import React, { useState, useEffect } from 'react';
import { X, Layers, Building2, Tag, CheckCircle2, Info, Sparkles, Scale, Maximize2 } from 'lucide-react';
import { OnboardedCompany, ProductMaster, GradeMaster, SkuMaster } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (sku: SkuMaster) => void;
  captainId: string;
  approvedProducts: ProductMaster[];
  approvedCompanies: OnboardedCompany[];
  grades: GradeMaster[];
  defaultProductId?: string;
}

export const SkuMasterModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
  captainId,
  approvedProducts,
  approvedCompanies,
  grades,
  defaultProductId
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>(
    defaultProductId || (approvedProducts.length > 0 ? approvedProducts[0].id : '')
  );
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(
    approvedCompanies.length > 0 ? approvedCompanies[0].id : ''
  );
  const [selectedGradeId, setSelectedGradeId] = useState<string>(
    grades.length > 0 ? grades[0].id : 'GRADE-001'
  );

  const [finishId, setFinishId] = useState('2B');
  const [thickness, setThickness] = useState<number>(1.5);
  const [thicknessUom, setThicknessUom] = useState('MM');
  const [width, setWidth] = useState<number>(1220);
  const [widthUom, setWidthUom] = useState('MM');
  const [length, setLength] = useState<number>(2440);
  const [lengthUom, setLengthUom] = useState('MM');
  const [weight, setWeight] = useState<number>(28.5);
  const [weightUom, setWeightUom] = useState('KG');
  const [standardId, setStandardId] = useState('ASTM-A240');
  const [countryOfOrigin, setCountryOfOrigin] = useState('India');
  const [price, setPrice] = useState<number>(3450);
  const [customSkuCode, setCustomSkuCode] = useState('');

  // Auto update company when product changes
  useEffect(() => {
    if (defaultProductId) {
      setSelectedProductId(defaultProductId);
    }
  }, [defaultProductId, isOpen]);

  useEffect(() => {
    if (selectedProductId) {
      const pm = approvedProducts.find(p => p.id === selectedProductId);
      if (pm && pm.companyId) {
        setSelectedCompanyId(pm.companyId);
      }
    }
  }, [selectedProductId, approvedProducts]);

  if (!isOpen) return null;

  const currentGrade = grades.find(g => g.id === selectedGradeId) || { gradeCode: 'SS304' };

  // Calculate live SKU Code
  const generatedSkuCode = `${currentGrade.gradeCode}-${finishId}-${width}-${length}-${thickness}${thicknessUom}`;
  const effectiveSkuCode = customSkuCode.trim() || generatedSkuCode;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProductId) {
      alert('Please select a Product Family.');
      return;
    }
    if (!selectedCompanyId) {
      alert('Please select a Manufacturer Company.');
      return;
    }

    setLoading(true);

    const payload = {
      productId: selectedProductId,
      manufacturerId: selectedCompanyId,
      captainId: captainId || 'USR-CAP-201',
      skuCode: effectiveSkuCode,
      brandId: 'BRAND-001',
      gradeId: selectedGradeId,
      finishId,
      thickness,
      thicknessUom,
      width,
      widthUom,
      length,
      lengthUom,
      weight,
      weightUom,
      colorId: 'STANDARD',
      standardId,
      countryOfOrigin,
      price
    };

    try {
      const res = await fetch('http://localhost:5000/api/captain/skus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        onSuccess(data.sku || payload);
        onClose();
      } else {
        alert(data.error || 'Failed to create SKU Master');
      }
    } catch (err: any) {
      alert('Server Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-8 transition-all">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 px-6 py-4 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 font-bold">
              <Tag className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Create SKU Master (Sellable Item Variant)</h2>
              <p className="text-xs text-slate-300">Exact technical specifications combination (e.g. SS304-2B-1220-2440-1.5MM)</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">

          {/* Generated SKU Code Preview Card */}
          <div className="p-4 bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-xl shadow-inner flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] text-blue-300 uppercase font-bold tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Auto-Generated SKU Code
              </span>
              <div className="text-lg font-mono font-black text-amber-300 tracking-wide mt-0.5">
                {effectiveSkuCode}
              </div>
            </div>
            <div className="text-[11px] text-slate-300 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
              Grade: <strong className="text-white">{currentGrade.gradeCode}</strong> | Finish: <strong className="text-white">{finishId}</strong> | {thickness}{thicknessUom}
            </div>
          </div>

          {/* Product Family & Company Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-600" /> Select Product Family (Product Master) <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedProductId}
                onChange={e => setSelectedProductId(e.target.value)}
                className="w-full p-3 bg-white border border-slate-300 rounded-xl font-bold text-jaxmart-navy outline-none focus:ring-2 focus:ring-blue-600"
              >
                {approvedProducts.map(p => (
                  <option key={p.id} value={p.id}>
                    📦 {p.productName} ({p.category} - {p.subCategory})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-blue-600" /> Manufacturer / Company <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedCompanyId}
                onChange={e => setSelectedCompanyId(e.target.value)}
                className="w-full p-3 bg-white border border-slate-300 rounded-xl font-bold text-jaxmart-navy outline-none focus:ring-2 focus:ring-blue-600"
              >
                {approvedCompanies.map(c => (
                  <option key={c.id} value={c.id}>
                    🏢 {c.companyName} ({c.city})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Grade Master & Surface Finish */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Material Grade Master (ASTM / EN / DIN Standard) <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedGradeId}
                onChange={e => setSelectedGradeId(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg font-extrabold text-blue-700 outline-none focus:ring-2 focus:ring-blue-600"
              >
                {grades.map(g => (
                  <option key={g.id} value={g.id}>
                    🧪 {g.gradeCode} — {g.gradeName} ({g.standard} {g.standardGrade || ''})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Surface Finish</label>
              <select
                value={finishId}
                onChange={e => setFinishId(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg font-bold text-slate-800 outline-none"
              >
                <option value="2B">2B (Cold Rolled Smooth)</option>
                <option value="BA">BA (Bright Annealed)</option>
                <option value="No.4">No.4 (Satin / Brushed Finish)</option>
                <option value="No.8">No.8 / Mirror Finish</option>
                <option value="HL">HL (Hairline Finish)</option>
                <option value="MATTE">Matte / Mill Finish</option>
              </select>
            </div>
          </div>

          {/* Dimensions: Thickness, Width, Length */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Maximize2 className="w-3.5 h-3.5 text-blue-600" /> Thickness
              </label>
              <div className="flex gap-1">
                <input
                  type="number"
                  step="0.01"
                  required
                  value={thickness}
                  onChange={e => setThickness(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-bold outline-none"
                />
                <select
                  value={thicknessUom}
                  onChange={e => setThicknessUom(e.target.value)}
                  className="p-2.5 bg-slate-100 border border-slate-300 rounded-lg font-bold text-slate-700"
                >
                  <option value="MM">MM</option>
                  <option value="SWG">SWG</option>
                  <option value="INCH">INCH</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Maximize2 className="w-3.5 h-3.5 text-blue-600" /> Width
              </label>
              <div className="flex gap-1">
                <input
                  type="number"
                  step="1"
                  required
                  value={width}
                  onChange={e => setWidth(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-bold outline-none"
                />
                <select
                  value={widthUom}
                  onChange={e => setWidthUom(e.target.value)}
                  className="p-2.5 bg-slate-100 border border-slate-300 rounded-lg font-bold text-slate-700"
                >
                  <option value="MM">MM</option>
                  <option value="MTR">MTR</option>
                  <option value="FEET">FEET</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Maximize2 className="w-3.5 h-3.5 text-blue-600" /> Length
              </label>
              <div className="flex gap-1">
                <input
                  type="number"
                  step="1"
                  required
                  value={length}
                  onChange={e => setLength(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-bold outline-none"
                />
                <select
                  value={lengthUom}
                  onChange={e => setLengthUom(e.target.value)}
                  className="p-2.5 bg-slate-100 border border-slate-300 rounded-lg font-bold text-slate-700"
                >
                  <option value="MM">MM</option>
                  <option value="MTR">MTR</option>
                  <option value="FEET">FEET</option>
                </select>
              </div>
            </div>
          </div>

          {/* Weight, Standard & Price */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-blue-600" /> Weight / Unit
              </label>
              <div className="flex gap-1">
                <input
                  type="number"
                  step="0.1"
                  required
                  value={weight}
                  onChange={e => setWeight(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-bold outline-none"
                />
                <select
                  value={weightUom}
                  onChange={e => setWeightUom(e.target.value)}
                  className="p-2.5 bg-slate-100 border border-slate-300 rounded-lg font-bold text-slate-700"
                >
                  <option value="KG">KG</option>
                  <option value="TON">TON</option>
                  <option value="LBS">LBS</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Standard Reference</label>
              <input
                type="text"
                placeholder="e.g. ASTM-A240 / EN 10088-2"
                value={standardId}
                onChange={e => setStandardId(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg outline-none font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Selling Price (₹ INR)</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="3450.00"
                value={price}
                onChange={e => setPrice(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 border border-slate-300 rounded-lg font-extrabold text-slate-900 outline-none"
              />
            </div>
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
              disabled={loading || approvedProducts.length === 0}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/20 flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Onboarding SKU...' : <><CheckCircle2 className="w-4 h-4 text-amber-300" /> Onboard SKU Master</>}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
