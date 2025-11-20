import React, { useState, useEffect, useMemo } from 'react';
import {
  Search, Database, Newspaper, User, LogOut, PlusCircle,
  Download, Trophy, TrendingUp, Shield, Activity, FileUp,
  Sparkles, Bot, Loader2, X, UploadCloud, Eye, LayoutGrid,
  List, Shirt, Settings, CheckCircle, AlertCircle, Menu,
  Paperclip, Image as ImageIcon, Bold, Italic, Type, Star,
  MessageCircle, Send, FileText, Trash2, Lock, Mail, Key,
  ChevronRight, Share2, Home
} from 'lucide-react';

// --- MOCK DATA ---
const CURRENT_USER = { uid: 'admin-root', displayName: 'tencuto', email: 'tencuto@gamehub.com', isAdmin: true, avatar: null };
const SAMPLE_POSTS = [
  { id: 1, title: "Tổng kết mùa giải 2024: Cú ăn ba lịch sử!", content: "Một mùa giải không thể tin nổi! Chúng ta đã vô địch League, Cup và cả Champions League.\n\n**Mbappe** thực sự là một con quái vật với 52 bàn thắng.", type: "review", author: "tencuto", createdAt: new Date().toISOString(), rating: 4.8, ratingCount: 15, comments: [] },
  { id: 2, title: "[Tactics] 4-2-3-1 Gegenpress - Hủy diệt mọi đối thủ", content: "Chia sẻ với anh em tactic mình dùng để leo rank mùa này.", type: "tip", author: "TacticalMaster", createdAt: new Date(Date.now() - 86400000).toISOString(), rating: 4.5, ratingCount: 8, comments: [] }
];

// --- UTILS & PARSERS ---
const renderRichText = (text) => {
  if (!text) return null;
  let html = text.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<b class="text-emerald-400">$1</b>').replace(/## (.*?)<br\/>/g, '<h3 class="text-lg font-bold my-3 text-emerald-500">$1</h3>');
  return <div dangerouslySetInnerHTML={{ __html: html }} className="leading-relaxed text-slate-300" />;
};

const parseHtmlTable = (htmlString) => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const rows = Array.from(doc.querySelectorAll('tr'));
    if (rows.length === 0) return [];

    // Tìm dòng header
    let headerRow = rows.find(r => r.querySelectorAll('th').length > 5);
    if (!headerRow) headerRow = rows[0];

    // Map tên cột gốc sang tên chuẩn hóa (lowercase, no spaces)
    const colMap = {};
    Array.from(headerRow.querySelectorAll('th, td')).forEach((cell, index) => {
      const text = cell.innerText.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      colMap[index] = text; // ví dụ: 0: "name", 1: "position", 5: "finishing"
    });

    const data = [];
    const startIndex = rows.indexOf(headerRow) + 1;

    for (let i = startIndex; i < rows.length; i++) {
      const cells = Array.from(rows[i].querySelectorAll('td'));
      const rowRaw = {};

      cells.forEach((cell, index) => {
        const key = colMap[index];
        if (key) {
          let value = cell.innerText.trim();
          if (!isNaN(value) && value !== '') value = Number(value);
          if (value === '-') value = 0;
          rowRaw[key] = value;
        }
      });

      // Chỉ xử lý nếu có tên cầu thủ
      if (rowRaw['name']) {
        // Helper function để tìm giá trị từ nhiều key tiềm năng
        const getVal = (possibleKeys) => {
          if (!Array.isArray(possibleKeys)) possibleKeys = [possibleKeys];
          for (const k of possibleKeys) {
            const normalizedKey = k.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (rowRaw[normalizedKey] !== undefined) return rowRaw[normalizedKey];
          }
          return 0; // Giá trị mặc định nếu không tìm thấy
        };

        const player = {
          UID: getVal(['uid', 'uniqueid']),
          Name: getVal(['name']),
          Position: getVal(['position', 'pos']),
          Club: getVal(['club', 'team']),
          Age: getVal(['age']),
          CA: getVal(['ca', 'currentability']),
          PA: getVal(['pa', 'potentialability']),
          Apps: getVal(['apps', 'appearances']),
          Gls: getVal(['gls', 'goals']),
          'Av Rat': getVal(['avrat', 'averagerating', 'avr']),
          'Transfer Value': getVal(['transfervalue', 'value']),
          Stats: {
            // Technical
            Cor: getVal(['cor', 'corners']), Cro: getVal(['cro', 'crossing']), Dri: getVal(['dri', 'dribbling']),
            Fin: getVal(['fin', 'finishing']), Fir: getVal(['fir', 'firsttouch']), Fre: getVal(['fre', 'freekicks']),
            Hea: getVal(['hea', 'heading']), Lon: getVal(['lon', 'longshots']), LTh: getVal(['lth', 'longthrows']),
            Mar: getVal(['mar', 'marking']), Pas: getVal(['pas', 'passing']), Pen: getVal(['pen', 'penaltytaking']),
            Tck: getVal(['tck', 'tackling']), Tec: getVal(['tec', 'technique']),
            // Mental
            Agg: getVal(['agg', 'aggression']), Ant: getVal(['ant', 'anticipation']), Bra: getVal(['bra', 'bravery']),
            Cmp: getVal(['cmp', 'composure']), Cnt: getVal(['cnt', 'concentration']), Dec: getVal(['dec', 'decisions']),
            Det: getVal(['det', 'determination']), Fla: getVal(['fla', 'flair']), Ldr: getVal(['ldr', 'leadership']),
            Off: getVal(['off', 'offtheball', 'otb']), Pos: getVal(['pos', 'positioning']), Tea: getVal(['tea', 'teamwork']),
            Vis: getVal(['vis', 'vision']), Wor: getVal(['wor', 'workrate']),
            // Physical
            Acc: getVal(['acc', 'acceleration']), Agi: getVal(['agi', 'agility']), Bal: getVal(['bal', 'balance']),
            Jum: getVal(['jum', 'jumpingreach']), Nat: getVal(['nat', 'naturalfitness']), Pac: getVal(['pac', 'pace']),
            Sta: getVal(['sta', 'stamina']), Str: getVal(['str', 'strength'])
          }
        };
        data.push(player);
      }
    }
    return data;
  } catch (e) { console.error(e); return []; }
};

