import { useState, useMemo } from "react";

const CLIENTS_KEY = "mg_clients_v3";
const VISITS_KEY = "mg_visits_v1";
const G = "#1a6b3c";
const AMBER = "#f59e0b";
const RED = "#dc2626";
const ORANGE = "#ea580c";
const BLUE = "#3b82f6";
const PIN = "2607";

const FREQ_CONFIG = {
  "Weekly":        { days: 7 },
  "Every 2 Weeks": { days: 14 },
  "Every 3 Weeks": { days: 21 },
  "Every 4 Weeks": { days: 28 },
  "Monthly":       { days: 30 },
  "One-off":       { days: null },
};
const FREQUENCIES = Object.keys(FREQ_CONFIG);
const DEFAULT_FREQ = "Every 2 Weeks";
const JOB_TYPES = ["Garden Maintenance","Grounds Maintenance","Lawn Care","Hedge Trimming","Paving & Groundworks","Tree Work","One-off Clear","Other"];
const PAYMENT_METHODS = ["Cash","Bank Transfer","Card","Other"];

const TODAY = new Date().toISOString().slice(0,10);

const addDays = (dateStr, days) => {
  if (!dateStr || !days) return "";
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0,10);
};
const daysBetween = (a, b) => {
  if (!a || !b) return null;
  return Math.round((new Date(b+"T12:00:00") - new Date(a+"T12:00:00")) / 86400000);
};
const fmtDate = (d) => {
  if (!d) return "—";
  return new Date(d+"T12:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"});
};
const fmtPrice = (p) => p == null ? "TBC" : `£${p}`;

const thisWeekStart = () => {
  const d = new Date(TODAY+"T12:00:00");
  const day = d.getDay();
  const diff = d.getDate() - (day===0?6:day-1);
  d.setDate(diff);
  return d.toISOString().slice(0,10);
};
const thisMonthStart = () => TODAY.slice(0,7) + "-01";

