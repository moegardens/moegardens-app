import { useState, useEffect } from "react";

const CLIENTS_KEY = "mg_clients";
const G = "#1a6b3c";
const AMBER = "#f59e0b";
const RED = "#dc2626";
const BLUE = "#3b82f6";

const DEFAULT_CLIENTS = [
  { id:"CCG001", source:"CCG", name:"Louise Bridget", address:"Balerno Rugby Club", phone:"", area:"Balerno", jobType:"Grounds Maintenance", price:50, frequency:"Monthly", lastVisit:"2026-05-01", nextVisit:"2026-05-26", revisitStatus:"confirmed", visitPending:false, notes:"", paymentStatus:"paid", duration:120, chrisCut:true, active:true, visitHistory:[], tags:[] },
  { id:"CCG002", source:"CCG", name:"Daniel Sloss", address:"", phone:"", area:"", jobType:"Garden Maintenance", price:null, frequency:"Monthly", lastVisit:"", nextVisit:"", revisitStatus:"confirmed", visitPending:false, notes:"Price TBC", paymentStatus:"unpaid", duration:60, chrisCut:true, active:true, visitHistory:[], tags:[] },
  { id:"CCG003", source:"CCG", name:"Bravelaw Estate", address:"", phone:"+1 (713) 256-3101", area:"", jobType:"Grounds Maintenance", price:300, frequency:"Monthly", lastVisit:"", nextVisit:"", revisitStatus:"confirmed", visitPending:false, notes:"", paymentStatus:"paid", duration:480, chrisCut:true, active:true, visitHistory:[], tags:[] },
  { id:"CCG004", source:"CCG", name:"Chris Mum", address:"", phone:"", area:"", jobType:"Garden Maintenance", price:20, frequency:"Monthly", lastVisit:"", nextVisit:"", revisitStatus:"confirmed", visitPending:false, notes:"", paymentStatus:"paid", duration:60, chrisCut:true, active:true, visitHistory:[], tags:[] },
  { id:"CCG005", source:"CCG", name:"Chris", address:"", phone:"", area:"", jobType:"Garden Maintenance", price:30, frequency:"Monthly", lastVisit:"", nextVisit:"", revisitStatus:"confirmed", visitPending:false, notes:"", paymentStatus:"paid", duration:60, chrisCut:true, active:true, visitHistory:[], tags:[] },
  { id:"CCG006", source:"CCG", name:"Forrester Flats", address:"", phone:"", area:"Forrester", jobType:"Grounds Maintenance", price:null, frequency:"Monthly", lastVisit:"", nextVisit:"", revisitStatus:"confirmed", visitPending:false, notes:"Price TBC", paymentStatus:"unpaid", duration:180, chrisCut:true, active:true, visitHistory:[], tags:[] },
  { id:"CCG007", source:"CCG", name:"Chris Granny", address:"", phone:"", area:"", jobType:"Garden Maintenance", price:40, frequency:"Monthly", lastVisit:"", nextVisit:"", revisitStatus:"confirmed", visitPending:false, notes:"", paymentStatus:"paid", duration:90, chrisCut:true, active:true, visitHistory:[], tags:[] },
  { id:"CCG008", source:"CCG", name:"Parkhead", address:"", phone:"", area:"Parkhead", jobType:"Grounds Maintenance", price:40, frequency:"Monthly", lastVisit:"", nextVisit:"", revisitStatus:"confirmed", visitPending:false, notes:"", paymentStatus:"paid", duration:120, chrisCut:true, active:true, visitHistory:[], tags:[] },
  { id:"CCG009", source:"CCG", name:"Jane", address:"13 Langton View, East Calder, EH53 0LE", phone:"", area:"East Calder", jobType:"Garden Maintenance", price:30, frequency:"Monthly", lastVisit:"", nextVisit:"", revisitStatus:"confirmed", visitPending:false, notes:"", paymentStatus:"paid", duration:90, chrisCut:true, active:true, visitHistory:[], tags:[] },
  { id:"CCG010", source:"CCG", name:"Margret", address:"", phone:"", area:"", jobType:"Garden Maintenance", price:null, frequency:"Monthly", lastVisit:"", nextVisit:"", revisitStatus:"confirmed", visitPending:false, notes:"", paymentStatus:"unpaid", duration:60, chrisCut:true, active:true, visitHistory:[], tags:[] },
  { id:"CCG011", source:"CCG", name:"Illi", address:"", phone:"", area:"", jobType:"Garden Maintenance", price:null, frequency:"Monthly", lastVisit:"", nextVisit:"", revisitStatus:"confirmed", visitPending:false, notes:"", paymentStatus:"unpaid", duration:60, chrisCut:true, active:true, visitHistory:[], tags:[] },
  { id:"CCG012", source:"CCG", name:"Palm", address:"", phone:"", area:"", jobType:"Garden Maintenance", price:null, frequency:"Monthly", lastVisit:"", nextVisit:"", revisitStatus:"confirmed", visitPending:false, notes:"", paymentStatus:"unpaid", duration:60, chrisCut:true, active:true, visitHistory:[], tags:[] },
  { id:"CCG013", source:"CCG", name:"Marrion", address:"", phone:"", area:"", jobType:"Garden Maintenance", price:null, frequency:"Monthly", lastVisit:"", nextVisit:"", revisitStatus:"confirmed", visitPending:false, notes:"", paymentStatus:"unpaid", duration:60, chrisCut:true, active:true, visitHistory:[], tags:[] },
  { id:"CCG014", source:"CCG", name:"Scout Hall Woman", address:"", phone:"", area:"", jobType:"Garden Maintenance", price:null, frequency:"Monthly", lastVisit:"", nextVisit:"", revisitStatus:"confirmed", visitPending:false, notes:"", paymentStatus:"unpaid", duration:60, chrisCut:true, active:true, visitHistory:[], tags:[] },
  { id:"CCG015", source:"CCG", name:"Fourth View Road Granny", address:"10 Fourth View Road", phone:"", area:"", jobType:"Garden Maintenance", price:null, frequency:"Monthly", lastVisit:"", nextVisit:"", revisitStatus:"confirmed", visitPending:false, notes:"", paymentStatus:"unpaid", duration:60, chrisCut:true, active:true, visitHistory:[], tags:[] },
  { id:"CCG016", source:"CCG", name:"Langwill Place Client", address:"5 Langwill Place, Currie, EH14 5NL", phone:"", area:"Currie", jobType:"Paving & Groundworks", price:null, frequency:"One-off", lastVisit:"", nextVisit:"", revisitStatus:"needs-confirmed", visitPending:false, notes:"Grout and power wash", paymentStatus:"unpaid", duration:180, chrisCut:true, active:true, visitHistory:[], tags:[] },
  { id:"CCG017", source:"CCG", name:"Marchbank Drive Client", address:"57 Marchbank Drive, Balerno, EH14 7ER", phone:"", area:"Balerno", jobType:"Garden Maintenance", price:null, frequency:"Monthly", lastVisit:"", nextVisit:"", revisitStatus:"needs-confirmed", visitPending:false, notes:"", paymentStatus:"unpaid", duration:90, chrisCut:true, active:true, visitHistory:[], tags:[] },
  { id:"CCG018", source:"CCG", name:"Johnsburn Road Client", address:"19 Johnsburn Road, Balerno, EH14 7DY", phone:"", area:"Balerno", jobType:"Garden Maintenance", price:null, frequency:"Monthly", lastVisit:"", nextVisit:"", revisitStatus:"needs-confirmed", visitPending:false, notes:"", paymentStatus:"unpaid", duration:90, chrisCut:true, active:true, visitHistory:[], tags:[] },
  { id:"CCG019", source:"CCG", name:"Riccarton Drive Client", address:"5 Riccarton Drive, Currie, EH14 5PN", phone:"", area:"Currie", jobType:"Garden Maintenance", price:null, frequency:"Monthly", lastVisit:"", nextVisit:"", revisitStatus:"needs-confirmed", visitPending:false, notes:"", paymentStatus:"unpaid", duration:90, chrisCut:true, active:true, visitHistory:[], tags:[] },
  { id:"MG001", source:"MG", name:"Russell Cairns", address:"20 Colinton Mains Grove, Edinburgh, EH13 9DQ", phone:"+44 7766 040233", area:"Colinton", jobType:"Garden Maintenance", price:null, frequency:"Fortnightly", lastVisit:"2026-04-28", nextVisit:"2026-05-26", revisitStatus:"confirmed", visitPending:false, notes:"", paymentStatus:"paid", duration:90, chrisCut:false, active:true, visitHistory:["2026-04-28"], tags:[] },
  { id:"MG002", source:"MG", name:"Clare", address:"45 Willow Grove, Craigshill, Livingston, EH54 5NA", phone:"+44 7364 200875", area:"Livingston", jobType:"Garden Maintenance", price:null, frequency:"Fortnightly", lastVisit:"2026-05-01", nextVisit:"2026-05-29", revisitStatus:"confirmed", visitPending:false, notes:"", paymentStatus:"paid", duration:90, chrisCut:false, active:true, visitHistory:["2026-05-01"], tags:[] },
  { id:"MG003", source:"MG", name:"Scott Murray", address:"4 Shiel Path, East Calder, EH53 0FS", phone:"", area:"East Calder", jobType:"Garden Maintenance", price:null, frequency:"Monthly", lastVisit:"2026-05-05", nextVisit:"2026-06-05", revisitStatus:"needs-confirmed", visitPending:false, notes:"", paymentStatus:"unpaid", duration:90, chrisCut:false, active:true, visitHistory:["2026-05-05"], tags:[] },
  { id:"MG004", source:"MG", name:"Krishna Arekapudi", address:"83 Brodie Place, EH53 0TY", phone:"+44 7714 196963", area:"Livingston", jobType:"Garden Maintenance", price:null, frequency:"Monthly", lastVisit:"2026-05-04", nextVisit:"2026-06-04", revisitStatus:"needs-confirmed", visitPending:false, notes:"", paymentStatus:"unpaid", duration:60, chrisCut:false, active:true, visitHistory:["2026-05-04"], tags:[] },
  { id:"MG005", source:"MG", name:"Mikey G", address:"311 Broomhouse Road, Edinburgh, EH11 3UP", phone:"+44 7398 237243", area:"Broomhouse", jobType:"Garden Maintenance", price:null, frequency:"Fortnightly", lastVisit:"2026-05-08", nextVisit:"2026-05-22", revisitStatus:"confirmed", visitPending:false, notes:"", paymentStatus:"paid", duration:60, chrisCut:false, active:true, visitHistory:["2026-05-08"], tags:[] },
  { id:"MG006", source:"MG", name:"Sally McGregor", address:"43 Bonaly Crescent, Colinton, EH13 0EP", phone:"+44 7561 801380", area:"Colinton", jobType:"Garden Maintenance", price:null, frequency:"Fortnightly", lastVisit:"2026-05-11", nextVisit:"2026-05-25", revisitStatus:"confirmed", visitPending:false, notes:"", paymentStatus:"paid", duration:120, chrisCut:false, active:true, visitHistory:["2026-05-11"], tags:[] },
  { id:"MG007", source:"MG", name:"Saravanan", address:"Lilybank Road, Ratho Station, EH28", phone:"+91 95919 98168", area:"Ratho Station", jobType:"Garden Maintenance", price:null, frequency:"Monthly", lastVisit:"2026-05-06", nextVisit:"2026-06-06", revisitStatus:"needs-confirmed", visitPending:false, notes:"", paymentStatus:"unpaid", duration:90, chrisCut:false, active:true, visitHistory:["2026-05-06"], tags:[] },
  { id:"MG008", source:"MG", name:"Kirsty Campbell", address:"3 Lilybank Lane, Ratho Station, EH28 8AW", phone:"", area:"Ratho Station", jobType:"Garden Maintenance", price:null, frequency:"Monthly", lastVisit:"2026-05-15", nextVisit:"2026-06-15", revisitStatus:"needs-confirmed", visitPending:false, notes:"", paymentStatus:"unpaid", duration:60, chrisCut:false, active:true, visitHistory:["2026-05-15"], tags:[] },
  { id:"MG009", source:"MG", name:"poorimitlaprakash", address:"20 Lilybank Road, Ratho Station, EH28", phone:"+44 7448 950184", area:"Ratho Station", jobType:"Garden Maintenance", price:null, frequency:"Monthly", lastVisit:"2026-05-15", nextVisit:"2026-06-15", revisitStatus:"needs-confirmed", visitPending:false, notes:"", paymentStatus:"unpaid", duration:60, chrisCut:false, active:true, visitHistory:["2026-05-15"], tags:[] },
];

