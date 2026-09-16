// SmartESH v46 — Supabase Auth integration.
// Public URL/publishable key are supplied at runtime by /api/supabase-config.
(function(){
  const $=id=>document.getElementById(id);
  let client=null;
  function msg(id,text,ok){const el=$(id);if(el){el.textContent=text;el.style.color=ok?'#1f7a4d':'#9a3c35';}}
  function setStatus(text,kind){const el=$('supabaseStatusV46');if(!el)return;el.textContent=text;el.className='supabase-status-v46 '+(kind||'');}
  async function mirrorSession(session){
    if(typeof smartDB==='undefined') return;
    if(!session?.user){smartDB.session=null;saveDB();refreshSessionUI();window.renderRoleNavV7?.();return;}
    const user=session.user;
    let profile=null;
    try{const r=await client.from('profiles').select('id,role,full_name,access_status').eq('id',user.id).single();profile=r.data;}catch(e){}
    const role=profile?.role || user.user_metadata?.role || 'student';
    const name=profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
    let local=smartDB.users.find(x=>x.id===user.id);
    if(!local){local={id:user.id,name,email:user.email||'',role,cloud:true};smartDB.users.push(local);}else Object.assign(local,{name,email:user.email||local.email,role,cloud:true});
    smartDB.session={userId:user.id,cloud:true};saveDB();refreshSessionUI();window.renderRoleNavV7?.();window.dispatchEvent(new Event('smartesh-auth-changed'));
    const badge=$('cloudAccessV46');if(badge) badge.textContent=(profile?.access_status||'free').toUpperCase();
  }
  async function init(){
    try{
      setStatus('Supabase холбож байна…','pending');
      const cfg=await fetch('/api/supabase-config',{cache:'no-store'}).then(r=>r.json());
      if(!cfg.configured) throw new Error(cfg.error||'Supabase config missing');
      if(!window.supabase?.createClient) throw new Error('Supabase client library load failed');
      client=window.supabase.createClient(cfg.url,cfg.key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
      window.smarteshSupabase=client;
      const {data}=await client.auth.getSession();await mirrorSession(data.session);
      client.auth.onAuthStateChange((_event,session)=>setTimeout(()=>mirrorSession(session),0));
      setStatus('● Online database connected','ok');

      const login=$('loginBtn');if(login) login.onclick=async()=>{
        const email=$('loginEmail').value.trim().toLowerCase(),password=$('loginPassword').value;
        msg('loginMessage','Нэвтэрч байна…',true);
        const {data,error}=await client.auth.signInWithPassword({email,password});
        if(error){msg('loginMessage',error.message,false);return;}
        await mirrorSession(data.session);msg('loginMessage','Амжилттай нэвтэрлээ.',true);
        const u=currentUser();const landing=u?.role==='admin'?'admin':u?.role==='teacher'?'teacher':'studentHomeV16';setTimeout(()=>showView?.(landing),40);
      };
      const reg=$('registerBtn');if(reg) reg.onclick=async()=>{
        const full_name=$('regName').value.trim(),email=$('regEmail').value.trim().toLowerCase(),password=$('regPassword').value,role=$('regRole').value;
        const consent=$('legalConsentV55');
        if(consent && !consent.checked){msg('registerMessage','Үйлчилгээний нөхцөл болон Нууцлалын бодлогыг зөвшөөрнө үү.',false);return;}
        if(!full_name||!email||password.length<6){msg('registerMessage','Нэр, зөв email, 6+ тэмдэгт password шаардлагатай.',false);return;}
        if(!['student','teacher'].includes(role)){msg('registerMessage','Public Admin registration зөвшөөрөхгүй.',false);return;}
        msg('registerMessage','Account үүсгэж байна…',true);
        const {data,error}=await client.auth.signUp({email,password,options:{data:{full_name,role}}});
        if(error){msg('registerMessage',error.message,false);return;}
        if(data.session){await mirrorSession(data.session);msg('registerMessage','Account амжилттай үүслээ.',true);}else msg('registerMessage','Бүртгэл үүслээ. Email-ээ баталгаажуулаад Login хийнэ үү.',true);
      };
      const logout=$('logoutBtn');if(logout) logout.onclick=async()=>{await client.auth.signOut();await mirrorSession(null);showView?.('home');};
    }catch(e){console.error('SmartESH Supabase v46:',e);setStatus('⚠ Supabase config шалгана уу','error');}
  }
  window.addEventListener('DOMContentLoaded',init);
})();
