(function(){
  const KEY='smarteshStudentPreviewV66';
  function db(){ try{return JSON.parse(localStorage.getItem('smarteshDBv5'))||{users:[],classes:[],assignments:[],results:[],session:null};}catch(_){return {users:[],classes:[],assignments:[],results:[],session:null};} }
  function save(x){localStorage.setItem('smarteshDBv5',JSON.stringify(x)); try{smartDB=x;}catch(_){} }
  function refresh(){ try{refreshSessionUI();}catch(_){} try{window.renderRoleNavV7?.();}catch(_){} window.dispatchEvent(new CustomEvent('smartesh-auth-changed')); }
  function banner(){
    let b=document.getElementById('studentPreviewBannerV66');
    if(!b){b=document.createElement('div');b.id='studentPreviewBannerV66';b.className='student-preview-banner-v66';b.innerHTML='<span>👨‍🎓 <b>Student Preview</b> • Free эрхээр харж байна</span><button id="exitStudentPreviewV66">Preview-ээс гарах</button>';document.body.appendChild(b);b.querySelector('button').onclick=exit;}
    b.hidden=false; document.body.classList.add('student-preview-active-v66');
  }
  function start(){
    if(sessionStorage.getItem(KEY)) return go();
    const d=db();
    sessionStorage.setItem(KEY,JSON.stringify({session:d.session||null}));
    let u=d.users.find(x=>x.id==='preview-student-v66');
    if(!u){u={id:'preview-student-v66',name:'Student Preview',email:'preview@smartesh.local',password:'',role:'student',access:'free',preview:true};d.users.push(u);}
    u.role='student';u.access='free';u.preview=true;
    d.session={userId:u.id};save(d);refresh();banner();go();
  }
  function go(){banner(); try{showView('studentHomeV16');}catch(_){} }
  function exit(){
    let prev=null;try{prev=JSON.parse(sessionStorage.getItem(KEY)||'null');}catch(_){}
    const d=db(); d.session=prev?.session||null; save(d); sessionStorage.removeItem(KEY); refresh();
    document.getElementById('studentPreviewBannerV66')?.setAttribute('hidden','');document.body.classList.remove('student-preview-active-v66');
    try{showView(d.session?'dashboardHub':'home');}catch(_){}
  }
  document.addEventListener('DOMContentLoaded',()=>{document.getElementById('studentPreviewV66')?.addEventListener('click',start);if(sessionStorage.getItem(KEY)){const d=db();let u=d.users.find(x=>x.id==='preview-student-v66');if(u){d.session={userId:u.id};save(d);refresh();banner();}}});
})();
