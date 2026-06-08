import { useState, createContext, useContext, useEffect, useRef } from "react";

// ─── Thème ────────────────────────────────────────────────────────────────────
const ThemeCtx = createContext();
const useTheme = () => useContext(ThemeCtx);

const DARK = {
  bg:"#000",bgCard:"#1C1C1E",bgHeader:"rgba(0,0,0,0.92)",
  border:"rgba(255,255,255,0.08)",borderLight:"rgba(255,255,255,0.05)",
  text:"#F2F2F7",textSub:"#AEAEB2",textMuted:"#636366",textFaint:"#3A3A3C",
  input:"rgba(255,255,255,0.07)",inputBorder:"rgba(255,255,255,0.12)",
  tableHead:"rgba(255,255,255,0.03)",sel:"#1C1C1E",toggleBg:"#2C2C2E",
  shadow:"0 4px 24px rgba(0,0,0,0.5)",
  badgeApp:{bg:"#1C3A27",color:"#30D158"},
  badgeRej:{bg:"#3A1C1C",color:"#FF453A"},
  badgePend:{bg:"#3A2F1C",color:"#FF9F0A"},
};
const LIGHT = {
  bg:"#F2F2F7",bgCard:"#FFFFFF",bgHeader:"rgba(255,255,255,0.92)",
  border:"rgba(0,0,0,0.08)",borderLight:"rgba(0,0,0,0.06)",
  text:"#1C1C1E",textSub:"#3A3A3C",textMuted:"#636366",textFaint:"#AEAEB2",
  input:"#FFFFFF",inputBorder:"rgba(0,0,0,0.12)",
  tableHead:"rgba(0,0,0,0.02)",sel:"#FFFFFF",toggleBg:"#E5E5EA",
  shadow:"0 4px 24px rgba(0,0,0,0.08)",
  badgeApp:{bg:"#D4EFDD",color:"#1A7A35"},
  badgeRej:{bg:"#FDDEDE",color:"#C0392B"},
  badgePend:{bg:"#FFF3D4",color:"#B8730A"},
};

// ─── Couleurs & icônes disponibles ────────────────────────────────────────────
const COLORS = ["#0A84FF","#30D158","#FF9F0A","#FF453A","#64D2FF","#FFD60A","#FF6B35","#BF5AF2","#8E8E93","#FF2D55","#5E5CE6","#00C7BE"];
const ICONS  = ["📦","🛒","👕","👟","💊","🍕","🥩","🍺","💻","📱","🎧","🔧","🚗","🏠","💄","⌚","📷","🎮","🔋","📚","✂️","🧴","🧹","🍃"];
const DEVISES = [{s:"FCFA",l:"FCFA (Afrique de l'Ouest)"},{s:"€",l:"Euro"},{s:"$",l:"Dollar USD"},{s:"MAD",l:"Dirham marocain"},{s:"DZD",l:"Dinar algérien"},{s:"XAF",l:"Franc CFA (Afrique centrale)"}];

// ─── Storage local ────────────────────────────────────────────────────────────
const STORAGE_KEY = "gestion_config";
const loadConfig = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)||"null"); } catch { return null; }
};
const saveConfig = (c) => localStorage.setItem(STORAGE_KEY, JSON.stringify(c));

// ─── Utilitaires ──────────────────────────────────────────────────────────────
const formatMontant = (n, devise) => {
  try {
    return new Intl.NumberFormat("fr-FR", {maximumFractionDigits:0}).format(n) + " " + devise;
  } catch { return n + " " + devise; }
};
const today = () => new Date().toISOString().split("T")[0];
const getCat = (list, id) => list.find(c=>c.id===id) || list[list.length-1] || {icon:"📦",label:"Autre",color:"#8E8E93"};
const stStyle = (s,theme) => s==="Approuvée"?theme.badgeApp:s==="Rejetée"?theme.badgeRej:theme.badgePend;

// ─── UI Components ────────────────────────────────────────────────────────────
const Badge = ({s}) => {
  const {theme}=useTheme();
  const st=stStyle(s,theme);
  return <span style={{display:"inline-block",fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:99,background:st.bg,color:st.color}}>{s}</span>;
};

const KPI = ({label,value,sub,accent,icon}) => {
  const {theme}=useTheme();
  return (
    <div style={{background:theme.bgCard,borderRadius:16,padding:"20px 22px",border:`1px solid ${theme.border}`,position:"relative",overflow:"hidden",boxShadow:theme.shadow}}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:accent,borderRadius:"16px 16px 0 0"}}/>
      <div style={{fontSize:22,marginBottom:4}}>{icon}</div>
      <div style={{fontSize:12,color:theme.textMuted,fontWeight:500,marginBottom:6}}>{label}</div>
      <div style={{fontSize:22,fontWeight:800,color:accent,letterSpacing:"-0.5px"}}>{value}</div>
      {sub&&<div style={{fontSize:12,color:theme.textFaint,marginTop:4}}>{sub}</div>}
    </div>
  );
};

