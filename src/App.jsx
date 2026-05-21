import { useState } from "react";

const CLIENTS = [
  { id:"CCG001", source:"CCG", name:"Louise Bridget", address:"Balerno Rugby Club", phone:"", area:"Balerno", jobType:"Grounds Maintenance", price:50, frequency:"Monthly", lastVisit:"2026-05-01", nextVisit:"2026-05-26", revisitStatus:"confirmed", visitPending:false, notes:"", paymentStatus:"paid", duration:120, chrisCut:true },
  { id:"CCG002", source:"CCG", name:"Daniel Sloss", address:"", phone:"", area:"", jobType:"Garden Maintenance", price:null, frequency:"Monthly", lastVisit:"", nextVisit:"", revisitStatus:"confirmed", visitPending:false, notes:"Price TBC", paymentStatus:"unpaid", duration:60, chrisCut:true },
  { id:"CCG003", source:"CCG", name:"Bravelaw Estate", address:"", phone:"+1 (713) 256-3101", area:"", jobType:"Grounds Maintenance", price:300, frequency:"Monthly", lastVisit:"", nextVisit:"", revisitStatus:"confirmed", visitPending:false, notes:"", paymentStatus:"paid", duration:480, chrisCut:true },
  { id:"CCG004", source:"CCG", name:"Chris Mum", address:"", phone:"", area:"", jobType:"Garden Maintenance", price:20, frequency:"Monthly", lastVisit:"", nextVisit:"", revisitStatus:"confirmed", visitPending:false, notes:"", paymentStatus:"paid", duration:60, chrisCut:true },
  { id:"CCG005", source:"CCG", name:"Chris", address:"", phone:"", area:"", jobType:"Garden Maintenance", price:30, frequency:"Monthly", lastVisit:"", nextVisit:"", revisitStatus:"confirmed", visitPending:false, notes:"", paymentStatus:"paid", duration:60, chrisCut:true },
  { id:"CCG006", source:"CCG", name:"Forrester Flats", address:"", phone:"", area:"Forrester", jobType:"Grounds Maintenance", price:null, frequency:"Monthly", lastVisit:"", nextVisit:"", revisitStatus:"confirmed", visitPending:false, notes:"Price TBC", paymentStatus:"unpaid", duration:180, chrisCut:true },
  { id:"CCG007", source:"CCG", name:"Chris Granny", address:"", phone:"", area:"", jobType:"Garden Maintenance", price:40, frequency:"Monthly", lastVisit:"", nextVisit:"", revisitStatus:"confirmed", visitPending:false, notes:"", paymentStatus:"paid", duration:90, chrisCut:true },
  { id:"CCG008", source:"CCG", name:"Parkhead", address:"", phone:"", area:"Parkhead", jobType:"Grounds Maintenance", price:40, frequency:"Monthly", lastVisit:"", nextVisit:"", revisitStatus:"confirmed", visitPending:false, notes:"", paymentStatus:"paid", duration:120, chrisCut:true },
  { id:"CCG009", source:"CCG", name:"Jane", address:"13 Langton View, East Calder, EH53 0LE", phone:"", area:"East Calder", jobType:"Garden Maintenance", price:30, frequency:"Monthly", lastVisit:"", nextVisit:"", revisitStatus:"confirmed", visitPending:false, notes:"", paymentStatus:"paid", duration:90, chrisCut:true },
  { id:"CCG010", source:"CCG", name:"Margret", address:"", phone:"", area:"", jobType:"Garden Maintenance", price:null, frequency:"Monthly", lastVisit:"", nextVisit:"", revisitStatus:"confirmed", visitPending:false, notes:"", paymentStatus:"unpaid", duration:60, chrisCut:true },
  { id:"CCG011", source:"CCG", name:"Illi", address:"", phone:"", area:"", jobType:"Garden Maintenance", price:null, frequency:"Monthly", lastVisit:"", nextVisit:"", revisitStatus:"confirmed", visitPending:false, notes:"", paymentStatus:"unpaid", duration:60, chrisCut:true },
  { id:"CCG012", source:"CCG", name:"Palm", address:"", phone:"", area:"", jobType:"Garden Maintenance", price:null, frequency:"Monthly", lastVisit:"", nextVisit:"", revisitStatus:"confirmed", visitPending:false, notes:"", paymentStatus:"unpaid", duration:60, chrisCut:true },
  { id:"CCG013", source:"CCG", name:"Marrion", address:"", phone:"", area:"", jobType:"Garden Maintenance", price:null, frequency:"Monthly", lastVisit:"", nextVisit:"", revisitStatus:"confirmed", visitPending:false, notes:"", paymentStatus:"unpaid", duration:60, chrisCut:true },
  { id:"CCG014", source:"CCG", name:"Scout Hall Woman", address:"", phone:"", area:"", jobType:"Garden Maintenance", price:null, frequency:"Monthly", lastVisit:"", nextVisit:"", revisitStatus:"confirmed", visitPending:false, notes:"", paymentStatus:"unpaid", duration:60, chrisCut:true },
  { id:"CCG015", source:"CCG", name:"Fourth View Road Granny", address:"10 Fourth View Road", phone:"", area:"", jobType:"Garden Maintenance", price:null, frequency:"Monthly", lastVisit:"", nextVisit:"", revisitStatus:"confirmed", visitPending:false, notes:"", paymentStatus:"unpaid", duration:60, chrisCut:true },
  { id:"CCG016", source:"CCG", name:"Langwill Place Client", address:"5 Langwill Place, Currie, EH14 5NL", phone:"", area:"Currie", jobType:"Paving & Groundworks", price:null, frequency:"One-off", lastVisit:"", nextVisit:"", revisitStatus:"needs-confirmed", visitPending:false, notes:"Grout and power wash", paymentStatus:"unpaid", duration:180, chrisCut:true },
  { id:"CCG017", source:"CCG", name:"Marchbank Drive Client", address:"57 Marchbank Drive, Balerno, EH14 7ER", phone:"", area:"Balerno", jobType:"Garden Maintenance", price:null, frequency:"Monthly", lastVisit:"", nextVisit:"", revisitStatus:"needs-confirmed", visitPending:false, notes:"", paymentStatus:"unpaid", duration:90, chrisCut:true },
  { id:"CCG018", source:"CCG", name:"Johnsburn Road Client", address:"19 Johnsburn Road, Balerno, EH14 7DY", phone:"", area:"Balerno", jobType:"Garden Maintenance", price:null, frequency:"Monthly", lastVisit:"", nextVisit:"", revisitStatus:"needs-confirmed", visitPending:false, notes:"", paymentStatus:"unpaid", duration:90, chrisCut:true },
  { id:"CCG019", source:"CCG", name:"Riccarton Drive Client", address:"5 Riccarton Drive, Currie, EH14 5PN", phone:"", area:"Currie", jobType:"Garden Maintenance", price:null, frequency:"Monthly", lastVisit:"", nextVisit:"", revisitStatus:"needs-confirmed", visitPending:false, notes:"", paymentStatus:"unpaid", duration:90, chrisCut:true },
  { id:"MG001", source:"MG", name:"Russell Cairns", address:"20 Colinton Mains Grove, Edinburgh, EH13 9DQ", phone:"+44 7766 040233", area:"Colinton", jobType:"Garden Maintenance", price:null, frequency:"Fortnightly", lastVisit:"2026-04-28", nextVisit:"2026-05-26", revisitStatus:"confirmed", visitPending:false, notes:"", paymentStatus:"paid", duration:90, chrisCut:false },
  { id:"MG002", source:"MG", name:"Clare", address:"45 Willow Grove, Craigshill, Livingston, EH54 5NA", phone:"+44 7364 200875", area:"Livingston", jobType:"Garden Maintenance", price:null, frequency:"Fortnightly", lastVisit:"2026-05-01", nextVisit:"2026-05-29", revisitStatus:"confirmed", visitPending:false, notes:"", paymentStatus:"paid", duration:90, chrisCut:false },
  { id:"MG003", source:"MG", name:"Scott Murray", address:"4 Shiel Path, East Calder, EH53 0FS", phone:"", area:"East Calder", jobType:"Garden Maintenance", price:null, frequency:"Monthly", lastVisit:"2026-05-05", nextVisit:"2026-06-05", revisitStatus:"needs-confirmed", visitPending:false, notes:"", paymentStatus:"unpaid", duration:90, chrisCut:false },
  { id:"MG004", source:"MG", name:"Krishna Arekapudi", address:"83 Brodie Place, EH53 0TY", phone:"+44 7714 196963", area:"Livingston", jobType:"Garden Maintenance", price:null, frequency:"Monthly", lastVisit:"2026-05-04", nextVisit:"2026-06-04", revisitStatus:"needs-confirmed", visitPending:false, notes:"", paymentStatus:"unpaid", duration:60, chrisCut:false },
  { id:"MG005", source:"MG", name:"Mikey G", address:"311 Broomhouse Road, Edinburgh, EH11 3UP", phone:"+44 7398 237243", area:"Broomhouse", jobType:"Garden Maintenance", price:null, frequency:"Fortnightly", lastVisit:"2026-05-08", nextVisit:"2026-05-22", revisitStatus:"confirmed", visitPending:false, notes:"", paymentStatus:"paid", duration:60, chrisCut:false },
  { id:"MG006", source:"MG", name:"Sally McGregor", address:"43 Bonaly Crescent, Colinton, EH13 0EP", phone:"+44 7561 801380", area:"Colinton", jobType:"Garden Maintenance", price:null, frequency:"Fortnightly", lastVisit:"2026-05-11", nextVisit:"2026-05-25", revisitStatus:"confirmed", visitPending:false, notes:"", paymentStatus:"paid", duration:120, chrisCut:false },
  { id:"MG007", source:"MG", name:"Saravanan", address:"Lilybank Road, Ratho Station, EH28", phone:"+91 95919 98168", area:"Ratho Station", jobType:"Garden Maintenance", price:null, frequency:"Monthly", lastVisit:"2026-05-06", nextVisit:"2026-06-06", revisitStatus:"needs-confirmed", visitPending:false, notes:"", paymentStatus:"unpaid", duration:90, chrisCut:false },
  { id:"MG008", source:"MG", name:"Kirsty Campbell", address:"3 Lilybank Lane, Ratho Station, EH28 8AW", phone:"", area:"Ratho Station", jobType:"Garden Maintenance", price:null, frequency:"Monthly", lastVisit:"2026-05-15", nextVisit:"2026-06-15", revisitStatus:"needs-confirmed", visitPending:false, notes:"", paymentStatus:"unpaid", duration:60, chrisCut:false },
  { id:"MG009", source:"MG", name:"poorimitlaprakash", address:"20 Lilybank Road, Ratho Station, EH28", phone:"+44 7448 950184", area:"Ratho Station", jobType:"Garden Maintenance", price:null, frequency:"Monthly", lastVisit:"2026-05-15", nextVisit:"2026-06-15", revisitStatus:"needs-confirmed", visitPending:false, notes:"", paymentStatus:"unpaid", duration:60, chrisCut:false },
];

