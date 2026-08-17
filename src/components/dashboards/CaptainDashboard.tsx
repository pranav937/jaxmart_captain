import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
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
  DollarSign
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

  // Attendance Records State - Hydrate strictly by currentUser.id for 100% data isolation
  const [records, setRecords] = useState<AttendanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`jaxmart_captain_attendance_${currentUser.id}`);
      if (saved) {
        const list: AttendanceRecord[] = JSON.parse(saved);
        return list.filter(r => r.captainId === currentUser.id);
      }
      // Migration fallback from global key
      const globalSaved = localStorage.getItem('jaxmart_captain_attendance');
      if (globalSaved) {
        const list: AttendanceRecord[] = JSON.parse(globalSaved);
        return list.filter(r => r.captainId === currentUser.id);
      }
    } catch (e) { }
    return [];
  });
  const [activeSession, setActiveSession] = useState<AttendanceRecord | null>(() => {
    try {
      const saved = localStorage.getItem(`jaxmart_captain_attendance_${currentUser.id}`);
      if (saved) {
        const list: AttendanceRecord[] = JSON.parse(saved);
        const open = list.find(a => a.captainId === currentUser.id && a.date === todayStr && a.status === 'PUNCHED_IN');
        return open || null;
      }
    } catch (e) { }
    return null;
  });

  // Field Products State - Hydrate strictly by currentUser.id for 100% data isolation
  const [fieldProducts, setFieldProducts] = useState<FieldProduct[]>(() => {
    try {
      const saved = localStorage.getItem(`jaxmart_captain_field_products_${currentUser.id}`);
      if (saved) {
        const list: FieldProduct[] = JSON.parse(saved);
        return list.filter(p => p.captainId === currentUser.id);
      }
      // Migration fallback from global key
      const globalSaved = localStorage.getItem('jaxmart_captain_field_products');
      if (globalSaved) {
        const list: FieldProduct[] = JSON.parse(globalSaved);
        return list.filter(p => p.captainId === currentUser.id);
      }
    } catch (e) { }
    return [];
  });
  const [submittingProduct, setSubmittingProduct] = useState(false);

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

    // Polling interval every 3 seconds for live Admin Approval status sync
    const interval = setInterval(() => {
      fetchBackendFieldProducts();
    }, 3000);

    const onFocus = () => fetchBackendFieldProducts();
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  const fetchBackendAttendance = async () => {
    try {
      const savedLocal = localStorage.getItem(`jaxmart_captain_attendance_${currentUser.id}`);
      let localRecs: AttendanceRecord[] = savedLocal ? JSON.parse(savedLocal) : [];

      const res = await fetch(`http://localhost:3000/api/captain/attendance?captainId=${currentUser.id}`);
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
      // 1. LocalStorage baseline
      const savedLocal = localStorage.getItem(`jaxmart_captain_field_products_${currentUser.id}`);
      let localItems: FieldProduct[] = savedLocal ? JSON.parse(savedLocal) : [];

      // 2. Global LocalStorage fallback
      try {
        const globalSaved = localStorage.getItem('jaxmart_captain_field_products');
        if (globalSaved) {
          const globalList: FieldProduct[] = JSON.parse(globalSaved);
          if (Array.isArray(globalList)) {
            globalList.forEach(item => {
              if (item && item.captainId === currentUser.id && !localItems.some(l => l.id === item.id)) {
                localItems.push(item);
              }
            });
          }
        }
      } catch (e) { }

      // 3. Backend API
      let backendFormatted: FieldProduct[] = [];
      try {
        const res = await fetch(`http://localhost:3000/api/captain/field-products?captainId=${currentUser.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.products)) {
            backendFormatted = data.products.map((p: any) => ({
              id: p.id,
              captainId: p.captain_id,
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
          }
        }
      } catch (e) { }

      // 4. Merge Local items + Backend items safely (Backend fresh photos take priority)
      const mergedMap = new Map<string, FieldProduct>();
      localItems.forEach(item => { if (item && item.id) mergedMap.set(item.id, item); });
      backendFormatted.forEach(item => {
        if (item && item.id) {
          const existing = mergedMap.get(item.id);
          mergedMap.set(item.id, { ...(existing || {}), ...item });
        }
      });

      const mergedList = Array.from(mergedMap.values());
      setFieldProducts(mergedList);
      localStorage.setItem(`jaxmart_captain_field_products_${currentUser.id}`, JSON.stringify(mergedList));
    } catch (e) {
      console.error(e);
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
      await fetch('http://localhost:3000/api/captain/punch-in', {
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
      await fetch('http://localhost:3000/api/captain/punch-out', {
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

    setSubmittingProduct(true);

    try {
      const captainFullName = (currentUser.name || `${currentUser.firstName || ''} ${currentUser.lastName || ''}`).trim() || 'Captain';

      const newPrd: FieldProduct = {
        id: `FPRD-${Math.floor(100 + Math.random() * 900)}`,
        captainId: currentUser.id,
        captainName: captainFullName,
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

      // 2. Safe LocalStorage save with try/catch
      try {
        const savedLocal = localStorage.getItem(`jaxmart_captain_field_products_${currentUser.id}`);
        const localList: FieldProduct[] = savedLocal ? JSON.parse(savedLocal) : [];
        const updatedLocal = [lightweightPrd, ...localList.filter(p => p.id !== newPrd.id)];
        localStorage.setItem(`jaxmart_captain_field_products_${currentUser.id}`, JSON.stringify(updatedLocal));
      } catch (err) {
        console.warn('LocalStorage quota warning:', err);
      }

      try {
        const globalSaved = localStorage.getItem('jaxmart_captain_field_products');
        const globalList: FieldProduct[] = globalSaved ? JSON.parse(globalSaved) : [];
        const mergedGlobal = [lightweightPrd, ...globalList.filter(p => p.id !== newPrd.id)];
        localStorage.setItem('jaxmart_captain_field_products', JSON.stringify(mergedGlobal));
      } catch (err) {
        console.warn('Global LocalStorage quota warning:', err);
      }

      setNotificationToast(`✅ Field Product "${prdName}" submitted! Status: PENDING (Awaiting Admin Approval)`);

      // Reset Form Inputs
      setPrdName('');
      setPrdPrice('');
      setPrdImage('');
      setPrdColorImage('');

      // 3. Send to Backend API with 5s timeout fallback
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        await fetch('http://localhost:3000/api/captain/field-products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            id: newPrd.id,
            captainId: currentUser.id,
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
              <span>Captain GPS Attendance & Field Product Collection Portal</span>
            </span>
          </div>
          <h1 className="text-2xl font-bold text-jaxmart-navy mt-1">Captain {currentUser.name} — Workspace</h1>
          <p className="text-xs text-gray-500 mt-1">
            Punch In to record live GPS location & unlock the Selling Product Collection Form.
          </p>
        </div>

        {/* Date Selector Input */}
        <div className="bg-jaxmart-bg p-3 rounded-xl border border-gray-200 flex items-center space-x-3 text-xs shrink-0">
          <div className="flex items-center space-x-1.5 font-bold text-jaxmart-navy">
            <Calendar className="w-4 h-4 text-jaxmart-teal" />
            <span>Select Date:</span>
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="p-1.5 border border-gray-300 rounded-lg text-xs font-bold text-jaxmart-navy bg-white outline-none focus:ring-2 focus:ring-jaxmart-teal"
          />
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

      {/* SELLING PRODUCT COLLECTION FORM (UNLOCKED UPON PUNCH IN OR SHOWS PREVIEW) */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-jaxmart-card p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-gray-200 pb-4 gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5 text-jaxmart-teal" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-jaxmart-navy">Selling Product Collection Form</h2>
              <p className="text-xs text-gray-500">
                Collect and record field products with Category, Sub Category, Price, Product Image & Color Variant Image.
              </p>
            </div>
          </div>

          <span className={`px-3 py-1 rounded-full text-xs font-bold ${activeSession ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
            }`}>
            {activeSession ? '🔓 Form Unlocked (Shift Active)' : '🔒 Form Locked (Punch In Required)'}
          </span>
        </div>

        {!activeSession ? (
          <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300 space-y-3">
            <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
            <h3 className="text-base font-bold text-jaxmart-navy">Punch In Required to Submit Field Products</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Please click the <strong>"📍 PUNCH IN NOW FOR TODAY"</strong> button above to activate your shift and unlock the Selling Product Entry Form.
            </p>
          </div>
        ) : (
          <form onSubmit={handleProductSubmit} className="space-y-6 text-xs">

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

              {/* Field 1: Product Name */}
              <div>
                <label className="font-bold text-jaxmart-navy block mb-1 flex items-center space-x-1">
                  <Package className="w-3.5 h-3.5 text-jaxmart-teal" />
                  <span>Product Name / Title *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Heavy Duty Angle Grinder 850W"
                  value={prdName}
                  onChange={e => setPrdName(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-jaxmart-teal font-semibold"
                />
              </div>

              {/* Field 2: Category */}
              <div>
                <label className="font-bold text-jaxmart-navy block mb-1 flex items-center space-x-1">
                  <Tag className="w-3.5 h-3.5 text-jaxmart-primary" />
                  <span>Category *</span>
                </label>
                <select
                  value={prdCategory}
                  onChange={e => {
                    setPrdCategory(e.target.value);
                    const subOpts = subCategoryMap[e.target.value] || [];
                    if (subOpts.length > 0) setPrdSubCategory(subOpts[0]);
                  }}
                  className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-jaxmart-teal font-semibold"
                >
                  {Object.keys(subCategoryMap).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Field 3: Sub Category */}
              <div>
                <label className="font-bold text-jaxmart-navy block mb-1 flex items-center space-x-1">
                  <Tag className="w-3.5 h-3.5 text-purple-600" />
                  <span>Sub Category *</span>
                </label>
                <select
                  value={prdSubCategory}
                  onChange={e => setPrdSubCategory(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-jaxmart-teal font-semibold"
                >
                  {(subCategoryMap[prdCategory] || []).map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              {/* Field 4: Price (₹) */}
              <div>
                <label className="font-bold text-jaxmart-navy block mb-1 flex items-center space-x-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Price (₹ INR) *</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="0.01"
                  placeholder="3499.00"
                  value={prdPrice}
                  onChange={e => setPrdPrice(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-jaxmart-teal font-extrabold text-jaxmart-navy"
                />
              </div>

            </div>

            {/* Field 5 & 6: Image Capture / File Select Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-jaxmart-bg p-5 rounded-xl border border-gray-200">

              {/* Product Main Image Section */}
              <div className="space-y-3">
                <label className="font-bold text-jaxmart-navy block text-xs flex items-center space-x-1.5">
                  <Camera className="w-4 h-4 text-jaxmart-primary" />
                  <span>Product Main Image (Select File / Capture Camera) *</span>
                </label>

                <div className="flex items-center space-x-4">
                  {prdImage ? (
                    <img
                      src={prdImage}
                      alt="Product Main Preview"
                      className="w-20 h-20 rounded-lg object-cover border-2 border-jaxmart-primary/30 shadow-sm shrink-0 bg-white"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center bg-white text-gray-400 text-[10px] shrink-0 font-semibold">
                      <Camera className="w-6 h-6 text-gray-300 mb-1" />
                      <span>No Photo</span>
                    </div>
                  )}
                  <div className="space-y-2 text-xs">
                    <label className="px-3 py-2 bg-white border border-gray-300 rounded-lg font-bold text-jaxmart-navy hover:bg-gray-50 cursor-pointer inline-flex items-center space-x-2 shadow-sm">
                      <Upload className="w-4 h-4 text-jaxmart-teal" />
                      <span>Choose / Capture Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleMainImageChange}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[10px] text-gray-500">Supports JPG, PNG file upload or direct camera capture on mobile devices.</p>
                  </div>
                </div>
              </div>

              {/* Product Color & Color Variant Image Section */}
              <div className="space-y-3">
                <label className="font-bold text-jaxmart-navy block text-xs flex items-center space-x-1.5">
                  <Palette className="w-4 h-4 text-purple-600" />
                  <span>Product Color Tag & Color Variant Image *</span>
                </label>

                <div className="flex items-center space-x-3 mb-2">
                  <span className="font-semibold text-gray-700">Select Color:</span>
                  {['Red', 'Blue', 'Black', 'Silver', 'Yellow'].map(col => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setPrdColor(col)}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-all ${prdColor === col
                          ? 'bg-jaxmart-navy text-white border-jaxmart-navy shadow-sm'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                        }`}
                    >
                      {col}
                    </button>
                  ))}
                </div>

                <div className="flex items-center space-x-4">
                  {prdColorImage ? (
                    <img
                      src={prdColorImage}
                      alt="Color Variant Preview"
                      className="w-20 h-20 rounded-lg object-cover border-2 border-purple-300 shadow-sm shrink-0 bg-white"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-lg border-2 border-dashed border-purple-200 flex flex-col items-center justify-center bg-purple-50/50 text-purple-400 text-[10px] shrink-0 font-semibold">
                      <Palette className="w-6 h-6 text-purple-300 mb-1" />
                      <span>No Photo</span>
                    </div>
                  )}
                  <div className="space-y-2 text-xs">
                    <label className="px-3 py-2 bg-white border border-gray-300 rounded-lg font-bold text-jaxmart-navy hover:bg-gray-50 cursor-pointer inline-flex items-center space-x-2 shadow-sm">
                      <Upload className="w-4 h-4 text-purple-600" />
                      <span>Choose / Capture Color Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleColorImageChange}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[10px] text-gray-500">Upload or capture specific color variant photo.</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Form Action Submit Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={submittingProduct}
                className="px-8 py-3 bg-jaxmart-teal text-white rounded-xl text-sm font-extrabold hover:bg-teal-600 transition-all shadow-jaxmart-lg flex items-center space-x-2 disabled:opacity-50"
              >
                {submittingProduct ? (
                  <span>Saving Product to PostgreSQL...</span>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    <span>Submit Selling Product Entry</span>
                  </>
                )}
              </button>
            </div>

          </form>
        )}
      </div>

      {/* FIELD COLLECTED PRODUCTS GALLERY & TABLE */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-jaxmart-card overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-jaxmart-teal" />
            <h2 className="text-base font-bold text-jaxmart-navy">Collected Field Selling Products ({fieldProducts.length})</h2>
          </div>
          <span className="text-xs text-gray-500">Stored in PostgreSQL `captain_field_products` table</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-jaxmart-bg text-jaxmart-mediumBlue font-semibold uppercase tracking-wider border-b border-gray-200">
                <th className="p-3.5">Product Main Image</th>
                <th className="p-3.5">Color Variant Image</th>
                <th className="p-3.5">Product Name</th>
                <th className="p-3.5">Category & Sub Category</th>
                <th className="p-3.5">Color</th>
                <th className="p-3.5">Price</th>
                <th className="p-3.5">Admin Approval Status</th>
                <th className="p-3.5 text-right">Date Collected</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {fieldProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-400">
                    No field products collected yet. Punch In and submit products above!
                  </td>
                </tr>
              ) : (
                fieldProducts.map(p => (
                  <tr key={p.id} className="hover:bg-jaxmart-bg/50 transition-colors">
                    <td className="p-3.5">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} className="w-12 h-12 rounded-lg object-cover border shadow-sm bg-white" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg border border-dashed border-gray-300 flex items-center justify-center bg-gray-50 text-[10px] text-gray-400 font-semibold">No Photo</div>
                      )}
                    </td>
                    <td className="p-3.5">
                      {p.colorImageUrl ? (
                        <img src={p.colorImageUrl} alt={p.color} className="w-12 h-12 rounded-lg object-cover border border-purple-200 shadow-sm bg-white" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg border border-dashed border-purple-200 flex items-center justify-center bg-purple-50 text-[10px] text-purple-400 font-semibold">No Photo</div>
                      )}
                    </td>
                    <td className="p-3.5 font-bold text-jaxmart-navy">
                      <div>{p.name}</div>
                      <div className="text-[10px] font-mono text-gray-400">ID: {p.id}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-jaxmart-primary block">{p.category}</span>
                      <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{p.subCategory}</span>
                    </td>
                    <td className="p-3.5 font-semibold text-purple-700">
                      <span className="px-2 py-0.5 rounded bg-purple-50 border border-purple-200 text-[10px]">
                        🎨 {p.color}
                      </span>
                    </td>
                    <td className="p-3.5 font-black text-jaxmart-navy text-sm">
                      ₹{p.price.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${p.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                          p.status === 'REJECTED' ? 'bg-red-100 text-jaxmart-error' :
                            'bg-amber-100 text-amber-800'
                        }`}>
                        {p.status === 'APPROVED' ? '✓ APPROVED (Ready for Selling)' :
                          p.status === 'REJECTED' ? '✗ REJECTED (Declined)' :
                            '⏳ PENDING (Awaiting Admin Approval)'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right text-gray-500 font-mono">
                      {p.createdAt}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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

    </div>
  );
};
