const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let state={questions:[],title:'',category:'Grammar',level:'Standard',sourceFile:'',rawText:''};
function toast(msg,ok=true){let n=$('#pdfImportV74Toast');if(!n){n=document.createElement('div');n.id='pdfImportV74Toast';n.className='pdf-v74-toast';document.body.appendChild(n)}n.textContent=msg;n.dataset.ok=ok?'1':'0';n.classList.add('show');setTimeout(()=>n.classList.remove('show'),3200)}
function normalize(t){return t.replace(/\u00a0/g,' ').replace(/[ \t]+/g,' ').replace(/\r/g,'\n').replace(/\n{2,}/g,'\n').trim()}
function parseQuestions(text){
 const lines=normalize(text).split('\n').map(x=>x.trim()).filter(Boolean); const out=[]; let q=null;
 const qre=/^(?:Q(?:uestion)?\s*)?(\d{1,3})[\).:\-]\s*(.*)$/i, ore=/^([A-E])[\).:\-]\s*(.*)$/i;
 for(const line of lines){let m=line.match(qre);if(m){if(q&&q.body)out.push(q);q={number:+m[1],body:m[2]||'',options:[],correct:'',explanation:''};continue}
   m=line.match(ore);if(m&&q){q.options.push({key:m[1].toUpperCase(),text:m[2]});continue}
   if(q){ if(q.options.length){q.options[q.options.length-1].text+=' '+line}else q.body+=(q.body?' ':'')+line }
 }
 if(q&&q.body)out.push(q);
 return out.filter(x=>x.body && (x.options.length>=2 || x.body.length>3));
}
async function extractPdf(file){
 if(!file)throw new Error('PDF файл сонгоно уу.');
 if(file.type && file.type!=='application/pdf' && !file.name.toLowerCase().endsWith('.pdf'))throw new Error('v74 бодит parser одоогоор text-based PDF дээр ажиллана. Зураг/scan файлд OCR backend шаардлагатай.');
 const pdfjs=await import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs');
 pdfjs.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs';
 const buf=await file.arrayBuffer(); const pdf=await pdfjs.getDocument({data:buf}).promise; let pages=[];
 for(let i=1;i<=pdf.numPages;i++){const pg=await pdf.getPage(i);const tc=await pg.getTextContent();let lastY=null,row=[];const rows=[];for(const it of tc.items){const y=Math.round(it.transform?.[5]||0);if(lastY!==null&&Math.abs(y-lastY)>3){rows.push(row.join(' '));row=[]}row.push(it.str);lastY=y}if(row.length)rows.push(row.join(' '));pages.push(rows.join('\n'))}
 return normalize(pages.join('\n'));
}
function render(){const host=$('#pdfImportPreview'),status=$('#pdfImportStatus'),digital=$('#digitalTestPreview');if(status)status.textContent=`Review • ${state.questions.length} асуулт`;if(!host)return;
 host.className='pdf-v74-review';host.innerHTML=`<div class="pdf-v74-summary"><b>${esc(state.title)}</b><span>${esc(state.category)} • ${state.questions.length} асуулт</span><span class="pdf-v74-real">✓ PDF text-ээс бодитоор илрүүлсэн</span></div><div class="pdf-v74-warning">⚠️ Автомат parsing алдаж болно. Publish хийхээс өмнө асуулт, сонголт, зөв хариуг заавал шалгана.</div><div id="pdfV74Questions">${state.questions.map((q,i)=>card(q,i)).join('')}</div><button class="secondary-btn" id="pdfV74Add">+ Асуулт нэмэх</button>`;
 host.querySelectorAll('[data-v74-del]').forEach(b=>b.onclick=()=>{state.questions.splice(+b.dataset.v74Del,1);render()});
 host.querySelectorAll('[data-v74-body]').forEach(x=>x.oninput=()=>state.questions[+x.dataset.v74Body].body=x.value);
 host.querySelectorAll('[data-v74-opt]').forEach(x=>x.oninput=()=>{const [i,j]=x.dataset.v74Opt.split(':').map(Number);state.questions[i].options[j].text=x.value});
 host.querySelectorAll('[data-v74-key]').forEach(x=>x.onchange=()=>state.questions[+x.dataset.v74Key].correct=x.value);
 $('#pdfV74Add')?.addEventListener('click',()=>{state.questions.push({number:state.questions.length+1,body:'',options:[{key:'A',text:''},{key:'B',text:''},{key:'C',text:''},{key:'D',text:''}],correct:'',explanation:''});render()});
 if(digital){digital.style.display='block';renderStudentPreview()}
}
function card(q,i){let opts=q.options.length?q.options:[{key:'A',text:''},{key:'B',text:''},{key:'C',text:''},{key:'D',text:''}];q.options=opts;return `<div class="pdf-v74-q"><header><b>Q${i+1}</b><button class="link-btn" data-v74-del="${i}">Устгах</button></header><textarea data-v74-body="${i}" rows="2">${esc(q.body)}</textarea>${opts.map((o,j)=>`<div class="pdf-v74-opt"><b>${esc(o.key)}</b><input data-v74-opt="${i}:${j}" value="${esc(o.text)}"></div>`).join('')}<label>Зөв хариу <select data-v74-key="${i}"><option value="">— сонгох —</option>${opts.map(o=>`<option ${q.correct===o.key?'selected':''}>${o.key}</option>`).join('')}</select></label></div>`}
function renderStudentPreview(){const shell=$('#digitalTestPreview .digital-test-shell');if(!shell||!state.questions.length)return;const q=state.questions[0];shell.innerHTML=`<aside class="question-nav-demo"><b>Questions</b><div class="qnav-grid">${state.questions.map((_,i)=>`<span class="${i===0?'active':''}">${i+1}</span>`).join('')}</div></aside><div class="digital-question-demo"><small>Question 1 of ${state.questions.length} • ${esc(state.category)}</small><h3>${esc(q.body)}</h3>${q.options.map(o=>`<label><input name="v74demo" type="radio"> ${esc(o.key)}. ${esc(o.text)}</label>`).join('')}<p class="helper-text">Энэ нь сурагчийн харах бодит preview. Publish хийхэд зөв хариу сурагчид харагдахгүй.</p></div>`}
function validate(){if(!state.questions.length)return 'Асуулт илрээгүй байна.';for(let i=0;i<state.questions.length;i++){let q=state.questions[i];if(!q.body.trim())return `Q${i+1}: асуултын текст хоосон.`;if(q.options.length<2)return `Q${i+1}: дор хаяж 2 сонголт хэрэгтэй.`;if(!q.correct)return `Q${i+1}: зөв хариуг сонгоно уу.`}return ''}
async function publish(){const err=validate();if(err){toast(err,false);return}const pack={id:crypto.randomUUID?.()||String(Date.now()),title:state.title,category:state.category,level:state.level,source_file:state.sourceFile,questions:state.questions,question_count:state.questions.length,status:'reviewed',created_at:new Date().toISOString()};
 const arr=JSON.parse(localStorage.getItem('smarteshPdfImportsV74')||'[]');arr.unshift(pack);localStorage.setItem('smarteshPdfImportsV74',JSON.stringify(arr));
 let cloud='Local draft saved';const sb=window.smarteshSupabase;const u=window.currentUser?.();if(sb&&u?.cloud&&u?.role==='admin'){try{const {data:t,error:e}=await sb.from('imported_tests_v74').insert({admin_id:u.id,title:pack.title,category:pack.category,level:pack.level,source_filename:pack.source_file,status:'published'}).select('id').single();if(e)throw e;const rows=pack.questions.map((q,i)=>({test_id:t.id,position:i+1,body:q.body,options:q.options,correct_answer:q.correct}));const {error:ie}=await sb.from('imported_test_items_v74').insert(rows);if(ie)throw ie;cloud='Supabase-д нийтлэгдсэн'}catch(e){toast('Local хадгалсан. Cloud publish: '+e.message,false);return}}
 const msg=$('#publishPdfMsg');if(msg)msg.innerHTML=`✅ <b>${esc(pack.title)}</b> — ${pack.question_count} асуулт баталгаажлаа. ${esc(cloud)}. Багш assignment болгохдоо сурагч/ангиа сонгож онооно.`;toast('PDF import баталгаажлаа ✓')}