const fmtPrice = (p) => p == null ? "TBC" : `£${p}`;
const fmtDate = (d) => { if (!d) return "—"; return new Date(d+"T12:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}); };
const TODAY = new Date().toISOString().slice(0,10);
const LOGO = "/12C57DA1-A499-4588-9F33-95F22BA7C03A.png";
const PIN = "2607";

const addDays = (dateStr, days) => {
  const d = new Date(dateStr+"T12:00:00");
  d.setDate(d.getDate()+days);
  return d.toISOString().slice(0,10);
};
const nextVisitDate = (lastVisit, frequency) => {
  if (!lastVisit) return "";
  const map = { Weekly:7, Fortnightly:14, Monthly:30, "One-off":null };
  const days = map[frequency];
  if (!days) return "";
  return addDays(lastVisit, days);
};

const G = "#1a6b3c";
const styles = {
  app: { fontFamily:"system-ui,sans-serif", background:"#f8fafc", minHeight:"100vh", paddingBottom:80 },
  topbar: { background:"#fff", borderBottom:"1.5px solid #e2e8f0", padding:"10px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100 },
  logo: { fontWeight:800, fontSize:18, color:G, letterSpacing:-0.5 },
  content: { padding:"16px" },
  bottomnav: { position:"fixed", bottom:0, left:0, right:0, background:"#fff", borderTop:"1.5px solid #e2e8f0", display:"flex", justifyContent:"space-around", padding:"8px 0 16px", zIndex:100 },
  navbtn: { background:"none", border:"none", display:"flex", flexDirection:"column", alignItems:"center", gap:3, fontSize:10, fontWeight:600, cursor:"pointer", padding:"4px 8px" },
  card: { background:"#fff", borderRadius:14, border:"1.5px solid #e2e8f0", padding:"14px 16px", marginBottom:10 },
  badge: (color,bg) => ({ display:"inline-block", background:bg, color:color, borderRadius:20, padding:"2px 9px", fontSize:11, fontWeight:600 }),
  btn: (bg,color) => ({ background:bg, color:color, border:"none", borderRadius:10, padding:"9px 16px", fontWeight:600, fontSize:13, cursor:"pointer", display:"inline-flex", alignItems:"center", gap:6 }),
  input: { background:"#f1f5f9", border:"1.5px solid #e2e8f0", borderRadius:10, padding:"9px 12px", fontSize:14, width:"100%", outline:"none", boxSizing:"border-box", marginBottom:10 },
  label: { fontSize:12, fontWeight:600, color:"#64748b", display:"block", marginBottom:4 },
  row: { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:"1px solid #f1f5f9" },
};

const RevisitBadge = ({status, pending}) => {
  if (pending) return <span style={styles.badge("#b45309","#fef9c3")}>⏳ Pending Revisit</span>;
  const m = { confirmed:{c:"#16a34a",bg:"#dcfce7",l:"✅ Confirmed"}, "needs-confirmed":{c:"#b45309",bg:"#fef9c3",l:"⚠️ Needs Confirmed"}, no:{c:"#dc2626",bg:"#fee2e2",l:"❌ No Revisit"} };
  const s = m[status]||m.confirmed;
  return <span style={styles.badge(s.c,s.bg)}>{s.l}</span>;
};

const blankClient = (count) => ({
  id:`MG${String(count+1).padStart(3,"0")}`,
  source:"MG", name:"", address:"", phone:"", area:"",
  jobType:"Garden Maintenance", price:"", frequency:"Monthly",
  lastVisit:"", nextVisit:"", revisitStatus:"confirmed",
  visitPending:false, notes:"", paymentStatus:"unpaid",
  duration:60, chrisCut:false,
});

const LockScreen = ({ onUnlock }) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const handleKey = (k) => {
    if (k === "del") {
      setPin(p => p.slice(0,-1));
      setError(false);
      return;
    }
    const next = pin + k;
    setPin(next);
    if (next.length === 4) {
      if (next === PIN) {
        onUnlock();
      } else {
        setError(true);
        setTimeout(() => { setPin(""); setError(false); }, 800);
      }
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:"#0f1a14", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24 }}>
      <img src={LOGO} alt="moegardens" style={{ width:160, marginBottom:24, borderRadius:16 }}/>
      <div style={{ fontSize:14, color:"#94a3b8", marginBottom:32, fontWeight:500 }}>Enter PIN to continue</div>
      <div style={{ display:"flex", gap:16, marginBottom:40 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ width:18, height:18, borderRadius:"50%", background: pin.length > i ? (error ? "#ef4444" : G) : "#2d3748", transition:"background .2s" }}/>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, width:240 }}>
        {["1","2","3","4","5","6","7","8","9","","0","del"].map((k,i) => (
          k === "" ? <div key={i}/> :
          <button key={i} onClick={() => handleKey(k)} style={{ background: k==="del" ? "#1e293b" : "#1a2e1e", color:"#fff", border:"none", borderRadius:14, padding:"18px 0", fontSize: k==="del" ? 16 : 22, fontWeight:700, cursor:"pointer", transition:"background .1s" }}>
            {k === "del" ? "⌫" : k}
          </button>
        ))}
      </div>
      {error && <div style={{ color:"#ef4444", marginTop:20, fontWeight:600, fontSize:13 }}>Incorrect PIN</div>}
    </div>
  );
};

