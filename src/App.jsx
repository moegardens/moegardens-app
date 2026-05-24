import { useState, useMemo, useEffect, useCallback } from "react";

const SUPABASE_URL = "https://jfynkbgjcjlxncmbcfoi.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmeW5rYmdqY2pseG5jbWJjZm9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2MjE1MzEsImV4cCI6MjA5NTE5NzUzMX0.T-IuErjxUCP3j-zYvjjt3tJKV0PBA6CZ6eZMKxJIoeU";

const db = {
  async getClients() {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/clients?order=name`, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } });
    return r.json();
  },
  async saveClient(c) {
    await fetch(`${SUPABASE_URL}/rest/v1/clients`, {
      method: "POST",
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates" },
      body: JSON.stringify({ id:c.id, source:c.source, name:c.name, address:c.address, phone:c.phone, email:c.email||"", area:c.area, job_type:c.jobType, price:c.price, frequency:c.frequency, last_visit:c.lastVisit, confirmation_status:c.confirmationStatus, is_paused:c.isPaused, notes:c.notes, access_notes:c.accessNotes, duration:c.duration, chris_cut:c.chrisCut, active:c.active, visit_history:c.visitHistory||[], tags:c.tags||[], preferred_contact:c.preferredContact||"phone" })
    });
  },
  async deleteClient(id) {
    await fetch(`${SUPABASE_URL}/rest/v1/clients?id=eq.${id}`, { method: "DELETE", headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } });
  },
  async getVisits() {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/visits?order=visit_date.desc`, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } });
    return r.json();
  },
  async saveVisit(v) {
    await fetch(`${SUPABASE_URL}/rest/v1/visits`, {
      method: "POST",
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates" },
      body: JSON.stringify({ id:v.id, client_id:v.clientId, client_name:v.clientName, visit_date:v.visitDate, price:v.price, payment_status:v.paymentStatus, payment_method:v.paymentMethod, payment_date:v.paymentDate, notes:v.notes||"" })
    });
  },
  async updateVisit(id, updates) {
    await fetch(`${SUPABASE_URL}/rest/v1/visits?id=eq.${id}`, {
      method: "PATCH",
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(updates)
    });
  },
  async getBookings() {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/bookings?order=date`, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } });
    return r.json();
  },
  async saveBooking(b) {
    await fetch(`${SUPABASE_URL}/rest/v1/bookings`, {
      method: "POST",
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates" },
      body: JSON.stringify({ id:b.id, client_id:b.clientId, client_name:b.clientName, booking_type:b.bookingType, job_type:b.jobType, date:b.date, time:b.time, price:b.price, notes:b.notes, status:b.status, payment_status:b.paymentStatus, affects_schedule:b.affectsSchedule, completed_at:b.completedAt, payment_method:b.paymentMethod, payment_date:b.paymentDate })
    });
  },
  async deleteBooking(id) {
    await fetch(`${SUPABASE_URL}/rest/v1/bookings?id=eq.${id}`, { method: "DELETE", headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } });
  },
};

const fromDb = (c) => ({
  id:c.id, source:c.source, name:c.name, address:c.address||"", phone:c.phone||"",
  email:c.email||"", area:c.area||"", jobType:c.job_type||"Garden Maintenance",
  price:c.price, frequency:c.frequency||"Every 2 Weeks", lastVisit:c.last_visit||"",
  confirmationStatus:c.confirmation_status||"confirmed", isPaused:c.is_paused||false,
  notes:c.notes||"", accessNotes:c.access_notes||"", duration:c.duration||60,
  chrisCut:c.chris_cut||false, active:c.active!==false, visitHistory:c.visit_history||[],
  tags:c.tags||[], preferredContact:c.preferred_contact||"phone",
});
const visitFromDb = (v) => ({
  id:v.id, clientId:v.client_id, clientName:v.client_name, visitDate:v.visit_date,
  price:v.price, paymentStatus:v.payment_status||"unpaid", paymentMethod:v.payment_method,
  paymentDate:v.payment_date, notes:v.notes||"",
});
const bookingFromDb = (b) => ({
  id:b.id, clientId:b.client_id, clientName:b.client_name, bookingType:b.booking_type||"one-off",
  jobType:b.job_type||"Garden Maintenance", date:b.date, time:b.time||"",
  price:b.price, notes:b.notes||"", status:b.status||"scheduled",
  paymentStatus:b.payment_status||"unpaid", affectsSchedule:b.affects_schedule||false,
  completedAt:b.completed_at||"", paymentMethod:b.payment_method||"",
  paymentDate:b.payment_date||"",
});

const G="#1a6b3c", AMBER="#f59e0b", RED="#dc2626", ORANGE="#ea580c", BLUE="#3b82f6", PURPLE="#7c3aed";
const PIN="2607";

const FREQ_CONFIG = { "Weekly":{days:7}, "Every 2 Weeks":{days:14}, "Every 3 Weeks":{days:21}, "Every 4 Weeks":{days:28}, "Monthly":{days:30}, "One-off":{days:null} };
const FREQUENCIES = Object.keys(FREQ_CONFIG);
const DEFAULT_FREQ = "Every 2 Weeks";
const JOB_TYPES = ["Garden Maintenance","Grounds Maintenance","Lawn Care","Hedge Trimming","Paving & Groundworks","Tree Work","One-off Clear","Other"];
const PAYMENT_METHODS = ["Cash","Bank Transfer","Card","Other"];
const CONTACT_METHODS = [{value:"phone",label:"📞 Phone Call"},{value:"whatsapp",label:"💬 WhatsApp"},{value:"messenger",label:"💙 Messenger"},{value:"text",label:"💬 Text Message"},{value:"email",label:"📧 Email"},{value:"other",label:"Other"}];
const BOOKING_TYPES = [{value:"one-off",label:"One-off Job",color:BLUE},{value:"revisit",label:"Regular Revisit",color:G},{value:"quote",label:"Quote / Estimate",color:PURPLE},{value:"extra",label:"Extra Job",color:ORANGE},{value:"followup",label:"Follow-up",color:AMBER}];
const BOOKING_TYPE_COLOR = {"one-off":BLUE,"revisit":G,"quote":PURPLE,"extra":ORANGE,"followup":AMBER};

const TODAY = new Date().toISOString().slice(0,10);
const addDays = (d,days) => { if(!d||!days) return ""; const dt=new Date(d+"T12:00:00"); dt.setDate(dt.getDate()+days); return dt.toISOString().slice(0,10); };
const daysBetween = (a,b) => { if(!a||!b) return null; return Math.round((new Date(b+"T12:00:00")-new Date(a+"T12:00:00"))/86400000); };
const fmtDate = (d) => { if(!d) return "—"; return new Date(d+"T12:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}); };
const fmtDateShort = (d) => { if(!d) return "—"; return new Date(d+"T12:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"short"}); };
const fmtPrice = (p) => p==null?"TBC":`£${p}`;
const makeId = () => `id_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;
const thisWeekStart = () => { const d=new Date(TODAY+"T12:00:00"); const day=d.getDay(); d.setDate(d.getDate()-(day===0?6:day-1)); return d.toISOString().slice(0,10); };
const thisMonthStart = () => TODAY.slice(0,7)+"-01";
const getDayName = (d) => new Date(d+"T12:00:00").toLocaleDateString("en-GB",{weekday:"short"});
const getWeekDates = (offset=0) => {
  const base = new Date(TODAY+"T12:00:00");
  const day = base.getDay();
  const monday = new Date(base);
  monday.setDate(base.getDate()-(day===0?6:day-1)+offset*7);
  return Array.from({length:7},(_,i)=>{ const d=new Date(monday); d.setDate(monday.getDate()+i); return d.toISOString().slice(0,10); });
};

const calcSchedule = (c) => {
  const days=FREQ_CONFIG[c.frequency]?.days||14;
  const nextVisit=c.lastVisit?addDays(c.lastVisit,days):"";
  const daysSinceVisit=c.lastVisit?daysBetween(c.lastVisit,TODAY):null;
  const daysUntilDue=nextVisit?daysBetween(TODAY,nextVisit):null;
  const overdueDays=daysUntilDue!==null&&daysUntilDue<0?Math.abs(daysUntilDue):0;
  let visitStatus;
  if(c.isPaused) visitStatus="paused";
  else if(c.confirmationStatus==="pending") visitStatus="pending-confirmation";
  else if(!c.lastVisit) visitStatus="no-date";
  else if(!nextVisit) visitStatus="one-off";
  else if(daysUntilDue<0) visitStatus="overdue";
  else if(daysUntilDue===0) visitStatus="due-today";
  else if(daysUntilDue<=7) visitStatus="due-soon";
  else visitStatus="not-due";
  return {...c,nextVisit,daysSinceVisit,daysUntilDue,overdueDays,visitStatus};
};

const URGENCY=["overdue","due-today","due-soon","pending-confirmation","not-due","no-date","one-off","paused"];
const sortByUrgency=(list)=>[...list].sort((a,b)=>{ const ai=URGENCY.indexOf(a.visitStatus),bi=URGENCY.indexOf(b.visitStatus); if(ai!==bi) return ai-bi; if(a.visitStatus==="overdue") return b.overdueDays-a.overdueDays; return 0; });

const STATUS_CFG = {
  "overdue":{color:RED,bg:"#fee2e2",icon:"🔴",label:"Overdue"},
  "due-today":{color:ORANGE,bg:"#fff7ed",icon:"🟠",label:"Due Today"},
  "due-soon":{color:AMBER,bg:"#fffbeb",icon:"🟡",label:"Due Soon"},
  "not-due":{color:G,bg:"#f0fdf4",icon:"🟢",label:"Not Due Yet"},
  "pending-confirmation":{color:"#6366f1",bg:"#eef2ff",icon:"⏳",label:"Needs Confirmation"},
  "paused":{color:"#94a3b8",bg:"#f8fafc",icon:"⏸",label:"Paused"},
  "no-date":{color:"#94a3b8",bg:"#f8fafc",icon:"📅",label:"No Date Set"},
  "one-off":{color:BLUE,bg:"#eff6ff",icon:"1️⃣",label:"One-off"},
};
const PAY_CFG = {
  unpaid:{color:RED,bg:"#fee2e2",label:"Unpaid"},
  paid:{color:"#16a34a",bg:"#dcfce7",label:"Paid"},
  "part-paid":{color:AMBER,bg:"#fef9c3",label:"Part Paid"},
  waived:{color:"#94a3b8",bg:"#f1f5f9",label:"Waived"},
};

const st = {
  app:{fontFamily:"-apple-system,BlinkMacSystemFont,system-ui,sans-serif",background:"#f8fafc",minHeight:"100vh",paddingBottom:84},
  topbar:{background:"#fff",borderBottom:"1px solid #e8ecf0",padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100},
  content:{padding:"16px",maxWidth:600,margin:"0 auto"},
  bottomnav:{position:"fixed",bottom:0,left:0,right:0,background:"rgba(255,255,255,0.97)",borderTop:"1px solid #e8ecf0",display:"flex",justifyContent:"space-around",padding:"8px 0 20px",zIndex:100},
  navbtn:{background:"none",border:"none",display:"flex",flexDirection:"column",alignItems:"center",gap:2,fontSize:10,fontWeight:600,cursor:"pointer",padding:"4px 10px"},
  card:{background:"#fff",borderRadius:16,border:"1px solid #e8ecf0",padding:"16px",marginBottom:10},
  badge:(color,bg)=>({display:"inline-flex",alignItems:"center",gap:3,background:bg,color:color,borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700}),
  btn:(bg,color,full)=>({background:bg,color:color,border:"none",borderRadius:12,padding:"11px 18px",fontWeight:600,fontSize:14,cursor:"pointer",display:"inline-flex",alignItems:"center",justifyContent:"center",gap:6,width:full?"100%":"auto"}),
  btnSm:(bg,color)=>({background:bg,color:color,border:"none",borderRadius:9,padding:"7px 13px",fontWeight:600,fontSize:12,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:4}),
  input:{background:"#f4f6f8",border:"1.5px solid transparent",borderRadius:11,padding:"11px 13px",fontSize:15,width:"100%",outline:"none",boxSizing:"border-box",fontFamily:"inherit"},
  label:{fontSize:12,fontWeight:700,color:"#64748b",display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:0.4},
  row:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid #f1f5f9"},
  secTitle:{fontSize:12,fontWeight:800,color:"#94a3b8",textTransform:"uppercase",letterSpacing:0.8,marginBottom:12},
};

const StatusBadge=({status})=>{ const c=STATUS_CFG[status]||STATUS_CFG["no-date"]; return <span style={st.badge(c.color,c.bg)}>{c.icon} {c.label}</span>; };
const PayBadge=({status})=>{ const c=PAY_CFG[status]||PAY_CFG.unpaid; return <span style={st.badge(c.color,c.bg)}>{c.label}</span>; };

const TextInput=({label,value,onChange,type="text",placeholder})=>(
  <div style={{marginBottom:14}}>
    <label style={st.label}>{label}</label>
    <input type={type} style={st.input} value={value||""} onChange={e=>onChange(e.target.value)} placeholder={placeholder||label}/>
  </div>
);
const TextArea=({label,value,onChange,placeholder})=>(
  <div style={{marginBottom:14}}>
    <label style={st.label}>{label}</label>
    <textarea style={{...st.input,resize:"vertical",minHeight:70}} value={value||""} onChange={e=>onChange(e.target.value)} placeholder={placeholder||label}/>
  </div>
);
const SelectInput=({label,value,onChange,options})=>(
  <div style={{marginBottom:14}}>
    <label style={st.label}>{label}</label>
    <select style={st.input} value={value||""} onChange={e=>onChange(e.target.value)}>
      {options.map(o=>typeof o==="string"?<option key={o} value={o}>{o}</option>:<option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);
const CheckboxInput=({label,value,onChange})=>(
  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14,cursor:"pointer"}} onClick={()=>onChange(!value)}>
    <div style={{width:22,height:22,borderRadius:7,border:`2px solid ${value?G:"#cbd5e1"}`,background:value?G:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
      {value&&<span style={{color:"#fff",fontSize:13}}>✓</span>}
    </div>
    <span style={{fontSize:14,fontWeight:500}}>{label}</span>
  </div>
);

const ClientForm=({initialData,onSave,onCancel,title})=>{
  const [form,setForm]=useState(()=>({...initialData,price:initialData.price!=null?String(initialData.price):""}));
  const set=useCallback((field)=>(val)=>setForm(prev=>({...prev,[field]:val})),[]);
  const handleSave=()=>onSave({...form,price:form.price?parseFloat(form.price):null});
  return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
        <button style={st.btnSm("#f1f5f9","#0f172a")} onClick={onCancel}>← Back</button>
        <div style={{fontSize:20,fontWeight:800}}>{title}</div>
      </div>
      <div style={st.card}>
        <div style={st.secTitle}>Contact</div>
        <TextInput label="Full Name *" value={form.name} onChange={set("name")}/>
        <TextInput label="Phone" value={form.phone} onChange={set("phone")} type="tel"/>
        <TextArea label="Address" value={form.address} onChange={set("address")}/>
        <TextInput label="Area" value={form.area} onChange={set("area")}/>
        <TextInput label="Email" value={form.email} onChange={set("email")} type="email"/>
        <SelectInput label="Preferred Contact Method" value={form.preferredContact} onChange={set("preferredContact")} options={CONTACT_METHODS}/>
      </div>
      <div style={st.card}>
        <div style={st.secTitle}>Scheduling</div>
        <TextInput label="Last Visit Date" value={form.lastVisit} onChange={set("lastVisit")} type="date"/>
        <SelectInput label="Frequency" value={form.frequency} onChange={set("frequency")} options={FREQUENCIES}/>
        <div style={{background:"#f0fdf4",borderRadius:10,padding:"10px 12px",fontSize:12,color:G,fontWeight:600,marginBottom:14}}>📅 Next visit auto-calculates from last visit + frequency</div>
        <SelectInput label="Confirmation Status" value={form.confirmationStatus} onChange={set("confirmationStatus")} options={[{value:"confirmed",label:"Confirmed"},{value:"pending",label:"Pending"}]}/>
      </div>
      <div style={st.card}>
        <div style={st.secTitle}>Job & Payment</div>
        <SelectInput label="Job Type" value={form.jobType} onChange={set("jobType")} options={JOB_TYPES}/>
        <TextInput label="Price per Visit (£)" value={form.price} onChange={set("price")} type="number"/>
        <TextInput label="Duration (mins)" value={String(form.duration||"")} onChange={set("duration")} type="number"/>
        <SelectInput label="Source" value={form.source} onChange={set("source")} options={[{value:"MG",label:"Moegardens"},{value:"CCG",label:"Chris Cavens"}]}/>
        <CheckboxInput label="Chris 30% cut applies" value={form.chrisCut} onChange={set("chrisCut")}/>
      </div>
      <div style={st.card}>
        <div style={st.secTitle}>Notes</div>
        <TextArea label="General Notes" value={form.notes} onChange={set("notes")}/>
        <TextArea label="Access Instructions" value={form.accessNotes} onChange={set("accessNotes")}/>
      </div>
      <button style={{...st.btn(G,"#fff",true),padding:"14px",fontSize:15,borderRadius:14,marginBottom:16}} onClick={handleSave}>Save Client</button>
    </div>
  );
};

const BookingForm=({initialData,clients,onSave,onCancel,title})=>{
  const [form,setForm]=useState(()=>({
    id:initialData?.id||makeId(), clientId:initialData?.clientId||"",
    clientName:initialData?.clientName||"", bookingType:initialData?.bookingType||"one-off",
    jobType:initialData?.jobType||"Garden Maintenance", date:initialData?.date||TODAY,
    time:initialData?.time||"", price:initialData?.price!=null?String(initialData.price):"",
    notes:initialData?.notes||"", status:initialData?.status||"scheduled",
    paymentStatus:initialData?.paymentStatus||"unpaid", affectsSchedule:initialData?.affectsSchedule||false,
    isNewClient:initialData?.isNewClient||false, newClientName:initialData?.newClientName||"",
  }));
  const set=useCallback((field)=>(val)=>setForm(prev=>({...prev,[field]:val})),[]);

  const selectedClient=clients.find(c=>c.id===form.clientId);
  const handleClientChange=(id)=>{
    const c=clients.find(x=>x.id===id);
    setForm(prev=>({...prev,clientId:id,clientName:c?.name||"",price:c?.price!=null?String(c.price):prev.price,jobType:c?.jobType||prev.jobType}));
  };

  const handleSave=()=>{
    const name=form.isNewClient?form.newClientName:form.clientName;
    if(!name.trim()&&!form.clientId){alert("Please select or enter a client name");return;}
    onSave({...form,clientName:name,price:form.price?parseFloat(form.price):null});
  };

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
        <button style={st.btnSm("#f1f5f9","#0f172a")} onClick={onCancel}>← Back</button>
        <div style={{fontSize:20,fontWeight:800}}>{title||"New Booking"}</div>
      </div>

      <div style={st.card}>
        <div style={st.secTitle}>Booking Type</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:4}}>
          {BOOKING_TYPES.map(t=>(
            <button key={t.value} onClick={()=>set("bookingType")(t.value)} style={{...st.btnSm(form.bookingType===t.value?t.color:"#f1f5f9",form.bookingType===t.value?"#fff":"#64748b")}}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={st.card}>
        <div style={st.secTitle}>Client</div>
        <CheckboxInput label="New / one-off customer" value={form.isNewClient} onChange={set("isNewClient")}/>
        {form.isNewClient?(
          <TextInput label="Customer Name" value={form.newClientName} onChange={set("newClientName")}/>
        ):(
          <SelectInput label="Select Client" value={form.clientId} onChange={handleClientChange} options={[{value:"",label:"— Choose client —"},...clients.map(c=>({value:c.id,label:`${c.name}${c.area?" — "+c.area:""}`}))]}/>
        )}
        {selectedClient&&<div style={{fontSize:12,color:"#94a3b8",marginTop:-8,marginBottom:8}}>📍 {selectedClient.area||"—"} · {selectedClient.phone||"No phone"}</div>}
      </div>

      <div style={st.card}>
        <div style={st.secTitle}>Date & Time</div>
        <TextInput label="Date *" value={form.date} onChange={set("date")} type="date"/>
        <TextInput label="Time (optional)" value={form.time} onChange={set("time")} type="time"/>
      </div>

      <div style={st.card}>
        <div style={st.secTitle}>Job Details</div>
        <SelectInput label="Job Type" value={form.jobType} onChange={set("jobType")} options={JOB_TYPES}/>
        <TextInput label="Price (£)" value={form.price} onChange={set("price")} type="number"/>
        <TextArea label="Notes / Instructions" value={form.notes} onChange={set("notes")}/>
      </div>

      <div style={st.card}>
        <div style={st.secTitle}>Options</div>
        <CheckboxInput label="Update client's last visit when completed" value={form.affectsSchedule} onChange={set("affectsSchedule")}/>
        <SelectInput label="Payment Status" value={form.paymentStatus} onChange={set("paymentStatus")} options={[{value:"unpaid",label:"Unpaid"},{value:"paid",label:"Paid"},{value:"part-paid",label:"Part Paid"}]}/>
      </div>

      <button style={{...st.btn(G,"#fff",true),padding:"14px",fontSize:15,borderRadius:14,marginBottom:16}} onClick={handleSave}>
        Save Booking
      </button>
    </div>
  );
};

const LockScreen=({onUnlock})=>{
  const [pin,setPin]=useState(""); const [error,setError]=useState(false); const [shake,setShake]=useState(false);
  const handleKey=(k)=>{ if(k==="del"){setPin(p=>p.slice(0,-1));setError(false);return;} const next=pin+k;setPin(next); if(next.length===4){if(next===PIN){onUnlock();}else{setError(true);setShake(true);setTimeout(()=>{setPin("");setError(false);setShake(false);},700);}} };
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

const DEFAULT_CLIENTS=[
  {id:"CCG001",source:"CCG",name:"Louise Bridget",address:"Balerno Rugby Club",phone:"",email:"",area:"Balerno",jobType:"Grounds Maintenance",price:50,frequency:"Monthly",lastVisit:"2026-05-01",confirmationStatus:"confirmed",isPaused:false,notes:"",accessNotes:"",duration:120,chrisCut:true,active:true,visitHistory:["2026-05-01"],tags:[],preferredContact:"phone"},
  {id:"CCG002",source:"CCG",name:"Daniel Sloss",address:"",phone:"",email:"",area:"",jobType:"Garden Maintenance",price:null,frequency:"Every 2 Weeks",lastVisit:"",confirmationStatus:"confirmed",isPaused:false,notes:"Price TBC",accessNotes:"",duration:60,chrisCut:true,active:true,visitHistory:[],tags:[],preferredContact:"phone"},
  {id:"CCG003",source:"CCG",name:"Bravelaw Estate",address:"",phone:"+1 (713) 256-3101",email:"",area:"Edinburgh",jobType:"Grounds Maintenance",price:300,frequency:"Monthly",lastVisit:"",confirmationStatus:"confirmed",isPaused:false,notes:"",accessNotes:"",duration:480,chrisCut:true,active:true,visitHistory:[],tags:[],preferredContact:"phone"},
  {id:"CCG004",source:"CCG",name:"Chris Mum",address:"",phone:"",email:"",area:"",jobType:"Garden Maintenance",price:20,frequency:"Every 2 Weeks",lastVisit:"",confirmationStatus:"confirmed",isPaused:false,notes:"",accessNotes:"",duration:60,chrisCut:true,active:true,visitHistory:[],tags:[],preferredContact:"phone"},
  {id:"CCG005",source:"CCG",name:"Chris",address:"",phone:"",email:"",area:"",jobType:"Garden Maintenance",price:30,frequency:"Every 2 Weeks",lastVisit:"",confirmationStatus:"confirmed",isPaused:false,notes:"",accessNotes:"",duration:60,chrisCut:true,active:true,visitHistory:[],tags:[],preferredContact:"phone"},
  {id:"CCG006",source:"CCG",name:"Forrester Flats",address:"",phone:"",email:"",area:"Forrester",jobType:"Grounds Maintenance",price:null,frequency:"Monthly",lastVisit:"",confirmationStatus:"confirmed",isPaused:false,notes:"Price TBC",accessNotes:"",duration:180,chrisCut:true,active:true,visitHistory:[],tags:[],preferredContact:"phone"},
  {id:"CCG007",source:"CCG",name:"Chris Granny",address:"",phone:"",email:"",area:"",jobType:"Garden Maintenance",price:40,frequency:"Every 2 Weeks",lastVisit:"",confirmationStatus:"confirmed",isPaused:false,notes:"",accessNotes:"",duration:90,chrisCut:true,active:true,visitHistory:[],tags:[],preferredContact:"phone"},
  {id:"CCG008",source:"CCG",name:"Parkhead",address:"",phone:"",email:"",area:"Parkhead",jobType:"Grounds Maintenance",price:40,frequency:"Monthly",lastVisit:"",confirmationStatus:"confirmed",isPaused:false,notes:"",accessNotes:"",duration:120,chrisCut:true,active:true,visitHistory:[],tags:[],preferredContact:"phone"},
  {id:"CCG009",source:"CCG",name:"Jane",address:"13 Langton View, East Calder, EH53 0LE",phone:"",email:"",area:"East Calder",jobType:"Garden Maintenance",price:30,frequency:"Every 2 Weeks",lastVisit:"",confirmationStatus:"confirmed",isPaused:false,notes:"",accessNotes:"",duration:90,chrisCut:true,active:true,visitHistory:[],tags:[],preferredContact:"phone"},
  {id:"CCG010",source:"CCG",name:"Margret",address:"",phone:"",email:"",area:"",jobType:"Garden Maintenance",price:null,frequency:"Every 2 Weeks",lastVisit:"",confirmationStatus:"confirmed",isPaused:false,notes:"",accessNotes:"",duration:60,chrisCut:true,active:true,visitHistory:[],tags:[],preferredContact:"phone"},
  {id:"CCG011",source:"CCG",name:"Illi",address:"",phone:"",email:"",area:"",jobType:"Garden Maintenance",price:null,frequency:"Every 2 Weeks",lastVisit:"",confirmationStatus:"confirmed",isPaused:false,notes:"",accessNotes:"",duration:60,chrisCut:true,active:true,visitHistory:[],tags:[],preferredContact:"phone"},
  {id:"CCG012",source:"CCG",name:"Palm",address:"",phone:"",email:"",area:"",jobType:"Garden Maintenance",price:null,frequency:"Every 2 Weeks",lastVisit:"",confirmationStatus:"confirmed",isPaused:false,notes:"",accessNotes:"",duration:60,chrisCut:true,active:true,visitHistory:[],tags:[],preferredContact:"phone"},
  {id:"CCG013",source:"CCG",name:"Marrion",address:"",phone:"",email:"",area:"",jobType:"Garden Maintenance",price:null,frequency:"Every 2 Weeks",lastVisit:"",confirmationStatus:"confirmed",isPaused:false,notes:"",accessNotes:"",duration:60,chrisCut:true,active:true,visitHistory:[],tags:[],preferredContact:"phone"},
  {id:"CCG014",source:"CCG",name:"Scout Hall Woman",address:"",phone:"",email:"",area:"",jobType:"Garden Maintenance",price:null,frequency:"Every 2 Weeks",lastVisit:"",confirmationStatus:"confirmed",isPaused:false,notes:"",accessNotes:"",duration:60,chrisCut:true,active:true,visitHistory:[],tags:[],preferredContact:"phone"},
  {id:"CCG015",source:"CCG",name:"Fourth View Road Granny",address:"10 Fourth View Road",phone:"",email:"",area:"",jobType:"Garden Maintenance",price:null,frequency:"Every 2 Weeks",lastVisit:"",confirmationStatus:"confirmed",isPaused:false,notes:"",accessNotes:"",duration:60,chrisCut:true,active:true,visitHistory:[],tags:[],preferredContact:"phone"},
  {id:"CCG016",source:"CCG",name:"Langwill Place Client",address:"5 Langwill Place, Currie, EH14 5NL",phone:"",email:"",area:"Currie",jobType:"Paving & Groundworks",price:null,frequency:"One-off",lastVisit:"",confirmationStatus:"pending",isPaused:false,notes:"Grout and power wash",accessNotes:"",duration:180,chrisCut:true,active:true,visitHistory:[],tags:[],preferredContact:"phone"},
  {id:"CCG017",source:"CCG",name:"Marchbank Drive Client",address:"57 Marchbank Drive, Balerno, EH14 7ER",phone:"",email:"",area:"Balerno",jobType:"Garden Maintenance",price:null,frequency:"Every 2 Weeks",lastVisit:"",confirmationStatus:"pending",isPaused:false,notes:"",accessNotes:"",duration:90,chrisCut:true,active:true,visitHistory:[],tags:[],preferredContact:"phone"},
  {id:"CCG018",source:"CCG",name:"Johnsburn Road Client",address:"19 Johnsburn Road, Balerno, EH14 7DY",phone:"",email:"",area:"Balerno",jobType:"Garden Maintenance",price:null,frequency:"Every 2 Weeks",lastVisit:"",confirmationStatus:"pending",isPaused:false,notes:"",accessNotes:"",duration:90,chrisCut:true,active:true,visitHistory:[],tags:[],preferredContact:"phone"},
  {id:"CCG019",source:"CCG",name:"Riccarton Drive Client",address:"5 Riccarton Drive, Currie, EH14 5PN",phone:"",email:"",area:"Currie",jobType:"Garden Maintenance",price:null,frequency:"Every 2 Weeks",lastVisit:"",confirmationStatus:"pending",isPaused:false,notes:"",accessNotes:"",duration:90,chrisCut:true,active:true,visitHistory:[],tags:[],preferredContact:"phone"},
  {id:"MG001",source:"MG",name:"Russell Cairns",address:"20 Colinton Mains Grove, Edinburgh, EH13 9DQ",phone:"+44 7766 040233",email:"",area:"Colinton",jobType:"Garden Maintenance",price:null,frequency:"Every 2 Weeks",lastVisit:"2026-04-28",confirmationStatus:"confirmed",isPaused:false,notes:"",accessNotes:"",duration:90,chrisCut:false,active:true,visitHistory:["2026-04-28"],tags:[],preferredContact:"phone"},
  {id:"MG002",source:"MG",name:"Clare",address:"45 Willow Grove, Craigshill, Livingston, EH54 5NA",phone:"+44 7364 200875",email:"",area:"Livingston",jobType:"Garden Maintenance",price:null,frequency:"Every 2 Weeks",lastVisit:"2026-05-01",confirmationStatus:"confirmed",isPaused:false,notes:"",accessNotes:"",duration:90,chrisCut:false,active:true,visitHistory:["2026-05-01"],tags:[],preferredContact:"phone"},
  {id:"MG003",source:"MG",name:"Scott Murray",address:"4 Shiel Path, East Calder, EH53 0FS",phone:"",email:"",area:"East Calder",jobType:"Garden Maintenance",price:null,frequency:"Every 2 Weeks",lastVisit:"2026-05-05",confirmationStatus:"pending",isPaused:false,notes:"",accessNotes:"",duration:90,chrisCut:false,active:true,visitHistory:["2026-05-05"],tags:[],preferredContact:"phone"},
  {id:"MG004",source:"MG",name:"Krishna Arekapudi",address:"83 Brodie Place, EH53 0TY",phone:"+44 7714 196963",email:"",area:"Livingston",jobType:"Garden Maintenance",price:null,frequency:"Every 2 Weeks",lastVisit:"2026-05-04",confirmationStatus:"pending",isPaused:false,notes:"",accessNotes:"",duration:60,chrisCut:false,active:true,visitHistory:["2026-05-04"],tags:[],preferredContact:"phone"},
  {id:"MG005",source:"MG",name:"Mikey G",address:"311 Broomhouse Road, Edinburgh, EH11 3UP",phone:"+44 7398 237243",email:"",area:"Broomhouse",jobType:"Garden Maintenance",price:null,frequency:"Every 2 Weeks",lastVisit:"2026-05-08",confirmationStatus:"confirmed",isPaused:false,notes:"",accessNotes:"",duration:60,chrisCut:false,active:true,visitHistory:["2026-05-08"],tags:[],preferredContact:"phone"},
  {id:"MG006",source:"MG",name:"Sally McGregor",address:"43 Bonaly Crescent, Colinton, EH13 0EP",phone:"+44 7561 801380",email:"",area:"Colinton",jobType:"Garden Maintenance",price:null,frequency:"Every 2 Weeks",lastVisit:"2026-05-11",confirmationStatus:"confirmed",isPaused:false,notes:"",accessNotes:"",duration:120,chrisCut:false,active:true,visitHistory:["2026-05-11"],tags:[],preferredContact:"phone"},
  {id:"MG007",source:"MG",name:"Saravanan",address:"Lilybank Road, Ratho Station, EH28",phone:"+91 95919 98168",email:"",area:"Ratho Station",jobType:"Garden Maintenance",price:null,frequency:"Every 2 Weeks",lastVisit:"2026-05-06",confirmationStatus:"pending",isPaused:false,notes:"",accessNotes:"",duration:90,chrisCut:false,active:true,visitHistory:["2026-05-06"],tags:[],preferredContact:"whatsapp"},
  {id:"MG008",source:"MG",name:"Kirsty Campbell",address:"3 Lilybank Lane, Ratho Station, EH28 8AW",phone:"",email:"",area:"Ratho Station",jobType:"Garden Maintenance",price:null,frequency:"Every 2 Weeks",lastVisit:"2026-05-15",confirmationStatus:"pending",isPaused:false,notes:"",accessNotes:"",duration:60,chrisCut:false,active:true,visitHistory:["2026-05-15"],tags:[],preferredContact:"phone"},
  {id:"MG009",source:"MG",name:"poorimitlaprakash",address:"20 Lilybank Road, Ratho Station, EH28",phone:"+44 7448 950184",email:"",area:"Ratho Station",jobType:"Garden Maintenance",price:null,frequency:"Every 2 Weeks",lastVisit:"2026-05-15",confirmationStatus:"pending",isPaused:false,notes:"",accessNotes:"",duration:60,chrisCut:false,active:true,visitHistory:["2026-05-15"],tags:[],preferredContact:"whatsapp"},
];
const blankClient=(count)=>({id:`MG${String(count+1).padStart(3,"0")}`,source:"MG",name:"",address:"",phone:"",email:"",area:"",jobType:"Garden Maintenance",price:"",frequency:DEFAULT_FREQ,lastVisit:"",confirmationStatus:"confirmed",isPaused:false,notes:"",accessNotes:"",duration:60,chrisCut:false,active:true,visitHistory:[],tags:[],preferredContact:"phone"});

export default function App() {
  const [unlocked,setUnlocked]=useState(false);
  const [rawClients,setRawClients]=useState([]);
  const [visits,setVisits]=useState([]);
  const [bookings,setBookings]=useState([]);
  const [loading,setLoading]=useState(true);
  const [page,setPage]=useState("dashboard");
  const [search,setSearch]=useState("");
  const [filterStatus,setFilterStatus]=useState("all");
  const [filterArea,setFilterArea]=useState("all");
  const [sortBy,setSortBy]=useState("urgency");
  const [payFilter,setPayFilter]=useState("unpaid");
  const [selected,setSelected]=useState(null);
  const [editingClient,setEditingClient]=useState(null);
  const [addingClient,setAddingClient]=useState(false);
  const [addingBooking,setAddingBooking]=useState(false);
  const [editingBooking,setEditingBooking]=useState(null);
  const [selectedBooking,setSelectedBooking]=useState(null);
  const [toast,setToast]=useState(null);
  const [confirmDelete,setConfirmDelete]=useState(null);
  const [showFilters,setShowFilters]=useState(false);
  const [payModal,setPayModal]=useState(null);
  const [calView,setCalView]=useState("week");
  const [calOffset,setCalOffset]=useState(0);

  const clients=useMemo(()=>rawClients.filter(c=>c.active!==false).map(calcSchedule),[rawClients]);
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
  const totalUnpaid=unpaidVisits.reduce((s,v)=>s+(v.price||0),0);
  const totalPaidWeek=weekPaid.reduce((s,v)=>s+(v.price||0),0);
  const totalPaidMonth=monthPaid.reduce((s,v)=>s+(v.price||0),0);

  const todayBookings=bookings.filter(b=>b.date===TODAY&&b.status!=="cancelled");
  const upcomingBookings=bookings.filter(b=>b.date>TODAY&&b.status==="scheduled").sort((a,b)=>a.date.localeCompare(b.date));
  const unpaidBookings=bookings.filter(b=>b.status==="completed"&&b.paymentStatus==="unpaid");

  useEffect(()=>{
    if(!unlocked) return;
    const load=async()=>{
      setLoading(true);
      try {
        const [dbClients,dbVisits,dbBookings]=await Promise.all([db.getClients(),db.getVisits(),db.getBookings()]);
        if(dbClients&&dbClients.length>0){ setRawClients(dbClients.map(fromDb)); }
        else { for(const c of DEFAULT_CLIENTS){ await db.saveClient(c); } setRawClients(DEFAULT_CLIENTS); }
        if(dbVisits&&dbVisits.length>0){ setVisits(dbVisits.map(visitFromDb)); }
        if(dbBookings&&dbBookings.length>0){ setBookings(dbBookings.map(bookingFromDb)); }
      } catch(e){ showToast("Connection error","error"); setRawClients(DEFAULT_CLIENTS); }
      setLoading(false);
    };
    load();
  },[unlocked]);

  const updateClient=async(updated)=>{ setRawClients(prev=>prev.map(c=>c.id===updated.id?updated:c)); await db.saveClient(updated); };

  const markVisited=async(id)=>{
    const client=clients.find(c=>c.id===id);
    if(!client) return;
    const newVisit={id:makeId(),clientId:id,clientName:client.name,visitDate:TODAY,price:client.price||null,paymentStatus:"unpaid",paymentMethod:null,paymentDate:null,notes:""};
    const updatedClient={...client,lastVisit:TODAY,confirmationStatus:"confirmed",isPaused:false,visitHistory:[...(client.visitHistory||[]),TODAY]};
    setVisits(prev=>[...prev,newVisit]);
    await db.saveVisit(newVisit);
    await updateClient(updatedClient);
    setSelected(null);
    showToast("✅ Visit recorded — payment pending");
  };

  const openPayModal=(visit)=>setPayModal({...visit,_method:"Cash"});

  const confirmPayment=async()=>{
    if(!payModal) return;
    setVisits(prev=>prev.map(v=>v.id===payModal.id?{...v,paymentStatus:"paid",paymentMethod:payModal._method,paymentDate:TODAY}:v));
    await db.updateVisit(payModal.id,{payment_status:"paid",payment_method:payModal._method,payment_date:TODAY});
    setPayModal(null);
    showToast("💷 Payment confirmed!");
  };

  const saveBooking=async(data)=>{
    const toSave={...data,price:data.price?parseFloat(data.price):null};
    if(editingBooking){
      setBookings(prev=>prev.map(b=>b.id===toSave.id?toSave:b));
      showToast("✅ Booking updated!");
    } else {
      setBookings(prev=>[...prev,toSave]);
      showToast("✅ Booking added!");
    }
    await db.saveBooking(toSave);
    setAddingBooking(false);
    setEditingBooking(null);
  };

  const completeBooking=async(id)=>{
    const booking=bookings.find(b=>b.id===id);
    if(!booking) return;
    const updated={...booking,status:"completed",completedAt:TODAY};
    setBookings(prev=>prev.map(b=>b.id===id?updated:b));
    await db.saveBooking(updated);
    if(booking.affectsSchedule&&booking.clientId){
      const client=rawClients.find(c=>c.id===booking.clientId);
      if(client){ await updateClient({...client,lastVisit:TODAY,visitHistory:[...(client.visitHistory||[]),TODAY]}); }
    }
    const newVisit={id:makeId(),clientId:booking.clientId||"",clientName:booking.clientName,visitDate:TODAY,price:booking.price||null,paymentStatus:"unpaid",paymentMethod:null,paymentDate:null,notes:booking.notes||""};
    setVisits(prev=>[...prev,newVisit]);
    await db.saveVisit(newVisit);
    setSelectedBooking(null);
    showToast("✅ Job completed — payment pending");
  };

  const cancelBooking=async(id)=>{
    const updated={...bookings.find(b=>b.id===id),status:"cancelled"};
    setBookings(prev=>prev.map(b=>b.id===id?updated:b));
    await db.saveBooking(updated);
    setSelectedBooking(null);
    showToast("Booking cancelled");
  };

  const payBooking=async(id,method)=>{
    const updated={...bookings.find(b=>b.id===id),paymentStatus:"paid",paymentMethod:method,paymentDate:TODAY};
    setBookings(prev=>prev.map(b=>b.id===id?updated:b));
    await db.saveBooking(updated);
    showToast("💷 Paid!");
  };

  const confirmClient=async(id)=>{ const c=rawClients.find(x=>x.id===id); if(c){await updateClient({...c,confirmationStatus:"confirmed"});showToast("✅ Confirmed!");} };
  const pauseClient=async(id)=>{ const c=rawClients.find(x=>x.id===id); if(c){await updateClient({...c,isPaused:true});setSelected(null);showToast("⏸ Paused");} };
  const archiveClient=async(id)=>{ const c=rawClients.find(x=>x.id===id); if(c){await updateClient({...c,active:false});setSelected(null);showToast("Archived");} };
  const deleteClient=async(id)=>{ setRawClients(prev=>prev.filter(c=>c.id!==id)); await db.deleteClient(id); setSelected(null); setConfirmDelete(null); showToast("Removed"); };

  const saveClient=async(data)=>{
    const toSave={...data,price:data.price?parseFloat(data.price):null};
    if(addingClient){ setRawClients(prev=>[...prev,toSave]); await db.saveClient(toSave); setAddingClient(false); showToast("✅ Client added!"); }
    else { await updateClient(toSave); setSelected(calcSchedule(toSave)); setEditingClient(null); showToast("✅ Saved!"); }
  };

  const getContactAction=(c)=>{
    if(!c.phone) return null;
    const clean=c.phone.replace(/\s+/g,"");
    switch(c.preferredContact){
      case "whatsapp": return {url:`https://wa.me/${clean.replace("+","")}`,label:"💬 WhatsApp"};
      case "text": return {url:`sms:${c.phone}`,label:"💬 Text"};
      case "email": return c.email?{url:`mailto:${c.email}`,label:"📧 Email"}:null;
      default: return {url:`tel:${c.phone}`,label:"📞 Call"};
    }
  };

  if(!unlocked) return <LockScreen onUnlock={()=>setUnlocked(true)}/>;
  if(loading) return <div style={{minHeight:"100vh",background:"#f8fafc",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16}}><div style={{fontSize:48}}>🌿</div><div style={{fontWeight:700,fontSize:16,color:G}}>Loading moegardens...</div><div style={{fontSize:13,color:"#94a3b8"}}>Connecting to database</div></div>;
  if(addingClient) return <div style={st.app}><div style={st.content}><ClientForm key="add" initialData={blankClient(rawClients.length)} onSave={saveClient} onCancel={()=>setAddingClient(false)} title="New Client"/></div></div>;
  if(editingClient) return <div style={st.app}><div style={st.content}><ClientForm key={`edit-${editingClient.id}`} initialData={editingClient} onSave={saveClient} onCancel={()=>setEditingClient(null)} title="Edit Client"/></div></div>;
  if(addingBooking) return <div style={st.app}><div style={st.content}><BookingForm key="add-booking" initialData={null} clients={clients} onSave={saveBooking} onCancel={()=>setAddingBooking(false)}/></div></div>;
  if(editingBooking) return <div style={st.app}><div style={st.content}><BookingForm key={`edit-booking-${editingBooking.id}`} initialData={editingBooking} clients={clients} onSave={saveBooking} onCancel={()=>setEditingBooking(null)} title="Edit Booking"/></div></div>;

  const BookingCard=({b,showActions=true})=>{
    const typeColor=BOOKING_TYPE_COLOR[b.bookingType]||BLUE;
    const isOverdue=b.date<TODAY&&b.status==="scheduled";
    return (
      <div style={{...st.card,marginBottom:8,borderLeft:`3px solid ${b.status==="completed"?"#94a3b8":isOverdue?RED:typeColor}`,opacity:b.status==="cancelled"?.5:1,cursor:"pointer"}} onClick={()=>setSelectedBooking(b)}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
          <div style={{fontWeight:700,fontSize:14,flex:1,paddingRight:8}}>{b.clientName||"One-off Client"}</div>
          <span style={st.badge(typeColor,`${typeColor}18`)}>{BOOKING_TYPES.find(t=>t.value===b.bookingType)?.label||b.bookingType}</span>
        </div>
        <div style={{fontSize:12,color:"#94a3b8",marginBottom:6}}>
          {b.time?`${b.time} · `:""}{fmtDate(b.date)} · {b.jobType}
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          {b.status==="completed"&&<span style={st.badge("#94a3b8","#f1f5f9")}>✓ Done</span>}
          {isOverdue&&b.status==="scheduled"&&<span style={st.badge(RED,"#fee2e2")}>Overdue</span>}
          {b.status==="cancelled"&&<span style={st.badge("#94a3b8","#f1f5f9")}>Cancelled</span>}
          <PayBadge status={b.paymentStatus}/>
          <span style={{fontWeight:800,color:G,marginLeft:"auto"}}>{fmtPrice(b.price)}</span>
        </div>
        {b.notes&&<div style={{fontSize:11,color:"#94a3b8",marginTop:6,fontStyle:"italic"}}>"{b.notes.slice(0,60)}{b.notes.length>60?"...":""}"</div>}
      </div>
    );
  };

  const BookingDetail=({b})=>{
    const [payMethod,setPayMethod]=useState("Cash");
    const typeColor=BOOKING_TYPE_COLOR[b.bookingType]||BLUE;
    const client=clients.find(c=>c.id===b.clientId);
    return (
      <div>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16,flexWrap:"wrap"}}>
          <button style={st.btnSm("#f1f5f9","#0f172a")} onClick={()=>setSelectedBooking(null)}>← Back</button>
          <button style={st.btnSm(G,"#fff")} onClick={()=>{setEditingBooking(b);setSelectedBooking(null);}}>✏️ Edit</button>
          {b.status==="scheduled"&&<button style={st.btnSm("#fee2e2",RED)} onClick={()=>cancelBooking(b.id)}>Cancel</button>}
        </div>
        <div style={{...st.card,borderLeft:`4px solid ${typeColor}`,marginBottom:12}}>
          <div style={{fontSize:22,fontWeight:800,marginBottom:8}}>{b.clientName||"One-off Job"}</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            <span style={st.badge(typeColor,`${typeColor}18`)}>{BOOKING_TYPES.find(t=>t.value===b.bookingType)?.label}</span>
            <PayBadge status={b.paymentStatus}/>
            {b.status==="completed"&&<span style={st.badge("#16a34a","#dcfce7")}>✓ Completed</span>}
            {b.status==="cancelled"&&<span style={st.badge("#94a3b8","#f1f5f9")}>Cancelled</span>}
          </div>
        </div>
        <div style={st.card}>
          <div style={st.secTitle}>Details</div>
          {[["Date",fmtDate(b.date)],["Time",b.time||"Not set"],["Job Type",b.jobType],["Price",fmtPrice(b.price)],["Affects Schedule",b.affectsSchedule?"Yes — updates client last visit":"No"]].map(([k,v])=>(
            <div key={k} style={st.row}><span style={{fontSize:13,color:"#64748b",fontWeight:600}}>{k}</span><span style={{fontSize:13,fontWeight:700}}>{v}</span></div>
          ))}
        </div>
        {b.notes&&<div style={st.card}><div style={st.secTitle}>Notes</div><div style={{fontSize:13,lineHeight:1.6}}>{b.notes}</div></div>}
        {client&&(
          <div style={{...st.card,cursor:"pointer"}} onClick={()=>{setSelected(client);setSelectedBooking(null);setPage("clients");}}>
            <div style={st.secTitle}>Client</div>
            <div style={{fontWeight:700}}>{client.name}</div>
            <div style={{fontSize:12,color:"#94a3b8"}}>{client.area||"—"} · {client.phone||"No phone"}</div>
          </div>
        )}
        {b.paymentStatus==="unpaid"&&b.status==="completed"&&(
          <div style={st.card}>
            <div style={st.secTitle}>Mark as Paid</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
              {PAYMENT_METHODS.map(m=><button key={m} onClick={()=>setPayMethod(m)} style={st.btnSm(payMethod===m?G:"#f1f5f9",payMethod===m?"#fff":"#64748b")}>{m}</button>)}
            </div>
            <button style={{...st.btn(G,"#fff",true)}} onClick={()=>payBooking(b.id,payMethod)}>✅ Confirm Paid — {fmtPrice(b.price)}</button>
          </div>
        )}
        <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:16}}>
          {b.status==="scheduled"&&<button style={{...st.btn("#dcfce7","#16a34a"),borderRadius:12}} onClick={()=>completeBooking(b.id)}>✅ Mark Completed</button>}
          {client&&<button style={{...st.btn("#f1f5f9","#0f172a"),borderRadius:12}} onClick={()=>{setSelected(client);setSelectedBooking(null);setPage("clients");}}>👤 View Client</button>}
        </div>
      </div>
    );
  };

  const Calendar=()=>{
    const weekDates=getWeekDates(calOffset);
    const getBookingsForDate=(d)=>bookings.filter(b=>b.date===d&&b.status!=="cancelled");
    const totalForDate=(d)=>getBookingsForDate(d).reduce((s,b)=>s+(b.price||0),0);

    const DayView=()=>{
      const date=addDays(TODAY,calOffset);
      const dayBookings=getBookingsForDate(date);
      return (
        <div>
          <div style={{fontSize:16,fontWeight:800,marginBottom:16,color:"#0f172a"}}>{new Date(date+"T12:00:00").toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"})}</div>
          {dayBookings.length===0&&<div style={{textAlign:"center",padding:"40px 0",color:"#94a3b8"}}><div style={{fontSize:32,marginBottom:8}}>📅</div><div style={{fontWeight:600}}>No bookings</div><button style={{...st.btn(G,"#fff"),marginTop:12,borderRadius:12}} onClick={()=>setAddingBooking(true)}>+ Add Booking</button></div>}
          {dayBookings.map(b=><BookingCard key={b.id} b={b}/>)}
        </div>
      );
    };

    const WeekView=()=>(
      <div>
        {weekDates.map(date=>{
          const dayB=getBookingsForDate(date);
          const isToday=date===TODAY;
          const total=totalForDate(date);
          return (
            <div key={date} style={{marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <div style={{fontWeight:700,fontSize:13,color:isToday?G:"#0f172a"}}>
                  {isToday?"📍 Today — ":""}{getDayName(date)} {fmtDateShort(date)}
                </div>
                {total>0&&<span style={{fontSize:12,fontWeight:700,color:G}}>£{total}</span>}
              </div>
              {dayB.length===0?(
                <div style={{fontSize:12,color:"#cbd5e1",padding:"8px 0",borderBottom:`1px solid #f1f5f9`}}>No bookings</div>
              ):(
                dayB.map(b=><BookingCard key={b.id} b={b}/>)
              )}
            </div>
          );
        })}
      </div>
    );

    const ListView=()=>{
      const upcoming=bookings.filter(b=>b.date>=TODAY&&b.status!=="cancelled").sort((a,b)=>a.date.localeCompare(b.date));
      const past=bookings.filter(b=>b.date<TODAY&&b.status!=="cancelled").sort((a,b)=>b.date.localeCompare(a.date)).slice(0,10);
      return (
        <div>
          {upcoming.length>0&&(
            <div style={{marginBottom:16}}>
              <div style={st.secTitle}>Upcoming ({upcoming.length})</div>
              {upcoming.map(b=><BookingCard key={b.id} b={b}/>)}
            </div>
          )}
          {past.length>0&&(
            <div>
              <div style={st.secTitle}>Recent Past</div>
              {past.map(b=><BookingCard key={b.id} b={b}/>)}
            </div>
          )}
          {upcoming.length===0&&past.length===0&&<div style={{textAlign:"center",padding:"60px 0",color:"#94a3b8"}}><div style={{fontSize:40,marginBottom:8}}>📅</div><div style={{fontWeight:600}}>No bookings yet</div></div>}
        </div>
      );
    };

    return (
      <div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{display:"flex",gap:6}}>
            {[["week","Week"],["day","Day"],["list","List"]].map(([v,l])=>(
              <button key={v} onClick={()=>setCalView(v)} style={st.btnSm(calView===v?G:"#f1f5f9",calView===v?"#fff":"#64748b")}>{l}</button>
            ))}
          </div>
          <button style={{...st.btn(G,"#fff"),borderRadius:12,padding:"8px 14px",fontSize:13}} onClick={()=>setAddingBooking(true)}>+ Book</button>
        </div>

        {calView!=="list"&&(
          <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:14}}>
            <button style={st.btnSm("#f1f5f9","#64748b")} onClick={()=>setCalOffset(o=>o-(calView==="week"?0:1)+( calView==="week"?-1:0))}
              onClick={()=>setCalOffset(o=>calView==="week"?o-1:o-1)}>‹</button>
            <button style={st.btnSm("#f1f5f9",G)} onClick={()=>setCalOffset(0)}>Today</button>
            <button style={st.btnSm("#f1f5f9","#64748b")} onClick={()=>setCalOffset(o=>calView==="week"?o+1:o+1)}>›</button>
            {calView==="week"&&<span style={{fontSize:12,color:"#94a3b8",marginLeft:4}}>{fmtDateShort(weekDates[0])} – {fmtDateShort(weekDates[6])}</span>}
          </div>
        )}

        {calView==="week"&&<WeekView/>}
        {calView==="day"&&<DayView/>}
        {calView==="list"&&<ListView/>}

        {unpaidBookings.length>0&&(
          <div style={{...st.card,borderLeft:`3px solid ${RED}`,marginTop:8}}>
            <div style={{fontSize:13,fontWeight:800,color:RED,marginBottom:8}}>💷 {unpaidBookings.length} completed but unpaid</div>
            {unpaidBookings.slice(0,3).map(b=>(
              <div key={b.id} style={{...st.row,cursor:"pointer"}} onClick={()=>setSelectedBooking(b)}>
                <div><div style={{fontWeight:700,fontSize:13}}>{b.clientName}</div><div style={{fontSize:11,color:"#94a3b8"}}>{fmtDate(b.date)}</div></div>
                <span style={{fontWeight:800,color:RED}}>{fmtPrice(b.price)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const Dashboard=()=>{
    const topOverdue=[...overdue].sort((a,b)=>b.overdueDays-a.overdueDays).slice(0,3);
    const recentUnpaid=[...unpaidVisits].sort((a,b)=>b.visitDate.localeCompare(a.visitDate)).slice(0,3);
    const nextBooking=upcomingBookings[0];
    return (
      <div>
        <div style={{marginBottom:16}}>
          <div style={{fontSize:22,fontWeight:800,color:"#0f172a",marginBottom:2}}>Good morning 👋</div>
          <div style={{fontSize:13,color:"#94a3b8"}}>{new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
          {[
            {label:"🔴 Overdue",val:overdue.length,color:RED,bg:"#fef2f2",fn:()=>{setFilterStatus("overdue");setPage("revisits");}},
            {label:"📅 Today",val:todayBookings.length,color:G,bg:"#f0fdf4",fn:()=>{setCalView("day");setCalOffset(0);setPage("calendar");}},
            {label:"💷 Unpaid",val:`£${totalUnpaid}`,color:RED,bg:"#fef2f2",fn:()=>setPage("payments")},
            {label:"⏳ Needs Confirm",val:needsConfirm.length,color:"#6366f1",bg:"#eef2ff",fn:()=>{setFilterStatus("pending-confirmation");setPage("revisits");}},
          ].map(({label,val,color,bg,fn})=>(
            <div key={label} onClick={fn} style={{...st.card,background:bg,border:`1px solid ${color}20`,marginBottom:0,padding:"14px",cursor:"pointer"}}>
              <div style={{fontSize:11,fontWeight:700,color,marginBottom:4}}>{label}</div>
              <div style={{fontSize:30,fontWeight:800,color,lineHeight:1}}>{val}</div>
            </div>
          ))}
        </div>

        {nextBooking&&(
          <div style={{...st.card,borderLeft:`3px solid ${G}`,marginBottom:12,cursor:"pointer"}} onClick={()=>{setSelectedBooking(nextBooking);setPage("calendar");}}>
            <div style={{fontSize:12,fontWeight:800,color:"#94a3b8",textTransform:"uppercase",letterSpacing:.6,marginBottom:6}}>Next Booking</div>
            <div style={{fontWeight:700,fontSize:16}}>{nextBooking.clientName}</div>
            <div style={{fontSize:12,color:"#94a3b8"}}>{fmtDate(nextBooking.date)}{nextBooking.time?` · ${nextBooking.time}`:""} · {nextBooking.jobType}</div>
            <div style={{fontWeight:800,color:G,marginTop:4}}>{fmtPrice(nextBooking.price)}</div>
          </div>
        )}

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
              <div key={v.id} style={st.row}>
                <div><div style={{fontWeight:700,fontSize:13}}>{v.clientName}</div><div style={{fontSize:11,color:"#94a3b8"}}>Visited: {fmtDate(v.visitDate)}</div></div>
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
                <div><div style={{fontWeight:700,fontSize:13}}>{c.name}</div><div style={{fontSize:11,color:"#94a3b8"}}>{c.area||"—"} · {c.overdueDays}d overdue</div></div>
                {c.phone&&<a href={`tel:${c.phone}`} onClick={e=>e.stopPropagation()} style={{fontSize:16}}>📞</a>}
              </div>
            ))}
          </div>
        )}

        <div style={st.card}>
          <div style={st.secTitle}>Quick Actions</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {[
              {label:"📅 Add Booking",bg:G,color:"#fff",fn:()=>setAddingBooking(true)},
              {label:"➕ Add Client",bg:"#f1f5f9",color:"#0f172a",fn:()=>setAddingClient(true)},
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
    const contactAction=getContactAction(c);
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
          {contactAction&&<a href={contactAction.url} onClick={e=>e.stopPropagation()} style={{fontSize:11,color:G,fontWeight:700,textDecoration:"none",marginLeft:"auto"}}>{contactAction.label}</a>}
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
    },[clients,search,filterStatus,filterArea,sortBy]);
    return (
      <div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{fontSize:13,color:"#94a3b8",fontWeight:600}}>{sorted.length} clients</div>
          <div style={{display:"flex",gap:8}}>
            <button style={st.btnSm(showFilters?"#0f172a":"#f1f5f9",showFilters?"#fff":"#64748b")} onClick={()=>setShowFilters(p=>!p)}>⚙ Filter</button>
            <button style={st.btnSm(G,"#fff")} onClick={()=>setAddingClient(true)}>➕ Add</button>
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
    const contactAction=getContactAction(c);
    const contactLabel=CONTACT_METHODS.find(m=>m.value===c.preferredContact)?.label||"📞 Phone Call";
    return (
      <div>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16,flexWrap:"wrap"}}>
          <button style={st.btnSm("#f1f5f9","#0f172a")} onClick={()=>setSelected(null)}>← Back</button>
          <button style={st.btnSm(G,"#fff")} onClick={()=>setEditingClient(c)}>✏️ Edit</button>
          <button style={st.btnSm("#fff2f2",RED)} onClick={()=>setConfirmDelete(c.id)}>🗑</button>
          <button style={st.btnSm("#f1f5f9","#64748b")} onClick={()=>pauseClient(c.id)}>⏸</button>
          <button style={st.btnSm("#f1f5f9","#64748b")} onClick={()=>archiveClient(c.id)}>Archive</button>
          <button style={st.btnSm(BLUE,"#fff")} onClick={()=>{setAddingBooking(true);setSelected(null);}}>📅 Book</button>
        </div>
        <div style={{...st.card,borderLeft:`4px solid ${cfg.color||G}`,marginBottom:12}}>
          <div style={{fontSize:22,fontWeight:800,marginBottom:8}}>{c.name}</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            <StatusBadge status={c.visitStatus}/>
            {c.visitStatus==="overdue"&&<span style={st.badge(RED,"#fee2e2")}>{c.overdueDays}d overdue</span>}
          </div>
        </div>
        <div style={st.card}>
          <div style={st.secTitle}>Contact</div>
          <div style={st.row}><span style={{fontSize:13,color:"#64748b",fontWeight:600}}>Preferred</span><span style={{fontSize:13,fontWeight:700}}>{contactLabel}</span></div>
          {[["Phone",c.phone||"—"],["Email",c.email||"—"],["Area",c.area||"—"],["Address",c.address||"—"]].map(([k,v])=>(
            <div key={k} style={st.row}><span style={{fontSize:13,color:"#64748b",fontWeight:600}}>{k}</span><span style={{fontSize:13,fontWeight:600,maxWidth:200,textAlign:"right"}}>{v}</span></div>
          ))}
          {contactAction&&(
            <div style={{marginTop:12,display:"flex",gap:8,flexWrap:"wrap"}}>
              <a href={contactAction.url} style={{...st.btn(G,"#fff"),borderRadius:12,textDecoration:"none",fontSize:13}}>{contactAction.label}</a>
              {c.phone&&c.preferredContact!=="phone"&&<a href={`tel:${c.phone}`} style={{...st.btnSm("#f1f5f9","#0f172a"),textDecoration:"none"}}>📞 Call</a>}
              {c.phone&&c.preferredContact!=="text"&&<a href={`sms:${c.phone}`} style={{...st.btnSm("#f1f5f9","#0f172a"),textDecoration:"none"}}>💬 Text</a>}
            </div>
          )}
        </div>
        <div style={st.card}>
          <div style={st.secTitle}>Schedule</div>
          {[["Frequency",c.frequency||DEFAULT_FREQ],["Last Visit",fmtDate(c.lastVisit)],["Days Since",c.daysSinceVisit!=null?`${c.daysSinceVisit} days`:"—"],["Next Due",fmtDate(c.nextVisit)],["Status",c.visitStatus==="overdue"?`${c.overdueDays}d overdue`:c.daysUntilDue!=null?`${c.daysUntilDue}d`:"—"]].map(([k,v])=>(
            <div key={k} style={st.row}><span style={{fontSize:13,color:"#64748b",fontWeight:600}}>{k}</span><span style={{fontSize:13,fontWeight:700}}>{v}</span></div>
          ))}
        </div>
        <div style={st.card}>
          <div style={st.secTitle}>💷 Payment</div>
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
              <div style={{fontSize:12,fontWeight:700,color:RED,marginBottom:6}}>{clientUnpaid.length} unpaid — £{totalOwed} owed</div>
              {clientUnpaid.map(v=>(
                <div key={v.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:"1px solid #fee2e2"}}>
                  <div style={{fontSize:12,fontWeight:600}}>{fmtDate(v.visitDate)}</div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontWeight:700,color:RED}}>{fmtPrice(v.price)}</span>
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
            {clientVisits.slice(0,6).map(v=>(
              <div key={v.id} style={{...st.row,flexWrap:"wrap",gap:4}}>
                <div><div style={{fontSize:13,fontWeight:600}}>📅 {fmtDate(v.visitDate)}</div><div style={{fontSize:11,color:"#94a3b8"}}>{v.paymentMethod||""}{v.paymentDate?` · paid ${fmtDate(v.paymentDate)}`:""}</div></div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontWeight:700}}>{fmtPrice(v.price)}</span>
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
          {c.visitStatus==="pending-confirmation"&&<button style={{...st.btn(G,"#fff"),borderRadius:12}} onClick={()=>confirmClient(c.id)}>✓ Confirm</button>}
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
          const contactAction=getContactAction(c);
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
              {clientUnpaidCount>0&&<div style={{fontSize:11,color:RED,fontWeight:700,marginBottom:8}}>💷 {clientUnpaidCount} unpaid</div>}
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {contactAction&&<a href={contactAction.url} style={{...st.btnSm(G,"#fff"),textDecoration:"none"}}>{contactAction.label}</a>}
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
    const weekUnpaid=unpaidVisits.filter(v=>v.visitDate>=weekStart);
    const totalPaidMonthAmt=monthPaid.reduce((s,v)=>s+(v.price||0),0);
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
            <div style={{fontSize:28,fontWeight:800,color:G}}>£{totalPaidMonthAmt}</div>
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
              {v.paymentStatus==="unpaid"&&<button style={st.btnSm(G,"#fff")} onClick={()=>openPayModal(v)}>💷 Mark Paid</button>}
            </div>
          </div>
        ))}
        {filtered.length===0&&<div style={{textAlign:"center",padding:"40px 0",color:"#94a3b8"}}><div style={{fontSize:36,marginBottom:8}}>💷</div><div style={{fontWeight:600}}>No records</div></div>}
      </div>
    );
  };

  const navItems=[{id:"dashboard",icon:"🏠",label:"Home"},{id:"clients",icon:"👥",label:"Clients"},{id:"calendar",icon:"📅",label:"Calendar"},{id:"revisits",icon:"🔴",label:"Revisits"},{id:"payments",icon:"💷",label:"Payments"}];
  const pageTitles={dashboard:"moegardens 🌿",clients:"Clients",calendar:"Calendar",revisits:"Revisits",payments:"Payments"};

  const mainContent=()=>{
    if(selectedBooking) return <BookingDetail b={selectedBooking}/>;
    if(selected) return <ClientDetail c={selected}/>;
    if(page==="dashboard") return <Dashboard/>;
    if(page==="clients") return <ClientList/>;
    if(page==="calendar") return <Calendar/>;
    if(page==="revisits") return <Revisits/>;
    if(page==="payments") return <Payments/>;
    return <Dashboard/>;
  };

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
                {PAYMENT_METHODS.map(m=><button key={m} onClick={()=>setPayModal(p=>({...p,_method:m}))} style={{...st.btnSm(payModal._method===m?G:"#f1f5f9",payModal._method===m?"#fff":"#64748b")}}>{m}</button>)}
              </div>
              <div style={{display:"flex",gap:10}}>
                <button style={st.btn(G,"#fff",true)} onClick={confirmPayment}>✅ Confirm Paid</button>
                <button style={st.btn("#f1f5f9","#0f172a",true)} onClick={()=>setPayModal(null)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
        {mainContent()}
      </div>
      <div style={st.bottomnav}>
        {navItems.map(n=>(
          <button key={n.id} style={{...st.navbtn,color:page===n.id?G:"#94a3b8"}} onClick={()=>{setSelected(null);setSelectedBooking(null);setPage(n.id);}}>
            <span style={{fontSize:20}}>{n.icon}</span>
            <span style={{fontSize:9,fontWeight:700}}>{n.label}</span>
          </button>
        ))}
      </div>
      {toast&&<div style={{position:"fixed",bottom:100,left:"50%",transform:"translateX(-50%)",background:toast.type==="error"?RED:G,color:"#fff",padding:"11px 22px",borderRadius:14,fontSize:13,fontWeight:700,zIndex:9999,whiteSpace:"nowrap",boxShadow:"0 4px 20px rgba(0,0,0,.2)",animation:"fadeUp .2s ease"}}>{toast.msg}</div>}
    </div>
  );
}