const makeVisitId = () => `v_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;

const calcSchedule = (client) => {
  const freq = client.frequency || DEFAULT_FREQ;
  const days = FREQ_CONFIG[freq]?.days || 14;
  const lastVisit = client.lastVisit || null;
  const nextVisit = lastVisit ? addDays(lastVisit, days) : "";
  const daysSinceVisit = lastVisit ? daysBetween(lastVisit, TODAY) : null;
  const daysUntilDue = nextVisit ? daysBetween(TODAY, nextVisit) : null;
  const overdueDays = daysUntilDue !== null && daysUntilDue < 0 ? Math.abs(daysUntilDue) : 0;

  let visitStatus;
  if (client.isPaused) visitStatus = "paused";
  else if (client.confirmationStatus === "pending") visitStatus = "pending-confirmation";
  else if (!lastVisit) visitStatus = "no-date";
  else if (!nextVisit) visitStatus = "one-off";
  else if (daysUntilDue < 0) visitStatus = "overdue";
  else if (daysUntilDue === 0) visitStatus = "due-today";
  else if (daysUntilDue <= 7) visitStatus = "due-soon";
  else visitStatus = "not-due";

  return { ...client, nextVisit, daysSinceVisit, daysUntilDue, overdueDays, visitStatus };
};

const URGENCY = ["overdue","due-today","due-soon","pending-confirmation","not-due","no-date","one-off","paused"];
const sortByUrgency = (list) => [...list].sort((a,b) => {
  const ai = URGENCY.indexOf(a.visitStatus), bi = URGENCY.indexOf(b.visitStatus);
  if (ai !== bi) return ai - bi;
  if (a.visitStatus === "overdue") return b.overdueDays - a.overdueDays;
  if (a.visitStatus === "due-soon") return (a.daysUntilDue||0) - (b.daysUntilDue||0);
  return 0;
});

const STATUS_CFG = {
  "overdue":              { color:RED,      bg:"#fee2e2",  icon:"🔴", label:"Overdue" },
  "due-today":            { color:ORANGE,   bg:"#fff7ed",  icon:"🟠", label:"Due Today" },
  "due-soon":             { color:AMBER,    bg:"#fffbeb",  icon:"🟡", label:"Due Soon" },
  "not-due":              { color:G,        bg:"#f0fdf4",  icon:"🟢", label:"Not Due Yet" },
  "pending-confirmation": { color:"#6366f1",bg:"#eef2ff",  icon:"⏳", label:"Needs Confirmation" },
  "paused":               { color:"#94a3b8",bg:"#f8fafc",  icon:"⏸", label:"Paused" },
  "no-date":              { color:"#94a3b8",bg:"#f8fafc",  icon:"📅", label:"No Date Set" },
  "one-off":              { color:BLUE,     bg:"#eff6ff",  icon:"1️⃣", label:"One-off" },
};

const PAY_CFG = {
  unpaid:     { color:RED,      bg:"#fee2e2", label:"Unpaid" },
  paid:       { color:"#16a34a",bg:"#dcfce7", label:"Paid" },
  "part-paid":{ color:AMBER,    bg:"#fef9c3", label:"Part Paid" },
  waived:     { color:"#94a3b8",bg:"#f1f5f9", label:"Waived" },
};

const DEFAULT_CLIENTS = [
  { id:"CCG001", source:"CCG", name:"Louise Bridget", address:"Balerno Rugby Club", phone:"", area:"Balerno", jobType:"Grounds Maintenance", price:50, frequency:"Monthly", lastVisit:"2026-05-01", confirmationStatus:"confirmed", isPaused:false, notes:"", accessNotes:"", duration:120, chrisCut:true, active:true, visitHistory:["2026-05-01"], tags:[] },
  { id:"CCG002", source:"CCG", name:"Daniel Sloss", address:"", phone:"", area:"", jobType:"Garden Maintenance", price:null, frequency:"Every 2 Weeks", lastVisit:"", confirmationStatus:"confirmed", isPaused:false, notes:"Price TBC", duration:60, chrisCut:true, active:true, visitHistory:[], tags:[] },
  { id:"CCG003", source:"CCG", name:"Bravelaw Estate", address:"", phone:"+1 (713) 256-3101", area:"Edinburgh", jobType:"Grounds Maintenance", price:300, frequency:"Monthly", lastVisit:"", confirmationStatus:"confirmed", isPaused:false, notes:"", duration:480, chrisCut:true, active:true, visitHistory:[], tags:[] },
  { id:"CCG004", source:"CCG", name:"Chris Mum", address:"", phone:"", area:"", jobType:"Garden Maintenance", price:20, frequency:"Every 2 Weeks", lastVisit:"", confirmationStatus:"confirmed", isPaused:false, notes:"", duration:60, chrisCut:true, active:true, visitHistory:[], tags:[] },
  { id:"CCG005", source:"CCG", name:"Chris", address:"", phone:"", area:"", jobType:"Garden Maintenance", price:30, frequency:"Every 2 Weeks", lastVisit:"", confirmationStatus:"confirmed", isPaused:false, notes:"", duration:60, chrisCut:true, active:true, visitHistory:[], tags:[] },
  { id:"CCG006", source:"CCG", name:"Forrester Flats", address:"", phone:"", area:"Forrester", jobType:"Grounds Maintenance", price:null, frequency:"Monthly", lastVisit:"", confirmationStatus:"confirmed", isPaused:false, notes:"Price TBC", duration:180, chrisCut:true, active:true, visitHistory:[], tags:[] },
  { id:"CCG007", source:"CCG", name:"Chris Granny", address:"", phone:"", area:"", jobType:"Garden Maintenance", price:40, frequency:"Every 2 Weeks", lastVisit:"", confirmationStatus:"confirmed", isPaused:false, notes:"", duration:90, chrisCut:true, active:true, visitHistory:[], tags:[] },
  { id:"CCG008", source:"CCG", name:"Parkhead", address:"", phone:"", area:"Parkhead", jobType:"Grounds Maintenance", price:40, frequency:"Monthly", lastVisit:"", confirmationStatus:"confirmed", isPaused:false, notes:"", duration:120, chrisCut:true, active:true, visitHistory:[], tags:[] },
  { id:"CCG009", source:"CCG", name:"Jane", address:"13 Langton View, East Calder, EH53 0LE", phone:"", area:"East Calder", jobType:"Garden Maintenance", price:30, frequency:"Every 2 Weeks", lastVisit:"", confirmationStatus:"confirmed", isPaused:false, notes:"", duration:90, chrisCut:true, active:true, visitHistory:[], tags:[] },
  { id:"CCG010", source:"CCG", name:"Margret", address:"", phone:"", area:"", jobType:"Garden Maintenance", price:null, frequency:"Every 2 Weeks", lastVisit:"", confirmationStatus:"confirmed", isPaused:false, notes:"", duration:60, chrisCut:true, active:true, visitHistory:[], tags:[] },
  { id:"CCG011", source:"CCG", name:"Illi", address:"", phone:"", area:"", jobType:"Garden Maintenance", price:null, frequency:"Every 2 Weeks", lastVisit:"", confirmationStatus:"confirmed", isPaused:false, notes:"", duration:60, chrisCut:true, active:true, visitHistory:[], tags:[] },
  { id:"CCG012", source:"CCG", name:"Palm", address:"", phone:"", area:"", jobType:"Garden Maintenance", price:null, frequency:"Every 2 Weeks", lastVisit:"", confirmationStatus:"confirmed", isPaused:false, notes:"", duration:60, chrisCut:true, active:true, visitHistory:[], tags:[] },
  { id:"CCG013", source:"CCG", name:"Marrion", address:"", phone:"", area:"", jobType:"Garden Maintenance", price:null, frequency:"Every 2 Weeks", lastVisit:"", confirmationStatus:"confirmed", isPaused:false, notes:"", duration:60, chrisCut:true, active:true, visitHistory:[], tags:[] },
  { id:"CCG014", source:"CCG", name:"Scout Hall Woman", address:"", phone:"", area:"", jobType:"Garden Maintenance", price:null, frequency:"Every 2 Weeks", lastVisit:"", confirmationStatus:"confirmed", isPaused:false, notes:"", duration:60, chrisCut:true, active:true, visitHistory:[], tags:[] },
  { id:"CCG015", source:"CCG", name:"Fourth View Road Granny", address:"10 Fourth View Road", phone:"", area:"", jobType:"Garden Maintenance", price:null, frequency:"Every 2 Weeks", lastVisit:"", confirmationStatus:"confirmed", isPaused:false, notes:"", duration:60, chrisCut:true, active:true, visitHistory:[], tags:[] },
  { id:"CCG016", source:"CCG", name:"Langwill Place Client", address:"5 Langwill Place, Currie, EH14 5NL", phone:"", area:"Currie", jobType:"Paving & Groundworks", price:null, frequency:"One-off", lastVisit:"", confirmationStatus:"pending", isPaused:false, notes:"Grout and power wash", duration:180, chrisCut:true, active:true, visitHistory:[], tags:[] },
  { id:"CCG017", source:"CCG", name:"Marchbank Drive Client", address:"57 Marchbank Drive, Balerno, EH14 7ER", phone:"", area:"Balerno", jobType:"Garden Maintenance", price:null, frequency:"Every 2 Weeks", lastVisit:"", confirmationStatus:"pending", isPaused:false, notes:"", duration:90, chrisCut:true, active:true, visitHistory:[], tags:[] },
  { id:"CCG018", source:"CCG", name:"Johnsburn Road Client", address:"19 Johnsburn Road, Balerno, EH14 7DY", phone:"", area:"Balerno", jobType:"Garden Maintenance", price:null, frequency:"Every 2 Weeks", lastVisit:"", confirmationStatus:"pending", isPaused:false, notes:"", duration:90, chrisCut:true, active:true, visitHistory:[], tags:[] },
  { id:"CCG019", source:"CCG", name:"Riccarton Drive Client", address:"5 Riccarton Drive, Currie, EH14 5PN", phone:"", area:"Currie", jobType:"Garden Maintenance", price:null, frequency:"Every 2 Weeks", lastVisit:"", confirmationStatus:"pending", isPaused:false, notes:"", duration:90, chrisCut:true, active:true, visitHistory:[], tags:[] },
  { id:"MG001", source:"MG", name:"Russell Cairns", address:"20 Colinton Mains Grove, Edinburgh, EH13 9DQ", phone:"+44 7766 040233", area:"Colinton", jobType:"Garden Maintenance", price:null, frequency:"Every 2 Weeks", lastVisit:"2026-04-28", confirmationStatus:"confirmed", isPaused:false, notes:"", duration:90, chrisCut:false, active:true, visitHistory:["2026-04-28"], tags:[] },
  { id:"MG002", source:"MG", name:"Clare", address:"45 Willow Grove, Craigshill, Livingston, EH54 5NA", phone:"+44 7364 200875", area:"Livingston", jobType:"Garden Maintenance", price:null, frequency:"Every 2 Weeks", lastVisit:"2026-05-01", confirmationStatus:"confirmed", isPaused:false, notes:"", duration:90, chrisCut:false, active:true, visitHistory:["2026-05-01"], tags:[] },
  { id:"MG003", source:"MG", name:"Scott Murray", address:"4 Shiel Path, East Calder, EH53 0FS", phone:"", area:"East Calder", jobType:"Garden Maintenance", price:null, frequency:"Every 2 Weeks", lastVisit:"2026-05-05", confirmationStatus:"pending", isPaused:false, notes:"", duration:90, chrisCut:false, active:true, visitHistory:["2026-05-05"], tags:[] },
  { id:"MG004", source:"MG", name:"Krishna Arekapudi", address:"83 Brodie Place, EH53 0TY", phone:"+44 7714 196963", area:"Livingston", jobType:"Garden Maintenance", price:null, frequency:"Every 2 Weeks", lastVisit:"2026-05-04", confirmationStatus:"pending", isPaused:false, notes:"", duration:60, chrisCut:false, active:true, visitHistory:["2026-05-04"], tags:[] },
  { id:"MG005", source:"MG", name:"Mikey G", address:"311 Broomhouse Road, Edinburgh, EH11 3UP", phone:"+44 7398 237243", area:"Broomhouse", jobType:"Garden Maintenance", price:null, frequency:"Every 2 Weeks", lastVisit:"2026-05-08", confirmationStatus:"confirmed", isPaused:false, notes:"", duration:60, chrisCut:false, active:true, visitHistory:["2026-05-08"], tags:[] },
  { id:"MG006", source:"MG", name:"Sally McGregor", address:"43 Bonaly Crescent, Colinton, EH13 0EP", phone:"+44 7561 801380", area:"Colinton", jobType:"Garden Maintenance", price:null, frequency:"Every 2 Weeks", lastVisit:"2026-05-11", confirmationStatus:"confirmed", isPaused:false, notes:"", duration:120, chrisCut:false, active:true, visitHistory:["2026-05-11"], tags:[] },
  { id:"MG007", source:"MG", name:"Saravanan", address:"Lilybank Road, Ratho Station, EH28", phone:"+91 95919 98168", area:"Ratho Station", jobType:"Garden Maintenance", price:null, frequency:"Every 2 Weeks", lastVisit:"2026-05-06", confirmationStatus:"pending", isPaused:false, notes:"", duration:90, chrisCut:false, active:true, visitHistory:["2026-05-06"], tags:[] },
  { id:"MG008", source:"MG", name:"Kirsty Campbell", address:"3 Lilybank Lane, Ratho Station, EH28 8AW", phone:"", area:"Ratho Station", jobType:"Garden Maintenance", price:null, frequency:"Every 2 Weeks", lastVisit:"2026-05-15", confirmationStatus:"pending", isPaused:false, notes:"", duration:60, chrisCut:false, active:true, visitHistory:["2026-05-15"], tags:[] },
  { id:"MG009", source:"MG", name:"poorimitlaprakash", address:"20 Lilybank Road, Ratho Station, EH28", phone:"+44 7448 950184", area:"Ratho Station", jobType:"Garden Maintenance", price:null, frequency:"Every 2 Weeks", lastVisit:"2026-05-15", confirmationStatus:"pending", isPaused:false, notes:"", duration:60, chrisCut:false, active:true, visitHistory:["2026-05-15"], tags:[] },
];

const loadClients = () => { try { const s=localStorage.getItem(CLIENTS_KEY); if(s) return JSON.parse(s); } catch(e){} return DEFAULT_CLIENTS; };
const loadVisits = () => { try { const s=localStorage.getItem(VISITS_KEY); if(s) return JSON.parse(s); } catch(e){} return []; };
const saveClients = (c) => { try { localStorage.setItem(CLIENTS_KEY,JSON.stringify(c)); } catch(e){} };
const saveVisits = (v) => { try { localStorage.setItem(VISITS_KEY,JSON.stringify(v)); } catch(e){} };

const st = {
  app: { fontFamily:"-apple-system,BlinkMacSystemFont,system-ui,sans-serif", background:"#f8fafc", minHeight:"100vh", paddingBottom:84 },
  topbar: { background:"#fff", borderBottom:"1px solid #e8ecf0", padding:"12px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100 },
  content: { padding:"16px", maxWidth:600, margin:"0 auto" },
  bottomnav: { position:"fixed", bottom:0, left:0, right:0, background:"rgba(255,255,255,0.97)", borderTop:"1px solid #e8ecf0", display:"flex", justifyContent:"space-around", padding:"8px 0 20px", zIndex:100 },
  navbtn: { background:"none", border:"none", display:"flex", flexDirection:"column", alignItems:"center", gap:2, fontSize:10, fontWeight:600, cursor:"pointer", padding:"4px 16px" },
  card: { background:"#fff", borderRadius:16, border:"1px solid #e8ecf0", padding:"16px", marginBottom:10 },
  badge: (color,bg) => ({ display:"inline-flex", alignItems:"center", gap:3, background:bg, color:color, borderRadius:20, padding:"3px 10px", fontSize:11, fontWeight:700 }),
  btn: (bg,color,full) => ({ background:bg, color:color, border:"none", borderRadius:12, padding:"11px 18px", fontWeight:600, fontSize:14, cursor:"pointer", display:"inline-flex", alignItems:"center", justifyContent:"center", gap:6, width:full?"100%":"auto" }),
  btnSm: (bg,color) => ({ background:bg, color:color, border:"none", borderRadius:9, padding:"7px 13px", fontWeight:600, fontSize:12, cursor:"pointer", display:"inline-flex", alignItems:"center", gap:4 }),
  input: { background:"#f4f6f8", border:"1.5px solid transparent", borderRadius:11, padding:"11px 13px", fontSize:15, width:"100%", outline:"none", boxSizing:"border-box", fontFamily:"inherit" },
  label: { fontSize:12, fontWeight:700, color:"#64748b", display:"block", marginBottom:5, textTransform:"uppercase", letterSpacing:0.4 },
  row: { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:"1px solid #f1f5f9" },
  secTitle: { fontSize:12, fontWeight:800, color:"#94a3b8", textTransform:"uppercase", letterSpacing:0.8, marginBottom:12 },
};

const StatusBadge = ({status}) => { const c=STATUS_CFG[status]||STATUS_CFG["no-date"]; return <span style={st.badge(c.color,c.bg)}>{c.icon} {c.label}</span>; };
const PayBadge = ({status}) => { const c=PAY_CFG[status]||PAY_CFG.unpaid; return <span style={st.badge(c.color,c.bg)}>{c.label}</span>; };

const LockScreen = ({onUnlock}) => {
  const [pin,setPin]=useState(""); const [error,setError]=useState(false); const [shake,setShake]=useState(false);
  const handleKey=(k)=>{
    if(k==="del"){setPin(p=>p.slice(0,-1));setError(false);return;}
    const next=pin+k; setPin(next);
    if(next.length===4){ if(next===PIN){onUnlock();} else{setError(true);setShake(true);setTimeout(()=>{setPin("");setError(false);setShake(false);},700);} }
  };
  return (
    <div style={{minHeight:"100vh",background:"#0a1a0f",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:32}}>
      <div style={{fontSize:48,marginBottom:8}}>🌿</div>
      <div style={{fontWeight:800,fontSize:26,color:"#fff",marginBottom:4}}>moegardens</div>
      <div style={{fontSize:13,color:"#4a7c5a",marginBottom:40}}>Business Manager</div>
      <div style={{display:"flex",gap:18,marginBottom:44,...(shake?{animation:"shake .4s ease"}:{})}}>
        {[0,1,2,3].map(i=><div key={i} style={{width:16,height:16,borderRadius:"50%",background:pin.length>i?(error?RED:G):"#1e3a28",transition:"background .15s"}}/>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,width:260}}>
        {["1","2","3","4","5","6","7","8","9","","0","del"].map((k,i)=>k===""?<div key={i}/>:
          <button key={i} onClick={()=>handleKey(k)} style={{background:"#122318",color:"#fff",border:"1px solid #1e3a28",borderRadius:16,padding:"20px 0",fontSize:k==="del"?18:24,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{k==="del"?"⌫":k}</button>
        )}
      </div>
      {error&&<div style={{color:RED,marginTop:24,fontWeight:700,fontSize:13}}>Incorrect PIN</div>}
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}@keyframes fadeUp{from{opacity:0;transform:translate(-50%,8px)}to{opacity:1;transform:translate(-50%,0)}}`}</style>
    </div>
  );
};
const blankClient = (count) => ({
  id:`MG${String(count+1).padStart(3,"0")}`, source:"MG", name:"", address:"", phone:"", area:"",
  jobType:"Garden Maintenance", price:"", frequency:DEFAULT_FREQ, lastVisit:"",
  confirmationStatus:"confirmed", isPaused:false, notes:"", accessNotes:"",
  duration:60, chrisCut:false, active:true, visitHistory:[], tags:[],
});