export default function App() {
  const [unlocked, setUnlocked] = useState(false);
  const [clients, setClients] = useState(CLIENTS);
  const [page, setPage] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selected, setSelected] = useState(null);
  const [addingClient, setAddingClient] = useState(false);
  const [newClient, setNewClient] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(null),2500); };
  const needsConfirmed = clients.filter(c => c.revisitStatus==="needs-confirmed" || c.visitPending);
  const active = clients.filter(c => c.revisitStatus !== "no");

  const filtered = clients.filter(c => {
    const q = search.toLowerCase();
    const mq = !q || c.name.toLowerCase().includes(q) || (c.area||"").toLowerCase().includes(q);
    const ms = filterStatus==="all" || c.revisitStatus===filterStatus || (filterStatus==="pending" && c.visitPending);
    return mq && ms;
  });

  const markVisited = (id) => {
    setClients(prev => prev.map(c => {
      if (c.id !== id) return c;
      const next = nextVisitDate(TODAY, c.frequency);
      return { ...c, lastVisit:TODAY, nextVisit:next, visitPending:true, revisitStatus:"needs-confirmed" };
    }));
    setSelected(null);
    showToast("✅ Visit recorded — moved to Revisits");
  };

  const confirmRevisit = (id) => {
    setClients(prev => prev.map(c => c.id===id ? {...c, visitPending:false, revisitStatus:"confirmed"} : c));
    showToast("✅ Revisit confirmed!");
  };

  const saveNewClient = () => {
    if (!newClient.name.trim()) { showToast("⚠️ Please enter a name"); return; }
    setClients(prev => [...prev, { ...newClient, price: newClient.price ? parseFloat(newClient.price) : null }]);
    setAddingClient(false);
    setNewClient(null);
    showToast("✅ Client added!");
  };

  const Field = ({label, field, type="text", options}) => (
    <div style={{marginBottom:12}}>
      <label style={styles.label}>{label}</label>
      {type==="select" ? (
        <select style={styles.input} value={newClient[field]||""} onChange={e=>setNewClient(p=>({...p,[field]:e.target.value}))}>
          {options.map(o=><option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} style={styles.input} value={newClient[field]||""} onChange={e=>setNewClient(p=>({...p,[field]:e.target.value}))} placeholder={label}/>
      )}
    </div>
  );

  if (!unlocked) return <LockScreen onUnlock={() => setUnlocked(true)} />;

  const AddClient = () => (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
        <button style={styles.btn("#f1f5f9","#0f172a")} onClick={()=>{setAddingClient(false);setNewClient(null);}}>← Back</button>
        <div style={{fontSize:20,fontWeight:800}}>New Client</div>
      </div>
      <div style={styles.card}>
        <div style={{fontSize:13,fontWeight:700,color:G,marginBottom:12}}>Contact Details</div>
        <Field label="Full Name *" field="name"/>
        <Field label="Address" field="address"/>
        <Field label="Phone Number" field="phone" type="tel"/>
        <Field label="Area / Location" field="area"/>
      </div>
      <div style={styles.card}>
        <div style={{fontSize:13,fontWeight:700,color:G,marginBottom:12}}>Job Details</div>
        <Field label="Job Type" field="jobType" type="select" options={["Garden Maintenance","Grounds Maintenance","Lawn Care","Hedge Trimming","Paving & Groundworks","Tree Work","One-off Clear","Other"]}/>
        <Field label="Price (£)" field="price" type="number"/>
        <Field label="Visit Frequency" field="frequency" type="select" options={["Weekly","Fortnightly","Monthly","One-off"]}/>
        <Field label="Source" field="source" type="select" options={["MG","CCG"]}/>
      </div>
      <div style={styles.card}>
        <div style={{fontSize:13,fontWeight:700,color:G,marginBottom:12}}>Notes</div>
        <Field label="Notes" field="notes"/>
        <Field label="Access Instructions" field="accessInstructions"/>
      </div>
      <button style={{...styles.btn(G,"#fff"),width:"100%",justifyContent:"center",padding:"14px",fontSize:15,marginTop:4}} onClick={saveNewClient}>
        ✅ Save Client
      </button>
    </div>
  );

  const Dashboard = () => (
    <div>
      <div style={{...styles.card,borderLeft:`4px solid ${G}`}}>
        <div style={{fontSize:13,color:"#64748b",marginBottom:4}}>Total Clients</div>
        <div style={{fontSize:36,fontWeight:800,color:G}}>{clients.length}</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
        <div style={styles.card}>
          <div style={{fontSize:12,color:"#64748b"}}>Pending Revisit</div>
          <div style={{fontSize:28,fontWeight:800,color:"#f59e0b"}}>{needsConfirmed.length}</div>
        </div>
        <div style={styles.card}>
          <div style={{fontSize:12,color:"#64748b"}}>Active</div>
          <div style={{fontSize:28,fontWeight:800,color:G}}>{active.length}</div>
        </div>
      </div>
      {needsConfirmed.length>0&&(
        <div style={{...styles.card,marginBottom:10}}>
          <div style={{fontSize:16,fontWeight:700,marginBottom:12}}>⏳ Pending Revisit</div>
          {needsConfirmed.slice(0,5).map(c=>(
            <div key={c.id} style={styles.row} onClick={()=>{setSelected(c);setPage("clients");}}>
              <div>
                <div style={{fontWeight:700,fontSize:14}}>{c.name}</div>
                <div style={{fontSize:12,color:"#64748b"}}>{c.area||"—"} · Last: {fmtDate(c.lastVisit)}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                {c.phone&&<a href={`tel:${c.phone}`} onClick={e=>e.stopPropagation()} style={{color:G}}>📞</a>}
                <span style={{color:"#94a3b8"}}>›</span>
              </div>
            </div>
          ))}
          {needsConfirmed.length>5&&<div style={{fontSize:12,color:"#64748b",marginTop:8}}>+{needsConfirmed.length-5} more</div>}
        </div>
      )}
      <div style={styles.card}>
        <div style={{fontSize:16,fontWeight:700,marginBottom:12}}>Quick Actions</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
          <button style={styles.btn(G,"#fff")} onClick={()=>{setNewClient(blankClient(clients.length));setAddingClient(true);setPage("clients");}}>➕ Add Client</button>
          <button style={styles.btn("#f1f5f9","#0f172a")} onClick={()=>setPage("clients")}>👥 Clients</button>
          <button style={styles.btn("#fef9c3","#b45309")} onClick={()=>setPage("revisits")}>⏳ Revisits</button>
          <button style={styles.btn("#f1f5f9","#0f172a")} onClick={()=>setPage("payments")}>💷 Payments</button>
        </div>
      </div>
    </div>
  );

  const ClientList = () => (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={{fontSize:13,color:"#64748b"}}>{filtered.length} clients</div>
        <button style={styles.btn(G,"#fff")} onClick={()=>{setNewClient(blankClient(clients.length));setAddingClient(true);}}>➕ Add</button>
      </div>
      <input style={styles.input} placeholder="Search clients..." value={search} onChange={e=>setSearch(e.target.value)}/>
      <div style={{display:"flex",gap:8,marginBottom:14,overflowX:"auto",paddingBottom:4}}>
        {[["all","All"],["confirmed","✅ Confirmed"],["needs-confirmed","⚠️ Pending"],["pending","⏳ Visited"]].map(([s,l])=>(
          <button key={s} onClick={()=>setFilterStatus(s)} style={{...styles.btn(filterStatus===s?G:"#f1f5f9",filterStatus===s?"#fff":"#64748b"),whiteSpace:"nowrap",fontSize:12,padding:"6px 12px"}}>
            {l}
          </button>
        ))}
      </div>
      {filtered.map(c=>(
        <div key={c.id} style={styles.card} onClick={()=>setSelected(c)}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
            <div style={{fontWeight:700,fontSize:15}}>{c.name}</div>
            <RevisitBadge status={c.revisitStatus} pending={c.visitPending}/>
          </div>
          <div style={{fontSize:12,color:"#64748b",marginBottom:6}}>{c.area||c.address?.slice(0,30)||"No address"}</div>
          <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
            <span style={{fontSize:12,background:"#f1f5f9",borderRadius:6,padding:"2px 8px"}}>{c.source==="MG"?"🌿 MG":"🔧 CCG"}</span>
            <span style={{fontSize:12,background:"#f1f5f9",borderRadius:6,padding:"2px 8px"}}>{c.frequency}</span>
            {c.lastVisit&&<span style={{fontSize:11,color:"#64748b"}}>Last: {fmtDate(c.lastVisit)}</span>}
            <span style={{fontWeight:700,color:G,marginLeft:"auto"}}>{fmtPrice(c.price)}</span>
          </div>
        </div>
      ))}
    </div>
  );

  const ClientDetail = ({c}) => (
    <div>
      <button style={{...styles.btn("#f1f5f9","#0f172a"),marginBottom:16}} onClick={()=>setSelected(null)}>← Back</button>
      <div style={{...styles.card,borderLeft:`4px solid ${G}`,marginBottom:10}}>
        <div style={{fontSize:20,fontWeight:800,marginBottom:8}}>{c.name}</div>
        <RevisitBadge status={c.revisitStatus} pending={c.visitPending}/>
      </div>
      <div style={styles.card}>
        {[["ID",c.id],["Source",c.source==="MG"?"Moegardens":"Chris Cavens"],["Area",c.area||"—"],["Phone",c.phone||"—"],["Address",c.address||"—"],["Job Type",c.jobType],["Price",fmtPrice(c.price)],["Frequency",c.frequency],["Last Visit",fmtDate(c.lastVisit)],["Next Visit",fmtDate(c.nextVisit)],["Payment",c.paymentStatus],["Duration",`${c.duration} mins`],["Chris Cut",c.chrisCut?"Yes":"No"]].map(([k,v])=>(
          <div key={k} style={styles.row}>
            <span style={{fontSize:13,color:"#64748b"}}>{k}</span>
            <span style={{fontSize:13,fontWeight:600,maxWidth:180,textAlign:"right"}}>{v}</span>
          </div>
        ))}
      </div>
      {c.notes&&<div style={styles.card}><div style={{fontSize:12,color:"#64748b",marginBottom:4}}>Notes</div><div style={{fontSize:13}}>{c.notes}</div></div>}
      <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:4}}>
        <button style={styles.btn("#dcfce7","#16a34a")} onClick={()=>markVisited(c.id)}>✅ Mark Visited Today</button>
        {(c.visitPending||c.revisitStatus==="needs-confirmed")&&(
          <button style={styles.btn(G,"#fff")} onClick={()=>confirmRevisit(c.id)}>🔄 Confirm Revisit</button>
        )}
        {c.phone&&<a href={`tel:${c.phone}`} style={{...styles.btn("#f1f5f9","#0f172a"),textDecoration:"none"}}>📞 Call</a>}
      </div>
    </div>
  );

  const Revisits = () => (
    <div>
      <div style={{fontSize:13,color:"#64748b",marginBottom:14}}>{needsConfirmed.length} clients pending confirmation</div>
      {needsConfirmed.length===0&&(
        <div style={{textAlign:"center",padding:"40px 0",color:"#64748b"}}>
          <div style={{fontSize:40}}>✅</div>
          <div style={{fontWeight:600,marginTop:8}}>All revisits confirmed!</div>
        </div>
      )}
      {needsConfirmed.map(c=>(
        <div key={c.id} style={{...styles.card,borderLeft:"3px solid #f59e0b"}}>
          <div style={{fontWeight:700,fontSize:15,marginBottom:2}}>{c.name}</div>
          <div style={{fontSize:12,color:"#64748b",marginBottom:4}}>{c.address||c.area||"—"}</div>
          <div style={{fontSize:12,color:"#64748b",marginBottom:10}}>
            Last visited: <strong>{fmtDate(c.lastVisit)}</strong> · Next due: <strong>{fmtDate(c.nextVisit)}</strong>
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {c.phone&&<a href={`tel:${c.phone}`} style={{...styles.btn(G,"#fff"),textDecoration:"none",fontSize:12}}>📞 Call</a>}
            <button style={styles.btn("#dcfce7","#16a34a")} onClick={()=>confirmRevisit(c.id)}>✅ Confirm Revisit</button>
            <button style={styles.btn("#f1f5f9","#0f172a")} onClick={()=>{setSelected(c);setPage("clients");}}>View</button>
          </div>
        </div>
      ))}
    </div>
  );

  const Payments = () => {
    const withPrice = clients.filter(c=>c.price);
    const paid = withPrice.filter(c=>c.paymentStatus==="paid");
    const unpaid = withPrice.filter(c=>c.paymentStatus==="unpaid");
    return (
      <div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          <div style={{...styles.card,borderLeft:"4px solid #16a34a"}}><div style={{fontSize:12,color:"#64748b"}}>Collected</div><div style={{fontSize:26,fontWeight:800,color:"#16a34a"}}>£{paid.reduce((s,c)=>s+(c.price||0),0)}</div></div>
          <div style={{...styles.card,borderLeft:"4px solid #dc2626"}}><div style={{fontSize:12,color:"#64748b"}}>Outstanding</div><div style={{fontSize:26,fontWeight:800,color:"#dc2626"}}>£{unpaid.reduce((s,c)=>s+(c.price||0),0)}</div></div>
        </div>
        <div style={{fontSize:16,fontWeight:700,marginBottom:12}}>⚠️ Outstanding</div>
        {unpaid.map(c=>(
          <div key={c.id} style={styles.card}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div><div style={{fontWeight:700}}>{c.name}</div><div style={{fontSize:12,color:"#64748b"}}>{c.area||"—"}</div></div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontWeight:800,color:"#dc2626"}}>£{c.price}</span>
                <button style={styles.btn(G,"#fff")} onClick={()=>setClients(p=>p.map(x=>x.id===c.id?{...x,paymentStatus:"paid"}:x))}>Paid ✓</button>
              </div>
            </div>
          </div>
        ))}
        {unpaid.length===0&&<div style={{textAlign:"center",padding:"20px 0",color:"#64748b"}}>No outstanding payments 🎉</div>}
      </div>
    );
  };

  const navItems = [
    {id:"dashboard",icon:"🏠",label:"Home"},
    {id:"clients",icon:"👥",label:"Clients"},
    {id:"revisits",icon:"⏳",label:"Revisits"},
    {id:"payments",icon:"💷",label:"Payments"},
  ];

  const pageTitles = {dashboard:"Home",clients:"Clients",revisits:"Revisits",payments:"Payments"};

  return (
    <div style={styles.app}>
      <div style={styles.topbar}>
        <img src={LOGO} alt="moegardens" style={{height:40, objectFit:"contain"}}/>

        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {needsConfirmed.length>0&&<span style={styles.badge("#b45309","#fef9c3")}>⏳ {needsConfirmed.length}</span>}
          <img src={LOGO} alt="logo" style={{width:38,height:38,borderRadius:8,objectFit:"contain"}}/>
        </div>
      </div>
      <div style={styles.content}>
        {addingClient ? <AddClient/> :
         selected ? <ClientDetail c={selected}/> :
         page==="dashboard" ? <Dashboard/> :
         page==="clients" ? <ClientList/> :
         page==="revisits" ? <Revisits/> :
         page==="payments" ? <Payments/> : <Dashboard/>}
      </div>
      <div style={styles.bottomnav}>
        {navItems.map(n=>(
          <button key={n.id} style={{...styles.navbtn,color:page===n.id?G:"#94a3b8"}} onClick={()=>{setSelected(null);setAddingClient(false);setNewClient(null);setPage(n.id);}}>
            <span style={{fontSize:20}}>{n.icon}</span>
            <span>{n.label}</span>
          </button>
        ))}
      </div>
      {toast&&<div style={{position:"fixed",bottom:90,left:"50%",transform:"translateX(-50%)",background:"#1a6b3c",color:"#fff",padding:"10px 20px",borderRadius:12,fontSize:13,fontWeight:600,zIndex:9999,whiteSpace:"nowrap"}}>{toast}</div>}
    </div>
  );
}
