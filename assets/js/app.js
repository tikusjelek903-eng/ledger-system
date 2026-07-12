const seedWallets=[
{id:1,name:"Ledger",type:"Crypto",balance:0,color:"blue"},
{id:2,name:"BCA",type:"Bank",balance:0,color:"green"},
{id:3,name:"Kas",type:"Kas",balance:0,color:"orange"}
];
const seedTransactions=[
{id:1,date:"2024-04-24",note:"Saldo awal",wallet:"Ledger",type:"in",amount:30000,rate:16300,reference:""},
{id:2,date:"2024-04-24",note:"Transfer masuk",wallet:"Ledger",type:"in",amount:31336.39,rate:16300,reference:""},
{id:3,date:"2024-04-24",note:"Transfer masuk",wallet:"BCA",type:"in",amount:7001,rate:16300,reference:""},
{id:4,date:"2024-04-25",note:"Transfer masuk",wallet:"Ledger",type:"in",amount:9231.47,rate:16300,reference:""},
{id:5,date:"2024-04-27",note:"Pengeluaran operasional",wallet:"Kas",type:"out",amount:30000,rate:16300,reference:""},
{id:6,date:"2024-04-27",note:"Pengeluaran",wallet:"Kas",type:"out",amount:2000,rate:16300,reference:""},
{id:7,date:"2024-05-01",note:"Transfer masuk",wallet:"BCA",type:"in",amount:2000,rate:16333,reference:""},
{id:8,date:"2024-05-02",note:"Pengeluaran",wallet:"Kas",type:"out",amount:5000,rate:16333,reference:""}
];
const defaultSettings={appName:"Ledger Pro",defaultRate:16300,dateFormat:"id-ID",currency:"USD",theme:"light"};
let wallets=JSON.parse(localStorage.getItem("lpv2_wallets"))||seedWallets;
let transactions=JSON.parse(localStorage.getItem("lpv2_transactions"))||seedTransactions;
let settings=JSON.parse(localStorage.getItem("lpv2_settings"))||defaultSettings;
let editingId=null;

const meta={
dashboard:["Dashboard","Ringkasan kondisi keuangan."],
ledger:["Ledger","Kelola seluruh transaksi."],
cashin:["Cash In","Tambah dan pantau uang masuk."],
cashout:["Cash Out","Tambah dan pantau uang keluar."],
wallets:["Wallet","Kelola bank, crypto wallet, dan kas."],
reports:["Laporan","Rekap keuangan bulanan."],
settings:["Pengaturan","Atur preferensi aplikasi."]
};

