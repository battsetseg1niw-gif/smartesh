// SmartESH v67 — Student interaction/navigation hotfix
(function(){
  function toast(msg){
    let n=document.getElementById('studentToastV67');
    if(!n){n=document.createElement('div');n.id='studentToastV67';n.className='v23-toast';document.body.appendChild(n);}
    n.textContent=msg;n.classList.add('show');clearTimeout(window.__studentToastV67);window.__studentToastV67=setTimeout(()=>n.classList.remove('show'),1800);
  }
  function navigate(id){
    const target=document.getElementById(id);
    if(!target || !target.classList.contains('view')){toast('Энэ хэсгийг нээх холбоосыг засварлаж байна.');return false;}
    document.querySelectorAll('.view').forEach(v=>{
      const on=v===target;
      v.classList.toggle('active-view',on);
      v.classList.toggle('active',on);
    });
    document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===id));
    document.getElementById('siteEntryAnnouncement')?.classList.remove('open');
    try{window.scrollTo({top:0,behavior:'smooth'})}catch(_){window.scrollTo(0,0)}
    window.dispatchEvent(new CustomEvent('smartesh-view-changed',{detail:{id}}));
    return true;
  }
  window.smarteshNavigateV67=navigate;
  // Expose one reliable navigator for later feature scripts.
  window.showView=navigate;

  // Capture student navigation before older prototype handlers can swallow the click.
  document.addEventListener('click',function(e){
    const el=e.target.closest('[data-view]'); if(!el)return;
    const id=el.dataset.view; if(!id)return;
    const preview=sessionStorage.getItem('smarteshStudentPreviewV66');
    let role='';try{const d=JSON.parse(localStorage.getItem('smarteshDBv5')||'{}');const u=(d.users||[]).find(x=>x.id===d.session?.userId);role=u?.role||''}catch(_){}
    if(preview || role==='student'){
      if(document.getElementById(id)?.classList.contains('view')){
        e.preventDefault(); e.stopImmediatePropagation(); navigate(id);
      }
    }
  },true);

  // Preview start used a function scoped in another script; make landing deterministic.
  document.addEventListener('click',function(e){
    if(e.target.closest('#studentPreviewV66')) setTimeout(()=>navigate('studentHomeV16'),30);
  },true);

  // Keep newly-rendered student controls usable and report accidental broken targets.
  document.addEventListener('click',function(e){
    const el=e.target.closest('[data-view]'); if(!el)return;
    if(!document.getElementById(el.dataset.view)) console.warn('SmartESH v67 missing view:',el.dataset.view);
  });
})();
