// SmartESH v70 — unified Student / Teacher / Admin QA preview manager.
(function(){
  const BASE='smarteshRolePreviewBaseV70';
  const KEYS={student:'smarteshStudentPreviewV66',teacher:'smarteshTeacherPreviewV70',admin:'smarteshAdminPreviewV69'};
  const META={
    student:{id:'preview-student-v70',name:'Student Preview',email:'student-preview@smartesh.local',access:'free',view:'studentHomeV16',icon:'👨‍🎓',label:'Student Preview • Free эрх'},
    teacher:{id:'preview-teacher-v70',name:'Teacher Preview',email:'teacher-preview@smartesh.local',access:'free',view:'teacher',icon:'👩‍🏫',label:'Teacher Preview • Free эрх'},
    admin:{id:'preview-admin-v70',name:'Admin Preview',email:'admin-preview@smartesh.local',access:'premium',view:'admin',icon:'🛡️',label:'Admin Preview • QA интерфэйс'}
  };
  function db(){try{return JSON.parse(localStorage.getItem('smarteshDBv5'))||{users:[],classes:[],assignments:[],results:[],session:null};}catch(_){return {users:[],classes:[],assignments:[],results:[],session:null};}}
  function save(d){localStorage.setItem('smarteshDBv5',JSON.stringify(d));try{window.smartDB=d;}catch(_){}}
  function refresh(){try{window.refreshSessionUI?.();}catch(_){} try{window.renderRoleNavV7?.();}catch(_){} window.dispatchEvent(new CustomEvent('smartesh-auth-changed'));}
  function qaAllowed(){return location.protocol==='file:' || new URLSearchParams(location.search).get('qa')==='1';}
  function enableQa(){document.body.classList.toggle('qa-preview-enabled-v70',qaAllowed());}
  function activeRole(){for(const [r,k] of Object.entries(KEYS))if(sessionStorage.getItem(k))return r;return null;}
  function clearKeys(){Object.values(KEYS).forEach(k=>sessionStorage.removeItem(k));}
  function banner(role){
    const m=META[role]; let b=document.getElementById('rolePreviewBannerV70');
    if(!b){b=document.createElement('div');b.id='rolePreviewBannerV70';b.className='role-preview-banner-v70';b.innerHTML='<span id="rolePreviewTextV70"></span><button type="button" id="exitRolePreviewV70">Preview-ээс гарах</button>';document.body.appendChild(b);b.querySelector('button').onclick=exit;}
    b.querySelector('#rolePreviewTextV70').innerHTML=m.icon+' <b>'+m.label+'</b> • зөвхөн UI шалгах горим';b.hidden=false;document.body.classList.add('role-preview-active-v70');
  }
  function start(role){
    if(!qaAllowed())return;
    const d=db();
    if(!sessionStorage.getItem(BASE)){
      let original=d.session||null;
      const ar=activeRole(); if(ar){try{const x=JSON.parse(sessionStorage.getItem(KEYS[ar])||'null'); if(x&&'session' in x)original=x.session||null;}catch(_){}}
      sessionStorage.setItem(BASE,JSON.stringify({session:original}));
    }
    clearKeys(); sessionStorage.setItem(KEYS[role],JSON.stringify({session:JSON.parse(sessionStorage.getItem(BASE)||'{}').session||null}));
    const m=META[role]; let u=(d.users||[]).find(x=>x.id===m.id);
    if(!u){u={id:m.id,name:m.name,email:m.email,password:'',role,access:m.access,preview:true};d.users=(d.users||[]);d.users.push(u);}
    Object.assign(u,{role,access:m.access,preview:true,name:m.name,email:m.email}); d.session={userId:m.id};save(d);refresh();banner(role);
    try{window.showView?.(m.view);}catch(_){}
  }
  function exit(){
    let base=null;try{base=JSON.parse(sessionStorage.getItem(BASE)||'null');}catch(_){}
    const d=db();d.session=base?.session||null;save(d);clearKeys();sessionStorage.removeItem(BASE);refresh();
    document.getElementById('rolePreviewBannerV70')?.setAttribute('hidden','');document.body.classList.remove('role-preview-active-v70');
    try{window.showView?.(d.session?'dashboardHub':'home');}catch(_){}
  }
  function restore(){
    const role=activeRole();if(!role||!qaAllowed())return;const d=db(),m=META[role];let u=(d.users||[]).find(x=>x.id===m.id);if(!u){u={id:m.id,name:m.name,email:m.email,password:'',role,access:m.access,preview:true};d.users=(d.users||[]);d.users.push(u);}d.session={userId:m.id};save(d);refresh();banner(role);
  }
  document.addEventListener('DOMContentLoaded',()=>{enableQa();document.getElementById('studentPreviewV66')?.addEventListener('click',()=>start('student'));document.getElementById('teacherPreviewV70')?.addEventListener('click',()=>start('teacher'));document.getElementById('adminPreviewV69')?.addEventListener('click',()=>start('admin'));restore();});
  window.SmartESHRolePreviewV70={start,exit,qaAllowed};
})();
