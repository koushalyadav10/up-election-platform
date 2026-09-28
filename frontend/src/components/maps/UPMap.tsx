import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Layers, 
  Calendar, 
  Filter, 
  Eye, 
  CheckCircle2, 
  Flame, 
  Award, 
  Vote, 
  Building2, 
  Landmark, 
  TrendingUp,
  X,
  MapPin,
  Loader2
} from 'lucide-react';
import { 
  fetchConstituencies, 
  fetchAssemblyConstituencies, 
  fetchDistrictPollingStations,
  ConstituencyListItem, 
  AssemblyConstituencyItem,
  GeoPollingStation 
} from '../../services/api';
import { ACDossierModal } from '../common/ACDossierModal';
import { useLanguage } from '../../context/LanguageContext';

interface UPMapProps {
  onSelectPC?: (pcId: number) => void;
  onSelectAC?: (acNo: number) => void;
  selectedPCId?: number | null;
  selectedACNo?: number | null;
  initialChamber?: 'Parliamentary' | 'Assembly';
}

export const UPMap: React.FC<UPMapProps> = ({ 
  onSelectPC, 
  onSelectAC, 
  selectedPCId, 
  selectedACNo: propSelectedACNo,
  initialChamber = 'Parliamentary'
}) => {
  const { language, t } = useLanguage();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const geojsonLayerRef = useRef<L.GeoJSON | null>(null);
  
  // Chamber & Year State
  const [chamber, setChamber] = useState<'Parliamentary' | 'Assembly'>(initialChamber);
  const [selectedYear, setSelectedYear] = useState<number>(initialChamber === 'Parliamentary' ? 2024 : 2022);
  const [metric, setMetric] = useState<'party' | 'margin' | 'turnout' | 'competitiveness'>('party');
  
  // Secondary Filters
  const [partyFilter, setPartyFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [districtFilter, setDistrictFilter] = useState<string>('ALL');
  
  // Hover & Modal State
  const [hoveredFeature, setHoveredFeature] = useState<any | null>(null);
  const [activeACDossierNo, setActiveACDossierNo] = useState<number | null>(propSelectedACNo || null);
  
  // Data caches
  const [pcGeoData, setPcGeoData] = useState<any | null>(null);
  const [acGeoData, setAcGeoData] = useState<any | null>(null);
  const [pcResultsMap, setPcResultsMap] = useState<Record<number, ConstituencyListItem>>({});
  const [acResultsMap, setAcResultsMap] = useState<Record<number, AssemblyConstituencyItem>>({});
  const [districtsList, setDistrictsList] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Booth mapping state
  const [showBooths, setShowBooths] = useState(false);
  const [boothData, setBoothData] = useState<GeoPollingStation[]>([]);
  const [loadingBooths, setLoadingBooths] = useState(false);
  const boothLayerRef = useRef<L.LayerGroup | null>(null);

  // 1. Fetch GeoJSON boundaries on mount
  useEffect(() => {
    fetch('/data/up_pc_boundaries.geojson')
      .then(res => res.json())
      .then(data => setPcGeoData(data))
      .catch(err => console.error("Error loading PC GeoJSON:", err));

    fetch('/data/up_ac_boundaries.geojson')
      .then(res => res.json())
      .then(data => {
        setAcGeoData(data);
        if (data.features) {
          const dists = Array.from(new Set(data.features.map((f: any) => f.properties?.district).filter(Boolean))) as string[];
          dists.sort();
          setDistrictsList(dists);
        }
      })
      .catch(err => console.error("Error loading AC GeoJSON:", err));
  }, []);

  // Update year default when chamber changes
  const handleChamberChange = (newChamber: 'Parliamentary' | 'Assembly') => {
    setChamber(newChamber);
    if (newChamber === 'Parliamentary') {
      setSelectedYear(2024);
    } else {
      setSelectedYear(2024); // 2024 Assembly leads default
    }
  };

  // 2. Fetch results whenever chamber or selectedYear changes
  useEffect(() => {
    setLoading(true);
    if (chamber === 'Parliamentary') {
      fetchConstituencies(selectedYear)
        .then(res => {
          const mapping: Record<number, ConstituencyListItem> = {};
          res.items.forEach(item => {
            mapping[item.pc_no] = item;
            mapping[item.id] = item;
          });
          setPcResultsMap(mapping);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching PC election results for map:", err);
          setLoading(false);
        });
    } else {
      // Assembly
      const electionType = selectedYear === 2024 ? 'Lok Sabha' : 'Vidhan Sabha';
      fetchAssemblyConstituencies(selectedYear, electionType)
        .then(res => {
          const mapping: Record<number, AssemblyConstituencyItem> = {};
          res.items.forEach(item => {
            mapping[item.ac_no] = item;
          });
          setAcResultsMap(mapping);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching AC election results for map:", err);
          setLoading(false);
        });
    }
  }, [chamber, selectedYear]);

  // 3. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [26.8467, 80.9462], // UP Center near Lucknow
      zoom: 7,
      minZoom: 6,
      maxZoom: 12,
      scrollWheelZoom: false,
      zoomControl: true,
      attributionControl: false
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 4. Color styling helper
  const getFeatureStyle = (feature: any) => {
    const props = feature.properties;
    const isPC = chamber === 'Parliamentary';
    const id = isPC ? (props.pc_no || props.pc_id) : props.ac_no;
    const itemData = isPC ? pcResultsMap[id] : acResultsMap[id];
    
    // Filter matching check
    const acItem = !isPC ? (itemData as AssemblyConstituencyItem) : undefined;
    const pcItem = isPC ? (itemData as ConstituencyListItem) : undefined;

    const itemParty = isPC 
      ? pcItem?.winner?.party || props.winner_party || 'OTHER'
      : (selectedYear === 2024 
          ? (acItem?.lead_2024_party || props.lead_party || 'OTHER')
          : (selectedYear === 2017 ? acItem?.winner_2017_party : acItem?.winner_2022_party || 'OTHER'));
    
    const itemCategory = props.category || 'GEN';
    const itemDistrict = props.district || '';

    let isDimmed = false;
    if (partyFilter !== 'ALL' && itemParty.toUpperCase() !== partyFilter.toUpperCase()) {
      isDimmed = true;
    }
    if (categoryFilter !== 'ALL' && itemCategory.toUpperCase() !== categoryFilter.toUpperCase()) {
      isDimmed = true;
    }
    if (districtFilter !== 'ALL' && itemDistrict.toLowerCase() !== districtFilter.toLowerCase()) {
      isDimmed = true;
    }

    const isSelected = isPC 
      ? (selectedPCId && (props.pc_id === selectedPCId || props.pc_no === selectedPCId))
      : (activeACDossierNo && props.ac_no === activeACDossierNo);

    let fillColor = '#94A3B8';
    
    if (metric === 'party') {
      const partyUpper = itemParty.toUpperCase();
      if (partyUpper.includes('BJP')) fillColor = '#FF9933';
      else if (partyUpper.includes('SP')) fillColor = '#E53935';
      else if (partyUpper.includes('INC') || partyUpper.includes('CONG')) fillColor = '#1976D2';
      else if (partyUpper.includes('BSP')) fillColor = '#1E40AF';
      else if (partyUpper.includes('RLD')) fillColor = '#10B981';
      else if (partyUpper.includes('ADAL') || partyUpper.includes('AD(S)')) fillColor = '#F59E0B';
      else if (partyUpper.includes('ASPKR')) fillColor = '#8B5CF6';
      else fillColor = '#64748B';
    } else if (metric === 'margin') {
      const m = isPC 
        ? (pcItem ? pcItem.margin : (props.margin || 0))
        : (selectedYear === 2024 ? (acItem?.margin_2024 || props.margin || 0) : (acItem?.margin_2022 || props.margin || 0));
      
      if (m < 5000) fillColor = '#EF4444'; // Ultra close < 5k
      else if (m < 20000) fillColor = '#F97316'; // Competitive < 20k
      else if (m < 50000) fillColor = '#EAB308'; // Moderate < 50k
      else fillColor = '#10B981'; // Decisive / Fortress 50k+
    } else if (metric === 'turnout') {
      const t = isPC 
        ? (itemData ? itemData.turnout_pct : (props.turnout_pct || 55))
        : 60; // default for AC
      if (t >= 65) fillColor = '#047857';
      else if (t >= 60) fillColor = '#059669';
      else if (t >= 55) fillColor = '#10B981';
      else fillColor = '#F59E0B';
    } else if (metric === 'competitiveness') {
      // Competitiveness score heuristic: margin closeness + flip
      const m = isPC 
        ? (pcItem ? pcItem.margin : 25000)
        : (acItem?.margin_2024 || acItem?.margin_2022 || 15000);
      if (m < 5000) fillColor = '#DC2626'; // Hyper-competitive (>75 score)
      else if (m < 15000) fillColor = '#F97316'; // High (>60 score)
      else if (m < 35000) fillColor = '#FBBF24'; // Moderate (40-60)
      else fillColor = '#10B981'; // Safe (<40 score)
    }

    if (isDimmed) {
      return {
        fillColor: '#E2E8F0',
        weight: 0.5,
        opacity: 0.4,
        color: '#CBD5E1',
        fillOpacity: 0.15
      };
    }

    return {
      fillColor: fillColor,
      weight: isSelected ? 2.5 : (isPC ? 1.2 : 0.8),
      opacity: 1,
      color: isSelected ? '#0F172A' : (isPC ? '#FFFFFF' : '#F1F5F9'),
      fillOpacity: isSelected ? 0.95 : 0.85
    };
  };

  // 5. Render GeoJSON onto map
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const currentGeo = chamber === 'Parliamentary' ? pcGeoData : acGeoData;
    if (!currentGeo) return;

    const map = mapInstanceRef.current;

    if (geojsonLayerRef.current) {
      map.removeLayer(geojsonLayerRef.current);
    }

    const layer = L.geoJSON(currentGeo, {
      style: getFeatureStyle,
      onEachFeature: (feature, l) => {
        const isPC = chamber === 'Parliamentary';
        const id = isPC ? (feature.properties.pc_no || feature.properties.pc_id) : feature.properties.ac_no;
        const itemData = isPC ? pcResultsMap[id] : acResultsMap[id];

        l.on({
          mouseover: (e) => {
            const target = e.target;
            target.setStyle({
              weight: 2.5,
              color: '#0F172A',
              fillOpacity: 0.98
            });
            target.bringToFront();
            setHoveredFeature({
              ...feature.properties,
              isPC,
              activeData: itemData
            });
          },
          mouseout: (e) => {
            geojsonLayerRef.current?.resetStyle(e.target);
          },
          click: () => {
            if (isPC) {
              const pcId = itemData?.id || feature.properties.pc_id || feature.properties.pc_no;
              if (onSelectPC) onSelectPC(pcId);
            } else {
              const acNo = feature.properties.ac_no;
              if (onSelectAC) onSelectAC(acNo);
              setActiveACDossierNo(acNo);
            }
          }
        });
      }
    });

    layer.addTo(map);
    geojsonLayerRef.current = layer;

    // Fit map bounds
    try {
      if (districtFilter !== 'ALL') {
        const matchingLayers: L.Layer[] = [];
        layer.eachLayer((subLayer: any) => {
          const dName = subLayer.feature?.properties?.district;
          if (dName && dName.toLowerCase() === districtFilter.toLowerCase()) {
            matchingLayers.push(subLayer);
          }
        });
        if (matchingLayers.length > 0) {
          const fg = L.featureGroup(matchingLayers);
          map.fitBounds(fg.getBounds(), { padding: [30, 30] });
        } else {
          map.fitBounds(layer.getBounds(), { padding: [10, 10] });
        }
      } else {
        map.fitBounds(layer.getBounds(), { padding: [10, 10] });
      }
    } catch (e) {
      // fallback
    }
  }, [chamber, pcGeoData, acGeoData, pcResultsMap, acResultsMap, metric, partyFilter, categoryFilter, districtFilter, selectedPCId, activeACDossierNo]);

  // 6. Booth Markers Layer Rendering
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (boothLayerRef.current) {
      map.removeLayer(boothLayerRef.current);
      boothLayerRef.current = null;
    }

    if (!showBooths) {
      setBoothData([]);
      return;
    }

    const targetDistrict = districtFilter !== 'ALL' ? districtFilter : 'Sant Kabir Nagar';
    setLoadingBooths(true);

    fetchDistrictPollingStations(targetDistrict, undefined, selectedYear)
      .then(res => {
        setBoothData(res.stations || []);
        setLoadingBooths(false);

        if (!mapInstanceRef.current) return;
        const newGroup = L.layerGroup();

        res.stations.forEach(st => {
          if (!st.lat || !st.lng) return;

          let pinColor = '#64748b';
          const p = st.lead_party.toUpperCase();
          if (p.includes('BJP') || p.includes('NINSHAD') || p.includes('NISHAD')) pinColor = '#ea580c';
          else if (p.includes('SP') || p.includes('SBSP')) pinColor = '#16a34a';
          else if (p.includes('BSP')) pinColor = '#2563eb';
          else if (p.includes('INC')) pinColor = '#0284c7';
          else if (p.includes('AAP')) pinColor = '#06b6d4';

          const marker = L.circleMarker([st.lat, st.lng], {
            radius: 5,
            fillColor: pinColor,
            color: '#ffffff',
            weight: 1.5,
            opacity: 1,
            fillOpacity: 0.85
          });

          marker.bindTooltip(`
            <div style="font-family: sans-serif; font-size: 11px;">
              <b>Booth #${st.part_no}: ${st.station_name}</b><br/>
              <span style="color: #64748b;">AC #${st.ac_no} ${st.ac_name} • ${selectedYear} Return</span><br/>
              Lead: <b style="color:${pinColor}">${st.lead_party}</b> (${st.lead_candidate})<br/>
              Margin: <b>+${st.margin.toLocaleString()}</b> • Turnout: <b>${st.turnout_pct}%</b>
            </div>
          `, { sticky: true });

          marker.bindPopup(`
            <div style="font-family: sans-serif; font-size: 12px; min-width: 240px; padding: 4px;">
              <div style="font-weight: bold; font-size: 13px; margin-bottom: 2px;">Booth #${st.part_no} (${selectedYear})</div>
              <div style="font-size: 11px; color: #1e293b; margin-bottom: 3px; font-weight: 600;">${st.station_name}</div>
              <div style="font-size: 10px; color: #64748b; margin-bottom: 8px;">${st.address}</div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; background: #f8fafc; padding: 6px 8px; border-radius: 6px; margin-bottom: 8px; font-size: 11px; border: 1px solid #e2e8f0;">
                <div>Electors: <b>${st.total_electors.toLocaleString()}</b></div>
                <div>Votes Polled: <b>${st.votes_polled.toLocaleString()}</b></div>
                <div style="grid-column: span 2;">Turnout: <b style="color: #0f766e;">${st.turnout_pct}%</b></div>
              </div>
              <div style="padding: 6px 8px; border-radius: 6px; background: #f1f5f9; display: flex; justify-content: space-between; align-items: center; border: 1px solid #cbd5e1;">
                <div>
                  <span style="font-size: 9px; text-transform: uppercase; color: #64748b; font-weight: bold; display: block;">${selectedYear} Winner (Form 20)</span>
                  <b style="color:${pinColor}; font-size: 12px;">${st.lead_party}</b> <span style="font-size: 10px; color: #475569;">(${st.lead_candidate})</span>
                </div>
                <div style="text-align: right;">
                  <span style="font-size: 9px; text-transform: uppercase; color: #64748b; font-weight: bold; display: block;">Margin</span>
                  <b style="color: #16a34a; font-size: 12px;">+${st.margin.toLocaleString()}</b>
                </div>
              </div>
            </div>
          `);

          newGroup.addLayer(marker);
        });

        newGroup.addTo(mapInstanceRef.current);
        boothLayerRef.current = newGroup;

        try {
          const boothBounds = L.featureGroup(newGroup.getLayers() as L.Layer[]).getBounds();
          if (boothBounds.isValid()) {
            mapInstanceRef.current.fitBounds(boothBounds, { padding: [30, 30] });
          }
        } catch (e) {
          // fallback
        }
      })
      .catch(err => {
        console.error("Failed to load district booths:", err);
        setLoadingBooths(false);
      });
  }, [showBooths, districtFilter, selectedYear]);

  const handleFocusSantKabirNagar = () => {
    setChamber('Assembly');
    setDistrictFilter('Sant Kabir Nagar');
    setShowBooths(true);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyToBounds([[26.48, 82.80], [27.08, 83.35]], { duration: 1.2 });
    }
  };

  // Compute live party tally
  const partyTally: Record<string, { count: number; color: string }> = {};
  if (chamber === 'Parliamentary') {
    Object.values(pcResultsMap).forEach(pc => {
      if (!pc || !pc.winner) return;
      const p = pc.winner.party || 'OTHER';
      if (!partyTally[p]) {
        partyTally[p] = { count: 0, color: pc.winner.color || '#64748B' };
      }
      partyTally[p].count += 1;
    });
  } else {
    // Assembly leads or winners
    Object.values(acResultsMap).forEach((ac: any) => {
      const p = (selectedYear === 2024 ? ac.lead_2024_party : (selectedYear === 2017 ? ac.winner_2017_party : ac.winner_2022_party)) || 'OTHER';
      if (!partyTally[p]) {
        let color = '#64748B';
        if (p === 'SP') color = '#E53935';
        else if (p === 'BJP') color = '#FF9933';
        else if (p === 'INC') color = '#1976D2';
        else if (p === 'BSP') color = '#1E40AF';
        else if (p === 'RLD') color = '#10B981';
        else if (p === 'ADAL') color = '#F59E0B';
        else if (p === 'ASPKR') color = '#8B5CF6';
        partyTally[p] = { count: 0, color };
      }
      partyTally[p].count += 1;
    });
  }

  const sortedParties = Object.entries(partyTally).sort((a, b) => b[1].count - a[1].count);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 shadow-sm">
      
      {/* 1. Top Controls Bar: Dual-Chamber Switcher, Year, Metric & Filters */}
      <div className="absolute top-3 left-3 z-[20] flex flex-wrap items-center gap-2 max-w-[94%]">
        
        {/* Chamber Selector */}
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-md flex items-center gap-1">
          <button
            onClick={() => handleChamberChange('Parliamentary')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              chamber === 'Parliamentary'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <Landmark className="w-3.5 h-3.5" />
            <span>Lok Sabha (80 PCs)</span>
          </button>

          <button
            onClick={() => handleChamberChange('Assembly')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              chamber === 'Assembly'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Vidhan Sabha (403 ACs)</span>
          </button>
        </div>

        {/* Year Selector */}
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-md flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 mr-1" />
          {(chamber === 'Parliamentary' ? [2024, 2019, 2014] : [2024, 2022, 2017]).map(yr => (
            <button
              key={yr}
              onClick={() => setSelectedYear(yr)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                selectedYear === yr
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {yr} {chamber === 'Assembly' && yr === 2024 ? '(LS Leads)' : ''}
            </button>
          ))}
        </div>

        {/* Choropleth Metric Mode */}
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-md flex items-center gap-1">
          <button
            onClick={() => setMetric('party')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
              metric === 'party'
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            Party
          </button>

          <button
            onClick={() => setMetric('margin')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
              metric === 'margin'
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            Margin Bands
          </button>

          <button
            onClick={() => setMetric('turnout')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
              metric === 'turnout'
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            Turnout %
          </button>

          <button
            onClick={() => setMetric('competitiveness')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
              metric === 'competitiveness'
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            Competitiveness
          </button>
        </div>

        {/* Filter Dropdowns (Party, Reservation, District) */}
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-md flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          
          {/* Party Filter */}
          <select
            value={partyFilter}
            onChange={(e) => setPartyFilter(e.target.value)}
            className="text-xs bg-transparent font-semibold text-slate-700 dark:text-slate-200 outline-none cursor-pointer py-1"
          >
            <option value="ALL">All Parties</option>
            <option value="BJP">BJP</option>
            <option value="SP">SP</option>
            <option value="INC">INC</option>
            <option value="BSP">BSP</option>
            <option value="RLD">RLD</option>
          </select>

          <span className="text-slate-300 dark:text-slate-700">|</span>

          {/* Reservation Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-transparent font-semibold text-slate-700 dark:text-slate-200 outline-none cursor-pointer py-1"
          >
            <option value="ALL">All Seats</option>
            <option value="GEN">General</option>
            <option value="SC">SC Reserved</option>
            <option value="ST">ST Reserved</option>
          </select>

          {/* District Filter */}
          {districtsList.length > 0 && (
            <>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <select
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                className="text-xs bg-transparent font-semibold text-slate-700 dark:text-slate-200 outline-none cursor-pointer py-1 max-w-[120px] truncate"
              >
                <option value="ALL">All 75 Districts</option>
                {districtsList.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </>
          )}

          {(partyFilter !== 'ALL' || categoryFilter !== 'ALL' || districtFilter !== 'ALL') && (
            <button
              onClick={() => {
                setPartyFilter('ALL');
                setCategoryFilter('ALL');
                setDistrictFilter('ALL');
              }}
              title="Reset Filters"
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Polling Booth Layer Toggle & Quick Sant Kabir Nagar Chip */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowBooths(!showBooths)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border shadow-md backdrop-blur-md transition-all ${
              showBooths
                ? 'bg-amber-600 text-white border-amber-700 shadow-amber-600/30'
                : 'bg-white/95 dark:bg-slate-800/95 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            {loadingBooths ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Vote className="w-3.5 h-3.5" />}
            <span>{showBooths ? `Booths Active (${boothData.length})` : 'Show Booths (Form 20)'}</span>
          </button>

          <button
            onClick={handleFocusSantKabirNagar}
            title="Focus and map all 1,370 polling stations in Sant Kabir Nagar district"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-indigo-300 dark:border-indigo-700 bg-indigo-50/95 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-200 hover:bg-indigo-100 shadow-md backdrop-blur-md transition-all"
          >
            <MapPin className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Map Sant Kabir Nagar (1,370 Booths)</span>
          </button>
        </div>

      </div>

      {/* Floating Booth Layer Status Badge */}
      {showBooths && (
        <div className="absolute bottom-4 left-4 z-[20] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 py-2.5 rounded-xl border border-amber-200 dark:border-amber-800/60 shadow-lg text-xs space-y-1">
          <div className="flex items-center justify-between gap-3">
            <span className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
              <Vote className="w-3.5 h-3.5 text-amber-600" />
              <span>{districtFilter !== 'ALL' ? districtFilter : 'Sant Kabir Nagar'} Polling Booths Layer</span>
            </span>
            <span className="font-mono font-semibold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 text-[10px]">
              {boothData.length} Stations Active
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-600 dark:text-slate-400 pt-0.5 font-medium">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-600 inline-block"></span> BJP / NINSHAD Lead</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span> SP / SBSP Lead</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-600 inline-block"></span> BSP Lead</span>
          </div>
          <p className="text-[10px] text-slate-400 italic">
            Click or hover any booth pin to view Part No, certified Form 20 EVM votes, turnout %, and victory margin.
          </p>
        </div>
      )}

      {/* 2. Floating Hover Drawer (Suppressed when Dossier Modal is Open) */}
      {hoveredFeature && !activeACDossierNo && (
        <div className="absolute top-16 right-3 z-[25] bg-white/95 dark:bg-slate-800/95 backdrop-blur-md p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl w-72 pointer-events-none transition-all">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
            <div>
              <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider">
                {hoveredFeature.isPC ? `PC #${hoveredFeature.pc_no}` : `AC #${hoveredFeature.ac_no}`} • {hoveredFeature.category || 'GEN'}
              </span>
              <h4 className="font-bold text-base text-slate-900 dark:text-white leading-tight">
                {hoveredFeature.isPC ? hoveredFeature.pc_name : hoveredFeature.ac_name}
              </h4>
              {!hoveredFeature.isPC && hoveredFeature.district && (
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  {hoveredFeature.district} {hoveredFeature.pc_name ? `• PC: ${hoveredFeature.pc_name}` : ''}
                </div>
              )}
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 shrink-0">
              {selectedYear}
            </span>
          </div>

          <div className="mt-3 space-y-2 text-xs">
            {/* Winner / Lead */}
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">
                {selectedYear === 2024 && !hoveredFeature.isPC ? 'Lead Party:' : 'Winner:'}
              </span>
              <span className="font-bold flex items-center gap-1.5 text-slate-900 dark:text-white">
                {hoveredFeature.isPC ? (
                  <>
                    <span 
                      className="w-2.5 h-2.5 rounded-full inline-block" 
                      style={{ backgroundColor: hoveredFeature.activeData?.winner?.color || hoveredFeature.winner_party_color }}
                    />
                    {hoveredFeature.activeData?.winner?.name || hoveredFeature.winner_name}
                    <span className="text-[10px] px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-700 font-mono">
                      {hoveredFeature.activeData?.winner?.party || hoveredFeature.winner_party}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[11px] font-bold text-slate-900 dark:text-white">
                      {selectedYear === 2024 
                        ? (hoveredFeature.activeData?.lead_2024_candidate || hoveredFeature.lead_candidate || 'N/A')
                        : (selectedYear === 2017 ? hoveredFeature.activeData?.winner_2017_candidate : hoveredFeature.activeData?.winner_2022_candidate || 'N/A')}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded font-bold font-mono bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                      {selectedYear === 2024 
                        ? (hoveredFeature.activeData?.lead_2024_party || hoveredFeature.lead_party)
                        : (selectedYear === 2017 ? hoveredFeature.activeData?.winner_2017_party : hoveredFeature.activeData?.winner_2022_party)}
                    </span>
                  </>
                )}
              </span>
            </div>

            {/* Margin */}
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Margin:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {hoveredFeature.isPC ? (
                  (hoveredFeature.activeData ? hoveredFeature.activeData.margin : hoveredFeature.margin)?.toLocaleString() + ' votes'
                ) : (
                  (selectedYear === 2024 
                    ? (hoveredFeature.activeData?.margin_2024 ?? hoveredFeature.margin ?? 0)
                    : (hoveredFeature.activeData?.margin_2022 ?? 0))?.toLocaleString() + ' votes'
                )}
              </span>
            </div>

            {/* Turnout or Runner-up */}
            {hoveredFeature.isPC && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Turnout:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {hoveredFeature.activeData ? hoveredFeature.activeData.turnout_pct : hoveredFeature.turnout_pct}%
                </span>
              </div>
            )}

            {!hoveredFeature.isPC && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Runner-up:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {selectedYear === 2024 
                    ? `${hoveredFeature.activeData?.runner_2024_party || 'NDA'} (${(hoveredFeature.activeData?.runner_2024_votes || 0).toLocaleString()})`
                    : `${hoveredFeature.activeData?.runner_2022_party || 'OPP'}`}
                </span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 dark:border-slate-700 text-[10px] text-blue-600 dark:text-blue-400 font-semibold text-center">
              Click to open complete verified dossier →
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Leaflet Map Canvas */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-[600px] sm:h-[680px] z-0"
      />

      {/* 4. Map Bottom Info Bar & Party Tally */}
      <div className="absolute bottom-3 left-3 right-3 z-[20] bg-white/95 dark:bg-slate-800/95 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-md flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Vote className="w-3.5 h-3.5 text-blue-600" />
            {selectedYear} {chamber === 'Parliamentary' ? 'PC Seat Tally' : 'AC Lead/Win Tally'}:
          </span>
          <div className="flex flex-wrap items-center gap-3">
            {sortedParties.map(([party, meta]) => (
              <span key={party} className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
                <span 
                  className="w-2.5 h-2.5 rounded-full inline-block" 
                  style={{ backgroundColor: meta.color }} 
                />
                <span>{party}:</span>
                <strong className="font-bold font-mono">{meta.count}</strong>
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
          <span>{chamber === 'Parliamentary' ? '80 Parliamentary Constituencies' : '403 Assembly Constituencies'}</span>
          <span>•</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">ECI Official Verified Archive</span>
        </div>
      </div>

      {/* 5. Embedded AC Dossier Modal when AC is clicked */}
      <ACDossierModal
        acNo={activeACDossierNo}
        isOpen={activeACDossierNo !== null}
        onClose={() => setActiveACDossierNo(null)}
      />

    </div>
  );
};
