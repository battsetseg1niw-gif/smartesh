(function(){
  const KEY='smarteshAdminPreviewV69';
  function db(){
    try{return JSON.parse(localStorage.getItem('smarteshDBv5'))||{users:[],classes:[],assignments:[],results:[],session:null};}
    catch(_){return {users:[],classes:[],assignments:[],results:[],session:null};}
  }
  function save(x){localStorage.setItem('smarteshDBv5',JSON.stringify(x));try{smartDB=x;}catch(_){} }
  function refresh(){
    try{refreshSessionUI();}catch(_){}
    try{window.renderRoleNavV7?.();}catch(_){}
    window.dispatchEvent(new CustomEvent('smartesh-auth-changed'));
  }
  function banner(){
    let b=document.getElementById('adminPreviewBannerV69');
    if(!b){
      b=document.createElement('div');
      b.id='adminPreviewBannerV69';
      b.className='admin-preview-banner-v69';
      b.innerHTML='<span>🛡️ <b>Admin Preview</b> • Интерфэйс шалгах горим</span><button id="exitAdminPreviewV69" type="button">Preview-ээс гарах</button>';
      document.body.appendChild(b);
      b.querySelector('button').onclick=exit;
    }
    b.hidden=false;
    document.body.classList.add('admin-preview-active-v69');
  }
  function go(){banner();try{showView('admin');}catch(_){} }
  function start(){
    // Exit Student Preview cleanly if it is active, but preserve the original pre-preview session once.
    let previous=null;
    try{previous=JSON.parse(sessionStorage.getItem(KEY)||'null');}catch(_){}
    const d=db();
    if(!previous){
      let baseSession=d.session||null;
      try{
        const studentPrev=JSON.parse(sessionStorage.getItem('smarteshStudentPreviewV66')||'null');
        if(studentPrev && 'session' in studentPrev) baseSession=studentPrev.session||null;
      }catch(_){}
      sessionStorage.setItem(KEY,JSON.stringify({session:baseSession}));
    }
    sessionStorage.removeItem('smarteshStudentPreviewV66');
    document.getElementById('studentPreviewBannerV66')?.setAttribute('hidden','');
    document.body.classList.remove('student-preview-active-v66');

    let u=d.users.find(x=>x.id==='preview-admin-v69');
    if(!u){u={id:'preview-admin-v69',name:'Admin Preview',email:'admin-preview@smartesh.local',password:'',role:'admin',access:'premium',preview:true};d.users.push(u);}
    u.role='admin';u.access='premium';u.preview=true;
    d.session={userId:u.id};save(d);refresh();go();
  }
  function exit(){
    let prev=null;try{prev=JSON.parse(sessionStorage.getItem(KEY)||'null');}catch(_){}
    const d=db();d.session=prev?.session||null;save(d);sessionStorage.removeItem(KEY);refresh();
    document.getElementById('adminPreviewBannerV69')?.setAttribute('hidden','');
    document.body.classList.remove('admin-preview-active-v69');
    try{showView(d.session?'dashboardHub':'home');}catch(_){try{showView('home');}catch(__){}}
  }
  document.addEventListener('DOMContentLoaded',()=>{
    document.getElementById('adminPreviewV69')?.addEventListener('click',start);
    if(sessionStorage.getItem(KEY)){
      const d=db();let u=d.users.find(x=>x.id==='preview-admin-v69');
      if(u){d.session={userId:u.id};save(d);refresh();banner();}
    }
  });
})();
