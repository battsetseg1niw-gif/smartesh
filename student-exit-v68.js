// SmartESH v68 — reliable exit from student test runners
(function(){
  function leaveRunner(btn){
    var runner=btn.closest('#previousExamRunner2024,#examRunner,#practice');
    if(runner) runner.classList.add('hidden');
    document.body.classList.remove('task-running','exam-running');
    var target=btn.getAttribute('data-task-exit') || 'studentHomeV16';
    // Use the normal view navigator when available, with a DOM fallback.
    try{
      if(typeof window.smarteshNavigateV67==='function') window.smarteshNavigateV67(target);
      else if(typeof window.showView==='function') window.showView(target);
      else {
        var view=document.getElementById(target);
        document.querySelectorAll('.view').forEach(function(v){v.classList.remove('active','active-view');});
        if(view){view.classList.add('active','active-view');}
      }
    }catch(_){
      var view=document.getElementById(target);
      document.querySelectorAll('.view').forEach(function(v){v.classList.remove('active','active-view');});
      if(view){view.classList.add('active','active-view');}
    }
    if(document.fullscreenElement && document.exitFullscreen){document.exitFullscreen().catch(function(){});}
    window.scrollTo(0,0);
  }

  // Bind directly after DOM is ready. This is intentionally independent of older delegated handlers.
  function bind(){
    document.querySelectorAll('[data-task-exit]').forEach(function(btn){
      if(btn.dataset.exitV68Bound) return;
      btn.dataset.exitV68Bound='1';
      btn.addEventListener('click',function(e){
        e.preventDefault();
        e.stopPropagation();
        leaveRunner(btn);
      });
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',bind); else bind();
  new MutationObserver(bind).observe(document.documentElement,{childList:true,subtree:true});
})();
