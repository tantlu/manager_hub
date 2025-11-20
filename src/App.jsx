import React, { useState, useEffect, useMemo, useRef } from 'react';
// Firebase Imports
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  writeBatch,
  getDocs,
  limit,
  startAfter,
  updateDoc,
  increment,
  where,
  deleteDoc
} from 'firebase/firestore';
// Icons
import {
  Search, Database, Newspaper, User, LogOut, PlusCircle,
  Download, Trophy, TrendingUp, Shield, Activity, FileUp,
  Sparkles, Bot, Loader2, X, UploadCloud, Eye, LayoutGrid,
  List, Shirt, Settings, CheckCircle, AlertCircle, Menu,
  Paperclip, Image as ImageIcon, Bold, Italic, Type, Star,
  MessageCircle, Send, FileText, Trash2, Lock, Mail, Key,
  ChevronRight, Share2, Home, Globe, Hand, Footprints,
  Calendar, Medal, Plus, Crown
} from 'lucide-react';

// --- FIREBASE CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyD3P-yoCz7IDYqRIjviAH9JwCAopQhJs30",
  authDomain: "managerhub-55598.firebaseapp.com",
  projectId: "managerhub-55598",
  storageBucket: "managerhub-55598.firebasestorage.app",
  messagingSenderId: "169824279806",
  appId: "1:169824279806:web:7df5566f34e9b4469c59af",
  measurementId: "G-Y10P9NHSJZ"
};

// Khởi tạo Firebase an toàn
let app;
let auth;
let db;
let analytics;

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
  if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
  }
} catch (error) {
  console.error("Lỗi khởi tạo Firebase:", error);
}

const appId = 'default-app-id';

// --- ADMIN CONFIGURATION ---
const ADMIN_EMAILS = ["tencuto@gamehub.com", "nguyentan7799@gmail.com"];

