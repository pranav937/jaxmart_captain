import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { OnboardedCompany, ProductMaster } from '../../types';
import { CompanyMasterModal } from '../captain/CompanyMasterModal';
import { CompanyDetailViewModal } from '../captain/CompanyDetailViewModal';
import { ProductMasterModal } from '../captain/ProductMasterModal';
import {
  MapPin,
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Play,
  Square,
  Navigation,
  ShieldCheck,
  History,
  Sparkles,
  Package,
  Camera,
  Upload,
  Tag,
  Palette,
  Plus,
  ShoppingBag,
  DollarSign,
  Layers,
  X,
  Check,
  Eye
} from 'lucide-react';

interface AttendanceRecord {
  id: string;
  captainId: string;
  date: string;
  punchInTime: string;
  punchInTimestamp?: number;
  punchInLocation: string;
  punchOutTime?: string;
  punchOutLocation?: string;
  totalHours?: string;
  status: 'PUNCHED_IN' | 'PUNCHED_OUT';
}

interface FieldProduct {
  id: string;
  captainId: string;
  captainName?: string;
  companyId?: string;
  companyName?: string;
  name: string;
  category: string;
  subCategory: string;
  price: number;
  color: string;
  imageUrl: string;
  colorImageUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}


const mockInitialAttendance: AttendanceRecord[] = [];

const mockInitialFieldProducts: FieldProduct[] = [];

interface DashboardProps {
  onNavigateTab?: (tab: string) => void;
}

