(function(){
var CSS=`#student .stuHead{display:flex;align-items:center;justify-content:space-between;gap:12px;cursor:pointer;width:100%;background:none;border:0;font:inherit;color:inherit;padding:0;text-align:inherit}
#student .stuHead h2{margin:0!important;text-align:start!important}
#student .stuHead .car{color:var(--gold);font-size:1.3rem;transition:.3s}#student.open .stuHead .car{transform:rotate(180deg)}
#stuApp{display:none;margin-top:22px}#student.open #stuApp{display:block}
#stuApp .card{background:var(--grey);border-radius:12px;padding:22px;margin-bottom:18px;border-right:4px solid var(--gold)}
html[dir=ltr] #stuApp .card{border-right:0;border-left:4px solid var(--gold)}
#stuApp h1{color:var(--gold);font-size:1.5rem;margin:0 0 10px}#stuApp h2,#stuApp h3{color:var(--dark);margin-top:0}
#stuApp .tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px}
#stuApp .tabs button{border:2px solid var(--gold);background:#fff;color:var(--gold-dark);padding:8px 16px;border-radius:20px;cursor:pointer;font:inherit;font-weight:700}
#stuApp .tabs button.on{background:var(--gold);color:#fff}
#stuApp input,#stuApp select,#stuApp textarea{width:100%;padding:11px;border:2px solid #ddd;border-radius:8px;font:inherit;margin:4px 0 10px;background:#fff}
#stuApp input:focus,#stuApp select:focus,#stuApp textarea:focus{outline:0;border-color:var(--gold)}#stuApp textarea{min-height:90px}
#stuApp .btn{background:var(--gold);color:#fff;border:0;border-radius:25px;padding:11px 26px;font:inherit;font-weight:700;cursor:pointer;margin:4px 3px}
#stuApp .btn:hover{background:var(--gold-dark)}#stuApp .btn.g{background:var(--gold)}#stuApp .btn.l{background:#fff;color:var(--gold-dark);border:2px solid var(--gold)}#stuApp .btn[disabled]{opacity:.5}
#stuApp .tutor{line-height:2;font-size:1.02em}#stuApp .tutor h4{color:#9c7e4d;margin:18px 0 6px;border-bottom:1px solid #e3dccb;padding-bottom:4px}#stuApp .tutor p{margin:6px 0}#stuApp .tutor ul.i li{margin:6px 0}#stuApp .msg{padding:10px 12px;border-radius:8px;margin:8px 0;background:#fff9e6;border-right:3px solid var(--gold)}#stuApp .msg.e{background:#ffecec;color:#a00;border-color:#c0392b}#stuApp .msg.ok{background:#eaf7ea;color:#165a16;border-color:#27ae60}
#stuApp table{width:100%;border-collapse:collapse;font-size:.92rem;margin:8px 0;background:#fff}#stuApp th,#stuApp td{border:1px solid #e3dccb;padding:8px;text-align:start;vertical-align:top}#stuApp th{background:var(--gold);color:#fff}
#stuApp ul.i{padding-inline-start:22px}#stuApp .row{display:grid;grid-template-columns:1fr 1fr;gap:12px}@media(max-width:640px){#stuApp .row{grid-template-columns:1fr}}
#stuApp .small{font-size:.85rem;color:#666}#stuApp .sep{text-align:center;margin:10px 0;color:#888}
#stuApp .post{border-bottom:1px solid #e3dccb;padding:10px 0}#stuApp .post .meta{font-size:.82rem;color:#777}#stuApp .cm{margin-inline-start:22px;border-inline-start:2px solid var(--gold);padding-inline-start:10px;margin-top:6px}
#stuApp .sample{user-select:none;-webkit-user-select:none}#stuApp .sample img{width:100%;display:block;margin:0 0 8px;border:1px solid #ddd;pointer-events:none;-webkit-user-drag:none}
#hqBan{position:fixed;inset:0;background:#111;color:#fff;display:none;z-index:99999;align-items:center;justify-content:center;text-align:center;padding:30px;font-size:1.5rem}`;
var ready=false,loading=false;
function inject(src,cb){var s=document.createElement('script');s.src=src;s.async=true;s.onload=cb;s.onerror=cb;document.head.appendChild(s)}
function start(){
if(ready)return;ready=true;
var st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
var bn=document.createElement('div');bn.id='hqBan';bn.innerHTML='<div><div style="font-size:3rem">⛔</div><div id="banmsg"></div></div>';document.body.appendChild(bn);
inject('https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit',function(){});
inject('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',function(){ if(!window.supabase){document.getElementById('stuApp').innerHTML='<div class="card">تعذّر التحميل، أعد المحاولة.</div>';return} run(); });
}
function run(){

var SB_URL='https://vjzhmbdkrsanzmedremg.supabase.co',SB_KEY='sb_publishable_S7_fqWmzfh-SfpaC5oQ5sg_2JG7Av4D',TS_KEY='0x4AAAAAAGWKJsI0Vbxjc7ar';
var BAN_MSG='لم يصل المبلغ إلينا، وتم إيقاف حسابك نهائيًا';
var sb=window.supabase.createClient(SB_URL,SB_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
var $=function(s,r){return(r||document).querySelector(s)};
var A=$('#stuApp'),TOKEN='',ME=null,TAB='daily',tsId=null,tsTok='',OWNER=false;
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function showBan(m){try{localStorage.setItem('hq_ban','1')}catch(e){}document.getElementById('banmsg').textContent=m||BAN_MSG;document.getElementById('hqBan').style.display='flex'}
function clearBan(){try{localStorage.removeItem('hq_ban')}catch(e){}document.getElementById('hqBan').style.display='none'}
if(localStorage.getItem('hq_ban')==='1')showBan();
function dev(){var d=localStorage.getItem('hq_dev');if(!d){d=(crypto.randomUUID?crypto.randomUUID():String(Math.random()).slice(2)+Date.now());localStorage.setItem('hq_dev',d)}return d}
function api(action,body){var h={'Content-Type':'application/json'};if(TOKEN)h.Authorization='Bearer '+TOKEN;body=Object.assign({action:action,dev:dev()},body||{});
 return fetch('/api/student',{method:'POST',headers:h,body:JSON.stringify(body)}).then(function(r){return r.json().then(function(j){if(r.status===403&&j.error==='banned'){showBan(j.message);throw new Error('banned')}j._s=r.status;return j})})}
function msg(el,t,c){el.innerHTML='<div class="msg '+(c||'')+'">'+esc(t)+'</div>'}
function ts(el){if(!window.turnstile){setTimeout(function(){ts(el)},500);return}tsTok='';el.innerHTML='';tsId=turnstile.render(el,{sitekey:TS_KEY,callback:function(t){tsTok=t},'expired-callback':function(){tsTok=''}})}
/* ---------- gate ---------- */
function oerr(){var u=(location.hash||'')+'&'+(location.search||'');var m=/error_description=([^&]+)/.exec(u);if(!m)return'';var d='';try{d=decodeURIComponent(m[1].replace(/\+/g,' '))}catch(e){d=m[1]}try{history.replaceState(null,'',location.pathname+location.search.replace(/[?&](error|error_code|error_description)=[^&]*/g,'')+'#student')}catch(e){}
 if(/email/i.test(d))return'فيسبوك لم يرسل لنا بريدًا إلكترونيًا لحسابك، فلم يكتمل الدخول. سجّل بحساب جوجل أو بالبريد الإلكتروني.';return'تعذّر الدخول: '+d}
function gate(mode){
 mode=mode||'login';var OE=oerr();
 A.innerHTML=(OE?'<div class="msg e">'+esc(OE)+'</div>':'')+'<div class="card"><h1>قسم الطلاب: مكانك لتذاكر المواريث صح</h1><p>سجّل مجانًا بحسابك (جوجل أو بريدك)، وهتلاقي جوه:</p><ul class="i"><li><b>مسألة اليوم:</b> مسألة جديدة كل يوم تتحدى بيها نفسك.</li><li><b>مولّد مسائل:</b> مسائل متدرجة الصعوبة من السهل للصعب، تتدرب عليها براحتك.</li><li><b>مسائل محلولة ومتدرجة</b> تقارن بيها حلك.</li><li><b>حل خطوة بخطوة:</b> تعرف غلطت فين وليه، مش بس الإجابة الصح.</li><li><b>لوحة الشرف:</b> ترتيب الطلاب حسب مجهودهم، وصاحب أفضل أداء في الأسبوع بياخد مذكرة المواريث مجانًا.</li><li><b>فصل تجريبي مجاني</b> من المذكرة تبدأ بيه.</li><li><b>مساحة للأسئلة:</b> لو عندك سؤال في أي مسألة، اسأل وهنشرحهولك.</li><li><b>مساحتك الخاصة:</b> مسائلك ونتايجك محفوظة عندك.</li></ul><p><b>ابدأ دلوقتي، وخلي كل يوم مسألة.</b></p><p class="small">حاسبة المواريث العامة مفتوحة للجميع بدون تسجيل: <a href="/calculator">افتح الحاسبة</a></p></div>'+
 '<div class="card"><div class="tabs"><button class="'+(mode==='login'?'on':'')+'" onclick="HQS.gate(\'login\')">تسجيل الدخول</button><button class="'+(mode==='signup'?'on':'')+'" onclick="HQS.gate(\'signup\')">حساب جديد</button></div>'+
 '<button class="btn g" onclick="HQS.oauth(\'google\')">الدخول بحساب جوجل</button>'+(OWN()?'<button class="btn l" onclick="HQS.owner()">👁 معاينة المالك</button>':'')+'<div class="sep">أو بالبريد</div>'+
 (mode==='signup'?'الاسم الحقيقي (الاسم الأول والأخير على الأقل)<input id="g_name" autocomplete="name">':'')+
 'البريد الإلكتروني<input id="g_mail" type="email" autocomplete="email" dir="ltr">كلمة المرور<input id="g_pw" type="password" autocomplete="'+(mode==='signup'?'new-password':'current-password')+'" dir="ltr"><div id="g_ts"></div><div id="g_msg"></div>'+
 '<button class="btn" id="g_go">'+(mode==='signup'?'إنشاء الحساب':'دخول')+'</button>'+(mode==='login'?'<button class="btn l" id="g_fp">نسيت كلمة المرور</button>':'')+
 '<p class="small">بالتسجيل أنت توافق على <a href="/terms" target="_blank">الشروط</a> و<a href="/privacy" target="_blank">سياسة الخصوصية</a>. اسمك الحقيقي يظهر في الموقع (لوحة الشرف والمنشورات).</p></div>';
 ts($('#g_ts'));
 $('#g_go').onclick=function(){var m=$('#g_mail').value.trim(),p=$('#g_pw').value,box=$('#g_msg');
  if(!m||p.length<8){msg(box,'اكتب البريد وكلمة مرور من 8 أحرف على الأقل','e');return}
  var cap=tsTok?{captchaToken:tsTok}:{};
  if(mode==='signup'){var n=$('#g_name').value.trim().replace(/\s+/g,' ');if(n.split(' ').length<2||n.length<5){msg(box,'اكتب اسمك الحقيقي: الاسم الأول والأخير','e');return}
   sb.auth.signUp({email:m,password:p,options:Object.assign({data:{full_name:n},emailRedirectTo:location.origin+'/inheritance'},cap)}).then(function(r){if(r.error){msg(box,r.error.message,'e');ts($('#g_ts'));return}msg(box,'تم إنشاء الحساب. افتح بريدك واضغط رابط التفعيل ثم ارجع هنا وسجّل الدخول.','ok')})}
  else sb.auth.signInWithPassword({email:m,password:p,options:cap}).then(function(r){if(r.error){msg(box,'البريد أو كلمة المرور غير صحيحة، أو لم تفعّل بريدك بعد','e');ts($('#g_ts'));return}boot()})};
 var fp=$('#g_fp');if(fp)fp.onclick=function(){var m=$('#g_mail').value.trim();if(!m){msg($('#g_msg'),'اكتب بريدك أولًا','e');return}sb.auth.resetPasswordForEmail(m,{redirectTo:location.origin+'/inheritance'}).then(function(){msg($('#g_msg'),'لو البريد مسجل هتوصلك رسالة لاستعادة كلمة المرور','ok')})}}
function oauth(p){sb.auth.signInWithOAuth({provider:p,options:{redirectTo:location.origin+'/inheritance'}})}
/* ---------- main ---------- */
var TABS=[['daily','مسألة اليوم'],['gen','مولّد المسائل'],['lib','مسائل محلولة'],['honor','لوحة الشرف'],['q','الأسئلة'],['comm','المجتمع'],['notes','المذكرة'],['acc','حسابي']];
function shell(){A.innerHTML='<div class="tabs" id="tabs">'+TABS.map(function(t){return'<button data-t="'+t[0]+'">'+t[1]+'</button>'}).join('')+'</div><div id="pane"></div>';
 document.querySelectorAll('#tabs button').forEach(function(b){b.onclick=function(){show(b.dataset.t)}});show(TAB)}
function show(t){TAB=t;document.querySelectorAll('#tabs button').forEach(function(b){b.className=b.dataset.t===t?'on':''});var p=$('#pane');p.innerHTML='<div class="card">...</div>';(VIEW[t]||function(){})(p)}
var PL={husband:['زوج','',''],wife:['زوجة','زوجتان','زوجات'],father:['أب','',''],mother:['أم','',''],sons:['ابن','ابنان','أبناء'],daughters:['بنت','بنتان','بنات'],sonSons:['ابن ابن','ابنا ابن','أبناء ابن'],sonDaughters:['بنت ابن','بنتا ابن','بنات ابن'],
 fullBrothers:['أخ شقيق','أخوان شقيقان','إخوة أشقاء'],fullSisters:['أخت شقيقة','أختان شقيقتان','أخوات شقيقات'],paternalBrothers:['أخ لأب','أخوان لأب','إخوة لأب'],paternalSisters:['أخت لأب','أختان لأب','أخوات لأب'],
 maternalBrothers:['أخ لأم','أخوان لأم','إخوة لأم'],maternalSisters:['أخت لأم','أختان لأم','أخوات لأم'],grandfatherFather:['جد (أب الأب)','',''],grandmotherMother:['جدة (أم الأم)','',''],grandmotherFather:['جدة (أم الأب)','',''],
 dSons:['ابن بنت','ابنا بنت','أبناء بنت'],dDaughters:['بنت بنت','بنتا بنت','بنات بنت'],aunt:['عمة','عمتان','عمات'],maternalUncle:['خال','خالان','أخوال'],maternalAunt:['خالة','خالتان','خالات'],sonFullBrothers:['ابن أخ شقيق','ابنا أخ شقيق','أبناء أخ شقيق'],
 fullUncles:['عم شقيق','عمان شقيقان','أعمام أشقاء'],paternalUncles:['عم لأب','عمان لأب','أعمام لأب']};
function stmtName(i){var p=PL[i.id],n=i.count;if(!p)return n>1?esc(i.name)+' (عددهم '+n+')':esc(i.name).replace(/^ال/,'');if(n===1)return p[0];if(n===2&&p[1])return p[1];if(n<=10&&p[2])return(n>2?n+' ':'')+p[2];return n+' '+p[2]}
function stmt(items){window.__nm=window.__nm||{};items.forEach(function(i){window.__nm[i.id]=i.name});return'<p><b>حلّ المسألة الآتية:</b></p><p style="font-size:1.1em">مات وترك: <b>'+items.map(stmtName).join('، ')+'</b></p>'}
function ansForm(px,items){return'<p class="small">اكتب نصيب كل وارث من التركة كلها (كسر مثل 1/6 أو نسبة مثل 16.7%). لو الوارث محجوب اكتب 0. وإذا كان للوارث أكثر من فرد اكتب نصيب الفئة كلها معًا.</p>'+items.map(function(i){return'<label>'+esc(i.name)+(i.count>1?' (عددهم '+i.count+'، النصيب الإجمالي لهم)':'')+'</label><input id="'+px+i.id+'" dir="ltr" placeholder="مثال 1/8">'}).join('')}
function readAns(px,items){var o={};items.forEach(function(i){var e=document.getElementById(px+i.id);o[i.id]=e?e.value:''});return o}
function showMine(a){try{var o=typeof a==='string'?JSON.parse(a):a;return Object.keys(o).map(function(k){return esc((window.__nm&&window.__nm[k])||k)+': '+esc(o[k]||'-')}).join('، ')}catch(e){return esc(a)}}
function G(a,b){a=Math.abs(a);b=Math.abs(b);while(b){var t=a%b;a=b;b=t}return a||1}
function LC(a,b){return a/G(a,b)*b}
function fr(n,d){var g=G(n,d);n/=g;d/=g;return d===1?String(n):n+'/'+d}
function sol(s){if(!s)return'';
 var E=s.entriesInfo||[],rows=s.rows,asl=s.asl,H='';
 rows.forEach(function(r){window.__nm=window.__nm||{};window.__nm[r.id]=r.name});
 var rowOf=function(id){return rows.filter(function(r){return r.id===id})[0]};
 var fardEs=E.filter(function(e){return e.fardPart}),aslF=1;fardEs.forEach(function(e){aslF=LC(aslF,e.fardD)});
 var uF=function(e){return e.fardN*aslF/e.fardD};
 var sumF=fardEs.reduce(function(a,e){return a+uF(e)},0),asabaEs=E.filter(function(e){return !e.fardPart||e.kind==='فرض وتعصيب'});
 var rem=aslF-sumF,awl=!!s.awl,radd=!!s.radd;
 var A=awl?sumF:(radd?s.baseAsl:aslF);
 var eU=function(e){return e.fracN*A/e.fracD};var HD=function(e){return e.members.length===1?e.members[0].count:e.members.reduce(function(a,m){return a+m.count*m.weight},0)};var WS=function(e){return e.members.reduce(function(a,m){return a+m.count*m.weight},0)};
 var nameOfE=function(e){return e.members.map(function(m){var r=rowOf(m.id);return r?r.name:m.id}).join(' و')};
 H+='<div class="tutor"><p><b>تعالَ نحلّ المسألة معًا خطوة خطوة.</b> هنمشي على 7 خطوات، وهشرحلك كل كلمة جديدة أول ما تظهر، فخُد وقتك ومتستعجلش.</p>';
 // 1
 H+='<h4>الخطوة 1: تحديد الفروض (مين يرث وياخد كام ولماذا)</h4><p>أول حاجة نعمل جرد للورثة. <b>الفرض</b> هو نصيب محدد في القرآن أو السنة لوارث معين (مثل النصف والربع والسدس). و<b>التعصيب</b> معناه إن الوارث ياخد <i>الباقي</i> بعد أصحاب الفروض.</p><ul class="i">';
 E.forEach(function(e){var nm=nameOfE(e),multi=e.members.some(function(m){return m.count>1})||e.members.length>1;
  var ev=e.members.map(function(m){var r=rowOf(m.id);return r&&r.evidence?r.evidence:''}).filter(function(x,i,a){return x&&a.indexOf(x)===i});
  var law=e.members.map(function(m){var r=rowOf(m.id);return r&&r.law?r.law:''}).filter(function(x,i,a){return x&&a.indexOf(x)===i}).join('، ');
  var what=e.fardPart?(e.kind==='فرض وتعصيب'?'فرضه '+e.fardPart+' ثم ياخد الباقي تعصيبًا':'نصيبه (فرضه) '+e.fardPart):(e.kind==='رحم'?'ياخد بالرحم':'ياخد <b>الباقي</b> تعصيبًا');
  H+='<li><b>'+esc(nm)+'</b>: '+what+(multi&&e.fardPart?' (النصيب للمجموعة كلها ويتقسّم عليهم بالتساوي)':'')+'.<br><span class="small">السبب: '+esc(e.reason||'')+(law?' ('+esc(law)+')':'')+'</span>'+(ev.length?'<br><span class="small">📖 الدليل: '+ev.map(esc).join(' | ')+'</span>':'')+'</li>'});
 H+='</ul>';
 if(s.blocked&&s.blocked.length)H+='<p><b>الورثة المحجوبون:</b> <b>الحجب</b> معناه إن وارث أقرب يمنع وارث أبعد من الميراث. هنا: '+s.blocked.map(function(b){return esc(b.name)+' (محجوب بسبب: '+esc(b.by)+')'}).join('، ')+'. المحجوب نصيبه صفر.</p>';
 (s.notes||[]).forEach(function(n){H+='<p class="small">ملاحظة: '+esc(n)+'</p>'});
 (s.flags||[]).forEach(function(f){H+='<div class="msg">⚖ '+esc(f.text)+'</div>'});
 // 2
 var dens=[];fardEs.forEach(function(e){if(dens.indexOf(e.fardD)<0)dens.push(e.fardD)});
 H+='<h4>الخطوة 2: أصل المسألة</h4><p><b>أصل المسألة</b> هو أصغر عدد صحيح نقدر نقسّم منه كل الفروض من غير كسور، يعني نعتبر التركة كلها كأنها قطعة مقسّمة لأجزاء متساوية، وكل جزء اسمه سهم.</p>';
 if(fardEs.length){H+='<p>بنجيب <b>مقامات</b> الفروض: '+fardEs.map(function(e){return e.fardPart}).join('، ')+'. المقامات هي '+dens.join('، ')+'. وبناخد <b>المضاعف المشترك الأصغر</b> لها (أصغر عدد يقبل القسمة على كل المقامات) = <b>'+aslF+'</b>.</p><p>إذن أصل المسألة = <b>'+aslF+'</b>، يعني التركة مقسومة على '+aslF+' سهم.</p>'}
 else H+='<p>مفيش أصحاب فروض هنا، فالورثة كلهم عصبة وياخدوا التركة كلها، ونعتبر أصل المسألة = <b>'+aslF+'</b> ونقسمه على عدد الرؤوس (الذكر برأسين والأنثى برأس).</p>';
 // 3
 H+='<h4>الخطوة 3: سهام كل وارث</h4><p><b>السهم</b> هو وحدة القسمة: كل وارث نحسب عدد الأسهم اللي ياخدها بضرب فرضه في أصل المسألة.</p><ul class="i">';
 fardEs.forEach(function(e){H+='<li>'+esc(nameOfE(e))+': '+e.fardPart+' × '+aslF+' = <b>'+uF(e)+'</b> سهم</li>'});
 H+='</ul><p>مجموع أسهم أصحاب الفروض = '+sumF+' من '+aslF+'.</p>';
 if(asabaEs.length&&rem>0)H+='<p>الباقي = '+aslF+' − '+sumF+' = <b>'+rem+'</b> سهم، ياخده العصبة وهم: '+asabaEs.map(function(e){return esc(nameOfE(e))}).join('، ')+'.'+(asabaEs.some(function(e){return e.members.some(function(m){return m.weight===2})&&e.members.length>1})?' ولو اجتمع ذكور وإناث في العصبة يتقسّم الباقي <b>للذكر مثل حظ الأنثيين</b> (الذكر يحسب برأسين والأنثى برأس).':'')+'</p>';
 else if(asabaEs.length&&rem<=0&&!awl)H+='<p>الفروض استغرقت التركة ولم يبق شيء للعصبة.</p>';
 // 4
 var kind=awl?'عائلة':(radd?'ردّية':'عادلة');
 H+='<h4>الخطوة 4: نوع المسألة ولماذا</h4><p>المسألة ممكن تكون <b>عادلة</b> (الفروض = أصل المسألة بالظبط أو الباقي أخده العصبة)، أو <b>عائلة</b> (الفروض أكتر من التركة)، أو <b>ردّية</b> (الفروض أقل من التركة ومفيش عاصب). مسألتنا: <b>'+kind+'</b>.</p>';
 if(awl)H+='<p>السبب: مجموع أسهم الفروض ('+sumF+') أكبر من أصل المسألة ('+aslF+')، يعني التركة مش كفاية لكل الفروض. هنا بنعمل <b>العول</b>: بنرفع أصل المسألة ليساوي مجموع الأسهم = <b>'+sumF+'</b>، فيتحمل كل وارث نقصًا بنسبة سهمه.</p>';
 else if(radd)H+='<p>السبب: الفروض أخدت '+sumF+' من '+aslF+' والباقي ('+rem+') ما فيش عاصب ياخده، فبنعمل <b>الرد</b>: يرجع الباقي على أصحاب الفروض بنسبة فروضهم، <b>ما عدا الزوج أو الزوجة</b> لأن نصيبهم مرتبط بالزوجية فقط.</p>';
 else H+='<p>السبب: '+(rem>0&&asabaEs.length?'الفروض أخدت '+sumF+' من '+aslF+' والباقي ('+rem+') أخده العاصب، فما في عول ولا رد.':'مجموع أسهم الفروض ('+sumF+') يساوي أصل المسألة ('+aslF+') بالظبط، فما في عول ولا رد.')+'</p>';
 (s.evidenceSummary||[]).forEach(function(g){if(g.problem==='awl'||g.problem==='radd'||g.problem==='omariyyatan'||g.problem==='mushtaraka'||g.problem==='akdariyya'||g.problem==='arham')H+='<p class="small">📖 دليل ('+esc({awl:'العول',radd:'الرد',omariyyatan:'العمريتين',mushtaraka:'المشتركة',akdariyya:'الأكدرية',arham:'ذوي الأرحام'}[g.problem])+'): '+g.evidence.map(function(x){return esc(x.type)+': '+esc(x.text)}).join(' | ')+'</p>'});
 // radd detail
 if(radd){var spE=E.filter(function(e){return e.isSp}),nonE=E.filter(function(e){return !e.isSp});
  var S=nonE.reduce(function(a,e){return a+(e.fardPart?e.fardN/e.fardD:0)},0);
  H+='<div class="msg"><b>تفصيل الرد:</b> فيه ثلاث حالات: (1) لو مفيش زوج ولا زوجة: الباقي يتوزع على كل أصحاب الفروض بنسبة فروضهم. (2) لو فيه زوج أو زوجة مع غيرهم: الزوج أو الزوجة ياخد فرضه من التركة كلها أولًا، والباقي يتوزع على باقي أصحاب الفروض بنسبة فروضهم. (3) لو الورثة زوج أو زوجة فقط: ننظر أولًا إن كان فيه من ذوي الأرحام، ولو مفيش يُرد الباقي على الزوج أو الزوجة.<br>';
  if(spE.length&&nonE.length){var sp=spE[0];H+='في مسألتنا: '+esc(nameOfE(sp))+' ياخد '+sp.fardPart+' من التركة كلها. الباقي = 1 − '+sp.fardPart+' = '+fr(sp.fardD-sp.fardN,sp.fardD)+'. وبعدين نقسمه على باقي الورثة بنسبة فروضهم.<br>'}
  nonE.forEach(function(e){if(e.fardPart)H+=esc(nameOfE(e))+': فرضه '+e.fardPart+' ، نصيبه بعد الرد = '+e.frac+' من التركة.<br>'});
  H+='</div>'}
 // 5
 var broken=[];E.forEach(function(e){if(HD(e)>1){var u=eU(e);if(u!==Math.round(u)||u%HD(e)!==0)broken.push({e:e,u:u})}});
 H+='<h4>الخطوة 5: هل فيه انكسار؟</h4><p><b>الانكسار</b> معناه إن نصيب مجموعة من الورثة (مثلًا 3 بنات) ما ينقسم على عددهم قسمة صحيحة، فيطلع كسر في السهم الواحد.</p><ul class="i">';
 var multiE=E.filter(function(e){return HD(e)>1});
 multiE.forEach(function(e){var u=eU(e),ok=u%HD(e)===0;H+='<li>'+esc(nameOfE(e))+': نصيبهم '+u+' سهم، وعدد رؤوسهم '+HD(e)+(e.members.some(function(m){return m.weight===2})?' (الذكر برأسين والأنثى برأس)':'')+'. '+u+' ÷ '+HD(e)+' = '+(ok?(u/HD(e))+' تمامًا، <b>لا انكسار</b>.':fr(u,HD(e))+' فيه كسر، <b>فيه انكسار</b>.')+'</li>'});
 if(!multiE.length)H+='<li>كل وارث فرد واحد، فلا يوجد انكسار.</li>';
 H+='</ul>';
 // 6
 var broken=[];E.forEach(function(e){if(HD(e)>1){var u=eU(e);if(u%HD(e)!==0)broken.push({e:e,u:u})}});
 var parts=broken.map(function(b){return HD(b.e)/G(b.u,HD(b.e))}),k=parts.reduce(LC,1),aslT=A*k;
 H+='<h4>الخطوة 6: التصحيح (علاج الانكسار)</h4><p><b>التصحيح</b> هو إننا نضرب أصل المسألة في عدد مناسب (<b>ضارب التصحيح</b>) لحد ما كل وارث ياخد عددًا صحيحًا من الأسهم من غير كسور، ونضرب سهام كل الورثة في نفس العدد، فتفضل النسب بينهم زي ما هي.</p>';
 if(broken.length){H+='<ul class="i">';broken.forEach(function(b,ix){var h=HD(b.e),g=G(b.u,h),p=parts[ix];H+='<li>'+esc(nameOfE(b.e))+': بين سهامهم ('+b.u+') وعدد رؤوسهم ('+h+') '+(g>1?'<b>توافق</b> لأنهما يشتركان في القاسم '+g+'، فنقسم عدد الرؤوس على '+g+' فيطلع <b>جزء السهم</b> = '+h+' ÷ '+g+' = '+p:'<b>تباين</b> لأنهما لا يشتركان في أي قاسم (غير 1)، فنأخذ عدد الرؤوس كله و<b>جزء السهم</b> = '+p)+'.</li>'});H+='</ul>';
  H+='<p>'+(parts.length>1?'عندنا أكتر من جزء سهم ('+parts.join('، ')+')، فبناخد <b>المضاعف المشترك الأصغر</b> لها = '+k+'. ':'')+'إذن ضارب التصحيح = <b>'+k+'</b>، وأصل المسألة بعد التصحيح = '+A+' × '+k+' = <b>'+aslT+'</b>.</p>'}
 else H+='<p>بما إنه ما فيش انكسار، ضارب التصحيح = 1، ويفضل أصل المسألة = <b>'+aslT+'</b> من غير تغيير.</p>';
 // 7
 var TR=rows.map(function(r){var en=E.filter(function(e){return e.ids.indexOf(r.id)>=0})[0];if(!en)return{r:r,u:r.units,ph:r.count?r.units/r.count:r.units,b:'-'};var m=en.members.filter(function(x){return x.id===r.id})[0],U0=eU(en),U=U0*k,ws=WS(en);var b=en.members.length===1?String(U0):fr(U0*m.count*m.weight,ws),u=en.members.length===1?U:U*m.count*m.weight/ws;return{r:r,u:u,ph:u/m.count,b:b}});
 H+='<h4>الخطوة 7: التصحيح النهائي والنصيب النهائي لكل وارث</h4><p>دلوقتي نضرب سهام كل وارث في ضارب التصحيح ('+k+') ونجيب <b>سهم الفرد الواحد</b>، وبعدها <b>نصيب الوارث من التركة = عدد سهامه ÷ أصل المسألة بعد التصحيح ('+aslT+')</b>.</p>';
 H+='<table><tr><th>الوارث</th><th>العدد</th><th>سهام قبل التصحيح</th><th>× '+k+'</th><th>سهام بعد التصحيح</th><th>سهم الفرد</th><th>النصيب</th></tr>'+TR.map(function(x){var r=x.r;return'<tr><td>'+esc(r.name)+'</td><td>'+r.count+'</td><td>'+x.b+'</td><td>×'+k+'</td><td><b>'+x.u+'</b></td><td>'+x.ph+'</td><td dir="ltr"><b>'+fr(x.u,aslT)+'</b> ('+(Math.round(x.u/aslT*1000)/10)+'%)</td></tr>'}).join('')+'</table>';
 H+='<p>مراجعة: مجموع الأسهم = '+TR.reduce(function(a,x){return a+x.u},0)+' = أصل المسألة بعد التصحيح ('+aslT+') ✓</p>';
 H+='<p><b>الخلاصة:</b> '+TR.map(function(x){return esc(x.r.name)+' '+fr(x.u,aslT)}).join('، ')+(s.blocked&&s.blocked.length?'، '+s.blocked.map(function(b){return esc(b.name)+' 0 (محجوب)'}).join('، '):'')+'.</p></div>';
 s.__chk=TR.map(function(x){return[x.r.id,x.u,aslT]});
 return H}
function prob(p){return stmt(p.items)}
var VIEW={
  daily:function(p){api('daily').then(function(d){var h='<div class="card"><h2>مسألة اليوم</h2><p class="small">تُنشر 8 مساء بتوقيت القاهرة، وتظهر الإجابة 7 مساء اليوم التالي.</p>';
  if(d.posted){h+=prob(d.posted);if(d.posted.mine)h+='<div class="msg">إجابتك: '+showMine(d.posted.mine.answer)+(d.posted.closed?(d.posted.mine.ok?' ✓ صح':' ✗ غلط'):' (تم الحفظ، النتيجة بعد غلق المسألة)')+'</div>';else if(!d.posted.closed)h+=ansForm('da_',d.posted.items)+'<button class="btn" id="dag">أرسل الإجابة</button><div id="dam"></div>';
   if(d.posted.closed)h+='<p><b>الإجابة: '+esc(d.posted.want)+'</b></p>'+sol(d.posted.solution)}else h+='<p>لا توجد مسألة منشورة الآن.</p>';
  h+='</div>';if(d.previous){h+='<div class="card"><h3>مسألة أمس</h3>'+prob(d.previous)+(d.previous.stats?'<p class="small">عدد المجيبين: '+d.previous.stats.total+'، أخطأ منهم: '+d.previous.stats.wrong+'</p>':'')+(d.previous.mine?'<div class="msg">إجابتك: '+showMine(d.previous.mine.answer)+(d.previous.mine.ok?' ✓':' ✗')+'</div>':'')+'<p><b>الإجابة: '+esc(d.previous.want)+'</b></p>'+sol(d.previous.solution)+'</div>'}
  p.innerHTML=h;var g=$('#dag');if(g)g.onclick=function(){api('daily_answer',{day:d.posted.day,answers:readAns('da_',d.posted.items)}).then(function(r){if(r.saved)VIEW.daily(p);else msg($('#dam'),'تعذّر الإرسال: '+(r.error||''),'e')})}}).catch(function(){})},
 gen:function(p){var cur=null,lvl=1;api('me').then(function(m){lvl=m.gen.level;p.innerHTML='<div class="card"><h2>مولّد المسائل</h2><p>مستواك: <b>'+m.gen.level+'</b> من 6 | إجابات صحيحة متتالية: '+m.gen.streak+' من 3 للترقية | حللت: '+m.gen.solved+'</p><label>المستوى</label><select id="gl">'+[1,2,3,4,5,6].filter(function(x){return x<=m.gen.level}).map(function(x){return'<option>'+x+'</option>'}).join('')+'</select><button class="btn" id="gn">مسألة جديدة</button><div id="gb"></div></div>';
  $('#gl').value=Math.min(6,m.gen.level);$('#gn').onclick=function(){api('gen_next',{level:+$('#gl').value}).then(function(q){cur=q;$('#gb').innerHTML=prob(q)+ansForm('ga_',q.items)+'<button class="btn g" id="gs">تحقق</button><div id="gm"></div>';$('#gs').onclick=function(){api('gen_answer',{answers:readAns('ga_',q.items)}).then(function(r){var h='<div class="msg '+(r.ok?'ok':'e')+'">'+(r.ok?'إجابة صحيحة ✓':'إجابة غير صحيحة، الصحيح: '+esc(r.want))+(r.leveled?' 🎉 ترقيت لمستوى '+r.level:'')+'</div>'+sol(r.solution);$('#gb').innerHTML+=h;$('#gs').disabled=true})}})}})},
 lib:function(p){var lv=1,ix=1;function go(){api('library',{level:lv,idx:ix}).then(function(q){$('#lb').innerHTML=prob(q)+'<button class="btn l" id="ls">اعرض الحل</button><div id="lsol" style="display:none"><p><b>الإجابة: '+esc(q.want)+'</b></p>'+sol(q.solution)+'</div>';$('#ls').onclick=function(){$('#lsol').style.display='block'}})}
  p.innerHTML='<div class="card"><h2>مسائل محلولة ومتدرجة</h2><div class="row"><div>المستوى<select id="ll">'+[1,2,3,4,5,6].map(function(x){return'<option>'+x+'</option>'}).join('')+'</select></div><div>المسألة<select id="li">'+[1,2,3,4,5,6,7,8,9,10,11,12].map(function(x){return'<option>'+x+'</option>'}).join('')+'</select></div></div><div id="lb"></div></div>';
  $('#ll').onchange=function(){lv=+this.value;go()};$('#li').onchange=function(){ix=+this.value;go()};go()},
 honor:function(p){api('honor').then(function(h){function t(l){return l.length?'<table><tr><th>#</th><th>الاسم</th><th>إجابات صحيحة</th></tr>'+l.map(function(x,i){return'<tr'+(x.me?' style="background:#fff7dd"':'')+'><td>'+(i+1)+'</td><td>'+esc(x.name)+'</td><td>'+x.n+'</td></tr>'}).join('')+'</table>':'<p class="small">لا يوجد بعد</p>'}
  p.innerHTML='<div class="card"><h2>لوحة الشرف</h2><p class="small">صاحب أفضل أداء في الأسبوع (يبدأ السبت) بياخد مذكرة المواريث مجانًا.  الاسم الكامل للطالب يظهر في اللوحة.</p><h3>هذا الأسبوع (من '+esc(h.weekStart)+')</h3>'+t(h.week)+'<h3>الإجمالي</h3>'+t(h.all)+'</div>'})},
 q:function(p){api('q_list').then(function(r){p.innerHTML='<div class="card"><h2>مساحة الأسئلة</h2><textarea id="qt" placeholder="اكتب سؤالك عن أي مسألة"></textarea><button class="btn" id="qa">أرسل السؤال</button><div id="qm"></div></div><div class="card">'+(r.items.length?r.items.map(function(q){return'<div class="post"><div class="meta">'+esc(q.name)+(q.mine?' (سؤالك)':'')+'</div><div>'+esc(q.text)+'</div>'+(q.answer?'<div class="msg ok"><b>الرد:</b> '+esc(q.answer)+'</div>':'<div class="small">بانتظار الرد</div>')+'</div>'}).join(''):'<p class="small">لا أسئلة بعد</p>')+'</div>';
  $('#qa').onclick=function(){api('q_ask',{text:$('#qt').value}).then(function(x){if(x.ok)VIEW.q(p);else msg($('#qm'),'اكتب سؤالًا أوضح (8 أحرف على الأقل)','e')})}})},
 comm:function(p){api('post_list').then(function(r){function cms(pid,par){return r.comments.filter(function(c){return c.post===pid&&c.parent===par}).map(function(c){return'<div class="cm"><div class="meta"><b>'+esc(c.name)+'</b> <a href="#" data-l="'+c.id+'">👍 '+c.likes+'</a> <a href="#" data-r="'+c.id+'" data-rp="'+pid+'">رد</a> <a href="#" data-x="'+c.id+'" data-k="comment">إبلاغ</a></div>'+esc(c.text)+cms(pid,c.id)+'</div>'}).join('')}
  p.innerHTML='<div class="card"><h2>المجتمع</h2><textarea id="pt" placeholder="اكتب منشورك (ممكن تضيف رقم مسألة من الحاسبة)"></textarea><input id="pr" placeholder="رقم المسألة (اختياري) MR-..." dir="ltr"><button class="btn" id="pc">نشر</button><div id="pm"></div><p class="small">المنشورات تظهر مباشرة، والمكتب يحذف أو يعدّل أي محتوى مخالف.</p></div><div class="card">'+r.posts.map(function(x){return'<div class="post"><div class="meta"><b>'+esc(x.name)+'</b> '+(x.ref?' | مسألة '+esc(x.ref)+' <a href="/calculator?ref='+encodeURIComponent(x.ref)+'" target="_blank">فتح</a>':'')+' <a href="#" data-l="'+x.id+'">'+(x.liked?'💛':'👍')+' '+x.likes+'</a> <a href="#" data-r="'+x.id+'" data-rp="'+x.id+'">تعليق</a> <a href="#" data-x="'+x.id+'" data-k="post">إبلاغ</a></div><div>'+esc(x.text)+'</div>'+cms(x.id,'')+'</div>'}).join('')+'</div>';
  $('#pc').onclick=function(){api('post_create',{text:$('#pt').value,ref:$('#pr').value.trim()}).then(function(x){if(x.ok)VIEW.comm(p);else msg($('#pm'),'اكتب منشورًا أطول','e')})};
  p.querySelectorAll('[data-l]').forEach(function(a){a.onclick=function(e){e.preventDefault();api('like',{id:a.dataset.l}).then(function(){VIEW.comm(p)})}});
  p.querySelectorAll('[data-r]').forEach(function(a){a.onclick=function(e){e.preventDefault();var t=prompt('اكتب تعليقك');if(t)api('comment_create',{post:a.dataset.rp,parent:a.dataset.r===a.dataset.rp?'':a.dataset.r,text:t}).then(function(){VIEW.comm(p)})}});
  p.querySelectorAll('[data-x]').forEach(function(a){a.onclick=function(e){e.preventDefault();var t=prompt('سبب الإبلاغ');if(t!==null)api('report',{id:a.dataset.x,kind:a.dataset.k,reason:t}).then(function(){alert('تم الإبلاغ، شكرًا')})}})})},
 notes:function(p){api('me').then(function(m){
  var h='<div class="card"><h2>فصل تجريبي مجاني</h2><p class="small">للقراءة فقط من المذكرة الكاملة.</p><div class="sample" id="smp">'+[1,2,3,4,5,6,7].map(function(i){return'<img src="/assets/sample/p'+i+'.webp" alt="" draggable="false" loading="lazy">'}).join('')+'</div></div>';
  h+='<div class="card"><h2>مذكرة المواريث (PDF على ورق المكتب)</h2><p>الثمن: <b>'+m.price+' جنيهًا</b> (تُضاف قروش مميزة لطلبك).</p><div id="ord"></div></div>';
  p.innerHTML=h;var o=m.orders[0];
  (function r(o){var d=$('#ord');
   if(!o||o.status==='rejected'){d.innerHTML='<button class="btn g" id="os">ابدأ الشراء</button><div id="om"></div>';$('#os').onclick=function(){api('order_start').then(function(x){if(x.order)r(x.order);else msg($('#om'),x.error==='owned'?'عندك المذكرة بالفعل':x.error==='owner_preview'?'معاينة المالك: الشراء غير متاح':'حاول بعد قليل','e')})};return}
   if(o.status==='awaiting'){d.innerHTML='<div class="msg"><p>حوّل <b dir="ltr">'+esc(o.amount)+'</b> جنيهًا بالضبط (بنفس القروش) على رقم <b dir="ltr">'+esc(m.pay.number)+'</b> ('+esc(m.pay.methods.join(' أو '))+').</p><p class="small">المبلغ مميز لطلبك، لا تغيّره. بعد التحويل أدخل رقم العملية وارفع لقطة شاشة التحويل.</p></div>رقم العملية (المرجع)<input id="ot" dir="ltr">المبلغ الذي حوّلته<input id="op" dir="ltr" value="'+esc(o.amount)+'">لقطة شاشة التحويل<input id="of" type="file" accept="image/*"><div id="om"></div><button class="btn g" id="osub">إرسال</button>';
    $('#osub').onclick=function(){var f=$('#of').files[0],box=$('#om');if(!f){msg(box,'ارفع لقطة الشاشة','e');return}if(f.size>6e6){msg(box,'الصورة أكبر من 6 ميجا','e');return}
     msg(box,'جاري الرفع...');$('#osub').disabled=true;
     import('https://esm.sh/@vercel/blob@1.0.2/client').then(function(mod){return mod.upload('pay-'+o.id+'.'+((f.type.split('/')[1]||'jpg').replace(/[^a-z0-9]/g,'')),f,{access:'public',handleUploadUrl:'/api/upload',clientPayload:'S:'+TOKEN})}).then(function(b){
      return api('order_paid',{order:o.id,txn:$('#ot').value,paid_amount:$('#op').value,shot:b.url})}).then(function(x){
      if(x.ok)r(x.order);else{$('#osub').disabled=false;msg(box,{txn:'رقم العملية غير صحيح',amount_mismatch:'المبلغ لا يطابق المبلغ المطلوب بالقروش',expired:'انتهت مهلة الطلب، ابدأ طلبًا جديدًا',shot:'الصورة غير صالحة',txn_used:'رقم العملية هذا مستخدم من قبل'}[x.error]||'تعذّر الإرسال','e')}}).catch(function(e){if(String(e.message)!=='banned'){$('#osub').disabled=false;msg(box,'تعذّر الرفع، حاول مرة أخرى','e')}})};return}
   d.innerHTML='<div class="msg ok">'+(o.status==='approved'?'تم اعتماد الدفع.':'تم استلام بيانات الدفع، والتحميل متاح الآن. يراجع المكتب وصول المبلغ.')+'</div><p>روابط التحميل المتبقية: <b>'+o.dl_left+'</b> (كل رابط يعمل مرة واحدة ولمدة 15 دقيقة، والنسخة تحمل اسمك).</p><button class="btn g" id="odl"'+(o.dl_left<1?' disabled':'')+'>تحميل المذكرة</button><div id="om"></div>';
   $('#odl').onclick=function(){api('download',{order:o.id}).then(function(x){if(x.url){location.href=x.url;o.dl_left=x.left;setTimeout(function(){r(o)},1500)}else msg($('#om'),'لا توجد روابط متبقية، تواصل مع المكتب','e')})}})(o)})},
 acc:function(p){p.innerHTML='<div class="card"><h2>حسابي</h2><p>الاسم: <b>'+esc(ME.name)+'</b><br>البريد: <span dir="ltr">'+esc(ME.email)+'</span></p>'+(OWNER?'<div class="msg">وضع معاينة المالك: ترى ما يراه الطالب. الشراء والتحميل غير متاحين.</div>':'<button class="btn l" id="lo">تسجيل الخروج</button>')+'</div>';if($('#lo'))$('#lo').onclick=function(){sb.auth.signOut().then(function(){TOKEN='';ME=null;gate()})}}
};
function needName(){A.innerHTML='<div class="card"><h2>اكتب اسمك الحقيقي</h2><p class="small">الاسم الأول والأخير، ويظهر في الموقع.</p><input id="nn"><button class="btn" id="nb">حفظ</button><div id="nm"></div></div>';$('#nb').onclick=function(){api('set_name',{name:$('#nn').value.trim()}).then(function(r){if(r.ok)boot();else msg($('#nm'),'اكتب الاسم الأول والأخير','e')})}}
function OWN(){try{return localStorage.getItem('hq_adm')==='1'}catch(e){return false}}
function ownerTok(){try{return localStorage.getItem('hq_adm')==='1'?(sessionStorage.getItem('hq_t')||''):''}catch(e){return ''}}
function afterToken(){api('me').then(function(m){if(m._s===401){if(OWNER){try{sessionStorage.removeItem('hq_t')}catch(e){}OWNER=false;TOKEN='';gate();return}sb.auth.signOut();gate();return}if(!m.me)return;clearBan();ME=m.me;if(ME.needName){needName();return}shell()}).catch(function(){})}
function boot(){
 sb.auth.getSession().then(function(r){var s=r.data&&r.data.session;
  if(!s){var ot=ownerTok();if(ot){TOKEN=ot;OWNER=true;afterToken();return}TOKEN='';if(localStorage.getItem('hq_ban')!=='1')gate();return}
  OWNER=false;TOKEN=s.access_token;afterToken()})}
sb.auth.onAuthStateChange(function(ev,s){if(s&&s.access_token&&!OWNER)TOKEN=s.access_token;if(ev==='SIGNED_IN'&&s&&!ME)boot()});
window.HQS={gate:gate,oauth:oauth,boot:boot,owner:function(){if(ownerTok()){boot();return}
  A.innerHTML='<div class="card"><h2>معاينة المالك</h2><p class="small">اكتب كلمة مرور لوحة التحكم لتشاهد الركن كما يراه الطالب. لا يُسجَّل لك حساب طالب.</p><input id="ow_pw" type="password" autocomplete="current-password" dir="ltr"><div id="ow_msg"></div><button class="btn" id="ow_go">دخول</button><button class="btn l" onclick="HQS.gate()">رجوع</button></div>';
  var go=function(){fetch('/api/admin',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'login',password:$('#ow_pw').value})}).then(function(r){return r.json().then(function(j){return[r.ok,j]})}).then(function(x){if(!x[0]||!x[1].token){msg($('#ow_msg'),'كلمة المرور غير صحيحة','e');return}try{sessionStorage.setItem('hq_t',x[1].token);localStorage.setItem('hq_adm','1')}catch(e){}boot()}).catch(function(){msg($('#ow_msg'),'تعذّر الاتصال','e')})};
  $('#ow_go').onclick=go;$('#ow_pw').onkeydown=function(e){if(e.key==='Enter')go()}}};
boot();

}
function toggle(force){var r=document.getElementById('student');if(!r)return;var o=force===undefined?!r.classList.contains('open'):force;r.classList.toggle('open',o);if(o){start();if(!/access_token|error|refresh_token/.test(location.hash)){try{history.replaceState(null,'',location.pathname+'#student')}catch(e){}}}}
window.HQStudentToggle=toggle;
function auto(){var u=(location.hash||'')+location.search;if(/^#student/.test(location.hash)||/access_token|error_description|[?&]code=/.test(u)){toggle(true);var r=document.getElementById('student');if(r&&r.scrollIntoView)setTimeout(function(){r.scrollIntoView({behavior:'smooth'})},400)}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',auto);else auto();
})();
