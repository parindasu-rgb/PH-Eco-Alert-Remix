import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  MapPin,
  AlertTriangle,
  CheckCircle2,
  LocateFixed,
  Compass,
  Check,
  Building2,
  Navigation,
} from 'lucide-react';
import { Language } from '../types';
import {
  FACULTY_PH_CENTER,
  FACULTY_PH_MAX_RADIUS_METERS,
  FACULTY_PH_SPOTS,
  GEOFENCE_ERROR_MESSAGE,
  isInsideFacultyOfPublicHealth,
  findNearestPublicHealthSpot,
  PublicHealthSpot,
} from '../utils/geofence';

interface MapPickerProps {
  latitude: number;
  longitude: number;
  selectedSpotId: string;
  onChangeLocation: (lat: number, lng: number, spot?: PublicHealthSpot) => void;
  onSelectSpot: (spot: PublicHealthSpot) => void;
  onBoundaryStatusChange?: (isInside: boolean) => void;
  lang: Language;
}

export const MapPicker: React.FC<MapPickerProps> = ({
  latitude,
  longitude,
  selectedSpotId,
  onChangeLocation,
  onSelectSpot,
  onBoundaryStatusChange,
  lang,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const boundaryCircleRef = useRef<L.Circle | null>(null);

  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [detectedSpotInfo, setDetectedSpotInfo] = useState<{
    spot: PublicHealthSpot;
    distanceMeters: number;
  } | null>(() => {
    if (latitude && longitude) {
      return findNearestPublicHealthSpot(latitude, longitude);
    }
    return null;
  });

  const [isInsideArea, setIsInsideArea] = useState<boolean>(() =>
    isInsideFacultyOfPublicHealth(
      latitude || FACULTY_PH_CENTER.lat,
      longitude || FACULTY_PH_CENTER.lng
    )
  );
  const [statusMsg, setStatusMsg] = useState<{
    text: string;
    type: 'success' | 'error' | 'info' | 'warning';
  } | null>(null);

  // Custom emerald pin
  const customPin = L.divIcon({
    className: 'custom-leaflet-pin',
    html: `
      <div class="relative flex items-center justify-center w-10 h-10 bg-[#16A085] text-white rounded-full shadow-xl border-2 border-white transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });

  const checkAndSetLocation = (lat: number, lng: number, manualSpot?: PublicHealthSpot) => {
    const valid = isInsideFacultyOfPublicHealth(lat, lng);
    setIsInsideArea(valid);
    if (onBoundaryStatusChange) {
      onBoundaryStatusChange(valid);
    }

    const nearest = manualSpot
      ? { spot: manualSpot, distanceMeters: 0 }
      : findNearestPublicHealthSpot(lat, lng);

    setDetectedSpotInfo(nearest);

    if (manualSpot) {
      onSelectSpot(manualSpot);
      onChangeLocation(lat, lng, manualSpot);
    } else {
      onSelectSpot(nearest.spot);
      onChangeLocation(lat, lng, nearest.spot);
    }

    if (!valid) {
      setStatusMsg({
        text: GEOFENCE_ERROR_MESSAGE[lang],
        type: 'error',
      });
    } else {
      setStatusMsg({
        text:
          lang === 'th'
            ? 'ตำแหน่งถูกต้อง (อยู่ในพื้นที่คณะสาธารณสุขศาสตร์ มข.)'
            : 'Valid location (within Faculty of Public Health KKU area)',
        type: 'success',
      });
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialLat = latitude || FACULTY_PH_CENTER.lat;
    const initialLng = longitude || FACULTY_PH_CENTER.lng;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 17,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors | Faculty of Public Health KKU',
        maxZoom: 19,
      }).addTo(map);

      // Boundary circle for Faculty of Public Health
      const circle = L.circle([FACULTY_PH_CENTER.lat, FACULTY_PH_CENTER.lng], {
        radius: FACULTY_PH_MAX_RADIUS_METERS,
        color: '#16A085',
        fillColor: '#2ECC71',
        fillOpacity: 0.12,
        weight: 2,
        dashArray: '5, 5',
      }).addTo(map);

      boundaryCircleRef.current = circle;

      const marker = L.marker([initialLat, initialLng], {
        draggable: true,
        icon: customPin,
      }).addTo(map);

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        checkAndSetLocation(pos.lat, pos.lng);
      });

      map.on('click', (e: L.LeafletMouseEvent) => {
        marker.setLatLng(e.latlng);
        checkAndSetLocation(e.latlng.lat, e.latlng.lng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;

      // Initial validation
      const valid = isInsideFacultyOfPublicHealth(initialLat, initialLng);
      setIsInsideArea(valid);
      if (onBoundaryStatusChange) {
        onBoundaryStatusChange(valid);
      }
    } else {
      // Sync map if lat/lng changed externally
      const currentPos = markerRef.current?.getLatLng();
      if (
        !currentPos ||
        Math.abs(currentPos.lat - initialLat) > 0.00001 ||
        Math.abs(currentPos.lng - initialLng) > 0.00001
      ) {
        mapInstanceRef.current.setView([initialLat, initialLng], mapInstanceRef.current.getZoom());
        if (markerRef.current) {
          markerRef.current.setLatLng([initialLat, initialLng]);
        }
      }
    }

    setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 200);
  }, [latitude, longitude]);

  // Requirement 2.1 & 2.2: Pin Current Location using Geolocation API with enableHighAccuracy: true
  const handlePinCurrentLocation = () => {
    if (!navigator.geolocation) {
      setStatusMsg({
        text:
          lang === 'th'
            ? 'อุปกรณ์หรือเบราว์เซอร์ของคุณไม่รองรับ Geolocation API'
            : 'Device or browser does not support Geolocation',
        type: 'error',
      });
      return;
    }

    setIsLocating(true);
    setStatusMsg({
      text:
        lang === 'th'
          ? 'กำลังตรวจสอบพิกัด GPS ความแม่นยำสูง...'
          : 'Detecting high-accuracy GPS coordinates...',
      type: 'info',
    });

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng, accuracy } = pos.coords;
        setIsLocating(false);

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([lat, lng], 18);
          markerRef.current.setLatLng([lat, lng]);
        }

        const valid = isInsideFacultyOfPublicHealth(lat, lng);
        setIsInsideArea(valid);
        if (onBoundaryStatusChange) {
          onBoundaryStatusChange(valid);
        }

        // Match with nearest spot in Faculty of Public Health
        const nearest = findNearestPublicHealthSpot(lat, lng);
        setDetectedSpotInfo(nearest);
        onSelectSpot(nearest.spot);
        onChangeLocation(lat, lng, nearest.spot);

        if (!valid) {
          setStatusMsg({
            text:
              lang === 'th'
                ? `พิกัด GPS ปัจจุบันอยู่นอกพื้นที่คณะสาธารณสุขศาสตร์ มข. (จุดที่ใกล้ที่สุดคือ: ${nearest.spot.nameTh})`
                : `Current GPS location is outside Faculty of Public Health area (Nearest: ${nearest.spot.nameEn})`,
            type: 'error',
          });
        } else if (accuracy && accuracy > 80) {
          setStatusMsg({
            text:
              lang === 'th'
                ? `ระบุตำแหน่งสำเร็จ (พิกัดมีความคลาดเคลื่อนประมาณ ±${Math.round(accuracy)} ม.) แนะนำจุด: ${nearest.spot.nameTh}`
                : `Location detected (accuracy ~±${Math.round(accuracy)}m). Suggested spot: ${nearest.spot.nameEn}`,
            type: 'warning',
          });
        } else {
          setStatusMsg({
            text:
              lang === 'th'
                ? `ตรวจพบตำแหน่งสำเร็จ: อยู่ใกล้ ${nearest.spot.nameTh}`
                : `Location verified: Near ${nearest.spot.nameEn}`,
            type: 'success',
          });
        }
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setIsLocating(false);

        let errorMsg =
          lang === 'th'
            ? 'ไม่สามารถดึงตำแหน่ง GPS ได้ กรุณาแตะเลือกสถานที่จาก Choice Chips ด้านล่าง'
            : 'Unable to retrieve GPS location. Please select a spot from the Choice Chips below.';

        if (err.code === 1) {
          // PERMISSION_DENIED
          errorMsg =
            lang === 'th'
              ? 'คุณไม่อนุญาตการเข้าถึงตำแหน่ง GPS กรุณาเปิดสิทธิ์ Location หรือแตะเลือกอาคารด้านล่าง'
              : 'Location permission denied. Please enable permissions or select a spot below.';
        } else if (err.code === 2) {
          // POSITION_UNAVAILABLE
          errorMsg =
            lang === 'th'
              ? 'ไม่สามารถรับสัญญาณพิกัด GPS ได้ในขณะนี้ กรุณาแตะเลือกตำแหน่งบนแผนที่หรือ Choice Chips ด้านล่าง'
              : 'GPS position unavailable. Please tap on map or select a spot below.';
        } else if (err.code === 3) {
          // TIMEOUT
          errorMsg =
            lang === 'th'
              ? 'หมดเวลาค้นหาพิกัด GPS กรุณาลองใหม่อีกครั้ง หรือเลือกอาคารจากรายการด้านล่าง'
              : 'GPS request timed out. Please try again or select a spot below.';
        }

        setStatusMsg({
          text: errorMsg,
          type: 'error',
        });
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  // Requirement 2.4 & 2.5: Select spot from Choice Chip
  const handleSelectChoiceChip = (spot: PublicHealthSpot) => {
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([spot.lat, spot.lng], 18);
      markerRef.current.setLatLng([spot.lat, spot.lng]);
    }
    checkAndSetLocation(spot.lat, spot.lng, spot);
  };

  const handleResetToFacultyCenter = () => {
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([FACULTY_PH_CENTER.lat, FACULTY_PH_CENTER.lng], 17);
      markerRef.current.setLatLng([FACULTY_PH_CENTER.lat, FACULTY_PH_CENTER.lng]);
    }
    checkAndSetLocation(FACULTY_PH_CENTER.lat, FACULTY_PH_CENTER.lng);
  };

  const activeSpot = FACULTY_PH_SPOTS.find((s) => s.id === selectedSpotId) || FACULTY_PH_SPOTS[0];

  return (
    <div className="space-y-4">
      {/* 1. Leaflet Map Box */}
      <div className="relative w-full h-64 sm:h-80 rounded-3xl overflow-hidden border-2 border-slate-200 shadow-inner z-0">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Boundary Badge Overlay */}
        <div className="absolute top-3 right-3 z-[400] bg-white/95 backdrop-blur-md border border-emerald-300 shadow-md px-3 py-1.5 rounded-full text-[11px] font-semibold text-slate-800 flex items-center gap-1.5 pointer-events-none">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>{lang === 'th' ? 'ขอบเขต: คณะสาธารณสุขศาสตร์ มข.' : 'Faculty of Public Health Zone'}</span>
        </div>
      </div>

      {/* 2. [ 📍 ปักหมุด ณ ที่อยู่ ] Prominent Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-200">
        <button
          type="button"
          onClick={handlePinCurrentLocation}
          disabled={isLocating}
          className="flex-1 inline-flex items-center justify-center gap-2.5 px-5 py-3 text-xs sm:text-sm font-bold text-white bg-[#16A085] hover:bg-[#138a72] rounded-2xl shadow-sm hover:shadow-md transition-all disabled:opacity-60 cursor-pointer"
        >
          <LocateFixed className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
          <span>
            {isLocating
              ? lang === 'th'
                ? 'กำลังค้นหาพิกัด GPS...'
                : 'Locating GPS...'
              : lang === 'th'
              ? '📍 ปักหมุด ณ ที่อยู่'
              : '📍 Pin Current Location'}
          </span>
        </button>

        <button
          type="button"
          onClick={handleResetToFacultyCenter}
          title={lang === 'th' ? 'กลับจุดศูนย์กลางคณะ' : 'Reset to faculty center'}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-3 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-100 rounded-2xl border border-slate-200 transition-colors cursor-pointer"
        >
          <Compass className="w-4 h-4 text-[#16A085]" />
          <span className="text-xs">{lang === 'th' ? 'ศูนย์กลางคณะ' : 'Center'}</span>
        </button>
      </div>

      {/* Notification Banner / Status */}
      {statusMsg && (
        <div
          className={`flex items-start gap-2.5 text-xs px-4 py-3 rounded-2xl border transition-all animate-in fade-in ${
            statusMsg.type === 'error'
              ? 'text-rose-800 bg-rose-50 border-rose-300'
              : statusMsg.type === 'warning'
              ? 'text-amber-800 bg-amber-50 border-amber-300'
              : statusMsg.type === 'info'
              ? 'text-blue-800 bg-blue-50 border-blue-200'
              : 'text-emerald-800 bg-emerald-50 border-emerald-300'
          }`}
        >
          {statusMsg.type === 'error' ? (
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
          ) : statusMsg.type === 'warning' ? (
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
          ) : statusMsg.type === 'info' ? (
            <Navigation className="w-4 h-4 shrink-0 text-blue-600 animate-pulse mt-0.5" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
          )}
          <span className="leading-relaxed">{statusMsg.text}</span>
        </div>
      )}

      {/* Requirement 2.2: Recommended / Detected Spot Banner */}
      {detectedSpotInfo && isInsideArea && (
        <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-emerald-50/90 border-2 border-emerald-300/80 shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#16A085] text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                {lang === 'th' ? 'สถานที่ที่ตรวจพบ' : 'Detected Landmark'}
              </span>
              <p className="text-xs sm:text-sm font-black text-slate-900">
                📍 {lang === 'th' ? detectedSpotInfo.spot.nameTh : detectedSpotInfo.spot.nameEn}
              </p>
            </div>
          </div>
          {detectedSpotInfo.distanceMeters > 0 && (
            <span className="text-[11px] font-semibold text-emerald-700 bg-white px-2.5 py-1 rounded-full border border-emerald-200 shrink-0">
              ~{detectedSpotInfo.distanceMeters} {lang === 'th' ? 'ม.' : 'm'}
            </span>
          )}
        </div>
      )}

      {/* Requirement 2.4: Selectable Choice Chips for "อาคาร / จุดเกิดเหตุ" */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between">
          <label className="text-xs sm:text-sm font-bold text-slate-800 block">
            {lang === 'th' ? 'อาคาร / จุดเกิดเหตุ' : 'Building / Incident Spot'}
          </label>
          <span className="text-[11px] text-slate-500 font-medium">
            {lang === 'th' ? 'เลือกได้ 1 รายการ' : 'Select 1 spot'}
          </span>
        </div>

        {/* Choice Chips (Pill-shaped buttons, flex-wrap, no dropdown/radio/checkbox) */}
        <div className="flex flex-wrap gap-2 sm:gap-2.5" role="group" aria-label="Building or Spot Selection">
          {FACULTY_PH_SPOTS.map((spot) => {
            const isSelected = selectedSpotId === spot.id;
            return (
              <button
                key={spot.id}
                type="button"
                onClick={() => handleSelectChoiceChip(spot)}
                className={`min-h-[44px] px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-[#16A085] text-white border-[#16A085] shadow-md ring-2 ring-[#16A085]/30'
                    : 'bg-white text-slate-700 border-slate-300 hover:border-[#16A085] hover:bg-emerald-50/50 hover:text-[#16A085]'
                }`}
              >
                {isSelected ? (
                  <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                  </span>
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0" />
                )}
                <span className="whitespace-nowrap">
                  {lang === 'th' ? spot.nameTh : spot.nameEn}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Requirement 3: ตำแหน่งที่เลือก (Selected Coordinates) */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">
            {lang === 'th' ? 'ตำแหน่งที่เลือก' : 'Selected Coordinates'}
          </span>
          {isInsideArea ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
              ✓ {lang === 'th' ? 'ในพื้นที่คณะสาธารณสุขศาสตร์' : 'In Designated Boundary'}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100/80 px-2.5 py-0.5 rounded-full">
              ⚠ {lang === 'th' ? 'อยู่นอกพื้นที่' : 'Outside Boundary'}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
            <span className="text-slate-500 text-[11px] block">Latitude:</span>
            <strong className="text-slate-900 font-mono text-xs">{latitude.toFixed(6)}</strong>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
            <span className="text-slate-500 text-[11px] block">Longitude:</span>
            <strong className="text-slate-900 font-mono text-xs">{longitude.toFixed(6)}</strong>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 pt-1 flex items-center justify-between">
          <span>
            {lang === 'th' ? 'สถานที่:' : 'Spot:'}{' '}
            <strong className="text-slate-800">
              {lang === 'th' ? activeSpot.nameTh : activeSpot.nameEn}
            </strong>
          </span>
          <span className="capitalize font-mono text-slate-400">
            type: {activeSpot.locationType}
          </span>
        </div>
      </div>
    </div>
  );
};
