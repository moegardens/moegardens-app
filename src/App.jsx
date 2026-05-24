import { useState, useMemo } from "react";

const CLIENTS_KEY = "mg_clients_v2";
const G = "#1a6b3c";
const AMBER = "#f59e0b";
const RED = "#dc2626";
const ORANGE = "#ea580c";
const BLUE = "#3b82f6";
const PIN = "2607";

// ── FREQUENCY CONFIG ──────────────────────────────────────────────────────────
const FREQ_CONFIG = {
  "Weekly":        { days: 7,  label: "Weekly" },
  "Every 2 Weeks": { days: 14, label: "Every 2 Weeks" },
  "Every 3 Weeks": { days: 21, label: "Every 3 Weeks" },
  "Every 4 Weeks": { days: 28, label: "Every 4 Weeks" },
  "Monthly":       { days: 30, label: "Monthly" },
  "One-off":       { days: null, label: "One-off" },
};
const FREQUENCIES = Object.keys(FREQ_CONFIG);
const DEFAULT_FREQ = "Every 2 Weeks";
const JOB_TYPES = ["Garden Maintenance","Grounds Maintenance","Lawn Care","Hedge Trimming","Paving & Groundworks","Tree Work","One-off Clear","Other"];

// ── DATE HELPERS ──────────────────────────────────────────────────────────────
const TODAY = new Date().toISOString().slice(0,10);

const addDays = (dateStr, days) => {
  if (!dateStr || !days) return "";
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0,10);
};

const daysBetween = (a, b) => {
  if (!a || !b) return null;
  return Math.round((new Date(b + "T12:00:00") - new Date(a + "T12:00:00")) / 86400000);
};

const fmtDate = (d) => {
  if (!d) return "—";
  return new Date(d + "T12:00:00").toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" });
};

const fmtPrice = (p) => p == null ? "TBC" : `£${p}`;

// ── CORE SCHEDULING LOGIC ─────────────────────────────────────────────────────
const calcSchedule = (client) => {
  const freq = client.frequency || DEFAULT_FREQ;
  const days = client.customFrequencyDays || FREQ_CONFIG[freq]?.days || 14;
  const lastVisit = client.lastVisit || null;
  const nextVisit = lastVisit ? addDays(lastVisit, days) : (client.nextVisit || null);
  const daysSinceVisit = lastVisit ? daysBetween(lastVisit, TODAY) : null;
  const daysUntilDue = nextVisit ? daysBetween(TODAY, nextVisit) : null;
  const overdueDays = daysUntilDue !== null && daysUntilDue < 0 ? Math.abs(daysUntilDue) : 0;

  let visitStatus;
  if (client.confirmationStatus === "pending") {
    visitStatus = "pending-confirmation";
  } else if (client.isPaused) {
    visitStatus = "paused";
  } else if (!lastVisit && !nextVisit) {
    visitStatus = "no-date";
  } else if (daysUntilDue === null) {
    visitStatus = "one-off";
  } else if (daysUntilDue < 0) {
    visitStatus = "overdue";
  } else if (daysUntilDue === 0) {
    visitStatus = "due-today";
  } else if (daysUntilDue <= 7) {
    visitStatus = "due-soon";
  } else {
    visitStatus = "not-due";
  }

  return { ...client, freq, nextVisit, daysSinceVisit, daysUntilDue, overdueDays, visitStatus };
};

const URGENCY_ORDER = ["overdue","due-today","due-soon","pending-confirmation","not-due","no-date","one-off","paused"];

const sortByUrgency = (clients) => {
  return [...clients].sort((a, b) => {
    const ai = URGENCY_ORDER.indexOf(a.visitStatus);
    const bi = URGENCY_ORDER.indexOf(b.visitStatus);
    if (ai !== bi) return ai - bi;
    if (a.visitStatus === "overdue") return b.overdueDays - a.overdueDays;
    if (a.visitStatus === "due-soon") return a.daysUntilDue - b.daysUntilDue;
    return (a.daysSinceVisit || 0) - (b.daysSinceVisit || 0);
  });
};

