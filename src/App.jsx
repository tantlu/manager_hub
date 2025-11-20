import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search, Database, Newspaper, User, LogOut, PlusCircle,
  Download, Trophy, TrendingUp, Shield, Activity, FileUp,
  Sparkles, Bot, Loader2, X, UploadCloud, Eye, LayoutGrid,
  List, Shirt, Settings, CheckCircle, AlertCircle, Menu,
  Paperclip, Image as ImageIcon, Bold, Italic, Type, Star,
  MessageCircle, Send, FileText, Trash2, Lock, Mail, Key,
  ChevronRight, Share2
} from 'lucide-react';

// --- MOCK DATA (Dữ liệu mẫu để Demo đẹp mắt) ---
const CURRENT_USER = {
  uid: 'admin-root',
  displayName: 'tencuto',
  email: 'tencuto@gamehub.com',
  isAdmin: true,
  avatar: null
};

const SAMPLE_POSTS = [
  {
    id: 1,
    title: "Tổng kết mùa giải 2024: Cú ăn ba lịch sử!",
    content: "Một mùa giải không thể tin nổi! Chúng ta đã vô địch League, Cup và cả Champions League. \n\n**Mbappe** thực sự là một con quái vật với 52 bàn thắng. Tuy nhiên, hàng thủ vẫn cần cải thiện khi để lọt lưới khá nhiều ở những phút cuối.",
    type: "review",
    author: "tencuto",
    createdAt: new Date().toISOString(),
    rating: 4.8,
    ratingCount: 15,
    comments: [
      { id: 1, author: "fan_ham_mo", content: "Đội hình quá khủng, chúc mừng bác!", createdAt: new Date().toISOString() },
      { id: 2, author: "rival_club", content: "May mắn thôi...", createdAt: new Date().toISOString() }
    ]
  },
  {
    id: 2,
    title: "[Tactics] 4-2-3-1 Gegenpress - Hủy diệt mọi đối thủ",
    content: "Chia sẻ với anh em tactic mình dùng để leo rank mùa này. \n\nChìa khóa nằm ở vị trí **Volante** (DM) dâng cao hỗ trợ tấn công. Anh em nhớ set tiền đạo là *Complete Forward* nhé.",
    type: "tip",
    author: "TacticalMaster",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    rating: 4.5,
    ratingCount: 8,
    comments: []
  }
];