// --- UTILS & PARSERS ---
const renderRichText = (text) => {
  if (!text) return null;
  const safeText = String(text);
  let html = safeText.replace(/\n/g, '<br/>')
    .replace(/\*\*(.*?)\*\*/g, '<b class="text-emerald-400">$1</b>')
    .replace(/## (.*?)<br\/>/g, '<h3 class="text-lg font-bold my-3 text-emerald-500">$1</h3>');
  return <div dangerouslySetInnerHTML={{ __html: html }} className="leading-relaxed text-slate-300" />;
};

// Helper format date an toàn
const formatDate = (timestamp) => {
  if (!timestamp) return '';
  if (timestamp.toDate) return timestamp.toDate().toLocaleDateString();
  if (timestamp instanceof Date) return timestamp.toLocaleDateString();
  return '';
};

const parseHtmlTable = (htmlString) => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const rows = Array.from(doc.querySelectorAll('tr'));
    if (rows.length === 0) return [];

    let headerRow = rows.find(r => r.querySelectorAll('th').length > 5);
    if (!headerRow) headerRow = rows[0];

    const colIndexMap = {};
    Array.from(headerRow.querySelectorAll('th, td')).forEach((cell, index) => {
      const text = cell.innerText.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      colIndexMap[text] = index;
    });

    const data = [];
    const startIndex = rows.indexOf(headerRow) + 1;

    const statsMapping = {
      'cor': 'Cor', 'corners': 'Cor', 'cro': 'Cro', 'crossing': 'Cro', 'dri': 'Dri', 'dribbling': 'Dri',
      'fin': 'Fin', 'finishing': 'Fin', 'fir': 'Fir', 'firsttouch': 'Fir', 'fre': 'Fre', 'freekicks': 'Fre',
      'hea': 'Hea', 'heading': 'Hea', 'lon': 'Lon', 'longshots': 'Lon', 'lth': 'LTh', 'longthrows': 'LTh',
      'mar': 'Mar', 'marking': 'Mar', 'pas': 'Pas', 'passing': 'Pas', 'pen': 'Pen', 'penaltytaking': 'Pen',
      'tck': 'Tck', 'tackling': 'Tck', 'tec': 'Tec', 'technique': 'Tec',
      'agg': 'Agg', 'aggression': 'Agg', 'ant': 'Ant', 'anticipation': 'Ant', 'bra': 'Bra', 'bravery': 'Bra',
      'cmp': 'Cmp', 'composure': 'Cmp', 'cnt': 'Cnt', 'concentration': 'Cnt', 'dec': 'Dec', 'decisions': 'Dec',
      'det': 'Det', 'determination': 'Det', 'fla': 'Fla', 'flair': 'Fla', 'ldr': 'Ldr', 'leadership': 'Ldr',
      'off': 'Off', 'offtheball': 'Off', 'otb': 'Off', 'pos': 'Pos', 'positioning': 'Pos', 'tea': 'Tea', 'teamwork': 'Tea',
      'vis': 'Vis', 'vision': 'Vis', 'wor': 'Wor', 'workrate': 'Wor',
      'acc': 'Acc', 'acceleration': 'Acc', 'agi': 'Agi', 'agility': 'Agi', 'bal': 'Bal', 'balance': 'Bal',
      'jum': 'Jum', 'jumpingreach': 'Jum', 'nat': 'Nat', 'naturalfitness': 'Nat', 'pac': 'Pac', 'pace': 'Pac',
      'sta': 'Sta', 'stamina': 'Sta', 'str': 'Str', 'strength': 'Str',
      'aer': 'Aer', 'aerialreach': 'Aer', 'cmd': 'Cmd', 'commandofarea': 'Cmd', 'com': 'Com', 'communication': 'Com',
      'ecc': 'Ecc', 'eccentricity': 'Ecc', 'han': 'Han', 'handling': 'Han', 'kic': 'Kic', 'kicking': 'Kic',
      'one': 'One', 'oneonones': 'One', '1v1': 'One', 'pun': 'Pun', 'punching': 'Pun', 'ref': 'Ref', 'reflexes': 'Ref',
      'rus': 'Rus', 'rushingout': 'Rus', 'thr': 'Thr', 'throwing': 'Thr'
    };

    for (let i = startIndex; i < rows.length; i++) {
      const cells = Array.from(rows[i].querySelectorAll('td'));

      const getVal = (possibleKeys) => {
        if (!Array.isArray(possibleKeys)) possibleKeys = [possibleKeys];
        for (const key of possibleKeys) {
          const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
          const index = colIndexMap[normalizedKey];
          if (index !== undefined && cells[index]) {
            let valText = cells[index].innerText.trim();
            if (!isNaN(valText) && valText !== '') return Number(valText);
            if (valText === '-') return 0;
            return valText;
          }
        }
        return undefined;
      };

      const name = getVal(['name']);
      if (name) {
        const player = {
          UID: getVal(['uid', 'uniqueid']),
          Name: name,
          Position: getVal(['position', 'pos']),
          Club: getVal(['club', 'team']),
          Age: getVal(['age']),
          'Height': getVal(['height']),
          'Weight': getVal(['weight']),
          'Preferred Foot': getVal(['preferredfoot', 'foot']),
          CA: getVal(['ca', 'currentability']) || '-',
          PA: getVal(['pa', 'potentialability']) || '-',
          Apps: getVal(['apps', 'appearances']) || 0,
          Gls: getVal(['gls', 'goals']) || 0,
          Ast: getVal(['ast', 'assists']) || 0,
          'Av Rat': getVal(['avrat', 'averagerating', 'avr']) || 0,
          'Transfer Value': getVal(['transfervalue', 'value']) || '-',
          Stats: {}
        };
        for (const [fileKey, statKey] of Object.entries(statsMapping)) {
          if (player.Stats[statKey] === undefined) {
            const val = getVal([fileKey]);
            if (typeof val === 'number') player.Stats[statKey] = val;
          }
        }
        data.push(player);
      }
    }
    return data;
  } catch (e) { console.error("Parse Error:", e); return []; }
};

// --- COMPONENTS ---
const PlayerAvatar = ({ uid, name, size = "md", className = "" }) => {
  const [error, setError] = useState(false);
  const sizeClasses = { sm: "w-8 h-8 text-xs", md: "w-12 h-12 text-sm", lg: "w-32 h-32 text-3xl", xl: "w-48 h-48 text-5xl" };
  const imageUrl = uid ? `https://img.fminside.net/facesfm26/${uid}.png` : null;
  if (!imageUrl || error) return <div className={`${sizeClasses[size] || sizeClasses.md} bg-slate-700 rounded flex items-center justify-center font-bold text-slate-400 border border-slate-600 ${className}`}>{name ? name[0].toUpperCase() : '?'}</div>;
  return <div className={`${sizeClasses[size] || sizeClasses.md} relative rounded overflow-hidden bg-slate-800 border border-slate-600 ${className}`}><img src={imageUrl} alt={name} className="w-full h-full object-cover" onError={() => setError(true)} loading="lazy" /></div>;
};

