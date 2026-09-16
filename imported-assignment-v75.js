// SmartESH v75 FINAL — Imported PDF test → Teacher class assignment
(()=>{
  const $=s=>document.querySelector(s);
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const sb=()=>window.smarteshSupabase;
  let selectedTest=null, tests=[], classes=[];
  function toast(msg,ok=true){
    let n=$('#v75Toast'); if(!n){n=document.createElement('div');n.id='v75Toast';n.className='v47-toast';document.body.appendChild(n)}
    n.textContent=msg;n.hidden=false;n.style.background=ok?'#13233f':'#8b1e1e';clearTimeout(window.__v75toast);window.__v75toast=setTimeout(()=>n.hidden=true,3000);
  }
  async function profile(){
    const x=sb(); if(!x)return null; const {data:{user}}=await x.auth.getUser(); if(!user)return null;
    const {data}=await x.from('profiles').select('id,role,full_name').eq('id',user.id).maybeSingle(); return data||null;
  }
  function inject(){
    const host=$('#readyTaskPanel'); if(!host||$('#v75ImportedFlow'))return;
    host.innerHTML=`<div id="v75ImportedFlow">
      <div class="panel-head"><div><span class="eyebrow">v75 FINAL • REAL IMPORTED TEST FLOW</span><h3>Бэлэн PDF тестийг ангидаа өгөх</h3><p>Admin нийтэлсэн бодит digital test → Teacher сонгоно → ангидаа өгнө → Student ажиллана → auto score.</p></div><button class="secondary-btn" id="v75Refresh">Шинэчлэх</button></div>
      <div class="v75-import-grid">
        <div><label class="bank-label">1. Нийтлэгдсэн тест<select id="v75Test"><option value="">Тест уншиж байна…</option></select></label><div id="v75TestMeta" class="v57-notice">Тест сонгоно уу.</div><button class="secondary-btn" id="v75Preview" disabled>Preview</button></div>
        <div><label class="bank-label">2. Анги<select id="v75Class"><option value="">Анги уншиж байна…</option></select></label><label class="bank-label">Даалгаврын нэр<input id="v75Title" placeholder="Imported test assignment"></label><div class="v57-form-row"><label class="bank-label">Deadline<input id="v75Deadline" type="datetime-local"></label><label class="bank-label">Хугацаа (мин)<input id="v75Minutes" type="number" min="1" max="180" value="40"></label></div><label class="bank-label">Заавар<textarea id="v75Instructions" rows="2">Choose the best answer. Submit when finished.</textarea></label><button class="primary-btn wide-btn" id="v75Assign">Ангидаа өгөх</button></div>
      </div><div id="v75Status" class="form-message"></div>
    </div>`;
    $('#v75Refresh').onclick=load;
    $('#v75Test').onchange=()=>selectTest($('#v75Test').value);
    $('#v75Preview').onclick=preview;
    $('#v75Assign').onclick=assign;
    load();
  }
  async function load(){
    const p=await profile(), x=sb();
    if(!p||p.role!=='teacher'||!x){$('#v75Status') && ($('#v75Status').textContent='Teacher account + Supabase connection шаардлагатай.');return}
    const [{data:t,error:te},{data:c,error:ce}]=await Promise.all([
      x.from('imported_tests_v74').select('id,title,category,level,source_filename,status,created_at').eq('status','published').order('created_at',{ascending:false}),
      x.from('classes_v51').select('id,name,level,school_year').eq('teacher_id',p.id).eq('status','active').order('created_at',{ascending:false})
    ]);
    if(te){$('#v75Status').textContent='Тест уншиж чадсангүй: '+te.message;return} if(ce){$('#v75Status').textContent='Анги уншиж чадсангүй: '+ce.message;return}
    tests=t||[]; classes=c||[];
    $('#v75Test').innerHTML='<option value="">Тест сонгоно уу</option>'+tests.map(v=>`<option value="${v.id}">${esc(v.title)} • ${esc(v.category)}</option>`).join('');
    $('#v75Class').innerHTML='<option value="">Анги сонгоно уу</option>'+classes.map(v=>`<option value="${v.id}">${esc(v.name)}${v.level?' • '+esc(v.level):''}</option>`).join('');
    $('#v75Status').textContent=tests.length?`${tests.length} published test бэлэн.`:'Admin-аас нийтэлсэн тест одоогоор алга.';
    selectedTest=null; $('#v75Preview').disabled=true; $('#v75TestMeta').textContent='Тест сонгоно уу.';
  }
  async function selectTest(id){
    selectedTest=tests.find(x=>x.id===id)||null; $('#v75Preview').disabled=!selectedTest;
    if(!selectedTest){$('#v75TestMeta').textContent='Тест сонгоно уу.';return}
    const {count,error}=await sb().from('imported_test_items_v74').select('id',{count:'exact',head:true}).eq('test_id',id);
    $('#v75Title').value=selectedTest.title;
    $('#v75TestMeta').innerHTML=error?esc(error.message):`<b>${esc(selectedTest.title)}</b><br>${esc(selectedTest.category)}${selectedTest.level?' • '+esc(selectedTest.level):''} • ${count||0} questions${selectedTest.source_filename?' • '+esc(selectedTest.source_filename):''}`;
  }
  async function preview(){
    if(!selectedTest)return; const {data,error}=await sb().from('imported_test_items_v74').select('position,body,options').eq('test_id',selectedTest.id).order('position').limit(100);
    if(error){toast(error.message,false);return}
    let m=$('#v75PreviewModal'); if(!m){m=document.createElement('div');m.id='v75PreviewModal';m.className='v57-runner hidden';document.body.appendChild(m)}
    m.innerHTML=`<div class="v57-runner-card"><div class="v57-runner-head"><div><span class="eyebrow">TEACHER PREVIEW</span><h2>${esc(selectedTest.title)}</h2><small>${data?.length||0} questions</small></div><button class="secondary-btn" id="v75ClosePreview">×</button></div><div style="max-height:65vh;overflow:auto">${(data||[]).map(q=>`<div class="v57-q-card"><h3>Q${q.position}. ${esc(q.body)}</h3>${(q.options||[]).map(o=>`<div class="v57-mini"><b>${esc(o.label)}.</b> ${esc(o.body)}</div>`).join('')}</div>`).join('')}</div></div>`;
    m.classList.remove('hidden'); $('#v75ClosePreview').onclick=()=>m.classList.add('hidden');
  }
  async function assign(){
    const p=await profile(), testId=$('#v75Test').value, classId=$('#v75Class').value, title=$('#v75Title').value.trim();
    if(!p||p.role!=='teacher'){toast('Teacher account-аар нэвтэрнэ үү.',false);return}
    if(!testId||!classId||!title){toast('Тест, анги, даалгаврын нэрийг сонгоно уу.',false);return}
    const b=$('#v75Assign');b.disabled=true;b.textContent='Өгөж байна…';
    try{
      const {data,error}=await sb().rpc('assign_imported_test_v75',{
        p_test_id:testId,p_class_id:classId,p_title:title,
        p_deadline:$('#v75Deadline').value?new Date($('#v75Deadline').value).toISOString():null,
        p_duration_minutes:Number($('#v75Minutes').value||40),p_instructions:$('#v75Instructions').value.trim()||null
      });
      if(error)throw error;
      const r=Array.isArray(data)?data[0]:data; toast(`✓ ${r?.target_count??''} сурагчид “${title}” өглөө.`); $('#v75Status').textContent='Assigned. Student → Миний даалгавар хэсэгт шууд харагдана.';
      window.dispatchEvent(new CustomEvent('smartesh-v75-assigned',{detail:r||{}}));
    }catch(e){toast(e.message||'Assign хийхэд алдаа гарлаа.',false)}finally{b.disabled=false;b.textContent='Ангидаа өгөх'}
  }
  function boot(){inject();document.addEventListener('click',e=>{if(e.target.closest('[data-view="teacherAssignments"]'))setTimeout(()=>{inject();load()},100)},true);window.addEventListener('smartesh-auth-changed',()=>setTimeout(load,150));}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