const Card = ({children,style={}}) => {
  const {theme}=useTheme();
  return <div style={{background:theme.bgCard,borderRadius:16,padding:"20px 22px",border:`1px solid ${theme.border}`,boxShadow:theme.shadow,...style}}>{children}</div>;
};
const CardTitle = ({children}) => {
  const {theme}=useTheme();
  return <div style={{fontSize:12,fontWeight:700,color:theme.textMuted,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:14}}>{children}</div>;
};
const TableWrap = ({children}) => {
  const {theme}=useTheme();
  return <div style={{background:theme.bgCard,borderRadius:16,border:`1px solid ${theme.border}`,overflow:"hidden",boxShadow:theme.shadow}}>{children}</div>;
};
const Th = ({children}) => {
  const {theme}=useTheme();
  return <th style={{padding:"12px 14px",textAlign:"left",fontSize:11,fontWeight:600,color:theme.textMuted,background:theme.tableHead,borderBottom:`1px solid ${theme.border}`}}>{children}</th>;
};
const Td = ({children,style={}}) => {
  const {theme}=useTheme();
  return <td style={{padding:"12px 14px",fontSize:13,verticalAlign:"middle",color:theme.text,borderBottom:`1px solid ${theme.borderLight}`,...style}}>{children}</td>;
};
const Inp = ({label,value,onChange,type="text",placeholder=""}) => {
  const {theme}=useTheme();
  return (
    <div style={{display:"flex",flexDirection:"column",gap:5}}>
      {label&&<label style={{fontSize:12,fontWeight:600,color:theme.textMuted}}>{label}</label>}
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        style={{background:theme.input,border:`1px solid ${theme.inputBorder}`,borderRadius:9,padding:"9px 13px",color:theme.text,fontSize:14,outline:"none",fontFamily:"inherit"}}/>
    </div>
  );
};
const SelInput = ({label,value,onChange,options}) => {
  const {theme}=useTheme();
  return (
    <div style={{display:"flex",flexDirection:"column",gap:5}}>
      {label&&<label style={{fontSize:12,fontWeight:600,color:theme.textMuted}}>{label}</label>}
      <select value={value} onChange={onChange} style={{background:theme.sel,border:`1px solid ${theme.inputBorder}`,borderRadius:9,padding:"9px 13px",color:theme.text,fontSize:14,outline:"none",fontFamily:"inherit",cursor:"pointer"}}>
        {options.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </div>
  );
};
const SelFilter = ({value,onChange,children}) => {
  const {theme}=useTheme();
  return <select value={value} onChange={onChange} style={{background:theme.sel,border:`1px solid ${theme.border}`,borderRadius:9,padding:"8px 12px",color:theme.text,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>{children}</select>;
};
const BtnPri = ({children,onClick,style={},color="#0A84FF"}) => (
  <button onClick={onClick} style={{background:color,color:"#fff",border:"none",padding:"10px 22px",borderRadius:10,fontWeight:700,cursor:"pointer",fontSize:14,fontFamily:"inherit",...style}}>{children}</button>
);
const BtnSec = ({children,onClick,style={}}) => {
  const {theme}=useTheme();
  return <button onClick={onClick} style={{background:theme.toggleBg,color:theme.text,border:`1px solid ${theme.border}`,padding:"10px 18px",borderRadius:10,fontWeight:600,cursor:"pointer",fontSize:14,fontFamily:"inherit",...style}}>{children}</button>;
};
const Toast = ({msg,err}) => (
  <div style={{position:"fixed",bottom:24,right:24,zIndex:999,padding:"12px 20px",borderRadius:12,
    background:err?"#3A1C1C":"#1C3A27",border:`1px solid ${err?"#FF453A":"#30D158"}`,
    color:err?"#FF453A":"#30D158",fontWeight:600,fontSize:14,boxShadow:"0 8px 32px rgba(0,0,0,0.4)"}}>
    {err?"❌":"✅"} {msg}
  </div>
);

// ─── Écran de configuration ───────────────────────────────────────────────────
function SetupScreen({onDone}) {
  const [step,setStep]=useState(1);
  const [config,setConfig]=useState({
    nom:"Ma Boutique",
    slogan:"",
    adresse:"",
    telephone:"",
    email:"",
    devise:"FCFA",
    couleurPrincipale:"#0A84FF",
    categories:[
      {id:"cat1",label:"Produits",icon:"📦",color:"#0A84FF"},
      {id:"cat2",label:"Services",icon:"🛠️",color:"#30D158"},
    ],
    catDepenses:[
      {id:"dep1",label:"Achat stock",icon:"📦",color:"#0A84FF"},
      {id:"dep2",label:"Loyer",icon:"🏠",color:"#FF6B35"},
      {id:"dep3",label:"Salaires",icon:"👥",color:"#BF5AF2"},
      {id:"dep4",label:"Marketing",icon:"📣",color:"#FFD60A"},
      {id:"dep5",label:"Autre",icon:"📎",color:"#8E8E93"},
    ],
  });
  const [newCat,setNewCat]=useState({label:"",icon:"📦",color:"#0A84FF"});
  const [newDep,setNewDep]=useState({label:"",icon:"📎",color:"#8E8E93"});

  const addCat = () => {
    if(!newCat.label)return;
    const id="cat"+Date.now();
    setConfig({...config,categories:[...config.categories,{...newCat,id}]});
    setNewCat({label:"",icon:"📦",color:"#0A84FF"});
  };
  const addDep = () => {
    if(!newDep.label)return;
    const id="dep"+Date.now();
    setConfig({...config,catDepenses:[...config.catDepenses,{...newDep,id}]});
    setNewDep({label:"",icon:"📎",color:"#8E8E93"});
  };
  const delCat = (id) => setConfig({...config,categories:config.categories.filter(c=>c.id!==id)});
  const delDep = (id) => setConfig({...config,catDepenses:config.catDepenses.filter(c=>c.id!==id)});

  const finish = () => { saveConfig(config); onDone(config); };

  const stepStyle = (s) => ({
    width:32,height:32,borderRadius:99,display:"flex",alignItems:"center",justifyContent:"center",
    fontWeight:800,fontSize:14,
    background:step>=s?config.couleurPrincipale:"rgba(255,255,255,0.1)",
    color:step>=s?"#fff":"#636366",
  });

  return (
    <div style={{minHeight:"100vh",background:"#000",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'SF Pro Display','Segoe UI',sans-serif",padding:20}}>
      <div style={{width:"100%",maxWidth:600}}>
        {/* Header setup */}
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{fontSize:40,marginBottom:12}}>🏪</div>
          <div style={{fontSize:28,fontWeight:900,color:"#fff",letterSpacing:"-0.5px"}}>Configurer votre logiciel</div>
          <div style={{fontSize:14,color:"#636366",marginTop:6}}>Quelques étapes pour personnaliser votre espace</div>
        </div>

        {/* Steps indicator */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:32}}>
          {[1,2,3].map(s=>(
            <div key={s} style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={stepStyle(s)}>{s}</div>
              {s<3&&<div style={{width:40,height:2,background:step>s?config.couleurPrincipale:"rgba(255,255,255,0.1)",borderRadius:99}}/>}
            </div>
          ))}
        </div>

        <div style={{background:"#1C1C1E",borderRadius:20,padding:28,border:"1px solid rgba(255,255,255,0.08)"}}>

          {/* Étape 1 : Infos boutique */}
          {step===1&&(
            <div>
              <div style={{fontSize:18,fontWeight:800,color:"#fff",marginBottom:20}}>📋 Informations de votre boutique</div>
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                <Inp label="Nom de la boutique *" value={config.nom} onChange={e=>setConfig({...config,nom:e.target.value})} placeholder="Ex: Boutique Aminata"/>
                <Inp label="Slogan" value={config.slogan} onChange={e=>setConfig({...config,slogan:e.target.value})} placeholder="Ex: La qualité à votre portée"/>
                <Inp label="Adresse" value={config.adresse} onChange={e=>setConfig({...config,adresse:e.target.value})} placeholder="Ex: Dakar, Sénégal"/>
                <Inp label="Téléphone" value={config.telephone} onChange={e=>setConfig({...config,telephone:e.target.value})} placeholder="Ex: +221 77 000 00 00"/>
                <Inp label="Email" value={config.email} onChange={e=>setConfig({...config,email:e.target.value})} placeholder="Ex: contact@maboutique.com"/>
                <SelInput label="Devise" value={config.devise} onChange={e=>setConfig({...config,devise:e.target.value})} options={DEVISES.map(d=>({v:d.s,l:d.l}))}/>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  <label style={{fontSize:12,fontWeight:600,color:"#636366"}}>Couleur principale</label>
                  <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                    {COLORS.map(c=>(
                      <button key={c} onClick={()=>setConfig({...config,couleurPrincipale:c})}
                        style={{width:32,height:32,borderRadius:99,background:c,border:`3px solid ${config.couleurPrincipale===c?"#fff":c}`,cursor:"pointer",
                          boxShadow:config.couleurPrincipale===c?"0 0 0 2px "+c:"none"}}/>
                    ))}
                  </div>
                </div>
              </div>
              <BtnPri onClick={()=>setStep(2)} style={{marginTop:24,width:"100%"}} color={config.couleurPrincipale}>
                Continuer →
              </BtnPri>
            </div>
          )}

          {/* Étape 2 : Catégories produits */}
          {step===2&&(
            <div>
              <div style={{fontSize:18,fontWeight:800,color:"#fff",marginBottom:6}}>📦 Catégories de produits</div>
              <div style={{fontSize:13,color:"#636366",marginBottom:20}}>Définissez les types de produits que vous vendez</div>
              <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
                {config.categories.map(c=>(
                  <div key={c.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"rgba(255,255,255,0.04)",borderRadius:10,border:"1px solid rgba(255,255,255,0.06)"}}>
                    <span style={{fontSize:20}}>{c.icon}</span>
                    <span style={{flex:1,color:"#f2f2f7",fontWeight:600}}>{c.label}</span>
                    <span style={{width:16,height:16,borderRadius:99,background:c.color,display:"inline-block"}}/>
                    <button onClick={()=>delCat(c.id)} style={{background:"none",border:"none",color:"#FF453A",cursor:"pointer",fontSize:16}}>✕</button>
                  </div>
                ))}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr auto auto",gap:8,marginBottom:20,alignItems:"flex-end"}}>
                <Inp value={newCat.label} onChange={e=>setNewCat({...newCat,label:e.target.value})} placeholder="Nouvelle catégorie..."/>
                <div style={{display:"flex",gap:4,flexWrap:"wrap",maxWidth:160}}>
                  {ICONS.slice(0,8).map(ic=>(
                    <button key={ic} onClick={()=>setNewCat({...newCat,icon:ic})}
                      style={{width:28,height:28,borderRadius:6,border:`2px solid ${newCat.icon===ic?"#0A84FF":"rgba(255,255,255,0.1)"}`,background:"rgba(255,255,255,0.05)",cursor:"pointer",fontSize:14}}>
                      {ic}
                    </button>
                  ))}
                </div>
                <button onClick={addCat} style={{background:config.couleurPrincipale,color:"#fff",border:"none",padding:"9px 16px",borderRadius:9,cursor:"pointer",fontWeight:700,whiteSpace:"nowrap"}}>+ Ajouter</button>
              </div>
              <div style={{display:"flex",gap:10}}>
                <BtnSec onClick={()=>setStep(1)}>← Retour</BtnSec>
                <BtnPri onClick={()=>setStep(3)} style={{flex:1}} color={config.couleurPrincipale}>Continuer →</BtnPri>
              </div>
            </div>
          )}

          {/* Étape 3 : Catégories dépenses */}
          {step===3&&(
            <div>
              <div style={{fontSize:18,fontWeight:800,color:"#fff",marginBottom:6}}>📤 Catégories de dépenses</div>
              <div style={{fontSize:13,color:"#636366",marginBottom:20}}>Définissez vos types de dépenses</div>
              <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
                {config.catDepenses.map(c=>(
                  <div key={c.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"rgba(255,255,255,0.04)",borderRadius:10,border:"1px solid rgba(255,255,255,0.06)"}}>
                    <span style={{fontSize:20}}>{c.icon}</span>
                    <span style={{flex:1,color:"#f2f2f7",fontWeight:600}}>{c.label}</span>
                    <span style={{width:16,height:16,borderRadius:99,background:c.color,display:"inline-block"}}/>
                    <button onClick={()=>delDep(c.id)} style={{background:"none",border:"none",color:"#FF453A",cursor:"pointer",fontSize:16}}>✕</button>
                  </div>
                ))}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr auto auto",gap:8,marginBottom:20,alignItems:"flex-end"}}>
                <Inp value={newDep.label} onChange={e=>setNewDep({...newDep,label:e.target.value})} placeholder="Nouvelle dépense..."/>
                <div style={{display:"flex",gap:4,flexWrap:"wrap",maxWidth:160}}>
                  {ICONS.slice(8,16).map(ic=>(
                    <button key={ic} onClick={()=>setNewDep({...newDep,icon:ic})}
                      style={{width:28,height:28,borderRadius:6,border:`2px solid ${newDep.icon===ic?"#0A84FF":"rgba(255,255,255,0.1)"}`,background:"rgba(255,255,255,0.05)",cursor:"pointer",fontSize:14}}>
                      {ic}
                    </button>
                  ))}
                </div>
                <button onClick={addDep} style={{background:config.couleurPrincipale,color:"#fff",border:"none",padding:"9px 16px",borderRadius:9,cursor:"pointer",fontWeight:700,whiteSpace:"nowrap"}}>+ Ajouter</button>
              </div>
              <div style={{display:"flex",gap:10}}>
                <BtnSec onClick={()=>setStep(2)}>← Retour</BtnSec>
                <BtnPri onClick={finish} style={{flex:1}} color={config.couleurPrincipale}>🚀 Lancer mon logiciel</BtnPri>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({depenses,stock,ventes,factures,config}) {
  const {theme}=useTheme();
  const {devise,couleurPrincipale}=config;
  const fmt=(n)=>formatMontant(n,devise);
  const totalDep=depenses.filter(d=>d.statut==="Approuvée").reduce((s,d)=>s+d.montant,0);
  const totalVentes=ventes.reduce((s,v)=>s+v.prix_vente*v.qte,0);
  const stockVal=stock.reduce((s,p)=>s+p.prix_achat*p.qte,0);
  const benefice=totalVentes-totalDep;
  const alertes=stock.filter(p=>p.qte<=p.seuil);
  const mois=["Jan","Fév","Mar","Avr","Mai","Jun"];
  const ventesData=[0,0,0,0,0,Math.max(totalVentes,1)];
  const maxV=Math.max(...ventesData,1);

  return (
    <div>
      <h1 style={{fontWeight:800,fontSize:26,letterSpacing:"-0.5px",margin:"0 0 22px",color:theme.text}}>Tableau de bord</h1>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:22}}>
        <KPI label="Chiffre d'affaires" value={fmt(totalVentes)} accent={couleurPrincipale} icon="💰" sub={`${ventes.length} ventes`}/>
        <KPI label="Dépenses approuvées" value={fmt(totalDep)} accent="#FF453A" icon="📤" sub={`${depenses.filter(d=>d.statut==="Approuvée").length} entrées`}/>
        <KPI label="Bénéfice net" value={fmt(benefice)} accent={benefice>=0?"#30D158":"#FF453A"} icon="📈" sub="CA − dépenses"/>
        <KPI label="Valeur du stock" value={fmt(stockVal)} accent="#FF9F0A" icon="📦" sub={`${stock.length} produits`}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:14,marginBottom:14}}>
        <Card>
          <CardTitle>Évolution des ventes</CardTitle>
          <div style={{display:"flex",alignItems:"flex-end",gap:10,height:120,paddingTop:10}}>
            {mois.map((m,i)=>(
              <div key={m} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
                <div style={{fontSize:9,color:theme.textMuted}}>{Math.round(ventesData[i]/1000)}k</div>
                <div style={{width:"100%",background:i===5?couleurPrincipale:"rgba(255,255,255,0.1)",
                  height:`${Math.max(8,Math.round((ventesData[i]/maxV)*100))}px`,borderRadius:"5px 5px 0 0"}}/>
                <div style={{fontSize:11,color:i===5?couleurPrincipale:theme.textMuted,fontWeight:i===5?700:400}}>{m}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardTitle>⚠️ Alertes stock ({alertes.length})</CardTitle>
          {alertes.length===0
            ?<div style={{color:"#30D158",fontSize:13,marginTop:12}}>✓ Tout le stock est OK</div>
            :alertes.map(p=>(
              <div key={p.id} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${theme.borderLight}`}}>
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:theme.text}}>{p.nom}</div>
                  <div style={{fontSize:11,color:theme.textMuted}}>Seuil: {p.seuil}</div>
                </div>
                <span style={{background:p.qte===0?theme.badgeRej.bg:theme.badgePend.bg,color:p.qte===0?theme.badgeRej.color:theme.badgePend.color,padding:"3px 10px",borderRadius:99,fontSize:12,fontWeight:700}}>{p.qte}</span>
              </div>
            ))
          }
        </Card>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <Card>
          <CardTitle>Dernières ventes</CardTitle>
          {ventes.length===0?<div style={{color:theme.textMuted,fontSize:13}}>Aucune vente</div>:ventes.slice(0,4).map(v=>(
            <div key={v.id} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:`1px solid ${theme.borderLight}`}}>
              <div>
                <div style={{fontSize:13,fontWeight:600,color:theme.text}}>{v.produit}</div>
                <div style={{fontSize:11,color:theme.textMuted}}>{v.client} · {v.date}</div>
              </div>
              <div style={{fontWeight:700,color:"#30D158",fontSize:13}}>{fmt(v.prix_vente*v.qte)}</div>
            </div>
          ))}
        </Card>
        <Card>
          <CardTitle>Dernières dépenses</CardTitle>
          {depenses.length===0?<div style={{color:theme.textMuted,fontSize:13}}>Aucune dépense</div>:depenses.slice(0,4).map(d=>{
            const cat=getCat(config.catDepenses,d.cat);
            return (
              <div key={d.id} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:`1px solid ${theme.borderLight}`}}>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <span>{cat.icon}</span>
                  <div>
                    <div style={{fontSize:13,fontWeight:600,color:theme.text}}>{d.titre}</div>
                    <div style={{fontSize:11,color:theme.textMuted}}>{d.date}</div>
                  </div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:13,fontWeight:700,color:"#FF453A"}}>{fmt(d.montant)}</div>
                  <Badge s={d.statut}/>
                </div>
              </div>
            );
          })}
        </Card>
      </div>
    </div>
  );
}

// ─── Dépenses ─────────────────────────────────────────────────────────────────
function Depenses({depenses,setDepenses,stock,setStock,config,showToast}) {
  const {theme}=useTheme();
  const {devise,couleurPrincipale,catDepenses}=config;
  const fmt=(n)=>formatMontant(n,devise);
  const CATS_STOCK_IDS=["cat1","cat2"].concat(config.categories.map(c=>c.id));
  const [fCat,setFCat]=useState("all");
  const [fStat,setFStat]=useState("all");
  const [show,setShow]=useState(false);
  const [loading,setLoading]=useState(false);
  const [ajouterStock,setAjouterStock]=useState(false);
  const [stockForm,setStockForm]=useState({qte:"",prix_vente:"",seuil:"3"});
  const [form,setForm]=useState({titre:"",cat:catDepenses[0]?.id||"dep1",montant:"",date:today(),statut:"En attente",note:""});
  const [editId,setEditId]=useState(null);
  const [editForm,setEditForm]=useState({});

  const filtered=depenses.filter(d=>(fCat==="all"||d.cat===fCat)&&(fStat==="all"||d.statut===fStat));
  const total=filtered.filter(d=>d.statut==="Approuvée").reduce((s,d)=>s+d.montant,0);

  const add=()=>{
    if(!form.titre||!form.montant)return showToast("Titre et montant requis",true);
    const newDep={...form,id:Date.now(),montant:parseInt(form.montant)};
    let newStock=[...stock];
    if(ajouterStock&&stockForm.qte){
      const existant=stock.find(p=>p.nom===form.titre&&p.cat===form.cat);
      if(existant){
        newStock=stock.map(p=>p.id===existant.id?{...p,qte:p.qte+parseInt(stockForm.qte)}:p);
      } else {
        newStock=[...stock,{id:Date.now()+1,nom:form.titre,cat:form.cat,qte:parseInt(stockForm.qte),prix_achat:parseInt(form.montant/parseInt(stockForm.qte)),prix_vente:parseInt(stockForm.prix_vente)||0,seuil:parseInt(stockForm.seuil)||3}];
      }
      setStock(newStock);
      showToast("Dépense + Stock enregistrés ✓");
    } else {
      showToast("Dépense enregistrée ✓");
    }
    setDepenses([newDep,...depenses]);
    setForm({titre:"",cat:catDepenses[0]?.id||"dep1",montant:"",date:today(),statut:"En attente",note:""});
    setStockForm({qte:"",prix_vente:"",seuil:"3"});
    setAjouterStock(false);
    setShow(false);
    setLoading(false);
  };

  const del=(id)=>{setDepenses(depenses.filter(d=>d.id!==id));showToast("Supprimée");};
  const chStat=(id,statut)=>{setDepenses(depenses.map(d=>d.id===id?{...d,statut}:d));showToast("Statut mis à jour");};
  const startEdit=(d)=>{setEditId(d.id);setEditForm({titre:d.titre,cat:d.cat,montant:d.montant,date:d.date,statut:d.statut,note:d.note||""});};
  const saveEdit=()=>{setDepenses(depenses.map(d=>d.id===editId?{...d,...editForm,montant:parseInt(editForm.montant)}:d));setEditId(null);showToast("Modifiée ✓");};

  const isStockCat = config.categories.some(c=>c.id===form.cat) || form.cat==="cat1";

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <h1 style={{fontWeight:800,fontSize:26,letterSpacing:"-0.5px",margin:0,color:theme.text}}>Dépenses</h1>
        <BtnPri onClick={()=>{setShow(!show);setEditId(null);}} color={couleurPrincipale}>{show?"✕ Annuler":"+ Nouvelle dépense"}</BtnPri>
      </div>
      {show&&(
        <>
          <Card style={{marginBottom:12}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:12}}>
              <Inp label="Titre *" value={form.titre} onChange={e=>setForm({...form,titre:e.target.value})} placeholder="Description de la dépense"/>
              <Inp label={`Montant (${devise}) *`} type="number" value={form.montant} onChange={e=>setForm({...form,montant:e.target.value})} placeholder="0"/>
              <SelInput label="Catégorie" value={form.cat} onChange={e=>setForm({...form,cat:e.target.value})} options={catDepenses.map(c=>({v:c.id,l:`${c.icon} ${c.label}`}))}/>
              <Inp label="Date" type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/>
              <SelInput label="Statut" value={form.statut} onChange={e=>setForm({...form,statut:e.target.value})} options={["En attente","Approuvée","Rejetée"].map(s=>({v:s,l:s}))}/>
              <Inp label="Note" value={form.note} onChange={e=>setForm({...form,note:e.target.value})} placeholder="Optionnel"/>
            </div>
            <BtnPri onClick={add} color={couleurPrincipale}>Enregistrer</BtnPri>
          </Card>
          {isStockCat&&(
            <Card style={{marginBottom:16,borderColor:ajouterStock?`rgba(10,132,255,0.3)`:undefined}}>
              <div style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",marginBottom:ajouterStock?14:0}} onClick={()=>setAjouterStock(!ajouterStock)}>
                <div style={{width:20,height:20,borderRadius:6,background:ajouterStock?couleurPrincipale:theme.toggleBg,border:`2px solid ${ajouterStock?couleurPrincipale:theme.border}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  {ajouterStock&&<span style={{color:"#fff",fontSize:13,fontWeight:900}}>✓</span>}
                </div>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:theme.text}}>📦 Ajouter au stock automatiquement</div>
                  <div style={{fontSize:11,color:theme.textMuted}}>Ce produit sera ajouté à votre inventaire</div>
                </div>
              </div>
              {ajouterStock&&(
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
                  <Inp label="Quantité *" type="number" value={stockForm.qte} onChange={e=>setStockForm({...stockForm,qte:e.target.value})} placeholder="Ex: 5"/>
                  <Inp label={`Prix de vente (${devise})`} type="number" value={stockForm.prix_vente} onChange={e=>setStockForm({...stockForm,prix_vente:e.target.value})} placeholder="0"/>
                  <Inp label="Seuil alerte" type="number" value={stockForm.seuil} onChange={e=>setStockForm({...stockForm,seuil:e.target.value})} placeholder="3"/>
                </div>
              )}
            </Card>
          )}
        </>
      )}
      {editId&&(
        <Card style={{marginBottom:16,borderColor:"rgba(255,159,10,0.4)"}}>
          <div style={{fontSize:14,fontWeight:700,color:"#FF9F0A",marginBottom:14}}>✏️ Modifier</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:12}}>
            <Inp label="Titre" value={editForm.titre} onChange={e=>setEditForm({...editForm,titre:e.target.value})}/>
            <Inp label={`Montant (${devise})`} type="number" value={editForm.montant} onChange={e=>setEditForm({...editForm,montant:e.target.value})}/>
            <SelInput label="Catégorie" value={editForm.cat} onChange={e=>setEditForm({...editForm,cat:e.target.value})} options={catDepenses.map(c=>({v:c.id,l:`${c.icon} ${c.label}`}))}/>
            <Inp label="Date" type="date" value={editForm.date} onChange={e=>setEditForm({...editForm,date:e.target.value})}/>
            <SelInput label="Statut" value={editForm.statut} onChange={e=>setEditForm({...editForm,statut:e.target.value})} options={["En attente","Approuvée","Rejetée"].map(s=>({v:s,l:s}))}/>
            <Inp label="Note" value={editForm.note} onChange={e=>setEditForm({...editForm,note:e.target.value})}/>
          </div>
          <div style={{display:"flex",gap:10}}><BtnPri onClick={saveEdit} color={couleurPrincipale}>💾 Sauvegarder</BtnPri><BtnSec onClick={()=>setEditId(null)}>Annuler</BtnSec></div>
        </Card>
      )}
      <div style={{display:"flex",gap:10,marginBottom:14,alignItems:"center"}}>
        <SelFilter value={fCat} onChange={e=>setFCat(e.target.value)}>
          <option value="all">Toutes catégories</option>
          {catDepenses.map(c=><option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
        </SelFilter>
        <SelFilter value={fStat} onChange={e=>setFStat(e.target.value)}>
          <option value="all">Tous statuts</option>
          {["En attente","Approuvée","Rejetée"].map(s=><option key={s} value={s}>{s}</option>)}
        </SelFilter>
        <div style={{marginLeft:"auto",color:theme.textMuted,fontSize:13}}>Total approuvé : <strong style={{color:"#FF453A"}}>{fmt(total)}</strong></div>
      </div>
      <TableWrap>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr>{["Dépense","Catégorie","Date","Montant","Statut","Actions"].map(h=><Th key={h}>{h}</Th>)}</tr></thead>
          <tbody>
            {filtered.length===0&&<tr><Td colSpan={6} style={{textAlign:"center",color:theme.textMuted,padding:"2rem"}}>Aucune dépense</Td></tr>}
            {filtered.map(d=>{
              const cat=getCat(catDepenses,d.cat);
              return (
                <tr key={d.id}>
                  <Td><strong style={{color:theme.text}}>{d.titre}</strong>{d.note&&<div style={{fontSize:11,color:theme.textMuted}}>{d.note}</div>}</Td>
                  <Td><span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 9px",borderRadius:99,fontSize:11,fontWeight:600,background:cat.color+"22",color:cat.color}}>{cat.icon} {cat.label}</span></Td>
                  <Td style={{color:theme.textMuted,fontSize:13}}>{d.date}</Td>
                  <Td style={{fontWeight:700,color:"#FF453A"}}>{fmt(d.montant)}</Td>
                  <Td><Badge s={d.statut}/></Td>
                  <Td>
                    <div style={{display:"flex",gap:6}}>
                      <button style={{background:"rgba(255,159,10,0.12)",border:"1px solid #FF9F0A",color:"#FF9F0A",padding:"4px 8px",borderRadius:7,cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"inherit"}} onClick={()=>startEdit(d)}>✏️</button>
                      {d.statut!=="Approuvée"&&<button style={{background:"none",border:"1px solid #30D158",color:"#30D158",padding:"4px 8px",borderRadius:7,cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"inherit"}} onClick={()=>chStat(d.id,"Approuvée")}>✓</button>}
                      <button style={{background:"none",border:`1px solid ${theme.border}`,color:theme.textMuted,padding:"4px 8px",borderRadius:7,cursor:"pointer",fontSize:12,fontFamily:"inherit"}} onClick={()=>del(d.id)}>🗑</button>
                    </div>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </TableWrap>
    </div>
  );
}

// ─── Stock ────────────────────────────────────────────────────────────────────
function Stock({stock,setStock,ventes,setVentes,factures,setFactures,depenses,setDepenses,config,showToast,setPage}) {
  const {theme}=useTheme();
  const {devise,couleurPrincipale,categories}=config;
  const fmt=(n)=>formatMontant(n,devise);
  const [showAdd,setShowAdd]=useState(false);
  const [showVente,setShowVente]=useState(null);
  const [ajouterDepense,setAjouterDepense]=useState(false);
  const [form,setForm]=useState({nom:"",cat:categories[0]?.id||"cat1",qte:"",prix_achat:"",prix_vente:"",seuil:""});
  const [vf,setVf]=useState({qte:"",client:"",telephone:"",date:today(),creerFacture:true});
  const [fCat,setFCat]=useState("all");
  const [editId,setEditId]=useState(null);
  const [editForm,setEditForm]=useState({});
  const filtered=stock.filter(p=>fCat==="all"||p.cat===fCat);

  const startEdit=(p)=>{setEditId(p.id);setEditForm({nom:p.nom,cat:p.cat,qte:p.qte,prix_achat:p.prix_achat,prix_vente:p.prix_vente,seuil:p.seuil});setShowAdd(false);setShowVente(null);};
  const saveEdit=()=>{setStock(stock.map(p=>p.id===editId?{...p,...editForm,qte:parseInt(editForm.qte),prix_achat:parseInt(editForm.prix_achat),prix_vente:parseInt(editForm.prix_vente),seuil:parseInt(editForm.seuil)||0}:p));setEditId(null);showToast("Modifié ✓");};

  const addProd=()=>{
    if(!form.nom||!form.qte||!form.prix_achat||!form.prix_vente)return showToast("Remplissez tous les champs",true);
    const newProd={...form,id:Date.now(),qte:parseInt(form.qte),prix_achat:parseInt(form.prix_achat),prix_vente:parseInt(form.prix_vente),seuil:parseInt(form.seuil)||0};
    setStock([newProd,...stock]);
    if(ajouterDepense&&form.prix_achat){
      const montantTotal=parseInt(form.prix_achat)*parseInt(form.qte);
      const newDep={id:Date.now()+1,titre:form.nom,cat:form.cat,montant:montantTotal,date:today(),statut:"En attente",note:`Achat stock x${form.qte}`};
      setDepenses([newDep,...depenses]);
      showToast("Produit + Dépense enregistrés ✓");
    } else { showToast("Produit ajouté ✓"); }
    setForm({nom:"",cat:categories[0]?.id||"cat1",qte:"",prix_achat:"",prix_vente:"",seuil:""});
    setAjouterDepense(false);
    setShowAdd(false);
  };

  const vendre=()=>{
    const p=stock.find(x=>x.id===showVente);
    if(!p||!vf.qte||parseInt(vf.qte)>p.qte)return showToast("Quantité invalide",true);
    const q=parseInt(vf.qte);
    setStock(stock.map(x=>x.id===showVente?{...x,qte:x.qte-q}:x));
    const newVente={id:Date.now(),produit:p.nom,cat:p.cat,qte:q,prix_vente:p.prix_vente,date:vf.date,client:vf.client||"—"};
    setVentes([newVente,...ventes]);
    if(vf.creerFacture){
      const numero=`FAC-${new Date().getFullYear()}-${String(factures.length+1).padStart(3,"0")}`;
      const lignes=JSON.stringify([{desc:p.nom,cat:p.cat,qte:q,pu:p.prix_vente,details:{}}]);
      const newFac={id:Date.now()+2,numero,client:vf.client||"—",telephone:vf.telephone||"",email:"",adresse:"",date:vf.date,note:"Merci pour votre confiance",lignes,total:q*p.prix_vente};
      setFactures([newFac,...factures]);
      showToast("Vente + Facture créées ✓");
      setPage("factures");
    } else { showToast("Vente enregistrée ✓"); }
    setVf({qte:"",client:"",telephone:"",date:today(),creerFacture:true});
    setShowVente(null);
  };

  const del=(id)=>{setStock(stock.filter(p=>p.id!==id));showToast("Supprimé");};
  const adj=(id,delta)=>setStock(stock.map(p=>p.id===id?{...p,qte:Math.max(0,p.qte+delta)}:p));

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <h1 style={{fontWeight:800,fontSize:26,letterSpacing:"-0.5px",margin:0,color:theme.text}}>Stock</h1>
        <BtnPri onClick={()=>setShowAdd(!showAdd)} color={couleurPrincipale}>{showAdd?"✕ Annuler":"+ Ajouter produit"}</BtnPri>
      </div>
      {showAdd&&(
        <Card style={{marginBottom:12}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:12}}>
            <Inp label="Nom *" value={form.nom} onChange={e=>setForm({...form,nom:e.target.value})} placeholder="Nom du produit"/>
            <SelInput label="Catégorie" value={form.cat} onChange={e=>setForm({...form,cat:e.target.value})} options={categories.map(c=>({v:c.id,l:`${c.icon} ${c.label}`}))}/>
            <Inp label="Quantité *" type="number" value={form.qte} onChange={e=>setForm({...form,qte:e.target.value})} placeholder="0"/>
            <Inp label={`Prix achat (${devise}) *`} type="number" value={form.prix_achat} onChange={e=>setForm({...form,prix_achat:e.target.value})} placeholder="0"/>
            <Inp label={`Prix vente (${devise}) *`} type="number" value={form.prix_vente} onChange={e=>setForm({...form,prix_vente:e.target.value})} placeholder="0"/>
            <Inp label="Seuil alerte" type="number" value={form.seuil} onChange={e=>setForm({...form,seuil:e.target.value})} placeholder="3"/>
          </div>
          {form.prix_achat&&form.qte&&(
            <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:10,
              background:ajouterDepense?"rgba(255,69,58,0.08)":"rgba(255,255,255,0.04)",
              border:`1px solid ${ajouterDepense?"rgba(255,69,58,0.3)":theme.border}`,marginBottom:14,cursor:"pointer"}}
              onClick={()=>setAjouterDepense(!ajouterDepense)}>
              <div style={{width:20,height:20,borderRadius:6,background:ajouterDepense?"#FF453A":theme.toggleBg,border:`2px solid ${ajouterDepense?"#FF453A":theme.border}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                {ajouterDepense&&<span style={{color:"#fff",fontSize:13,fontWeight:900}}>✓</span>}
              </div>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:theme.text}}>📤 Enregistrer comme dépense</div>
                <div style={{fontSize:11,color:theme.textMuted}}>Total : <strong style={{color:"#FF453A"}}>{fmt(parseInt(form.prix_achat||0)*parseInt(form.qte||0))}</strong></div>
              </div>
            </div>
          )}
          <BtnPri onClick={addProd} color={couleurPrincipale}>Ajouter au stock</BtnPri>
        </Card>
      )}
      {showVente!==null&&(()=>{
        const p=stock.find(x=>x.id===showVente);
        return p?(
          <Card style={{marginBottom:16,borderColor:"rgba(48,209,88,0.3)"}}>
            <div style={{fontSize:14,fontWeight:700,color:"#30D158",marginBottom:14}}>💸 Vente — {p.nom}</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:12}}>
              <Inp label={`Quantité (max: ${p.qte})`} type="number" value={vf.qte} onChange={e=>setVf({...vf,qte:e.target.value})} placeholder="1"/>
              <Inp label="Nom du client" value={vf.client} onChange={e=>setVf({...vf,client:e.target.value})} placeholder="Nom du client"/>
              <Inp label="Téléphone" value={vf.telephone} onChange={e=>setVf({...vf,telephone:e.target.value})} placeholder="Téléphone"/>
              <Inp label="Date" type="date" value={vf.date} onChange={e=>setVf({...vf,date:e.target.value})}/>
            </div>
            {vf.qte&&<div style={{fontSize:13,color:theme.textMuted,marginBottom:12}}>Total : <strong style={{color:"#30D158"}}>{fmt(parseInt(vf.qte||0)*p.prix_vente)}</strong></div>}
            <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:10,
              background:vf.creerFacture?"rgba(48,209,88,0.08)":"rgba(255,255,255,0.04)",
              border:`1px solid ${vf.creerFacture?"rgba(48,209,88,0.3)":theme.border}`,marginBottom:14,cursor:"pointer"}}
              onClick={()=>setVf({...vf,creerFacture:!vf.creerFacture})}>
              <div style={{width:20,height:20,borderRadius:6,background:vf.creerFacture?"#30D158":theme.toggleBg,border:`2px solid ${vf.creerFacture?"#30D158":theme.border}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                {vf.creerFacture&&<span style={{color:"#fff",fontSize:13,fontWeight:900}}>✓</span>}
              </div>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:theme.text}}>🧾 Créer une facture automatiquement</div>
                <div style={{fontSize:11,color:theme.textMuted}}>Une facture sera générée et prête à imprimer</div>
              </div>
            </div>
            <div style={{display:"flex",gap:10}}>
              <BtnPri onClick={vendre} color={couleurPrincipale}>{vf.creerFacture?"Vendre + Facturer":"Confirmer la vente"}</BtnPri>
              <BtnSec onClick={()=>{setShowVente(null);setVf({qte:"",client:"",telephone:"",date:today(),creerFacture:true});}}>Annuler</BtnSec>
            </div>
          </Card>
        ):null;
      })()}
      {editId&&(
        <Card style={{marginBottom:16,borderColor:"rgba(255,159,10,0.4)"}}>
          <div style={{fontSize:14,fontWeight:700,color:"#FF9F0A",marginBottom:14}}>✏️ Modifier le produit</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:12}}>
            <Inp label="Nom" value={editForm.nom} onChange={e=>setEditForm({...editForm,nom:e.target.value})}/>
            <SelInput label="Catégorie" value={editForm.cat} onChange={e=>setEditForm({...editForm,cat:e.target.value})} options={categories.map(c=>({v:c.id,l:`${c.icon} ${c.label}`}))}/>
            <Inp label="Quantité" type="number" value={editForm.qte} onChange={e=>setEditForm({...editForm,qte:e.target.value})}/>
            <Inp label={`Prix achat (${devise})`} type="number" value={editForm.prix_achat} onChange={e=>setEditForm({...editForm,prix_achat:e.target.value})}/>
            <Inp label={`Prix vente (${devise})`} type="number" value={editForm.prix_vente} onChange={e=>setEditForm({...editForm,prix_vente:e.target.value})}/>
            <Inp label="Seuil" type="number" value={editForm.seuil} onChange={e=>setEditForm({...editForm,seuil:e.target.value})}/>
          </div>
          <div style={{display:"flex",gap:10}}><BtnPri onClick={saveEdit} color={couleurPrincipale}>💾 Sauvegarder</BtnPri><BtnSec onClick={()=>setEditId(null)}>Annuler</BtnSec></div>
        </Card>
      )}
      <div style={{display:"flex",gap:10,marginBottom:14,alignItems:"center"}}>
        <SelFilter value={fCat} onChange={e=>setFCat(e.target.value)}>
          <option value="all">Toutes catégories</option>
          {categories.map(c=><option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
        </SelFilter>
        <div style={{marginLeft:"auto",fontSize:13,color:theme.textMuted}}>Valeur : <strong style={{color:"#FF9F0A"}}>{fmt(stock.reduce((s,p)=>s+p.prix_achat*p.qte,0))}</strong></div>
      </div>
      <TableWrap>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr>{["Produit","Cat.","Qté","Prix achat","Prix vente","Marge","Statut","Actions"].map(h=><Th key={h}>{h}</Th>)}</tr></thead>
          <tbody>
            {filtered.length===0&&<tr><Td colSpan={8} style={{textAlign:"center",color:theme.textMuted,padding:"2rem"}}>Aucun produit</Td></tr>}
            {filtered.map(p=>{
              const cat=getCat(categories,p.cat);
              const marge=p.prix_achat>0?Math.round(((p.prix_vente-p.prix_achat)/p.prix_achat)*100):0;
              const bas=p.qte<=p.seuil;
              return (
                <tr key={p.id}>
                  <Td><strong style={{color:theme.text}}>{p.nom}</strong></Td>
                  <Td>{cat.icon} {cat.label}</Td>
                  <Td>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <button style={{background:theme.toggleBg,border:`1px solid ${theme.border}`,color:theme.text,width:22,height:22,borderRadius:5,cursor:"pointer",fontWeight:700,fontFamily:"inherit"}} onClick={()=>adj(p.id,-1)}>−</button>
                      <span style={{fontWeight:700,color:bas?"#FF453A":"#30D158",minWidth:24,textAlign:"center"}}>{p.qte}</span>
                      <button style={{background:theme.toggleBg,border:`1px solid ${theme.border}`,color:theme.text,width:22,height:22,borderRadius:5,cursor:"pointer",fontWeight:700,fontFamily:"inherit"}} onClick={()=>adj(p.id,1)}>+</button>
                    </div>
                  </Td>
                  <Td style={{color:theme.textMuted}}>{fmt(p.prix_achat)}</Td>
                  <Td style={{fontWeight:700,color:"#30D158"}}>{fmt(p.prix_vente)}</Td>
                  <Td><span style={{color:"#FF9F0A",fontWeight:700}}>+{marge}%</span></Td>
                  <Td>{p.qte===0?<span style={{color:"#FF453A",fontWeight:700,fontSize:12}}>RUPTURE</span>:bas?<span style={{color:"#FF9F0A",fontWeight:700,fontSize:12}}>⚠️ BAS</span>:<span style={{color:"#30D158",fontSize:12}}>✓ OK</span>}</Td>
                  <Td>
                    <div style={{display:"flex",gap:6}}>
                      <button style={{background:"rgba(255,159,10,0.12)",border:"1px solid #FF9F0A",color:"#FF9F0A",padding:"4px 8px",borderRadius:7,cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"inherit"}} onClick={()=>startEdit(p)}>✏️</button>
                      <button style={{background:"rgba(48,209,88,0.12)",border:"1px solid #30D158",color:"#30D158",padding:"4px 10px",borderRadius:7,cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:"inherit"}} onClick={()=>setShowVente(p.id)}>💸 Vendre</button>
                      <button style={{background:"none",border:`1px solid ${theme.border}`,color:theme.textMuted,padding:"4px 8px",borderRadius:7,cursor:"pointer",fontSize:12,fontFamily:"inherit"}} onClick={()=>del(p.id)}>🗑</button>
                    </div>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </TableWrap>
    </div>
  );
}

// ─── Factures ─────────────────────────────────────────────────────────────────
function Factures({factures,setFactures,stock,config,showToast}) {
  const {theme}=useTheme();
  const {devise,couleurPrincipale,nom,adresse,telephone,email}=config;
  const fmt=(n)=>formatMontant(n,devise);
  const [show,setShow]=useState(false);
  const [preview,setPreview]=useState(null);
  const printRef=useRef();
  const [lignes,setLignes]=useState([{desc:"",cat:"",qte:1,pu:0}]);
  const [form,setForm]=useState({client:"",email:"",telephone:"",adresse:"",date:today(),note:""});

  const totalLignes=lignes.reduce((s,l)=>s+l.qte*l.pu,0);
  const numFacture=()=>`FAC-${new Date().getFullYear()}-${String(factures.length+1).padStart(3,"0")}`;
  const addLigne=()=>setLignes([...lignes,{desc:"",cat:"",qte:1,pu:0}]);
  const updLigne=(i,field,val)=>setLignes(lignes.map((l,idx)=>{
    if(idx!==i)return l;
    if(field==="produit"){const p=stock.find(x=>x.nom===val);return {...l,desc:val,pu:p?p.prix_vente:l.pu};}
    if(field==="qte"||field==="pu")return {...l,[field]:Number(val)};
    return {...l,[field]:val};
  }));
  const delLigne=(i)=>setLignes(lignes.filter((_,idx)=>idx!==i));

  const creerFacture=()=>{
    if(!form.client||lignes.some(l=>!l.desc))return showToast("Client et articles requis",true);
    const numero=numFacture();
    const newFac={id:Date.now(),numero,client:form.client,email:form.email,telephone:form.telephone,adresse:form.adresse,date:form.date,note:form.note,lignes:JSON.stringify(lignes),total:totalLignes};
    setFactures([newFac,...factures]);
    setPreview(newFac);
    setShow(false);
    setForm({client:"",email:"",telephone:"",adresse:"",date:today(),note:""});
    setLignes([{desc:"",cat:"",qte:1,pu:0}]);
    showToast("Facture créée ✓");
  };

  const imprimer=()=>{
    const content=printRef.current.innerHTML;
    const w=window.open("","_blank");
    w.document.write(`<html><head><title>Facture ${nom}</title><style>*{box-sizing:border-box;}body{font-family:Arial,sans-serif;margin:0;padding:40px;color:#1C1C1E;}table{width:100%;border-collapse:collapse;}th{background:#f5f5f7;padding:10px;text-align:left;font-size:12px;font-weight:700;}td{padding:10px;border-bottom:1px solid #e5e5ea;font-size:13px;}</style></head><body>${content}</body></html>`);
    w.document.close();w.print();
  };

  const del=(id)=>{setFactures(factures.filter(f=>f.id!==id));if(preview?.id===id)setPreview(null);showToast("Supprimée");};

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <h1 style={{fontWeight:800,fontSize:26,letterSpacing:"-0.5px",margin:0,color:theme.text}}>Factures</h1>
        <div style={{display:"flex",gap:8}}>
          {preview&&<BtnSec onClick={imprimer}>🖨️ Imprimer</BtnSec>}
          <BtnPri onClick={()=>{setShow(!show);setPreview(null);}} color={couleurPrincipale}>{show?"✕ Annuler":"+ Nouvelle facture"}</BtnPri>
        </div>
      </div>
      {show&&(
        <Card style={{marginBottom:20}}>
          <div style={{fontSize:15,fontWeight:700,color:theme.text,marginBottom:16}}>Nouvelle facture — {numFacture()}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
            <Inp label="Nom du client *" value={form.client} onChange={e=>setForm({...form,client:e.target.value})} placeholder="Nom du client"/>
            <Inp label="Téléphone" value={form.telephone} onChange={e=>setForm({...form,telephone:e.target.value})} placeholder="Téléphone"/>
            <Inp label="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="Email"/>
            <Inp label="Adresse" value={form.adresse} onChange={e=>setForm({...form,adresse:e.target.value})} placeholder="Adresse"/>
            <Inp label="Date" type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/>
            <Inp label="Note" value={form.note} onChange={e=>setForm({...form,note:e.target.value})} placeholder="Note optionnelle"/>
          </div>
          <div style={{fontSize:13,fontWeight:700,color:theme.textMuted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>Articles</div>
          {lignes.map((l,i)=>(
            <div key={i} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr auto",gap:8,marginBottom:8,alignItems:"center"}}>
              <div>
                {stock.length>0?(
                  <select value={l.desc} onChange={e=>updLigne(i,"produit",e.target.value)}
                    style={{width:"100%",background:theme.sel,border:`1px solid ${theme.inputBorder}`,borderRadius:8,padding:"8px 10px",color:theme.text,fontSize:13,fontFamily:"inherit",cursor:"pointer"}}>
                    <option value="">-- Choisir un produit --</option>
                    {stock.map(p=><option key={p.id} value={p.nom}>{p.nom} ({fmt(p.prix_vente)})</option>)}
                    <option value="__custom__">✏️ Saisie libre</option>
                  </select>
                ):(
                  <input value={l.desc} onChange={e=>updLigne(i,"desc",e.target.value)} placeholder="Description"
                    style={{width:"100%",background:theme.input,border:`1px solid ${theme.inputBorder}`,borderRadius:8,padding:"8px 10px",color:theme.text,fontSize:13,fontFamily:"inherit",outline:"none"}}/>
                )}
              </div>
              <input type="number" value={l.qte} onChange={e=>updLigne(i,"qte",e.target.value)} placeholder="Qté"
                style={{background:theme.input,border:`1px solid ${theme.inputBorder}`,borderRadius:8,padding:"8px 10px",color:theme.text,fontSize:13,fontFamily:"inherit",outline:"none"}}/>
              <input type="number" value={l.pu} onChange={e=>updLigne(i,"pu",e.target.value)} placeholder="Prix"
                style={{background:theme.input,border:`1px solid ${theme.inputBorder}`,borderRadius:8,padding:"8px 10px",color:theme.text,fontSize:13,fontFamily:"inherit",outline:"none"}}/>
              <div style={{fontWeight:700,color:"#30D158",fontSize:13,textAlign:"right"}}>{fmt(l.qte*l.pu)}</div>
              <button onClick={()=>delLigne(i)} style={{background:"none",border:`1px solid ${theme.border}`,color:"#FF453A",padding:"8px 10px",borderRadius:8,cursor:"pointer",fontSize:14}}>✕</button>
            </div>
          ))}
          <button onClick={addLigne} style={{background:"none",border:`1px dashed ${theme.border}`,color:theme.textMuted,padding:"8px 16px",borderRadius:9,cursor:"pointer",fontSize:13,fontFamily:"inherit",width:"100%",marginBottom:16}}>+ Ajouter un article</button>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{fontSize:20,fontWeight:800,color:couleurPrincipale}}>Total : {fmt(totalLignes)}</div>
            <BtnPri onClick={creerFacture} color={couleurPrincipale}>Créer la facture</BtnPri>
          </div>
        </Card>
      )}
      {preview&&(()=>{
        const lignesParsed=typeof preview.lignes==="string"?JSON.parse(preview.lignes):preview.lignes;
        return (
          <Card style={{marginBottom:20,border:`1px solid ${couleurPrincipale}44`}}>
            <div ref={printRef} style={{background:"#fff",color:"#1C1C1E",padding:"40px",borderRadius:12,fontFamily:"Arial,sans-serif"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:32,paddingBottom:24,borderBottom:`3px solid ${couleurPrincipale}`}}>
                <div>
                  <div style={{fontSize:24,fontWeight:900,color:"#1C1C1E"}}>{nom}</div>
                  {adresse&&<div style={{fontSize:12,color:"#636366",marginTop:4}}>📍 {adresse}</div>}
                  {telephone&&<div style={{fontSize:12,color:"#636366"}}>📞 {telephone}</div>}
                  {email&&<div style={{fontSize:12,color:"#636366"}}>✉️ {email}</div>}
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:28,fontWeight:900,color:couleurPrincipale}}>FACTURE</div>
                  <div style={{fontSize:16,fontWeight:700}}>#{preview.numero}</div>
                  <div style={{fontSize:13,color:"#636366",marginTop:4}}>Date : {preview.date}</div>
                </div>
              </div>
              <div style={{marginBottom:28}}>
                <div style={{fontSize:11,fontWeight:700,color:"#636366",textTransform:"uppercase",marginBottom:8}}>Facturé à</div>
                <div style={{fontSize:16,fontWeight:700}}>{preview.client}</div>
                {preview.telephone&&<div style={{fontSize:13,color:"#636366"}}>📞 {preview.telephone}</div>}
                {preview.email&&<div style={{fontSize:13,color:"#636366"}}>✉️ {preview.email}</div>}
                {preview.adresse&&<div style={{fontSize:13,color:"#636366"}}>📍 {preview.adresse}</div>}
              </div>
              <table style={{width:"100%",borderCollapse:"collapse",marginBottom:24}}>
                <thead>
                  <tr style={{background:"#f5f5f7"}}>
                    {["Description","Qté","Prix unit.","Total"].map(h=>(
                      <th key={h} style={{padding:"10px 12px",textAlign:"left",fontSize:12,fontWeight:700,color:"#636366",textTransform:"uppercase"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lignesParsed.map((l,i)=>(
                    <tr key={i} style={{borderBottom:"1px solid #e5e5ea"}}>
                      <td style={{padding:"12px",fontSize:14,fontWeight:600}}>{l.desc}</td>
                      <td style={{padding:"12px",fontSize:14,color:"#636366",textAlign:"center"}}>{l.qte}</td>
                      <td style={{padding:"12px",fontSize:14,color:"#636366",textAlign:"right"}}>{fmt(l.pu)}</td>
                      <td style={{padding:"12px",fontSize:14,fontWeight:700,textAlign:"right"}}>{fmt(l.qte*l.pu)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{display:"flex",justifyContent:"flex-end",marginBottom:24}}>
                <div style={{background:"#f5f5f7",borderRadius:12,padding:"16px 24px",textAlign:"right"}}>
                  <div style={{fontSize:13,color:"#636366",marginBottom:4}}>Total TTC</div>
                  <div style={{fontSize:28,fontWeight:900,color:couleurPrincipale}}>{fmt(preview.total)}</div>
                </div>
              </div>
              {preview.note&&<div style={{borderTop:"1px solid #e5e5ea",paddingTop:16,fontSize:13,color:"#636366",fontStyle:"italic"}}>{preview.note}</div>}
              <div style={{marginTop:32,paddingTop:16,borderTop:`2px solid ${couleurPrincipale}`,textAlign:"center",fontSize:11,color:"#8E8E93"}}>
                {nom} {adresse&&`· ${adresse}`} {telephone&&`· ${telephone}`} · Merci pour votre confiance 🙏
              </div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:16}}>
              <BtnPri onClick={imprimer} color={couleurPrincipale}>🖨️ Imprimer / PDF</BtnPri>
              <BtnSec onClick={()=>setPreview(null)}>Fermer</BtnSec>
            </div>
          </Card>
        );
      })()}
      <TableWrap>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr>{["Numéro","Client","Date","Total","Actions"].map(h=><Th key={h}>{h}</Th>)}</tr></thead>
          <tbody>
            {factures.length===0&&<tr><Td colSpan={5} style={{textAlign:"center",color:theme.textMuted,padding:"2rem"}}>Aucune facture</Td></tr>}
            {factures.map(f=>(
              <tr key={f.id}>
                <Td><strong style={{color:couleurPrincipale}}>#{f.numero}</strong></Td>
                <Td style={{fontWeight:600}}>{f.client}</Td>
                <Td style={{color:theme.textMuted,fontSize:13}}>{f.date}</Td>
                <Td style={{fontWeight:700,color:couleurPrincipale}}>{fmt(f.total)}</Td>
                <Td>
                  <div style={{display:"flex",gap:6}}>
                    <button style={{background:`${couleurPrincipale}22`,border:`1px solid ${couleurPrincipale}`,color:couleurPrincipale,padding:"4px 10px",borderRadius:7,cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:"inherit"}} onClick={()=>setPreview(f)}>👁 Voir</button>
                    <button style={{background:"none",border:`1px solid ${theme.border}`,color:theme.textMuted,padding:"4px 8px",borderRadius:7,cursor:"pointer",fontSize:12,fontFamily:"inherit"}} onClick={()=>del(f.id)}>🗑</button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableWrap>
    </div>
  );
}

// ─── Bénéfices ────────────────────────────────────────────────────────────────
function Benefices({depenses,ventes,stock,config}) {
  const {theme}=useTheme();
  const {devise,couleurPrincipale}=config;
  const fmt=(n)=>formatMontant(n,devise);
  const [periode,setPeriode]=useState("all");
  const now=new Date();
  const fDate=d=>{if(periode==="all")return true;const dt=new Date(d);if(periode==="mois")return dt.getMonth()===now.getMonth()&&dt.getFullYear()===now.getFullYear();if(periode==="semaine")return(now-dt)<7*24*3600*1000;return true;};
  const vF=ventes.filter(v=>fDate(v.date));
  const dF=depenses.filter(d=>d.statut==="Approuvée"&&fDate(d.date));
  const CA=vF.reduce((s,v)=>s+v.prix_vente*v.qte,0);
  const cout=dF.reduce((s,d)=>s+d.montant,0);
  const ben=CA-cout;
  const marge=CA>0?Math.round((ben/CA)*100):0;
  const byProd={};
  vF.forEach(v=>{if(!byProd[v.produit])byProd[v.produit]={produit:v.produit,qte:0,ca:0};byProd[v.produit].qte+=v.qte;byProd[v.produit].ca+=v.prix_vente*v.qte;});
  const top=Object.values(byProd).sort((a,b)=>b.ca-a.ca);

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <h1 style={{fontWeight:800,fontSize:26,letterSpacing:"-0.5px",margin:0,color:theme.text}}>Bénéfices & Analyse</h1>
        <div style={{display:"flex",gap:8}}>
          {[["all","Tout"],["mois","Ce mois"],["semaine","Cette semaine"]].map(([v,l])=>(
            <button key={v} onClick={()=>setPeriode(v)} style={{padding:"7px 14px",borderRadius:9,border:"1px solid",cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"inherit",
              borderColor:periode===v?couleurPrincipale:theme.border,
              background:periode===v?couleurPrincipale+"22":theme.toggleBg,
              color:periode===v?couleurPrincipale:theme.textMuted}}>{l}</button>
          ))}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:22}}>
        <KPI label="Chiffre d'affaires" value={fmt(CA)} accent={couleurPrincipale} icon="💰" sub={`${vF.length} ventes`}/>
        <KPI label="Total dépenses" value={fmt(cout)} accent="#FF453A" icon="📤" sub={`${dF.length} entrées`}/>
        <KPI label="Bénéfice net" value={fmt(ben)} accent={ben>=0?"#30D158":"#FF453A"} icon={ben>=0?"📈":"📉"} sub="CA − dépenses"/>
        <KPI label="Taux de marge" value={`${marge}%`} accent="#FF9F0A" icon="%" sub="Bénéfice / CA"/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <Card>
          <CardTitle>Top produits vendus</CardTitle>
          {top.length===0?<div style={{color:theme.textMuted,fontSize:13}}>Aucune vente</div>:top.map((p,i)=>(
            <div key={p.produit} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${theme.borderLight}`}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:22,height:22,borderRadius:6,background:couleurPrincipale+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:couleurPrincipale}}>{i+1}</div>
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:theme.text}}>{p.produit}</div>
                  <div style={{fontSize:11,color:theme.textMuted}}>×{p.qte} vendu{p.qte>1?"s":""}</div>
                </div>
              </div>
              <div style={{fontWeight:700,color:"#30D158",fontSize:13}}>{fmt(p.ca)}</div>
            </div>
          ))}
        </Card>
        <Card>
          <CardTitle>Résumé financier</CardTitle>
          {[["Chiffre d'affaires",couleurPrincipale,CA],["Dépenses","#FF453A",-cout],["Bénéfice net",ben>=0?"#30D158":"#FF453A",ben]].map(([l,c,v])=>(
            <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:`1px solid ${theme.borderLight}`}}>
              <div style={{fontSize:14,color:theme.textSub}}>{l}</div>
              <div style={{fontWeight:800,color:c,fontSize:16}}>{v<0?"-":""}{fmt(Math.abs(v))}</div>
            </div>
          ))}
          <div style={{marginTop:16,padding:"14px",background:couleurPrincipale+"11",borderRadius:10,textAlign:"center"}}>
            <div style={{fontSize:12,color:theme.textMuted,marginBottom:4}}>Marge bénéficiaire</div>
            <div style={{fontSize:32,fontWeight:900,color:marge>=0?"#30D158":"#FF453A"}}>{marge}%</div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── App Root ─────────────────────────────────────────────────────────────────
export default function App() {
  const [dark,setDark]=useState(()=>window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches);
  const theme=dark?DARK:LIGHT;
  const [config,setConfig]=useState(()=>loadConfig());
  const [page,setPage]=useState("dashboard");
  const [depenses,setDepenses]=useState([]);
  const [stock,setStock]=useState([]);
  const [ventes,setVentes]=useState([]);
  const [factures,setFactures]=useState([]);
  const [toast,setToast]=useState(null);

  useEffect(()=>{
    const mq=window.matchMedia("(prefers-color-scheme: dark)");
    const h=(e)=>setDark(e.matches);
    mq.addEventListener("change",h);
    return ()=>mq.removeEventListener("change",h);
  },[]);

  const showToast=(msg,err=false)=>{setToast({msg,err});setTimeout(()=>setToast(null),3000);};

  if(!config) return (
    <ThemeCtx.Provider value={{dark,toggle:()=>setDark(d=>!d),theme}}>
      <SetupScreen onDone={(c)=>setConfig(c)}/>
    </ThemeCtx.Provider>
  );

  const NAV=[
    {id:"dashboard",label:"Dashboard",icon:"◈"},
    {id:"depenses", label:"Dépenses",  icon:"📤"},
    {id:"stock",    label:"Stock",     icon:"📦"},
    {id:"factures", label:"Factures",  icon:"🧾"},
    {id:"benefices",label:"Bénéfices", icon:"📈"},
  ];
  const alertes=stock.filter(p=>p.qte<=p.seuil).length;
  const {couleurPrincipale,nom,adresse}=config;

  return (
    <ThemeCtx.Provider value={{dark,toggle:()=>setDark(d=>!d),theme}}>
      <div style={{minHeight:"100vh",background:theme.bg,color:theme.text,fontFamily:"'SF Pro Display','Segoe UI',system-ui,sans-serif",display:"flex",flexDirection:"column",transition:"background 0.25s"}}>

        <header style={{background:theme.bgHeader,backdropFilter:"blur(20px)",borderBottom:`1px solid ${theme.border}`,position:"sticky",top:0,zIndex:100,boxShadow:theme.shadow}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 24px"}}>
            <div>
              <div style={{fontWeight:900,fontSize:20,color:couleurPrincipale,letterSpacing:"-0.5px"}}>{nom}</div>
              {adresse&&<div style={{fontSize:11,color:theme.textMuted}}>📍 {adresse}</div>}
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{fontSize:11,color:theme.textMuted}}>{new Date().toLocaleDateString("fr-FR",{weekday:"short",day:"numeric",month:"long"})}</div>
              <button onClick={()=>setDark(d=>!d)} style={{background:theme.toggleBg,border:"none",borderRadius:20,padding:"6px 12px",cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
                <span style={{fontSize:16}}>{dark?"☀️":"🌙"}</span>
              </button>
              <button onClick={()=>{if(window.confirm("Reconfigurer le logiciel ?"))setConfig(null);}} style={{background:"none",border:`1px solid ${theme.border}`,color:theme.textMuted,padding:"6px 12px",borderRadius:10,cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>⚙️</button>
            </div>
          </div>
          <div style={{display:"flex",gap:4,padding:"0 24px 10px",flexWrap:"wrap"}}>
            {NAV.map(n=>(
              <button key={n.id} onClick={()=>setPage(n.id)}
                style={{padding:"6px 14px",borderRadius:10,border:"1px solid",cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"inherit",transition:"all 0.15s",
                  borderColor:page===n.id?couleurPrincipale+"66":theme.border,
                  background:page===n.id?couleurPrincipale+"18":theme.toggleBg,
                  color:page===n.id?couleurPrincipale:theme.textMuted,
                  display:"flex",alignItems:"center",gap:5}}>
                {n.icon} {n.label}
                {n.id==="stock"&&alertes>0&&<span style={{background:"#FF453A",color:"#fff",borderRadius:99,padding:"1px 5px",fontSize:10,fontWeight:800}}>{alertes}</span>}
              </button>
            ))}
          </div>
        </header>

        <main style={{flex:1,padding:"28px",maxWidth:1400,width:"100%",margin:"0 auto",boxSizing:"border-box"}}>
          {page==="dashboard" &&<Dashboard  depenses={depenses} stock={stock} ventes={ventes} factures={factures} config={config}/>}
          {page==="depenses"  &&<Depenses   depenses={depenses} setDepenses={setDepenses} stock={stock} setStock={setStock} config={config} showToast={showToast}/>}
          {page==="stock"     &&<Stock      stock={stock} setStock={setStock} ventes={ventes} setVentes={setVentes} factures={factures} setFactures={setFactures} depenses={depenses} setDepenses={setDepenses} config={config} showToast={showToast} setPage={setPage}/>}
          {page==="factures"  &&<Factures   factures={factures} setFactures={setFactures} stock={stock} config={config} showToast={showToast}/>}
          {page==="benefices" &&<Benefices  depenses={depenses} ventes={ventes} stock={stock} config={config}/>}
        </main>

        <footer style={{textAlign:"center",padding:"12px",fontSize:11,color:theme.textFaint,borderTop:`1px solid ${theme.border}`}}>
          {nom} · Logiciel de gestion 🚀
        </footer>
        {toast&&<Toast msg={toast.msg} err={toast.err}/>}
      </div>
    </ThemeCtx.Provider>
  );
}