const RadarChart = ({ stats, position }) => {
  if (!stats) return null;
  const isGK = position && position.includes('GK');
  const get = (key) => (stats[key] !== undefined ? stats[key] : 5);

  let groups;
  if (isGK) {
    groups = [
      { name: "AER", val: get('Aer') }, { name: "DIS", val: (get('Kic') + get('Thr')) / 2 }, { name: "COM", val: (get('Cmd') + get('Com')) / 2 },
      { name: "SHO", val: (get('Ref') + get('One') + get('Han')) / 3 }, { name: "PHY", val: (get('Agi') + get('Bal') + get('Str')) / 3 }, { name: "MEN", val: (get('Ant') + get('Pos') + get('Cnt')) / 3 }
    ];
  } else {
    groups = [
      { name: "ATT", val: (get('Fin') + get('Lon') + get('Off')) / 3 }, { name: "TEC", val: (get('Tec') + get('Dri') + get('Pas')) / 3 }, { name: "TAC", val: (get('Dec') + get('Ant') + get('Vis')) / 3 },
      { name: "DEF", val: (get('Tck') + get('Mar') + get('Pos')) / 3 }, { name: "PHY", val: (get('Pac') + get('Acc') + get('Str')) / 3 }, { name: "CRE", val: (get('Fla') + get('Vis') + get('Cro')) / 3 }
    ];
  }

  const size = 240; const center = size / 2; const radius = 90;
  const getPoint = (index, value) => { const angle = index * (Math.PI * 2) / 6 - Math.PI / 2; const dist = ((value || 5) / 20) * radius; return `${center + Math.cos(angle) * dist},${center + Math.sin(angle) * dist}`; };
  const points = groups.map((g, i) => getPoint(i, g.val)).join(' ');
  const bgPoints = groups.map((g, i) => getPoint(i, 20)).join(' ');
  const midPoints = groups.map((g, i) => getPoint(i, 10)).join(' ');

  return (
    <div className="flex flex-col items-center justify-center py-4">
      <svg width={size} height={size} className="overflow-visible filter drop-shadow-lg">
        <polygon points={bgPoints} fill="#1e293b" stroke="#475569" strokeWidth="1" />
        <polygon points={midPoints} fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
        <polygon points={points} fill="rgba(16, 185, 129, 0.4)" stroke="#10b981" strokeWidth="2" />
        {groups.map((g, i) => {
          const angle = i * (Math.PI * 2) / 6 - Math.PI / 2;
          const x = center + Math.cos(angle) * (radius + 20);
          const y = center + Math.sin(angle) * (radius + 20);
          return (<text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="11" fontWeight="bold" fill="#94a3b8" className="uppercase tracking-wider">{g.name}</text>);
        })}
      </svg>
    </div>
  );
};

const AttributeBox = ({ label, value }) => {
  const val = value !== undefined ? value : '-';
  let valColor = "text-slate-500"; let bgBar = "bg-transparent";
  if (typeof val === 'number') {
    if (val >= 16) { valColor = "text-emerald-400 font-bold"; bgBar = "bg-emerald-500"; }
    else if (val >= 11) { valColor = "text-yellow-500 font-bold"; bgBar = "bg-yellow-500"; }
    else if (val >= 6) { valColor = "text-slate-300 font-medium"; bgBar = "bg-slate-500"; }
    else { valColor = "text-slate-500"; bgBar = "bg-slate-700"; }
  }
  return (
    <div className="flex justify-between items-center text-sm py-1 border-b border-slate-700/50 last:border-0 group hover:bg-slate-700/30 px-2 rounded transition">
      <span className="text-slate-400 font-medium group-hover:text-slate-200">{label}</span>
      <div className="flex items-center gap-2">
        {typeof val === 'number' && (
          <div className="w-8 h-1.5 bg-slate-800 rounded-full overflow-hidden hidden sm:block border border-slate-700/50">
            <div className={`h-full ${bgBar}`} style={{ width: `${(Math.min(val, 20) / 20) * 100}%` }}></div>
          </div>
        )}
        <span className={`w-6 text-right ${valColor}`}>{val}</span>
      </div>
    </div>
  );
};