// --- COMPONENTS ---
const PlayerAvatar = ({ uid, name, size = "md", className = "" }) => {
  const [error, setError] = useState(false);
  const sizeClasses = { sm: "w-8 h-8 text-xs", md: "w-12 h-12 text-sm", lg: "w-32 h-32 text-3xl", xl: "w-48 h-48 text-5xl" };
  const imageUrl = uid ? `https://img.fminside.net/facesfm26/${uid}.png` : null;
  if (!imageUrl || error) return <div className={`${sizeClasses[size] || sizeClasses.md} bg-slate-700 rounded flex items-center justify-center font-bold text-slate-400 border border-slate-600 ${className}`}>{name ? name[0].toUpperCase() : '?'}</div>;
  return <div className={`${sizeClasses[size] || sizeClasses.md} relative rounded overflow-hidden bg-slate-800 border border-slate-600 ${className}`}><img src={imageUrl} alt={name} className="w-full h-full object-cover" onError={() => setError(true)} loading="lazy" /></div>;
};

const RadarChart = ({ stats }) => {
  if (!stats) return null;
  const groups = [{ name: "ATT", val: (stats.Fin + stats.Lon + stats.Off) / 3 }, { name: "TEC", val: (stats.Tec + stats.Dri + stats.Pas) / 3 }, { name: "TAC", val: (stats.Dec + stats.Ant + stats.Vis) / 3 }, { name: "DEF", val: (stats.Tck + stats.Mar + stats.Pos) / 3 }, { name: "PHY", val: (stats.Pac + stats.Acc + stats.Str) / 3 }, { name: "CRE", val: (stats.Fla + stats.Vis + stats.Cro) / 3 }];
  const size = 240; const center = size / 2; const radius = 80;
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
  const val = value || 0;
  let valColor = "text-slate-400";
  let bgBar = "bg-slate-700";
  // Logic màu sắc chuẩn FM
  if (val >= 16) { valColor = "text-emerald-400 font-bold"; bgBar = "bg-emerald-500"; }
  else if (val >= 11) { valColor = "text-yellow-500 font-bold"; bgBar = "bg-yellow-500"; }
  else if (val < 1) { valColor = "text-slate-600"; bgBar = "bg-transparent"; } // Giá trị 0 hoặc null

  return (
    <div className="flex justify-between items-center text-sm py-1 border-b border-slate-700/50 last:border-0 group hover:bg-slate-700/30 px-2 rounded transition">
      <span className="text-slate-300 font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden hidden sm:block border border-slate-700/50">
          <div className={`h-full ${bgBar}`} style={{ width: `${(Math.min(val, 20) / 20) * 100}%` }}></div>
        </div>
        <span className={`w-6 text-right ${valColor}`}>{val}</span>
      </div>
    </div>
  );
};