export default function App() {
  const [unlocked,setUnlocked]=useState(false);
  const [rawClients,setRawClients]=useState(loadClients);
  const [visits,setVisits]=useState(loadVisits);
  const [page,setPage]=useState("dashboard");
  const [search,setSearch]=useState("");
  const [filterStatus,setFilterStatus]=useState("all");
  const [filterArea,setFilterArea]=useState("all");
  const [sortBy,setSortBy]=useState("urgency");
  const [payFilter,setPayFilter]=useState("unpaid");
  const [selected,setSelected]=useState(null);
  const [editing,setEditing]=useState(null);
  const [addingClient,setAddingClient]=useState(false);
  const [newClient,setNewClient]=useState(null);
  const [toast,setToast]=useState(null);
  const [confirmDelete,setConfirmDelete]=useState(null);
  const [showFilters,setShowFilters]=useState(false);
  const [payModal,setPayModal]=useState(null);

  const clients=useMemo(()=>rawClients.filter(c=>c.active!==false).map(calcSchedule),[rawClients]);
  const persistClients=(c)=>{setRawClients(c);saveClients(c);};
  const persistVisits=(v)=>{setVisits(v);saveVisits(v);};
  const showToast=(msg,type="success")=>{setToast({msg,type});setTimeout(()=>setToast(null),2500);};

  const overdue=clients.filter(c=>c.visitStatus==="overdue");
  const dueToday=clients.filter(c=>c.visitStatus==="due-today");
  const dueSoon=clients.filter(c=>c.visitStatus==="due-soon");
  const needsConfirm=clients.filter(c=>c.visitStatus==="pending-confirmation");
  const areas=[...new Set(clients.map(c=>c.area).filter(Boolean))].sort();

  const weekStart=thisWeekStart();
  const monthStart=thisMonthStart();
  const unpaidVisits=visits.filter(v=>v.paymentStatus==="unpaid");
  const paidVisits=visits.filter(v=>v.paymentStatus==="paid");
  const weekPaid=paidVisits.filter(v=>v.paymentDate>=weekStart);
  const monthPaid=paidVisits.filter(v=>v.paymentDate>=monthStart);
  const weekUnpaid=unpaidVisits.filter(v=>v.visitDate>=weekStart);
  const totalUnpaid=unpaidVisits.reduce((s,v)=>s+(v.price||0),0);
  const totalPaidWeek=weekPaid.reduce((s,v)=>s+(v.price||0),0);
  const totalPaidMonth=monthPaid.reduce((s,v)=>s+(v.price||0),0);

  const markVisited=(id)=>{
    const client=clients.find(c=>c.id===id);
    if(!client) return;
    const newVisit={
      id:makeVisitId(),clientId:id,clientName:client.name,
      visitDate:TODAY,price:client.price||null,
      paymentStatus:"unpaid",paymentMethod:null,
      paymentDate:null,notes:"",createdAt:TODAY,
    };
    persistVisits([...visits,newVisit]);
    persistClients(rawClients.map(c=>{
      if(c.id!==id) return c;
      return {...c,lastVisit:TODAY,confirmationStatus:"confirmed",isPaused:false,visitHistory:[...(c.visitHistory||[]),TODAY]};
    }));
    setSelected(null);
    showToast("✅ Visit recorded — payment pending");
  };

  const openPayModal=(visit)=>setPayModal({...visit,_method:"Cash"});

  const confirmPayment=()=>{
    if(!payModal) return;
    persistVisits(visits.map(v=>v.id===payModal.id?{...v,paymentStatus:"paid",paymentMethod:payModal._method,paymentDate:TODAY}:v));
    setPayModal(null);
    showToast("💷 Payment confirmed!");
  };

  const confirmClient=(id)=>{persistClients(rawClients.map(c=>c.id===id?{...c,confirmationStatus:"confirmed"}:c));showToast("✅ Confirmed!");};
  const pauseClient=(id)=>{persistClients(rawClients.map(c=>c.id===id?{...c,isPaused:true}:c));setSelected(null);showToast("⏸ Paused");};
  const archiveClient=(id)=>{persistClients(rawClients.map(c=>c.id===id?{...c,active:false}:c));setSelected(null);showToast("Archived");};
  const deleteClient=(id)=>{persistClients(rawClients.filter(c=>c.id!==id));setSelected(null);setConfirmDelete(null);showToast("Removed");};

  const saveEdit=(updated)=>{
    persistClients(rawClients.map(c=>c.id===updated.id?{...updated,price:updated.price?parseFloat(updated.price):null}:c));
    setEditing(null);
    setSelected(calcSchedule({...updated,price:updated.price?parseFloat(updated.price):null}));
    showToast("✅ Saved!");
  };

  const saveNewClient=()=>{
    if(!newClient.name.trim()){showToast("Enter a name","error");return;}
    persistClients([...rawClients,{...newClient,price:newClient.price?parseFloat(newClient.price):null}]);
    setAddingClient(false);setNewClient(null);showToast("✅ Client added!");
  };

  if(!unlocked) return <LockScreen onUnlock={()=>setUnlocked(true)}/>;

  const InputField=({label,field,type="text",options,obj,setObj})=>(
    <div style={{marginBottom:14}}>
      <label style={st.label}>{label}</label>
      {type==="select"?<select style={st.input} value={obj[field]||""} onChange={e=>setObj(p=>({...p,[field]:e.target.value}))}>{options.map(o=><option key={o} value={o}>{o}</option>)}</select>
      :type==="textarea"?<textarea style={{...st.input,resize:"vertical",minHeight:70}} value={obj[field]||""} onChange={e=>setObj(p=>({...p,[field]:e.target.value}))} placeholder={label}/>
      :<input type={type} style={st.input} value={obj[field]||""} onChange={e=>setObj(p=>({...p,[field]:e.target.value}))} placeholder={label}/>}
    </div>
  );

  const ClientForm=({obj,setObj,onSave,onCancel,title})=>(
    <div>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
        <button style={st.btnSm("#f1f5f9","#0f172a")} onClick={onCancel}>← Back</button>
        <div style={{fontSize:20,fontWeight:800}}>{title}</div>
      </div>
      <div style={st.card}>
        <div style={st.secTitle}>Contact</div>
        <InputField label="Full Name *" field="name" obj={obj} setObj={setObj}/>
        <InputField label="Phone" field="phone" type="tel" obj={obj} setObj={setObj}/>
        <InputField label="Address" field="address" type="textarea" obj={obj} setObj={setObj}/>
        <InputField label="Area" field="area" obj={obj} setObj={setObj}/>
      </div>
      <div style={st.card}>
        <div style={st.secTitle}>Scheduling</div>
        <InputField label="Last Visit Date" field="lastVisit" type="date" obj={obj} setObj={setObj}/>
        <InputField label="Frequency" field="frequency" type="select" options={FREQUENCIES} obj={obj} setObj={setObj}/>
        <div style={{background:"#f0fdf4",borderRadius:10,padding:"10px 12px",fontSize:12,color:G,fontWeight:600,marginBottom:10}}>
          📅 Next visit auto-calculates from last visit + frequency
        </div>
        <InputField label="Confirmation Status" field="confirmationStatus" type="select" options={["confirmed","pending"]} obj={obj} setObj={setObj}/>
      </div>
      <div style={st.card}>
        <div style={st.secTitle}>Job & Payment</div>
        <InputField label="Job Type" field="jobType" type="select" options={JOB_TYPES} obj={obj} setObj={setObj}/>
        <InputField label="Price per Visit (£)" field="price" type="number" obj={obj} setObj={setObj}/>
        <InputField label="Duration (mins)" field="duration" type="number" obj={obj} setObj={setObj}/>
        <InputField label="Source" field="source" type="select" options={["MG","CCG"]} obj={obj} setObj={setObj}/>
        <div style={{display:"flex",alignItems:"center",gap:10,marginTop:8,cursor:"pointer"}} onClick={()=>setObj(p=>({...p,chrisCut:!p.chrisCut}))}>
          <div style={{width:22,height:22,borderRadius:7,border:`2px solid ${obj.chrisCut?G:"#cbd5e1"}`,background:obj.chrisCut?G:"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>
            {obj.chrisCut&&<span style={{color:"#fff",fontSize:13}}>✓</span>}
          </div>
          <span style={{fontSize:14,fontWeight:500}}>Chris 30% cut applies</span>
        </div>
      </div>
      <div style={st.card}>
        <div style={st.secTitle}>Notes</div>
        <InputField label="General Notes" field="notes" type="textarea" obj={obj} setObj={setObj}/>
        <InputField label="Access Instructions" field="accessNotes" type="textarea" obj={obj} setObj={setObj}/>
      </div>
      <button style={{...st.btn(G,"#fff",true),padding:"14px",fontSize:15,borderRadius:14,marginBottom:16}} onClick={onSave}>Save Client</button>
    </div>
  );

  const Dashboard=()=>{
    const topOverdue=[...overdue].sort((a,b)=>b.overdueDays-a.overdueDays).slice(0,4);
    const recentUnpaid=[...unpaidVisits].sort((a,b)=>b.visitDate.localeCompare(a.visitDate)).slice(0,4);
    return (
      <div>
        <div style={{marginBottom:16}}>
          <div style={{fontSize:22,fontWeight:800,color:"#0f172a",marginBottom:2}}>Good morning 👋</div>
          <div style={{fontSize:13,color:"#94a3b8"}}>{new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
          {[
            {label:"🔴 Overdue",val:overdue.length,color:RED,bg:"#fef2f2",fn:()=>{setFilterStatus("overdue");setPage("revisits");}},
            {label:"🟠 Due Today",val:dueToday.length,color:"#ea580c",bg:"#fff7ed",fn:()=>{setFilterStatus("due-today");setPage("revisits");}},
            {label:"💷 Unpaid",val:`£${totalUnpaid}`,color:RED,bg:"#fef2f2",fn:()=>setPage("payments")},
            {label:"⏳ Needs Confirm",val:needsConfirm.length,color:"#6366f1",bg:"#eef2ff",fn:()=>{setFilterStatus("pending-confirmation");setPage("revisits");}},
          ].map(({label,val,color,bg,fn})=>(
            <div key={label} onClick={fn} style={{...st.card,background:bg,border:`1px solid ${color}20`,marginBottom:0,padding:"14px",cursor:"pointer"}}>
              <div style={{fontSize:11,fontWeight:700,color,marginBottom:4}}>{label}</div>
              <div style={{fontSize:30,fontWeight:800,color,lineHeight:1}}>{val}</div>
            </div>
          ))}
        </div>
        <div style={{...st.card,marginBottom:12}}>
          <div style={st.secTitle}>💷 Revenue</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {[{l:"This Week",v:`£${totalPaidWeek}`},{l:"This Month",v:`£${totalPaidMonth}`}].map(({l,v})=>(
              <div key={l} style={{textAlign:"center",background:"#f0fdf4",borderRadius:10,padding:"10px"}}>
                <div style={{fontSize:10,color:"#94a3b8",fontWeight:700,textTransform:"uppercase",marginBottom:3}}>{l}</div>
                <div style={{fontSize:22,fontWeight:800,color:G}}>{v}</div>
              </div>
            ))}
          </div>
        </div>
        {recentUnpaid.length>0&&(
          <div style={{...st.card,borderLeft:`3px solid ${RED}`,marginBottom:12}}>
            <div style={{fontSize:14,fontWeight:800,color:RED,marginBottom:10}}>💷 Unpaid Visits</div>
            {recentUnpaid.map(v=>(
              <div key={v.id} style={{...st.row,cursor:"pointer"}}>
                <div>
                  <div style={{fontWeight:700,fontSize:13}}>{v.clientName}</div>
                  <div style={{fontSize:11,color:"#94a3b8"}}>Visited: {fmtDate(v.visitDate)}</div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontWeight:800,color:RED}}>{fmtPrice(v.price)}</span>
                  <button style={st.btnSm(G,"#fff")} onClick={()=>openPayModal(v)}>Pay</button>
                </div>
              </div>
            ))}
          </div>
        )}
        {topOverdue.length>0&&(
          <div style={{...st.card,borderLeft:`3px solid ${RED}`,marginBottom:12}}>
            <div style={{fontSize:14,fontWeight:800,color:RED,marginBottom:10}}>🔴 Most Overdue</div>
            {topOverdue.map(c=>(
              <div key={c.id} style={{...st.row,cursor:"pointer"}} onClick={()=>{setSelected(c);setPage("clients");}}>
                <div><div style={{fontWeight:700,fontSize:13}}>{c.name}</div><div style={{fontSize:11,color:"#94a3b8"}}>{c.area||"—"} · Last: {fmtDate(c.lastVisit)}</div></div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontWeight:800,color:RED,fontSize:12}}>{c.overdueDays}d overdue</div>
                  {c.phone&&<a href={`tel:${c.phone}`} onClick={e=>e.stopPropagation()} style={{fontSize:16}}>📞</a>}
                </div>
              </div>
            ))}
          </div>
        )}
        <div style={st.card}>
          <div style={st.secTitle}>Quick Actions</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {[
              {label:"➕ Add Client",bg:G,color:"#fff",fn:()=>{setNewClient(blankClient(rawClients.length));setAddingClient(true);setPage("clients");}},
              {label:"👥 All Clients",bg:"#f1f5f9",color:"#0f172a",fn:()=>setPage("clients")},
              {label:"🔴 Revisits",bg:"#fef2f2",color:RED,fn:()=>setPage("revisits")},
              {label:"💷 Payments",bg:"#f0fdf4",color:G,fn:()=>setPage("payments")},
            ].map(({label,bg,color,fn})=>(
              <button key={label} style={{...st.btn(bg,color),borderRadius:12,padding:"12px",fontSize:13,fontWeight:700}} onClick={fn}>{label}</button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const ClientRow=({c})=>{
    const clientUnpaid=visits.filter(v=>v.clientId===c.id&&v.paymentStatus==="unpaid");
    return (
      <div style={{...st.card,marginBottom:8,borderLeft:`3px solid ${STATUS_CFG[c.visitStatus]?.color||"#e8ecf0"}`,cursor:"pointer"}} onClick={()=>setSelected(c)}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
          <div style={{fontWeight:700,fontSize:15,flex:1,paddingRight:8}}>{c.name}</div>
          <StatusBadge status={c.visitStatus}/>
        </div>
        <div style={{fontSize:12,color:"#94a3b8",marginBottom:6}}>{c.area||c.address?.slice(0,35)||"No address"}</div>
        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          <span style={{fontSize:11,background:"#f1f5f9",borderRadius:6,padding:"2px 8px",fontWeight:600}}>{c.frequency||DEFAULT_FREQ}</span>
          {c.lastVisit&&<span style={{fontSize:11,color:"#94a3b8"}}>Last: {fmtDate(c.lastVisit)}</span>}
          {c.visitStatus==="overdue"&&<span style={{fontSize:11,fontWeight:800,color:RED}}>{c.overdueDays}d overdue</span>}
          {clientUnpaid.length>0&&<span style={{...st.badge(RED,"#fee2e2"),fontSize:10}}>💷 {clientUnpaid.length} unpaid</span>}
          <span style={{fontWeight:800,color:G,marginLeft:"auto",fontSize:14}}>{fmtPrice(c.price)}</span>
        </div>
      </div>
    );
  };

  const ClientList=()=>{
    const sorted=useMemo(()=>{
      let list=clients.filter(c=>{
        const q=search.toLowerCase();
        const mq=!q||c.name.toLowerCase().includes(q)||(c.area||"").toLowerCase().includes(q)||(c.phone||"").includes(q);
        const ms=filterStatus==="all"||c.visitStatus===filterStatus;
        const ma=filterArea==="all"||(c.area||"")===filterArea;
        return mq&&ms&&ma;
      });
      switch(sortBy){
        case "urgency": return sortByUrgency(list);
        case "lastVisit": return [...list].sort((a,b)=>(a.lastVisit||"").localeCompare(b.lastVisit||""));
        case "nextVisit": return [...list].sort((a,b)=>(a.nextVisit||"9").localeCompare(b.nextVisit||"9"));
        case "area": return [...list].sort((a,b)=>(a.area||"").localeCompare(b.area||""));
        case "name": return [...list].sort((a,b)=>a.name.localeCompare(b.name));
        default: return list;
      }
    },[]);
    return (
      <div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{fontSize:13,color:"#94a3b8",fontWeight:600}}>{sorted.length} clients</div>
          <div style={{display:"flex",gap:8}}>
            <button style={st.btnSm(showFilters?"#0f172a":"#f1f5f9",showFilters?"#fff":"#64748b")} onClick={()=>setShowFilters(p=>!p)}>⚙ Filter</button>
            <button style={st.btnSm(G,"#fff")} onClick={()=>{setNewClient(blankClient(rawClients.length));setAddingClient(true);}}>➕ Add</button>
          </div>
        </div>
        <input style={{...st.input,marginBottom:10}} placeholder="🔍 Search name, area, phone..." value={search} onChange={e=>setSearch(e.target.value)}/>
        {showFilters&&(
          <div style={{...st.card,marginBottom:10,padding:12}}>
            <div style={{marginBottom:10}}>
              <div style={st.label}>Status</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {[["all","All"],["overdue","🔴 Overdue"],["due-today","🟠 Today"],["due-soon","🟡 Soon"],["not-due","🟢 OK"],["pending-confirmation","⏳ Pending"]].map(([val,label])=>(
                  <button key={val} onClick={()=>setFilterStatus(val)} style={{...st.btnSm(filterStatus===val?G:"#f1f5f9",filterStatus===val?"#fff":"#64748b"),fontSize:11}}>{label}</button>
                ))}
              </div>
            </div>
            <div style={{marginBottom:10}}>
              <div style={st.label}>Area</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {["all",...areas].map(a=>(
                  <button key={a} onClick={()=>setFilterArea(a)} style={{...st.btnSm(filterArea===a?"#0f172a":"#f1f5f9",filterArea===a?"#fff":"#64748b"),fontSize:11}}>{a==="all"?"All":a}</button>
                ))}
              </div>
            </div>
            <div>
              <div style={st.label}>Sort</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {[["urgency","🚨 Urgency"],["lastVisit","📅 Last Visit"],["nextVisit","⏭ Next Due"],["area","📍 Area"],["name","🔤 Name"]].map(([val,label])=>(
                  <button key={val} onClick={()=>setSortBy(val)} style={{...st.btnSm(sortBy===val?"#0f172a":"#f1f5f9",sortBy===val?"#fff":"#64748b"),fontSize:11}}>{label}</button>
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

  const ClientDetail=({c})=>{
    const clientVisits=visits.filter(v=>v.clientId===c.id).sort((a,b)=>b.visitDate.localeCompare(a.visitDate));
    const clientUnpaid=clientVisits.filter(v=>v.paymentStatus==="unpaid");
    const clientPaid=clientVisits.filter(v=>v.paymentStatus==="paid");
    const totalEarned=clientPaid.reduce((s,v)=>s+(v.price||0),0);
    const totalOwed=clientUnpaid.reduce((s,v)=>s+(v.price||0),0);
    const cfg=STATUS_CFG[c.visitStatus]||{};
    return (
      <div>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16,flexWrap:"wrap"}}>
          <button style={st.btnSm("#f1f5f9","#0f172a")} onClick={()=>setSelected(null)}>← Back</button>
          <button style={st.btnSm(G,"#fff")} onClick={()=>setEditing({...c,price:c.price!=null?String(c.price):""})}>✏️ Edit</button>
          <button style={st.btnSm("#fff2f2",RED)} onClick={()=>setConfirmDelete(c.id)}>🗑</button>
          <button style={st.btnSm("#f1f5f9","#64748b")} onClick={()=>pauseClient(c.id)}>⏸ Pause</button>
          <button style={st.btnSm("#f1f5f9","#64748b")} onClick={()=>archiveClient(c.id)}>Archive</button>
        </div>
        <div style={{...st.card,borderLeft:`4px solid ${cfg.color||G}`,marginBottom:12}}>
          <div style={{fontSize:22,fontWeight:800,marginBottom:8}}>{c.name}</div>
          <StatusBadge status={c.visitStatus}/>
          {c.visitStatus==="overdue"&&<div style={{marginTop:8,fontWeight:700,color:RED,fontSize:13}}>⚠️ {c.overdueDays} days overdue</div>}
        </div>
        <div style={st.card}>
          <div style={st.secTitle}>Schedule</div>
          {[["Frequency",c.frequency||DEFAULT_FREQ],["Last Visit",fmtDate(c.lastVisit)],["Days Since",c.daysSinceVisit!=null?`${c.daysSinceVisit} days`:"—"],["Next Due",fmtDate(c.nextVisit)],["Status",c.visitStatus==="overdue"?`${c.overdueDays}d overdue`:c.daysUntilDue!=null?`${c.daysUntilDue}d away`:"—"]].map(([k,v])=>(
            <div key={k} style={st.row}><span style={{fontSize:13,color:"#64748b",fontWeight:600}}>{k}</span><span style={{fontSize:13,fontWeight:700}}>{v}</span></div>
          ))}
        </div>
        <div style={st.card}>
          <div style={st.secTitle}>Contact</div>
          {[["Phone",c.phone||"—"],["Area",c.area||"—"],["Address",c.address||"—"]].map(([k,v])=>(
            <div key={k} style={st.row}>
              <span style={{fontSize:13,color:"#64748b",fontWeight:600}}>{k}</span>
              {k==="Phone"&&c.phone?<a href={`tel:${c.phone}`} style={{fontSize:13,fontWeight:700,color:G,textDecoration:"none"}}>{v}</a>:<span style={{fontSize:13,fontWeight:600,maxWidth:200,textAlign:"right"}}>{v}</span>}
            </div>
          ))}
        </div>
        <div style={st.card}>
          <div style={st.secTitle}>💷 Payment Summary</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
            {[{l:"Per Visit",v:fmtPrice(c.price),cl:"#0f172a"},{l:"Total Earned",v:`£${totalEarned}`,cl:G},{l:"Owes",v:totalOwed?`£${totalOwed}`:"—",cl:totalOwed?RED:"#94a3b8"}].map(({l,v,cl})=>(
              <div key={l} style={{textAlign:"center",background:"#f8fafc",borderRadius:10,padding:"10px 6px"}}>
                <div style={{fontSize:10,color:"#94a3b8",fontWeight:700,textTransform:"uppercase",marginBottom:3}}>{l}</div>
                <div style={{fontSize:17,fontWeight:800,color:cl}}>{v}</div>
              </div>
            ))}
          </div>
          {clientUnpaid.length>0&&(
            <div style={{background:"#fef2f2",borderRadius:10,padding:"10px 12px",marginBottom:8}}>
              <div style={{fontSize:12,fontWeight:700,color:RED,marginBottom:6}}>{clientUnpaid.length} unpaid visit{clientUnpaid.length>1?"s":""} — £{totalOwed} owed</div>
              {clientUnpaid.map(v=>(
                <div key={v.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:"1px solid #fee2e2"}}>
                  <div style={{fontSize:12,fontWeight:600}}>{fmtDate(v.visitDate)}</div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontWeight:700,color:RED,fontSize:13}}>{fmtPrice(v.price)}</span>
                    <button style={st.btnSm(G,"#fff")} onClick={()=>openPayModal(v)}>Pay</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {clientVisits.length>0&&(
          <div style={st.card}>
            <div style={st.secTitle}>Visit History ({clientVisits.length})</div>
            {clientVisits.slice(0,8).map(v=>(
              <div key={v.id} style={{...st.row,flexWrap:"wrap",gap:4}}>
                <div><div style={{fontSize:13,fontWeight:600}}>📅 {fmtDate(v.visitDate)}</div><div style={{fontSize:11,color:"#94a3b8"}}>{v.paymentMethod||""}{v.paymentDate?` · paid ${fmtDate(v.paymentDate)}`:""}</div></div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontWeight:700,fontSize:13}}>{fmtPrice(v.price)}</span>
                  <PayBadge status={v.paymentStatus}/>
                  {v.paymentStatus==="unpaid"&&<button style={st.btnSm(G,"#fff")} onClick={()=>openPayModal(v)}>Pay</button>}
                </div>
              </div>
            ))}
          </div>
        )}
        {(c.notes||c.accessNotes)&&(
          <div style={st.card}>
            <div style={st.secTitle}>Notes</div>
            {c.notes&&<div style={{marginBottom:8}}><div style={{fontSize:11,fontWeight:700,color:"#94a3b8",marginBottom:3}}>GENERAL</div><div style={{fontSize:13,lineHeight:1.5}}>{c.notes}</div></div>}
            {c.accessNotes&&<div><div style={{fontSize:11,fontWeight:700,color:"#94a3b8",marginBottom:3}}>ACCESS</div><div style={{fontSize:13,lineHeight:1.5}}>{c.accessNotes}</div></div>}
          </div>
        )}
        <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:16}}>
          <button style={{...st.btn("#dcfce7","#16a34a"),borderRadius:12}} onClick={()=>markVisited(c.id)}>✅ Mark Visited Today</button>
          {c.visitStatus==="pending-confirmation"&&<button style={{...st.btn(G,"#fff"),borderRadius:12}} onClick={()=>confirmClient(c.id)}>✓ Confirm Active</button>}
          {c.phone&&<a href={`tel:${c.phone}`} style={{...st.btn("#f1f5f9","#0f172a"),borderRadius:12,textDecoration:"none"}}>📞 Call</a>}
        </div>
      </div>
    );
  };

  const Revisits=()=>{
    const sorted=sortByUrgency(clients.filter(c=>{
      if(filterStatus==="all") return ["overdue","due-today","due-soon","pending-confirmation","not-due"].includes(c.visitStatus);
      return c.visitStatus===filterStatus;
    }));
    return (
      <div>
        <div style={{fontSize:13,color:"#94a3b8",fontWeight:600,marginBottom:12}}>{overdue.length} overdue · {dueToday.length} today · {dueSoon.length} this week</div>
        <div style={{display:"flex",gap:6,marginBottom:14,overflowX:"auto",paddingBottom:4}}>
          {[["all","All"],["overdue","🔴 Overdue"],["due-today","🟠 Today"],["due-soon","🟡 Week"],["pending-confirmation","⏳ Pending"],["not-due","🟢 OK"]].map(([val,label])=>(
            <button key={val} onClick={()=>setFilterStatus(val)} style={{...st.btnSm(filterStatus===val?G:"#f1f5f9",filterStatus===val?"#fff":"#64748b"),whiteSpace:"nowrap",fontSize:11}}>{label}</button>
          ))}
        </div>
        {sorted.length===0&&<div style={{textAlign:"center",padding:"60px 0",color:"#94a3b8"}}><div style={{fontSize:48,marginBottom:12}}>✅</div><div style={{fontWeight:700,fontSize:16}}>All clear!</div></div>}
        {sorted.map(c=>{
          const cfg=STATUS_CFG[c.visitStatus]||{};
          const clientUnpaidCount=visits.filter(v=>v.clientId===c.id&&v.paymentStatus==="unpaid").length;
          return (
            <div key={c.id} style={{...st.card,borderLeft:`3px solid ${cfg.color||"#e8ecf0"}`,marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                <div style={{fontWeight:700,fontSize:15}}>{c.name}</div>
                <StatusBadge status={c.visitStatus}/>
              </div>
              <div style={{fontSize:12,color:"#94a3b8",marginBottom:6}}>{c.area||"—"} · {c.frequency||DEFAULT_FREQ}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:10}}>
                {[["Last Visit",fmtDate(c.lastVisit),"#0f172a"],["Days Since",c.daysSinceVisit!=null?`${c.daysSinceVisit}d`:"—",c.daysSinceVisit>21?RED:AMBER],[c.visitStatus==="overdue"?"Overdue":"Next Due",c.visitStatus==="overdue"?`${c.overdueDays}d`:fmtDate(c.nextVisit),c.visitStatus==="overdue"?RED:"#0f172a"]].map(([label,val,color])=>(
                  <div key={label} style={{background:"#f8fafc",borderRadius:8,padding:"6px 8px",textAlign:"center"}}>
                    <div style={{fontSize:9,color:"#94a3b8",fontWeight:700,textTransform:"uppercase"}}>{label}</div>
                    <div style={{fontSize:11,fontWeight:700,marginTop:2,color}}>{val}</div>
                  </div>
                ))}
              </div>
              {clientUnpaidCount>0&&<div style={{fontSize:11,color:RED,fontWeight:700,marginBottom:8}}>💷 {clientUnpaidCount} unpaid visit{clientUnpaidCount>1?"s":""}</div>}
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {c.phone&&<a href={`tel:${c.phone}`} style={{...st.btnSm(G,"#fff"),textDecoration:"none"}}>📞 Call</a>}
                <button style={st.btnSm("#dcfce7","#16a34a")} onClick={()=>markVisited(c.id)}>✅ Visited Today</button>
                {c.visitStatus==="pending-confirmation"&&<button style={st.btnSm("#eef2ff","#6366f1")} onClick={()=>confirmClient(c.id)}>✓ Confirm</button>}
                <button style={st.btnSm("#f1f5f9","#0f172a")} onClick={()=>setSelected(c)}>View →</button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const Payments=()=>{
    const filtered=visits.filter(v=>{
      if(payFilter==="unpaid") return v.paymentStatus==="unpaid";
      if(payFilter==="paid") return v.paymentStatus==="paid";
      if(payFilter==="this-week") return v.visitDate>=weekStart;
      if(payFilter==="this-month") return v.visitDate>=monthStart;
      return true;
    }).sort((a,b)=>b.visitDate.localeCompare(a.visitDate));

    const clientsWithUnpaid=[...new Set(unpaidVisits.map(v=>v.clientId))].map(id=>{
      const c=clients.find(x=>x.id===id);
      const owed=unpaidVisits.filter(v=>v.clientId===id).reduce((s,v)=>s+(v.price||0),0);
      const count=unpaidVisits.filter(v=>v.clientId===id).length;
      return {id,name:c?.name||"Unknown",area:c?.area||"",owed,count};
    }).sort((a,b)=>b.owed-a.owed);

    return (
      <div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
          <div style={{...st.card,borderLeft:`4px solid ${RED}`,marginBottom:0,cursor:"pointer"}} onClick={()=>setPayFilter("unpaid")}>
            <div style={{fontSize:11,fontWeight:700,color:RED,textTransform:"uppercase",marginBottom:4}}>Total Unpaid</div>
            <div style={{fontSize:28,fontWeight:800,color:RED}}>£{totalUnpaid}</div>
            <div style={{fontSize:11,color:"#94a3b8"}}>{unpaidVisits.length} visits</div>
          </div>
          <div style={{...st.card,borderLeft:`4px solid ${G}`,marginBottom:0}}>
            <div style={{fontSize:11,fontWeight:700,color:G,textTransform:"uppercase",marginBottom:4}}>This Month</div>
            <div style={{fontSize:28,fontWeight:800,color:G}}>£{totalPaidMonth}</div>
            <div style={{fontSize:11,color:"#94a3b8"}}>{monthPaid.length} paid</div>
          </div>
        </div>
        <div style={{...st.card,marginBottom:12}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {[{l:"This Week",v:`£${totalPaidWeek}`,sub:`${weekPaid.length} paid`},{l:"Week Unpaid",v:`£${weekUnpaid.reduce((s,v)=>s+(v.price||0),0)}`,sub:`${weekUnpaid.length} visits`}].map(({l,v,sub})=>(
              <div key={l} style={{textAlign:"center",background:"#f8fafc",borderRadius:10,padding:"10px"}}>
                <div style={{fontSize:10,color:"#94a3b8",fontWeight:700,textTransform:"uppercase",marginBottom:3}}>{l}</div>
                <div style={{fontSize:20,fontWeight:800,color:"#0f172a"}}>{v}</div>
                <div style={{fontSize:10,color:"#94a3b8"}}>{sub}</div>
              </div>
            ))}
          </div>
        </div>
        {clientsWithUnpaid.length>0&&(
          <div style={{...st.card,marginBottom:12}}>
            <div style={st.secTitle}>🔴 Who Owes Money</div>
            {clientsWithUnpaid.map(({id,name,area,owed,count})=>(
              <div key={id} style={{...st.row,cursor:"pointer"}} onClick={()=>{const c=clients.find(x=>x.id===id);if(c){setSelected(c);setPage("clients");}}}>
                <div><div style={{fontWeight:700,fontSize:13}}>{name}</div><div style={{fontSize:11,color:"#94a3b8"}}>{area||"—"} · {count} visit{count>1?"s":""}</div></div>
                <span style={{fontWeight:800,color:RED,fontSize:15}}>£{owed}</span>
              </div>
            ))}
          </div>
        )}
        <div style={{display:"flex",gap:6,marginBottom:12,overflowX:"auto",paddingBottom:4}}>
          {[["unpaid","💷 Unpaid"],["paid","✅ Paid"],["this-week","📅 Week"],["this-month","🗓 Month"],["all","All"]].map(([val,label])=>(
            <button key={val} onClick={()=>setPayFilter(val)} style={{...st.btnSm(payFilter===val?G:"#f1f5f9",payFilter===val?"#fff":"#64748b"),whiteSpace:"nowrap",fontSize:11}}>{label}</button>
          ))}
        </div>
        {filtered.map(v=>(
          <div key={v.id} style={{...st.card,marginBottom:8,borderLeft:`3px solid ${PAY_CFG[v.paymentStatus]?.color||RED}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
              <div style={{fontWeight:700,fontSize:14}}>{v.clientName}</div>
              <PayBadge status={v.paymentStatus}/>
            </div>
            <div style={{fontSize:12,color:"#94a3b8",marginBottom:8}}>Visited: {fmtDate(v.visitDate)}{v.paymentDate?` · Paid: ${fmtDate(v.paymentDate)}`:""}</div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontWeight:800,fontSize:16,color:v.paymentStatus==="paid"?G:RED}}>{fmtPrice(v.price)}</span>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                {v.paymentStatus==="unpaid"&&<button style={st.btnSm(G,"#fff")} onClick={()=>openPayModal(v)}>💷 Mark Paid</button>}
                {v.paymentMethod&&<span style={{fontSize:11,color:"#94a3b8"}}>{v.paymentMethod}</span>}
              </div>
            </div>
          </div>
        ))}
        {filtered.length===0&&<div style={{textAlign:"center",padding:"40px 0",color:"#94a3b8"}}><div style={{fontSize:36,marginBottom:8}}>💷</div><div style={{fontWeight:600}}>No records</div></div>}
      </div>
    );
  };

  const navItems=[{id:"dashboard",icon:"🏠",label:"Home"},{id:"clients",icon:"👥",label:"Clients"},{id:"revisits",icon:"🔴",label:"Revisits"},{id:"payments",icon:"💷",label:"Payments"}];
  const pageTitles={dashboard:"moegardens 🌿",clients:"Clients",revisits:"Revisits",payments:"Payments"};

  return (
    <div style={st.app}>
      <style>{`*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}input,select,textarea{font-family:inherit}@keyframes fadeUp{from{opacity:0;transform:translate(-50%,8px)}to{opacity:1;transform:translate(-50%,0)}}@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}`}</style>
      <div style={st.topbar}>
        <div style={{fontWeight:800,fontSize:18,color:G}}>{pageTitles[page]||"moegardens 🌿"}</div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {overdue.length>0&&<span style={st.badge(RED,"#fee2e2")}>🔴 {overdue.length}</span>}
          {totalUnpaid>0&&<span style={st.badge(RED,"#fee2e2")}>💷 £{totalUnpaid}</span>}
        </div>
      </div>
      <div style={st.content}>
        {confirmDelete&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
            <div style={{background:"#fff",borderRadius:20,padding:24,maxWidth:320,width:"100%"}}>
              <div style={{fontWeight:800,fontSize:18,marginBottom:8}}>Delete Client?</div>
              <div style={{fontSize:13,color:"#64748b",marginBottom:20}}>This cannot be undone.</div>
              <div style={{display:"flex",gap:10}}>
                <button style={st.btn(RED,"#fff",true)} onClick={()=>deleteClient(confirmDelete)}>Delete</button>
                <button style={st.btn("#f1f5f9","#0f172a",true)} onClick={()=>setConfirmDelete(null)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
        {payModal&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
            <div style={{background:"#fff",borderRadius:20,padding:24,maxWidth:340,width:"100%"}}>
              <div style={{fontWeight:800,fontSize:18,marginBottom:4}}>Confirm Payment</div>
              <div style={{fontSize:13,color:"#64748b",marginBottom:16}}>{payModal.clientName} · {fmtDate(payModal.visitDate)}</div>
              <div style={{fontSize:28,fontWeight:800,color:G,marginBottom:20}}>{fmtPrice(payModal.price)}</div>
              <div style={st.label}>Payment Method</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:20}}>
                {PAYMENT_METHODS.map(m=>(
                  <button key={m} onClick={()=>setPayModal(p=>({...p,_method:m}))} style={{...st.btnSm(payModal._method===m?G:"#f1f5f9",payModal._method===m?"#fff":"#64748b")}}>{m}</button>
                ))}
              </div>
              <div style={{display:"flex",gap:10}}>
                <button style={st.btn(G,"#fff",true)} onClick={confirmPayment}>✅ Confirm Paid</button>
                <button style={st.btn("#f1f5f9","#0f172a",true)} onClick={()=>setPayModal(null)}>Cancel</button>
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
      <div style={st.bottomnav}>
        {navItems.map(n=>(
          <button key={n.id} style={{...st.navbtn,color:page===n.id?G:"#94a3b8"}} onClick={()=>{setSelected(null);setEditing(null);setAddingClient(false);setNewClient(null);setPage(n.id);}}>
            <span style={{fontSize:22}}>{n.icon}</span>
            <span style={{fontSize:10,fontWeight:700}}>{n.label}</span>
          </button>
        ))}
      </div>
      {toast&&<div style={{position:"fixed",bottom:100,left:"50%",transform:"translateX(-50%)",background:toast.type==="error"?RED:G,color:"#fff",padding:"11px 22px",borderRadius:14,fontSize:13,fontWeight:700,zIndex:9999,whiteSpace:"nowrap",boxShadow:"0 4px 20px rgba(0,0,0,.2)",animation:"fadeUp .2s ease"}}>{toast.msg}</div>}
    </div>
  );
}