// ── DEFAULT CLIENT DATA ───────────────────────────────────────────────────────
const DEFAULT_CLIENTS = [
  { id:"CCG001", source:"CCG", name:"Louise Bridget", address:"Balerno Rugby Club", phone:"", area:"Balerno", jobType:"Grounds Maintenance", price:50, frequency:"Monthly", lastVisit:"2026-05-01", nextVisit:"", confirmationStatus:"confirmed", isPaused:false, notes:"", accessNotes:"", paymentStatus:"paid", duration:120, chrisCut:true, active:true, visitHistory:["2026-05-01"], tags:[] },
  { id:"CCG002", source:"CCG", name:"Daniel Sloss", address:"", phone:"", area:"", jobType:"Garden Maintenance", price:null, frequency:"Every 2 Weeks", lastVisit:"", nextVisit:"", confirmationStatus:"confirmed", isPaused:false, notes:"Price TBC", paymentStatus:"unpaid", duration:60, chrisCut:true, active:true, visitHistory:[], tags:[] },
  { id:"CCG003", source:"CCG", name:"Bravelaw Estate", address:"", phone:"+1 (713) 256-3101", area:"Edinburgh", jobType:"Grounds Maintenance", price:300, frequency:"Monthly", lastVisit:"", nextVisit:"", confirmationStatus:"confirmed", isPaused:false, notes:"", paymentStatus:"paid", duration:480, chrisCut:true, active:true, visitHistory:[], tags:[] },
  { id:"CCG004", source:"CCG", name:"Chris Mum", address:"", phone:"", area:"", jobType:"Garden Maintenance", price:20, frequency:"Every 2 Weeks", lastVisit:"", nextVisit:"", confirmationStatus:"confirmed", isPaused:false, notes:"", paymentStatus:"paid", duration:60, chrisCut:true, active:true, visitHistory:[], tags:[] },
  { id:"CCG005", source:"CCG", name:"Chris", address:"", phone:"", area:"", jobType:"Garden Maintenance", price:30, frequency:"Every 2 Weeks", lastVisit:"", nextVisit:"", confirmationStatus:"confirmed", isPaused:false, notes:"", paymentStatus:"paid", duration:60, chrisCut:true, active:true, visitHistory:[], tags:[] },
  { id:"CCG006", source:"CCG", name:"Forrester Flats", address:"", phone:"", area:"Forrester", jobType:"Grounds Maintenance", price:null, frequency:"Monthly", lastVisit:"", nextVisit:"", confirmationStatus:"confirmed", isPaused:false, notes:"Price TBC", paymentStatus:"unpaid", duration:180, chrisCut:true, active:true, visitHistory:[], tags:[] },
  { id:"CCG007", source:"CCG", name:"Chris Granny", address:"", phone:"", area:"", jobType:"Garden Maintenance", price:40, frequency:"Every 2 Weeks", lastVisit:"", nextVisit:"", confirmationStatus:"confirmed", isPaused:false, notes:"", paymentStatus:"paid", duration:90, chrisCut:true, active:true, visitHistory:[], tags:[] },
  { id:"CCG008", source:"CCG", name:"Parkhead", address:"", phone:"", area:"Parkhead", jobType:"Grounds Maintenance", price:40, frequency:"Monthly", lastVisit:"", nextVisit:"", confirmationStatus:"confirmed", isPaused:false, notes:"", paymentStatus:"paid", duration:120, chrisCut:true, active:true, visitHistory:[], tags:[] },
  { id:"CCG009", source:"CCG", name:"Jane", address:"13 Langton View, East Calder, EH53 0LE", phone:"", area:"East Calder", jobType:"Garden Maintenance", price:30, frequency:"Every 2 Weeks", lastVisit:"", nextVisit:"", confirmationStatus:"confirmed", isPaused:false, notes:"", paymentStatus:"paid", duration:90, chrisCut:true, active:true, visitHistory:[], tags:[] },
  { id:"CCG010", source:"CCG", name:"Margret", address:"", phone:"", area:"", jobType:"Garden Maintenance", price:null, frequency:"Every 2 Weeks", lastVisit:"", nextVisit:"", confirmationStatus:"confirmed", isPaused:false, notes:"", paymentStatus:"unpaid", duration:60, chrisCut:true, active:true, visitHistory:[], tags:[] },
  { id:"CCG011", source:"CCG", name:"Illi", address:"", phone:"", area:"", jobType:"Garden Maintenance", price:null, frequency:"Every 2 Weeks", lastVisit:"", nextVisit:"", confirmationStatus:"confirmed", isPaused:false, notes:"", paymentStatus:"unpaid", duration:60, chrisCut:true, active:true, visitHistory:[], tags:[] },
  { id:"CCG012", source:"CCG", name:"Palm", address:"", phone:"", area:"", jobType:"Garden Maintenance", price:null, frequency:"Every 2 Weeks", lastVisit:"", nextVisit:"", confirmationStatus:"confirmed", isPaused:false, notes:"", paymentStatus:"unpaid", duration:60, chrisCut:true, active:true, visitHistory:[], tags:[] },
  { id:"CCG013", source:"CCG", name:"Marrion", address:"", phone:"", area:"", jobType:"Garden Maintenance", price:null, frequency:"Every 2 Weeks", lastVisit:"", nextVisit:"", confirmationStatus:"confirmed", isPaused:false, notes:"", paymentStatus:"unpaid", duration:60, chrisCut:true, active:true, visitHistory:[], tags:[] },
  { id:"CCG014", source:"CCG", name:"Scout Hall Woman", address:"", phone:"", area:"", jobType:"Garden Maintenance", price:null, frequency:"Every 2 Weeks", lastVisit:"", nextVisit:"", confirmationStatus:"confirmed", isPaused:false, notes:"", paymentStatus:"unpaid", duration:60, chrisCut:true, active:true, visitHistory:[], tags:[] },
  { id:"CCG015", source:"CCG", name:"Fourth View Road Granny", address:"10 Fourth View Road", phone:"", area:"", jobType:"Garden Maintenance", price:null, frequency:"Every 2 Weeks", lastVisit:"", nextVisit:"", confirmationStatus:"confirmed", isPaused:false, notes:"", paymentStatus:"unpaid", duration:60, chrisCut:true, active:true, visitHistory:[], tags:[] },
  { id:"CCG016", source:"CCG", name:"Langwill Place Client", address:"5 Langwill Place, Currie, EH14 5NL", phone:"", area:"Currie", jobType:"Paving & Groundworks", price:null, frequency:"One-off", lastVisit:"", nextVisit:"", confirmationStatus:"pending", isPaused:false, notes:"Grout and power wash", paymentStatus:"unpaid", duration:180, chrisCut:true, active:true, visitHistory:[], tags:[] },
  { id:"CCG017", source:"CCG", name:"Marchbank Drive Client", address:"57 Marchbank Drive, Balerno, EH14 7ER", phone:"", area:"Balerno", jobType:"Garden Maintenance", price:null, frequency:"Every 2 Weeks", lastVisit:"", nextVisit:"", confirmationStatus:"pending", isPaused:false, notes:"", paymentStatus:"unpaid", duration:90, chrisCut:true, active:true, visitHistory:[], tags:[] },
  { id:"CCG018", source:"CCG", name:"Johnsburn Road Client", address:"19 Johnsburn Road, Balerno, EH14 7DY", phone:"", area:"Balerno", jobType:"Garden Maintenance", price:null, frequency:"Every 2 Weeks", lastVisit:"", nextVisit:"", confirmationStatus:"pending", isPaused:false, notes:"", paymentStatus:"unpaid", duration:90, chrisCut:true, active:true, visitHistory:[], tags:[] },
  { id:"CCG019", source:"CCG", name:"Riccarton Drive Client", address:"5 Riccarton Drive, Currie, EH14 5PN", phone:"", area:"Currie", jobType:"Garden Maintenance", price:null, frequency:"Every 2 Weeks", lastVisit:"", nextVisit:"", confirmationStatus:"pending", isPaused:false, notes:"", paymentStatus:"unpaid", duration:90, chrisCut:true, active:true, visitHistory:[], tags:[] },
  { id:"MG001", source:"MG", name:"Russell Cairns", address:"20 Colinton Mains Grove, Edinburgh, EH13 9DQ", phone:"+44 7766 040233", area:"Colinton", jobType:"Garden Maintenance", price:null, frequency:"Every 2 Weeks", lastVisit:"2026-04-28", nextVisit:"", confirmationStatus:"confirmed", isPaused:false, notes:"", paymentStatus:"paid", duration:90, chrisCut:false, active:true, visitHistory:["2026-04-28"], tags:[] },
  { id:"MG002", source:"MG", name:"Clare", address:"45 Willow Grove, Craigshill, Livingston, EH54 5NA", phone:"+44 7364 200875", area:"Livingston", jobType:"Garden Maintenance", price:null, frequency:"Every 2 Weeks", lastVisit:"2026-05-01", nextVisit:"", confirmationStatus:"confirmed", isPaused:false, notes:"", paymentStatus:"paid", duration:90, chrisCut:false, active:true, visitHistory:["2026-05-01"], tags:[] },
  { id:"MG003", source:"MG", name:"Scott Murray", address:"4 Shiel Path, East Calder, EH53 0FS", phone:"", area:"East Calder", jobType:"Garden Maintenance", price:null, frequency:"Every 2 Weeks", lastVisit:"2026-05-05", nextVisit:"", confirmationStatus:"pending", isPaused:false, notes:"", paymentStatus:"unpaid", duration:90, chrisCut:false, active:true, visitHistory:["2026-05-05"], tags:[] },
  { id:"MG004", source:"MG", name:"Krishna Arekapudi", address:"83 Brodie Place, EH53 0TY", phone:"+44 7714 196963", area:"Livingston", jobType:"Garden Maintenance", price:null, frequency:"Every 2 Weeks", lastVisit:"2026-05-04", nextVisit:"", confirmationStatus:"pending", isPaused:false, notes:"", paymentStatus:"unpaid", duration:60, chrisCut:false, active:true, visitHistory:["2026-05-04"], tags:[] },
  { id:"MG005", source:"MG", name:"Mikey G", address:"311 Broomhouse Road, Edinburgh, EH11 3UP", phone:"+44 7398 237243", area:"Broomhouse", jobType:"Garden Maintenance", price:null, frequency:"Every 2 Weeks", lastVisit:"2026-05-08", nextVisit:"", confirmationStatus:"confirmed", isPaused:false, notes:"", paymentStatus:"paid", duration:60, chrisCut:false, active:true, visitHistory:["2026-05-08"], tags:[] },
  { id:"MG006", source:"MG", name:"Sally McGregor", address:"43 Bonaly Crescent, Colinton, EH13 0EP", phone:"+44 7561 801380", area:"Colinton", jobType:"Garden Maintenance", price:null, frequency:"Every 2 Weeks", lastVisit:"2026-05-11", nextVisit:"", confirmationStatus:"confirmed", isPaused:false, notes:"", paymentStatus:"paid", duration:120, chrisCut:false, active:true, visitHistory:["2026-05-11"], tags:[] },
  { id:"MG007", source:"MG", name:"Saravanan", address:"Lilybank Road, Ratho Station, EH28", phone:"+91 95919 98168", area:"Ratho Station", jobType:"Garden Maintenance", price:null, frequency:"Every 2 Weeks", lastVisit:"2026-05-06", nextVisit:"", confirmationStatus:"pending", isPaused:false, notes:"", paymentStatus:"unpaid", duration:90, chrisCut:false, active:true, visitHistory:["2026-05-06"], tags:[] },
  { id:"MG008", source:"MG", name:"Kirsty Campbell", address:"3 Lilybank Lane, Ratho Station, EH28 8AW", phone:"", area:"Ratho Station", jobType:"Garden Maintenance", price:null, frequency:"Every 2 Weeks", lastVisit:"2026-05-15", nextVisit:"", confirmationStatus:"pending", isPaused:false, notes:"", paymentStatus:"unpaid", duration:60, chrisCut:false, active:true, visitHistory:["2026-05-15"], tags:[] },
  { id:"MG009", source:"MG", name:"poorimitlaprakash", address:"20 Lilybank Road, Ratho Station, EH28", phone:"+44 7448 950184", area:"Ratho Station", jobType:"Garden Maintenance", price:null, frequency:"Every 2 Weeks", lastVisit:"2026-05-15", nextVisit:"", confirmationStatus:"pending", isPaused:false, notes:"", paymentStatus:"unpaid", duration:60, chrisCut:false, active:true, visitHistory:["2026-05-15"], tags:[] },
];