const PostCreator = ({ onPost }) => {
  const [title, setTitle] = useState(""); const [content, setContent] = useState(""); const [type, setType] = useState("news");
  const handleSubmit = () => { if (!title) return; onPost({ id: Date.now(), title, content, type, author: CURRENT_USER.displayName, createdAt: new Date().toISOString(), rating: 0, ratingCount: 0, comments: [] }); setTitle(""); setContent(""); }
  return (
    <div className="bg-slate-800 rounded-xl p-6 mb-8 border border-slate-700">
      <h3 className="font-bold text-slate-200 mb-4 flex items-center gap-2"><PlusCircle className="text-emerald-500" size={20} /> Tạo bài viết mới</h3>
      <input className="w-full p-3 bg-slate-900 border border-slate-600 rounded-lg mb-3 text-slate-200 focus:border-emerald-500 outline-none" placeholder="Tiêu đề..." value={title} onChange={e => setTitle(e.target.value)} />
      <div className="flex gap-3 mb-3"><select value={type} onChange={e => setType(e.target.value)} className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-300 outline-none"><option value="news">Tin tức</option><option value="tip">Chiến thuật</option><option value="review">Review</option></select></div>
      <textarea className="w-full p-4 bg-slate-900 border border-slate-600 rounded-lg h-24 text-sm text-slate-300 focus:border-emerald-500 outline-none mb-3" placeholder="Nội dung..." value={content} onChange={e => setContent(e.target.value)} />
      <div className="flex justify-end"><button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-bold text-sm transition">Đăng bài</button></div>
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
          <div key={post.id} className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-emerald-500/50 transition group">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-emerald-400 font-bold">{post.author[0].toUpperCase()}</div>
                <div><p className="font-bold text-slate-200 text-sm">{post.author}</p><p className="text-xs text-slate-400">{new Date(post.createdAt).toLocaleDateString()}</p></div>
              </div>
              <span className="bg-slate-700 text-slate-300 px-3 py-1 rounded text-xs font-bold uppercase tracking-wide">{post.type}</span>
            </div>
            <h3 className="font-bold text-xl mb-3 text-white group-hover:text-emerald-400 transition">{post.title}</h3>
            <div className="text-slate-300 text-sm leading-relaxed pl-4 border-l-2 border-slate-600 mb-4">{renderRichText(post.content)}</div>
            <div className="flex items-center gap-4 pt-4 border-t border-slate-700">
              <div className="flex items-center gap-1 text-yellow-500"><Star size={16} fill="currentColor" /><span className="text-slate-300 text-sm font-bold ml-1">{post.rating}</span></div>
              <button className="text-slate-400 hover:text-white flex items-center gap-1 text-sm transition"><MessageCircle size={16} /> {post.comments?.length || 0}</button>
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
  const filtered = useMemo(() => { if (!search) return players.slice(0, 50); return players.filter(p => p.Name.toLowerCase().includes(search.toLowerCase())); }, [players, search]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6 flex justify-between items-center">
        <h2 className="text-xl font-bold text-white flex items-center gap-2"><Database className="text-emerald-500" /> Database <span className="text-slate-500 text-sm">({players.length})</span></h2>
        <div className="relative w-80"><Search className="absolute left-3 top-3 text-slate-500" size={18} /><input className="w-full pl-10 p-2.5 bg-slate-900 border border-slate-600 rounded-lg text-slate-200 outline-none focus:border-emerald-500 transition" placeholder="Tìm cầu thủ..." value={search} onChange={e => setSearch(e.target.value)} /></div>
      </div>
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full text-sm text-left text-slate-300">
          <thead className="bg-slate-900 text-slate-400 uppercase font-bold"><tr><th className="p-4">Img</th><th className="p-4">Tên</th><th className="p-4">CLB</th><th className="p-4 text-center">CA</th><th className="p-4 text-center">PA</th><th className="p-4 text-center">Chi tiết</th></tr></thead>
          <tbody className="divide-y divide-slate-700">{filtered.length === 0 ? <tr><td colSpan="6" className="p-8 text-center text-slate-500">Chưa có dữ liệu.</td></tr> : filtered.map((p, i) => (
            <tr key={i} className="hover:bg-slate-700/50 cursor-pointer transition" onClick={() => setSelected(p)}>
              <td className="p-4"><PlayerAvatar uid={p.UID} name={p.Name} size="sm" /></td>
              <td className="p-4 font-bold text-white">{p.Name}</td><td className="p-4 text-slate-400">{p.Club}</td>
              <td className="p-4 text-center"><span className="bg-emerald-900/50 text-emerald-400 px-2 py-1 rounded font-bold border border-emerald-800">{p.CA || '-'}</span></td>
              <td className="p-4 text-center"><span className="bg-purple-900/50 text-purple-400 px-2 py-1 rounded font-bold border border-purple-800">{p.PA || '-'}</span></td>
              <td className="p-4 text-center"><Eye size={18} className="mx-auto text-slate-500 hover:text-white" /></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      {selected && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-slate-800 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto border border-slate-600">
            {/* Player Profile Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 flex flex-col md:flex-row gap-8 items-center md:items-start border-b border-slate-700 relative">
              <button onClick={() => setSelected(null)} className="absolute top-4 right-4 p-2 bg-slate-700 rounded-full hover:bg-slate-600 text-white transition"><X size={20} /></button>

              <div className="flex-shrink-0">
                <PlayerAvatar uid={selected.UID} name={selected.Name} size="lg" className="shadow-2xl ring-4 ring-slate-700" />
              </div>

              <div className="flex-grow text-center md:text-left">
                <h2 className="text-4xl font-black text-white mb-2">{selected.Name}</h2>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start text-sm text-slate-300 mb-4">
                  <span className="flex items-center gap-1"><Shield size={14} className="text-emerald-400" /> {selected.Club}</span>
                  <span className="w-1 h-1 bg-slate-500 rounded-full self-center"></span>
                  <span className="bg-slate-700 px-2 py-0.5 rounded border border-slate-600 text-slate-200 font-mono">{selected.Position}</span>
                  <span className="w-1 h-1 bg-slate-500 rounded-full self-center"></span>
                  <span>{selected.Age} tuổi</span>
                </div>
                <div className="flex gap-4 justify-center md:justify-start">
                  <div className="bg-slate-900/50 px-4 py-2 rounded border border-slate-700 text-center min-w-[80px]">
                    <div className="text-xs text-slate-500 uppercase font-bold">CA</div>
                    <div className="text-xl font-black text-emerald-400">{selected.CA || '-'}</div>
                  </div>
                  <div className="bg-slate-900/50 px-4 py-2 rounded border border-slate-700 text-center min-w-[80px]">
                    <div className="text-xs text-slate-500 uppercase font-bold">PA</div>
                    <div className="text-xl font-black text-purple-400">{selected.PA || '-'}</div>
                  </div>
                  <div className="bg-slate-900/50 px-4 py-2 rounded border border-slate-700 text-center min-w-[100px]">
                    <div className="text-xs text-slate-500 uppercase font-bold">Giá trị</div>
                    <div className="text-sm font-bold text-slate-200 mt-1">{selected['Transfer Value'] || '-'}</div>
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0 w-48 h-48 hidden md:flex items-center justify-center bg-slate-900/30 rounded-xl border border-slate-700/50">
                <RadarChart stats={selected.Stats} />
              </div>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-800">
              <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-700/50">
                <h3 className="font-bold border-b border-slate-700 mb-4 pb-2 text-emerald-400 uppercase text-xs tracking-wider flex justify-between">Technical</h3>
                {selected.Stats && <div className="space-y-1">
                  <AttributeBox label="Corners" value={selected.Stats.Cor} />
                  <AttributeBox label="Crossing" value={selected.Stats.Cro} />
                  <AttributeBox label="Dribbling" value={selected.Stats.Dri} />
                  <AttributeBox label="Finishing" value={selected.Stats.Fin} />
                  <AttributeBox label="First Touch" value={selected.Stats.Fir} />
                  <AttributeBox label="Free Kicks" value={selected.Stats.Fre} />
                  <AttributeBox label="Heading" value={selected.Stats.Hea} />
                  <AttributeBox label="Long Shots" value={selected.Stats.Lon} />
                  <AttributeBox label="Long Throws" value={selected.Stats.LTh} />
                  <AttributeBox label="Marking" value={selected.Stats.Mar} />
                  <AttributeBox label="Passing" value={selected.Stats.Pas} />
                  <AttributeBox label="Penalty Taking" value={selected.Stats.Pen} />
                  <AttributeBox label="Tackling" value={selected.Stats.Tck} />
                  <AttributeBox label="Technique" value={selected.Stats.Tec} />
                </div>}
              </div>
              <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-700/50">
                <h3 className="font-bold border-b border-slate-700 mb-4 pb-2 text-yellow-500 uppercase text-xs tracking-wider flex justify-between">Mental</h3>
                {selected.Stats && <div className="space-y-1">
                  <AttributeBox label="Aggression" value={selected.Stats.Agg} />
                  <AttributeBox label="Anticipation" value={selected.Stats.Ant} />
                  <AttributeBox label="Bravery" value={selected.Stats.Bra} />
                  <AttributeBox label="Composure" value={selected.Stats.Cmp} />
                  <AttributeBox label="Concentration" value={selected.Stats.Cnt} />
                  <AttributeBox label="Decisions" value={selected.Stats.Dec} />
                  <AttributeBox label="Determination" value={selected.Stats.Det} />
                  <AttributeBox label="Flair" value={selected.Stats.Fla} />
                  <AttributeBox label="Leadership" value={selected.Stats.Ldr} />
                  <AttributeBox label="Off the Ball" value={selected.Stats.Off} />
                  <AttributeBox label="Positioning" value={selected.Stats.Pos} />
                  <AttributeBox label="Teamwork" value={selected.Stats.Tea} />
                  <AttributeBox label="Vision" value={selected.Stats.Vis} />
                  <AttributeBox label="Work Rate" value={selected.Stats.Wor} />
                </div>}
              </div>
              <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-700/50">
                <h3 className="font-bold border-b border-slate-700 mb-4 pb-2 text-blue-400 uppercase text-xs tracking-wider flex justify-between">Physical</h3>
                {selected.Stats && <div className="space-y-1">
                  <AttributeBox label="Acceleration" value={selected.Stats.Acc} />
                  <AttributeBox label="Agility" value={selected.Stats.Agi} />
                  <AttributeBox label="Balance" value={selected.Stats.Bal} />
                  <AttributeBox label="Jumping Reach" value={selected.Stats.Jum} />
                  <AttributeBox label="Natural Fitness" value={selected.Stats.Nat} />
                  <AttributeBox label="Pace" value={selected.Stats.Pac} />
                  <AttributeBox label="Stamina" value={selected.Stats.Sta} />
                  <AttributeBox label="Strength" value={selected.Stats.Str} />
                </div>}
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
    r.onload = (ev) => { setData(parseHtmlTable(ev.target.result)); };
    r.readAsText(f);
  };
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-10 rounded-xl mb-8 flex justify-between items-center shadow-lg border border-slate-700">
        <div><h2 className="text-3xl font-bold mb-2 flex items-center gap-3"><Activity className="text-emerald-400" /> My Season Story</h2><p className="text-slate-400">Upload file <b>story.html</b> để phân tích.</p></div>
        <label className="bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded-lg font-bold cursor-pointer transition flex items-center gap-2"><UploadCloud /> <span>Upload</span><input type="file" className="hidden" onChange={handleUpload} accept=".html" /></label>
      </div>
      {data.length > 0 ? (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <table className="w-full text-sm text-left text-slate-300">
            <thead className="bg-slate-900 text-slate-400"><tr><th className="p-4">#</th><th className="p-4">Tên</th><th className="p-4 text-center">Trận</th><th className="p-4 text-center">Bàn</th><th className="p-4 text-center">Av Rat</th></tr></thead>
            <tbody className="divide-y divide-slate-700">{data.slice(0, 20).map((p, i) => (<tr key={i} className="hover:bg-slate-700/50"><td className="p-4"><PlayerAvatar uid={p.UID} name={p.Name} size="sm" /></td><td className="p-4 font-bold text-white">{p.Name}</td><td className="p-4 text-center">{p.Apps}</td><td className="p-4 text-center">{p.Gls}</td><td className="p-4 text-center text-emerald-400 font-bold">{p["Av Rat"]}</td></tr>))}</tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-700 flex flex-col items-center"><FileUp size={64} className="text-slate-600 mb-4" /><p className="text-slate-500">Chưa có dữ liệu mùa giải.</p></div>
      )}
    </div>
  );
}

const AdminPanel = ({ onUpdateDb }) => {
  const handleUpload = (e) => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = (ev) => { const parsed = parseHtmlTable(ev.target.result); onUpdateDb(parsed); alert(`Nạp thành công ${parsed.length} cầu thủ.`); };
    r.readAsText(f);
  };
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 text-center">
        <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-500"><Database size={32} /></div>
        <h3 className="text-xl font-bold text-white mb-2">Cập nhật Database (Local)</h3>
        <p className="text-slate-400 mb-6">Upload file <b>database.html</b> để nạp dữ liệu vào bộ nhớ tạm.</p>
        <label className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-lg font-bold cursor-pointer transition inline-flex items-center gap-2"><UploadCloud size={20} /> Chọn File Database<input type="file" className="hidden" onChange={handleUpload} accept=".html" /></label>
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
    <div className="min-h-screen bg-slate-950 font-sans text-slate-300 pb-20 selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Sidebar/Navbar */}
      <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2 font-bold text-xl text-white cursor-pointer" onClick={() => setTab('home')}>
            <Trophy className="text-emerald-500" size={24} /> <span>Manager<span className="text-emerald-500">Hub</span></span>
          </div>
          <div className="hidden md:flex gap-1">
            {[{ id: 'home', label: 'Trang chủ', icon: Home }, { id: 'news', label: 'Tin tức', icon: Newspaper }, { id: 'database', label: 'Database', icon: Database }, { id: 'story', label: 'Story', icon: Activity }].map((item) => (
              <button key={item.id} onClick={() => setTab(item.id)} className={`px-4 py-2 rounded-lg transition text-sm font-medium flex items-center gap-2 ${tab === item.id ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/50' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                <item.icon size={16} /> {item.label}
              </button>
            ))}
            <button onClick={() => setTab('admin')} className={`px-4 py-2 rounded-lg transition text-sm font-bold flex items-center gap-2 ml-4 ${tab === 'admin' ? 'bg-red-900/30 text-red-400 border border-red-800' : 'text-red-400 hover:bg-red-900/20'}`}><Lock size={14} /> Admin</button>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:block text-right">
              <div className="text-sm font-bold text-white">{CURRENT_USER.displayName}</div>
              <div className="text-[10px] text-emerald-400 bg-emerald-900/30 px-1.5 py-0.5 rounded border border-emerald-800 uppercase font-bold tracking-wide">Admin</div>
            </div>
            <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-emerald-600/20 border border-emerald-400/50">T</div>
            <button className="md:hidden text-slate-400" onClick={() => setMobileMenu(!mobileMenu)}><Menu /></button>
          </div>
        </div>
      </nav>

      <main className="animate-in fade-in duration-500">
        {tab === 'home' && (
          <div className="relative py-20 text-center">
            <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500 via-slate-900 to-slate-950"></div>
            <div className="relative z-10 max-w-2xl mx-auto px-4">
              <span className="inline-block py-1 px-3 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-widest mb-6 uppercase">Football Manager Tool</span>
              <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight text-white">GameHub <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">FC</span></h1>
              <p className="text-xl text-slate-400 mb-10 font-light">Công cụ tra cứu chỉ số & phân tích đội hình tối thượng.</p>
              <div className="flex justify-center gap-4">
                <button onClick={() => setTab('database')} className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition flex items-center gap-2"><Search size={20} /> Tra cứu</button>
                <button onClick={() => setTab('admin')} className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg border border-slate-700 transition flex items-center gap-2"><Lock size={20} /> Nạp Data</button>
              </div>
            </div>
          </div>
        )}
        {tab === 'home' && <NewsFeed posts={posts} setPosts={setPosts} />}
        {tab === 'news' && <NewsFeed posts={posts} setPosts={setPosts} />}
        {tab === 'database' && <DatabaseView players={players} />}
        {tab === 'story' && <StoryMode />}
        {tab === 'admin' && <AdminPanel onUpdateDb={setPlayers} />}
      </main>
    </div>
  );
}