$('#analysePdfBtnV74')?.addEventListener('click',async()=>{const f=$('#pdfTestFile')?.files?.[0];const host=$('#pdfImportPreview');try{if(!f)throw new Error('PDF файл сонгоно уу.');state.title=$('#pdfTestTitle')?.value.trim()||f.name.replace(/\.pdf$/i,'');state.category=$('#pdfTestCategory')?.value||'Grammar';state.level=$('#pdfTestLevel')?.value||'Standard';state.sourceFile=f.name;if(host){host.className='empty-state';host.textContent='PDF текстийг уншиж байна…'}const text=await extractPdf(f);state.rawText=text;if(text.replace(/\s/g,'').length<40)throw new Error('Энэ PDF-ээс хангалттай text олдсонгүй. Scan/image PDF байж магадгүй — OCR backend хэрэгтэй. Хуурамч асуулт үүсгэсэнгүй.');state.questions=parseQuestions(text);if(!state.questions.length)throw new Error('Асуултын бүтэц автоматаар танигдсангүй. PDF дээр 1. Question, A. option хэлбэр байгаа эсэхийг шалгана уу.');render()}catch(e){if(host){host.className='empty-state';host.innerHTML=`<b>Import хийгдээгүй.</b><br>${esc(e.message)}`};$('#pdfImportStatus').textContent='Review needed';$('#digitalTestPreview').style.display='none';toast(e.message,false)}});
$('#publishPdfTestBtnV74')?.addEventListener('click',publish);