const loadClients = () => {
  try {
    const stored = localStorage.getItem(CLIENTS_KEY);
    if (stored) return JSON.parse(stored);
  } catch(e) {}
  return DEFAULT_CLIENTS;
};

const saveClients = (clients) => {
  try { localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients)); } catch(e) {}
};

// ── STYLES ────────────────────────────────────────────────────────────────────
const s = {
  app: { fontFamily:"-apple-system,BlinkMacSystemFont,system-ui,sans-serif", background:"#f8fafc", minHeight:"100vh", paddingBottom:84 },
  topbar: { background:"#fff", borderBottom:"1px solid #e8ecf0", padding:"12px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100 },
  content: { padding:"16px", maxWidth:600, margin:"0 auto" },
  bottomnav: { position:"fixed", bottom:0, left:0, right:0, background:"rgba(255,255,255,0.97)", borderTop:"1px solid #e8ecf0", display:"flex", justifyContent:"space-around", padding:"8px 0 20px", zIndex:100 },
  navbtn: { background:"none", border:"none", display:"flex", flexDirection:"column", alignItems:"center", gap:2, fontSize:10, fontWeight:600, cursor:"pointer", padding:"4px 16px" },
  card: { background:"#fff", borderRadius:16, border:"1px solid #e8ecf0", padding:"16px", marginBottom:10 },
  badge: (color, bg) => ({ display:"inline-flex", alignItems:"center", gap:3, background:bg, color:color, borderRadius:20, padding:"3px 10px", fontSize:11, fontWeight:700 }),
  btn: (bg, color, full) => ({ background:bg, color:color, border:"none", borderRadius:12, padding:"11px 18px", fontWeight:600, fontSize:14, cursor:"pointer", display:"inline-flex", alignItems:"center", justifyContent:"center", gap:6, width:full?"100%":"auto" }),
  btnSm: (bg, color) => ({ background:bg, color:color, border:"none", borderRadius:9, padding:"7px 13px", fontWeight:600, fontSize:12, cursor:"pointer", display:"inline-flex", alignItems:"center", gap:4 }),
  input: { background:"#f4f6f8", border:"1.5px solid transparent", borderRadius:11, padding:"11px 13px", fontSize:15, width:"100%", outline:"none", boxSizing:"border-box", fontFamily:"inherit" },
  label: { fontSize:12, fontWeight:700, color:"#64748b", display:"block", marginBottom:5, textTransform:"uppercase", letterSpacing:0.4 },
  row: { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:"1px solid #f1f5f9" },
  sectionTitle: { fontSize:12, fontWeight:800, color:"#94a3b8", textTransform:"uppercase", letterSpacing:0.8, marginBottom:12 },
};

// ── STATUS CONFIG ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  "overdue":              { color:RED,    bg:"#fee2e2", icon:"🔴", label:"Overdue" },
  "due-today":            { color:ORANGE, bg:"#fff7ed", icon:"🟠", label:"Due Today" },
  "due-soon":             { color:AMBER,  bg:"#fffbeb", icon:"🟡", label:"Due Soon" },
  "not-due":              { color:G,      bg:"#f0fdf4", icon:"🟢", label:"Not Due Yet" },
  "pending-confirmation": { color:"#6366f1", bg:"#eef2ff", icon:"⏳", label:"Needs Confirmation" },
  "paused":               { color:"#94a3b8", bg:"#f8fafc", icon:"⏸", label:"Paused" },
  "no-date":              { color:"#94a3b8", bg:"#f8fafc", icon:"📅", label:"No Date Set" },
  "one-off":              { color:BLUE,   bg:"#eff6ff", icon:"1️⃣", label:"One-off" },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG["no-date"];
  return <span style={s.badge(cfg.color, cfg.bg)}>{cfg.icon} {cfg.label}</span>;
};