// --- UTILS ---
const renderRichText = (text) => {
  if (!text) return null;
  let html = text
    .replace(/\n/g, '<br/>')
    .replace(/\*\*(.*?)\*\*/g, '<b class="text-slate-900">$1</b>')
    .replace(/\*(.*?)\*/g, '<i class="text-slate-600">$1</i>')
    .replace(/## (.*?)<br\/>/g, '<h3 class="text-lg font-bold my-3 text-emerald-700">$1</h3>')
    .replace(/# (.*?)<br\/>/g, '<h2 class="text-xl font-extrabold my-4 text-slate-800">$1</h2>');
  return <div dangerouslySetInnerHTML={{ __html: html }} className="leading-relaxed" />;
};

const parseHtmlTable = (htmlString) => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const rows = Array.from(doc.querySelectorAll('tr'));
    if (rows.length === 0) return [];

    // Tìm dòng header
    let headerRow = rows.find(r => r.querySelectorAll('th').length > 5);
    if (!headerRow) headerRow = rows[0]; // Fallback

    const headers = Array.from(headerRow.querySelectorAll('th, td')).map((cell, index) => {
      let text = cell.innerText.trim();
      // Clean key name: replace dot, slash, spaces with underscore
      return text.replace(/[\.\/\s]+/g, '_') || `col_${index}`;
    });

    const data = [];
    const startIndex = rows.indexOf(headerRow) + 1;

    for (let i = startIndex; i < rows.length; i++) {
      const cells = Array.from(rows[i].querySelectorAll('td'));
      if (cells.length < headers.length) continue;

      const rowData = {};
      cells.forEach((cell, index) => {
        if (index < headers.length) {
          const key = headers[index];
          let value = cell.innerText.trim();
          if (!isNaN(value) && value !== '') value = Number(value);
          if (value === '-') value = 0;
          rowData[key] = value;
        }
      });

      if (rowData['Name'] && rowData['Name'] !== '-' && rowData['Name'] !== '') {
        // Helper to get stats with fallbacks
        const get = (keys) => {
          if (!Array.isArray(keys)) keys = [keys];
          for (let k of keys) {
            if (rowData[k] !== undefined) return rowData[k];
          }
          return Math.floor(Math.random() * 10) + 5; // Mock stats if missing for demo
        };

        rowData.Stats = {
          Cor: get(['Cor', 'Corners']), Cro: get(['Cro', 'Crossing']), Dri: get(['Dri', 'Dribbling']),
          Fin: get(['Fin', 'Finishing']), Fir: get(['Fir', 'First_Touch']), Fre: get(['Fre', 'Free_Kicks']),
          Hea: get(['Hea', 'Heading']), Lon: get(['Lon', 'Long_Shots']), LTh: get(['L_Th', 'Long_Throws']),
          Mar: get(['Mar', 'Marking']), Pas: get(['Pas', 'Passing']), Pen: get(['Pen', 'Penalty_Taking']),
          Tck: get(['Tck', 'Tackling']), Tec: get(['Tec', 'Technique']),
          Agg: get(['Agg', 'Aggression']), Ant: get(['Ant', 'Anticipation']), Bra: get(['Bra', 'Bravery']),
          Cmp: get(['Cmp', 'Composure']), Cnt: get(['Cnt', 'Concentration']), Dec: get(['Dec', 'Decisions']),
          Det: get(['Det', 'Determination']), Fla: get(['Fla', 'Flair']), Ldr: get(['Ldr', 'Leadership']),
          Off: get(['Off', 'Off_the_Ball', 'OtB']), Pos: get(['Pos', 'Positioning']), Tea: get(['Tea', 'Teamwork']),
          Vis: get(['Vis', 'Vision']), Wor: get(['Wor', 'Work_Rate']),
          Acc: get(['Acc', 'Acceleration']), Agi: get(['Agi', 'Agility']), Bal: get(['Bal', 'Balance']),
          Jum: get(['Jum', 'Jumping_Reach']), Nat: get(['Nat', 'Natural_Fitness']), Pac: get(['Pac', 'Pace']),
          Sta: get(['Sta', 'Stamina']), Str: get(['Str', 'Strength'])
        };
        data.push(rowData);
      }
    }
    return data;
  } catch (e) {
    console.error(e);
    return [];
  }
};

// --- COMPONENTS ---

const PlayerAvatar = ({ uid, name, size = "md", className = "" }) => {
  const [error, setError] = useState(false);
  const sizeClasses = { sm: "w-10 h-10 text-xs", md: "w-14 h-14 text-sm", lg: "w-24 h-24 text-2xl", xl: "w-32 h-32 text-4xl" };
  const currentSize = sizeClasses[size] || sizeClasses.md;

  // Mock UID detection or fallback
  const imageUrl = uid ? `https://img.fminside.net/facesfm26/${uid}.png` : null;

  if (!imageUrl || error) {
    return (
      <div className={`${currentSize} bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl flex items-center justify-center font-bold text-emerald-400 shadow-inner border border-slate-600/50 ${className}`}>
        {name ? name[0].toUpperCase() : '?'}
      </div>
    );
  }
  return (
    <div className={`${currentSize} relative rounded-xl overflow-hidden bg-slate-200 shadow-md border border-white/50 ${className}`}>
      <img src={imageUrl} alt={name} className="w-full h-full object-cover hover:scale-110 transition duration-500" onError={() => setError(true)} loading="lazy" />
    </div>
  );
};

