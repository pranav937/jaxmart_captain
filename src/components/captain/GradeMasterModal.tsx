import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, Info } from 'lucide-react';
import { GradeMaster } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (grade: GradeMaster) => void;
  grades: GradeMaster[];
}

export const GradeMasterModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
  grades
}) => {
  const [activeTab, setActiveTab] = useState<'LIST' | 'CREATE'>('LIST');
  const [loading, setLoading] = useState(false);

  const [gradeCode, setGradeCode] = useState('');
  const [gradeName, setGradeName] = useState('');
  const [standard, setStandard] = useState('ASTM');
  const [standardGrade, setStandardGrade] = useState('');
  const [uns, setUns] = useState('');
  const [en, setEn] = useState('');
  const [din, setDin] = useState('');
  const [hardness, setHardness] = useState('');
  const [tensileStrength, setTensileStrength] = useState('');
  const [yieldStrength, setYieldStrength] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradeCode.trim() || !gradeName.trim()) {
      alert('Grade Code and Grade Name are required.');
      return;
    }

    setLoading(true);

    const payload = {
      gradeCode: gradeCode.trim(),
      gradeName: gradeName.trim(),
      standard,
      standardGrade: standardGrade.trim(),
      uns: uns.trim(),
      en: en.trim(),
      din: din.trim(),
      hardness: hardness.trim(),
      tensileStrength: tensileStrength.trim(),
      yieldStrength: yieldStrength.trim(),
      chemicalComposition: { Cr: '18-20%', Ni: '8-10.5%', C: '0.08% max' },
      mechanicalProperties: { Elongation: '40% min', Density: '8.00 g/cm³' }
    };

    try {
      const res = await fetch('http://localhost:5000/api/grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        onSuccess(data.grade || payload);
        setActiveTab('LIST');
        setGradeCode('');
        setGradeName('');
      } else {
        alert(data.error || 'Failed to create Grade Master');
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
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 px-6 py-4 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 font-bold">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Material Grade Master System</h2>
              <p className="text-xs text-slate-300">Technical material grades conforming to ASTM / UNS / EN / DIN standards</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Header */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-3 text-xs font-bold">
          <button
            onClick={() => setActiveTab('LIST')}
            className={`pb-3 border-b-2 px-3 transition-colors ${activeTab === 'LIST' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
          >
            📋 Grade Masters Library ({grades.length})
          </button>
          <button
            onClick={() => setActiveTab('CREATE')}
            className={`pb-3 border-b-2 px-3 transition-colors ${activeTab === 'CREATE' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
          >
            🧪 + Register New Material Grade
          </button>
        </div>

        {activeTab === 'LIST' ? (
          <div className="p-6 space-y-4 text-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-[11px] font-bold text-slate-600 uppercase border-b border-slate-200">
                    <th className="py-2.5 px-3">Grade Code & Name</th>
                    <th className="py-2.5 px-3">ASTM Standard</th>
                    <th className="py-2.5 px-3">UNS</th>
                    <th className="py-2.5 px-3">EN / DIN</th>
                    <th className="py-2.5 px-3">Mechanical Specs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {grades.map(g => (
                    <tr key={g.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3">
                        <div className="font-extrabold text-indigo-900 text-sm">{g.gradeCode}</div>
                        <div className="text-[10px] text-slate-500">{g.gradeName}</div>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-700">
                        {g.standard} {g.standardGrade || ''}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-blue-700">
                        {g.uns || '—'}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        <div>EN: <strong>{g.en || '—'}</strong></div>
                        <div className="text-[10px] text-slate-400">DIN: {g.din || '—'}</div>
                      </td>
                      <td className="py-3 px-3 text-[11px] text-slate-600">
                        <div>Tensile: <strong>{g.tensileStrength || '515 MPa'}</strong></div>
                        <div>Yield: <strong>{g.yieldStrength || '205 MPa'}</strong></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-start gap-2 text-indigo-900">
              <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <strong>Technical Standard Mapping:</strong> Define official ASTM, UNS, EN, and DIN codes so customers can query: <em>"Show me all SS304 products conforming to ASTM A240"</em>.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Grade Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SS304, SS316, SS202, Al6061"
                  value={gradeCode}
                  onChange={e => setGradeCode(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-bold text-indigo-900 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Grade Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stainless Steel 304"
                  value={gradeName}
                  onChange={e => setGradeName(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Standard Body</label>
                <input
                  type="text"
                  placeholder="ASTM / EN / DIN"
                  value={standard}
                  onChange={e => setStandard(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Standard Grade</label>
                <input
                  type="text"
                  placeholder="304 / 316"
                  value={standardGrade}
                  onChange={e => setStandardGrade(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">UNS Number</label>
                <input
                  type="text"
                  placeholder="S30400"
                  value={uns}
                  onChange={e => setUns(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">EN Number</label>
                <input
                  type="text"
                  placeholder="1.4301"
                  value={en}
                  onChange={e => setEn(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Hardness</label>
                <input
                  type="text"
                  placeholder="201 HB max"
                  value={hardness}
                  onChange={e => setHardness(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tensile Strength</label>
                <input
                  type="text"
                  placeholder="515 MPa min"
                  value={tensileStrength}
                  onChange={e => setTensileStrength(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Yield Strength</label>
                <input
                  type="text"
                  placeholder="205 MPa min"
                  value={yieldStrength}
                  onChange={e => setYieldStrength(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setActiveTab('LIST')}
                className="px-4 py-2 text-slate-600 hover:text-slate-900"
              >
                Back to List
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg flex items-center gap-1.5 shadow"
              >
                {loading ? 'Creating...' : <><CheckCircle2 className="w-4 h-4" /> Save Material Grade</>}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