function usd(v){return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(Number(v||0))}
function idr(v){return new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(Number(v||0))}
function dateLabel(v){return new Date(v+"T00:00:00").toLocaleDateString(settings.dateFormat||"id-ID",{day:"2-digit",month:"short",year:"numeric"})}
function save(){localStorage.setItem("lpv2_wallets",JSON.stringify(wallets));localStorage.setItem("lpv2_transactions",JSON.stringify(transactions));localStorage.setItem("lpv2_settings",JSON.stringify(settings))}
function esc(s){return String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;")}
function toast(msg){const e=document.getElementById("toast");e.textContent=msg;e.classList.add("show");clearTimeout(window.tt);window.tt=setTimeout(()=>e.classList.remove("show"),2200)}

function rows(){
let balance=0;
return [...transactions].sort((a,b)=>new Date(a.date)-new Date(b.date)||a.id-b.id).map(t=>{balance+=t.type==="in"?+t.amount:-t.amount;return {...t,balance,idrBalance:balance*t.rate}})
}
function walletBalance(name){return transactions.filter(t=>t.wallet===name).reduce((a,t)=>a+(t.type==="in"?+t.amount:-t.amount),0)+(wallets.find(w=>w.name===name)?.balance||0)}
function monthly(){
const m={};transactions.forEach(t=>{const k=t.date.slice(0,7);m[k]??={month:k,in:0,out:0,count:0};m[k].count++;m[k][t.type]+=+t.amount});return Object.values(m).sort((a,b)=>a.month.localeCompare(b.month))
}

function showPage(page){
document.querySelectorAll(".page").forEach(x=>x.classList.remove("active"));
document.querySelectorAll(".nav-item").forEach(x=>x.classList.remove("active"));
document.getElementById(page+"Page").classList.add("active");
document.querySelector(`[data-page="${page}"]`).classList.add("active");
document.getElementById("pageTitle").textContent=meta[page][0];
document.getElementById("pageSubtitle").textContent=meta[page][1];
const hide=page==="settings"||page==="wallets";
document.getElementById("openTransactionModal").style.display=hide?"none":"";
document.getElementById("exportAll").style.display=page==="settings"?"none":"";
if(page==="dashboard")drawChart();
}

function render(){
const r=rows(), last=r.at(-1)||{balance:0,idrBalance:0,rate:settings.defaultRate};
const tin=transactions.filter(t=>t.type==="in").reduce((a,t)=>a++t.amount,0);
const tout=transactions.filter(t=>t.type==="out").reduce((a,t)=>a++t.amount,0);
document.getElementById("dashUsd").textContent=usd(last.balance);
document.getElementById("dashIdr").textContent=idr(last.idrBalance);
document.getElementById("dashIn").textContent=usd(tin);
document.getElementById("dashOut").textContent=usd(tout);
document.getElementById("summaryCount").textContent=transactions.length;
document.getElementById("summaryLargest").textContent=usd(Math.max(0,...transactions.map(t=>+t.amount)));
document.getElementById("summaryRate").textContent=idr(last.rate);
document.getElementById("summaryWallets").textContent=wallets.length;
renderRecent(r);renderLedger(r);renderWallets();renderQuickLists();renderReports();populateWallets();drawChart()
}

function renderRecent(r){
const b=document.getElementById("recentBody");b.innerHTML="";
[...r].reverse().slice(0,5).forEach(t=>{const tr=document.createElement("tr");tr.innerHTML=`<td>${dateLabel(t.date)}</td><td>${esc(t.note)}</td><td>${esc(t.wallet)}</td><td><span class="badge ${t.type}">${t.type==="in"?"MASUK":"KELUAR"}</span></td><td class="${t.type==="in"?"green":"red"}">${usd(t.amount)}</td><td><strong>${usd(t.balance)}</strong></td>`;b.appendChild(tr)})
}
function renderLedger(r=rows()){
const q=document.getElementById("searchLedger").value.toLowerCase(),w=document.getElementById("filterWallet").value,tp=document.getElementById("filterType").value,d=document.getElementById("filterDate").value;
const b=document.getElementById("ledgerBody");b.innerHTML="";
r.filter(t=>(!q||t.note.toLowerCase().includes(q))&&(!w||t.wallet===w)&&(!tp||t.type===tp)&&(!d||t.date===d)).forEach(t=>{const tr=document.createElement("tr");tr.innerHTML=`<td>${dateLabel(t.date)}</td><td>${esc(t.note)}</td><td>${esc(t.wallet)}</td><td>${idr(t.rate)}</td><td class="green">${t.type==="in"?usd(t.amount):"-"}</td><td class="red">${t.type==="out"?usd(t.amount):"-"}</td><td><strong>${usd(t.balance)}</strong></td><td>${idr(t.idrBalance)}</td><td><div class="action-group"><button class="icon-action" onclick="editTx(${t.id})">Edit</button><button class="icon-action delete" onclick="deleteTx(${t.id})">Hapus</button></div></td>`;b.appendChild(tr)})
}
function renderWallets(){
const c=document.getElementById("walletCards");c.innerHTML="";
wallets.forEach(w=>{const a=document.createElement("article");a.className="metric wallet-card";a.innerHTML=`<div class="wallet-top"><div><span>${esc(w.type)}</span><h3>${esc(w.name)}</h3></div><span class="wallet-dot ${w.color}"></span></div><strong>${usd(walletBalance(w.name))}</strong><small>Saldo wallet</small>`;c.appendChild(a)})
}
function renderQuickLists(){
const cin=document.getElementById("cashInList"),cout=document.getElementById("cashOutList");
cin.innerHTML="";cout.innerHTML="";
transactions.filter(t=>t.type==="in").slice(-6).reverse().forEach(t=>cin.innerHTML+=`<div class="transaction-item"><div><strong>${esc(t.note)}</strong><small>${dateLabel(t.date)} • ${esc(t.wallet)}</small></div><strong class="green">${usd(t.amount)}</strong></div>`);
transactions.filter(t=>t.type==="out").slice(-6).reverse().forEach(t=>cout.innerHTML+=`<div class="transaction-item"><div><strong>${esc(t.note)}</strong><small>${dateLabel(t.date)} • ${esc(t.wallet)}</small></div><strong class="red">${usd(t.amount)}</strong></div>`)
}
function renderReports(){
const s=monthly(),b=document.getElementById("reportBody");b.innerHTML="";
s.forEach(x=>{const net=x.in-x.out;const label=new Date(x.month+"-01T00:00:00").toLocaleDateString("id-ID",{month:"long",year:"numeric"});b.innerHTML+=`<tr><td>${label}</td><td class="green">${usd(x.in)}</td><td class="red">${usd(x.out)}</td><td class="${net>=0?"green":"red"}">${usd(net)}</td><td>${x.count}</td></tr>`});
const cur=new Date().toISOString().slice(0,7),m=s.find(x=>x.month===cur)||{in:0,out:0};document.getElementById("reportIn").textContent=usd(m.in);document.getElementById("reportOut").textContent=usd(m.out);document.getElementById("reportNet").textContent=usd(m.in-m.out)
}
function populateWallets(){
const opts=wallets.map(w=>`<option>${esc(w.name)}</option>`).join("");
document.querySelectorAll('select[name="wallet"]').forEach(s=>{const old=s.value;s.innerHTML=opts;if(old)s.value=old});
const f=document.getElementById("filterWallet"),old=f.value;f.innerHTML='<option value="">Semua wallet</option>'+opts;if(old)f.value=old
}
function drawChart(){
const c=document.getElementById("cashflowChart");if(!c)return;const ctx=c.getContext("2d"),ratio=devicePixelRatio||1,w=c.clientWidth||700,h=240;c.width=w*ratio;c.height=h*ratio;ctx.scale(ratio,ratio);ctx.clearRect(0,0,w,h);
const s=monthly().slice(-8),max=Math.max(1,...s.flatMap(x=>[x.in,x.out])),pad=34,ch=h-60,cw=w-pad*2;ctx.strokeStyle=getComputedStyle(document.body).getPropertyValue("--border").trim();ctx.fillStyle=getComputedStyle(document.body).getPropertyValue("--muted").trim();ctx.font="12px Arial";
for(let i=0;i<=4;i++){const y=18+ch/4*i;ctx.beginPath();ctx.moveTo(pad,y);ctx.lineTo(w-pad,y);ctx.stroke()}
if(!s.length){ctx.fillText("Belum ada data",pad,100);return}
const gw=cw/s.length;s.forEach((x,i)=>{const bx=pad+i*gw+gw*.18,bw=gw*.24,ih=x.in/max*ch,oh=x.out/max*ch;ctx.fillStyle="#16803d";ctx.fillRect(bx,18+ch-ih,bw,ih);ctx.fillStyle="#c62828";ctx.fillRect(bx+bw+5,18+ch-oh,bw,oh);ctx.fillStyle=getComputedStyle(document.body).getPropertyValue("--muted").trim();ctx.fillText(new Date(x.month+"-01").toLocaleDateString("id-ID",{month:"short"}),bx,h-16)})
}

function openModal(item=null){
editingId=item?.id||null;const f=document.getElementById("transactionForm");document.getElementById("transactionModalTitle").textContent=item?"Edit Transaksi":"Tambah Transaksi";f.date.value=item?.date||new Date().toISOString().slice(0,10);f.wallet.value=item?.wallet||wallets[0]?.name||"";f.type.value=item?.type||"in";f.rate.value=item?.rate||settings.defaultRate;f.note.value=item?.note||"";f.amount.value=item?.amount||"";f.reference.value=item?.reference||"";document.getElementById("transactionModal").classList.add("show")
}
function closeModal(){document.getElementById("transactionModal").classList.remove("show");editingId=null}
function saveTx(data,typeOverride=null){
const tx={date:data.get("date"),wallet:data.get("wallet"),type:typeOverride||data.get("type"),rate:+data.get("rate"),note:data.get("note").trim(),amount:+data.get("amount"),reference:(data.get("reference")||"").trim()};
if(!tx.date||!tx.wallet||!tx.note||!tx.rate||!tx.amount){alert("Lengkapi semua data wajib.");return false}
if(editingId){transactions=transactions.map(t=>t.id===editingId?{...t,...tx}:t)}else{tx.id=transactions.length?Math.max(...transactions.map(t=>t.id))+1:1;transactions.push(tx)}
save();render();toast(editingId?"Transaksi diperbarui.":"Transaksi ditambahkan.");return true
}
window.editTx=id=>{const t=transactions.find(x=>x.id===id);if(t)openModal(t)};
window.deleteTx=id=>{const t=transactions.find(x=>x.id===id);if(t&&confirm(`Hapus transaksi "${t.note}"?`)){transactions=transactions.filter(x=>x.id!==id);save();render();toast("Transaksi dihapus.")}};

function exportCsv(name,rows){const csv=rows.map(r=>r.map(v=>`"${String(v).replaceAll('"','""')}"`).join(",")).join("\n");const blob=new Blob([csv],{type:"text/csv"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=name;a.click();URL.revokeObjectURL(url)}
function exportAll(){exportCsv("ledger-pro-transactions.csv",[["Tanggal","Keterangan","Wallet","Tipe","Rate","Nominal"],...transactions.map(t=>[t.date,t.note,t.wallet,t.type,t.rate,t.amount])])}
function exportReport(){exportCsv("ledger-pro-report.csv",[["Bulan","Masuk","Keluar","Net","Jumlah"],...monthly().map(x=>[x.month,x.in,x.out,x.in-x.out,x.count])])}

document.getElementById("loginButton").onclick=()=>{document.getElementById("loginScreen").classList.add("hidden");document.getElementById("app").classList.remove("hidden");render()};
document.getElementById("logoutButton").onclick=()=>{document.getElementById("app").classList.add("hidden");document.getElementById("loginScreen").classList.remove("hidden")};
document.getElementById("sidebarNav").onclick=e=>{const b=e.target.closest(".nav-item");if(b)showPage(b.dataset.page)};
document.querySelectorAll("[data-jump]").forEach(b=>b.onclick=()=>showPage(b.dataset.jump));
document.getElementById("openTransactionModal").onclick=()=>openModal();
document.getElementById("closeTransactionModal").onclick=closeModal;document.getElementById("cancelTransactionModal").onclick=closeModal;
document.getElementById("transactionForm").onsubmit=e=>{e.preventDefault();if(saveTx(new FormData(e.target)))closeModal()};
document.getElementById("cashInForm").onsubmit=e=>{e.preventDefault();if(saveTx(new FormData(e.target),"in")){e.target.reset();e.target.date.value=new Date().toISOString().slice(0,10);e.target.rate.value=settings.defaultRate}};
document.getElementById("cashOutForm").onsubmit=e=>{e.preventDefault();if(saveTx(new FormData(e.target),"out")){e.target.reset();e.target.date.value=new Date().toISOString().slice(0,10);e.target.rate.value=settings.defaultRate}};
document.getElementById("walletForm").onsubmit=e=>{e.preventDefault();const d=new FormData(e.target),name=d.get("name").trim();if(wallets.some(w=>w.name.toLowerCase()===name.toLowerCase())){alert("Nama wallet sudah ada.");return}wallets.push({id:Date.now(),name,type:d.get("type"),balance:+d.get("balance")||0,color:d.get("color")});save();render();e.target.reset();toast("Wallet ditambahkan.")};
["searchLedger","filterWallet","filterType","filterDate"].forEach(id=>document.getElementById(id).oninput=()=>renderLedger());
document.getElementById("exportAll").onclick=exportAll;document.getElementById("exportReport").onclick=exportReport;
document.getElementById("themeToggle").onclick=()=>{settings.theme=settings.theme==="dark"?"light":"dark";save();applyTheme()};
document.getElementById("settingsForm").onsubmit=e=>{e.preventDefault();const d=new FormData(e.target);settings.appName=d.get("appName")||"Ledger Pro";settings.defaultRate=+d.get("defaultRate")||16300;settings.dateFormat=d.get("dateFormat");settings.currency=d.get("currency");document.querySelector(".brand strong").textContent=settings.appName;save();render();toast("Pengaturan disimpan.")};
document.getElementById("resetDemo").onclick=()=>{if(confirm("Reset semua data demo?")){wallets=structuredClone(seedWallets);transactions=structuredClone(seedTransactions);settings=structuredClone(defaultSettings);save();location.reload()}};
function applyTheme(){document.body.classList.toggle("dark",settings.theme==="dark");document.getElementById("themeToggle").textContent=settings.theme==="dark"?"☀️ Light mode":"🌙 Dark mode";setTimeout(drawChart,20)}
document.querySelectorAll('input[type="date"]').forEach(i=>i.value=new Date().toISOString().slice(0,10));
document.querySelector(".brand strong").textContent=settings.appName;document.querySelector('#settingsForm [name="appName"]').value=settings.appName;document.querySelector('#settingsForm [name="defaultRate"]').value=settings.defaultRate;document.querySelector('#settingsForm [name="dateFormat"]').value=settings.dateFormat;document.querySelector('#settingsForm [name="currency"]').value=settings.currency;
applyTheme();populateWallets();render();