// ── LOCK SCREEN ───────────────────────────────────────────────────────────────
const LockScreen = ({ onUnlock }) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleKey = (k) => {
    if (k === "del") { setPin(p => p.slice(0,-1)); setError(false); return; }
    const next = pin + k;
    setPin(next);
    if (next.length === 4) {
      if (next === PIN) { onUnlock(); }
      else {
        setError(true); setShake(true);
        setTimeout(() => { setPin(""); setError(false); setShake(false); }, 700);
      }
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:"#0a1a0f", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:32 }}>
      <div style={{ fontSize:48, marginBottom:8 }}>🌿</div>
      <div style={{ fontWeight:800, fontSize:26, color:"#fff", marginBottom:4 }}>moegardens</div>
      <div style={{ fontSize:13, color:"#4a7c5a", marginBottom:40 }}>Business Manager</div>
      <div style={{ display:"flex", gap:18, marginBottom:44, ...(shake ? {animation:"shake .4s ease"} : {}) }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ width:16, height:16, borderRadius:"50%", background:pin.length>i?(error?RED:G):"#1e3a28", transition:"background .15s" }}/>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, width:260 }}>
        {["1","2","3","4","5","6","7","8","9","","0","del"].map((k,i) => (
          k==="" ? <div key={i}/> :
          <button key={i} onClick={() => handleKey(k)} style={{ background:"#122318", color:"#fff", border:"1px solid #1e3a28", borderRadius:16, padding:"20px 0", fontSize:k==="del"?18:24, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
            {k==="del"?"⌫":k}
          </button>
        ))}
      </div>
      {error && <div style={{ color:RED, marginTop:24, fontWeight:700, fontSize:13 }}>Incorrect PIN</div>}
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}} @keyframes fadeUp{from{opacity:0;transform:translate(-50%,8px)}to{opacity:1;transform:translate(-50%,0)}}`}</style>
    </div>
  );
};
const blankClient = (count) => ({
  id: `MG${String(count+1).padStart(3,"0")}`,
  source:"MG", name:"", address:"", phone:"", area:"",
  jobType:"Garden Maintenance", price:"", frequency:DEFAULT_FREQ,
  lastVisit:"", nextVisit:"", confirmationStatus:"confirmed",
  isPaused:false, notes:"", accessNotes:"", paymentStatus:"unpaid",
  duration:60, chrisCut:false, active:true, visitHistory:[], tags:[],
});

export default function App() {
  const [unlocked, setUnlocked] = useState(false);
  const [rawClients, setRawClients] = useState(loadClients);
  const [page, setPage] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterArea, setFilterArea] = useState("all");
  const [sortBy, setSortBy] = useState("urgency");
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [addingClient, setAddingClient] = useState(false);
  const [newClient, setNewClient] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // ── COMPUTED CLIENTS WITH LIVE SCHEDULING ──
  const clients = useMemo(() => {
    const active = rawClients.filter(c => c.active !== false);
    return active.map(calcSchedule);
  }, [rawClients]);

  const persist = (updated) => {
    setRawClients(updated);
    saveClients(updated);
  };

  const showToast = (msg, type="success") => {
    setToast({msg, type});
    setTimeout(() => setToast(null), 2500);
  };

  // ── STATS ──
  const overdue      = clients.filter(c => c.visitStatus === "overdue");
  const dueToday     = clients.filter(c => c.visitStatus === "due-today");
  const dueSoon      = clients.filter(c => c.visitStatus === "due-soon");
  const needsConfirm = clients.filter(c => c.visitStatus === "pending-confirmation");
  const areas        = [...new Set(clients.map(c => c.area).filter(Boolean))].sort();
  const totalRevenue = clients.filter(c => c.paymentStatus==="paid" && c.price).reduce((s,c) => s+(c.price||0), 0);
  const outstanding  = clients.filter(c => c.paymentStatus!=="paid" && c.price).reduce((s,c) => s+(c.price||0), 0);

  // ── ACTIONS ──
  const markVisited = (id) => {
    persist(rawClients.map(c => {
      if (c.id !== id) return c;
      const history = [...(c.visitHistory||[]), TODAY];
      return { ...c, lastVisit:TODAY, nextVisit:"", confirmationStatus:"confirmed", isPaused:false, visitHistory:history };
    }));
    setSelected(null);
    showToast("✅ Visit recorded!");
  };

  const confirmClient = (id) => {
    persist(rawClients.map(c => c.id===id ? {...c, confirmationStatus:"confirmed"} : c));
    showToast("✅ Client confirmed!");
  };

  const pauseClient = (id) => {
    persist(rawClients.map(c => c.id===id ? {...c, isPaused:true} : c));
    setSelected(null);
    showToast("⏸ Client paused");
  };

  const archiveClient = (id) => {
    persist(rawClients.map(c => c.id===id ? {...c, active:false} : c));
    setSelected(null);
    showToast("Client archived");
  };

  const deleteClient = (id) => {
    persist(rawClients.filter(c => c.id!==id));
    setSelected(null);
    setConfirmDelete(null);
    showToast("Client removed");
  };

  const markPaid = (id) => {
    persist(rawClients.map(c => c.id===id ? {...c, paymentStatus:"paid"} : c));
    showToast("💷 Marked paid!");
  };

  const saveEdit = (updated) => {
    persist(rawClients.map(c => c.id===updated.id ? {...updated, price:updated.price?parseFloat(updated.price):null, nextVisit:""} : c));
    setEditing(null);
    const recalc = calcSchedule({...updated, price:updated.price?parseFloat(updated.price):null, nextVisit:""});
    setSelected(recalc);
    showToast("✅ Saved!");
  };

  const saveNewClient = () => {
    if (!newClient.name.trim()) { showToast("Please enter a name","error"); return; }
    const toSave = {...newClient, price:newClient.price?parseFloat(newClient.price):null};
    persist([...rawClients, toSave]);
    setAddingClient(false);
    setNewClient(null);
    showToast("✅ Client added!");
  };

  // ── INPUT FIELD ──
  const InputField = ({label, field, type="text", options, obj, setObj}) => (
    <div style={{marginBottom:14}}>
      <label style={s.label}>{label}</label>
      {type==="select" ? (
        <select style={s.input} value={obj[field]||""} onChange={e=>setObj(p=>({...p,[field]:e.target.value}))}>
          {options.map(o=><option key={o} value={o}>{o}</option>)}
        </select>
      ) : type==="textarea" ? (
        <textarea style={{...s.input,resize:"vertical",minHeight:70}} value={obj[field]||""} onChange={e=>setObj(p=>({...p,[field]:e.target.value}))} placeholder={label}/>
      ) : (
        <input type={type} style={s.input} value={obj[field]||""} onChange={e=>setObj(p=>({...p,[field]:e.target.value}))} placeholder={label}/>
      )}
    </div>
  );

  // ── CLIENT FORM ──
  const ClientForm = ({obj, setObj, onSave, onCancel, title}) => (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
        <button style={s.btnSm("#f1f5f9","#0f172a")} onClick={onCancel}>← Back</button>
        <div style={{fontSize:20,fontWeight:800}}>{title}</div>
      </div>
      <div style={s.card}>
        <div style={s.sectionTitle}>Contact</div>
        <InputField label="Full Name *" field="name" obj={obj} setObj={setObj}/>
        <InputField label="Phone" field="phone" type="tel" obj={obj} setObj={setObj}/>
        <InputField label="Address" field="address" type="textarea" obj={obj} setObj={setObj}/>
        <InputField label="Area" field="area" obj={obj} setObj={setObj}/>
      </div>
      <div style={s.card}>
        <div style={s.sectionTitle}>Scheduling</div>
        <InputField label="Last Visit Date" field="lastVisit" type="date" obj={obj} setObj={setObj}/>
        <InputField label="Visit Frequency" field="frequency" type="select" options={FREQUENCIES} obj={obj} setObj={setObj}/>
        <div style={{background:"#f0fdf4",borderRadius:10,padding:"10px 12px",fontSize:12,color:G,fontWeight:600,marginBottom:10}}>
          📅 Next visit will auto-calculate from last visit + frequency
        </div>
        <InputField label="Confirmation Status" field="confirmationStatus" type="select" options={["confirmed","pending"]} obj={obj} setObj={setObj}/>
      </div>
      <div style={s.card}>
        <div style={s.sectionTitle}>Job & Payment</div>
        <InputField label="Job Type" field="jobType" type="select" options={JOB_TYPES} obj={obj} setObj={setObj}/>
        <InputField label="Price (£)" field="price" type="number" obj={obj} setObj={setObj}/>
        <InputField label="Duration (mins)" field="duration" type="number" obj={obj} setObj={setObj}/>
        <InputField label="Payment Status" field="paymentStatus" type="select" options={["unpaid","paid","part-paid"]} obj={obj} setObj={setObj}/>
        <InputField label="Source" field="source" type="select" options={["MG","CCG"]} obj={obj} setObj={setObj}/>
        <div style={{display:"flex",alignItems:"center",gap:10,marginTop:8,cursor:"pointer"}} onClick={()=>setObj(p=>({...p,chrisCut:!p.chrisCut}))}>
          <div style={{width:22,height:22,borderRadius:7,border:`2px solid ${obj.chrisCut?G:"#cbd5e1"}`,background:obj.chrisCut?G:"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>
            {obj.chrisCut&&<span style={{color:"#fff",fontSize:13}}>✓</span>}
          </div>
          <span style={{fontSize:14,fontWeight:500}}>Chris 30% cut applies</span>
        </div>
      </div>
      <div style={s.card}>
        <div style={s.sectionTitle}>Notes</div>
        <InputField label="General Notes" field="notes" type="textarea" obj={obj} setObj={setObj}/>
        <InputField label="Access Instructions" field="accessNotes" type="textarea" obj={obj} setObj={setObj}/>
      </div>
      <button style={{...s.btn(G,"#fff",true),padding:"14px",fontSize:15,borderRadius:14,marginBottom:16}} onClick={onSave}>
        Save Client
      </button>
    </div>
  );

  if (!unlocked) return <LockScreen onUnlock={() => setUnlocked(true)}/>;

  // ── DASHBOARD ──
  const Dashboard = () => {
    const topOverdue = [...overdue].sort((a,b) => b.overdueDays - a.overdueDays).slice(0,5);
    const todayAndSoon = [...dueToday, ...dueSoon].slice(0,5);
    return (
      <div>
        <div style={{marginBottom:16}}>
          <div style={{fontSize:22,fontWeight:800,color:"#0f172a",marginBottom:2}}>Good morning 👋</div>
          <div style={{fontSize:13,color:"#94a3b8"}}>{new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
          {[
            {label:"🔴 Overdue",val:overdue.length,color:RED,bg:"#fef2f2",fn:()=>{setFilterStatus("overdue");setPage("revisits");}},
            {label:"🟠 Due Today",val:dueToday.length,color:ORANGE,bg:"#fff7ed",fn:()=>{setFilterStatus("due-today");setPage("revisits");}},
            {label:"🟡 Due This Week",val:dueSoon.length,color:AMBER,bg:"#fffbeb",fn:()=>{setFilterStatus("due-soon");setPage("revisits");}},
            {label:"⏳ Needs Confirm",val:needsConfirm.length,color:"#6366f1",bg:"#eef2ff",fn:()=>{setFilterStatus("pending-confirmation");setPage("revisits");}},
          ].map(({label,val,color,bg,fn})=>(
            <div key={label} onClick={fn} style={{...s.card,background:bg,border:`1px solid ${color}20`,marginBottom:0,padding:"14px",cursor:"pointer"}}>
              <div style={{fontSize:11,fontWeight:700,color,marginBottom:4}}>{label}</div>
              <div style={{fontSize:34,fontWeight:800,color,lineHeight:1}}>{val}</div>
            </div>
          ))}
        </div>

        <div style={{...s.card,marginBottom:12}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div style={{textAlign:"center",padding:"10px",background:"#f0fdf4",borderRadius:10}}>
              <div style={{fontSize:10,color:"#94a3b8",fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Total Clients</div>
              <div style={{fontSize:26,fontWeight:800,color:G}}>{clients.length}</div>
            </div>
            <div style={{textAlign:"center",padding:"10px",background:"#f8fafc",borderRadius:10}}>
              <div style={{fontSize:10,color:"#94a3b8",fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Outstanding</div>
              <div style={{fontSize:26,fontWeight:800,color:RED}}>£{outstanding}</div>
            </div>
          </div>
        </div>

        {overdue.length>0&&(
          <div style={{...s.card,borderLeft:`3px solid ${RED}`,marginBottom:12}}>
            <div style={{fontSize:14,fontWeight:800,color:RED,marginBottom:10}}>🔴 Most Overdue — Act First</div>
            {topOverdue.map(c=>(
              <div key={c.id} style={{...s.row,cursor:"pointer"}} onClick={()=>{setSelected(c);setPage("revisits");}}>
                <div>
                  <div style={{fontWeight:700,fontSize:13}}>{c.name}</div>
                  <div style={{fontSize:11,color:"#94a3b8"}}>{c.area||"—"} · Last: {fmtDate(c.lastVisit)}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontWeight:800,color:RED,fontSize:12}}>{c.overdueDays}d overdue</div>
                  {c.phone&&<a href={`tel:${c.phone}`} onClick={e=>e.stopPropagation()} style={{fontSize:16}}>📞</a>}
                </div>
              </div>
            ))}
          </div>
        )}

        {todayAndSoon.length>0&&(
          <div style={{...s.card,marginBottom:12}}>
            <div style={{fontSize:14,fontWeight:800,color:AMBER,marginBottom:10}}>📅 Due Soon</div>
            {todayAndSoon.map(c=>(
              <div key={c.id} style={{...s.row,cursor:"pointer"}} onClick={()=>{setSelected(c);setPage("revisits");}}>
                <div>
                  <div style={{fontWeight:700,fontSize:13}}>{c.name}</div>
                  <div style={{fontSize:11,color:"#94a3b8"}}>{c.area||"—"} · Due: {fmtDate(c.nextVisit)}</div>
                </div>
                <StatusBadge status={c.visitStatus}/>
              </div>
            ))}
          </div>
        )}

        <div style={s.card}>
          <div style={s.sectionTitle}>Quick Actions</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {[
              {label:"➕ Add Client",bg:G,color:"#fff",fn:()=>{setNewClient(blankClient(rawClients.length));setAddingClient(true);setPage("clients");}},
              {label:"👥 All Clients",bg:"#f1f5f9",color:"#0f172a",fn:()=>setPage("clients")},
              {label:"🔴 Revisits",bg:"#fef2f2",color:RED,fn:()=>setPage("revisits")},
              {label:"💷 Payments",bg:"#f0fdf4",color:G,fn:()=>setPage("payments")},
            ].map(({label,bg,color,fn})=>(
              <button key={label} style={{...s.btn(bg,color),borderRadius:12,padding:"12px",fontSize:13,fontWeight:700}} onClick={fn}>{label}</button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ── CLIENT ROW ──
  const ClientRow = ({c}) => (
    <div style={{...s.card,marginBottom:8,borderLeft:`3px solid ${STATUS_CONFIG[c.visitStatus]?.color||"#e8ecf0"}`,cursor:"pointer"}} onClick={()=>setSelected(c)}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
        <div style={{fontWeight:700,fontSize:15,flex:1,paddingRight:8}}>{c.name}</div>
        <StatusBadge status={c.visitStatus}/>
      </div>
      <div style={{fontSize:12,color:"#94a3b8",marginBottom:6}}>{c.area||c.address?.slice(0,35)||"No address"}</div>
      <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
        <span style={{fontSize:11,background:"#f1f5f9",borderRadius:6,padding:"2px 8px",fontWeight:600}}>{c.frequency||DEFAULT_FREQ}</span>
        {c.lastVisit&&<span style={{fontSize:11,color:"#94a3b8"}}>Last: {fmtDate(c.lastVisit)}</span>}
        {c.visitStatus==="overdue"&&<span style={{fontSize:11,fontWeight:800,color:RED}}>{c.overdueDays}d overdue</span>}
        {c.nextVisit&&c.visitStatus!=="overdue"&&<span style={{fontSize:11,color:"#94a3b8"}}>Due: {fmtDate(c.nextVisit)}</span>}
        <span style={{fontWeight:800,color:G,marginLeft:"auto",fontSize:14}}>{fmtPrice(c.price)}</span>
      </div>
    </div>
  );

  // ── CLIENT LIST ──
  const ClientList = () => {
    const sorted = useMemo(() => {
      let list = clients.filter(c => {
        const q = search.toLowerCase();
        const mq = !q||c.name.toLowerCase().includes(q)||(c.area||"").toLowerCase().includes(q)||(c.address||"").toLowerCase().includes(q)||(c.phone||"").includes(q);
        const ms = filterStatus==="all"||c.visitStatus===filterStatus;
        const ma = filterArea==="all"||(c.area||"")===filterArea;
        return mq&&ms&&ma;
      });
      switch(sortBy) {
        case "urgency": return sortByUrgency(list);
        case "lastVisit": return [...list].sort((a,b)=>(a.lastVisit||"").localeCompare(b.lastVisit||""));
        case "nextVisit": return [...list].sort((a,b)=>(a.nextVisit||"9").localeCompare(b.nextVisit||"9"));
        case "area": return [...list].sort((a,b)=>(a.area||"").localeCompare(b.area||""));
        case "name": return [...list].sort((a,b)=>a.name.localeCompare(b.name));
        default: return list;
      }
    }, [clients, search, filterStatus, filterArea, sortBy]);

    return (
      <div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{fontSize:13,color:"#94a3b8",fontWeight:600}}>{sorted.length} clients</div>
          <div style={{display:"flex",gap:8}}>
            <button style={s.btnSm(showFilters?"#0f172a":"#f1f5f9",showFilters?"#fff":"#64748b")} onClick={()=>setShowFilters(p=>!p)}>⚙ Filter</button>
            <button style={s.btnSm(G,"#fff")} onClick={()=>{setNewClient(blankClient(rawClients.length));setAddingClient(true);}}>➕ Add</button>
          </div>
        </div>

        <input style={{...s.input,marginBottom:10}} placeholder="🔍 Search name, area, phone..." value={search} onChange={e=>setSearch(e.target.value)}/>

        {showFilters&&(
          <div style={{...s.card,marginBottom:10,padding:12}}>
            <div style={{marginBottom:10}}>
              <div style={s.label}>Filter by Status</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {[["all","All"],["overdue","🔴 Overdue"],["due-today","🟠 Today"],["due-soon","🟡 Soon"],["not-due","🟢 Not Due"],["pending-confirmation","⏳ Pending"]].map(([val,label])=>(
                  <button key={val} onClick={()=>setFilterStatus(val)} style={{...s.btnSm(filterStatus===val?G:"#f1f5f9",filterStatus===val?"#fff":"#64748b"),fontSize:11}}>{label}</button>
                ))}
              </div>
            </div>
            <div style={{marginBottom:10}}>
              <div style={s.label}>Filter by Area</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {["all",...areas].map(a=>(
                  <button key={a} onClick={()=>setFilterArea(a)} style={{...s.btnSm(filterArea===a?"#0f172a":"#f1f5f9",filterArea===a?"#fff":"#64748b"),fontSize:11}}>{a==="all"?"All Areas":a}</button>
                ))}
              </div>
            </div>
            <div>
              <div style={s.label}>Sort By</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {[["urgency","🚨 Urgency"],["lastVisit","📅 Last Visit"],["nextVisit","⏭ Next Visit"],["area","📍 Area"],["name","🔤 Name"]].map(([val,label])=>(
                  <button key={val} onClick={()=>setSortBy(val)} style={{...s.btnSm(sortBy===val?"#0f172a":"#f1f5f9",sortBy===val?"#fff":"#64748b"),fontSize:11}}>{label}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {sorted.map(c=><ClientRow key={c.id} c={c}/>)}
        {sorted.length===0&&<div style={{textAlign:"center",padding:"48px 0",color:"#94a3b8"}}><div style={{fontSize:36,marginBottom:8}}>🌿</div><div style={{fontWeight:600}}>No clients found</div></div>}
      </div>
    );
  };

  // ── CLIENT DETAIL ──
  const ClientDetail = ({c}) => {
    const myEarnings = c.price&&c.chrisCut ? Math.round(c.price*0.7) : c.price||0;
    const chrisCutAmt = c.price&&c.chrisCut ? Math.round(c.price*0.3) : 0;
    const cfg = STATUS_CONFIG[c.visitStatus]||{};
    return (
      <div>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16,flexWrap:"wrap"}}>
          <button style={s.btnSm("#f1f5f9","#0f172a")} onClick={()=>setSelected(null)}>← Back</button>
          <button style={s.btnSm(G,"#fff")} onClick={()=>setEditing({...c,price:c.price!=null?String(c.price):""})}>✏️ Edit</button>
          <button style={s.btnSm("#fff2f2",RED)} onClick={()=>setConfirmDelete(c.id)}>🗑</button>
          <button style={s.btnSm("#f1f5f9","#64748b")} onClick={()=>pauseClient(c.id)}>⏸ Pause</button>
          <button style={s.btnSm("#f1f5f9","#64748b")} onClick={()=>archiveClient(c.id)}>Archive</button>
        </div>

        <div style={{...s.card,borderLeft:`4px solid ${cfg.color||G}`,marginBottom:12}}>
          <div style={{fontSize:22,fontWeight:800,marginBottom:8}}>{c.name}</div>
          <StatusBadge status={c.visitStatus}/>
          {c.visitStatus==="overdue"&&<div style={{marginTop:8,fontWeight:700,color:RED,fontSize:13}}>⚠️ {c.overdueDays} days overdue</div>}
          {c.visitStatus==="due-today"&&<div style={{marginTop:8,fontWeight:700,color:ORANGE,fontSize:13}}>📅 Due for a visit today!</div>}
        </div>

        <div style={s.card}>
          <div style={s.sectionTitle}>Schedule</div>
          {[
            ["Frequency", c.frequency||DEFAULT_FREQ],
            ["Last Visit", fmtDate(c.lastVisit)],
            ["Days Since Visit", c.daysSinceVisit!=null?`${c.daysSinceVisit} days ago`:"—"],
            ["Next Due", fmtDate(c.nextVisit)],
            ["Days Until Due", c.daysUntilDue!=null?(c.daysUntilDue<0?`${Math.abs(c.daysUntilDue)}d overdue`:`${c.daysUntilDue} days`):"—"],
          ].map(([k,v])=>(
            <div key={k} style={s.row}>
              <span style={{fontSize:13,color:"#64748b",fontWeight:600}}>{k}</span>
              <span style={{fontSize:13,fontWeight:700}}>{v}</span>
            </div>
          ))}
        </div>

        <div style={s.card}>
          <div style={s.sectionTitle}>Contact</div>
          {[["Phone",c.phone||"—"],["Area",c.area||"—"],["Address",c.address||"—"]].map(([k,v])=>(
            <div key={k} style={s.row}>
              <span style={{fontSize:13,color:"#64748b",fontWeight:600}}>{k}</span>
              {k==="Phone"&&c.phone?<a href={`tel:${c.phone}`} style={{fontSize:13,fontWeight:700,color:G,textDecoration:"none"}}>{v}</a>:<span style={{fontSize:13,fontWeight:600,maxWidth:200,textAlign:"right"}}>{v}</span>}
            </div>
          ))}
        </div>

        <div style={s.card}>
          <div style={s.sectionTitle}>Payment</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
            {[{l:"Price",v:fmtPrice(c.price),cl:"#0f172a"},{l:"Chris Cut",v:c.chrisCut?`£${chrisCutAmt}`:"N/A",cl:"#6366f1"},{l:"My Share",v:c.price?`£${myEarnings}`:"TBC",cl:G}].map(({l,v,cl})=>(
              <div key={l} style={{textAlign:"center",background:"#f8fafc",borderRadius:10,padding:"10px 6px"}}>
                <div style={{fontSize:10,color:"#94a3b8",fontWeight:700,textTransform:"uppercase",marginBottom:3}}>{l}</div>
                <div style={{fontSize:17,fontWeight:800,color:cl}}>{v}</div>
              </div>
            ))}
          </div>
          {c.paymentStatus!=="paid"&&<button style={{...s.btnSm("#dcfce7","#16a34a")}} onClick={()=>markPaid(c.id)}>✓ Mark Paid</button>}
        </div>

        {(c.notes||c.accessNotes)&&(
          <div style={s.card}>
            <div style={s.sectionTitle}>Notes</div>
            {c.notes&&<div style={{marginBottom:8}}><div style={{fontSize:11,fontWeight:700,color:"#94a3b8",marginBottom:3}}>GENERAL</div><div style={{fontSize:13,lineHeight:1.5}}>{c.notes}</div></div>}
            {c.accessNotes&&<div><div style={{fontSize:11,fontWeight:700,color:"#94a3b8",marginBottom:3}}>ACCESS</div><div style={{fontSize:13,lineHeight:1.5}}>{c.accessNotes}</div></div>}
          </div>
        )}

        {c.visitHistory?.length>0&&(
          <div style={s.card}>
            <div style={s.sectionTitle}>Visit History ({c.visitHistory.length})</div>
            {[...c.visitHistory].reverse().slice(0,8).map((d,i)=>(
              <div key={i} style={{...s.row,fontSize:13}}>
                <span style={{fontWeight:600}}>📅 {fmtDate(d)}</span>
                <span style={{color:"#94a3b8",fontSize:11}}>{daysBetween(d,TODAY)} days ago</span>
              </div>
            ))}
          </div>
        )}

        <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:16}}>
          <button style={{...s.btn("#dcfce7","#16a34a"),borderRadius:12}} onClick={()=>markVisited(c.id)}>✅ Mark Visited Today</button>
          {c.visitStatus==="pending-confirmation"&&(
            <button style={{...s.btn(G,"#fff"),borderRadius:12}} onClick={()=>confirmClient(c.id)}>✓ Confirm Active</button>
          )}
          {c.phone&&<a href={`tel:${c.phone}`} style={{...s.btn("#f1f5f9","#0f172a"),borderRadius:12,textDecoration:"none"}}>📞 Call</a>}
        </div>
      </div>
    );
  };

  // ── REVISITS PAGE ──
  const Revisits = () => {
    const sorted = sortByUrgency(clients.filter(c => {
      if (filterStatus==="all") return ["overdue","due-today","due-soon","pending-confirmation","not-due"].includes(c.visitStatus);
      return c.visitStatus===filterStatus;
    }));

    return (
      <div>
        <div style={{fontSize:13,color:"#94a3b8",fontWeight:600,marginBottom:12}}>
          {overdue.length} overdue · {dueToday.length} today · {dueSoon.length} this week · {needsConfirm.length} pending
        </div>

        <div style={{display:"flex",gap:6,marginBottom:14,overflowX:"auto",paddingBottom:4}}>
          {[["all","All"],["overdue","🔴 Overdue"],["due-today","🟠 Today"],["due-soon","🟡 This Week"],["pending-confirmation","⏳ Pending"],["not-due","🟢 Not Due"]].map(([val,label])=>(
            <button key={val} onClick={()=>setFilterStatus(val)} style={{...s.btnSm(filterStatus===val?G:"#f1f5f9",filterStatus===val?"#fff":"#64748b"),whiteSpace:"nowrap",fontSize:11}}>
              {label}
            </button>
          ))}
        </div>

        {sorted.length===0&&(
          <div style={{textAlign:"center",padding:"60px 0",color:"#94a3b8"}}>
            <div style={{fontSize:48,marginBottom:12}}>✅</div>
            <div style={{fontWeight:700,fontSize:16}}>All clear!</div>
            <div style={{fontSize:13,marginTop:4}}>No clients in this category</div>
          </div>
        )}

        {sorted.map(c => {
          const cfg = STATUS_CONFIG[c.visitStatus]||{};
          return (
            <div key={c.id} style={{...s.card,borderLeft:`3px solid ${cfg.color||"#e8ecf0"}`,marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                <div style={{fontWeight:700,fontSize:15}}>{c.name}</div>
                <StatusBadge status={c.visitStatus}/>
              </div>
              <div style={{fontSize:12,color:"#94a3b8",marginBottom:6}}>{c.area||"—"} · {c.frequency||DEFAULT_FREQ}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:10}}>
                <div style={{background:"#f8fafc",borderRadius:8,padding:"6px 8px",textAlign:"center"}}>
                  <div style={{fontSize:9,color:"#94a3b8",fontWeight:700,textTransform:"uppercase"}}>Last Visit</div>
                  <div style={{fontSize:11,fontWeight:700,marginTop:2}}>{fmtDate(c.lastVisit)}</div>
                </div>
                <div style={{background:"#f8fafc",borderRadius:8,padding:"6px 8px",textAlign:"center"}}>
                  <div style={{fontSize:9,color:"#94a3b8",fontWeight:700,textTransform:"uppercase"}}>Days Since</div>
                  <div style={{fontSize:11,fontWeight:700,marginTop:2,color:c.daysSinceVisit>21?RED:AMBER}}>{c.daysSinceVisit!=null?`${c.daysSinceVisit}d`:"—"}</div>
                </div>
                <div style={{background:c.visitStatus==="overdue"?"#fee2e2":"#f8fafc",borderRadius:8,padding:"6px 8px",textAlign:"center"}}>
                  <div style={{fontSize:9,color:"#94a3b8",fontWeight:700,textTransform:"uppercase"}}>{c.visitStatus==="overdue"?"Overdue":"Next Due"}</div>
                  <div style={{fontSize:11,fontWeight:700,marginTop:2,color:c.visitStatus==="overdue"?RED:"#0f172a"}}>{c.visitStatus==="overdue"?`${c.overdueDays}d`:fmtDate(c.nextVisit)}</div>
                </div>
              </div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {c.phone&&<a href={`tel:${c.phone}`} style={{...s.btnSm(G,"#fff"),textDecoration:"none"}}>📞 Call</a>}
                <button style={s.btnSm("#dcfce7","#16a34a")} onClick={()=>markVisited(c.id)}>✅ Visited Today</button>
                {c.visitStatus==="pending-confirmation"&&<button style={s.btnSm("#eef2ff","#6366f1")} onClick={()=>confirmClient(c.id)}>✓ Confirm</button>}
                <button style={s.btnSm("#f1f5f9","#0f172a")} onClick={()=>setSelected(c)}>View →</button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // ── PAYMENTS PAGE ──
  const Payments = () => {
    const withPrice = clients.filter(c=>c.price);
    const paid = withPrice.filter(c=>c.paymentStatus==="paid");
    const unpaid = withPrice.filter(c=>c.paymentStatus!=="paid");
    const totalPaid = paid.reduce((s,c)=>s+(c.price||0),0);
    const totalUnpaid = unpaid.reduce((s,c)=>s+(c.price||0),0);
    const chrisTotal = Math.round(totalPaid*0.3);
    const myTotal = totalPaid-chrisTotal;
    return (
      <div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
          <div style={{...s.card,borderLeft:`4px solid #16a34a`,marginBottom:0}}><div style={{fontSize:11,fontWeight:700,color:"#16a34a",textTransform:"uppercase",marginBottom:4}}>Collected</div><div style={{fontSize:28,fontWeight:800,color:"#16a34a"}}>£{totalPaid}</div></div>
          <div style={{...s.card,borderLeft:`4px solid ${RED}`,marginBottom:0}}><div style={{fontSize:11,fontWeight:700,color:RED,textTransform:"uppercase",marginBottom:4}}>Outstanding</div><div style={{fontSize:28,fontWeight:800,color:RED}}>£{totalUnpaid}</div></div>
        </div>
        <div style={{...s.card,marginBottom:12}}>
          <div style={s.sectionTitle}>My Earnings Breakdown</div>
          {[["My Earnings",`£${myTotal}`,"#16a34a"],["Chris Cut (30%)",`£${chrisTotal}`,"#6366f1"],["Price TBC",`${clients.filter(c=>!c.price).length} clients`,"#94a3b8"]].map(([k,v,c])=>(
            <div key={k} style={s.row}><span style={{fontSize:13,color:"#64748b",fontWeight:600}}>{k}</span><span style={{fontSize:15,fontWeight:800,color:c}}>{v}</span></div>
          ))}
        </div>
        {unpaid.length>0&&(
          <div style={{marginBottom:12}}>
            <div style={s.sectionTitle}>⚠️ Unpaid ({unpaid.length})</div>
            {unpaid.map(c=>(
              <div key={c.id} style={{...s.card,marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div><div style={{fontWeight:700}}>{c.name}</div><div style={{fontSize:11,color:"#94a3b8"}}>{c.area||"—"} · {c.frequency}</div></div>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <span style={{fontWeight:800,color:RED,fontSize:16}}>£{c.price}</span>
                    <button style={s.btnSm(G,"#fff")} onClick={()=>markPaid(c.id)}>Paid ✓</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {paid.length>0&&(
          <div>
            <div style={s.sectionTitle}>✅ Paid ({paid.length})</div>
            {paid.map(c=>(
              <div key={c.id} style={{...s.card,marginBottom:6,opacity:0.7}}>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <span style={{fontWeight:600,fontSize:13}}>{c.name}</span>
                  <span style={{fontWeight:800,color:"#16a34a"}}>£{c.price}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const navItems = [
    {id:"dashboard",icon:"🏠",label:"Home"},
    {id:"clients",icon:"👥",label:"Clients"},
    {id:"revisits",icon:"🔴",label:"Revisits"},
    {id:"payments",icon:"💷",label:"Payments"},
  ];

  const pageTitles = {dashboard:"moegardens 🌿",clients:"Clients",revisits:"Revisits",payments:"Payments"};

  return (
    <div style={s.app}>
      <style>{`*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}input,select,textarea{font-family:inherit}@keyframes fadeUp{from{opacity:0;transform:translate(-50%,8px)}to{opacity:1;transform:translate(-50%,0)}}@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}`}</style>

      <div style={s.topbar}>
        <div style={{fontWeight:800,fontSize:18,color:G}}>{pageTitles[page]||"moegardens 🌿"}</div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {overdue.length>0&&<span style={s.badge(RED,"#fee2e2")}>🔴 {overdue.length}</span>}
          {needsConfirm.length>0&&<span style={s.badge("#6366f1","#eef2ff")}>⏳ {needsConfirm.length}</span>}
        </div>
      </div>

      <div style={s.content}>
        {confirmDelete&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
            <div style={{background:"#fff",borderRadius:20,padding:24,maxWidth:320,width:"100%"}}>
              <div style={{fontWeight:800,fontSize:18,marginBottom:8}}>Delete Client?</div>
              <div style={{fontSize:13,color:"#64748b",marginBottom:20}}>This cannot be undone. Consider archiving instead.</div>
              <div style={{display:"flex",gap:10}}>
                <button style={{...s.btn(RED,"#fff",true)}} onClick={()=>deleteClient(confirmDelete)}>Delete</button>
                <button style={{...s.btn("#f1f5f9","#0f172a",true)}} onClick={()=>setConfirmDelete(null)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {addingClient?<ClientForm obj={newClient} setObj={setNewClient} onSave={saveNewClient} onCancel={()=>{setAddingClient(false);setNewClient(null);}} title="New Client"/>:
         editing?<ClientForm obj={editing} setObj={setEditing} onSave={()=>saveEdit(editing)} onCancel={()=>setEditing(null)} title="Edit Client"/>:
         selected?<ClientDetail c={selected}/>:
         page==="dashboard"?<Dashboard/>:
         page==="clients"?<ClientList/>:
         page==="revisits"?<Revisits/>:
         page==="payments"?<Payments/>:<Dashboard/>}
      </div>

      <div style={s.bottomnav}>
        {navItems.map(n=>(
          <button key={n.id} style={{...s.navbtn,color:page===n.id?G:"#94a3b8"}} onClick={()=>{setSelected(null);setEditing(null);setAddingClient(false);setNewClient(null);setPage(n.id);}}>
            <span style={{fontSize:22}}>{n.icon}</span>
            <span style={{fontSize:10,fontWeight:700}}>{n.label}</span>
          </button>
        ))}
      </div>

      {toast&&(
        <div style={{position:"fixed",bottom:100,left:"50%",transform:"translateX(-50%)",background:toast.type==="error"?RED:G,color:"#fff",padding:"11px 22px",borderRadius:14,fontSize:13,fontWeight:700,zIndex:9999,whiteSpace:"nowrap",boxShadow:"0 4px 20px rgba(0,0,0,.2)",animation:"fadeUp .2s ease"}}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