const StoryStatBar = ({ value, max, colorClass = "bg-emerald-500" }) => {
  const percent = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-2 w-24">
      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
        <div className={`h-full ${colorClass}`} style={{ width: `${percent}%` }}></div>
      </div>
      <span className={`text-xs font-bold w-8 text-right ${value > 0 ? 'text-white' : 'text-slate-600'}`}>{value}</span>
    </div>
  );
};

// --- SHARED MODAL ---
const PlayerDetailModal = ({ selected, onClose }) => {
  if (!selected) return null;
  const isGK = selected.Position && selected.Position.includes('GK');

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-slate-800 w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden max-h-[95vh] overflow-y-auto border border-slate-600 relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-slate-700 hover:bg-red-600 rounded-full text-white transition z-20 shadow-lg"><X size={24} /></button>
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 flex flex-col md:flex-row gap-8 items-center md:items-start border-b border-slate-700 relative">
          <div className="flex-shrink-0"><PlayerAvatar uid={selected.UID} name={selected.Name} size="xl" className="shadow-2xl ring-4 ring-slate-700" /></div>
          <div className="flex-grow text-center md:text-left w-full">
            <h2 className="text-4xl font-black text-white mb-1 flex items-center justify-center md:justify-start gap-3">{selected.Name} <span className="text-base font-normal text-slate-400 bg-slate-700 px-2 rounded border border-slate-600">{selected.Position}</span></h2>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm text-slate-300 mb-6">
              <span className="flex items-center gap-1"><Shield size={16} className="text-emerald-400" /> {selected.Club}</span>
              <span className="w-1 h-1 bg-slate-500 rounded-full self-center"></span><span>{selected.Age} tuổi</span>
              <span className="w-1 h-1 bg-slate-500 rounded-full self-center"></span><span>{selected['Height'] || '-'}</span>
              <span className="w-1 h-1 bg-slate-500 rounded-full self-center"></span><span>{selected['Weight'] || '-'}</span>
              <span className="w-1 h-1 bg-slate-500 rounded-full self-center"></span><span>{selected['Preferred Foot'] || '-'}</span>
            </div>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              {(selected.Apps !== undefined && selected.Apps > 0) && (
                <>
                  <div className="bg-slate-900/60 px-4 py-2 rounded-lg border border-slate-700 text-center min-w-[80px]"><div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Apps</div><div className="text-xl font-black text-white">{selected.Apps}</div></div>
                  <div className="bg-slate-900/60 px-4 py-2 rounded-lg border border-slate-700 text-center min-w-[80px]"><div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Goals</div><div className="text-xl font-black text-emerald-400">{selected.Gls}</div></div>
                  <div className="bg-slate-900/60 px-4 py-2 rounded-lg border border-slate-700 text-center min-w-[80px]"><div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Ast</div><div className="text-xl font-black text-blue-400">{selected.Ast}</div></div>
                  <div className="bg-slate-900/60 px-4 py-2 rounded-lg border border-slate-700 text-center min-w-[80px]"><div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Av Rat</div><div className={`text-xl font-black ${selected['Av Rat'] >= 7.5 ? 'text-emerald-400' : 'text-slate-200'}`}>{selected['Av Rat']}</div></div>
                </>
              )}
              {(selected.CA !== undefined && selected.CA !== '-') && (
                <>
                  <div className="bg-slate-900/60 px-4 py-2 rounded-lg border border-slate-700 text-center min-w-[80px]"><div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">CA</div><div className="text-xl font-black text-emerald-400">{selected.CA}</div></div>
                  <div className="bg-slate-900/60 px-4 py-2 rounded-lg border border-slate-700 text-center min-w-[80px]"><div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">PA</div><div className="text-xl font-black text-purple-400">{selected.PA}</div></div>
                </>
              )}
              <div className="bg-slate-900/60 px-6 py-2 rounded-lg border border-slate-700 text-center"><div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Giá trị</div><div className="text-lg font-bold text-white mt-1">{selected['Transfer Value'] || '-'}</div></div>
            </div>
          </div>
          <div className="flex-shrink-0 w-48 h-48 hidden md:flex items-center justify-center bg-slate-900/30 rounded-xl border border-slate-700/50 absolute right-8 top-8"><RadarChart stats={selected.Stats} position={selected.Position} /></div>
        </div>
        <div className="p-8 bg-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6">
          {isGK ? (
            <>
              <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-700/50 h-full"><h3 className="font-bold border-b border-slate-700 mb-4 pb-2 text-emerald-400 uppercase text-xs tracking-wider flex justify-between">Goalkeeping</h3>{selected.Stats && <div className="space-y-1"><AttributeBox label="Aerial Reach" value={selected.Stats.Aer} /><AttributeBox label="Command of Area" value={selected.Stats.Cmd} /><AttributeBox label="Communication" value={selected.Stats.Com} /><AttributeBox label="Eccentricity" value={selected.Stats.Ecc} /><AttributeBox label="Handling" value={selected.Stats.Han} /><AttributeBox label="Kicking" value={selected.Stats.Kic} /><AttributeBox label="One on Ones" value={selected.Stats.One} /><AttributeBox label="Reflexes" value={selected.Stats.Ref} /><AttributeBox label="Rushing Out" value={selected.Stats.Rus} /><AttributeBox label="Punching" value={selected.Stats.Pun} /><AttributeBox label="Throwing" value={selected.Stats.Thr} /></div>}</div>
              <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-700/50 h-full"><h3 className="font-bold border-b border-slate-700 mb-4 pb-2 text-yellow-500 uppercase text-xs tracking-wider flex justify-between">Mental</h3>{selected.Stats && <div className="space-y-1"><AttributeBox label="Aggression" value={selected.Stats.Agg} /><AttributeBox label="Anticipation" value={selected.Stats.Ant} /><AttributeBox label="Bravery" value={selected.Stats.Bra} /><AttributeBox label="Composure" value={selected.Stats.Cmp} /><AttributeBox label="Concentration" value={selected.Stats.Cnt} /><AttributeBox label="Decisions" value={selected.Stats.Dec} /><AttributeBox label="Determination" value={selected.Stats.Det} /><AttributeBox label="Flair" value={selected.Stats.Fla} /><AttributeBox label="Leadership" value={selected.Stats.Ldr} /><AttributeBox label="Off the Ball" value={selected.Stats.Off} /><AttributeBox label="Positioning" value={selected.Stats.Pos} /><AttributeBox label="Teamwork" value={selected.Stats.Tea} /><AttributeBox label="Vision" value={selected.Stats.Vis} /><AttributeBox label="Work Rate" value={selected.Stats.Wor} /></div>}</div>
              <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-700/50 h-full"><h3 className="font-bold border-b border-slate-700 mb-4 pb-2 text-blue-400 uppercase text-xs tracking-wider flex justify-between">Physical</h3>{selected.Stats && <div className="space-y-1"><AttributeBox label="Acceleration" value={selected.Stats.Acc} /><AttributeBox label="Agility" value={selected.Stats.Agi} /><AttributeBox label="Balance" value={selected.Stats.Bal} /><AttributeBox label="Jumping Reach" value={selected.Stats.Jum} /><AttributeBox label="Natural Fitness" value={selected.Stats.Nat} /><AttributeBox label="Pace" value={selected.Stats.Pac} /><AttributeBox label="Stamina" value={selected.Stats.Sta} /><AttributeBox label="Strength" value={selected.Stats.Str} /></div>}</div>
            </>
          ) : (
            <>
              <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-700/50 h-full"><h3 className="font-bold border-b border-slate-700 mb-4 pb-2 text-emerald-400 uppercase text-xs tracking-wider flex justify-between">Technical</h3>{selected.Stats && <div className="space-y-1"><AttributeBox label="Corners" value={selected.Stats.Cor} /><AttributeBox label="Crossing" value={selected.Stats.Cro} /><AttributeBox label="Dribbling" value={selected.Stats.Dri} /><AttributeBox label="Finishing" value={selected.Stats.Fin} /><AttributeBox label="First Touch" value={selected.Stats.Fir} /><AttributeBox label="Free Kicks" value={selected.Stats.Fre} /><AttributeBox label="Heading" value={selected.Stats.Hea} /><AttributeBox label="Long Shots" value={selected.Stats.Lon} /><AttributeBox label="Long Throws" value={selected.Stats.LTh} /><AttributeBox label="Marking" value={selected.Stats.Mar} /><AttributeBox label="Passing" value={selected.Stats.Pas} /><AttributeBox label="Penalty Taking" value={selected.Stats.Pen} /><AttributeBox label="Tackling" value={selected.Stats.Tck} /><AttributeBox label="Technique" value={selected.Stats.Tec} /></div>}</div>
              <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-700/50 h-full"><h3 className="font-bold border-b border-slate-700 mb-4 pb-2 text-yellow-500 uppercase text-xs tracking-wider flex justify-between">Mental</h3>{selected.Stats && <div className="space-y-1"><AttributeBox label="Aggression" value={selected.Stats.Agg} /><AttributeBox label="Anticipation" value={selected.Stats.Ant} /><AttributeBox label="Bravery" value={selected.Stats.Bra} /><AttributeBox label="Composure" value={selected.Stats.Cmp} /><AttributeBox label="Concentration" value={selected.Stats.Cnt} /><AttributeBox label="Decisions" value={selected.Stats.Dec} /><AttributeBox label="Determination" value={selected.Stats.Det} /><AttributeBox label="Flair" value={selected.Stats.Fla} /><AttributeBox label="Leadership" value={selected.Stats.Ldr} /><AttributeBox label="Off the Ball" value={selected.Stats.Off} /><AttributeBox label="Positioning" value={selected.Stats.Pos} /><AttributeBox label="Teamwork" value={selected.Stats.Tea} /><AttributeBox label="Vision" value={selected.Stats.Vis} /><AttributeBox label="Work Rate" value={selected.Stats.Wor} /></div>}</div>
              <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-700/50 h-full"><h3 className="font-bold border-b border-slate-700 mb-4 pb-2 text-blue-400 uppercase text-xs tracking-wider flex justify-between">Physical</h3>{selected.Stats && <div className="space-y-1"><AttributeBox label="Acceleration" value={selected.Stats.Acc} /><AttributeBox label="Agility" value={selected.Stats.Agi} /><AttributeBox label="Balance" value={selected.Stats.Bal} /><AttributeBox label="Jumping Reach" value={selected.Stats.Jum} /><AttributeBox label="Natural Fitness" value={selected.Stats.Nat} /><AttributeBox label="Pace" value={selected.Stats.Pac} /><AttributeBox label="Stamina" value={selected.Stats.Sta} /><AttributeBox label="Strength" value={selected.Stats.Str} /></div>}</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// --- AUTH PAGE ---
const AuthPage = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [displayName, setDisplayName] = useState(''); const [error, setError] = useState(''); const [loading, setLoading] = useState(false);
  const googleProvider = new GoogleAuthProvider();
  const handleGoogleLogin = async () => { try { setLoading(true); await signInWithPopup(auth, googleProvider); } catch (err) { setError(err.message); setLoading(false); } };
  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { if (isRegistering) { const userCredential = await createUserWithEmailAndPassword(auth, email, password); await updateProfile(userCredential.user, { displayName: displayName }); } else { await signInWithEmailAndPassword(auth, email, password); } }
    catch (err) { if (err.code === 'auth/email-already-in-use') setError('Email này đã được sử dụng.'); else setError(err.message); } setLoading(false);
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-800">
        <div className="bg-emerald-600/20 p-8 text-center border-b border-slate-800"><Trophy size={48} className="mx-auto text-emerald-500 mb-2" /><h1 className="text-2xl font-bold text-white">ManagerHub</h1><p className="text-slate-400 text-sm">Cộng đồng quản lý bóng đá Việt Nam</p></div>
        <div className="p-8"><h2 className="text-xl font-bold text-white mb-6 text-center">{isRegistering ? 'Đăng ký tài khoản' : 'Đăng nhập'}</h2>{error && (<div className="mb-4 p-3 bg-red-900/30 border border-red-800 text-red-400 text-sm rounded-lg flex items-center"><AlertCircle size={16} className="mr-2" /> {error}</div>)}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (<div><label className="block text-sm font-medium text-slate-400 mb-1">Tên hiển thị</label><input type="text" className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-emerald-500 outline-none" value={displayName} onChange={e => setDisplayName(e.target.value)} required /></div>)}
            <div><label className="block text-sm font-medium text-slate-400 mb-1">Email</label><input type="email" className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-emerald-500 outline-none" value={email} onChange={e => setEmail(e.target.value)} required /></div>
            <div><label className="block text-sm font-medium text-slate-400 mb-1">Mật khẩu</label><input type="password" className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-emerald-500 outline-none" value={password} onChange={e => setPassword(e.target.value)} required /></div>
            <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg transition flex justify-center items-center">{loading ? <Loader2 className="animate-spin" /> : (isRegistering ? 'Đăng ký' : 'Đăng nhập')}</button>
          </form>
          <div className="my-4 flex items-center"><div className="flex-grow border-t border-slate-700"></div><span className="mx-4 text-slate-500 text-sm">Hoặc</span><div className="flex-grow border-t border-slate-700"></div></div>
          <button onClick={handleGoogleLogin} className="w-full bg-white text-slate-900 font-bold py-3 rounded-lg flex justify-center items-center gap-2 hover:bg-gray-100 transition"><Globe size={20} /> Đăng nhập bằng Google</button>
          <div className="mt-6 text-center text-sm text-slate-500">{isRegistering ? 'Đã có tài khoản? ' : 'Chưa có tài khoản? '}<button onClick={() => setIsRegistering(!isRegistering)} className="text-emerald-500 font-bold hover:underline">{isRegistering ? 'Đăng nhập' : 'Đăng ký ngay'}</button></div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null); const [loading, setLoading] = useState(true); const [tab, setTab] = useState('home'); const [mobileMenu, setMobileMenu] = useState(false);
  useEffect(() => { const unsubscribe = onAuthStateChanged(auth, (u) => { setUser(u); setLoading(false); }); return () => unsubscribe(); }, []);
  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-950 text-white"><Loader2 className="animate-spin text-emerald-500" /></div>;
  if (!user) return <AuthPage />;
  const isAdmin = ADMIN_EMAILS.includes(user.email);
  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-300 pb-20 selection:bg-emerald-500/30 selection:text-emerald-200">
      <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2 font-bold text-xl text-white cursor-pointer" onClick={() => setTab('home')}>
            <Trophy className="text-emerald-500" size={24} /> <span>Manager<span className="text-emerald-500">Hub</span></span>
          </div>
          <div className="hidden md:flex gap-1">{[{ id: 'home', label: 'Trang chủ', icon: Home }, { id: 'news', label: 'Tin tức', icon: Newspaper }, { id: 'database', label: 'Database', icon: Database }, { id: 'story', label: 'Story', icon: Activity }].map((item) => (<button key={item.id} onClick={() => setTab(item.id)} className={`px-4 py-2 rounded-lg transition text-sm font-medium flex items-center gap-2 ${tab === item.id ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/50' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}><item.icon size={16} /> {item.label}</button>))}{isAdmin && <button onClick={() => setTab('admin')} className={`px-4 py-2 rounded-lg transition text-sm font-bold flex items-center gap-2 ml-4 ${tab === 'admin' ? 'bg-red-900/30 text-red-400 border border-red-800' : 'text-red-400 hover:bg-red-900/20'}`}><Lock size={14} /> Admin</button>}</div>
          <div className="flex items-center gap-3"><div className="hidden md:block text-right"><div className="text-sm font-bold text-white">{user.displayName}</div><div className="text-[10px] text-slate-500">{isAdmin ? 'Administrator' : 'Member'}</div></div><button onClick={() => signOut(auth)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition"><LogOut size={20} /></button><button className="md:hidden text-slate-400" onClick={() => setMobileMenu(!mobileMenu)}><Menu /></button></div>
        </div>
      </nav>
      <main className="animate-in fade-in duration-500">{tab === 'home' && (<div className="relative py-20 text-center"><div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500 via-slate-900 to-slate-950"></div><div className="relative z-10 max-w-2xl mx-auto px-4"><span className="inline-block py-1 px-3 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-widest mb-6 uppercase">Football Manager Tool</span><h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight text-white">GameHub <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">FC</span></h1><p className="text-xl text-slate-400 mb-10 font-light">Công cụ tra cứu chỉ số & phân tích đội hình tối thượng.</p><div className="flex justify-center gap-4"><button onClick={() => setTab('database')} className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition flex items-center gap-2"><Search size={20} /> Tra cứu</button><button onClick={() => setTab('news')} className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg border border-slate-700 transition flex items-center gap-2"><Newspaper size={20} /> Tin tức</button></div></div></div>)}{tab === 'home' && <NewsFeed user={user} />}{tab === 'news' && <NewsFeed user={user} />}{tab === 'database' && <DatabaseView />}{tab === 'story' && <StoryMode user={user} />}{tab === 'admin' && isAdmin && <AdminPanel />}</main>
    </div>
  );
}