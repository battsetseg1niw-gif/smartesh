// SmartESH v70 — small production-facing reliability fixes.
(function(){
  function nav(id){if(typeof window.smarteshNavigateV67==='function')return window.smarteshNavigateV67(id);if(typeof window.showView==='function')return window.showView(id);}
  function bind(){
    const weak=document.getElementById('psCreatePracticeV44');
    if(weak&&!weak.dataset.v70){weak.dataset.v70='1';weak.addEventListener('click',function(){const s=document.getElementById('psPracticeStatusV44');if(s&&/алга/.test(s.textContent||'')){s.textContent='Эхлээд бодит scan → review → confirm → analytics дуусгана уу.';return;}nav('practiceHub');});}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();