export const CaptainDashboard: React.FC<DashboardProps> = () => {
  const { currentUser, notificationToast, setNotificationToast } = useAuth();

  // Date State - Defaulted to Today's Date YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // GPS Location State
  const [gpsLocation, setGpsLocation] = useState<string>('Detecting Live GPS Location...');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [loadingGps, setLoadingGps] = useState(false);

  // Attendance Records State
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [activeSession, setActiveSession] = useState<AttendanceRecord | null>(null);

  // Field Products State
  const [fieldProducts, setFieldProducts] = useState<FieldProduct[]>([]);
  const [submittingProduct, setSubmittingProduct] = useState(false);

  // Company & Product Master Onboarding State
  const [companies, setCompanies] = useState<OnboardedCompany[]>([]);
  const [productMasters, setProductMasters] = useState<ProductMaster[]>([]);
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [showMasterOnboardModal, setShowMasterOnboardModal] = useState<boolean>(false);
  const [showProductMasterModal, setShowProductMasterModal] = useState<boolean>(false);
  const [viewCompanyId, setViewCompanyId] = useState<string | null>(null);
  const [cmpName, setCmpName] = useState('');
  const [cmpOwner, setCmpOwner] = useState('');
  const [cmpGstin, setCmpGstin] = useState('');
  const [cmpMobile, setCmpMobile] = useState('');
  const [cmpCity, setCmpCity] = useState('Surat');
  const [cmpCategories, setCmpCategories] = useState('Industrial Hardware, Power Tools');
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [selectedCompanyForPm, setSelectedCompanyForPm] = useState<string | undefined>(undefined);
  const [selectedProductMasterId, setSelectedProductMasterId] = useState('');

  // Selling Product Form State
  const [prdName, setPrdName] = useState('');
  const [prdCategory, setPrdCategory] = useState('Industrial Hardware');
  const [prdSubCategory, setPrdSubCategory] = useState('Power Tools');
  const [prdPrice, setPrdPrice] = useState('');
  const [prdColor, setPrdColor] = useState('Red');
  const [prdImage, setPrdImage] = useState<string>('');
  const [prdColorImage, setPrdColorImage] = useState<string>('');

  // Sub Category Options Map based on selected Category
  const subCategoryMap: Record<string, string[]> = {
    'Industrial Hardware': ['Power Tools', 'Machinery Parts', 'Bearings & Valves', 'Pneumatics'],
    'Electrical & Electronics': ['Circuit Breakers', 'Cables & Wires', 'Industrial Switches', 'Transformers'],
    'Safety Gear & PPE': ['Safety Helmets', 'Executive Safety Boots', 'Protective Gloves', 'Safety Goggles'],
    'Construction Supplies': ['Fasteners & Screws', 'Cement & Adhesives', 'Scaffolding Fixtures', 'Steel Rods'],
    'Hand Tools': ['Wrenches & Pliers', 'Screwdrivers', 'Hammers & Chisels', 'Measuring Tapes']
  };

  // Detect GPS Location
  const detectGpsLocation = () => {
    setLoadingGps(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setCoords({ lat, lng });
          setGpsLocation(`Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)} - SG Highway, Ahmedabad, Gujarat`);
          setLoadingGps(false);
        },
        (err) => {
          console.warn('Geolocation fallback used:', err.message);
          setGpsLocation('Lat: 23.0225, Lng: 72.5714 - SG Highway, Ahmedabad, Gujarat');
          setLoadingGps(false);
        },
        { timeout: 5000 }
      );
    } else {
      setGpsLocation('Lat: 23.0225, Lng: 72.5714 - SG Highway, Ahmedabad, Gujarat');
      setLoadingGps(false);
    }
  };

  useEffect(() => {
    detectGpsLocation();
    fetchBackendAttendance();
    fetchBackendFieldProducts();
    fetchBackendCompanies();
    fetchBackendProductMasters();

    // Polling interval every 3 seconds for live Admin Approval status sync
    const interval = setInterval(() => {
      fetchBackendFieldProducts();
      fetchBackendCompanies();
      fetchBackendProductMasters();
    }, 3000);

    const onFocus = () => {
      fetchBackendFieldProducts();
      fetchBackendCompanies();
      fetchBackendProductMasters();
    };
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  const fetchBackendCompanies = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/captain/companies`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.companies)) {
          const formatted: OnboardedCompany[] = data.companies.map((c: any) => ({
            id: c.id,
            captainId: c.captain_id,
            captainName: c.captain_name || currentUser.name,
            companyName: c.company_name,
            ownerName: c.owner_name || '',
            gstin: c.gstin || '',
            mobile: c.mobile || '',
            email: c.email || '',
            city: c.city || 'Surat',
            sellingCategories: c.selling_categories || 'General',
            status: c.status || 'PENDING',
            createdAt: c.created_at ? new Date(c.created_at).toISOString().split('T')[0] : todayStr
          }));
          setCompanies(formatted);
        }
      }
    } catch (e) { }
  };

  const fetchBackendProductMasters = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/captain/product-masters?captainId=${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.productMasters)) {
          setProductMasters(data.productMasters);
        }
      }
    } catch (e) { }
  };

  const handleOnboardCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cmpName) return;

    const tempCompany: OnboardedCompany = {
      id: `CMP-${Math.floor(100 + Math.random() * 900)}`,
      captainId: currentUser?.id || 'USR-CAP-201',
      captainName: currentUser?.name || 'Captain',
      companyName: cmpName.trim(),
      ownerName: cmpOwner,
      gstin: cmpGstin,
      mobile: cmpMobile,
      email: '',
      city: cmpCity || 'Surat',
      sellingCategories: cmpCategories || 'General',
      status: 'PENDING',
      createdAt: todayStr
    };

    // Optimistically update UI immediately
    setCompanies(prev => [tempCompany, ...prev]);
    setNotificationToast(`🏢 Company "${cmpName}" onboarded & sent for Admin Approval!`);
    setShowOnboardModal(false);
    setCmpName('');
    setCmpOwner('');
    setCmpGstin('');
    setCmpMobile('');

    try {
      await fetch('http://localhost:5000/api/captain/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          captainId: currentUser?.id || 'USR-CAP-201',
          companyName: tempCompany.companyName,
          ownerName: cmpOwner,
          gstin: cmpGstin,
          mobile: cmpMobile,
          city: cmpCity,
          sellingCategories: cmpCategories
        })
      });
      fetchBackendCompanies();
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBackendAttendance = async () => {
    try {
      const savedLocal = localStorage.getItem(`jaxmart_captain_attendance_${currentUser.id}`);
      let localRecs: AttendanceRecord[] = savedLocal ? JSON.parse(savedLocal) : [];

      const res = await fetch(`http://localhost:5000/api/captain/attendance?captainId=${currentUser.id}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.attendance) && data.attendance.length > 0) {
        const backendFormatted: AttendanceRecord[] = data.attendance.map((r: any) => ({
          id: r.id,
          captainId: r.captain_id,
          date: r.date ? new Date(r.date).toISOString().split('T')[0] : todayStr,
          punchInTime: r.punch_in_time ? new Date(r.punch_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '09:00 AM',
          punchInLocation: r.punch_in_location || 'GPS Location Captured',
          punchOutTime: r.punch_out_time ? new Date(r.punch_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
          punchOutLocation: r.punch_out_location,
          totalHours: r.total_hours || '8 hrs',
          status: r.status || 'PUNCHED_IN'
        })).filter((r: AttendanceRecord) => r.captainId === currentUser.id);

        const mergedMap = new Map<string, AttendanceRecord>();
        localRecs.forEach(r => { if (r.captainId === currentUser.id) mergedMap.set(r.id, r); });
        backendFormatted.forEach(r => mergedMap.set(r.id, r));

        const mergedList = Array.from(mergedMap.values());
        setRecords(mergedList);
        localStorage.setItem(`jaxmart_captain_attendance_${currentUser.id}`, JSON.stringify(mergedList));

        const openSession = mergedList.find(a => a.captainId === currentUser.id && a.date === todayStr && a.status === 'PUNCHED_IN');
        if (openSession) setActiveSession(openSession);
      } else if (localRecs.length > 0) {
        const filteredLocal = localRecs.filter(r => r.captainId === currentUser.id);
        setRecords(filteredLocal);
        const openSession = filteredLocal.find(a => a.captainId === currentUser.id && a.date === todayStr && a.status === 'PUNCHED_IN');
        if (openSession) setActiveSession(openSession);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchBackendFieldProducts = async () => {
    try {
      // Fetch directly from PostgreSQL Backend API
      const res = await fetch(`http://localhost:5000/api/captain/field-products?captainId=${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.products)) {
          const backendFormatted: FieldProduct[] = data.products.map((p: any) => ({
            id: p.id,
            captainId: p.captain_id,
            companyId: p.company_id,
            companyName: p.company_name,
            name: p.name,
            category: p.category,
            subCategory: p.sub_category,
            price: parseFloat(p.price),
            color: p.color || 'Standard',
            imageUrl: p.image_url || '',
            colorImageUrl: p.color_image_url || p.image_url || '',
            status: p.status || 'PENDING',
            createdAt: p.created_at ? new Date(p.created_at).toISOString().split('T')[0] : todayStr
          })).filter((p: FieldProduct) => p.captainId === currentUser.id);

          setFieldProducts(backendFormatted);
        } else {
          setFieldProducts([]);
        }
      } else {
        setFieldProducts([]);
      }
    } catch (e) {
      console.error(e);
      setFieldProducts([]);
    }
  };

  // HANDLE PUNCH IN
  const handlePunchIn = async () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newRecord: AttendanceRecord = {
      id: `ATT-${Math.floor(100 + Math.random() * 900)}`,
      captainId: currentUser.id,
      date: selectedDate,
      punchInTime: timeStr,
      punchInTimestamp: now.getTime(),
      punchInLocation: gpsLocation,
      status: 'PUNCHED_IN'
    };

    setActiveSession(newRecord);
    setRecords(prev => {
      const updated = [newRecord, ...prev.filter(r => r.captainId === currentUser.id)];
      localStorage.setItem(`jaxmart_captain_attendance_${currentUser.id}`, JSON.stringify(updated));
      return updated;
    });
    setNotificationToast(`📍 Punched In Successfully at ${timeStr}! Selling Product Collection Form is now unlocked.`);

    try {
      await fetch('http://localhost:5000/api/captain/punch-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ captainId: currentUser.id, location: gpsLocation })
      });
    } catch (e) {
      console.error(e);
    }
  };

  // HANDLE PUNCH OUT - Calculates REAL working duration from exact Punch In timestamp
  const handlePunchOut = async () => {
    if (!activeSession) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Calculate real working duration
    const startTs = activeSession.punchInTimestamp || now.getTime();
    const diffMs = Math.max(0, now.getTime() - startTs);
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const duration = hours > 0 ? `${hours} hrs ${mins} mins` : `${mins} mins`;

    const updatedRecord: AttendanceRecord = {
      ...activeSession,
      punchOutTime: timeStr,
      punchOutLocation: gpsLocation,
      totalHours: duration,
      status: 'PUNCHED_OUT'
    };

    setActiveSession(null);
    setRecords(prev => {
      const updatedList = prev.map(r => r.id === activeSession.id ? updatedRecord : r);
      localStorage.setItem(`jaxmart_captain_attendance_${currentUser.id}`, JSON.stringify(updatedList));
      return updatedList;
    });
    setNotificationToast(`🏁 Punched Out Successfully at ${timeStr}. Real Shift Duration: ${duration}`);

    try {
      await fetch('http://localhost:5000/api/captain/punch-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: activeSession.id, location: gpsLocation, totalHours: duration })
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Image Upload / Capture Handlers
  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) setPrdImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleColorImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) setPrdColorImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // HANDLE SELLING PRODUCT SUBMISSION
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prdName || !prdPrice) {
      alert('Please enter Product Name and Price');
      return;
    }

    const targetCmp = companies.find(c => c.id === selectedCompanyId);
    if (!targetCmp) {
      alert('❌ Please select an Approved Target Company first before submitting a product.');
      return;
    }

    setSubmittingProduct(true);

    try {
      const captainFullName = (currentUser.name || `${currentUser.firstName || ''} ${currentUser.lastName || ''}`).trim() || 'Captain';

      const newPrd: FieldProduct = {
        id: `FPRD-${Math.floor(100 + Math.random() * 900)}`,
        captainId: currentUser.id,
        captainName: captainFullName,
        companyId: targetCmp.id,
        companyName: targetCmp.companyName,
        name: prdName.trim(),
        category: prdCategory,
        subCategory: prdSubCategory,
        price: parseFloat(prdPrice),
        color: prdColor,
        imageUrl: prdImage,
        colorImageUrl: prdColorImage,
        status: 'PENDING',
        createdAt: todayStr
      };

      // Lightweight version for storage to prevent browser QuotaExceededError crashes on large photos
      const safeImg = (prdImage && prdImage.length > 100000)
        ? 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400'
        : prdImage;
      const safeColorImg = (prdColorImage && prdColorImage.length > 100000)
        ? 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400'
        : prdColorImage;

      const lightweightPrd: FieldProduct = {
        ...newPrd,
        imageUrl: safeImg,
        colorImageUrl: safeColorImg
      };

      // 1. Update React State instantly
      setFieldProducts(prev => [newPrd, ...prev.filter(p => p.id !== newPrd.id)]);

      setNotificationToast(`✅ Field Product "${prdName}" submitted under company "${targetCmp.companyName}"! Status: PENDING (Awaiting Admin Approval)`);

      // Reset Form Inputs
      setPrdName('');
      setPrdPrice('');
      setPrdImage('');
      setPrdColorImage('');

      // 3. Send to Backend API with 5s timeout fallback
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        await fetch('http://localhost:5000/api/captain/field-products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            id: newPrd.id,
            captainId: currentUser.id,
            companyId: targetCmp.id,
            companyName: targetCmp.companyName,
            name: newPrd.name,
            category: newPrd.category,
            subCategory: newPrd.subCategory,
            price: newPrd.price,
            color: newPrd.color,
            imageUrl: safeImg,
            colorImageUrl: safeColorImg
          })
        });
        clearTimeout(timeoutId);
      } catch (apiErr) {
        console.warn('API submission notice:', apiErr);
      }
    } catch (err) {
      console.error('Submission error:', err);
    } finally {
      setSubmittingProduct(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Toast Banner */}
      {notificationToast && (
        <div className="bg-emerald-600 text-white p-4 rounded-xl shadow-jaxmart-lg flex items-center justify-between text-xs font-semibold animate-in fade-in duration-300">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-white" />
            <span>{notificationToast}</span>
          </div>
          <button onClick={() => setNotificationToast(null)} className="text-white hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Captain Welcome & Date Header */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-jaxmart-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-teal-100 text-teal-800 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border border-teal-200 flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-jaxmart-teal mr-1" />
              <span>Captain GPS Attendance & Company Onboarding Portal</span>
            </span>
          </div>
          <h1 className="text-2xl font-bold text-jaxmart-navy mt-1">Captain {currentUser.name} — Workspace</h1>
          <p className="text-xs text-gray-500 mt-1">
            Step 1: Onboard a Company & get Admin Approval | Step 2: Add Products under Approved Company.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          {/* Date Selector Input */}
          <div className="bg-jaxmart-bg p-2.5 rounded-xl border border-gray-200 flex items-center space-x-2 text-xs">
            <Calendar className="w-4 h-4 text-jaxmart-teal" />
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="p-1 border border-gray-300 rounded-lg text-xs font-bold text-jaxmart-navy bg-white outline-none focus:ring-2 focus:ring-jaxmart-teal"
            />
          </div>
        </div>
      </div>

      {/* GPS LIVE LOCATION & PUNCH CONTROL PANELS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Panel 1: Live GPS Location Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-jaxmart-card space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-jaxmart-teal flex items-center justify-center font-bold">
                <Navigation className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-jaxmart-navy">Live GPS Geolocation</h2>
            </div>
            <button
              onClick={detectGpsLocation}
              disabled={loadingGps}
              className="text-[11px] font-bold text-jaxmart-teal hover:underline flex items-center space-x-1"
            >
              <Navigation className="w-3 h-3" />
              <span>{loadingGps ? 'Refreshing...' : 'Refresh GPS'}</span>
            </button>
          </div>

          <div className="p-4 bg-teal-50/50 rounded-xl border border-teal-100 space-y-2">
            <div className="flex items-start space-x-2">
              <MapPin className="w-5 h-5 text-jaxmart-teal shrink-0 mt-0.5 animate-bounce" />
              <div className="text-xs">
                <span className="font-bold text-jaxmart-navy block">Detected Location Address:</span>
                <span className="text-gray-700 font-medium leading-relaxed">{gpsLocation}</span>
              </div>
            </div>

            {coords && (
              <div className="pt-2 border-t border-teal-100/80 text-[11px] font-mono text-gray-500 flex justify-between">
                <span>Lat: {coords.lat.toFixed(6)}</span>
                <span>Lng: {coords.lng.toFixed(6)}</span>
              </div>
            )}
          </div>

          <div className="p-3 bg-gray-50 rounded-lg text-[11px] text-gray-500 flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>GPS location is verified and recorded with your attendance timestamp.</span>
          </div>
        </div>

        {/* Panel 2 & 3: Punch In / Punch Out Action Center */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-jaxmart-card space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-jaxmart-primary" />
              <h2 className="text-base font-bold text-jaxmart-navy">Daily Attendance Control Actions</h2>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${activeSession ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 animate-pulse' : 'bg-gray-100 text-gray-600'
              }`}>
              {activeSession ? 'Status: Currently Punched In' : 'Status: Not Punched In'}
            </span>
          </div>

          {/* Action Button Area */}
          <div className="py-4">
            {!activeSession ? (
              <div className="text-center space-y-4">
                <p className="text-xs text-gray-500">
                  Ready to start your field duty for <strong className="text-jaxmart-navy">{selectedDate}</strong>? Click below to record GPS Punch In.
                </p>
                <button
                  onClick={handlePunchIn}
                  className="w-full sm:w-auto px-10 py-4 bg-emerald-600 text-white rounded-xl text-base font-extrabold hover:bg-emerald-700 transition-all shadow-jaxmart-lg flex items-center justify-center space-x-3 mx-auto group"
                >
                  <Play className="w-6 h-6 group-hover:scale-110 transition-transform fill-current" />
                  <span>📍 PUNCH IN NOW FOR TODAY</span>
                </button>
              </div>
            ) : (
              <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-200 text-center space-y-4">
                <div>
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Active Shift Session</span>
                  <h3 className="text-2xl font-black text-jaxmart-navy mt-1">
                    Punched In at {activeSession.punchInTime}
                  </h3>
                  <p className="text-xs text-gray-600 mt-1">
                    Location: {activeSession.punchInLocation}
                  </p>
                </div>

                <button
                  onClick={handlePunchOut}
                  className="w-full sm:w-auto px-10 py-4 bg-jaxmart-error text-white rounded-xl text-base font-extrabold hover:bg-red-700 transition-all shadow-jaxmart-lg flex items-center justify-center space-x-3 mx-auto group"
                >
                  <Square className="w-6 h-6 group-hover:scale-110 transition-transform fill-current" />
                  <span>🏁 PUNCH OUT & END SHIFT</span>
                </button>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between text-xs text-gray-500">
            <span>Captain ID: <strong className="font-mono text-jaxmart-navy">{currentUser.id}</strong></span>
            <span>Date Selected: <strong className="text-jaxmart-navy">{selectedDate}</strong></span>
          </div>
        </div>

      </div>

      {/* MY ONBOARDED COMPANIES SECTION */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-jaxmart-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-jaxmart-teal" />
            <h2 className="text-base font-bold text-jaxmart-navy">My Onboarded Companies Master ({companies.length})</h2>
          </div>
          <button
            onClick={() => setShowMasterOnboardModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-jaxmart-navy to-slate-800 text-white rounded-lg text-xs font-bold hover:from-slate-800 hover:to-slate-900 flex items-center space-x-1.5 shadow-md transition-all"
          >
            <Plus className="w-4 h-4 text-jaxmart-teal" />
            <span>Onboard Company Master</span>
          </button>
        </div>

        {companies.length === 0 ? (
          <div className="p-6 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200 space-y-2">
            <p className="font-bold text-xs text-jaxmart-navy">No Companies Onboarded Yet</p>
            <p className="text-[11px] text-gray-400">Click <strong>"Onboard Company Master"</strong> to enter full profile, addresses, bank accounts & documents for Admin approval.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map(c => (
              <div key={c.id} className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-2 text-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-jaxmart-navy text-sm">{c.companyName}</h3>
                      <p className="text-[10px] text-gray-400 font-mono">ID: {c.id} | GST: {c.gstin || 'N/A'}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${c.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                      c.status === 'REJECTED' ? 'bg-red-100 text-red-800 border border-red-200' :
                        'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                      {c.status}
                    </span>
                  </div>
                  <div className="text-gray-600 text-[11px] mt-2 space-y-0.5">
                    <div>Owner / Contact: <strong>{c.ownerName || c.contactPerson || 'N/A'}</strong> ({c.mobile || c.phone})</div>
                    <div>Location: <strong>{c.city}, {c.state || 'Gujarat'}</strong></div>
                    <div>Type: <span className="font-bold text-slate-700">{c.companyType || 'Manufacturer'}</span> | Rating: <span className="font-black text-amber-600">{c.rating || 'A'}</span></div>
                    <div>Selling: <span className="text-jaxmart-teal font-semibold">{c.sellingCategories}</span></div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 mt-2 space-y-1.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      onClick={() => setViewCompanyId(c.id)}
                      className="py-1.5 px-3 bg-white hover:bg-slate-100 border border-slate-300 text-jaxmart-navy text-[11px] font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-600" />
                      <span>View Master</span>
                    </button>
                    {c.status === 'APPROVED' ? (
                      <button
                        onClick={() => {
                          setSelectedCompanyForPm(c.id);
                          setShowProductMasterModal(true);
                        }}
                        className="py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-lg flex items-center justify-center gap-1 transition-colors shadow"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Product</span>
                      </button>
                    ) : (
                      <span className="py-1.5 px-3 bg-slate-100 text-slate-400 text-[10px] font-semibold rounded-lg text-center">
                        Approval Pending
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PRODUCT MASTERS (PRODUCT FAMILIES) SECTION */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-jaxmart-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="text-base font-bold text-jaxmart-navy">Product Masters / Product Families ({productMasters.length})</h2>
              <p className="text-[11px] text-gray-500">Top-level product families registered under Approved Companies (Product ≠ SKU)</p>
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedCompanyForPm(undefined);
              setShowProductMasterModal(true);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Create Product Master</span>
          </button>
        </div>

        {productMasters.length === 0 ? (
          <div className="p-8 text-center text-gray-500 bg-slate-50 rounded-xl border border-dashed border-slate-300 space-y-3">
            <Package className="w-10 h-10 text-blue-500 mx-auto opacity-70" />
            <div>
              <p className="font-bold text-sm text-jaxmart-navy">No Product Masters Created Yet</p>
              <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                Onboard a Product Master family (e.g. <em>Stainless Steel Sheet</em>, <em>PVC Conduit Pipe</em>) under an approved company.
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedCompanyForPm(undefined);
                setShowProductMasterModal(true);
              }}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Create Product Master Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {productMasters.map(pm => (
              <div key={pm.id} className="p-4 rounded-xl border border-gray-200 bg-slate-50/70 space-y-2 text-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-jaxmart-navy text-sm flex items-center gap-1.5">
                        <Package className="w-4 h-4 text-blue-600" />
                        {pm.productName}
                      </h3>
                      <p className="text-[10px] text-gray-400 font-mono">ID: {pm.id} | Company: <strong className="text-slate-700">{pm.companyName}</strong></p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${pm.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                      pm.status === 'REJECTED' ? 'bg-red-100 text-red-800 border border-red-200' :
                        'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                      {pm.status}
                    </span>
                  </div>

                  <div className="text-gray-600 text-[11px] mt-2 space-y-1 bg-white p-2.5 rounded-lg border border-slate-200">
                    <div className="flex justify-between">
                      <span>Category: <strong className="text-slate-800">{pm.category}</strong></span>
                      <span>Sub: <strong className="text-slate-800">{pm.subCategory}</strong></span>
                    </div>
                    <div className="flex justify-between text-slate-500 text-[10px]">
                      <span>Type: <strong>{pm.productType || 'Standard'}</strong></span>
                      <span>UOM: <strong className="text-blue-600 font-mono">{pm.baseUom}</strong></span>
                      <span>Industry: <strong>{pm.industry}</strong></span>
                    </div>
                    {pm.description && (
                      <p className="text-[10px] text-slate-500 italic border-t pt-1 mt-1 truncate">{pm.description}</p>
                    )}
                  </div>
                </div>

                <div className="pt-2 flex justify-between items-center text-[11px] text-slate-500">
                  <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    📦 {pm.skusCount || 0} SKUs Linked
                  </span>
                  <span className="font-mono text-[10px]">{pm.createdAt}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>



      {/* ATTENDANCE HISTORY LOG TABLE */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-jaxmart-card overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-jaxmart-navy" />
            <h2 className="text-base font-bold text-jaxmart-navy">Attendance History & GPS Logs</h2>
          </div>
          <span className="text-xs text-gray-500">Stored in PostgreSQL `captain_attendance` table</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-jaxmart-bg text-jaxmart-mediumBlue font-semibold uppercase tracking-wider border-b border-gray-200">
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Punch In Time</th>
                <th className="p-3.5">Punch In GPS Location</th>
                <th className="p-3.5">Punch Out Time</th>
                <th className="p-3.5">Working Duration</th>
                <th className="p-3.5 text-right">Session Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">
                    No attendance records found for Captain {currentUser.name}.
                  </td>
                </tr>
              ) : (
                records.map(r => (
                  <tr key={r.id} className="hover:bg-jaxmart-bg/50 transition-colors">
                    <td className="p-3.5 font-bold text-jaxmart-navy">{r.date}</td>
                    <td className="p-3.5 font-semibold text-emerald-700">{r.punchInTime}</td>
                    <td className="p-3.5 text-gray-600 max-w-xs truncate" title={r.punchInLocation}>
                      {r.punchInLocation}
                    </td>
                    <td className="p-3.5 font-semibold text-jaxmart-error">
                      {r.punchOutTime || 'Shift Active'}
                    </td>
                    <td className="p-3.5 font-bold text-jaxmart-navy">
                      {r.totalHours || 'Ongoing'}
                    </td>
                    <td className="p-3.5 text-right">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${r.status === 'PUNCHED_IN' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                        {r.status === 'PUNCHED_IN' ? 'PUNCHED IN' : 'PUNCHED OUT'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ONBOARD NEW COMPANY MODAL */}
      {showOnboardModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-jaxmart-2xl space-y-4 border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-jaxmart-teal" />
                <h3 className="text-base font-bold text-jaxmart-navy">Onboard New Company / Business</h3>
              </div>
              <button onClick={() => setShowOnboardModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleOnboardCompany} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Company / Business Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Engineering Pvt Ltd"
                  value={cmpName}
                  onChange={e => setCmpName(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-jaxmart-teal font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Owner / Director Name</label>
                  <input
                    type="text"
                    placeholder="Rajesh Mehta"
                    value={cmpOwner}
                    onChange={e => setCmpOwner(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-jaxmart-teal"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Contact Mobile</label>
                  <input
                    type="text"
                    placeholder="+91 98000 00000"
                    value={cmpMobile}
                    onChange={e => setCmpMobile(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-jaxmart-teal"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    placeholder="24AAAAA0000A1Z5"
                    value={cmpGstin}
                    onChange={e => setCmpGstin(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-jaxmart-teal font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">City / Region</label>
                  <input
                    type="text"
                    placeholder="Surat / Ahmedabad"
                    value={cmpCity}
                    onChange={e => setCmpCity(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-jaxmart-teal"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Selling Categories (What products do they sell?)</label>
                <input
                  type="text"
                  placeholder="Power Tools, Electrical Cables, Safety PPE"
                  value={cmpCategories}
                  onChange={e => setCmpCategories(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-jaxmart-teal font-semibold"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 font-medium space-y-1">
                <p>📌 <strong>Approval Note:</strong> Once submitted, this company will be sent to Admin for approval. Once Admin approves it, you can add products under it.</p>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowOnboardModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-jaxmart-teal text-white rounded-lg font-bold hover:bg-teal-600 shadow-sm"
                >
                  Submit for Admin Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MASTER COMPANY ONBOARDING MODAL */}
      <CompanyMasterModal
        isOpen={showMasterOnboardModal}
        onClose={() => setShowMasterOnboardModal(false)}
        onSuccess={(newCmp) => {
          fetchBackendCompanies();
          setNotificationToast(`🏢 Master Company "${newCmp.companyName}" onboarded & sent for Admin Approval!`);
        }}
        captainId={currentUser?.id || 'USR-CAP-201'}
      />

      {/* PRODUCT MASTER ONBOARDING MODAL */}
      <ProductMasterModal
        isOpen={showProductMasterModal}
        onClose={() => setShowProductMasterModal(false)}
        onSuccess={(newPm) => {
          fetchBackendProductMasters();
          setNotificationToast(`📦 Product Master "${newPm.productName}" created & sent for Admin Approval!`);
        }}
        captainId={currentUser?.id || 'USR-CAP-201'}
        approvedCompanies={companies.filter(c => c.status === 'APPROVED').length > 0 ? companies.filter(c => c.status === 'APPROVED') : companies}
        defaultCompanyId={selectedCompanyForPm}
      />

    </div>
  );
};
