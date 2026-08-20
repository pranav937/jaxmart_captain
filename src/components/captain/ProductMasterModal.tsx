import React, { useState, useEffect } from 'react';
import { X, Package, Building2, Layers, CheckCircle2, Info, Sparkles, Camera, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
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
  const [productType, setProductType] = useState('Sheet');
  const [baseUom, setBaseUom] = useState('KG');
  const [industry, setIndustry] = useState('Construction');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // AI Category State
  const [suggestedPath, setSuggestedPath] = useState<{ name: string; id: string | null; exists: boolean }[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [categoryAccepted, setCategoryAccepted] = useState(false);
  const [suggestionConfidence, setSuggestionConfidence] = useState(0);

  const [clarifyingQuestion, setClarifyingQuestion] = useState<string | null>(null);
  const [ambiguityAnswer, setAmbiguityAnswer] = useState('');

  if (!isOpen) return null;

  // Image Upload / Camera Snap Handler with Canvas Compression (<40KB)
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxWidth = 500;
          let width = img.width;
          let height = img.height;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            setImageUrl(canvas.toDataURL('image/jpeg', 0.8));
          } else {
            setImageUrl(event.target?.result as string);
          }
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSuggestCategory = async (queryOverride?: string) => {
    const query = queryOverride || productName.trim();
    if (!query) return;
    setIsSuggesting(true);
    setClarifyingQuestion(null);
    try {
      const res = await fetch('http://localhost:5000/api/categories/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName: query })
      });
      const data = await res.json();
      if (data.success) {
        if (data.isAmbiguous) {
          setClarifyingQuestion(data.clarifyingQuestion);
          setSuggestedPath([]);
        } else {
          setSuggestedPath(data.suggestedPath || []);
          setSuggestionConfidence(data.confidence || 0);
          setCategoryAccepted(false);
        }
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
      alert('Error fetching AI category suggestion: ' + err);
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleAnswerSubmit = () => {
    if (!ambiguityAnswer.trim()) return;
    const combinedQuery = `${productName} (${ambiguityAnswer})`;
    handleSuggestCategory(combinedQuery);
  };

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
    if (!categoryAccepted || suggestedPath.length === 0) {
      alert('Please Auto Suggest and Accept an AI Category before saving.');
      return;
    }

    const selectedCmp = approvedCompanies.find(c => c.id === selectedCompanyId);
    setLoading(true);

    try {
      let finalPath = suggestedPath;
      // Auto-create missing categories
      const hasMissing = suggestedPath.some(p => !p.exists);
      if (hasMissing) {
        const catRes = await fetch('http://localhost:5000/api/categories/create-path', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: suggestedPath, suggestedBy: captainId || 'SYSTEM' })
        });
        const catData = await catRes.json();
        if (catData.success) {
          finalPath = catData.finalPath;
        } else {
          alert('Failed to auto-create category path: ' + catData.error);
          setLoading(false);
          return;
        }
      }

      // Map dynamic path to existing legacy fields (category = L1, subCategory = L2/L3)
      const topCategory = finalPath[0]?.name || 'General';
      const subCat = finalPath.slice(1).map(p => p.name).join(' > ') || 'General';

      const payload = {
        companyId: selectedCompanyId,
        companyName: selectedCmp?.companyName || 'Company',
        captainId: captainId || 'USR-CAP-201',
        productName: productName.trim(),
        category: topCategory,
        subCategory: subCat,
        productType,
        description,
        baseUom,
        industry,
        imageUrl
      };

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

          {/* AI Category Auto-Suggestion */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700">
                AI Category Suggestion <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => handleSuggestCategory()}
                disabled={isSuggesting || !productName.trim()}
                className="text-xs px-3 py-1.5 bg-jaxmart-navy text-white rounded-lg font-bold hover:bg-slate-800 disabled:opacity-50 flex items-center gap-1 transition-all"
              >
                {isSuggesting ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Suggesting...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Auto Suggest
                  </>
                )}
              </button>
            </div>

            {clarifyingQuestion ? (
              <div className="space-y-3 p-4 bg-purple-50 border border-purple-200 rounded-xl">
                <div className="flex gap-2 text-purple-800 text-xs font-bold">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>AI Needs Clarification:</span>
                </div>
                <p className="text-sm text-purple-900">{clarifyingQuestion}</p>
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    placeholder="E.g., It is drinking soda / 5mm thickness"
                    value={ambiguityAnswer}
                    onChange={(e) => setAmbiguityAnswer(e.target.value)}
                    className="flex-1 text-xs p-2 rounded-lg border border-purple-300 outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={handleAnswerSubmit}
                    disabled={!ambiguityAnswer.trim() || isSuggesting}
                    className="text-xs font-bold bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    Answer
                  </button>
                </div>
              </div>
            ) : suggestedPath.length > 0 ? (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2 p-3 bg-white border border-slate-200 rounded-lg">
                  {suggestedPath.map((node, idx) => (
                    <React.Fragment key={idx}>
                      <span className={`text-xs font-bold px-2 py-1 rounded-md ${node.exists ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700 border border-amber-200 border-dashed'}`}>
                        {node.name}
                        {!node.exists && <span className="ml-1 text-[9px] uppercase tracking-wider text-amber-600">(New)</span>}
                      </span>
                      {idx < suggestedPath.length - 1 && <span className="text-slate-300">/</span>}
                    </React.Fragment>
                  ))}
                </div>
                {!categoryAccepted ? (
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setCategoryAccepted(true)} className="flex-1 text-xs font-bold py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
                      Accept Suggestion
                    </button>
                    <button type="button" onClick={() => setSuggestedPath([])} className="flex-1 text-xs font-bold py-2 bg-slate-100 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-200 transition-colors">
                      Reject / Retry
                    </button>
                  </div>
                ) : (
                  <div className="text-xs font-bold text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Category Accepted
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-slate-500 text-center py-4 bg-white border border-slate-200 border-dashed rounded-lg">
                Type a product name and click Auto Suggest to get the optimal category path.
              </div>
            )}
          </div>

          {/* Product Photo Upload & Camera Section */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-blue-600" />
                <span>Product Photo / Image Upload *</span>
              </label>
              {imageUrl && (
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="text-[11px] text-red-600 hover:text-red-800 font-semibold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove Photo
                </button>
              )}
            </div>

            {imageUrl ? (
              <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-slate-200">
                <img src={imageUrl} alt="Product Preview" className="w-20 h-20 object-cover rounded-lg border border-slate-300 shadow-sm" />
                <div className="space-y-1">
                  <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                    ✓ Photo Added Successfully
                  </span>
                  <p className="text-[11px] text-slate-500">High quality product preview ready for submit.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50/50 hover:bg-blue-50 rounded-xl cursor-pointer transition-all">
                    <Camera className="w-6 h-6 text-blue-600 mb-1" />
                    <span className="text-xs font-bold text-slate-800">Take Photo with Camera</span>
                    <span className="text-[10px] text-slate-500">Click to snap live product photo</span>
                    <input type="file" accept="image/*" capture="environment" onChange={handleImageFileChange} className="hidden" />
                  </label>

                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 rounded-xl cursor-pointer transition-all">
                    <Upload className="w-6 h-6 text-slate-600 mb-1" />
                    <span className="text-xs font-bold text-slate-800">Upload Image File</span>
                    <span className="text-[10px] text-slate-500">PNG, JPG, WEBP up to 10MB</span>
                    <input type="file" accept="image/*" onChange={handleImageFileChange} className="hidden" />
                  </label>
                </div>

                {/* Preset Sample Photos */}
                <div>
                  <span className="text-[11px] text-slate-500 font-semibold block mb-1.5 font-sans">Or tap a sample product photo:</span>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {[
                      { name: 'Power Tool', url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400' },
                      { name: 'Breaker', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400' },
                      { name: 'Safety Boots', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400' },
                      { name: 'Machine Part', url: 'https://images.unsplash.com/photo-1508873696983-2df515122519?w=400' },
                      { name: 'Fasteners', url: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400' }
                    ].map(sample => (
                      <button
                        key={sample.name}
                        type="button"
                        onClick={() => setImageUrl(sample.url)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 hover:border-blue-500 rounded-lg text-[11px] font-medium text-slate-700 whitespace-nowrap shadow-sm"
                      >
                        <img src={sample.url} alt={sample.name} className="w-4 h-4 rounded object-cover" />
                        <span>{sample.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
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