const fmtPrice = (p) => p == null ? "TBC" : `£${p}`;
const fmtDate = (d) => { if (!d) return "—"; return new Date(d+"T12:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}); };
const TODAY = new Date().toISOString().slice(0,10);
const PIN = "2607";

const FREQ_DAYS = { "Weekly":7, "Every 2 Weeks":14, "Every 3 Weeks":21, "Every 4 Weeks":28, "Monthly":30, "One-off":null };
const FREQUENCIES = Object.keys(FREQ_DAYS);
const JOB_TYPES = ["Garden Maintenance","Grounds Maintenance","Lawn Care","Hedge Trimming","Paving & Groundworks","Tree Work","One-off Clear","Other"];

const addDays = (dateStr, days) => {
  const d = new Date(dateStr+"T12:00:00");
  d.setDate(d.getDate()+days);
  return d.toISOString().slice(0,10);
};

const nextVisitDate = (lastVisit, frequency) => {
  if (!lastVisit) return "";
  const days = FREQ_DAYS[frequency];
  if (!days) return "";
  return addDays(lastVisit, days);
};

const isOverdue = (nextVisit) => {
  if (!nextVisit) return false;
  return nextVisit < TODAY;
};

const daysSince = (dateStr) => {
  if (!dateStr) return null;
  const diff = new Date(TODAY) - new Date(dateStr+"T12:00:00");
  return Math.floor(diff / (1000*60*60*24));
};

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

const s = {
  app: { fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display',system-ui,sans-serif", background:"#f8fafc", minHeight:"100vh", paddingBottom:84 },
  topbar: { background:"#fff", borderBottom:"1px solid #e8ecf0", padding:"12px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100, backdropFilter:"blur(12px)" },
  content: { padding:"16px", maxWidth:600, margin:"0 auto" },
  bottomnav: { position:"fixed", bottom:0, left:0, right:0, background:"rgba(255,255,255,0.96)", borderTop:"1px solid #e8ecf0", display:"flex", justifyContent:"space-around", padding:"8px 0 20px", zIndex:100, backdropFilter:"blur(12px)" },
  navbtn: { background:"none", border:"none", display:"flex", flexDirection:"column", alignItems:"center", gap:2, fontSize:10, fontWeight:600, cursor:"pointer", padding:"4px 16px", transition:"all .15s" },
  card: { background:"#fff", borderRadius:16, border:"1px solid #e8ecf0", padding:"16px", marginBottom:12, transition:"all .2s" },
  cardPressed: { background:"#f8fafc", transform:"scale(0.99)" },
  badge: (color,bg) => ({ display:"inline-flex", alignItems:"center", gap:4, background:bg, color:color, borderRadius:20, padding:"3px 10px", fontSize:11, fontWeight:700 }),
  btn: (bg,color,full) => ({ background:bg, color:color, border:"none", borderRadius:12, padding:"11px 18px", fontWeight:600, fontSize:14, cursor:"pointer", display:"inline-flex", alignItems:"center", justifyContent:"center", gap:6, transition:"all .15s", width:full?"100%":"auto" }),
  btnSm: (bg,color) => ({ background:bg, color:color, border:"none", borderRadius:9, padding:"7px 13px", fontWeight:600, fontSize:12, cursor:"pointer", display:"inline-flex", alignItems:"center", gap:4, transition:"all .15s" }),
  input: { background:"#f4f6f8", border:"1.5px solid transparent", borderRadius:11, padding:"11px 13px", fontSize:15, width:"100%", outline:"none", boxSizing:"border-box", transition:"border .15s", fontFamily:"inherit" },
  inputFocus: { border:"1.5px solid #1a6b3c" },
  label: { fontSize:12, fontWeight:700, color:"#64748b", display:"block", marginBottom:5, textTransform:"uppercase", letterSpacing:0.4 },
  row: { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:"1px solid #f1f5f9" },
  sectionTitle: { fontSize:13, fontWeight:800, color:"#94a3b8", textTransform:"uppercase", letterSpacing:0.8, marginBottom:12, marginTop:4 },
  divider: { height:1, background:"#f1f5f9", margin:"16px 0" },
};

const RevisitBadge = ({status, pending, overdue}) => {
  if (overdue) return <span style={s.badge(RED,"#fee2e2")}>🔴 Overdue</span>;
  if (pending) return <span style={s.badge(AMBER,"#fef9c3")}>⏳ Pending</span>;
  const m = { confirmed:{c:"#16a34a",bg:"#dcfce7",l:"✓ Confirmed"}, "needs-confirmed":{c:AMBER,bg:"#fef9c3",l:"⚠ Unconfirmed"}, no:{c:RED,bg:"#fee2e2",l:"✗ No Revisit"} };
  const st = m[status]||m.confirmed;
  return <span style={s.badge(st.c,st.bg)}>{st.l}</span>;
};

const Toast = ({msg, type}) => (
  <div style={{ position:"fixed", bottom:100, left:"50%", transform:"translateX(-50%)", background:type==="error"?RED:G, color:"#fff", padding:"11px 22px", borderRadius:14, fontSize:13, fontWeight:700, zIndex:9999, whiteSpace:"nowrap", boxShadow:"0 4px 20px rgba(0,0,0,.2)", animation:"fadeUp .2s ease" }}>
    {msg}
  </div>
);

const LockScreen = ({ onUnlock }) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleKey = (k) => {
    if (k==="del") { setPin(p=>p.slice(0,-1)); setError(false); return; }
    const next = pin+k;
    setPin(next);
    if (next.length===4) {
      if (next===PIN) { onUnlock(); }
      else {
        setError(true); setShake(true);
        setTimeout(()=>{ setPin(""); setError(false); setShake(false); }, 700);
      }
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:"#0a1a0f", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:32 }}>
      <div style={{ fontSize:48, marginBottom:8 }}>🌿</div>
      <div style={{ fontFamily:"inherit", fontWeight:800, fontSize:26, color:"#fff", marginBottom:4 }}>moegardens</div>
      <div style={{ fontSize:13, color:"#4a7c5a", marginBottom:40, fontWeight:500 }}>Business Manager</div>
      <div style={{ display:"flex", gap:18, marginBottom:44, ...(shake?{animation:"shake .4s ease"}:{}) }}>
        {[0,1,2,3].map(i=>(
          <div key={i} style={{ width:16, height:16, borderRadius:"50%", background:pin.length>i?(error?RED:G):"#1e3a28", transition:"background .15s", boxShadow:pin.length>i?`0 0 8px ${error?RED:G}40`:"none" }}/>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, width:260 }}>
        {["1","2","3","4","5","6","7","8","9","","0","del"].map((k,i)=>(
          k==="" ? <div key={i}/> :
          <button key={i} onClick={()=>handleKey(k)} style={{ background:"#122318", color:"#fff", border:"1px solid #1e3a28", borderRadius:16, padding:"20px 0", fontSize:k==="del"?18:24, fontWeight:700, cursor:"pointer", transition:"all .1s", fontFamily:"inherit" }}>
            {k==="del"?"⌫":k}
          </button>
        ))}
      </div>
      {error&&<div style={{ color:RED, marginTop:24, fontWeight:700, fontSize:13 }}>Incorrect PIN — try again</div>}
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}} @keyframes fadeUp{from{opacity:0;transform:translate(-50%,8px)}to{opacity:1;transform:translate(-50%,0)}}`}</style>
    </div>
  );
};
const blankClient = (count) => ({
  id:`MG${String(count+1).padStart(3,"0")}`,
  source:"MG", name:"", address:"", phone:"", area:"",
  jobType:"Garden Maintenance", price:"", frequency:"Fortnightly",
  lastVisit:"", nextVisit:"", revisitStatus:"confirmed",
  visitPending:false, notes:"", accessNotes:"", paymentStatus:"unpaid",
  duration:60, chrisCut:false, active:true, visitHistory:[], tags:[],
});

export default function App() {
  const [unlocked, setUnlocked] = useState(false);
  const [clients, setClients] = useState(loadClients);
  const [page, setPage] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterArea, setFilterArea] = useState("all");
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [addingClient, setAddingClient] = useState(false);
  const [newClient, setNewClient] = useState(null);
  const [toast, setToast] = useState(null);
  const [showAreaGroups, setShowAreaGroups] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(()=>{ saveClients(clients); },[clients]);

  const showToast = (msg, type="success") => {
    setToast({msg,type});
    setTimeout(()=>setToast(null),2500);
  };

  const activeClients = clients.filter(c=>c.active!==false);
  const needsConfirmed = activeClients.filter(c=>c.revisitStatus==="needs-confirmed"||c.visitPending);
  const overdueClients = activeClients.filter(c=>isOverdue(c.nextVisit)&&!c.visitPending);
  const areas = [...new Set(activeClients.map(c=>c.area).filter(Boolean))].sort();

  const totalRevenue = activeClients.filter(c=>c.paymentStatus==="paid"&&c.price).reduce((s,c)=>s+(c.price||0),0);
  const outstanding = activeClients.filter(c=>c.paymentStatus==="unpaid"&&c.price).reduce((s,c)=>s+(c.price||0),0);
  const chrisCut = Math.round(totalRevenue*0.3);

  const filtered = activeClients.filter(c=>{
    const q=search.toLowerCase();
    const mq=!q||c.name.toLowerCase().includes(q)||(c.area||"").toLowerCase().includes(q)||(c.address||"").toLowerCase().includes(q)||(c.phone||"").includes(q);
    const ms=filterStatus==="all"||c.revisitStatus===filterStatus||(filterStatus==="pending"&&c.visitPending)||(filterStatus==="overdue"&&isOverdue(c.nextVisit));
    const ma=filterArea==="all"||(c.area||"")=== filterArea;
    return mq&&ms&&ma;
  });

  const markVisited = (id) => {
    setClients(prev=>prev.map(c=>{
      if(c.id!==id) return c;
      const next=nextVisitDate(TODAY,c.frequency);
      const history=[...(c.visitHistory||[]),TODAY];
      return {...c,lastVisit:TODAY,nextVisit:next,visitPending:true,revisitStatus:"needs-confirmed",visitHistory:history};
    }));
    setSelected(null);
    showToast("✅ Visit recorded!");
  };

  const confirmRevisit = (id) => {
    setClients(prev=>prev.map(c=>c.id===id?{...c,visitPending:false,revisitStatus:"confirmed"}:c));
    showToast("✅ Revisit confirmed!");
  };

  const archiveClient = (id) => {
    setClients(prev=>prev.map(c=>c.id===id?{...c,active:false}:c));
    setSelected(null);
    showToast("Client archived");
  };

  const deleteClient = (id) => {
    setClients(prev=>prev.filter(c=>c.id!==id));
    setSelected(null);
    setConfirmDelete(null);
    showToast("Client removed");
  };

  const saveEdit = (updated) => {
    setClients(prev=>prev.map(c=>c.id===updated.id?{...updated,price:updated.price?parseFloat(updated.price):null}:c));
    setEditing(null);
    setSelected(updated);
    showToast("✅ Saved!");
  };

  const saveNewClient = () => {
    if(!newClient.name.trim()){showToast("Please enter a name","error");return;}
    const toSave={...newClient,price:newClient.price?parseFloat(newClient.price):null};
    setClients(prev=>[...prev,toSave]);
    setAddingClient(false);
    setNewClient(null);
    showToast("✅ Client added!");
  };

  const markPaid = (id) => {
    setClients(prev=>prev.map(c=>c.id===id?{...c,paymentStatus:"paid"}:c));
    showToast("💷 Marked as paid!");
  };

  if(!unlocked) return <LockScreen onUnlock={()=>setUnlocked(true)}/>;

  const InputField = ({label, field, type="text", options, obj, setObj}) => {
    const [focused,setFocused]=useState(false);
    return (
      <div style={{marginBottom:14}}>
        <label style={s.label}>{label}</label>
        {type==="select"?(
          <select style={{...s.input,...(focused?s.inputFocus:{})}} value={obj[field]||""} onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)} onChange={e=>setObj(p=>({...p,[field]:e.target.value}))}>
            {options.map(o=><option key={o} value={o}>{o}</option>)}
          </select>
        ):type==="textarea"?(
          <textarea style={{...s.input,...(focused?s.inputFocus:{}),resize:"vertical",minHeight:80}} value={obj[field]||""} onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)} onChange={e=>setObj(p=>({...p,[field]:e.target.value}))} placeholder={label}/>
        ):(
          <input type={type} style={{...s.input,...(focused?s.inputFocus:{})}} value={obj[field]||""} onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)} onChange={e=>setObj(p=>({...p,[field]:e.target.value}))} placeholder={label}/>
        )}
      </div>
    );
  };

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
        <div style={s.sectionTitle}>Job Details</div>
        <InputField label="Job Type" field="jobType" type="select" options={JOB_TYPES} obj={obj} setObj={setObj}/>
        <InputField label="Price (£)" field="price" type="number" obj={obj} setObj={setObj}/>
        <InputField label="Frequency" field="frequency" type="select" options={FREQUENCIES} obj={obj} setObj={setObj}/>
        <InputField label="Duration (mins)" field="duration" type="number" obj={obj} setObj={setObj}/>
        <InputField label="Source" field="source" type="select" options={["MG","CCG"]} obj={obj} setObj={setObj}/>
        <InputField label="Payment Status" field="paymentStatus" type="select" options={["unpaid","paid","part-paid"]} obj={obj} setObj={setObj}/>
        <InputField label="Revisit Status" field="revisitStatus" type="select" options={["confirmed","needs-confirmed","no"]} obj={obj} setObj={setObj}/>
        <div style={{display:"flex",alignItems:"center",gap:10,marginTop:4,cursor:"pointer"}} onClick={()=>setObj(p=>({...p,chrisCut:!p.chrisCut}))}>
          <div style={{width:22,height:22,borderRadius:7,border:`2px solid ${obj.chrisCut?G:"#cbd5e1"}`,background:obj.chrisCut?G:"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s"}}>
            {obj.chrisCut&&<span style={{color:"#fff",fontSize:13}}>✓</span>}
          </div>
          <span style={{fontSize:14,fontWeight:500}}>Chris 30% cut applies</span>
        </div>
      </div>
      <div style={s.card}>
        <div style={s.sectionTitle}>Schedule</div>
        <InputField label="Last Visit" field="lastVisit" type="date" obj={obj} setObj={setObj}/>
        <InputField label="Next Visit" field="nextVisit" type="date" obj={obj} setObj={setObj}/>
      </div>
      <div style={s.card}>
        <div style={s.sectionTitle}>Notes</div>
        <InputField label="General Notes" field="notes" type="textarea" obj={obj} setObj={setObj}/>
        <InputField label="Access Instructions" field="accessNotes" type="textarea" obj={obj} setObj={setObj}/>
      </div>
      <button style={{...s.btn(G,"#fff",true),padding:"14px",fontSize:15,borderRadius:14,marginBottom:8}} onClick={onSave}>
        Save Changes
      </button>
    </div>
  );

  const Dashboard = () => {
    const upcomingDays = 7;
    const upcoming = activeClients.filter(c=>{
      if(!c.nextVisit) return false;
      const diff=(new Date(c.nextVisit+"T12:00:00")-new Date(TODAY+"T12:00:00"))/(1000*60*60*24);
      return diff>=0&&diff<=upcomingDays;
    }).sort((a,b)=>a.nextVisit.localeCompare(b.nextVisit));

    return (
      <div>
        <div style={{marginBottom:16}}>
          <div style={{fontSize:22,fontWeight:800,color:"#0f172a",marginBottom:2}}>Good morning 👋</div>
          <div style={{fontSize:13,color:"#94a3b8",fontWeight:500}}>{new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"})}</div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
          {[
            {label:"Total Clients",val:activeClients.length,color:G,bg:"#f0fdf4"},
            {label:"Pending Revisit",val:needsConfirmed.length,color:AMBER,bg:"#fffbeb"},
            {label:"Overdue",val:overdueClients.length,color:RED,bg:"#fef2f2"},
            {label:"Areas",val:areas.length,color:BLUE,bg:"#eff6ff"},
          ].map(({label,val,color,bg})=>(
            <div key={label} style={{...s.card,background:bg,border:`1px solid ${color}18`,marginBottom:0,padding:"14px 16px"}}>
              <div style={{fontSize:11,fontWeight:700,color,textTransform:"uppercase",letterSpacing:0.5,marginBottom:4}}>{label}</div>
              <div style={{fontSize:32,fontWeight:800,color,lineHeight:1}}>{val}</div>
            </div>
          ))}
        </div>

        <div style={{...s.card,marginBottom:12}}>
          <div style={s.sectionTitle}>💷 Revenue Overview</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
            {[
              {label:"Collected",val:`£${totalRevenue}`,color:"#16a34a"},
              {label:"Outstanding",val:`£${outstanding}`,color:RED},
              {label:"Chris Cut",val:`£${chrisCut}`,color:"#6366f1"},
            ].map(({label,val,color})=>(
              <div key={label} style={{textAlign:"center",padding:"10px 6px",background:"#f8fafc",borderRadius:10}}>
                <div style={{fontSize:10,color:"#94a3b8",fontWeight:700,textTransform:"uppercase",marginBottom:3}}>{label}</div>
                <div style={{fontSize:18,fontWeight:800,color}}>{val}</div>
              </div>
            ))}
          </div>
        </div>

        {overdueClients.length>0&&(
          <div style={{...s.card,borderLeft:`3px solid ${RED}`,marginBottom:12}}>
            <div style={{fontSize:14,fontWeight:800,color:RED,marginBottom:10}}>🔴 Overdue Visits</div>
            {overdueClients.slice(0,3).map(c=>(
              <div key={c.id} style={s.row} onClick={()=>{setSelected(c);setPage("clients");}}>
                <div>
                  <div style={{fontWeight:700,fontSize:13}}>{c.name}</div>
                  <div style={{fontSize:11,color:"#94a3b8"}}>Due: {fmtDate(c.nextVisit)} · {daysSince(c.nextVisit)}d overdue</div>
                </div>
                <span style={{color:"#94a3b8",fontSize:18}}>›</span>
              </div>
            ))}
          </div>
        )}

        {upcoming.length>0&&(
          <div style={{...s.card,marginBottom:12}}>
            <div style={s.sectionTitle}>📅 Upcoming This Week</div>
            {upcoming.slice(0,5).map(c=>(
              <div key={c.id} style={s.row} onClick={()=>{setSelected(c);setPage("clients");}}>
                <div>
                  <div style={{fontWeight:700,fontSize:13}}>{c.name}</div>
                  <div style={{fontSize:11,color:"#94a3b8"}}>{fmtDate(c.nextVisit)} · {c.area||"—"}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontWeight:700,fontSize:13,color:G}}>{fmtPrice(c.price)}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {needsConfirmed.length>0&&(
          <div style={{...s.card,borderLeft:`3px solid ${AMBER}`,marginBottom:12}}>
            <div style={{fontSize:14,fontWeight:800,color:AMBER,marginBottom:10}}>⏳ Needs Confirmation</div>
            {needsConfirmed.slice(0,4).map(c=>(
              <div key={c.id} style={s.row} onClick={()=>{setSelected(c);setPage("clients");}}>
                <div>
                  <div style={{fontWeight:700,fontSize:13}}>{c.name}</div>
                  <div style={{fontSize:11,color:"#94a3b8"}}>{c.area||"—"} · Last: {fmtDate(c.lastVisit)}</div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  {c.phone&&<a href={`tel:${c.phone}`} onClick={e=>e.stopPropagation()} style={{color:G,fontSize:16}}>📞</a>}
                  <span style={{color:"#94a3b8",fontSize:18}}>›</span>
                </div>
              </div>
            ))}
            {needsConfirmed.length>4&&<div style={{fontSize:12,color:"#94a3b8",marginTop:8,fontWeight:600}}>+{needsConfirmed.length-4} more → Revisits tab</div>}
          </div>
        )}

        <div style={s.card}>
          <div style={s.sectionTitle}>Quick Actions</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {[
              {label:"➕ Add Client",bg:G,color:"#fff",fn:()=>{setNewClient(blankClient(clients.length));setAddingClient(true);setPage("clients");}},
              {label:"👥 All Clients",bg:"#f1f5f9",color:"#0f172a",fn:()=>setPage("clients")},
              {label:"⏳ Revisits",bg:"#fffbeb",color:AMBER,fn:()=>setPage("revisits")},
              {label:"💷 Payments",bg:"#f0fdf4",color:G,fn:()=>setPage("payments")},
            ].map(({label,bg,color,fn})=>(
              <button key={label} style={{...s.btn(bg,color),borderRadius:12,padding:"12px",fontSize:13,fontWeight:700}} onClick={fn}>{label}</button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const ClientList = () => {
    const byArea = areas.reduce((acc,area)=>{
      acc[area]=filtered.filter(c=>c.area===area);
      return acc;
    },{});
    const noArea = filtered.filter(c=>!c.area);

    return (
      <div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{fontSize:13,color:"#94a3b8",fontWeight:600}}>{filtered.length} clients</div>
          <div style={{display:"flex",gap:8}}>
            <button style={s.btnSm(showAreaGroups?"#0f172a":"#f1f5f9",showAreaGroups?"#fff":"#64748b")} onClick={()=>setShowAreaGroups(p=>!p)}>
              🗺 Areas
            </button>
            <button style={s.btnSm(G,"#fff")} onClick={()=>{setNewClient(blankClient(clients.length));setAddingClient(true);}}>
              ➕ Add
            </button>
          </div>
        </div>

        <input style={{...s.input,marginBottom:10}} placeholder="🔍 Search name, area, address, phone..." value={search} onChange={e=>setSearch(e.target.value)}/>

        <div style={{display:"flex",gap:6,marginBottom:12,overflowX:"auto",paddingBottom:4}}>
          {[["all","All"],["confirmed","✓ Confirmed"],["needs-confirmed","⚠ Pending"],["overdue","🔴 Overdue"]].map(([val,label])=>(
            <button key={val} onClick={()=>setFilterStatus(val)} style={{...s.btnSm(filterStatus===val?G:"#f1f5f9",filterStatus===val?"#fff":"#64748b"),whiteSpace:"nowrap"}}>
              {label}
            </button>
          ))}
        </div>

        {areas.length>0&&(
          <div style={{display:"flex",gap:6,marginBottom:12,overflowX:"auto",paddingBottom:4}}>
            {["all",...areas].map(a=>(
              <button key={a} onClick={()=>setFilterArea(a)} style={{...s.btnSm(filterArea===a?"#0f172a":"#f1f5f9",filterArea===a?"#fff":"#64748b"),whiteSpace:"nowrap",fontSize:11}}>
                {a==="all"?"All Areas":a}
              </button>
            ))}
          </div>
        )}

        {showAreaGroups ? (
          <div>
            {[...areas.map(area=>({area,clients:filtered.filter(c=>c.area===area)})),{area:"No Area",clients:filtered.filter(c=>!c.area)}].filter(g=>g.clients.length>0).map(({area,clients:gc})=>(
              <div key={area} style={{marginBottom:16}}>
                <div style={{fontSize:12,fontWeight:800,color:"#94a3b8",textTransform:"uppercase",letterSpacing:0.6,marginBottom:8,display:"flex",justifyContent:"space-between"}}>
                  <span>📍 {area}</span>
                  <span>{gc.length} clients · £{gc.filter(c=>c.price).reduce((s,c)=>s+(c.price||0),0)}</span>
                </div>
                {gc.map(c=><ClientRow key={c.id} c={c}/>)}
              </div>
            ))}
          </div>
        ) : (
          filtered.map(c=><ClientRow key={c.id} c={c}/>)
        )}
        {filtered.length===0&&<div style={{textAlign:"center",padding:"48px 0",color:"#94a3b8"}}><div style={{fontSize:36,marginBottom:8}}>🌿</div><div style={{fontWeight:600}}>No clients found</div></div>}
      </div>
    );
  };

  const ClientRow = ({c}) => {
    const overdue = isOverdue(c.nextVisit)&&!c.visitPending;
    return (
      <div style={{...s.card,marginBottom:8,borderLeft:overdue?`3px solid ${RED}`:c.visitPending?`3px solid ${AMBER}`:"1px solid #e8ecf0",cursor:"pointer"}} onClick={()=>setSelected(c)}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
          <div style={{fontWeight:700,fontSize:15,flex:1,paddingRight:8}}>{c.name}</div>
          <RevisitBadge status={c.revisitStatus} pending={c.visitPending} overdue={overdue}/>
        </div>
        <div style={{fontSize:12,color:"#94a3b8",marginBottom:8}}>{c.area||c.address?.slice(0,35)||"No address"}</div>
        <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
          <span style={{fontSize:11,background:"#f1f5f9",borderRadius:6,padding:"2px 8px",fontWeight:600}}>{c.source==="MG"?"🌿 MG":"🔧 CCG"}</span>
          <span style={{fontSize:11,background:"#f1f5f9",borderRadius:6,padding:"2px 8px",fontWeight:600}}>{c.frequency}</span>
          {c.lastVisit&&<span style={{fontSize:11,color:"#94a3b8"}}>Last: {fmtDate(c.lastVisit)}</span>}
          <span style={{fontWeight:800,color:G,marginLeft:"auto",fontSize:14}}>{fmtPrice(c.price)}</span>
        </div>
      </div>
    );
  };

  const ClientDetail = ({c}) => {
    const overdue=isOverdue(c.nextVisit)&&!c.visitPending;
    const myRevenue=c.price||0;
    const chrisCutAmt=c.chrisCut?Math.round(myRevenue*0.3):0;
    const myEarnings=myRevenue-chrisCutAmt;
    return (
      <div>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
          <button style={s.btnSm("#f1f5f9","#0f172a")} onClick={()=>setSelected(null)}>← Back</button>
          <button style={s.btnSm(G,"#fff")} onClick={()=>setEditing({...c,price:c.price!=null?String(c.price):""})}>✏️ Edit</button>
          <button style={s.btnSm("#fff2f2",RED)} onClick={()=>setConfirmDelete(c.id)}>🗑</button>
          <button style={s.btnSm("#f1f5f9","#64748b")} onClick={()=>archiveClient(c.id)}>Archive</button>
        </div>

        <div style={{...s.card,borderLeft:`4px solid ${G}`,marginBottom:12}}>
          <div style={{fontSize:22,fontWeight:800,marginBottom:8}}>{c.name}</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            <RevisitBadge status={c.revisitStatus} pending={c.visitPending} overdue={overdue}/>
            <span style={s.badge("#64748b","#f1f5f9")}>{c.source==="MG"?"🌿 Moegardens":"🔧 Chris Cavens"}</span>
          </div>
        </div>

        <div style={s.card}>
          <div style={s.sectionTitle}>Contact</div>
          {[["📞 Phone",c.phone||"—"],["📍 Area",c.area||"—"],["🏠 Address",c.address||"—"]].map(([k,v])=>(
            <div key={k} style={s.row}>
              <span style={{fontSize:13,color:"#64748b",fontWeight:600}}>{k}</span>
              {k==="📞 Phone"&&c.phone?<a href={`tel:${c.phone}`} style={{fontSize:13,fontWeight:700,color:G,textDecoration:"none"}}>{v}</a>:<span style={{fontSize:13,fontWeight:600,maxWidth:200,textAlign:"right"}}>{v}</span>}
            </div>
          ))}
        </div>

        <div style={s.card}>
          <div style={s.sectionTitle}>Job Details</div>
          {[["Job Type",c.jobType],["Frequency",c.frequency],["Duration",`${c.duration} mins`],["Last Visit",fmtDate(c.lastVisit)],["Next Visit",fmtDate(c.nextVisit)]].map(([k,v])=>(
            <div key={k} style={s.row}>
              <span style={{fontSize:13,color:"#64748b",fontWeight:600}}>{k}</span>
              <span style={{fontSize:13,fontWeight:700}}>{v}</span>
            </div>
          ))}
        </div>

        <div style={s.card}>
          <div style={s.sectionTitle}>💷 Payment</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
            {[{l:"Price",v:`£${c.price||"TBC"}`,c:"#0f172a"},{l:"Chris Cut",v:c.chrisCut?`£${chrisCutAmt}`:"N/A",c:"#6366f1"},{l:"My Earnings",v:c.price?`£${myEarnings}`:"TBC",c:G}].map(({l,v,c:col})=>(
              <div key={l} style={{textAlign:"center",background:"#f8fafc",borderRadius:10,padding:"10px 6px"}}>
                <div style={{fontSize:10,color:"#94a3b8",fontWeight:700,textTransform:"uppercase",marginBottom:3}}>{l}</div>
                <div style={{fontSize:17,fontWeight:800,color:col}}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:8}}>
            {c.paymentStatus!=="paid"&&<button style={s.btnSm("#dcfce7","#16a34a")} onClick={()=>markPaid(c.id)}>✓ Mark Paid</button>}
            <span style={s.badge(c.paymentStatus==="paid"?"#16a34a":RED,c.paymentStatus==="paid"?"#dcfce7":"#fee2e2")}>{c.paymentStatus==="paid"?"✓ Paid":"Unpaid"}</span>
          </div>
        </div>

        {(c.notes||c.accessNotes)&&(
          <div style={s.card}>
            <div style={s.sectionTitle}>Notes</div>
            {c.notes&&<div style={{marginBottom:10}}><div style={{fontSize:11,fontWeight:700,color:"#94a3b8",marginBottom:4}}>GENERAL</div><div style={{fontSize:13,lineHeight:1.5}}>{c.notes}</div></div>}
            {c.accessNotes&&<div><div style={{fontSize:11,fontWeight:700,color:"#94a3b8",marginBottom:4}}>ACCESS</div><div style={{fontSize:13,lineHeight:1.5}}>{c.accessNotes}</div></div>}
          </div>
        )}

        {c.visitHistory?.length>0&&(
          <div style={s.card}>
            <div style={s.sectionTitle}>Visit History ({c.visitHistory.length})</div>
            {[...c.visitHistory].reverse().slice(0,8).map((d,i)=>(
              <div key={i} style={{...s.row,fontSize:13}}>
                <span style={{fontWeight:600}}>📅 {fmtDate(d)}</span>
                <span style={{color:"#94a3b8",fontSize:11}}>{daysSince(d)} days ago</span>
              </div>
            ))}
          </div>
        )}

        <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:4,marginBottom:16}}>
          <button style={{...s.btn("#dcfce7","#16a34a"),borderRadius:12}} onClick={()=>markVisited(c.id)}>✅ Mark Visited Today</button>
          {(c.visitPending||c.revisitStatus==="needs-confirmed")&&(
            <button style={{...s.btn(G,"#fff"),borderRadius:12}} onClick={()=>confirmRevisit(c.id)}>🔄 Confirm Revisit</button>
          )}
          {c.phone&&<a href={`tel:${c.phone}`} style={{...s.btn("#f1f5f9","#0f172a"),borderRadius:12,textDecoration:"none"}}>📞 Call</a>}
        </div>
      </div>
    );
  };

  const Revisits = () => (
    <div>
      <div style={{fontSize:13,color:"#94a3b8",fontWeight:600,marginBottom:16}}>{needsConfirmed.length} clients pending · {overdueClients.length} overdue</div>
      {overdueClients.length>0&&(
        <div style={{marginBottom:16}}>
          <div style={s.sectionTitle}>🔴 Overdue</div>
          {overdueClients.map(c=>(
            <div key={c.id} style={{...s.card,borderLeft:`3px solid ${RED}`,marginBottom:8}}>
              <div style={{fontWeight:700,fontSize:15,marginBottom:2}}>{c.name}</div>
              <div style={{fontSize:12,color:"#94a3b8",marginBottom:6}}>{c.area||"—"} · Due: {fmtDate(c.nextVisit)} · <span style={{color:RED,fontWeight:700}}>{daysSince(c.nextVisit)}d overdue</span></div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {c.phone&&<a href={`tel:${c.phone}`} style={{...s.btnSm(G,"#fff"),textDecoration:"none"}}>📞 Call</a>}
                <button style={s.btnSm("#dcfce7","#16a34a")} onClick={()=>markVisited(c.id)}>✅ Mark Visited</button>
                <button style={s.btnSm("#f1f5f9","#0f172a")} onClick={()=>setSelected(c)}>View</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {needsConfirmed.length>0&&(
        <div>
          <div style={s.sectionTitle}>⏳ Pending Confirmation</div>
          {needsConfirmed.map(c=>(
            <div key={c.id} style={{...s.card,borderLeft:`3px solid ${AMBER}`,marginBottom:8}}>
              <div style={{fontWeight:700,fontSize:15,marginBottom:2}}>{c.name}</div>
              <div style={{fontSize:12,color:"#94a3b8",marginBottom:6}}>{c.address||c.area||"—"}</div>
              <div style={{fontSize:12,color:"#64748b",marginBottom:10}}>Last: <strong>{fmtDate(c.lastVisit)}</strong> · Next: <strong>{fmtDate(c.nextVisit)}</strong></div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {c.phone&&<a href={`tel:${c.phone}`} style={{...s.btnSm(G,"#fff"),textDecoration:"none"}}>📞 Call</a>}
                <button style={s.btnSm("#dcfce7","#16a34a")} onClick={()=>confirmRevisit(c.id)}>✅ Confirm</button>
                <button style={s.btnSm("#f1f5f9","#0f172a")} onClick={()=>{setSelected(c);setPage("clients");}}>View</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {needsConfirmed.length===0&&overdueClients.length===0&&(
        <div style={{textAlign:"center",padding:"60px 0",color:"#94a3b8"}}>
          <div style={{fontSize:48,marginBottom:12}}>✅</div>
          <div style={{fontWeight:700,fontSize:16}}>All revisits confirmed!</div>
          <div style={{fontSize:13,marginTop:4}}>You're all up to date</div>
        </div>
      )}
    </div>
  );

  const Payments = () => {
    const withPrice=activeClients.filter(c=>c.price);
    const paid=withPrice.filter(c=>c.paymentStatus==="paid");
    const unpaid=withPrice.filter(c=>c.paymentStatus!=="paid");
    const totalPaid=paid.reduce((s,c)=>s+(c.price||0),0);
    const totalUnpaid=unpaid.reduce((s,c)=>s+(c.price||0),0);
    const chrisTotal=Math.round(totalPaid*0.3);
    const myTotal=totalPaid-chrisTotal;
    return (
      <div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
          <div style={{...s.card,borderLeft:`4px solid #16a34a`,marginBottom:0}}><div style={{fontSize:11,fontWeight:700,color:"#16a34a",textTransform:"uppercase",letterSpacing:0.5,marginBottom:4}}>Collected</div><div style={{fontSize:28,fontWeight:800,color:"#16a34a"}}>£{totalPaid}</div></div>
          <div style={{...s.card,borderLeft:`4px solid ${RED}`,marginBottom:0}}><div style={{fontSize:11,fontWeight:700,color:RED,textTransform:"uppercase",letterSpacing:0.5,marginBottom:4}}>Outstanding</div><div style={{fontSize:28,fontWeight:800,color:RED}}>£{totalUnpaid}</div></div>
        </div>
        <div style={{...s.card,marginBottom:16}}>
          <div style={s.sectionTitle}>Breakdown</div>
          {[["My Earnings",`£${myTotal}`,"#16a34a"],["Chris Cut (30%)",`£${chrisTotal}`,"#6366f1"],["TBC Clients",`${activeClients.filter(c=>!c.price).length} clients`,"#94a3b8"]].map(([k,v,c])=>(
            <div key={k} style={s.row}><span style={{fontSize:13,color:"#64748b",fontWeight:600}}>{k}</span><span style={{fontSize:14,fontWeight:800,color:c}}>{v}</span></div>
          ))}
        </div>
        {unpaid.length>0&&(
          <div style={{marginBottom:16}}>
            <div style={s.sectionTitle}>⚠️ Outstanding ({unpaid.length})</div>
            {unpaid.map(c=>(
              <div key={c.id} style={{...s.card,marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div><div style={{fontWeight:700,fontSize:14}}>{c.name}</div><div style={{fontSize:11,color:"#94a3b8"}}>{c.area||"—"} · {c.frequency}</div></div>
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
              <div key={c.id} style={{...s.card,marginBottom:8,opacity:0.7}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{fontWeight:600,fontSize:13}}>{c.name}</div>
                  <span style={{fontWeight:800,color:"#16a34a"}}>£{c.price}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const navItems=[
    {id:"dashboard",icon:"🏠",label:"Home"},
    {id:"clients",icon:"👥",label:"Clients"},
    {id:"revisits",icon:"⏳",label:"Revisits"},
    {id:"payments",icon:"💷",label:"Payments"},
  ];

  const pageTitles={dashboard:"moegardens 🌿",clients:"Clients",revisits:"Revisits",payments:"Payments"};

  return (
    <div style={s.app}>
      <style>{`*{box-sizing:border-box;-webkit-tap-highlight-color:transparent} input,select,textarea{font-family:inherit} @keyframes fadeUp{from{opacity:0;transform:translate(-50%,8px)}to{opacity:1;transform:translate(-50%,0)}}`}</style>
      <div style={s.topbar}>
        <div style={{fontWeight:800,fontSize:18,color:G,letterSpacing:-0.5}}>{pageTitles[page]||"moegardens 🌿"}</div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {needsConfirmed.length>0&&<span style={s.badge(AMBER,"#fffbeb")}>⏳ {needsConfirmed.length}</span>}
          {overdueClients.length>0&&<span style={s.badge(RED,"#fef2f2")}>🔴 {overdueClients.length}</span>}
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

      {toast&&<Toast msg={toast.msg} type={toast.type}/>}
    </div>
  );
}