const RadarChart = ({ stats }) => {
  if (!stats) return null;
  const groups = [
    { name: "ATT", val: (stats.Fin + stats.Lon + stats.Off) / 3 },
    { name: "TEC", val: (stats.Tec + stats.Dri + stats.Pas) / 3 },
    { name: "TAC", val: (stats.Dec + stats.Ant + stats.Vis) / 3 },
    { name: "DEF", val: (stats.Tck + stats.Mar + stats.Pos) / 3 },
    { name: "PHY", val: (stats.Pac + stats.Acc + stats.Str) / 3 },
    { name: "CRE", val: (stats.Fla + stats.Vis + stats.Cro) / 3 }
  ];

  const size = 220; const center = size / 2; const radius = 80; const angleStep = (Math.PI * 2) / groups.length;
  const getPoint = (index, value) => {
    const angle = index * angleStep - Math.PI / 2;
    const dist = ((value || 5) / 20) * radius;
    return { x: center + Math.cos(angle) * dist, y: center + Math.sin(angle) * dist };
  };

  const points = groups.map((g, i) => getPoint(i, g.val)).map(p => `${p.x},${p.y}`).join(' ');
  const bgPoints = groups.map((g, i) => getPoint(i, 20)).map(p => `${p.x},${p.y}`).join(' ');
  const midPoints = groups.map((g, i) => getPoint(i, 10)).map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className="flex flex-col items-center justify-center py-6">
      <svg width={size} height={size} className="overflow-visible filter drop-shadow-xl">
        <polygon points={bgPoints} fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
        <polygon points={midPoints} fill="none" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
        <polygon points={points} fill="rgba(16, 185, 129, 0.5)" stroke="#059669" strokeWidth="3" strokeLinejoin="round" />
        {groups.map((g, i) => {
          const p = getPoint(i, 25);
          return (
            <g key={i}>
              <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontSize="11" fontWeight="800" fill="#475569" className="uppercase tracking-wider">{g.name}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const AttributeBox = ({ label, value }) => {
  const val = value || 0;
  let bgClass = "bg-slate-100 text-slate-500";
  if (val >= 16) bgClass = "bg-emerald-500 text-white shadow-sm shadow-emerald-200";
  else if (val >= 11) bgClass = "bg-amber-400 text-white shadow-sm shadow-amber-100";
  else if (val >= 1) bgClass = "bg-slate-200 text-slate-700";

  return (
    <div className="flex justify-between items-center text-sm py-1.5 border-b border-slate-50 last:border-0 group hover:bg-slate-50 px-2 rounded transition">
      <span className="text-slate-600 font-medium group-hover:text-slate-800">{label}</span>
      <span className={`font-bold px-2 py-0.5 rounded text-xs min-w-[28px] text-center ${bgClass} transition-all`}>{val}</span>
    </div>
  );
};

// Simple Best XI Logic
const PitchView = ({ players }) => {
  // Quick logic to pick best players based on Rating & Position
  const findBest = (pos) => {
    const cands = players.filter(p => p.Position && p.Position.includes(pos));
    return cands.sort((a, b) => (b['Av Rat'] || 0) - (a['Av Rat'] || 0))[0];
  }

  // 4-3-3
  const team = {
    GK: findBest('GK'),
    DL: findBest('D (L)'), DC1: findBest('D (C)'), DC2: players.filter(p => p.Position?.includes('D (C)')).sort((a, b) => (b['Av Rat'] || 0) - (a['Av Rat'] || 0))[1], DR: findBest('D (R)'),
    MC1: findBest('M (C)'), MC2: players.filter(p => p.Position?.includes('M (C)')).sort((a, b) => (b['Av Rat'] || 0) - (a['Av Rat'] || 0))[1], AMC: findBest('AM (C)'),
    AML: findBest('AM (L)'), AMR: findBest('AM (R)'), ST: findBest('ST')
  };

  const PlayerDot = ({ p, top, left }) => (
    <div className="absolute flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10" style={{ top, left }}>
      <div className={`relative transition-all duration-300 group-hover:scale-110 ${!p ? 'opacity-50 grayscale' : ''}`}>
        <PlayerAvatar uid={p?.UID} name={p?.Name} size="md" className="border-2 border-white shadow-lg ring-2 ring-emerald-500/30" />
        {p && <div className="absolute -top-2 -right-2 bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white shadow-sm">{p['Av Rat']}</div>}
      </div>
      <div className="mt-1 bg-slate-900/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] text-white font-bold shadow-xl max-w-[80px] truncate border border-white/10">
        {p ? p.Name.split(' ').pop() : 'Trống'}
      </div>
    </div>
  );

  return (
    <div className="relative w-full max-w-2xl mx-auto aspect-[4/3] bg-gradient-to-b from-emerald-700 to-emerald-800 rounded-xl overflow-hidden border-4 border-white/20 shadow-2xl ring-1 ring-black/20">
      {/* Pitch Markings */}
      <div className="absolute inset-4 border-2 border-white/30 rounded-sm"></div>
      <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-white/30"></div>
      <div className="absolute top-1/2 left-1/2 w-24 h-24 border-2 border-white/30 rounded-full -translate-x-1/2 -translate-y-1/2"></div>

      <PlayerDot p={team.GK} top="90%" left="50%" />
      <PlayerDot p={team.DL} top="75%" left="15%" />
      <PlayerDot p={team.DC1} top="75%" left="38%" />
      <PlayerDot p={team.DC2} top="75%" left="62%" />
      <PlayerDot p={team.DR} top="75%" left="85%" />
      <PlayerDot p={team.MC1} top="55%" left="35%" />
      <PlayerDot p={team.MC2} top="55%" left="65%" />
      <PlayerDot p={team.AMC} top="40%" left="50%" />
      <PlayerDot p={team.AML} top="25%" left="20%" />
      <PlayerDot p={team.AMR} top="25%" left="80%" />
      <PlayerDot p={team.ST} top="15%" left="50%" />
    </div>
  );
};

// --- MAIN SECTIONS ---

const PostCreator = ({ onPost }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("news");

  const handleSubmit = () => {
    if (!title) return;
    onPost({
      id: Date.now(),
      title, content, type,
      author: CURRENT_USER.displayName,
      createdAt: new Date().toISOString(),
      rating: 0, ratingCount: 0, comments: []
    });
    setTitle(""); setContent("");
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8 animate-in fade-in slide-in-from-top-4">
      <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
        <PlusCircle className="text-emerald-600" size={20} /> Tạo bài viết mới
      </h3>
      <input
        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl mb-3 font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
        placeholder="Tiêu đề bài viết..."
        value={title} onChange={e => setTitle(e.target.value)}
      />
      <div className="flex gap-3 mb-3">
        <select value={type} onChange={e => setType(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium outline-none">
          <option value="news">Tin tức</option>
          <option value="tip">Chiến thuật</option>
          <option value="review">Review</option>
        </select>
      </div>
      <textarea
        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl h-32 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition mb-3"
        placeholder="Nội dung chi tiết (Hỗ trợ Markdown)..."
        value={content} onChange={e => setContent(e.target.value)}
      />
      <div className="flex justify-end">
        <button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-bold text-sm shadow-lg shadow-emerald-600/20 transition">
          Đăng ngay
        </button>
      </div>
    </div>
  )
}

const NewsFeed = ({ posts, setPosts }) => {
  const handlePost = (newPost) => setPosts([newPost, ...posts]);
  return (
    <div className="max-w-4xl mx-auto p-6">
      <PostCreator onPost={handlePost} />
      <div className="space-y-6">
        {posts.map(post => (
          <div key={post.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition group">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold">
                  {post.author[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">{post.author}</p>
                  <p className="text-xs text-slate-400">{new Date(post.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold uppercase">{post.type}</span>
            </div>
            <h3 className="font-bold text-xl mb-3 text-slate-900 group-hover:text-emerald-700 transition">{post.title}</h3>
            <div className="text-slate-600 text-sm leading-relaxed pl-4 border-l-2 border-slate-200 mb-4">
              {renderRichText(post.content)}
            </div>
            <div className="flex items-center gap-4 pt-4 border-t border-slate-50">
              <div className="flex items-center gap-1 text-yellow-400">
                <Star size={18} fill="currentColor" />
                <span className="text-slate-500 text-sm font-bold ml-1">{post.rating}</span>
              </div>
              <button className="text-slate-400 hover:text-emerald-600 flex items-center gap-1 text-sm font-medium transition">
                <MessageCircle size={18} /> {post.comments?.length || 0} Bình luận
              </button>
              <button className="text-slate-400 hover:text-blue-600 flex items-center gap-1 text-sm font-medium transition ml-auto">
                <Share2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const DatabaseView = ({ players }) => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    if (!search) return players.slice(0, 50);
    return players.filter(p => p.Name.toLowerCase().includes(search.toLowerCase()));
  }, [players, search]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6 flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Database className="text-emerald-600" /> Database <span className="text-slate-400 text-sm font-normal">({players.length})</span>
        </h2>
        <div className="relative w-96">
          <Search className="absolute left-3 top-3 text-slate-400" size={20} />
          <input
            className="w-full pl-10 p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition"
            placeholder="Tìm cầu thủ..."
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {players.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300">
          <Database size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500">Chưa có dữ liệu. Vui lòng vào tab <b>Admin</b> để nạp file.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 font-bold text-slate-700 border-b border-slate-200">
              <tr>
                <th className="p-4 w-16">#</th>
                <th className="p-4">Tên</th>
                <th className="p-4">CLB</th>
                <th className="p-4 text-center">CA</th>
                <th className="p-4 text-center">PA</th>
                <th className="p-4 text-center">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p, i) => (
                <tr key={i} className="hover:bg-slate-50 cursor-pointer transition" onClick={() => setSelected(p)}>
                  <td className="p-4"><PlayerAvatar uid={p.UID} name={p.Name} size="sm" /></td>
                  <td className="p-4 font-bold text-slate-900">{p.Name}</td>
                  <td className="p-4 text-slate-600">{p.Club}</td>
                  <td className="p-4 text-center"><span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-bold">{p.CA || '-'}</span></td>
                  <td className="p-4 text-center"><span className="bg-purple-100 text-purple-700 px-2 py-1 rounded font-bold">{p.PA || '-'}</span></td>
                  <td className="p-4 text-center"><Eye size={18} className="mx-auto text-slate-400" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="bg-slate-900 text-white p-6 flex justify-between items-start sticky top-0 z-10">
              <div className="flex gap-6 items-center">
                <PlayerAvatar uid={selected.UID} name={selected.Name} size="xl" className="border-4 border-slate-700 shadow-lg" />
                <div>
                  <h2 className="text-3xl font-bold">{selected.Name}</h2>
                  <div className="flex items-center gap-3 mt-2 text-slate-400 text-sm">
                    <span className="flex items-center gap-1"><Shield size={14} /> {selected.Club}</span>
                    <span className="bg-slate-800 px-2 py-0.5 rounded">{selected.Position}</span>
                    <span>{selected.Age} tuổi</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 text-white transition"><X size={24} /></button>
            </div>

            <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 bg-slate-50">
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                <h3 className="font-bold border-b border-slate-100 mb-4 pb-2 text-slate-800 flex items-center gap-2"><Activity size={18} className="text-emerald-500" /> Technical</h3>
                {selected.Stats && <div className="space-y-1">
                  <AttributeBox label="Finishing" value={selected.Stats.Fin} />
                  <AttributeBox label="Dribbling" value={selected.Stats.Dri} />
                  <AttributeBox label="Passing" value={selected.Stats.Pas} />
                  <AttributeBox label="Technique" value={selected.Stats.Tec} />
                  <AttributeBox label="Tackling" value={selected.Stats.Tck} />
                </div>}
              </div>
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                <h3 className="font-bold border-b border-slate-100 mb-4 pb-2 text-slate-800 flex items-center gap-2"><Bot size={18} className="text-yellow-500" /> Mental</h3>
                {selected.Stats && <div className="space-y-1">
                  <AttributeBox label="Vision" value={selected.Stats.Vis} />
                  <AttributeBox label="Decisions" value={selected.Stats.Dec} />
                  <AttributeBox label="Anticipation" value={selected.Stats.Ant} />
                  <AttributeBox label="Composure" value={selected.Stats.Cmp} />
                </div>}
              </div>
              <div className="space-y-6">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                  <h3 className="font-bold border-b border-slate-100 mb-4 pb-2 text-slate-800 flex items-center gap-2"><TrendingUp size={18} className="text-blue-500" /> Physical</h3>
                  {selected.Stats && <div className="space-y-1">
                    <AttributeBox label="Pace" value={selected.Stats.Pac} />
                    <AttributeBox label="Acceleration" value={selected.Stats.Acc} />
                    <AttributeBox label="Stamina" value={selected.Stats.Sta} />
                    <AttributeBox label="Strength" value={selected.Stats.Str} />
                  </div>}
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center">
                  <RadarChart stats={selected.Stats} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StoryMode = () => {
  const [data, setData] = useState([]);
  const [view, setView] = useState('list');
  const handleUpload = (e) => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = (ev) => { setData(parseHtmlTable(ev.target.result)); setView('pitch'); };
    r.readAsText(f);
  };
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-slate-900 text-white p-10 rounded-3xl mb-8 flex flex-col md:flex-row justify-between items-center shadow-2xl relative overflow-hidden">
        <div className="relative z-10 mb-6 md:mb-0">
          <h2 className="text-4xl font-black mb-2 flex items-center gap-3"><Activity className="text-emerald-400" size={36} /> My Season Story</h2>
          <p className="text-slate-400 text-lg">Upload file <b>story.html</b> để xem đội hình tiêu biểu.</p>
        </div>
        <div className="relative z-10 flex gap-4 items-center">
          {data.length > 0 && (
            <div className="bg-slate-800 rounded-lg p-1 flex border border-slate-600">
              <button onClick={() => setView('list')} className={`p-3 rounded-md ${view === 'list' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}><List /></button>
              <button onClick={() => setView('pitch')} className={`p-3 rounded-md ${view === 'pitch' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}><LayoutGrid /></button>
            </div>
          )}
          <label className="bg-gradient-to-r from-emerald-600 to-teal-500 px-8 py-4 rounded-xl font-bold cursor-pointer hover:shadow-lg hover:shadow-emerald-900/50 transition transform hover:-translate-y-1 flex items-center gap-3 text-white">
            <UploadCloud /> <span>Upload Story</span>
            <input type="file" className="hidden" onChange={handleUpload} accept=".html" />
          </label>
        </div>
      </div>
      {data.length > 0 ? (
        view === 'list' ? (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-100">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 font-bold text-slate-700 border-b"><tr><th className="p-4 w-20">#</th><th className="p-4">Tên</th><th className="p-4 text-center">Trận</th><th className="p-4 text-center">Bàn</th><th className="p-4 text-center">Av Rat</th></tr></thead>
              <tbody className="divide-y divide-slate-100">{data.map((p, i) => (<tr key={i} className="hover:bg-slate-50"><td className="p-4"><PlayerAvatar uid={p.UID} name={p.Name} size="sm" /></td><td className="p-4 font-bold text-slate-900">{p.Name}</td><td className="p-4 text-center">{p.Apps}</td><td className="p-4 text-center font-bold text-slate-700">{p.Gls}</td><td className="p-4 text-center"><span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-bold">{p["Av Rat"]}</span></td></tr>))}</tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2"><Shirt className="text-emerald-600" /> Best XI Season</h3>
            <PitchView players={data} />
          </div>
        )
      ) : (
        <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center">
          <FileUp size={64} className="text-slate-300 mb-4" />
          <p className="text-slate-400 font-medium">Chưa có dữ liệu mùa giải.</p>
        </div>
      )}
    </div>
  );
}

const AdminPanel = ({ onUpdateDb }) => {
  const handleUpload = (e) => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = (ev) => {
      const parsed = parseHtmlTable(ev.target.result);
      onUpdateDb(parsed);
      alert(`Đã nạp thành công ${parsed.length} cầu thủ vào bộ nhớ.`);
    };
    r.readAsText(f);
  };
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2"><Lock className="text-red-400" /> Admin Dashboard</h2>
          <span className="text-xs bg-red-900 text-red-200 px-2 py-1 rounded border border-red-700">Local Admin</span>
        </div>
        <div className="p-10 text-center">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Database size={40} className="text-emerald-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Cập nhật Database</h3>
          <p className="text-slate-500 mb-8">Upload file <b>database.html</b> để mọi người có thể tra cứu.</p>
          <label className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-xl font-bold cursor-pointer shadow-lg transition inline-flex items-center gap-2">
            <UploadCloud size={20} /> Chọn file Database
            <input type="file" className="hidden" onChange={handleUpload} accept=".html" />
          </label>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState('home');
  const [posts, setPosts] = useState(SAMPLE_POSTS);
  const [players, setPlayers] = useState([]);
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20 selection:bg-emerald-200 selection:text-emerald-900">
      <nav className="bg-slate-900/95 backdrop-blur-md text-white p-3 sticky top-0 z-50 shadow-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 font-black text-xl text-white cursor-pointer hover:scale-105 transition" onClick={() => setTab('home')}>
            <div className="bg-emerald-500 p-1.5 rounded-lg"><Trophy size={20} className="text-white" /></div>
            <span className="hidden sm:block">Manager<span className="text-emerald-400">Hub</span></span>
          </div>
          <div className="hidden md:flex gap-1 bg-slate-800/50 p-1 rounded-xl border border-white/5">
            {[{ id: 'news', label: 'Tin tức', icon: Newspaper }, { id: 'database', label: 'Database', icon: Database }, { id: 'story', label: 'Story', icon: Activity }].map((item) => (
              <button key={item.id} onClick={() => setTab(item.id)} className={`px-4 py-2 rounded-lg transition text-sm font-bold flex items-center gap-2 ${tab === item.id ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}>
                <item.icon size={16} /> {item.label}
              </button>
            ))}
            <button onClick={() => setTab('admin')} className={`px-4 py-2 rounded-lg transition text-sm font-bold flex items-center gap-2 ${tab === 'admin' ? 'bg-red-600 text-white shadow-lg' : 'text-red-400 hover:bg-red-950/30'}`}><Lock size={16} /> Admin</button>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <div className="text-sm font-bold text-white">{CURRENT_USER.displayName}</div>
              <div className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full inline-block mt-0.5">Super Admin</div>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full border-2 border-slate-700 flex items-center justify-center font-bold shadow-lg">T</div>
          </div>
        </div>
      </nav>

      <main className="animate-in fade-in duration-500">
        {tab === 'home' && (
          <div className="relative">
            <div className="text-center py-28 bg-slate-900 text-white mb-10 relative overflow-hidden border-b border-slate-800">
              <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1522770179533-24471fcdba45?q=80&w=3000&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay"></div>
              <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-900 to-transparent"></div>
              <div className="relative z-10 max-w-3xl mx-auto px-4">
                <span className="inline-block py-1 px-3 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-widest mb-4 uppercase">Local Demo</span>
                <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-tight">GameHub <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">FC</span></h1>
                <p className="text-xl text-slate-400 mb-10 leading-relaxed font-light max-w-2xl mx-auto">Phiên bản Demo chạy trực tiếp. Hãy vào Admin để nạp dữ liệu.</p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button onClick={() => setTab('database')} className="group bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-xl font-bold shadow-xl transition transform hover:-translate-y-1 flex items-center justify-center gap-2"><Search size={20} /> Tra cứu</button>
                  <button onClick={() => setTab('admin')} className="group bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-xl font-bold shadow-xl border border-slate-700 transition transform hover:-translate-y-1 flex items-center justify-center gap-2"><Lock size={20} /> Admin Panel</button>
                </div>
              </div>
            </div>
            <NewsFeed posts={posts} setPosts={setPosts} />
          </div>
        )}

        {tab === 'news' && <NewsFeed posts={posts} setPosts={setPosts} />}
        {tab === 'database' && <DatabaseView players={players} />}
        {tab === 'story' && <StoryMode />}
        {tab === 'admin' && <AdminPanel onUpdateDb={setPlayers} />}
      </main>
    </div>
  );
}