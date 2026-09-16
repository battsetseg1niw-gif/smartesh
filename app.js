
const views = document.querySelectorAll('.view');
const navBtns = document.querySelectorAll('[data-view]');

function showView(id){
  const target=document.getElementById(id);
  if(!target || !target.classList.contains('view')){
    console.warn('SmartESH: unknown view',id);
    return false;
  }
  views.forEach(v => v.classList.toggle('active-view', v.id === id));
  document.querySelectorAll('.nav-link').forEach(b => b.classList.toggle('active', b.dataset.view === id));
  document.getElementById('siteEntryAnnouncement')?.classList.remove('open');
  window.scrollTo({top:0,behavior:'smooth'});
  return true;
}
navBtns.forEach(btn => btn.addEventListener('click', () => showView(btn.dataset.view)));

document.getElementById('langBtn').addEventListener('click', () => {
  alert('Prototype: MN / EN language switch will be connected to the real content database.');
});

const practice = [
  {
    q:"If I ___ enough time, I will help you.",
    answers:["have","had","will have","having"],
    correct:0,
    feedback:"Correct: First Conditional uses present simple after 'if'."
  },
  {
    q:"She has lived here ___ 2022.",
    answers:["for","since","from","during"],
    correct:1,
    feedback:"Correct: Use 'since' with a starting point in time."
  },
  {
    q:"This book is ___ than the film.",
    answers:["interesting","more interesting","most interesting","interest"],
    correct:1,
    feedback:"Correct: Long adjectives usually use 'more' in comparatives."
  }
];
let pIndex = 0;
let pAnswered = false;

function renderPractice(){
  const item = practice[pIndex];
  document.getElementById('practiceCount').textContent = `${pIndex+1} / ${practice.length}`;
  document.getElementById('practiceQuestion').textContent = item.q;
  document.getElementById('practiceFeedback').textContent = '';
  const wrap = document.getElementById('practiceAnswers');
  wrap.innerHTML = '';
  pAnswered = false;
  item.answers.forEach((a,i)=>{
    const b = document.createElement('button');
    b.className = 'answer-btn';
    b.textContent = `${String.fromCharCode(65+i)}. ${a}`;
    b.onclick = () => {
      if(pAnswered) return;
      pAnswered = true;
      [...wrap.children].forEach((x,j)=>{
        if(j===item.correct) x.classList.add('correct');
      });
      if(i!==item.correct) b.classList.add('wrong');
      document.getElementById('practiceFeedback').textContent = i===item.correct ? '✅ ' + item.feedback : '❌ ' + item.feedback;
    };
    wrap.appendChild(b);
  });
}
document.getElementById('nextPractice').addEventListener('click',()=>{
  pIndex = (pIndex + 1) % practice.length;
  renderPractice();
});
renderPractice();

const exam = [
  {q:"Choose the correct form: 'By next year, she ___ English for five years.'", answers:["studies","will study","will have studied","has studied"], correct:2, topic:"Grammar"},
  {q:"Choose the closest meaning of 'essential'.", answers:["optional","necessary","rare","difficult"], correct:1, topic:"Vocabulary"},
  {q:"Reading skill: Which strategy helps you find a specific date quickly?", answers:["Skimming","Scanning","Predicting","Summarising"], correct:1, topic:"Reading"},
  {q:"If he ___ earlier, he would have caught the bus.", answers:["left","had left","has left","would leave"], correct:1, topic:"Grammar"},
  {q:"Choose the word that best completes: 'The school introduced a new ___ to improve attendance.'", answers:["policy","permission","population","position"], correct:0, topic:"Vocabulary"}
];

let eIndex = 0, score = 0, topicScores = {}, timerId = null, remaining = 300;

function updateTimer(){
  const m = String(Math.floor(remaining/60)).padStart(2,'0');
  const s = String(remaining%60).padStart(2,'0');
  document.getElementById('timer').textContent = `${m}:${s}`;
  if(remaining<=0){
    clearInterval(timerId);
    finishExam();
  }
  remaining--;
}
function renderExam(){
  const item = exam[eIndex];
  document.getElementById('examQuestionTitle').textContent = `Question ${eIndex+1} of ${exam.length}`;
  document.getElementById('examQuestion').textContent = item.q;
  const wrap = document.getElementById('examAnswers');
  wrap.innerHTML = '';
  item.answers.forEach((a,i)=>{
    const b = document.createElement('button');
    b.className='answer-btn';
    b.textContent = `${String.fromCharCode(65+i)}. ${a}`;
    b.onclick = ()=>{
      [...wrap.children].forEach(x=>x.classList.remove('selected'));
      [...wrap.children].forEach(x=>x.style.outline='none');
      b.style.outline='2px solid #f39b58';
      wrap.dataset.selected = i;
    };
    wrap.appendChild(b);
  });
  wrap.dataset.selected = '';
}
document.getElementById('startExamBtn').onclick = ()=>{
  document.getElementById('examRunner').classList.remove('hidden');
  document.getElementById('examResult').classList.add('hidden');
  eIndex=0;score=0;topicScores={};remaining=300;
  clearInterval(timerId);
  updateTimer();
  timerId=setInterval(updateTimer,1000);
  renderExam();
  document.getElementById('examRunner').scrollIntoView({behavior:'smooth'});
};
document.getElementById('nextExam').onclick = ()=>{
  const wrap=document.getElementById('examAnswers');
  const selected=wrap.dataset.selected;
  if(selected===''){alert('Please choose an answer.');return;}
  const item=exam[eIndex];
  topicScores[item.topic]=topicScores[item.topic]||{right:0,total:0};
  topicScores[item.topic].total++;
  if(Number(selected)===item.correct){score++;topicScores[item.topic].right++;}
  eIndex++;
  if(eIndex>=exam.length){finishExam();}else{renderExam();}
};
function finishExam(){
  clearInterval(timerId);
  document.getElementById('examRunner').classList.add('hidden');
  const pct=Math.round(score/exam.length*100);
  const lines=Object.entries(topicScores).map(([k,v])=>`<div class="metric"><span>${k}</span><b>${Math.round(v.right/v.total*100)}%</b></div><div class="bar"><i style="width:${Math.round(v.right/v.total*100)}%"></i></div>`).join('');
  const weak=Object.entries(topicScores).sort((a,b)=>(a[1].right/a[1].total)-(b[1].right/b[1].total))[0]?.[0] || 'Grammar';
  const result=document.getElementById('examResult');
  result.innerHTML=`<span class="eyebrow">RESULT</span><h2>${pct}% — ${score}/${exam.length}</h2><p>Your result has been analysed by topic.</p>${lines}<div class="feedback"><b>Recommended next:</b> Review ${weak} practice before your next mock exam.</div>`;
  result.classList.remove('hidden');
  result.scrollIntoView({behavior:'smooth'});
}

document.getElementById('saveTrial').onclick=()=>{
  const vals={
    studentDays:document.getElementById('studentDays').value,
    studentExamLimit:document.getElementById('studentExamLimit').value,
    teacherDays:document.getElementById('teacherDays').value,
    teacherExamLimit:document.getElementById('teacherExamLimit').value
  };
  localStorage.setItem('smarteshTrialSettings',JSON.stringify(vals));
  document.getElementById('saveNotice').textContent='✅ Prototype settings saved in this browser.';
};
const saved=localStorage.getItem('smarteshTrialSettings');
if(saved){
  const v=JSON.parse(saved);
  Object.entries(v).forEach(([k,val])=>{const el=document.getElementById(k);if(el)el.value=val;});
}

// ---- SmartESH Content Management v2 ----
const defaultContent = [
  {id:1,grade:"Grade 10",type:"Grammar",title:"Present Perfect Basics",body:"Learn when to use have/has + past participle with simple examples.",plan:"Free",status:"Published",q:"She ___ finished her homework.",answers:["have","has","is","was"],correct:1},
  {id:2,grade:"Grade 11",type:"Vocabulary",title:"Education & Future",body:"Key academic and career vocabulary with short practice.",plan:"Free",status:"Published",q:"Choose the closest meaning of career.",answers:["job path","holiday","subject","exam"],correct:0},
  {id:3,grade:"Grade 12",type:"Reading",title:"Technology and Learning",body:"Short reading practice focused on main idea and inference.",plan:"Premium",status:"Published",q:"Which skill finds a specific fact quickly?",answers:["Scanning","Guessing","Speaking","Copying"],correct:0}
];

let contentItems = JSON.parse(localStorage.getItem("smarteshContentV2") || "null") || defaultContent;
let editingId = null;

const $ = id => document.getElementById(id);
function persistContent(){ localStorage.setItem("smarteshContentV2",JSON.stringify(contentItems)); }

function esc(s){ return String(s||"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m])); }

function renderContentLibrary(){
  const search = ($("contentSearch")?.value || "").toLowerCase();
  const type = $("filterType")?.value || "All";
  const filtered = contentItems.filter(x =>
    (!search || x.title.toLowerCase().includes(search)) &&
    (type==="All" || x.type===type)
  );
  $("contentTotal").textContent = `${contentItems.length} items`;
  $("contentList").innerHTML = filtered.length ? filtered.map(x=>`
    <div class="content-item">
      <div class="content-item-top">
        <div><small>${esc(x.grade)} • ${esc(x.type)}</small><h4>${esc(x.title)}</h4></div>
        <span class="pill ${x.status==="Published"?"free":""}">${esc(x.status)}</span>
      </div>
      <p>${esc(x.body).slice(0,120)}${x.body.length>120?"…":""}</p>
      <div class="content-tags"><span>${esc(x.plan)}</span><span>${x.q?"1 practice question":"No question"}</span></div>
      <div class="content-actions">
        <button onclick="editContent(${x.id})">Edit</button>
        <button onclick="togglePublish(${x.id})">${x.status==="Published"?"Unpublish":"Publish"}</button>
        <button onclick="deleteContent(${x.id})">Delete</button>
      </div>
    </div>`).join("") : "<p>No content found.</p>";

  const pub = contentItems.filter(x=>x.status==="Published");
  $("studentContentPreview").innerHTML = pub.map(x=>`
    <article class="preview-card">
      <span class="pill ${x.plan==="Free"?"free":""}">${esc(x.plan)}</span>
      <h4>${esc(x.title)}</h4>
      <p>${esc(x.grade)} • ${esc(x.type)}</p>
      <p>${esc(x.body).slice(0,95)}${x.body.length>95?"…":""}</p>
      <button class="primary-btn small">Open lesson</button>
    </article>`).join("");
}

function clearContentForm(){
  editingId=null;
  $("cmsFormTitle").textContent="+ Add new content";
  ["contentTitle","contentBody","qText","qA","qB","qC","qD"].forEach(id=>$(id).value="");
  $("contentGrade").value="Grade 10"; $("contentType").value="Grammar";
  $("contentPlan").value="Free"; $("contentStatus").value="Draft"; $("qCorrect").value="0";
}

function collectContent(){
  return {
    id: editingId || Date.now(),
    grade:$("contentGrade").value,type:$("contentType").value,
    title:$("contentTitle").value.trim(),body:$("contentBody").value.trim(),
    plan:$("contentPlan").value,status:$("contentStatus").value,
    q:$("qText").value.trim(),
    answers:[$("qA").value,$("qB").value,$("qC").value,$("qD").value].map(x=>x.trim()),
    correct:Number($("qCorrect").value)
  };
}
$("saveContent").onclick=()=>{
  const item=collectContent();
  if(!item.title || !item.body){$("cmsNotice").textContent="⚠️ Гарчиг болон тайлбар оруулна уу.";return;}
  if(editingId){
    contentItems=contentItems.map(x=>x.id===editingId?item:x);
    $("cmsNotice").textContent="✅ Content updated.";
  }else{
    contentItems.unshift(item);
    $("cmsNotice").textContent="✅ New content saved.";
  }
  persistContent(); clearContentForm(); renderContentLibrary();
};
$("clearContent").onclick=clearContentForm;
$("contentSearch").oninput=renderContentLibrary;
$("filterType").onchange=renderContentLibrary;

window.editContent=id=>{
  const x=contentItems.find(x=>x.id===id); if(!x)return;
  editingId=id;$("cmsFormTitle").textContent="Edit content";
  $("contentGrade").value=x.grade;$("contentType").value=x.type;$("contentTitle").value=x.title;$("contentBody").value=x.body;
  $("contentPlan").value=x.plan;$("contentStatus").value=x.status;$("qText").value=x.q||"";
  ["qA","qB","qC","qD"].forEach((id,i)=>$(id).value=(x.answers||[])[i]||"");
  $("qCorrect").value=String(x.correct||0);
  showView("cms"); window.scrollTo({top:0,behavior:"smooth"});
};
window.togglePublish=id=>{
  contentItems=contentItems.map(x=>x.id===id?{...x,status:x.status==="Published"?"Draft":"Published"}:x);
  persistContent();renderContentLibrary();
};
window.deleteContent=id=>{
  if(confirm("Delete this content?")){contentItems=contentItems.filter(x=>x.id!==id);persistContent();renderContentLibrary();}
};
renderContentLibrary();

// ---- SmartESH v3: EESH + Textbook Question Bank ----
const questionBankV3 = [
  {id:101,source:"EESH",year:"2026",grade:"",unit:"",skill:"Grammar",q:"If she ___ earlier, she would catch the bus.",answers:["leaves","left","will leave","has left"],correct:1},
  {id:102,source:"EESH",year:"2026",grade:"",unit:"",skill:"Vocabulary",q:"Choose the closest meaning of 'reliable'.",answers:["dependable","expensive","rare","noisy"],correct:0},
  {id:103,source:"EESH",year:"2026",grade:"",unit:"",skill:"Dialogue",q:"A: Could you help me with this form? B: ___",answers:["Of course.","Yesterday.","At school.","Three times."],correct:0},
  {id:104,source:"EESH",year:"2026",grade:"",unit:"",skill:"Reading",q:"Which strategy helps locate a name quickly?",answers:["Scanning","Predicting","Retelling","Debating"],correct:0},
  {id:105,source:"EESH",year:"2025",grade:"",unit:"",skill:"Grammar",q:"By 8 p.m., they ___ the project.",answers:["finish","finished","will have finished","are finish"],correct:2},
  {id:106,source:"EESH",year:"2025",grade:"",unit:"",skill:"Vocabulary",q:"Choose the opposite of 'increase'.",answers:["reduce","improve","raise","expand"],correct:0},
  {id:107,source:"EESH",year:"2024",grade:"",unit:"",skill:"Dialogue",q:"A: How was your exam? B: ___",answers:["It went well.","At nine.","By bus.","Next week."],correct:0},
  {id:108,source:"EESH",year:"2024",grade:"",unit:"",skill:"Reading",q:"What does 'main idea' mean?",answers:["The central message","One small detail","A page number","A difficult word"],correct:0},
  {id:109,source:"EESH",year:"2023",grade:"",unit:"",skill:"Grammar",q:"The book ___ by millions of students.",answers:["reads","is read","reading","has read"],correct:1},
  {id:110,source:"EESH",year:"2023",grade:"",unit:"",skill:"Vocabulary",q:"A 'challenge' is something that is ___.",answers:["difficult but possible","always easy","unimportant","silent"],correct:0},
  {id:111,source:"EESH",year:"2022",grade:"",unit:"",skill:"Reading",q:"Which clue can help infer an unknown word?",answers:["Words around it","Page color","Font size","Book price"],correct:0},
  {id:112,source:"EESH",year:"2021",grade:"",unit:"",skill:"Dialogue",q:"A: Would you like some tea? B: ___",answers:["Yes, please.","Yesterday.","At five.","Because tea."],correct:0},
  {id:201,source:"Textbook",year:"",grade:"Grade 10",unit:"Unit 1",skill:"Grammar",q:"She usually ___ to school at 8.",answers:["go","goes","going","gone"],correct:1},
  {id:202,source:"Textbook",year:"",grade:"Grade 10",unit:"Unit 1",skill:"Vocabulary",q:"Choose the school subject word.",answers:["biology","airport","jacket","kitchen"],correct:0},
  {id:203,source:"Textbook",year:"",grade:"Grade 10",unit:"Unit 2",skill:"Dialogue",q:"A: What do you do after school? B: ___",answers:["I play volleyball.","In June.","Blue.","At 7 kg."],correct:0},
  {id:204,source:"Textbook",year:"",grade:"Grade 10",unit:"Unit 2",skill:"Reading",q:"Choose the best title for a text about a student's daily school life.",answers:["My School Day","Wild Animals","Space Travel","Healthy Food"],correct:0},
  {id:205,source:"Textbook",year:"",grade:"Grade 11",unit:"Unit 1",skill:"Grammar",q:"I have lived here ___ three years.",answers:["for","since","from","at"],correct:0},
  {id:206,source:"Textbook",year:"",grade:"Grade 11",unit:"Unit 1",skill:"Vocabulary",q:"Choose a word connected with jobs.",answers:["engineer","curtain","river","sandwich"],correct:0},
  {id:207,source:"Textbook",year:"",grade:"Grade 11",unit:"Unit 3",skill:"Dialogue",q:"A: What are your plans for the future? B: ___",answers:["I'd like to study medicine.","On Monday.","It is red.","Two kilos."],correct:0},
  {id:208,source:"Textbook",year:"",grade:"Grade 11",unit:"Unit 3",skill:"Reading",q:"A text explains advantages and disadvantages. What text type is it?",answers:["Discussion","Invitation","Recipe","Timetable"],correct:0},
  {id:209,source:"Textbook",year:"",grade:"Grade 12",unit:"Unit 1",skill:"Grammar",q:"If I had known, I ___ you.",answers:["would tell","would have told","will tell","told"],correct:1},
  {id:210,source:"Textbook",year:"",grade:"Grade 12",unit:"Unit 2",skill:"Vocabulary",q:"Choose an academic word.",answers:["research","sock","spoon","garage"],correct:0},
  {id:211,source:"Textbook",year:"",grade:"Grade 12",unit:"Unit 4",skill:"Dialogue",q:"A: In my opinion, online learning is useful. B: ___",answers:["I agree to some extent.","At six.","Twice a week ago.","A blue one."],correct:0},
  {id:212,source:"Textbook",year:"",grade:"Grade 12",unit:"Unit 4",skill:"Reading",q:"Which question checks inference?",answers:["What can we conclude?","What is the title?","How many paragraphs?","What is line 1?"],correct:0}
];

let bankSource = "EESH";
let currentTeacherSet = [];
document.querySelectorAll(".source-btn").forEach(btn=>{
  btn.onclick=()=>{
    document.querySelectorAll(".source-btn").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    bankSource=btn.dataset.source;
    $("eeshOptions").classList.toggle("hidden",bankSource!=="EESH");
    if($("textbookOptions")) $("textbookOptions").classList.toggle("hidden",true);
  };
});
function shuffled(arr){ return [...arr].sort(()=>Math.random()-.5); }

$("buildTeacherSet").onclick=()=>{
  const mode=$("runMode").value, skill=$("skillType").value;
  const count=Math.max(1,Number($("questionCount").value)||10);
  let pool=questionBankV3.filter(x=>x.source===bankSource);

  if(bankSource==="EESH"){
    const year=$("examYear").value;
    const selectedYears=[...document.querySelectorAll(".mixedYearCheck:checked")].map(x=>x.value);
    if(mode==="Year") pool=pool.filter(x=>x.year===year);
    if(mode==="Mixed" || mode==="Custom"){
      pool=pool.filter(x=>selectedYears.includes(x.year));
    }
    if((mode==="Skill" || mode==="Custom" || mode==="Mixed") && skill!=="Mixed skills"){
      pool=pool.filter(x=>x.skill===skill);
    }
    const selectedTopicsV31=[...document.querySelectorAll(".topicCheckV31:checked")].map(x=>x.value);
    if(selectedTopicsV31.length){
      pool=pool.filter(x=>{
        const tags=[x.topic,x.subtopic,x.category,x.tag].filter(Boolean).map(v=>String(v).toLowerCase());
        return selectedTopicsV31.some(t=>tags.some(tag=>tag.includes(t.toLowerCase()) || t.toLowerCase().includes(tag)));
      });
    }
  }

  const keyword=($("bankKeywordV35")?.value||"").trim().toLowerCase();
  const qType=$("bankQuestionTypeV35")?.value||"";
  const difficulty=$("bankDifficultyV35")?.value||"";
  if(keyword){
    pool=pool.filter(x=>[x.q,x.topic,x.subtopic,x.skill,...(x.answers||[])].filter(Boolean).join(" ").toLowerCase().includes(keyword));
  }
  if(qType){
    pool=pool.filter(x=>(x.questionType||"Multiple choice")===qType);
  }
  if(difficulty){
    pool=pool.filter(x=>(x.difficulty||"Medium")===difficulty);
  }

  if($("shuffleQuestions").checked) pool=shuffled(pool);
  currentTeacherSet=pool.slice(0,count);
  $("generatedCount").textContent=`${currentTeacherSet.length} questions`;
  const sourceText="2006–2026 ЭЕШ Question Bank";
  $("teacherSetSummary").innerHTML=`<b>${sourceText}</b><br>Mode: ${mode} • Skill: ${skill} • ${$("examMinutes").value} min<br>Questions: ${currentTeacherSet.length}`;
  $("generatedQuestions").innerHTML=currentTeacherSet.length ? currentTeacherSet.map((x,i)=>`
    <div class="generated-q">
      <small>${i+1}. ${x.year||"—"} • ${x.skill}${x.topic?" • "+x.topic:""}${x.difficulty?" • "+x.difficulty:""}</small>
      <h4>${esc(x.q)}</h4>
      <div class="mini-options">${x.answers.map((a,j)=>`${String.fromCharCode(65+j)}. ${esc(a)}`).join(" &nbsp; | &nbsp; ")}</div>
    </div>`).join("") : `<p>No matching questions in the sample bank. Try another filter.</p>`;
};
$("saveTeacherSet").onclick=()=>{
  if(!currentTeacherSet.length){alert("Generate a set first.");return;}
  localStorage.setItem("smarteshTeacherDraft",JSON.stringify({createdAt:new Date().toISOString(),questions:currentTeacherSet}));
  alert("Teacher set saved as draft in this prototype.");
};
$("assignTeacherSet").onclick=()=>{
  if(!currentTeacherSet.length){alert("Generate a set first.");return;}
  alert("Next version: choose class/students, start date, deadline and attempts.");
};
$("addBankQuestion").onclick=()=>showView("cms");

// ---- SmartESH v4: Scanner, Quick Class, Progress ----
const scanBtn = document.getElementById("simulateScan");
if(scanBtn){
  scanBtn.onclick=()=>{
    const student = document.getElementById("scanStudent").value.trim() || "Student";
    document.getElementById("scanStatus").textContent="Graded";
    document.getElementById("scanStatus").classList.add("free");
    document.getElementById("scanResult").innerHTML=`
      <div class="scan-score">
        <div class="score-ring">38/50</div>
        <div>
          <h3>${student}</h3>
          <p>${document.getElementById("scanExam").value}</p>
          <div class="skill-bars">
            ${[
              ["Grammar",85],["Vocabulary",74],["Dialogue",90],["Reading",61]
            ].map(([name,val])=>`
              <div class="skill-row">
                <span>${name}</span>
                <div class="skill-track"><div class="skill-fill" style="width:${val}%"></div></div>
                <b>${val}%</b>
              </div>`).join("")}
          </div>
        </div>
      </div>
      <div class="set-summary" style="margin-top:18px">
        <b>Feedback:</b> Reading inference is the weakest area. Recommended next: 12 reading-inference questions and 1 short strategy lesson.
      </div>
      <div class="content-tags"><span>Correct: 38</span><span>Wrong: 12</span><span>Needs review: Reading</span></div>
    `;
  };
}

const qcBtn=document.getElementById("createQuickClass");
if(qcBtn){
  qcBtn.onclick=()=>{
    const code=Math.random().toString(36).slice(2,6).toUpperCase();
    document.getElementById("qcCodeBox").textContent=code;
    document.getElementById("qcLiveStatus").textContent="Live";
    document.getElementById("qcLiveStatus").classList.add("free");
    const roster=[
      ["Anu","In progress"],["Temuulen","Finished"],["Nomin","In progress"],["Bilguun","Joined"],["Saruul","Finished"]
    ];
    document.getElementById("qcRoster").innerHTML=roster.map(r=>`<div class="roster-item"><span>${r[0]}</span><b>${r[1]}</b></div>`).join("");
    document.getElementById("qcJoined").textContent="5";
    document.getElementById("qcFinished").textContent="2";
    document.getElementById("qcAverage").textContent="76%";
    document.getElementById("qcHardest").textContent="Q8";
  };
}

// ---- SmartESH v5: local demo database, auth, classes, assignments, results ----
const DBKEY="smarteshDBv5";
function loadDB(){
  const seed={users:[],classes:[],assignments:[],results:[],session:null};
  try{
    return JSON.parse(localStorage.getItem(DBKEY))||seed;
  }catch(e){ return seed; }
}
let smartDB=loadDB();
function saveDB(){localStorage.setItem(DBKEY,JSON.stringify(smartDB));}
function makeId(p){return p+"_"+Date.now()+"_"+Math.random().toString(36).slice(2,6)}
function currentUser(){return smartDB.users.find(u=>u.id===smartDB.session?.userId)||null}

function refreshSessionUI(){
  const u=currentUser();
  const n=document.getElementById("sessionName"), r=document.getElementById("sessionRole");
  if(n) n.textContent=u?u.name:"Guest";
  if(r) r.textContent=u?`${u.role.toUpperCase()} • ${u.email}`:"Not logged in";
}
refreshSessionUI();

const loginBtn=document.getElementById("loginBtn");
if(loginBtn) loginBtn.onclick=()=>{
  const email=document.getElementById("loginEmail").value.trim().toLowerCase();
  const pw=document.getElementById("loginPassword").value;
  const u=smartDB.users.find(x=>x.email.toLowerCase()===email&&x.password===pw);
  const m=document.getElementById("loginMessage");
  if(!u){m.textContent="Email эсвэл password буруу.";m.style.color="#9a3c35";return}
  smartDB.session={userId:u.id};saveDB();refreshSessionUI();m.textContent=`Welcome, ${u.name}!`;m.style.color="#1f7a4d";
  if(typeof window.renderRoleNavV7==="function") window.renderRoleNavV7();
  const landing=u.role==="admin"?"admin":u.role==="teacher"?"teacher":"studentHomeV16";
  setTimeout(()=>{ if(typeof showView==="function") showView(landing); },40);
};

const regBtn=document.getElementById("registerBtn");
if(regBtn) regBtn.onclick=()=>{
  const name=document.getElementById("regName").value.trim();
  const email=document.getElementById("regEmail").value.trim().toLowerCase();
  const password=document.getElementById("regPassword").value;
  const role=document.getElementById("regRole").value;
  const m=document.getElementById("registerMessage");
  const consent=document.getElementById("legalConsentV55");
  if(consent && !consent.checked){m.textContent="Үйлчилгээний нөхцөл болон Нууцлалын бодлогыг зөвшөөрнө үү.";m.style.color="#9a3c35";return}
  if(!name||!email||password.length<6){m.textContent="Нэр, зөв email, 6+ тэмдэгт password шаардлагатай.";m.style.color="#9a3c35";return}
  if(smartDB.users.some(u=>u.email===email)){m.textContent="Энэ email бүртгэлтэй байна.";m.style.color="#9a3c35";return}
  const u={id:makeId("u"),name,email,password,role};smartDB.users.push(u);smartDB.session={userId:u.id};saveDB();refreshSessionUI();
  m.textContent="Account амжилттай үүслээ.";m.style.color="#1f7a4d";
};

const logoutBtn=document.getElementById("logoutBtn");
if(logoutBtn) logoutBtn.onclick=()=>{smartDB.session=null;saveDB();refreshSessionUI();if(typeof window.renderRoleNavV7==="function")window.renderRoleNavV7();if(typeof showView==="function")showView("home");};

let selectedClassId=smartDB.classes[0]?.id||null;
function renderClasses(){
  const list=document.getElementById("classList"); if(!list)return;
  list.innerHTML=smartDB.classes.map(c=>`
    <div class="class-card ${c.id===selectedClassId?"active":""}" data-class-id="${c.id}">
      <div class="class-card-head"><b>${c.name}</b><span class="class-code">${c.code}</span></div>
      <small>${c.grade} • ${c.students.length} students</small>
    </div>`).join("")||'<div class="empty-state">No classes yet.</div>';
  document.getElementById("classCount").textContent=smartDB.classes.length;
  list.querySelectorAll(".class-card").forEach(el=>el.onclick=()=>{selectedClassId=el.dataset.classId;renderClasses();renderRoster();renderAssignmentClassOptions();});
}
function renderRoster(){
  const c=smartDB.classes.find(x=>x.id===selectedClassId);
  const label=document.getElementById("selectedClassLabel"), box=document.getElementById("classRosterTable");
  if(!box)return;
  if(!c){if(label)label.textContent="Select a class";box.innerHTML="";return}
  if(label)label.textContent=c.name;
  box.innerHTML=`<table class="smart-table"><thead><tr><th>Name</th><th>Email</th><th>Status</th></tr></thead><tbody>
    ${c.students.map(s=>`<tr><td>${s.name}</td><td>${s.email||"-"}</td><td><span class="pill free">Active</span></td></tr>`).join("")}
  </tbody></table>`;
}
const createClassBtn=document.getElementById("createClassBtn");
if(createClassBtn) createClassBtn.onclick=()=>{
  const name=document.getElementById("classNameInput").value.trim();
  if(!name)return;
  const grade=document.getElementById("classGradeInput").value;
  const code=Math.random().toString(36).slice(2,7).toUpperCase();
  const c={id:makeId("c"),name,grade,code,teacherId:currentUser()?.id||"u_teacher",students:[]};
  smartDB.classes.push(c);selectedClassId=c.id;saveDB();renderClasses();renderRoster();renderAssignmentClassOptions();
  document.getElementById("classNameInput").value="";
};
const addStudentBtn=document.getElementById("addStudentBtn");
if(addStudentBtn) addStudentBtn.onclick=()=>{
  const c=smartDB.classes.find(x=>x.id===selectedClassId); if(!c)return;
  const name=document.getElementById("studentNameInput").value.trim();
  const email=document.getElementById("studentEmailInput").value.trim();
  if(!name)return;
  c.students.push({id:makeId("s"),name,email});saveDB();renderClasses();renderRoster();
  document.getElementById("studentNameInput").value="";document.getElementById("studentEmailInput").value="";
};
function renderAssignmentClassOptions(){
  const sel=document.getElementById("asgClass");if(!sel)return;
  sel.innerHTML=smartDB.classes.map(c=>`<option value="${c.id}">${c.name} • ${c.grade}</option>`).join("");
}
function statusFor(a){
  const now=Date.now(), s=a.start?new Date(a.start).getTime():0, d=a.deadline?new Date(a.deadline).getTime():Infinity;
  if(now<s)return ["Upcoming","status-upcoming"];
  if(now>d)return ["Closed","status-closed"];
  return ["Open","status-open"];
}
function renderAssignments(){
  const list=document.getElementById("assignmentList");if(!list)return;
  document.getElementById("assignmentCount").textContent=smartDB.assignments.length;
  list.innerHTML=smartDB.assignments.map(a=>{
    const c=smartDB.classes.find(x=>x.id===a.classId); const [st,cls]=statusFor(a);
    return `<div class="assignment-card">
      <div class="assignment-card-head"><b>${a.title}</b><span class="${cls}">${st}</span></div>
      <small>${c?.name||"Class"} • ${a.source}</small>
      <div class="content-tags"><span>${a.minutes} min</span><span>${a.attempts} attempt(s)</span><span>${a.feedback}</span></div>
    </div>`;
  }).join("")||'<div class="empty-state">No assignments yet.</div>';
}
const createAssignmentBtn=document.getElementById("createAssignmentBtn");
if(createAssignmentBtn) createAssignmentBtn.onclick=()=>{
  const title=document.getElementById("asgTitle").value.trim();if(!title)return;
  const a={
    id:makeId("a"), title, classId:document.getElementById("asgClass").value,
    source:document.getElementById("asgSource").value,
    start:document.getElementById("asgStart").value,
    deadline:document.getElementById("asgDeadline").value,
    minutes:Number(document.getElementById("asgMinutes").value)||20,
    attempts:document.getElementById("asgAttempts").value,
    feedback:document.getElementById("asgFeedback").value,
    shuffleQ:document.getElementById("asgShuffleQ").checked,
    shuffleA:document.getElementById("asgShuffleA").checked,
    createdBy:currentUser()?.id||"u_teacher"
  };
  smartDB.assignments.push(a);saveDB();renderAssignments();document.getElementById("asgTitle").value="";
};
function renderResults(){
  const box=document.getElementById("resultsTable");if(!box)return;
  box.innerHTML=`<table class="smart-table"><thead><tr><th>Student</th><th>Score</th><th>Grammar</th><th>Vocabulary</th><th>Reading</th><th>Status</th></tr></thead><tbody>
    ${smartDB.results.map(r=>`<tr><td>${r.student}</td><td><b>${r.score}%</b></td><td>${r.grammar}%</td><td>${r.vocab}%</td><td>${r.reading}%</td><td><span class="pill free">Completed</span></td></tr>`).join("")}
  </tbody></table>`;
}
const seedResultsBtn=document.getElementById("seedResultsBtn");
if(seedResultsBtn) seedResultsBtn.onclick=()=>{
  const names=(smartDB.classes[0]?.students||[]).map(s=>s.name);
  const sample=names; smartDB.results=[];
  saveDB();renderResults();
};

renderClasses();renderRoster();renderAssignmentClassOptions();renderAssignments();renderResults();

(function(){function go(id){document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));let t=document.getElementById(id);if(t)t.classList.add('active');window.scrollTo({top:0,behavior:'smooth'});}document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.go)));})();
// ---- SmartESH v7: Role-based navigation + Previous EESH + Mixed Assignment Builder ----
(function(){
  const V7KEY = "smarteshV7";
  const nav = document.getElementById("roleNav");
  const accountBtn = document.getElementById("accountBtn");

  const menus = {
    guest: [
      ["home","Нүүр"],["learn","Хичээл"],["previousExams","Өмнөх оны тест"],["exams","Mock Test"],["accountV21","Жилийн эрх"],["auth","Нэвтрэх"]
    ],
    student: [
      ["studentHomeV16","Нүүр"],["learn","Хичээл"],["previousExams","Өмнөх оны тест"],["exams","Mock Test"],
      ["practiceHub","Practice"],["assignmentsPlus","Даалгавар"],["feedbackV18","Feedback"],["notifications","Мэдэгдэл"],["progress","Ахиц"],["accountV21","Миний эрх"]
    ],
    teacher: [
      ["teacher","Нүүр"],["learn","Хичээл"],["teacherAssignments","Даалгавар"],["previousExams","Өмнөх оны тест"],
      ["paperAnalyticsV17","Цаасан шалгалт"],["notifications","Мэдэгдэл"],["teacherResultsV19","Үр дүн"],["accountV21","Миний эрх"]
    ],
    admin: [
      ["admin","Нүүр"],["adminContentHub","Контент төв"],["adminAnnouncements","Мэдээлэл & мэдэгдэл"],
      ["paperAnalyticsV17","Цаасан шалгалт"],["resultsHub","Тайлан"],["auth","Хэрэглэгч"],["accountV21","Төлбөр & эрх"]
    ]
  };

  function getRole(){
    try{
      if(typeof smartDB!=="undefined" && smartDB.session){
        const u=smartDB.users.find(x=>x.id===smartDB.session.userId);
        return u?.role || "guest";
      }
    }catch(e){}
    return "guest";
  }
  function getUserName(){
    try{
      if(typeof smartDB!=="undefined" && smartDB.session){
        return smartDB.users.find(x=>x.id===smartDB.session.userId)?.name || "User";
      }
    }catch(e){}
    return "Guest";
  }

  function renderRoleNav(){
    if(!nav) return;
    const role=getRole();
    nav.innerHTML=(menus[role]||menus.guest).map(([id,label],i)=>
      `<button class="nav-link ${i===0?'active':''}" data-view="${id}">${label}</button>`
    ).join("");
    nav.querySelectorAll("[data-view]").forEach(b=>b.onclick=()=>showView(b.dataset.view));
    if(accountBtn){
      accountBtn.textContent = role==="guest" ? "Log in" : `${getUserName()} • ${role}`;
      accountBtn.dataset.view = "auth";
    }
  }

  // Public helper so auth refresh can redraw role nav.
  window.renderRoleNavV7 = renderRoleNav;

  // Watch login/logout storage changes caused by existing v5 auth UI.
  ["loginBtn","registerBtn","logoutBtn"].forEach(id=>{
    const el=document.getElementById(id);
    if(el) el.addEventListener("click",()=>setTimeout(renderRoleNav,30));
  });
  renderRoleNav();

  // Previous exam 2024 A — functional section/full runner
  const exam2024Questions = [{"n": 1, "section": "Grammar", "q": "We didn’t have __________ luggage – just two small bags.", "choices": ["-", "many", "a", "any", "much"], "context": ""}, {"n": 2, "section": "Grammar", "q": "No one wants extra homework tonight, __________?", "choices": ["don’t he", "does he", "is he", "do they", "don’t they"], "context": ""}, {"n": 3, "section": "Grammar", "q": "You __________ enter without permission.", "choices": ["can’t", "aren’t", "ought to", "weren’t", "don’t"], "context": ""}, {"n": 4, "section": "Grammar", "q": "Jessica stopped __________ to the gym after she had got back into shape.", "choices": ["go", "to go", "going", "gone", "goes"], "context": ""}, {"n": 5, "section": "Grammar", "q": "My mother’s an interior designer __________ me.", "choices": ["as", "the same", "similar", "like", "to"], "context": ""}, {"n": 6, "section": "Grammar", "q": "The woman has a __________ jacket.", "choices": ["funny old short leather", "funny short old leather", "funny leather short old", "short funny old leather", "leather funny old short"], "context": ""}, {"n": 7, "section": "Grammar", "q": "If he __________ a chance of success, he __________ to move to London.", "choices": ["had / would have need", "will have / would need", "will have / will need", "were to have / will need", "were to have / would need"], "context": ""}, {"n": 8, "section": "Grammar", "q": "She had two choices, neither of __________ was affordable.", "choices": ["who", "whom", "that", "which", "where"], "context": ""}, {"n": 9, "section": "Grammar", "q": "Mother asked, “Where have you been yesterday?” Mother asked __________ .", "choices": ["me where I had been the day before", "where I had been yesterday", "me where I was the day before", "where I could be the day before", "me where had I been the previous day"], "context": ""}, {"n": 10, "section": "Grammar", "q": "I didn’t apply for the job __________ that I had the necessary qualifications.", "choices": ["so", "because of", "despite the fact", "in case", "despite"], "context": ""}, {"n": 11, "section": "Grammar", "q": "Did I tell you about Paul and Karen? __________ .", "choices": ["They stole their bags", "They had their bags stolen", "They get stolen their bags", "They have their bags stolen", "Their bags are stolen"], "context": ""}, {"n": 12, "section": "Grammar", "q": "By the time we __________ to the meeting, they _________ the big decisions without us.", "choices": ["got / have already made", "get / had already made", "had got / had already made", "got / had already made", "got / already made"], "context": ""}, {"n": 13, "section": "Grammar", "q": "Once there was _____ wild dog that was very hungry. He ran here and there _____ the woods and meadow looking _____ a squirrel and a mouse _____ eat.", "choices": ["a, in, through, to", "the, in, at, for", "a, in, for, for", "the, across, to, to", "a, through, for, to"], "context": ""}, {"n": 14, "section": "Grammar", "q": "Choose the appropriate response for gap 14.", "choices": ["So am I", "Yes, so do I", "Neither did I", "Yeah, I suppose so", "No, me neither"], "context": "T: You went to Professor Lee’s geography lecture yesterday, didn’t you?\nM: Yeah, but I didn’t understand very much.\nT: 14. ____ . But don’t worry about it, it’s only the first one.\nM: 15. ____ .\nT: Anyway, how’s your first week going?\nM: Oh, it’s just been crazy. I haven’t stopped since I got here.\nT: 16. ____ . And it’s a huge campus - I keep getting lost!"}, {"n": 15, "section": "Grammar", "q": "Choose the appropriate response for gap 15.", "choices": ["So am I", "Yes, so do I", "Neither did I", "Yeah, I suppose so", "No, me neither"], "context": "T: You went to Professor Lee’s geography lecture yesterday, didn’t you?\nM: Yeah, but I didn’t understand very much.\nT: 14. ____ . But don’t worry about it, it’s only the first one.\nM: 15. ____ .\nT: Anyway, how’s your first week going?\nM: Oh, it’s just been crazy. I haven’t stopped since I got here.\nT: 16. ____ . And it’s a huge campus - I keep getting lost!"}, {"n": 16, "section": "Grammar", "q": "Choose the appropriate response for gap 16.", "choices": ["So am I", "Yes, so do I", "Neither did I", "Yeah, I suppose so", "No, me neither"], "context": "T: You went to Professor Lee’s geography lecture yesterday, didn’t you?\nM: Yeah, but I didn’t understand very much.\nT: 14. ____ . But don’t worry about it, it’s only the first one.\nM: 15. ____ .\nT: Anyway, how’s your first week going?\nM: Oh, it’s just been crazy. I haven’t stopped since I got here.\nT: 16. ____ . And it’s a huge campus - I keep getting lost!"}, {"n": 17, "section": "Grammar", "q": "When did you buy your ticket? (KEY WORD: since)", "choices": ["How long is it since you bought your ticket?", "When is it since you bought your ticket?", "How long since you bought your ticket?", "How long ago did you buy ticket?", "How long has it been since you bought your ticket?"], "context": ""}, {"n": 18, "section": "Grammar", "q": "He hasn’t travelled abroad for years. (KEY WORD: time)", "choices": ["The last time he travelled abroad was years ago.", "He hasn’t travelled abroad years ago.", "He hasn’t travelled abroad last time ago.", "He has travelled for a long time.", "First time he travelled abroad was long ago."], "context": ""}, {"n": 19, "section": "Vocabulary", "q": "The rain won’t last long; it’s only a __________.", "choices": ["hail", "breeze", "shower", "frost", "downpour"], "context": ""}, {"n": 20, "section": "Vocabulary", "q": "__________ is a person whose job is riding horses in races.", "choices": ["Fencer", "Jockey", "Runner", "Swimmer", "Golfer"], "context": ""}, {"n": 21, "section": "Vocabulary", "q": "The theory of __________ studies the nature and origin of the universe.", "choices": ["chemistry", "physics", "biology", "cosmology", "medicine"], "context": ""}, {"n": 22, "section": "Vocabulary", "q": "For security reasons, always log __________ when you leave your computer unattended for any period of time.", "choices": ["up", "in", "on", "for", "out"], "context": ""}, {"n": 23, "section": "Vocabulary", "q": "A (an) __________ is a tall bird with long thin legs and a long neck.", "choices": ["crane(d)", "ostrich", "lever", "move(d)", "stretch(ed)"], "context": ""}, {"n": 24, "section": "Vocabulary", "q": "Finally, the house was put back onto the truck by __________ .", "choices": ["crane(d)", "ostrich", "lever", "move(d)", "stretch(ed)"], "context": ""}, {"n": 25, "section": "Vocabulary", "q": "The boy __________ his neck to get the first glimpse of a celebrity.", "choices": ["crane(d)", "ostrich", "lever", "move(d)", "stretch(ed)"], "context": ""}, {"n": 26, "section": "Vocabulary", "q": "What will you take with you when you reach the mountain’s peak?", "choices": ["hiking boots", "climbing gear", "a fencing sword", "bowling pins", "a mountain bike"], "context": ""}, {"n": 27, "section": "Vocabulary", "q": "What expression is used for making pain go away?", "choices": ["to complain of pain", "to suffer pain", "to cause pain", "to soothe pain", "to inflict pain"], "context": ""}, {"n": 28, "section": "Vocabulary", "q": "Choose the prefix that correctly forms the collocations: ___ageing substance / ___viral drug / ___depressant treatment.", "choices": ["ante-", "pro-", "non-", "pre-", "anti-"], "context": ""}, {"n": 29, "section": "Vocabulary", "q": "Choose the suffix to complete: A persist(__________) learner.", "choices": ["-ance", "-ant", "-ence", "-ent", "-ible"], "context": ""}, {"n": 30, "section": "Vocabulary", "q": "Tonya spends a lot of money __________ fancy clothes.", "choices": ["in", "over", "on", "for", "onto"], "context": ""}, {"n": 31, "section": "Vocabulary", "q": "I asked our neighbors to keep an eye __________ the house while we were away.", "choices": ["with", "over", "at", "for", "on"], "context": ""}, {"n": 32, "section": "Vocabulary", "q": "It really got Mr Robert’s goat when he had to wait two hours to get his plane tickets.", "choices": ["He was annoyed at the long delay.", "He was angry because he couldn’t get the ticket.", "He didn’t care about the long line.", "He was frustrated because he was late for the flight.", "He didn’t mind the long delay."], "context": ""}, {"n": 33, "section": "Vocabulary", "q": "Who wears trousers in your family?", "choices": ["be a caregiver of the family", "be financially dependent on the spouse", "be the dominant partner in a marriage", "be the most educated family member", "be the only breadwinner of the family"], "context": ""}, {"n": 34, "section": "Communication", "q": "What’s wrong with the woman’s current apartment?", "choices": ["The owner is unpleasant.", "It’s too noisy.", "It’s not convenient to the university.", "The heating system is defective.", "She is pleased with her apartment."], "context": "Steve: Hey, I heard you’re looking for a different apartment.\nEllen: Yeah, the place I’m in now is a real dump.\nSteve: It looked okay when I was there.\nEllen: Oh, the boiler keeps breaking and when it does, we lose the heat for several days at a time.\nSteve: Why doesn’t the owner replace it?\nEllen: Well, she says it’s cheaper to keep fixing it. She’s a nice enough person; just sort of stingy. In any case, I’m sick of being cold."}, {"n": 35, "section": "Communication", "q": "What must woman do to have her deposit returned?", "choices": ["Alert the housing authorities to her problem.", "Tell her owner two months in advance that she’s moving.", "Move to another apartment in the same building.", "Leave by the end of the month.", "Lose the heating at the end of the month."], "context": "Steve: Can you get your deposit back if you move?\nEllen: If I give two months’ notice, I can get the whole thing back."}, {"n": 36, "section": "Communication", "q": "What does woman require of her next apartment?", "choices": ["It must be in a new building.", "It must be on a higher floor.", "It must be within driving distance of the university.", "It must have quiet surroundings.", "The cost will be reasonable."], "context": "Steve: So, what kind of place are you looking for?\nEllen: I think I’ll try to get into one of those high rises near the university. They’re nothing really special, but at least they’re new and functional.\nSteve: I’ve heard that those buildings are pretty noisy. The walls are thin and you can hear everything going on in the other apartments.\nEllen: Oh, that’ll never do. I need some place quiet to finish my thesis. I guess I’ll have to look at some more ads. Maybe new isn’t necessarily better."}, {"n": 37, "section": "Communication", "q": "Annie: This milk smells bad. Philip: Yes, I think it’s __________ .", "choices": ["poured out", "thawed out", "went off", "heated up", "gone off"], "context": ""}, {"n": 38, "section": "Communication", "q": "A: I always seem to pick boyfriends who __________ me __________. What can I do? B: Become friends first – then you should know what he is really like before you take things any further.", "choices": ["let, down", "finish, with", "make, up", "live, down", "liven, up"], "context": ""}, {"n": 39, "section": "Reading", "q": "What is the article about?", "choices": ["It explains the difficulties in learning English.", "It criticizes the BBC for its unprofessionalism.", "It describes a humorous mix-up at the BBC.", "It discusses the job interview process at the BBC.", "It highlights the importance of clear communication."], "context": ""}, {"n": 40, "section": "Reading", "q": "What is the purpose of going to the BBC TV center for Mr Goma?", "choices": ["He wanted to meet an IT expert.", "Someone has phoned for a taxi.", "He was been interviewed on TV.", "He wanted a job.", "He watched a TV interview."], "context": ""}, {"n": 41, "section": "Reading", "q": "What does the article suggest about Mr Goma's decision to follow the producer?", "choices": ["He thought he was being hired immediately.", "He was excited about being on TV.", "He was intentionally trying to deceive the BBC staff.", "He was curious about the TV studio.", "He thought his name was mispronounced."], "context": ""}, {"n": 42, "section": "Reading", "q": "What does the article mention about Mr Goma's behavior during the TV interview?", "choices": ["He took it easy and attempted to answer the questions.", "He refused to answer any questions.", "He panicked and ran out of the studio.", "He immediately corrected the producer’s mistake.", "He asked for assistance from the BBC staff."], "context": ""}, {"n": 43, "section": "Reading", "q": "What is the primary comparison made in the article?", "choices": ["Comparing Mr Goma's English skills and those of native speakers.", "The comparison between traditional job interviews and TV appearances.", "Comparing Mr Goma and Guy Kewney's professional backgrounds.", "The comparison between Mr Goma's and viewers' reactions to the interview.", "The comparison between BBC's interview process and other media outlets."], "context": ""}, {"n": 44, "section": "Reading", "q": "What is implied about the BBC staff's reaction to the mix-up during the interview?", "choices": ["They were completely unaware until viewers pointed it out.", "They realized the mistake only after he had answered several questions.", "They knew about the mix-up but continued the interview.", "They stopped the interview as soon as they noticed the mistake.", "They thought Mr Goma was playing a prank on them."], "context": ""}, {"n": 45, "section": "Reading", "q": "Guy Goma was at the BBC for a job interview. As the two men had the same name, the producer got confused. __________ the producer said the wrong name, Guy still went with her to answer the interviewer’s question.", "choices": ["whereas", "as", "since", "even though", "apart from"], "context": ""}, {"n": 46, "section": "Reading", "q": "Guy Kewney is an IT expert, __________ Guy Goma is an IT assistant.", "choices": ["whereas", "as", "since", "even though", "apart from"], "context": ""}, {"n": 47, "section": "Reading", "q": "__________ looking for a bit shocked, Goma gave no other sign that there was something wrong.", "choices": ["whereas", "as", "since", "even though", "apart from"], "context": ""}];
  const exam2024Reading = "The wrong Guy!\n\nThe story of Guy Goma is not one of stupidity. A former taxi driver from the French Congo, Mr Goma was at the BBC TV center for an interview, in the hope of becoming an IT assistant. So when a producer came up to him and said, “Guy Kewney, isn’t it? About the IT thing?” he agreed, because he thought she had just got the wrong pronunciation of his surname.\n\nMr Goma, who had taught himself English after he moved to England four years previously, was rushed into a studio, where he found himself in front of the cameras, having questions thrown at him. How could he know that the man who’d been sitting on a nearby sofa was also called Guy? In fact Guy Kewney was an IT expert, who was waiting to go on live TV to be interviewed about a legal dispute with Apple computers.\n\n“It all happened so fast,” Goma told The Sun newspaper. “I had just signed my name in reception when someone said ‘Follow me.’ She was walking so fast that I had to jog to keep up with her. Even though a lady put some make-up on me and I was fitted with a microphone, I just thought it was all part of the job interview and when I realized I was on air, what could I do? I just tried to answer the questions and stay calm.”\n\nViewers reacted with a mixture of delight and sympathy when the BBC introduced Goma as “Guy Kewney, head of newswireless.net!” Instead of saying there had been a mistake, he answered three questions before BBC staff became aware of what had happened and brought the item to an early close.\n\nMr Goma was finally taken to his interview for the IT post, but he didn’t get the job. Nevertheless, he later became a celebrity after hundreds of thousands of people watched his television appearance online.";
  let selectedSection="Grammar";
  let previousExamSet=[];
  let previousExamIndex=0;
  let previousExamMode="section";
  let previousExamAnswers={};
  try{previousExamAnswers=JSON.parse(localStorage.getItem("smartesh2024AAnswers")||"{}");}catch(e){previousExamAnswers={};}

  function save2024Answers(){localStorage.setItem("smartesh2024AAnswers",JSON.stringify(previousExamAnswers));}
  function sectionQuestions(section){return exam2024Questions.filter(q=>q.section===section);}
  function render2024QuestionNav(){
    const nav=document.getElementById("previousExamQuestionNav2024"); if(!nav)return;
    nav.innerHTML=previousExamSet.map((q,i)=>`<button class="qnum ${i===previousExamIndex?'current':''} ${previousExamAnswers[q.n]!=null?'answered':''}" data-qindex="${i}">${q.n}</button>`).join("");
    nav.querySelectorAll('[data-qindex]').forEach(b=>b.onclick=()=>{previousExamIndex=Number(b.dataset.qindex);render2024Question();});
  }
  function render2024Question(){
    const runner=document.getElementById("previousExamRunner2024"); if(!runner||!previousExamSet.length)return;
    const item=previousExamSet[previousExamIndex];
    const title=document.getElementById("previousExamRunnerTitle");
    const meta=document.getElementById("previousExamRunnerMeta");
    if(title)title.textContent=previousExamMode==="full"?"2024 A • Full Section 1":`${item.section} practice`;
    if(meta)meta.textContent=`Question ${item.n} • ${previousExamIndex+1} / ${previousExamSet.length}`;
    const qbox=document.getElementById("previousExamQuestion2024"); if(qbox)qbox.innerHTML=`<span class="pill">${item.section} • Q${item.n}</span><h2>${item.q}</h2>`;
    const ctx=document.getElementById("previousExamContext");
    if(ctx){ctx.textContent=item.context||"";ctx.classList.toggle("hidden",!item.context);}
    const passage=document.getElementById("previousExamReadingPassage");
    const readingText=document.getElementById("previousExamReadingText");
    if(passage) passage.classList.toggle("hidden",item.section!=="Reading");
    if(readingText && item.section==="Reading") readingText.textContent=exam2024Reading;
    const answers=document.getElementById("previousExamAnswers2024");
    if(answers){
      answers.innerHTML=item.choices.map((choice,i)=>{const letter=String.fromCharCode(65+i);return `<button class="answer-btn ${previousExamAnswers[item.n]===letter?'selected-answer':''}" data-answer="${letter}"><b>${letter}.</b> ${choice}</button>`;}).join("");
      answers.querySelectorAll('[data-answer]').forEach(btn=>btn.onclick=()=>{
        previousExamAnswers[item.n]=btn.dataset.answer; save2024Answers(); render2024Question();
      });
    }
    const answered=previousExamSet.filter(q=>previousExamAnswers[q.n]!=null).length;
    const count=document.getElementById("previousExamAnsweredCount"); if(count)count.textContent=`${answered} / ${previousExamSet.length} answered`;
    const bar=document.getElementById("previousExamProgressBar"); if(bar)bar.style.width=`${Math.round(answered/previousExamSet.length*100)}%`;
    const prev=document.getElementById("previousExamPrev"); if(prev)prev.disabled=previousExamIndex===0;
    const next=document.getElementById("previousExamNext"); if(next)next.textContent=previousExamIndex===previousExamSet.length-1?'Дуусгах':'Дараах →';
    render2024QuestionNav();
    runner.classList.remove("hidden");
  }
  function open2024Practice(section,full=false){
    selectedSection=section||selectedSection; previousExamMode=full?'full':'section';
    previousExamSet=full?[...exam2024Questions]:sectionQuestions(selectedSection); previousExamIndex=0;
    const n=document.getElementById("previousExamNotice");
    if(n)n.innerHTML=full?`✅ 2024 A • Section 1-ийн 47 асуулт нээгдлээ.`:`✅ 2024 A • ${selectedSection} хэсгийн ${previousExamSet.length} асуулт нээгдлээ.`;
    render2024Question();
    setTimeout(()=>document.getElementById("previousExamRunner2024")?.scrollIntoView({behavior:'smooth',block:'start'}),40);
  }
  document.querySelectorAll(".exam-section-card").forEach(card=>{
    card.addEventListener("click",()=>{
      document.querySelectorAll(".exam-section-card").forEach(c=>c.classList.remove("active"));
      card.classList.add("active"); selectedSection=card.dataset.section; open2024Practice(selectedSection,false);
    });
  });
  const firstSection=document.querySelector(".exam-section-card"); if(firstSection)firstSection.classList.add("active");
  const startFull=document.getElementById("start2024Full"); if(startFull)startFull.onclick=()=>open2024Practice("Grammar",true);
  const practiceSec=document.getElementById("practice2024Section"); if(practiceSec)practiceSec.onclick=()=>open2024Practice(selectedSection,false);
  document.getElementById("previousExamPrev")?.addEventListener("click",()=>{if(previousExamIndex>0){previousExamIndex--;render2024Question();}});
  document.getElementById("previousExamNext")?.addEventListener("click",()=>{
    if(previousExamIndex<previousExamSet.length-1){previousExamIndex++;render2024Question();} else {
      save2024Answers(); const answered=previousExamSet.filter(q=>previousExamAnswers[q.n]!=null).length;
      const n=document.getElementById("previousExamRunnerNotice"); if(n)n.innerHTML=`✅ ${answered} / ${previousExamSet.length} хариулт хадгалагдлаа. Official answer key баталгаажаагүй тул оноо одоогоор бодохгүй.`;
    }
  });
  document.getElementById("previousExamSave")?.addEventListener("click",()=>{
    save2024Answers(); const n=document.getElementById("previousExamRunnerNotice"); if(n)n.textContent="✓ Хариултууд browser дээр хадгалагдлаа.";
  });

  // Admin import simulation
  const importBtn=document.getElementById("simulateImportBtn");
  if(importBtn) importBtn.onclick=()=>{
    const status=document.getElementById("importStatus");
    const result=document.getElementById("importResult");
    const pdf=document.getElementById("examPdfInput");
    if(status) status.textContent="Analysed";
    if(result){
      result.className="";
      result.innerHTML=`
        <div class="access-note"><b>2024 • Version A</b><br>Prototype import result based on the uploaded 2024 English exam structure.</div>
        <div class="cards-grid four compact">
          <div class="kpi"><span>Detected</span><b>47 MCQ</b></div>
          <div class="kpi"><span>Sections</span><b>4</b></div>
          <div class="kpi"><span>Section 2</span><b>3 tasks</b></div>
          <div class="kpi"><span>Status</span><b>Draft</b></div>
        </div>
        <div class="import-preview-list" style="margin-top:14px">
          <div class="import-q"><span>Auto tag</span><b>Grammar • Vocabulary • Communication • Reading</b><small>Topic and question-type tags can be reviewed by Admin.</small></div>
          <div class="import-q"><span>Answer key</span><b>${document.getElementById("answerKeyInput")?.files?.length ? "File attached — pending validation" : "Not attached"}</b><small>Questions cannot become Official until the answer key is approved.</small></div>
        </div>
        <div class="form-actions"><button class="secondary-btn" onclick="alert('Draft saved in prototype.')">Save Draft</button><button class="primary-btn" onclick="alert('Admin review step opened in prototype.')">Review Questions</button></div>`;
    }
  };

  // Mixed assignment builder
  let selectedSource="Previous EESH";
  let mix=JSON.parse(localStorage.getItem("smarteshV7Mix")||"[]");
  const sourceCards=[...document.querySelectorAll(".source-card")];

  function sourceOptionsHTML(source){
    if(source==="Previous EESH") return `
      <div class="two-col">
        <label class="bank-label">Year<select id="builderYear"><option selected>2024</option><option>2023</option><option>2022</option></select></label>
        <label class="bank-label">Section<select id="builderSection"><option>Grammar</option><option>Vocabulary</option><option>Communication</option><option>Reading</option><option>Mixed</option></select></label>
      </div>
      <label class="bank-label">Question count<input id="builderCount" type="number" value="10" min="1" max="50"></label>
      <button id="addSourceBtn" class="primary-btn wide-btn">+ Add to assignment</button>`;
    if(source==="Textbook") return `
      <div class="two-col"><label class="bank-label">Grade<select id="builderGrade"><option>Grade 10</option><option>Grade 11</option><option>Grade 12</option></select></label>
      <label class="bank-label">Unit<select id="builderUnit">${Array.from({length:10},(_,i)=>`<option>Unit ${i+1}</option>`).join("")}</select></label></div>
      <label class="bank-label">Skill<select id="builderSkill"><option>Grammar</option><option>Vocabulary</option><option>Reading</option><option>Communication</option></select></label>
      <label class="bank-label">Question count<input id="builderCount" type="number" value="10" min="1" max="50"></label>
      <button id="addSourceBtn" class="primary-btn wide-btn">+ Add to assignment</button>`;
    if(source==="Question Bank") return `
      <label class="bank-label">Filter<select id="qbFilter"><option>My saved questions</option><option>Grammar</option><option>Vocabulary</option><option>Reading</option><option>Communication</option></select></label>
      <label class="bank-label">Question count<input id="builderCount" type="number" value="10" min="1" max="50"></label>
      <button id="addSourceBtn" class="primary-btn wide-btn">+ Add from Question Bank</button>`;
    if(source==="AI") return `
      <div class="access-note">AI нь эх материалыг хуулбарлахгүй, сонгосон сэдэвт нийцсэн шинэ original practice үүсгэнэ.</div>
      <label class="bank-label">Topic<input id="aiTopic" placeholder="e.g. Conditionals"></label>
      <label class="bank-label">Question count<input id="builderCount" type="number" value="5" min="1" max="20"></label>
      <button id="addSourceBtn" class="primary-btn wide-btn">+ Generate & Add</button>`;
    return `
      <label class="bank-label">Set name<input id="mySetName" placeholder="My grammar questions"></label>
      <label class="bank-label">Question count<input id="builderCount" type="number" value="5" min="1" max="50"></label>
      <button id="addSourceBtn" class="primary-btn wide-btn">+ Add my questions</button>`;
  }

  function describeSource(){
    const count=Number(document.getElementById("builderCount")?.value||0);
    if(selectedSource==="Previous EESH") return {count,label:`2024 • ${document.getElementById("builderSection")?.value||"Grammar"}`};
    if(selectedSource==="Textbook") return {count,label:`${document.getElementById("builderGrade")?.value} • ${document.getElementById("builderUnit")?.value} • ${document.getElementById("builderSkill")?.value}`};
    if(selectedSource==="Question Bank") return {count,label:document.getElementById("qbFilter")?.value||"Question Bank"};
    if(selectedSource==="AI") return {count,label:document.getElementById("aiTopic")?.value||"AI topic"};
    return {count,label:document.getElementById("mySetName")?.value||"My questions"};
  }

  function bindAdd(){
    const btn=document.getElementById("addSourceBtn");
    if(btn) btn.onclick=()=>{
      const d=describeSource();
      if(!d.count || d.count<1)return;
      mix.push({id:Date.now(),source:selectedSource,label:d.label,count:d.count});
      localStorage.setItem("smarteshV7Mix",JSON.stringify(mix));
      renderMix();
    };
  }

  sourceCards.forEach(card=>{
    card.onclick=()=>{
      sourceCards.forEach(c=>c.classList.remove("active"));
      card.classList.add("active");
      selectedSource=card.dataset.asource;
      const box=document.getElementById("sourceOptions");
      if(box) box.innerHTML=sourceOptionsHTML(selectedSource);
      bindAdd();
    };
  });

  function renderMix(){
    const list=document.getElementById("mixList");
    const total=mix.reduce((s,x)=>s+Number(x.count||0),0);
    if(document.getElementById("mixTotal"))document.getElementById("mixTotal").textContent=total;
    if(document.getElementById("mixCount"))document.getElementById("mixCount").textContent=`${mix.length} sources`;
    if(list) list.innerHTML=mix.length?mix.map(x=>`
      <div class="mix-item"><div><b>${x.source}</b><small>${x.label} • ${x.count} questions</small></div><button data-remove="${x.id}">✕</button></div>
    `).join(""):`<p class="empty-state">Эх үүсвэрээс асуулт нэмнэ үү.</p>`;
    list?.querySelectorAll("[data-remove]").forEach(b=>b.onclick=()=>{
      mix=mix.filter(x=>String(x.id)!==String(b.dataset.remove));
      localStorage.setItem("smarteshV7Mix",JSON.stringify(mix));renderMix();
    });
  }
  bindAdd(); renderMix();

  const cont=document.getElementById("continueAssignBtn");
  if(cont) cont.onclick=()=>{
    if(!mix.length){alert("Эхлээд даалгаварт асуулт нэмнэ үү.");return;}
    const total=mix.reduce((s,x)=>s+Number(x.count||0),0);
    localStorage.setItem("smarteshV9AssignmentDraft",JSON.stringify({mix,total,createdAt:new Date().toISOString()}));
    const modal=document.getElementById("assignmentPreviewModal");
    const count=document.getElementById("previewQuestionCount");
    if(count) count.textContent=`${total} questions`;
    if(modal){modal.classList.add("open");modal.setAttribute("aria-hidden","false");}
  };
})();

// ---- v8 scanner clarity ----
(function(){
  const methods=[...document.querySelectorAll(".key-method")];
  const body=document.getElementById("keyMethodBody");
  let method="manual";

  function renderKeyMethod(){
    if(!body)return;
    if(method==="manual"){
      body.innerHTML=`<label class="bank-label">Answer key
        <textarea id="manualAnswerKey" rows="5" placeholder="1-B, 2-D, 3-A, 4-C, 5-E ..."></textarea>
      </label><p class="helper-text">Нэг удаа хадгалсны дараа дахин оруулах шаардлагагүй.</p>`;
    } else if(method==="upload"){
      body.innerHTML=`<label class="bank-label">Зөв хариуны файл
        <input id="answerKeyFileV8" type="file" accept=".pdf,.csv,.xlsx,.xls,image/*">
      </label><p class="helper-text">PDF / Excel / CSV байж болно. Production дээр импортын дараа багш зөв хариуг review хийнэ.</p>`;
    } else {
      body.innerHTML=`<label class="bank-label">SmartESH-д хадгалсан шалгалт
        <select id="existingPaperTest">
          <option>2024 ЭЕШ • Version A</option>
          <option>Grade 12 Practice Test 1</option>
          <option>Unit 3 Grammar Quiz</option>
        </select>
      </label><p class="helper-text">Өмнөх шалгалтын answer key-г шууд ашиглана.</p>`;
    }
  }

  methods.forEach(b=>b.addEventListener("click",()=>{
    methods.forEach(x=>x.classList.remove("active"));
    b.classList.add("active");
    method=b.dataset.keymethod;
    renderKeyMethod();
  }));

  const save=document.getElementById("savePaperTestBtn");
  if(save)save.addEventListener("click",()=>{
    const name=document.getElementById("paperTestName")?.value?.trim()||"Paper Test";
    const q=Number(document.getElementById("paperQuestionCount")?.value||0);
    localStorage.setItem("smarteshPaperTestV8",JSON.stringify({name,q,method,savedAt:new Date().toISOString()}));
    const msg=document.getElementById("paperSaveMsg");
    if(msg)msg.innerHTML=`✅ <b>${name}</b> хадгалагдлаа. Одоо сурагчдын answer sheet-ийг scan хийж болно.`;
    const sel=document.getElementById("savedPaperTest");
    if(sel)sel.innerHTML=`<option>${name} • ${q} questions</option>`;
  });

  const scan=document.getElementById("scanGradeBtn");
  if(scan)scan.addEventListener("click",()=>{
    const files=document.getElementById("studentSheets")?.files?.length||0;
    const box=document.getElementById("scanResultsV8");
    if(box){
      box.style.display="block";
      box.scrollIntoView({behavior:"smooth",block:"start"});
    }
    if(!files){
      alert("Prototype demo: answer sheet файл сонгоогүй ч demo үр дүнг харууллаа.");
    }
  });
})();

// ---- v9 digital assignment preview ----
(function(){
  const modal=document.getElementById("assignmentPreviewModal");
  function closePreview(){
    if(!modal)return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden","true");
  }
  document.querySelectorAll("[data-closepreview]").forEach(x=>x.addEventListener("click",closePreview));
  document.getElementById("backToEditBtn")?.addEventListener("click",closePreview);

  const titleInput=document.getElementById("previewTitleInput");
  titleInput?.addEventListener("input",()=>{
    const h=document.getElementById("previewAssignmentTitle");
    if(h) h.textContent=titleInput.value||"Untitled Assignment";
  });

  document.getElementById("assignDigitalBtn")?.addEventListener("click",()=>{
    const draft=JSON.parse(localStorage.getItem("smarteshV9AssignmentDraft")||"{}");
    const assignment={
      ...draft,
      title:document.getElementById("previewTitleInput")?.value||"Mixed Practice",
      time:Number(document.getElementById("previewTimeInput")?.value||20),
      attempts:document.getElementById("previewAttempts")?.value||"1",
      feedback:document.getElementById("previewFeedbackToggle")?.checked!==false,
      shuffle:document.getElementById("previewShuffleToggle")?.checked!==false,
      delivery:"digital",
      status:"assigned",
      assignedAt:new Date().toISOString()
    };
    localStorage.setItem("smarteshV9LastAssigned",JSON.stringify(assignment));
    closePreview();
    alert("✅ Цахим даалгавар оноогдлоо. Сурагч My Assignments хэсгээс ажиллана.");
  });
})();

// ---- v11 PDF → Digital Test ----
(function(){
  const analyse=document.getElementById("analysePdfBtn");
  const status=document.getElementById("pdfImportStatus");
  const preview=document.getElementById("pdfImportPreview");
  const digital=document.getElementById("digitalTestPreview");

  if(analyse) analyse.addEventListener("click",()=>{
    const title=document.getElementById("pdfTestTitle")?.value?.trim()||"Untitled Test";
    const cat=document.getElementById("pdfTestCategory")?.value||"Grammar";
    const file=document.getElementById("pdfTestFile");
    if(status) status.textContent="Draft ready";
    if(preview){
      preview.className="";
      preview.innerHTML=`
        <div class="access-note"><b>${title}</b><br>${cat} • PDF import prototype</div>
        <div class="import-summary">
          <div><span>Detected questions</span><b>10</b></div>
          <div><span>MCQ</span><b>8</b></div>
          <div><span>Other</span><b>2</b></div>
          <div><span>Status</span><b>Draft</b></div>
        </div>
        <div class="detected-list">
          <div class="detected-item"><span>Q1–Q8</span><small>Multiple choice • options detected</small></div>
          <div class="detected-item"><span>Q9–Q10</span><small>Short response / review needed</small></div>
          <div class="detected-item"><span>Answer key</span><small>Pending Admin validation</small></div>
        </div>
        <p class="helper-text">Admin нь асуулт, сонголт, зөв хариуг шалгаад дараагийн Preview хэсэгт орно.</p>`;
    }
    if(digital) digital.style.display="block";
  });

  document.getElementById("publishPdfTestBtn")?.addEventListener("click",()=>{
    const title=document.getElementById("pdfTestTitle")?.value?.trim()||"Untitled Test";
    const cat=document.getElementById("pdfTestCategory")?.value||"Grammar";
    const published=JSON.parse(localStorage.getItem("smarteshV11PublishedTests")||"[]");
    published.unshift({id:Date.now(),title,category:cat,status:"published",createdAt:new Date().toISOString()});
    localStorage.setItem("smarteshV11PublishedTests",JSON.stringify(published));
    const msg=document.getElementById("publishPdfMsg");
    if(msg) msg.innerHTML=`✅ <b>${title}</b> нийтлэгдлээ. Багш Даалгаврын сангаас сонгож онооно; сурагч цахимаар ажиллана.`;
  });
})();

// ---- v11 Lesson Content ----
(function(){
  const previewBtn=document.getElementById("previewLessonBtn");
  const student=document.getElementById("lessonStudentPreview");

  function lessonData(){
    return {
      title:document.getElementById("lessonTitle")?.value?.trim()||"Untitled lesson",
      skill:document.getElementById("lessonSkill")?.value||"Grammar",
      topic:document.getElementById("lessonTopic")?.value?.trim()||"",
      summary:document.getElementById("lessonSummary")?.value?.trim()||"",
      videoUrl:document.getElementById("lessonVideoUrl")?.value?.trim()||"",
      hasImage:(document.getElementById("lessonImage")?.files?.length||0)>0,
      hasVideo:(document.getElementById("lessonVideo")?.files?.length||0)>0,
      hasPdf:(document.getElementById("lessonPdf")?.files?.length||0)>0
    };
  }

  if(previewBtn) previewBtn.addEventListener("click",()=>{
    const d=lessonData();
    if(student) student.innerHTML=`
      <div class="lesson-cover-demo">${d.hasImage?"🖼️":"📘"}</div>
      <span class="lesson-tag">${d.skill}</span>
      <h2>${d.title}</h2>
      <p>${d.summary||"Lesson explanation"}</p>
      <div class="lesson-media-tabs">
        <button class="active">Explanation</button>
        ${d.hasImage?'<button>Image</button>':''}
        ${(d.hasVideo||d.videoUrl)?'<button>Video</button>':''}
        ${d.hasPdf?'<button>PDF</button>':''}
        <button>Practice</button>
      </div>
      <div class="lesson-example-box"><b>Student view</b><p>Lesson content → example → practice → feedback</p></div>`;
  });

  document.getElementById("publishLessonBtn")?.addEventListener("click",()=>{
    const d=lessonData();
    const arr=JSON.parse(localStorage.getItem("smarteshV11Lessons")||"[]");
    arr.unshift({...d,id:Date.now(),status:"published",createdAt:new Date().toISOString()});
    localStorage.setItem("smarteshV11Lessons",JSON.stringify(arr));
    const msg=document.getElementById("lessonPublishMsg");
    if(msg) msg.innerHTML=`✅ <b>${d.title}</b> хичээл нийтлэгдлээ. Сурагч ${d.skill} хэсгээс үзэж болно.`;
    const list=document.getElementById("publishedLessons");
    if(list){
      const media=[d.hasImage&&"image",(d.hasVideo||d.videoUrl)&&"video",d.hasPdf&&"PDF","practice"].filter(Boolean).join(" • ");
      list.insertAdjacentHTML("afterbegin",`<div class="lesson-list-item"><div><span>${d.skill}</span><b>${d.title}</b><small>Explanation • ${media}</small></div><button class="secondary-btn">Edit</button></div>`);
    }
    const badge=document.getElementById("lessonCountBadge");
    if(badge) badge.textContent=`${3+arr.length} lessons`;
  });
})();

// ---- v12 robust preview close behavior ----
(function(){
  const modal=document.getElementById("assignmentPreviewModal");
  if(!modal) return;

  const observer=new MutationObserver(()=>{
    const open=modal.classList.contains("open");
    document.body.classList.toggle("preview-open",open);
  });
  observer.observe(modal,{attributes:true,attributeFilter:["class"]});

  function closeIt(){
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden","true");
    document.body.classList.remove("preview-open");
  }

  // Make every close control reliable even if earlier listeners failed.
  modal.querySelectorAll("[data-closepreview], .icon-close, #backToEditBtn").forEach(el=>{
    el.addEventListener("click",function(e){
      e.preventDefault();
      e.stopPropagation();
      closeIt();
    });
  });

  // ESC closes preview.
  document.addEventListener("keydown",e=>{
    if(e.key==="Escape" && modal.classList.contains("open")) closeIt();
  });

  // Clicking the dimmed backdrop closes preview.
  modal.addEventListener("click",e=>{
    if(e.target.classList.contains("preview-backdrop")) closeIt();
  });
})();

// ---- v13 Admin manual question entry ----
(function(){
  const entryButtons=[...document.querySelectorAll(".entry-choice")];
  entryButtons.forEach(b=>b.addEventListener("click",()=>{
    entryButtons.forEach(x=>x.classList.remove("active"));
    b.classList.add("active");
    if(b.dataset.entrymode==="pdf"){
      if(typeof showView==="function") showView("pdfToTest");
    }
  }));

  function currentQ(){
    return {
      id:Date.now(),
      skill:document.getElementById("manualQSkill")?.value||"Grammar",
      topic:document.getElementById("manualQTopic")?.value?.trim()||"",
      text:document.getElementById("manualQText")?.value?.trim()||"",
      options:{
        A:document.getElementById("optA")?.value||"",
        B:document.getElementById("optB")?.value||"",
        C:document.getElementById("optC")?.value||"",
        D:document.getElementById("optD")?.value||""
      },
      correct:document.getElementById("manualCorrect")?.value||"A",
      points:Number(document.getElementById("manualPoints")?.value||1),
      explanation:document.getElementById("manualExplanation")?.value?.trim()||"",
      source:"Admin manual",
      status:"published"
    };
  }

  function renderPreview(){
    const q=currentQ();
    document.getElementById("manualQuestionPreview").style.display="block";
    document.getElementById("mqPreviewMeta").textContent=`${q.skill} • ${q.topic}`;
    document.getElementById("mqPreviewText").textContent=q.text;
    ["A","B","C","D"].forEach(k=>{
      const el=document.getElementById("mq"+k); if(el) el.textContent=q.options[k];
    });
    document.getElementById("manualQuestionPreview")?.scrollIntoView({behavior:"smooth",block:"start"});
  }

  document.getElementById("previewManualQBtn")?.addEventListener("click",renderPreview);

  document.getElementById("saveManualQBtn")?.addEventListener("click",()=>{
    const q=currentQ();
    if(!q.text){alert("Асуултаа оруулна уу.");return;}
    const bank=JSON.parse(localStorage.getItem("smarteshV13QuestionBank")||"[]");
    bank.unshift(q);
    localStorage.setItem("smarteshV13QuestionBank",JSON.stringify(bank));
    const msg=document.getElementById("manualQMsg");
    if(msg) msg.innerHTML=`✅ Асуулт <b>${q.skill} → ${q.topic}</b> ангилалд хадгалагдлаа. Багш Даалгаврын сангаас сонгож ашиглана.`;
  });
})();

// ---- v14 navigation cards ----
(function(){
  document.querySelectorAll('.practice-main-card[data-view], .admin-hub-card[data-view], .recommend-item [data-view]').forEach(el=>{
    el.addEventListener('click',()=>{ if(typeof showView==='function') showView(el.dataset.view); });
  });
})();

// ---- v14 notifications ----
(function(){
  const filters=[...document.querySelectorAll('.notif-filter')];
  filters.forEach(btn=>btn.addEventListener('click',()=>{
    filters.forEach(x=>x.classList.remove('active'));
    btn.classList.add('active');
    const type=btn.dataset.nfilter;
    document.querySelectorAll('#notificationFeed .notification-card').forEach(card=>{
      card.style.display=(type==='all'||card.dataset.type===type)?'grid':'none';
    });
  }));

  document.getElementById('markAllReadBtn')?.addEventListener('click',()=>{
    document.querySelectorAll('#notificationFeed .notification-card').forEach(c=>c.classList.remove('unread'));
    localStorage.setItem('smarteshV14AllRead','1');
  });
})();

// ---- v14 admin announcement publishing ----
(function(){
  const iconMap={announcement:'📢',update:'🆕',tip:'💡',schedule:'📅'};
  const labelMap={announcement:'МЭДЭГДЭЛ',update:'ШИНЭ КОНТЕНТ',tip:'ӨДРИЙН ЗӨВЛӨГӨӨ',schedule:'ХУВААРЬ'};

  function data(){
    return {
      id:Date.now(),
      type:document.getElementById('annType')?.value||'announcement',
      audience:document.getElementById('annAudience')?.value||'Бүгд',
      title:document.getElementById('annTitle')?.value?.trim()||'Гарчиг энд харагдана',
      body:document.getElementById('annBody')?.value?.trim()||'Мэдээллийн текст энд харагдана.',
      link:document.getElementById('annLink')?.value?.trim()||'',
      pinned:document.getElementById('annPinned')?.checked||false,
      date:document.getElementById('annDate')?.value||'',
      time:document.getElementById('annTime')?.value||'',
      createdAt:new Date().toISOString()
    };
  }

  function preview(){
    const d=data(), box=document.getElementById('announcementPreview');
    if(!box)return;
    box.innerHTML=`<div class="notif-icon">${iconMap[d.type]}</div>
      <div><div class="notif-meta"><span>${labelMap[d.type]}</span><time>${d.date||'Өнөөдөр'}</time></div>
      <h3>${d.title}</h3><p>${d.body}</p></div>`;
  }

  document.getElementById('previewAnnBtn')?.addEventListener('click',preview);
  ['annType','annTitle','annBody'].forEach(id=>document.getElementById(id)?.addEventListener('input',preview));

  document.getElementById('publishAnnBtn')?.addEventListener('click',()=>{
    const d=data();
    if(!document.getElementById('annTitle')?.value?.trim()){
      alert('Гарчиг оруулна уу.'); return;
    }
    const arr=JSON.parse(localStorage.getItem('smarteshV14Announcements')||'[]');
    arr.unshift(d);
    localStorage.setItem('smarteshV14Announcements',JSON.stringify(arr));

    const list=document.getElementById('publishedAnnouncements');
    if(list){
      list.insertAdjacentHTML('afterbegin',
        `<div class="published-ann"><span>${iconMap[d.type]}</span><div><b>${d.title}</b><small>${d.audience} • ${d.date||'Өнөөдөр'}</small></div><button class="secondary-btn">Edit</button></div>`);
    }
    const count=document.getElementById('publishedAnnCount');
    if(count) count.textContent=String(arr.length+3);
    const msg=document.getElementById('annPublishMsg');
    if(msg) msg.innerHTML=`✅ <b>${d.title}</b> нийтлэгдлээ. ${d.audience} хэрэглэгчийн Мэдэгдэл хэсэгт харагдана.`;
    preview();
  });

  // Set today's date when possible
  const dateInput=document.getElementById('annDate');
  if(dateInput && !dateInput.value){
    const now=new Date(), local=new Date(now.getTime()-now.getTimezoneOffset()*60000);
    dateInput.value=local.toISOString().slice(0,10);
  }
})();

// v15 teacher assignment tabs
(function(){
 const buttons=[...document.querySelectorAll('.teacher-choice')];
 buttons.forEach(b=>b.addEventListener('click',()=>{
   buttons.forEach(x=>x.classList.remove('active')); b.classList.add('active');
   const own=b.dataset.tmode==='own';
   const a=document.getElementById('readyTaskPanel'), o=document.getElementById('ownTaskPanel');
   if(a)a.style.display=own?'none':'block'; if(o)o.style.display=own?'block':'none';
 }));
})();

// v15 site-entry announcement: show newest announcement on entry/login
(function(){
 function latest(){
   const arr=JSON.parse(localStorage.getItem('smarteshV14Announcements')||'[]');
   return arr[0] || null;
 }
 function showEntryAnnouncement(){
   const d=latest(), modal=document.getElementById('siteEntryAnnouncement');
   if(!modal||!d)return;
   document.getElementById('entryAnnTitle').textContent=d.title;
   document.getElementById('entryAnnBody').textContent=d.body;
   modal.classList.add('open'); modal.setAttribute('aria-hidden','false');
 }
 function close(){const m=document.getElementById('siteEntryAnnouncement'); if(m){m.classList.remove('open');m.setAttribute('aria-hidden','true');}}
 document.getElementById('closeEntryAnn')?.addEventListener('click',close);
 document.getElementById('entryAnnLater')?.addEventListener('click',close);
 document.querySelector('.entry-ann-backdrop')?.addEventListener('click',close);
 document.getElementById('entryAnnOpen')?.addEventListener('click',()=>{close(); if(typeof showView==='function')showView('notifications');});
 // Prototype: show once after each page load. Production: show unread/new announcements after login.
 setTimeout(showEntryAnnouncement,450);
})();

// ---- v16 complete flow ----
(function(){
  document.querySelectorAll('[data-view]').forEach(el=>{
    if(el.dataset.v16bound) return;
    el.dataset.v16bound='1';
    el.addEventListener('click',()=>{
      if(typeof showView==='function') showView(el.dataset.view);
    });
  });

  const input=document.getElementById('v16RecipientInput');
  document.getElementById('v16AddRecipient')?.addEventListener('click',()=>{
    const value=input?.value?.trim();
    if(!value) return;
    const wrap=document.getElementById('v16RecipientChips');
    const chip=document.createElement('span');
    chip.textContent=value+' ×';
    chip.addEventListener('click',()=>chip.remove());
    wrap?.appendChild(chip);
    input.value='';
  });
  document.querySelectorAll('#v16RecipientChips span').forEach(x=>x.addEventListener('click',()=>x.remove()));

  // Make visible "Сурагчдад өгөх" buttons demonstrate the complete flow.
  document.querySelectorAll('#teacherAssignments .primary-btn').forEach(btn=>{
    if(btn.textContent.includes('Сурагчдад өгөх') || btn.textContent.includes('Хадгалаад сурагчдад өгөх')){
      btn.addEventListener('click',()=>{
        const recipients=[...document.querySelectorAll('#v16RecipientChips span')].map(x=>x.textContent.replace(' ×',''));
        const item={title:'Teacher Assignment',recipients,assignedAt:new Date().toISOString(),status:'assigned'};
        const arr=JSON.parse(localStorage.getItem('smarteshV16Assignments')||'[]');
        arr.unshift(item); localStorage.setItem('smarteshV16Assignments',JSON.stringify(arr));
        const history=document.getElementById('v16AssignedHistory');
        if(history) history.insertAdjacentHTML('afterbegin',
          `<div class="v16-row"><div><b>${item.title}</b><small>${recipients.length||1} student(s) • just now</small></div><span class="status-ok">Assigned</span></div>`);
        alert('✅ Даалгавар сурагчийн My Assignments хэсэгт очлоо.');
      });
    }
  });
})();

// v17 paper batch scan demo
(function(){
 const f=document.getElementById('v17BatchFiles'), status=document.getElementById('v17UploadStatus');
 f?.addEventListener('change',()=>{ if(status)status.textContent=`${f.files.length} sheet сонгосон`; });
 document.getElementById('v17AnalyzeBtn')?.addEventListener('click',()=>{
   const box=document.getElementById('v17Analysis');
   if(box){box.scrollIntoView({behavior:'smooth',block:'start'});}
 });
 document.getElementById('v17CreatePractice')?.addEventListener('click',()=>{
   if(typeof showView==='function') showView('teacherAssignments');
   setTimeout(()=>alert('✨ Weak topics: Reading inference, Conditionals, Prepositions дээр тулгуурласан practice бэлтгэх хэсэг рүү шилжлээ.'),150);
 });
})();

// v18 feedback actions
(function(){
 document.querySelectorAll('.v18-practice').forEach(btn=>btn.addEventListener('click',()=>{
   localStorage.setItem('smarteshV18PracticeTopic',btn.dataset.topic||'Weak topic');
   if(typeof showView==='function') showView('practiceHub');
 }));
 document.getElementById('v18StartPlan')?.addEventListener('click',()=>{
   localStorage.setItem('smarteshV18PracticeTopic','Smart Practice Plan');
   if(typeof showView==='function') showView('practiceHub');
 });
})();

// v19 teacher results actions
(function(){
 document.querySelectorAll('.v19-student').forEach(btn=>btn.addEventListener('click',()=>{
   const name=btn.dataset.name||'Student';
   const n=document.getElementById('v19StudentName'); if(n)n.textContent=name;
   document.getElementById('v19StudentDetail')?.scrollIntoView({behavior:'smooth',block:'center'});
 }));
 document.querySelectorAll('.v19-target').forEach(btn=>btn.addEventListener('click',()=>{
   localStorage.setItem('smarteshV19TeacherTarget',btn.dataset.topic||'Weak topics');
   if(typeof showView==='function') showView('teacherAssignments');
   setTimeout(()=>alert('✨ Сонгосон weak topic дээр targeted practice бэлтгэх хэсэг нээгдлээ.'),120);
 }));
 document.getElementById('v19AssignAll')?.addEventListener('click',()=>{
   localStorage.setItem('smarteshV19TeacherTarget','Reading inference, Conditionals, Prepositions');
   if(typeof showView==='function') showView('teacherAssignments');
 });
})();

// v20 connected demo using localStorage
(function(){
 const BANK='smarteshV20QuestionBank', ASSIGN='smarteshV20Assignments', RESULTS='smarteshV20Results';
 const $=id=>document.getElementById(id);
 function get(k){try{return JSON.parse(localStorage.getItem(k)||'[]')}catch(e){return[]}}
 function refreshBank(){
   const b=get(BANK), s=$('v20BankStatus'); if(s)s.textContent=`Question Bank: ${b.length} шинэ асуулт`;
   if(b.length){
     const q=b[b.length-1], box=$('v20TeacherBank');
     if(box) box.innerHTML=`<span class="skill-tag">${q.category}</span><h4>${q.topic} practice</h4><p>${q.question}</p>`;
   }
 }
 $('v20SaveQuestion')?.addEventListener('click',()=>{
   const q={id:Date.now(),category:$('v20Category').value,topic:$('v20Topic').value,question:$('v20Question').value,
    options:{A:$('v20A').value,B:$('v20B').value,C:$('v20C').value,D:$('v20D').value},correct:$('v20Correct').value};
   const b=get(BANK);b.push(q);localStorage.setItem(BANK,JSON.stringify(b));refreshBank();
 });
 $('v20Assign')?.addEventListener('click',()=>{
   let b=get(BANK);
   if(!b.length){$('v20SaveQuestion')?.click();b=get(BANK)}
   const a={id:Date.now(),question:b[b.length-1],recipient:$('v20Recipient').value,deadline:$('v20Deadline').value,status:'assigned'};
   const arr=get(ASSIGN);arr.push(a);localStorage.setItem(ASSIGN,JSON.stringify(arr));
   $('v20AssignStatus').textContent=`✓ ${a.recipient} сурагчид assignment өглөө.`;
   renderStudent(a);
 });
 function renderStudent(a){
   if(!a)return;
   $('v20StudentEmpty').hidden=true;$('v20StudentTest').hidden=false;
   const q=a.question;$('v20StudentTag').textContent=q.category;$('v20StudentTopic').textContent=q.topic;$('v20StudentQuestion').textContent=q.question;
   $('v20Choices').innerHTML=Object.entries(q.options).map(([k,v])=>`<label class="demo-choice"><input type="radio" name="v20answer" value="${k}"><b>${k}</b><span>${v}</span></label>`).join('');
 }
 $('v20Submit')?.addEventListener('click',()=>{
   const a=get(ASSIGN).slice(-1)[0]; if(!a)return;
   const selected=document.querySelector('input[name="v20answer"]:checked'); if(!selected){alert('Хариултаа сонгоно уу.');return}
   const ok=selected.value===a.question.correct, score=ok?100:0;
   const r={assignmentId:a.id,student:a.recipient,score,topic:a.question.topic,selected:selected.value,correct:a.question.correct,date:new Date().toISOString()};
   const rs=get(RESULTS);rs.push(r);localStorage.setItem(RESULTS,JSON.stringify(rs));
   $('v20Result').hidden=false;$('v20Score').textContent=score+'%';$('v20CorrectCount').textContent=ok?'1/1':'0/1';
   $('v20Weak').textContent=ok?'—':a.question.topic;$('v20Status').textContent=ok?'Passed':'Practice';
   $('v20FeedbackText').innerHTML=ok?`✓ Зөв хариуллаа. <b>${a.question.topic}</b> сэдэв дээр сайн байна.`:
     `Таны хариу <b>${selected.value}</b>, зөв хариу <b>${a.question.correct}</b>. <b>${a.question.topic}</b> сэдвийг Mistake Notebook-д нэмлээ.`;
   $('v20TeacherScore').textContent=score+'%';$('v20TeacherTopic').textContent=a.question.topic;
   $('v20Result').scrollIntoView({behavior:'smooth'});
 });
 refreshBank();
 const latest=get(ASSIGN).slice(-1)[0]; if(latest)renderStudent(latest);
})();

// v21 account + annual access demo
(function(){
 const KEY='smarteshV21Subscription'; let selected=null; const $=id=>document.getElementById(id);
 const fmt=d=>d?new Date(d).toLocaleDateString('mn-MN'):'—';
 function render(){
   let s; try{s=JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){}
   if(!s)return;
   const days=Math.max(0,Math.ceil((new Date(s.end)-new Date())/86400000));
   $('v21AccessStatus').textContent=days>0?'Идэвхтэй':'Дууссан';
   $('v21Expiry').textContent=fmt(s.end); $('v21Days').textContent=days+' хоног';
   $('v21RoleBadge').textContent=s.role==='teacher'?'Teacher':'Student';
   $('v21AdminRole').textContent=s.role; $('v21AdminPrice').textContent=Number(s.price).toLocaleString()+'₮';
   $('v21AdminStart').textContent=fmt(s.start); $('v21AdminEnd').textContent=fmt(s.end);
 }
 document.querySelectorAll('.v21-buy-legacy-disabled').forEach(b=>b.addEventListener('click',()=>{
   selected={role:b.dataset.role,price:Number(b.dataset.price)};
   $('v21PaymentEmpty').hidden=true;$('v21Checkout').hidden=false;
   $('v21CheckoutPlan').textContent=(selected.role==='teacher'?'Teacher':'Student')+' — '+selected.price.toLocaleString()+'₮ / 1 жил';
   $('v21Checkout').scrollIntoView({behavior:'smooth',block:'center'});
 }));
 $('v21ConfirmPayment')?.addEventListener('click',()=>{
   if(!selected)return;
   const start=new Date(), end=new Date(start);end.setDate(end.getDate()+365);
   localStorage.setItem(KEY,JSON.stringify({...selected,start:start.toISOString(),end:end.toISOString(),status:'paid-demo'}));
   render(); alert('Demo: Төлбөр баталгаажлаа. 365 хоногийн эрх идэвхжлээ.');
 });
 $('v21Extend')?.addEventListener('click',()=>{
   let s;try{s=JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){}
   if(!s)return alert('Эхлээд demo эрх идэвхжүүлнэ үү.');
   let end=new Date(s.end); if(end<new Date())end=new Date();end.setDate(end.getDate()+365);s.end=end.toISOString();
   localStorage.setItem(KEY,JSON.stringify(s));render();
 });
 render();
})();

// v23 global interaction safety
document.addEventListener('click', function(e){
  const target = e.target.closest('[data-view]');
  if(!target) return;
  e.preventDefault();
  const viewId = target.dataset.view;
  if(viewId && typeof showView === 'function'){
    showView(viewId);
  }
});

// Prevent silent/dead clicks for prototype-only controls.
document.addEventListener('click', function(e){
  const btn = e.target.closest('button, a');
  if(!btn || btn.dataset.view || btn.id || btn.dataset.go) return;
  const txt = (btn.textContent || '').trim();
  if(!txt) return;
  // Only notify for controls inside the three role dashboards.
  if(btn.closest('#student, #teacher, #admin')){
    e.preventDefault();
    const n = document.getElementById('v23Toast') || (() => {
      const d=document.createElement('div');
      d.id='v23Toast'; d.className='v23-toast';
      document.body.appendChild(d); return d;
    })();
    n.textContent='Энэ үйлдэл дараагийн production холболтод орно.';
    n.classList.add('show');
    clearTimeout(window.__v23ToastTimer);
    window.__v23ToastTimer=setTimeout(()=>n.classList.remove('show'),1800);
  }
});

// v24 final: Teacher PDF preview button
document.getElementById('teacherPdfPreviewBtn')?.addEventListener('click',()=>{
  const file=document.getElementById('teacherPdfInput')?.files?.[0];
  const status=document.getElementById('teacherOwnStatus');
  if(!file){ if(status) status.textContent='PDF/Image файлаа эхлээд сонгоно уу.'; return; }
  if(status) status.textContent=`✓ ${file.name} сонгогдлоо. Prototype preview бэлэн.`;
});

// v24 final: explicit placeholder feedback only when an element is intentionally tagged.
document.addEventListener('click',function(e){
  const el=e.target.closest('[data-prototype-only]');
  if(!el)return;
  e.preventDefault();
  let n=document.getElementById('v24Toast');
  if(!n){n=document.createElement('div');n.id='v24Toast';n.className='v23-toast';document.body.appendChild(n);}
  n.textContent=el.dataset.prototypeOnly||'Энэ үйлдэл production backend-тэй холбогдоно.';
  n.classList.add('show');clearTimeout(window.__v24ToastTimer);window.__v24ToastTimer=setTimeout(()=>n.classList.remove('show'),1800);
});

// v26 full-screen exam behavior
(function(){
  function activeRunner(){
    return document.querySelector('#eeshRunner.view.active, #examRunner.view.active');
  }
  function syncFullscreenLabels(){
    const isNative=!!document.fullscreenElement;
    document.querySelectorAll('.runnerFullscreenBtn').forEach(b=>{
      b.textContent=isNative?'⛶ Full screen-ээс гарах':'⛶ Бүтэн дэлгэц';
    });
  }
  document.addEventListener('click', async function(e){
    const btn=e.target.closest('.runnerFullscreenBtn');
    if(!btn)return;
    e.preventDefault();
    try{
      if(document.fullscreenElement){
        await document.exitFullscreen();
      }else{
        const runner=activeRunner();
        if(runner && runner.requestFullscreen) await runner.requestFullscreen();
      }
    }catch(err){}
    syncFullscreenLabels();
  });
  document.addEventListener('fullscreenchange',syncFullscreenLabels);

  // Keep the page itself in distraction-free full viewport whenever a runner is open.
  const oldShow=window.showView || (typeof showView==='function'?showView:null);
  if(oldShow){
    window.showView=function(id){
      oldShow(id);
      document.body.classList.toggle('exam-running', id==='examRunner' || id==='eeshRunner');
      if(id!=='examRunner' && id!=='eeshRunner' && document.fullscreenElement){
        document.exitFullscreen().catch(()=>{});
      }
    };
  }
  // delegated handler compatibility: class state also follows active runner
  document.addEventListener('click',function(){
    setTimeout(()=>{
      document.body.classList.toggle('exam-running',!!activeRunner());
    },0);
  });
})();

// v27 — every active task uses full viewport
(function(){
  function isTaskRunning(){
    const practice=document.getElementById('practice');
    const exam=document.getElementById('examRunner');
    const prev=document.getElementById('previousExamRunner2024');
    return !!(
      (practice && practice.classList.contains('active')) ||
      (exam && !exam.classList.contains('hidden')) ||
      (prev && !prev.classList.contains('hidden'))
    );
  }

  function syncTaskState(){
    document.body.classList.toggle('task-running', isTaskRunning());
  }

  document.addEventListener('click', function(e){
    const exit=e.target.closest('[data-task-exit]');
    if(exit){
      e.preventDefault();
      const exam=document.getElementById('examRunner');
      const prev=document.getElementById('previousExamRunner2024');
      if(exam) exam.classList.add('hidden');
      if(prev) prev.classList.add('hidden');

      const target=exit.dataset.taskExit;
      if(typeof showView==='function' && target) showView(target);

      if(document.fullscreenElement && document.exitFullscreen){
        document.exitFullscreen().catch(()=>{});
      }
      setTimeout(syncTaskState,0);
      return;
    }
    setTimeout(syncTaskState,0);
  });

  // Watch runner hidden-state changes so fullscreen layout is always applied immediately.
  ['examRunner','previousExamRunner2024'].forEach(id=>{
    const el=document.getElementById(id);
    if(!el)return;
    new MutationObserver(syncTaskState).observe(el,{attributes:true,attributeFilter:['class']});
  });

  // Practice becomes full viewport as soon as it is opened.
  const practice=document.getElementById('practice');
  if(practice){
    new MutationObserver(syncTaskState).observe(practice,{attributes:true,attributeFilter:['class']});
  }

  syncTaskState();
})();

// v28 — improved active-task UX: autosave, flagging, question navigation, exit confirmation
(function(){
  const $ = id => document.getElementById(id);

  /* ---------- Practice improvements ---------- */
  function syncPracticeUX(){
    const bar=$('practiceProgressBar');
    if(bar && typeof pIndex!=='undefined' && typeof practice!=='undefined'){
      bar.style.width=((pIndex+1)/practice.length*100)+'%';
    }
    const prev=$('prevPractice');
    if(prev) prev.disabled=(typeof pIndex==='undefined'||pIndex===0);
  }
  const oldRenderPractice = (typeof renderPractice==='function') ? renderPractice : null;
  if(oldRenderPractice){
    renderPractice = function(){
      oldRenderPractice();
      syncPracticeUX();
      try{localStorage.setItem('smarteshPracticeIndex',String(pIndex));}catch(e){}
    };
    $('prevPractice')?.addEventListener('click',()=>{
      if(pIndex>0){pIndex--;renderPractice();}
    });
    syncPracticeUX();
  }

  /* ---------- Mock exam: answer persistence + previous + nav + flags ---------- */
  if(typeof exam!=='undefined' && $('examRunner')){
    let mockAnswers = Array(exam.length).fill(null);
    let mockFlags = new Set();
    try{
      const saved=JSON.parse(localStorage.getItem('smarteshMockAnswers')||'null');
      if(Array.isArray(saved) && saved.length===exam.length) mockAnswers=saved;
      const flags=JSON.parse(localStorage.getItem('smarteshMockFlags')||'[]');
      if(Array.isArray(flags)) mockFlags=new Set(flags);
    }catch(e){}

    const persistMock=()=>{
      localStorage.setItem('smarteshMockAnswers',JSON.stringify(mockAnswers));
      localStorage.setItem('smarteshMockFlags',JSON.stringify([...mockFlags]));
    };

    function renderMockNav(){
      const nav=$('examQuestionNav'); if(!nav)return;
      nav.innerHTML=exam.map((_,i)=>`<button class="qdot ${i===eIndex?'current':''} ${mockAnswers[i]!=null?'answered':''} ${mockFlags.has(i)?'flagged':''}" data-mock-q="${i}" aria-label="Question ${i+1}">${i+1}</button>`).join('');
      nav.querySelectorAll('[data-mock-q]').forEach(b=>b.onclick=()=>{
        saveCurrentMockChoice();
        eIndex=Number(b.dataset.mockQ); renderExam();
      });
      const count=$('examAnsweredCount');
      if(count) count.textContent=`${mockAnswers.filter(v=>v!=null).length} / ${exam.length} answered`;
    }

    function saveCurrentMockChoice(){
      const wrap=$('examAnswers'); if(!wrap)return;
      const selected=wrap.dataset.selected;
      if(selected!=='') mockAnswers[eIndex]=Number(selected);
      persistMock();
    }

    renderExam = function(){
      const item=exam[eIndex];
      $('examQuestionTitle').textContent=`Question ${eIndex+1} of ${exam.length}`;
      $('examQuestion').textContent=item.q;
      const wrap=$('examAnswers'); wrap.innerHTML='';
      item.answers.forEach((a,i)=>{
        const b=document.createElement('button');
        b.className='answer-btn';
        b.textContent=`${String.fromCharCode(65+i)}. ${a}`;
        if(mockAnswers[eIndex]===i){b.classList.add('selected');b.style.outline='2px solid #f39b58';}
        b.onclick=()=>{
          [...wrap.children].forEach(x=>{x.classList.remove('selected');x.style.outline='none';});
          b.classList.add('selected');b.style.outline='2px solid #f39b58';
          wrap.dataset.selected=i;
          mockAnswers[eIndex]=i;persistMock();renderMockNav();
        };
        wrap.appendChild(b);
      });
      wrap.dataset.selected=mockAnswers[eIndex]==null?'':String(mockAnswers[eIndex]);
      $('prevExam') && ($('prevExam').disabled=eIndex===0);
      if($('nextExam')) $('nextExam').textContent=eIndex===exam.length-1?'Review / Finish':'Next →';
      if($('flagExamQuestion')) $('flagExamQuestion').textContent=mockFlags.has(eIndex)?'⚑ Flagged':'⚑ Flag';
      renderMockNav();
    };

    const start=$('startExamBtn');
    if(start){
      start.onclick=()=>{
        const resume=mockAnswers.some(v=>v!=null);
        if(!resume || confirm('Өмнөх mock-ийн хадгалсан хариултыг үргэлжлүүлэх үү?\nOK = үргэлжлүүлэх, Cancel = шинээр эхлэх')===false){
          mockAnswers=Array(exam.length).fill(null);mockFlags.clear();persistMock();
        }
        $('examRunner').classList.remove('hidden');
        $('examResult').classList.add('hidden');
        eIndex=0;score=0;topicScores={};remaining=300;
        clearInterval(timerId);updateTimer();timerId=setInterval(updateTimer,1000);
        renderExam();
      };
    }

    $('prevExam')?.addEventListener('click',()=>{
      saveCurrentMockChoice();
      if(eIndex>0){eIndex--;renderExam();}
    });

    $('flagExamQuestion')?.addEventListener('click',()=>{
      if(mockFlags.has(eIndex))mockFlags.delete(eIndex);else mockFlags.add(eIndex);
      persistMock();renderExam();
    });

    $('nextExam').onclick=()=>{
      saveCurrentMockChoice();
      if(eIndex<exam.length-1){eIndex++;renderExam();return;}
      const unanswered=mockAnswers.filter(v=>v==null).length;
      const msg=unanswered?`${unanswered} асуулт хариулаагүй байна. Дуусгах уу?`:'Бүх асуултад хариулсан байна. Шалгалтаа дуусгах уу?';
      if(confirm(msg)) finishExam();
    };

    $('submitExamEarly')?.addEventListener('click',()=>{
      saveCurrentMockChoice();
      const unanswered=mockAnswers.filter(v=>v==null).length;
      if(confirm(`Шалгалтыг одоо дуусгах уу? ${unanswered} асуулт хариулаагүй.`)) finishExam();
    });

    finishExam = function(){
      clearInterval(timerId);
      saveCurrentMockChoice();
      score=0;topicScores={};
      exam.forEach((item,i)=>{
        topicScores[item.topic]=topicScores[item.topic]||{right:0,total:0};
        topicScores[item.topic].total++;
        if(mockAnswers[i]===item.correct){score++;topicScores[item.topic].right++;}
      });
      $('examRunner').classList.add('hidden');
      const pct=Math.round(score/exam.length*100);
      const lines=Object.entries(topicScores).map(([k,v])=>`<div class="metric"><span>${k}</span><b>${Math.round(v.right/v.total*100)}%</b></div><div class="bar"><i style="width:${Math.round(v.right/v.total*100)}%"></i></div>`).join('');
      const weak=Object.entries(topicScores).sort((a,b)=>(a[1].right/a[1].total)-(b[1].right/b[1].total))[0]?.[0]||'Grammar';
      const unanswered=mockAnswers.filter(v=>v==null).length;
      const result=$('examResult');
      result.innerHTML=`<span class="eyebrow">RESULT</span><h2>${pct}% — ${score}/${exam.length}</h2><p>${unanswered?`${unanswered} unanswered • `:''}Your result has been analysed by topic.</p>${lines}<div class="feedback"><b>Recommended next:</b> Review ${weak} practice before your next mock exam.</div><button class="primary-btn" data-view="practiceHub">Weak topic practice хийх</button>`;
      result.classList.remove('hidden');
      localStorage.removeItem('smarteshMockAnswers');localStorage.removeItem('smarteshMockFlags');
      mockAnswers=Array(exam.length).fill(null);mockFlags.clear();
      document.body.classList.remove('task-running');
      result.scrollIntoView({behavior:'smooth'});
    };

    // Timer warning during last minute.
    const timerObserver=new MutationObserver(()=>{
      if(remaining<=60 && remaining>=0) $('timer')?.classList.add('timer-warning');
      else $('timer')?.classList.remove('timer-warning');
    });
    if($('timer'))timerObserver.observe($('timer'),{childList:true,characterData:true,subtree:true});
  }

  /* ---------- Previous-year exam: flag + finish summary ---------- */
  if($('previousExamRunner2024')){
    let prevFlags=new Set();
    try{
      const x=JSON.parse(localStorage.getItem('smartesh2024AFlags')||'[]');
      if(Array.isArray(x))prevFlags=new Set(x.map(Number));
    }catch(e){}
    const savePrevFlags=()=>localStorage.setItem('smartesh2024AFlags',JSON.stringify([...prevFlags]));

    const oldRenderNav=(typeof render2024QuestionNav==='function')?render2024QuestionNav:null;
    if(oldRenderNav){
      render2024QuestionNav=function(){
        oldRenderNav();
        document.querySelectorAll('#previousExamQuestionNav2024 .qnum').forEach(b=>{
          const n=Number(b.textContent.trim());
          if(prevFlags.has(n))b.classList.add('flagged');
        });
      };
    }
    const oldRenderQ=(typeof render2024Question==='function')?render2024Question:null;
    if(oldRenderQ){
      render2024Question=function(){
        oldRenderQ();
        const item=previousExamSet[previousExamIndex];
        if($('previousExamFlag') && item) $('previousExamFlag').textContent=prevFlags.has(item.n)?'⚑ Flagged':'⚑ Flag question';
      };
    }

    $('previousExamFlag')?.addEventListener('click',()=>{
      const item=previousExamSet[previousExamIndex]; if(!item)return;
      if(prevFlags.has(item.n))prevFlags.delete(item.n);else prevFlags.add(item.n);
      savePrevFlags();render2024Question();
    });

    $('previousExamFinish')?.addEventListener('click',()=>{
      const answered=previousExamSet.filter(q=>previousExamAnswers[q.n]!=null).length;
      const unanswered=previousExamSet.length-answered;
      const flagged=previousExamSet.filter(q=>prevFlags.has(q.n)).length;
      if(confirm(`Дуусгах уу?\nAnswered: ${answered}\nUnanswered: ${unanswered}\nFlagged: ${flagged}`)){
        save2024Answers();
        const n=$('previousExamRunnerNotice');
        if(n)n.innerHTML=`✅ ${answered}/${previousExamSet.length} хариулт хадгалагдлаа. ${flagged} асуулт flagged. Official answer key байхгүй тул оноо бодоогүй.`;
      }
    });
  }

  /* ---------- Confirm before exiting an active task ---------- */
  document.addEventListener('click',function(e){
    const exit=e.target.closest('[data-task-exit]');
    if(!exit)return;
    const runner=exit.closest('#examRunner,#previousExamRunner2024,#practice');
    if(!runner)return;
    const ok=confirm('Ажиллаж буй даалгавраас гарах уу? Хадгалагдсан хариулт тань үлдэнэ.');
    if(!ok){
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  }, true);

  /* ---------- Keyboard shortcuts ---------- */
  document.addEventListener('keydown',function(e){
    if(e.ctrlKey||e.metaKey||e.altKey)return;
    const activeExam=$('examRunner') && !$('examRunner').classList.contains('hidden');
    const activePrev=$('previousExamRunner2024') && !$('previousExamRunner2024').classList.contains('hidden');
    if(activeExam){
      if(/^[1-4]$/.test(e.key)){
        $('examAnswers')?.children[Number(e.key)-1]?.click(); e.preventDefault();
      }else if(e.key==='ArrowLeft'){$('prevExam')?.click();e.preventDefault();}
      else if(e.key==='ArrowRight'){$('nextExam')?.click();e.preventDefault();}
      else if(e.key.toLowerCase()==='f'){$('flagExamQuestion')?.click();e.preventDefault();}
    }else if(activePrev){
      if(/^[1-5]$/.test(e.key)){
        $('previousExamAnswers2024')?.children[Number(e.key)-1]?.click(); e.preventDefault();
      }else if(e.key==='ArrowLeft'){$('previousExamPrev')?.click();e.preventDefault();}
      else if(e.key==='ArrowRight'){$('previousExamNext')?.click();e.preventDefault();}
      else if(e.key.toLowerCase()==='f'){$('previousExamFlag')?.click();e.preventDefault();}
    }
  });
})();

// v29 — show multi-year controls for Mixed/Custom
(function(){
  const mode=document.getElementById('runMode');
  function syncYearModeV29(){
    if(!mode)return;
    const multi=mode.value==='Mixed'||mode.value==='Custom';
    document.getElementById('mixedYearsWrap')?.classList.toggle('hidden',!multi);
    document.getElementById('singleYearWrap')?.classList.toggle('hidden',multi);
  }
  mode?.addEventListener('change',syncYearModeV29);
  syncYearModeV29();
})();

// v29 — real mixed-year assignment + student full-screen runner
(function(){
  const ASSIGN_KEY='smarteshMixedAssignmentsV29';
  const ANSWER_KEY='smarteshMixedAnswersV29';
  const FLAG_KEY='smarteshMixedFlagsV29';
  const $=id=>document.getElementById(id);
  const load=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d))}catch(e){return d}};
  const save=(k,v)=>localStorage.setItem(k,JSON.stringify(v));

  const assignBtn=$('assignTeacherSet');
  if(assignBtn){
    assignBtn.onclick=()=>{
      if(!window.currentTeacherSet && typeof currentTeacherSet==='undefined'){
        alert('Эхлээд тест үүсгэнэ үү.'); return;
      }
      const set=(typeof currentTeacherSet!=='undefined'?currentTeacherSet:window.currentTeacherSet)||[];
      if(!set.length){alert('Эхлээд Generate дарж асуултуудаа үүсгэнэ үү.');return;}
      const assignment={
        id:Date.now(),
        title:$('mixedAssignmentTitleV29')?.value.trim()||'Олон оны холимог ЭЕШ тест',
        recipient:$('mixedRecipientV29')?.value.trim()||'STUDENT',
        deadline:$('mixedDeadlineV29')?.value||'',
        minutes:Number($('examMinutes')?.value||30),
        questions:set.map(q=>({...q})),
        createdAt:new Date().toISOString(),
        status:'assigned'
      };
      const list=load(ASSIGN_KEY,[]);
      list.push(assignment);save(ASSIGN_KEY,list);
      alert(`✓ ${assignment.recipient} сурагчид ${assignment.questions.length} асуулттай холимог тест өглөө.`);
      renderStudentMixedCardV29();
    };
  }

  function latestMixedV29(){
    const list=load(ASSIGN_KEY,[]);
    return list.length?list[list.length-1]:null;
  }

  window.renderStudentMixedCardV29=function(){
    const a=latestMixedV29(), card=$('mixedAssignmentCardV29');
    if(!card)return;
    if(!a){card.classList.add('hidden');return;}
    card.classList.remove('hidden');
    $('mixedStudentTitleV29').textContent=a.title;
    const years=[...new Set(a.questions.map(q=>q.year).filter(Boolean))];
    $('mixedStudentMetaV29').textContent=`${a.questions.length} Q • ${years.join(', ')}`;
    $('mixedStudentDescV29').textContent=`${a.recipient} • ${a.minutes} min${a.deadline?' • Deadline '+a.deadline:''}`;
  };

  let assignment=null,index=0,answers=[],flags=new Set();

  function persistRunV29(){
    if(!assignment)return;
    save(ANSWER_KEY,{assignmentId:assignment.id,answers});
    save(FLAG_KEY,{assignmentId:assignment.id,flags:[...flags]});
  }

  function renderMixedV29(){
    if(!assignment)return;
    const q=assignment.questions[index];
    $('mixedRunnerTitleV29').textContent=assignment.title;
    $('mixedQuestionMetaV29').textContent=`Question ${index+1} of ${assignment.questions.length}`;
    $('mixedSourceV29').textContent=`${q.year||''}${q.year?' • ':''}${q.skill||'Mixed'}`;
    $('mixedQuestionV29').textContent=q.q;
    $('mixedProgressBarV29').style.width=`${((index+1)/assignment.questions.length)*100}%`;
    $('mixedAnsweredV29').textContent=`${answers.filter(v=>v!==null&&v!==undefined).length} / ${assignment.questions.length} answered`;
    $('mixedOptionsV29').innerHTML=q.answers.map((a,i)=>`<button class="mixed-option-v29 ${answers[index]===i?'selected':''}" data-mi="${i}"><b>${String.fromCharCode(65+i)}.</b> ${a}</button>`).join('');
    $('mixedOptionsV29').querySelectorAll('[data-mi]').forEach(b=>b.onclick=()=>{
      answers[index]=Number(b.dataset.mi);persistRunV29();renderMixedV29();
    });
    $('mixedPrevV29').disabled=index===0;
    $('mixedNextV29').textContent=index===assignment.questions.length-1?'Review':'Next →';
    $('mixedFlagV29').textContent=flags.has(index)?'⚑ Flagged':'⚑ Flag';

    $('mixedQNavV29').innerHTML=assignment.questions.map((_,i)=>`<button class="qdot ${i===index?'current':''} ${answers[i]!=null?'answered':''} ${flags.has(i)?'flagged':''}" data-mq="${i}">${i+1}</button>`).join('');
    $('mixedQNavV29').querySelectorAll('[data-mq]').forEach(b=>b.onclick=()=>{index=Number(b.dataset.mq);renderMixedV29();});
  }

  $('startMixedAssignmentV29')?.addEventListener('click',()=>{
    assignment=latestMixedV29();if(!assignment)return;
    const saved=load(ANSWER_KEY,null);
    answers=(saved&&saved.assignmentId===assignment.id&&Array.isArray(saved.answers))?saved.answers:Array(assignment.questions.length).fill(null);
    while(answers.length<assignment.questions.length)answers.push(null);
    const fs=load(FLAG_KEY,null);
    flags=new Set(fs&&fs.assignmentId===assignment.id&&Array.isArray(fs.flags)?fs.flags:[]);
    index=0;
    if(typeof showView==='function')showView('mixedRunnerV29');
    document.body.classList.add('task-running');
    renderMixedV29();
  });

  $('mixedPrevV29')?.addEventListener('click',()=>{if(index>0){index--;renderMixedV29();}});
  $('mixedNextV29')?.addEventListener('click',()=>{if(index<assignment.questions.length-1){index++;renderMixedV29();}});
  $('mixedFlagV29')?.addEventListener('click',()=>{if(flags.has(index))flags.delete(index);else flags.add(index);persistRunV29();renderMixedV29();});

  $('exitMixedRunnerV29')?.addEventListener('click',()=>{
    if(!confirm('Даалгавраас гарах уу? Хариултууд хадгалагдана.'))return;
    persistRunV29();document.body.classList.remove('task-running');
    if(typeof showView==='function')showView('assignmentsPlus');
  });

  $('mixedSubmitV29')?.addEventListener('click',()=>{
    if(!assignment)return;
    const unanswered=answers.filter(v=>v==null).length;
    if(!confirm(`${unanswered} асуулт хариулаагүй байна. Тестээ дуусгах уу?`))return;
    let score=0;
    assignment.questions.forEach((q,i)=>{if(answers[i]===q.correct)score++;});
    const pct=Math.round(score/assignment.questions.length*100);
    const result={
      assignmentId:assignment.id,recipient:assignment.recipient,score,pct,
      answered:assignment.questions.length-unanswered,total:assignment.questions.length,
      submittedAt:new Date().toISOString()
    };
    const rs=load('smarteshMixedResultsV29',[]);rs.push(result);save('smarteshMixedResultsV29',rs);
    alert(`Дууслаа. Оноо: ${score}/${assignment.questions.length} (${pct}%)`);
    document.body.classList.remove('task-running');
    if(typeof showView==='function')showView('feedbackV18');
  });

  renderStudentMixedCardV29();
})();

// v30 — 2006–2026 archive behavior
(function(){
  const status=document.getElementById('eeshArchiveStatusV30');
  document.querySelectorAll('[data-archive-year]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const year=btn.dataset.archiveYear;
      if(year==='2024'){
        if(status) status.innerHTML='✅ <b>2024 A</b> импортлогдсон. Доорх 2024 A тестийг шууд ажиллуулж болно.';
        document.querySelector('[data-year="2024"]')?.scrollIntoView({behavior:'smooth',block:'center'});
      }else{
        if(status) status.innerHTML=`📥 <b>${year}</b> оны slot бэлэн. Албан ёсны PDF + answer key-г Admin → Өмнөх оны тест импорт хэсгээр оруулмагц энд ажиллана.`;
      }
    });
  });
})();

// v30 — Teacher manual assignment: Next Question now works
(function(){
  const KEY='smarteshTeacherManualDraftV30';
  const TASKS='smarteshTeacherTasksV30';
  const ASSIGN='smarteshAssignmentsV30';
  const $=id=>document.getElementById(id);
  const load=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d))}catch(e){return d}};
  const save=(k,v)=>localStorage.setItem(k,JSON.stringify(v));

  let draft=load(KEY,[]);

  function current(){
    return {
      id:Date.now(),
      question:$('teacherOwnQuestion')?.value.trim()||'',
      options:{
        A:$('teacherOptA')?.value.trim()||'',
        B:$('teacherOptB')?.value.trim()||'',
        C:$('teacherOptC')?.value.trim()||'',
        D:$('teacherOptD')?.value.trim()||''
      },
      correct:$('teacherCorrectAnswer')?.value||'A',
      source:'Teacher manual'
    };
  }

  function valid(q){
    if(!q.question){alert('Асуултаа оруулна уу.');return false;}
    const missing=Object.entries(q.options).filter(([,v])=>!v).map(([k])=>k);
    if(missing.length){alert(`Сонголт ${missing.join(', ')}-г бөглөнө үү.`);return false;}
    return true;
  }

  function clearForm(){
    if($('teacherOwnQuestion')) $('teacherOwnQuestion').value='';
    ['teacherOptA','teacherOptB','teacherOptC','teacherOptD'].forEach(id=>{if($(id))$(id).value='';});
    if($('teacherCorrectAnswer')) $('teacherCorrectAnswer').value='A';
    $('teacherOwnQuestion')?.focus();
  }

  function render(){
    const list=$('teacherDraftListV30'), count=$('teacherDraftCountV30');
    if(count) count.textContent=`${draft.length} асуулт`;
    if(!list)return;
    if(!draft.length){list.innerHTML='<small>Одоогоор асуулт нэмээгүй.</small>';return;}
    list.innerHTML=draft.map((q,i)=>`
      <div class="teacher-draft-item-v30">
        <b>${i+1}</b>
        <span>${q.question}</span>
        <button data-delete-teacher-q="${i}" title="Устгах">×</button>
      </div>`).join('');
    list.querySelectorAll('[data-delete-teacher-q]').forEach(b=>b.onclick=()=>{
      draft.splice(Number(b.dataset.deleteTeacherQ),1);save(KEY,draft);render();
    });
  }

  function addCurrent({clear=true}={}){
    const q=current();
    if(!valid(q))return false;
    draft.push(q);save(KEY,draft);render();
    const status=$('teacherOwnStatus');
    if(status) status.textContent=`✓ Асуулт ${draft.length} нэмэгдлээ. Дараагийн асуултаа оруулна уу.`;
    if(clear)clearForm();
    return true;
  }

  $('teacherAddNextQuestion')?.addEventListener('click',e=>{
    e.preventDefault();
    addCurrent();
  });

  $('teacherManualPreviewBtnV30')?.addEventListener('click',()=>{
    const q=current();
    const all=[...draft];
    if(q.question && Object.values(q.options).some(Boolean)){
      if(valid(q)) all.push(q); else return;
    }
    if(!all.length){alert('Эхлээд дор хаяж нэг асуулт оруулна уу.');return;}
    const box=$('teacherManualPreviewV30');
    box.classList.remove('hidden');
    box.innerHTML=`<div class="panel-head"><h3>Preview • ${all.length} асуулт</h3><span class="pill">Student view</span></div>`+
      all.map((x,i)=>`<div class="teacher-preview-q-v30"><b>${i+1}. ${x.question}</b><small>A. ${x.options.A} • B. ${x.options.B} • C. ${x.options.C} • D. ${x.options.D} • Correct: ${x.correct}</small></div>`).join('');
    box.scrollIntoView({behavior:'smooth',block:'center'});
  });

  $('teacherManualAssignBtnV30')?.addEventListener('click',()=>{
    const q=current();
    if(q.question || Object.values(q.options).some(Boolean)){
      if(!addCurrent({clear:true}))return;
    }
    if(!draft.length){alert('Эхлээд асуултуудаа оруулна уу.');return;}

    const task={
      id:Date.now(),
      title:`Teacher manual task • ${draft.length} questions`,
      questions:draft.map(x=>({...x})),
      createdAt:new Date().toISOString(),
      status:'assigned'
    };
    const tasks=load(TASKS,[]);tasks.unshift(task);save(TASKS,tasks);
    const assignments=load(ASSIGN,[]);assignments.unshift(task);save(ASSIGN,assignments);

    const history=$('v16AssignedHistory');
    if(history) history.insertAdjacentHTML('afterbegin',
      `<div class="v16-row"><div><b>${task.title}</b><small>${task.questions.length} questions • just now</small></div><span class="status-ok">Assigned</span></div>`);

    draft=[];save(KEY,draft);render();
    const status=$('teacherOwnStatus');
    if(status) status.innerHTML=`✅ <b>${task.questions.length} асуулттай</b> даалгавар хадгалагдаж, сурагчдад өгөх сан руу орлоо.`;
    alert(`✅ ${task.questions.length} асуулттай даалгавар амжилттай хадгалагдлаа.`);
  });

  render();
})();

// v31 — Topic filter UX + metadata-ready selection
(function(){
  const skill=document.getElementById('bankSkill');
  const checks=[...document.querySelectorAll('.topicCheckV31')];
  const summary=document.getElementById('selectedTopicsV31');

  function syncTopicGroupsV31(){
    const val=skill?.value||'Mixed skills';
    document.querySelectorAll('[data-skill-group]').forEach(g=>{
      const show=val==='Mixed skills'||g.dataset.skillGroup===val;
      g.classList.toggle('dimmed',!show);
      if(!show) g.querySelectorAll('.topicCheckV31').forEach(c=>c.checked=false);
    });
    syncSummaryV31();
  }
  function syncSummaryV31(){
    const selected=checks.filter(c=>c.checked).map(c=>c.value);
    if(summary) summary.textContent=selected.length
      ? `Сонгосон сэдэв (${selected.length}): ${selected.join(' • ')}`
      : 'Сэдэв сонгоогүй — бүх сэдвээс авна.';
  }
  skill?.addEventListener('change',syncTopicGroupsV31);
  checks.forEach(c=>c.addEventListener('change',syncSummaryV31));
  document.getElementById('clearTopicsV31')?.addEventListener('click',()=>{
    checks.forEach(c=>c.checked=false);syncSummaryV31();
  });
  syncTopicGroupsV31();
})();

// v31 — enrich demo bank with topic metadata where inferable, so filter behavior can be tested.
// Production imports should store explicit skill/topic/subtopic metadata per approved question.
(function(){
  if(typeof bankQuestions==='undefined' || !Array.isArray(bankQuestions)) return;
  bankQuestions.forEach(q=>{
    if(q.topic) return;
    const text=(q.q||'').toLowerCase();
    if(q.skill==='Grammar'){
      if(/if |would|unless/.test(text)) q.topic='Conditionals';
      else if(/tag|isn't|aren't|don't|doesn't|didn't/.test(text)) q.topic='Question tags';
      else q.topic='Tenses';
    } else if(q.skill==='Vocabulary'){
      if(/health|doctor|hospital|ill|medicine/.test(text)) q.topic='Health';
      else if(/earthquake|flood|storm|disaster|nature/.test(text)) q.topic='Nature & disasters';
      else if(/phrasal|look after|give up|turn on|take off/.test(text)) q.topic='Phrasal verbs';
      else q.topic='Vocabulary';
    } else if(q.skill==='Reading') q.topic='Detail';
    else if(q.skill==='Communication') q.topic='Everyday situations';
  });
})();

// v32 — Admin-editable settings + AI classification demo
(function(){
  const KEY='smarteshAdminSettingsV32';
  const ids=[
    'settingSiteNameV32','settingTaglineV32','settingSupportV32','settingMaintenanceV32','settingHeroV32','settingAccentV32',
    'settingStudentPriceV32','settingTeacherPriceV32','settingAccessDaysV32','settingPaymentTermsV32','settingQPayV32','settingFreeTrialV32','settingTrialDaysV32',
    'settingExpiryReminderV32','settingReminderDaysV32','settingAnnouncementV32','settingShowAnnouncementV32','settingCtaV32',
    'settingShowPreviousV32','settingShowMockV32','settingShowPracticeV32','settingShowFeedbackV32','settingScannerV32','settingAiClassifyV32',
    'settingNotificationsV32','settingTeacherManualV32','settingAudienceV32','settingPopupV32','settingExamMinutesV32','settingShuffleQV32',
    'settingShuffleAV32','settingInstantFeedbackV32','settingAutoTagV32','settingConfidenceV32'
  ];
  const load=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return {}}};
  const val=id=>{
    const e=document.getElementById(id);if(!e)return null;
    return e.type==='checkbox'?e.checked:e.value;
  };
  const apply=(id,v)=>{
    const e=document.getElementById(id);if(!e||v===undefined)return;
    if(e.type==='checkbox')e.checked=!!v;else e.value=v;
  };
  const saved=load();ids.forEach(id=>apply(id,saved[id]));

  document.querySelectorAll('[data-admin-tab-v32]').forEach(b=>b.addEventListener('click',()=>{
    document.querySelectorAll('[data-admin-tab-v32]').forEach(x=>x.classList.remove('active'));
    document.querySelectorAll('[data-admin-pane-v32]').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    document.querySelector(`[data-admin-pane-v32="${b.dataset.adminTabV32}"]`)?.classList.add('active');
  }));

  document.getElementById('saveAdminSettingsV32')?.addEventListener('click',()=>{
    const data={};ids.forEach(id=>data[id]=val(id));localStorage.setItem(KEY,JSON.stringify(data));
    const s=document.getElementById('adminSaveStatusV32');
    if(s)s.textContent='✓ Өөрчлөлт хадгалагдлаа. Production хувилбарт эдгээр тохиргоо backend-ээс бүх хэрэглэгчид үйлчилнэ.';
    // Sync visible annual prices in prototype where matching text exists.
    document.querySelectorAll('[data-admin-student-price]').forEach(e=>e.textContent=Number(data.settingStudentPriceV32||10000).toLocaleString()+'₮');
    document.querySelectorAll('[data-admin-teacher-price]').forEach(e=>e.textContent=Number(data.settingTeacherPriceV32||20000).toLocaleString()+'₮');
  });

  document.getElementById('simulateAnalyzeV32')?.addEventListener('click',()=>{
    const box=document.getElementById('aiAnalyzeResultV32');if(!box)return;
    box.innerHTML='<b>Auto Analyze result:</b> 47 асуулт салгав • 44 high-confidence • 3 review шаардлагатай<br>Grammar → Tenses / Conditionals / Passive • Vocabulary → Phrasal verbs / Health / Environment • Reading → Detail / Inference';
  });
})();

// v32 — exam submit review helper: warn with answered/unanswered/flagged counts before final submit.
// Existing runners retain their current submit flows; this helper supplies a consistent review summary for future production wiring.
window.smarteshReviewSummaryV32=function(total,answers,flags){
  const answered=(answers||[]).filter(x=>x!==null&&x!==undefined).length;
  const flagged=(flags instanceof Set?flags.size:(flags||[]).length);
  return {answered,unanswered:Math.max(0,total-answered),flagged,total};
};

// v33 FINAL — Admin Site Settings
(function(){
  const KEY='smarteshAdminSettingsV33';
  const DEFAULTS={
    settingStudentPriceV33:'10000',settingTeacherPriceV33:'20000',settingAccessDaysV33:'365',settingPriceVisibleV33:true,
    settingPaymentTermsV33:'Нэг удаагийн төлбөрөөр 365 хоногийн Premium эрх нээгдэнэ.',settingQPayV33:true,settingFreeTrialV33:false,settingTrialDaysV33:'3',
    settingExpiryReminderV33:true,settingReminderDaysV33:'7',settingManualGrantV33:true,settingManualExtendV33:true,
    settingPaymentSuccessV33:'Таны Premium эрх амжилттай идэвхжлээ.',settingExpiredTextV33:'Таны Premium эрх дууссан байна. Эрхээ сунгана уу.',
    settingSiteNameV33:'SmartESH',settingTaglineV33:'Smart English Exam Preparation',settingHeroV33:'ЭЕШ-д ухаалгаар бэлд. Ахиц бүрээ хар.',
    settingCtaV33:'Бэлтгэлээ эхлүүлэх',settingSupportV33:'support@smartesh.mn',settingAnnouncementV33:'2026 ЭЕШ бэлтгэл — шинэ mock test нэмэгдлээ',
    settingShowAnnouncementV33:true,settingShowPreviousV33:true,settingShowMockV33:true,settingShowPracticeV33:true,settingShowFeedbackV33:true,
    settingScannerV33:true,settingNotificationsV33:true,settingTeacherManualV33:true,settingMixedYearV33:true,settingStudentFeedbackV33:true,settingMistakeNotebookV33:true,
    settingAudienceV33:'Бүгд',settingPopupV33:true,settingPinnedAllowedV33:true,settingExamMinutesV33:'40',settingAttemptsV33:'1',
    settingShuffleQV33:true,settingShuffleAV33:false,settingInstantFeedbackV33:false,settingFullscreenV33:true,settingAutosaveV33:true,settingFlaggingV33:true,
    settingReviewBeforeSubmitV33:true,settingAiClassifyV33:true,settingAutoTagV33:true,settingConfidenceV33:'80',settingMultiTagV33:true,
    settingReviewLowConfidenceV33:true,settingNeverAutoPublishV33:true,settingMaintenanceV33:false,
    settingMaintenanceTextV33:'SmartESH дээр түр шинэчлэлт хийж байна.',settingAuditV33:true
  };
  const $=id=>document.getElementById(id), ids=Object.keys(DEFAULTS);
  const money=v=>Number(v||0).toLocaleString()+'₮';
  const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return {}}};
  const set=(id,v)=>{const e=$(id);if(!e)return;if(e.type==='checkbox')e.checked=!!v;else e.value=v};
  const get=id=>{const e=$(id);if(!e)return DEFAULTS[id];return e.type==='checkbox'?e.checked:e.value};

  function updateSummary(s){
    if($('summaryStudentPriceV33'))$('summaryStudentPriceV33').textContent=money(s.settingStudentPriceV33);
    if($('summaryTeacherPriceV33'))$('summaryTeacherPriceV33').textContent=money(s.settingTeacherPriceV33);
    if($('summaryAIStatusV33'))$('summaryAIStatusV33').textContent=s.settingAiClassifyV33?'ON':'OFF';
    if($('summaryScannerStatusV33'))$('summaryScannerStatusV33').textContent=s.settingScannerV33?'ON':'OFF';
  }
  function apply(s){
    localStorage.setItem('smarteshPricingConfig',JSON.stringify({
      studentPrice:Number(s.settingStudentPriceV33),
      teacherPrice:Number(s.settingTeacherPriceV33),
      accessDays:Number(s.settingAccessDaysV33),
      terms:s.settingPaymentTermsV33,
      qpay:!!s.settingQPayV33
    }));
    localStorage.setItem('smarteshFeatureFlagsV33',JSON.stringify(s));
    document.querySelectorAll('[data-view="adminSiteSettingsV33"]').forEach(e=>e.style.display='');
  }

  const state={...DEFAULTS,...read()};
  ids.forEach(id=>set(id,state[id]));
  updateSummary(state);apply(state);

  document.querySelectorAll('[data-admin-tab-v33]').forEach(btn=>btn.addEventListener('click',()=>{
    document.querySelectorAll('[data-admin-tab-v33]').forEach(x=>x.classList.remove('active'));
    document.querySelectorAll('[data-admin-pane-v33]').forEach(x=>x.classList.remove('active'));
    btn.classList.add('active');
    document.querySelector(`[data-admin-pane-v33="${btn.dataset.adminTabV33}"]`)?.classList.add('active');
  }));

  $('saveAdminSettingsV33')?.addEventListener('click',()=>{
    const s={};ids.forEach(id=>s[id]=get(id));
    localStorage.setItem(KEY,JSON.stringify(s));
    if(s.settingAuditV33){
      let a=[];try{a=JSON.parse(localStorage.getItem('smarteshAdminAuditV33')||'[]')}catch(e){}
      a.unshift({at:new Date().toISOString(),studentPrice:s.settingStudentPriceV33,teacherPrice:s.settingTeacherPriceV33,days:s.settingAccessDaysV33});
      localStorage.setItem('smarteshAdminAuditV33',JSON.stringify(a.slice(0,50)));
    }
    updateSummary(s);apply(s);
    if($('adminSaveStatusV33'))$('adminSaveStatusV33').textContent='✓ Өөрчлөлт хадгалагдаж prototype дээр шууд үйлчиллээ.';
  });

  $('resetAdminSettingsV33')?.addEventListener('click',()=>{
    if(!confirm('Бүх сайтын тохиргоог default утгад буцаах уу?'))return;
    localStorage.removeItem(KEY);ids.forEach(id=>set(id,DEFAULTS[id]));updateSummary(DEFAULTS);apply(DEFAULTS);
    if($('adminSaveStatusV33'))$('adminSaveStatusV33').textContent='✓ Default тохиргоо сэргээгдлээ.';
  });

  ids.forEach(id=>$(id)?.addEventListener('input',()=>{
    if($('adminSaveStatusV33'))$('adminSaveStatusV33').textContent='Хадгалаагүй өөрчлөлт байна.';
  }));
})();

// Hard fallback for the new settings view.
(function(){
  document.querySelectorAll('[data-view="adminSiteSettingsV33"]').forEach(el=>{
    el.addEventListener('click',e=>{
      e.preventDefault();
      if(typeof showView==='function'){showView('adminSiteSettingsV33');return;}
      document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
      document.getElementById('adminSiteSettingsV33')?.classList.add('active');
      window.scrollTo({top:0,behavior:'smooth'});
    });
  });
})();

// v34 — Smart student overview
(function(){
  const $=id=>document.getElementById(id);
  const load=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d))}catch(e){return d}};
  const rs=load('smarteshMixedResultsV29',[]);
  if(rs.length){
    const latest=rs[rs.length-1];
    if($('smartLatestScoreV34')) $('smartLatestScoreV34').textContent=(latest.pct||0)+'%';
    if(rs.length>1){
      const first=Number(rs[Math.max(0,rs.length-5)].pct||0), last=Number(latest.pct||0), diff=last-first;
      if($('smartTrendV34')) $('smartTrendV34').textContent=(diff>=0?'+':'')+diff+'%';
    }
  }
})();

// v34 — autosave stamp + review before submit for mixed-year test
(function(){
  const $=id=>document.getElementById(id);
  const load=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d))}catch(e){return d}};
  const stamp=()=>{if($('mixedSavedAtV34'))$('mixedSavedAtV34').textContent='Saved '+new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});};
  document.addEventListener('click',e=>{
    if(e.target.closest('.mixed-option-v29')||e.target.closest('[data-mq]')||e.target.id==='mixedFlagV29') setTimeout(stamp,0);
  });

  const submit=$('mixedSubmitV29');
  function openReview(){
    const a=load('smarteshMixedAssignmentsV29',[]);
    const assignment=a.length?a[a.length-1]:null;
    const ans=load('smarteshMixedAnswersV29',null);
    const fs=load('smarteshMixedFlagsV29',null);
    const total=assignment?.questions?.length||ans?.answers?.length||0;
    const answers=ans?.answers||[];
    const flags=new Set(fs?.flags||[]);
    const answered=answers.filter(v=>v!==null&&v!==undefined).length;
    $('mixedReviewAnsweredV34').textContent=answered;
    $('mixedReviewUnansweredV34').textContent=Math.max(0,total-answered);
    $('mixedReviewFlaggedV34').textContent=flags.size;
    $('mixedReviewQListV34').innerHTML=Array.from({length:total},(_,i)=>{
      const state=answers[i]===null||answers[i]===undefined?'unanswered':'answered';
      return `<button class="review-q-v34 ${state} ${flags.has(i)?'flagged':''}" data-review-jump="${i}">${i+1}</button>`;
    }).join('');
    $('mixedReviewQListV34').querySelectorAll('[data-review-jump]').forEach(b=>b.onclick=()=>{
      $('mixedReviewModalV34').classList.add('hidden');
      document.querySelector(`[data-mq="${b.dataset.reviewJump}"]`)?.click();
    });
    $('mixedReviewModalV34').classList.remove('hidden');
  }
  if(submit){
    submit.addEventListener('click',e=>{
      if(submit.dataset.v34confirmed==='1'){submit.dataset.v34confirmed='0';return;}
      e.preventDefault();e.stopImmediatePropagation();openReview();
    },true);
  }
  $('closeMixedReviewV34')?.addEventListener('click',()=>$('mixedReviewModalV34').classList.add('hidden'));
  $('backToMixedTestV34')?.addEventListener('click',()=>$('mixedReviewModalV34').classList.add('hidden'));
  $('confirmMixedSubmitV34')?.addEventListener('click',()=>{
    $('mixedReviewModalV34').classList.add('hidden');
    if(submit){submit.dataset.v34confirmed='1';submit.click();}
  });
})();

// v34 — Teacher mixed-test analytics
(function(){
  const $=id=>document.getElementById(id);
  const load=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d))}catch(e){return d}};
  function render(){
    const rs=load('smarteshMixedResultsV29',[]);
    if($('teacherTotalAttemptsV34'))$('teacherTotalAttemptsV34').textContent=rs.length;
    if(!rs.length)return;
    const pcts=rs.map(r=>Number(r.pct||0)),avg=Math.round(pcts.reduce((a,b)=>a+b,0)/pcts.length),high=Math.max(...pcts);
    $('teacherAverageV34').textContent=avg+'%';$('teacherHighestV34').textContent=high+'%';
    const priority=avg<70?'Conditionals':'Reading inference';$('teacherWeakestV34').textContent=priority;
    $('teacherRecentResultsV34').innerHTML=rs.slice(-8).reverse().map(r=>`<div class="teacher-result-row-v34"><span><b>${r.recipient||'Student'}</b><small>${r.answered||0}/${r.total||0} answered</small></span><strong>${r.pct||0}%</strong></div>`).join('');
    $('teacherWeakTopicsV34').innerHTML=`<div class="teacher-weak-row-v34"><span><b>${priority}</b><small>Targeted practice recommended</small></span><strong>Priority</strong></div>`;
  }
  $('refreshTeacherResultsV34')?.addEventListener('click',render);
  // v47: createWeakPracticeV34 is handled by the unified weak-practice modal controller.
  render();
})();

// v35 — Topic filter UX
(function(){
  const skill=document.getElementById('skillType');
  const summary=document.getElementById('selectedFilterSummaryV35');
  const checks=[...document.querySelectorAll('.topicCheckV31')];

  function sync(){
    const value=skill?.value||'Mixed skills';
    document.querySelectorAll('[data-topic-skill]').forEach(group=>{
      const show=value==='Mixed skills'||group.dataset.topicSkill===value;
      group.classList.toggle('hidden-by-skill',!show);
      if(!show) group.querySelectorAll('.topicCheckV31').forEach(c=>c.checked=false);
    });
    const selected=checks.filter(c=>c.checked).map(c=>c.value);
    if(summary){
      const extra=[];
      const kw=document.getElementById('bankKeywordV35')?.value.trim();
      const qt=document.getElementById('bankQuestionTypeV35')?.value;
      const df=document.getElementById('bankDifficultyV35')?.value;
      if(kw)extra.push('keyword: '+kw);
      if(qt)extra.push(qt);
      if(df)extra.push(df);
      summary.textContent=(selected.length?`Сэдэв: ${selected.join(' • ')}`:'Сэдэв сонгоогүй')+(extra.length?' • '+extra.join(' • '):'');
    }
  }
  skill?.addEventListener('change',sync);
  checks.forEach(c=>c.addEventListener('change',sync));
  ['bankKeywordV35','bankQuestionTypeV35','bankDifficultyV35'].forEach(id=>document.getElementById(id)?.addEventListener('input',sync));
  document.getElementById('clearSmartFiltersV35')?.addEventListener('click',()=>{
    checks.forEach(c=>c.checked=false);
    const kw=document.getElementById('bankKeywordV35');if(kw)kw.value='';
    const qt=document.getElementById('bankQuestionTypeV35');if(qt)qt.value='';
    const df=document.getElementById('bankDifficultyV35');if(df)df.value='';
    sync();
  });
  sync();
})();

// v35 — Enrich EESH demo question metadata for filter testing.
(function(){
  if(typeof questionBankV3==='undefined'||!Array.isArray(questionBankV3))return;
  questionBankV3.forEach((q,i)=>{
    if(q.source!=='EESH')return;
    const t=(q.q||'').toLowerCase();
    if(!q.topic){
      if(q.skill==='Grammar'){
        if(/\bif\b|unless|would/.test(t))q.topic='Conditionals';
        else if(/isn't|aren't|don't|doesn't|didn't|tag/.test(t))q.topic='Question tags';
        else q.topic='Tenses';
      }else if(q.skill==='Vocabulary'){
        if(/health|doctor|hospital|medicine|ill/.test(t))q.topic='Health';
        else if(/earthquake|flood|storm|disaster|environment|nature/.test(t))q.topic='Nature & disasters';
        else if(/take off|give up|look after|turn on/.test(t))q.topic='Phrasal verbs';
        else q.topic='Vocabulary';
      }else if(q.skill==='Reading')q.topic='Detail';
      else if(q.skill==='Dialogue')q.topic='Everyday situations';
    }
    if(!q.questionType){
      q.questionType=q.skill==='Reading'?'Reading comprehension':q.skill==='Dialogue'?'Dialogue completion':'Multiple choice';
    }
    if(!q.difficulty)q.difficulty=['Easy','Medium','Hard'][i%3];
  });
})();

// v35 — Teacher manual draft manager: Edit / Duplicate / Move / Delete
(function(){
  const KEY='smarteshTeacherManualDraftV30';
  const list=document.getElementById('teacherDraftListV30');
  if(!list)return;
  const load=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch(e){return []}};
  const save=v=>{localStorage.setItem(KEY,JSON.stringify(v));const s=document.getElementById('teacherDraftSaveStateV35');if(s)s.textContent='Saved '+new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});};

  function escV35(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function renderManager(){
    const draft=load();
    if(!draft.length)return; // original renderer handles empty state
    list.innerHTML=draft.map((q,i)=>`
      <div class="teacher-draft-item-v30">
        <b>${i+1}</b>
        <span><strong>${escV35(q.question)}</strong><small>Correct: ${q.correct||'A'}</small></span>
        <div class="teacher-draft-actions-v35">
          <button data-v35-edit="${i}">Засах</button>
          <button data-v35-copy="${i}">Хуулах</button>
          <button data-v35-up="${i}" ${i===0?'disabled':''}>↑</button>
          <button data-v35-down="${i}" ${i===draft.length-1?'disabled':''}>↓</button>
          <button class="danger" data-v35-delete="${i}">×</button>
        </div>
      </div>`).join('');

    list.querySelectorAll('[data-v35-edit]').forEach(b=>b.onclick=()=>{
      const arr=load(),i=Number(b.dataset.v35Edit),q=arr[i];if(!q)return;
      document.getElementById('teacherOwnQuestion').value=q.question||'';
      document.getElementById('teacherOptA').value=q.options?.A||'';
      document.getElementById('teacherOptB').value=q.options?.B||'';
      document.getElementById('teacherOptC').value=q.options?.C||'';
      document.getElementById('teacherOptD').value=q.options?.D||'';
      document.getElementById('teacherCorrectAnswer').value=q.correct||'A';
      arr.splice(i,1);save(arr);renderManager();
      document.getElementById('teacherOwnQuestion').focus();
    });
    list.querySelectorAll('[data-v35-copy]').forEach(b=>b.onclick=()=>{
      const arr=load(),i=Number(b.dataset.v35Copy);if(!arr[i])return;
      arr.splice(i+1,0,{...arr[i],id:Date.now()});save(arr);renderManager();
    });
    list.querySelectorAll('[data-v35-up]').forEach(b=>b.onclick=()=>{
      const arr=load(),i=Number(b.dataset.v35Up);if(i<=0)return;
      [arr[i-1],arr[i]]=[arr[i],arr[i-1]];save(arr);renderManager();
    });
    list.querySelectorAll('[data-v35-down]').forEach(b=>b.onclick=()=>{
      const arr=load(),i=Number(b.dataset.v35Down);if(i>=arr.length-1)return;
      [arr[i+1],arr[i]]=[arr[i],arr[i+1]];save(arr);renderManager();
    });
    list.querySelectorAll('[data-v35-delete]').forEach(b=>b.onclick=()=>{
      const arr=load();arr.splice(Number(b.dataset.v35Delete),1);save(arr);renderManager();
    });
    const count=document.getElementById('teacherDraftCountV30');if(count)count.textContent=`${draft.length} асуулт`;
  }

  // After original "Next Question" saves, refresh richer manager.
  document.getElementById('teacherAddNextQuestion')?.addEventListener('click',()=>setTimeout(renderManager,10));
  // Refresh when teacher panel gets clicked/opened.
  document.addEventListener('click',e=>{
    if(e.target.closest('[data-view="teacherAssignments"]')||e.target.closest('#teacherQuestionManagerV35'))setTimeout(renderManager,20);
  });
  renderManager();
})();

// v35 — Admin AI Review Queue
(function(){
  const KEY='smarteshAIReviewQueueV35';
  const $=id=>document.getElementById(id);
  const defaults=[];
  const load=()=>{try{const v=JSON.parse(localStorage.getItem(KEY)||'null');return Array.isArray(v)?v:defaults}catch(e){return defaults}};
  const save=v=>localStorage.setItem(KEY,JSON.stringify(v));

  function options(arr,val){return arr.map(x=>`<option ${x===val?'selected':''}>${x}</option>`).join('')}
  function render(){
    const data=load(), list=$('aiReviewListV35');if(!list)return;
    const pending=data.filter(x=>x.status!=='approved').length, approved=data.filter(x=>x.status==='approved').length;
    if($('aiNeedsReviewV35'))$('aiNeedsReviewV35').textContent=pending;
    if($('aiApprovedV35'))$('aiApprovedV35').textContent=approved;
    list.innerHTML=data.map((x,i)=>`
      <div class="ai-review-card-v35 ${x.status==='approved'?'approved':''}" data-review-card="${i}">
        <div class="panel-head">
          <span class="pill">${x.year}</span>
          <span class="status-${x.status==='approved'?'ok':'warn'}">${x.status==='approved'?'Approved':'Needs review'}</span>
        </div>
        <div class="ai-review-question-v35">${x.question}</div>
        <div class="ai-confidence-v35"><b>Confidence ${x.confidence}%</b><meter min="0" max="100" value="${x.confidence}"></meter></div>
        <div class="ai-review-fields-v35">
          <label>Skill<select data-ai-field="skill" data-ai-index="${i}">${options(['Grammar','Vocabulary','Dialogue','Reading'],x.skill)}</select></label>
          <label>Topic<select data-ai-field="topic" data-ai-index="${i}">${options(['Tenses','Question tags','Conditionals','Phrasal verbs','Idioms','Health','Nature & disasters','Inference','Detail','Everyday situations'],x.topic)}</select></label>
          <label>Subtopic<input data-ai-field="subtopic" data-ai-index="${i}" value="${x.subtopic||''}"></label>
        </div>
        <div class="ai-review-actions-v35">
          <button class="secondary-btn" data-ai-save="${i}">Ангилал хадгалах</button>
          <button class="primary-btn" data-ai-approve="${i}" ${x.status==='approved'?'disabled':''}>✓ Approve</button>
        </div>
      </div>`).join('');

    list.querySelectorAll('[data-ai-save]').forEach(b=>b.onclick=()=>{
      const arr=load(),i=Number(b.dataset.aiSave);
      list.querySelectorAll(`[data-ai-index="${i}"]`).forEach(el=>arr[i][el.dataset.aiField]=el.value);
      save(arr);render();
    });
    list.querySelectorAll('[data-ai-approve]').forEach(b=>b.onclick=()=>{
      const arr=load(),i=Number(b.dataset.aiApprove);
      list.querySelectorAll(`[data-ai-index="${i}"]`).forEach(el=>arr[i][el.dataset.aiField]=el.value);
      arr[i].status='approved';save(arr);render();
    });
  }
  $('approveAllReviewedV35')?.addEventListener('click',()=>{
    const arr=load().map(x=>({...x,status:'approved'}));save(arr);render();
  });
  render();
})();

// v36 — Publish Center
(function(){
 const $=id=>document.getElementById(id);
 const checks=['pubClassifiedV36','pubReviewedV36','pubKeyV36','pubRightsV36'];
 function status(){
   if(!$('publishStatusV36'))return;
   const n=checks.filter(id=>$(id)?.checked).length;
   $('publishStatusV36').textContent=n===4?'✓ Publish хийхэд бэлэн.':`${n}/4 баталгаажсан — үлдсэн шалгалтыг дуусгана уу.`;
 }
 checks.forEach(id=>$(id)?.addEventListener('change',status));
 $('publishBatchV36')?.addEventListener('click',()=>{
   if(!checks.every(id=>$(id)?.checked)){alert('Publish хийхээс өмнө 4 баталгаажуулалтыг бүгдийг хийнэ үү.');return;}
   const stamp={at:new Date().toISOString(),count:47,status:'published'};
   localStorage.setItem('smarteshPublishedBatchV36',JSON.stringify(stamp));
   if($('pipePublishedV36'))$('pipePublishedV36').textContent='47';
   if($('publishStatusV36'))$('publishStatusV36').textContent='✓ 47 асуулт Question Bank-д нийтлэгдлээ.';
 });
 status();
})();

// v36 — Student Test History
(function(){
 const $=id=>document.getElementById(id);
 const load=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d))}catch(e){return d}};
 function render(){
   const mixed=load('smarteshMixedResultsV29',[]);
   const paper=load('smarteshPaperResultsV17',[]);
   const all=[...mixed,...paper].filter(Boolean);
   if($('historyCountV36'))$('historyCountV36').textContent=all.length;
   if(!all.length)return;
   const pct=x=>Number(x.pct??x.percentage??0);
   const vals=all.map(pct),latest=all[all.length-1];
   $('historyLatestV36').textContent=pct(latest)+'%';
   $('historyBestV36').textContent=Math.max(...vals)+'%';
   const weak=pct(latest)<70?'Conditionals':'Reading inference';
   $('historyWeakV36').textContent=weak;
   $('historyWeakPlanV36').textContent=`${weak} → 10 targeted questions`;
   $('studentHistoryListV36').innerHTML=all.slice(-10).reverse().map((r,i)=>`
    <div class="history-row-v36">
      <span><b>${r.title||r.assignmentTitle||'SmartESH Test'}</b><small>${r.answered||0}/${r.total||0} answered</small></span>
      <strong>${pct(r)}%</strong>
    </div>`).join('');
 }
 render();
})();

// v36 — Admin settings audit viewer
(function(){
 const $=id=>document.getElementById(id);
 function render(){
   if(!$('adminAuditListV36'))return;
   let a=[];try{a=JSON.parse(localStorage.getItem('smarteshAdminAuditV33')||'[]')}catch(e){}
   $('adminAuditListV36').innerHTML=a.length?a.slice(0,10).map(x=>`
    <div class="audit-row-v36">
      <span><b>Сайтын тохиргоо</b><small>${new Date(x.at).toLocaleString()}</small></span>
      <small>Student ${Number(x.studentPrice||0).toLocaleString()}₮ • Teacher ${Number(x.teacherPrice||0).toLocaleString()}₮ • ${x.days||365} хоног</small>
    </div>`).join(''):'<small>Өөрчлөлт хадгалахад энд харагдана.</small>';
 }
 $('refreshAuditV36')?.addEventListener('click',render);render();
})();

// v37 — canonical local prototype data layer
(function(){
  window.SmartESHDataV37 = {
    load(key, fallback=[]){ try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch(e){return fallback} },
    save(key, value){ localStorage.setItem(key,JSON.stringify(value)); },
    attempts(){
      const mixed=this.load('smarteshMixedResultsV29',[]).map(x=>({...x,channel:'Digital'}));
      const paper=this.load('smarteshPaperResultsV17',[]).map(x=>({...x,channel:'Paper'}));
      return [...mixed,...paper];
    },
    mistakes(){
      return this.load('smarteshMistakesV37',[]);
    },
    addMistakes(items){
      const old=this.mistakes(), seen=new Set(old.map(x=>x.id));
      items.forEach(x=>{if(!seen.has(x.id))old.push(x)});
      this.save('smarteshMistakesV37',old);
      return old;
    }
  };
})();

// v37 — create prototype mistake records from completed attempts when detailed per-question data is unavailable
(function(){
  const D=window.SmartESHDataV37;if(!D)return;
  const attempts=D.attempts();
  const generated=[];
  attempts.forEach((a,idx)=>{
    const pct=Number(a.pct??a.percentage??0);
    if(pct>=100)return;
    const weak=pct<70?'Conditionals':'Reading inference';
    generated.push({
      id:`attempt-${idx}-${weak}`,
      skill:weak==='Conditionals'?'Grammar':'Reading',
      topic:weak,
      source:a.title||a.assignmentTitle||`${a.channel} test`,
      question:weak==='Conditionals'?'Review the conditional form used in this test.':'Review the inference question from this test.',
      selected:'Needs review',
      correct:'See verified answer key',
      explanation:weak==='Conditionals'?'Check the if-clause tense and the result clause pattern.':'Use evidence from the text, not only an exact repeated sentence.',
      status:'new'
    });
  });
  D.addMistakes(generated);
})();

// v37 — Mistake Notebook UI
(function(){
  const $=id=>document.getElementById(id),D=window.SmartESHDataV37;
  function render(){
    if(!$('mistakeListV37')||!D)return;
    const filter=$('mistakeFilterV37')?.value||'all';
    const all=D.mistakes(), items=filter==='all'?all:all.filter(x=>x.skill===filter);
    $('mistakeTotalV37').textContent=all.length;
    const counts={};all.forEach(x=>counts[x.topic]=(counts[x.topic]||0)+1);
    const priority=Object.entries(counts).sort((a,b)=>b[1]-a[1])[0]?.[0]||'—';
    $('mistakePriorityV37').textContent=priority;
    $('mistakeReviewedV37').textContent=all.filter(x=>x.status==='reviewed').length;
    $('mistakeMasteredV37').textContent=all.filter(x=>x.status==='mastered').length;
    if(!items.length){$('mistakeListV37').innerHTML='<div class="empty-state-v37">Энэ ангилалд алдаа алга.</div>';return;}
    $('mistakeListV37').innerHTML=items.map((x,i)=>`
      <div class="mistake-card-v37">
        <div class="mistake-meta-v37"><span>${x.skill}</span><span>${x.topic}</span><span>${x.source}</span></div>
        <div class="mistake-question-v37">${x.question}</div>
        <div class="mistake-answer-grid-v37">
          <div><small>Таны хариулт</small><b>${x.selected}</b></div>
          <div><small>Зөв хариулт</small><b>${x.correct}</b></div>
        </div>
        <div class="mistake-explain-v37"><b>Why?</b> ${x.explanation}</div>
        <div class="mistake-actions-v37">
          <button data-m-review="${x.id}">✓ Давтсан</button>
          <button data-m-master="${x.id}">★ Mastered</button>
          <button data-m-similar="${x.topic}">Ижил 5 асуулт</button>
        </div>
      </div>`).join('');
    document.querySelectorAll('[data-m-review]').forEach(b=>b.onclick=()=>setStatus(b.dataset.mReview,'reviewed'));
    document.querySelectorAll('[data-m-master]').forEach(b=>b.onclick=()=>setStatus(b.dataset.mMaster,'mastered'));
    document.querySelectorAll('[data-m-similar]').forEach(b=>b.onclick=()=>alert(`✓ ${b.dataset.mSimilar} сэдвээр 5 асуултын Smart Practice draft бэлэн.`));
  }
  function setStatus(id,status){
    const a=D.mistakes();const x=a.find(v=>v.id===id);if(x)x.status=status;D.save('smarteshMistakesV37',a);render();
  }
  $('mistakeFilterV37')?.addEventListener('change',render);
  $('practiceMistakesV37')?.addEventListener('click',()=>alert('✓ Сүүлийн алдаануудаас 5 targeted question practice үүсгэлээ.'));
  render();
})();

// v37 — Unified Teacher Analytics
(function(){
  const $=id=>document.getElementById(id),D=window.SmartESHDataV37;
  function render(){
    if(!$('uAttemptsV37')||!D)return;
    const a=D.attempts(), digital=a.filter(x=>x.channel==='Digital'), paper=a.filter(x=>x.channel==='Paper');
    const vals=a.map(x=>Number(x.pct??x.percentage??0));
    $('uAttemptsV37').textContent=a.length;
    $('uDigitalV37').textContent=digital.length;
    $('uPaperV37').textContent=paper.length;
    $('uAverageV37').textContent=vals.length?Math.round(vals.reduce((s,v)=>s+v,0)/vals.length)+'%':'—';
    const ms=D.mistakes(), counts={};ms.forEach(x=>counts[x.topic]=(counts[x.topic]||0)+1);
    const topics=Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,5);
    $('uWeakTopicsV37').innerHTML=topics.length?topics.map(([t,n])=>{
      const pct=Math.min(100,n*25);
      return `<div class="weak-bar-v37"><b>${t}</b><div class="weak-track-v37"><i style="width:${pct}%"></i></div><span>${n}</span></div>`;
    }).join(''):'<small>Үр дүн орж ирэхэд автоматаар гарна.</small>';
    $('uMissedQuestionsV37').innerHTML=ms.length?ms.slice(0,5).map(x=>`<div class="missed-row-v37"><span>${x.topic}</span><b>${x.skill}</b></div>`).join(''):'<small>Одоогоор мэдээлэл алга.</small>';
  }
  $('refreshUnifiedV37')?.addEventListener('click',render);
  function openPractice(){
    const ms=D.mistakes(),counts={};ms.forEach(x=>counts[x.topic]=(counts[x.topic]||0)+1);
    const topic=Object.entries(counts).sort((a,b)=>b[1]-a[1])[0]?.[0]||'Conditionals';
    const sel=$('weakPracticeTopicV37');if(sel && [...sel.options].some(o=>o.value===topic))sel.value=topic;
    $('weakPracticeModalV37')?.classList.remove('hidden');
  }
  $('uCreatePracticeV37')?.addEventListener('click',openPractice);
  document.getElementById('createWeakPracticeV34')?.addEventListener('click',openPractice);
  render();
})();

// v37 — Weak-topic practice draft
(function(){
 const $=id=>document.getElementById(id);
 $('closeWeakPracticeV37')?.addEventListener('click',()=>$('weakPracticeModalV37')?.classList.add('hidden'));
 $('previewWeakPracticeV37')?.addEventListener('click',()=>{
   const t=$('weakPracticeTopicV37').value,n=$('weakPracticeCountV37').value;
   $('weakPracticeStatusV37').textContent=`Preview: ${t} • ${n} questions • ${$('weakPracticeRecipientV37').value}`;
 });
 $('saveWeakPracticeV37')?.addEventListener('click',()=>{
   const draft={id:Date.now(),title:`Smart Practice — ${$('weakPracticeTopicV37').value}`,topic:$('weakPracticeTopicV37').value,count:Number($('weakPracticeCountV37').value),recipient:$('weakPracticeRecipientV37').value,status:'draft',createdAt:new Date().toISOString()};
   let a=[];try{a=JSON.parse(localStorage.getItem('smarteshWeakPracticeDraftsV37')||'[]')}catch(e){}
   a.push(draft);localStorage.setItem('smarteshWeakPracticeDraftsV37',JSON.stringify(a));
   $('weakPracticeStatusV37').textContent='✓ Targeted practice draft хадгалагдлаа.';
 });
})();

// v38 — Immediate result controller
(function(){
 const $=id=>document.getElementById(id);
 function load(k,d){try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d))}catch(e){return d}}
 function showViewV38(id){
   document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
   $(id)?.classList.add('active');window.scrollTo(0,0);
 }
 window.renderInstantResultV38=function(result){
   if(!result)return;
   const pct=Number(result.pct??result.percentage??0),total=Number(result.total||0),answered=Number(result.answered||0);
   const correct=Number(result.correct??Math.round(total*pct/100)),wrong=Math.max(0,answered-correct),unanswered=Math.max(0,total-answered);
   const weak=result.weakTopic||(pct<70?'Conditionals':'Reading inference');
   $('instantScoreV38').textContent=pct+'%';$('instantCorrectV38').textContent=correct;$('instantWrongV38').textContent=wrong;$('instantUnansweredV38').textContent=unanswered;
   $('instantWeakV38').textContent=weak;$('instantPlanTopicV38').textContent=weak+' practice';
   $('instantResultTitleV38').textContent=pct>=80?'Сайн ажиллалаа!':pct>=60?'Ахиц байна — одоо сул сэдвээ давтъя.':'Сул сэдвээ эхлээд засъя.';
   $('instantResultMessageV38').textContent=`${result.title||'SmartESH Test'} • ${answered}/${total} answered`;
   const mistakes=load('smarteshMistakesV37',[]).filter(x=>x.topic===weak).slice(0,4);
   $('instantMistakesV38').innerHTML=mistakes.length?mistakes.map(x=>`<div class="instant-mistake-row-v38"><small>${x.skill} • ${x.topic}</small><div><b>${x.question}</b></div><small>${x.explanation}</small></div>`).join(''):`<div class="empty-state-v37">Verified per-question answer data орж ирэхэд дэлгэрэнгүй алдаа энд харагдана.</div>`;
   localStorage.setItem('smarteshLastResultV38',JSON.stringify({...result,weakTopic:weak}));
   showViewV38('instantResultV38');
 };
 // Open last result from existing result-producing events.
 document.addEventListener('click',e=>{
   if(e.target.id==='instantStartPracticeV38'){
     const r=load('smarteshLastResultV38',{});window.startSmartPracticeV38?.(r.weakTopic||'Conditionals');return;
   }
 });
})();

// v38 — Hook mixed test completion into immediate Smart Feedback.
// Uses MutationObserver/localStorage polling fallback so existing v29 submit logic remains intact.
(function(){
 let before=0;try{before=JSON.parse(localStorage.getItem('smarteshMixedResultsV29')||'[]').length}catch(e){}
 document.addEventListener('click',e=>{
   if(e.target.id!=='confirmMixedSubmitV34'&&e.target.id!=='mixedSubmitV29')return;
   setTimeout(()=>{
     let a=[];try{a=JSON.parse(localStorage.getItem('smarteshMixedResultsV29')||'[]')}catch(err){}
     if(a.length>before){before=a.length;window.renderInstantResultV38?.(a[a.length-1]);}
   },250);
 });
})();

// v38 — Targeted Smart Practice runner
(function(){
 const $=id=>document.getElementById(id);
 const bank={
  'Conditionals':[
   {q:'If I ___ more time, I would study English every day.',o:['have','had','will have','am having'],a:1,e:'Second conditional: If + past simple, would + base verb.'},
   {q:'If it rains tomorrow, we ___ at home.',o:['stay','stayed','will stay','would stay'],a:2,e:'First conditional: If + present simple, will + base verb.'},
   {q:'If she had studied harder, she ___ the test.',o:['passes','would pass','would have passed','will pass'],a:2,e:'Third conditional: If + past perfect, would have + past participle.'},
   {q:'Unless you ___ now, you will be late.',o:['leave','left','will leave','would leave'],a:0,e:'Unless = if not; use present simple for a real future condition.'},
   {q:'If I were you, I ___ the teacher.',o:['ask','will ask','would ask','asked'],a:2,e:'Advice with second conditional: If I were you, I would...'}
  ],
  'Reading inference':[
   {q:'A student closes the window and puts on a jacket. What can you infer?',o:['It is getting cold','It is lunchtime','The class ended','It is very hot'],a:0,e:'Inference uses clues: closing the window + jacket suggests cold.'},
   {q:'Mina checked the clock three times while waiting. What is most likely true?',o:['She is sleepy','She is worried about time','She lost the clock','She dislikes school'],a:1,e:'Repeatedly checking the clock suggests concern about time.'},
   {q:'The streets are wet, but the sky is clear now. What probably happened?',o:['It snowed all week','It rained earlier','There is a drought','It is midnight'],a:1,e:'Wet streets are evidence of recent rain.'},
   {q:'Tom whispered because the baby was sleeping. Why did he whisper?',o:['He was angry','He did not want to wake the baby','He lost his voice','He was outside'],a:1,e:'The reason is implied by the sleeping baby.'},
   {q:'The café chairs are on the tables and the lights are off. What can you infer?',o:['It is probably closed','It is very busy','Breakfast is ready','A party started'],a:0,e:'Chairs up and lights off are typical clues that a café is closed.'}
  ],
  'Phrasal verbs':[
   {q:'The plane will ___ at 8:30.',o:['take off','give up','look after','turn down'],a:0,e:'take off = leave the ground.'},
   {q:'Please ___ your little brother while I am away.',o:['take off','look after','give up','break down'],a:1,e:'look after = take care of.'},
   {q:'Do not ___ learning English.',o:['turn on','give up','take after','pick up'],a:1,e:'give up = stop trying.'},
   {q:'Can you ___ the music? It is too loud.',o:['turn down','look up','take off','bring up'],a:0,e:'turn down = reduce volume.'},
   {q:'I need to ___ this word in a dictionary.',o:['look up','give away','take off','put on'],a:0,e:'look up = search for information.'}
  ]
 };
 let state={topic:'Conditionals',i:0,answers:[]};
 function showView(id){document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));$(id)?.classList.add('active');window.scrollTo(0,0)}
 function qs(){return bank[state.topic]||bank['Conditionals']}
 function render(){
   const a=qs(),q=a[state.i];if(!q)return;
   $('smartPracticeTitleV38').textContent='Smart Practice — '+state.topic;$('smartPracticeTopicV38').textContent=state.topic;
   $('smartPracticeQuestionV38').textContent=q.q;$('smartPracticeMetaV38').textContent=`Question ${state.i+1} / ${a.length}`;
   $('smartPracticeAnsweredV38').textContent=`${state.answers.filter(x=>x!==undefined).length} answered`;
   $('smartPracticeProgressV38').style.width=((state.i+1)/a.length*100)+'%';
   $('smartPracticeOptionsV38').innerHTML=q.o.map((o,j)=>`<button class="mixed-option-v29 ${state.answers[state.i]===j?'selected':''}" data-sp-opt="${j}"><b>${String.fromCharCode(65+j)}</b> ${o}</button>`).join('');
   $('smartPracticeOptionsV38').querySelectorAll('[data-sp-opt]').forEach(b=>b.onclick=()=>{state.answers[state.i]=Number(b.dataset.spOpt);localStorage.setItem('smarteshSmartPracticeStateV38',JSON.stringify(state));render();});
   $('smartPracticeNavV38').innerHTML=a.map((_,j)=>`<button class="${j===state.i?'active':''}" data-sp-nav="${j}">${j+1}</button>`).join('');
   $('smartPracticeNavV38').querySelectorAll('[data-sp-nav]').forEach(b=>b.onclick=()=>{state.i=Number(b.dataset.spNav);render()});
   $('smartPracticePrevV38').disabled=state.i===0;$('smartPracticeNextV38').textContent=state.i===a.length-1?'Review':'Дараах →';
 }
 window.startSmartPracticeV38=function(topic){
   state={topic:bank[topic]?topic:'Conditionals',i:0,answers:[]};localStorage.setItem('smarteshSmartPracticeStateV38',JSON.stringify(state));showView('smartPracticeRunnerV38');render();
 };
 $('smartPracticePrevV38')?.addEventListener('click',()=>{if(state.i>0){state.i--;render()}});
 $('smartPracticeNextV38')?.addEventListener('click',()=>{if(state.i<qs().length-1){state.i++;render()}});
 $('exitSmartPracticeV38')?.addEventListener('click',()=>showView('instantResultV38'));
 $('smartPracticeSubmitV38')?.addEventListener('click',()=>{
   const a=qs();let c=0;a.forEach((q,i)=>{if(state.answers[i]===q.a)c++});
   const pct=Math.round(c/a.length*100);
   const result={title:`Smart Practice — ${state.topic}`,total:a.length,answered:state.answers.filter(x=>x!==undefined).length,correct:c,pct,weakTopic:state.topic};
   let rs=[];try{rs=JSON.parse(localStorage.getItem('smarteshSmartPracticeResultsV38')||'[]')}catch(e){}
   rs.push(result);localStorage.setItem('smarteshSmartPracticeResultsV38',JSON.stringify(rs));
   // Mark matching notebook items reviewed/mastered according to re-check result.
   let ms=[];try{ms=JSON.parse(localStorage.getItem('smarteshMistakesV37')||'[]')}catch(e){}
   ms.forEach(x=>{if(x.topic===state.topic)x.status=pct>=80?'mastered':'reviewed'});localStorage.setItem('smarteshMistakesV37',JSON.stringify(ms));
   window.renderInstantResultV38?.(result);
 });
})();

// v39 — end-to-end assignment lifecycle
(function(){
 const KEY='smarteshAssignmentsV39',$=id=>document.getElementById(id);
 const load=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch(e){return []}};
 const save=v=>localStorage.setItem(KEY,JSON.stringify(v));
 const label=s=>s==='draft'?'Draft':s==='assigned'?'Assigned':s==='submitted'?'Submitted':'Reviewed';

 function create(status){
   const arr=load();
   arr.push({id:Date.now(),title:$('assignTitleV39')?.value.trim()||'Smart Assignment',topic:$('assignTopicV39')?.value||'Conditionals',count:Number($('assignCountV39')?.value||10),deadline:$('assignDeadlineV39')?.value||'',audience:$('assignAudienceV39')?.value||'Бүх сурагч',status,shuffle:$('assignShuffleV39')?.checked!==false,feedback:$('assignFeedbackV39')?.checked!==false,progress:0,submitted:0,totalStudents:30,createdAt:new Date().toISOString()});
   save(arr);$('assignmentBuilderStatusV39').textContent=status==='draft'?'✓ Draft хадгалагдлаа.':'✓ Сурагчдад даалгавар өгөгдлөө.';renderTeacher();renderStudent();
 }
 function renderTeacher(){
   const host=$('assignmentListV39');if(!host)return;const all=load();
   $('assignDraftCountV39').textContent=all.filter(x=>x.status==='draft').length;
   $('assignActiveCountV39').textContent=all.filter(x=>x.status==='assigned').length;
   $('assignSubmittedCountV39').textContent=all.filter(x=>x.status==='submitted').length;
   $('assignReviewCountV39').textContent=all.filter(x=>x.status==='submitted').length;
   const f=$('assignmentStatusFilterV39')?.value||'all',q=($('assignmentSearchV39')?.value||'').toLowerCase();
   const items=all.filter(x=>(f==='all'||x.status===f)&&(!q||x.title.toLowerCase().includes(q)));
   host.innerHTML=items.length?items.slice().reverse().map(x=>`<div class="assignment-card-v39"><div class="assignment-card-top-v39"><div><h3>${x.title}</h3><div class="assignment-meta-v39"><span>${x.topic}</span><span>${x.count} questions</span><span>${x.audience}</span>${x.deadline?`<span>Due ${x.deadline}</span>`:''}</div></div><span class="assignment-status-v39 ${x.status}">${label(x.status)}</span></div><div class="student-progress-v39"><i style="width:${x.progress||0}%"></i></div><small>${x.submitted||0}/${x.totalStudents||30} submitted</small><div class="assignment-actions-v39">${x.status==='draft'?`<button data-send="${x.id}">Сурагчдад өгөх</button>`:''}${x.status==='submitted'?`<button data-review="${x.id}">Reviewed болгох</button>`:''}<button data-copy="${x.id}">Хуулах</button><button data-del="${x.id}">Устгах</button></div></div>`).join(''):'<div class="empty-state-v37">Энэ шүүлтүүрт даалгавар алга.</div>';
   host.querySelectorAll('[data-send]').forEach(b=>b.onclick=()=>update(+b.dataset.send,x=>x.status='assigned'));
   host.querySelectorAll('[data-review]').forEach(b=>b.onclick=()=>update(+b.dataset.review,x=>x.status='reviewed'));
   host.querySelectorAll('[data-copy]').forEach(b=>b.onclick=()=>{const a=load(),x=a.find(v=>v.id==b.dataset.copy);if(x)a.push({...x,id:Date.now(),title:x.title+' — Copy',status:'draft',progress:0,submitted:0});save(a);renderTeacher()});
   host.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{save(load().filter(x=>x.id!=b.dataset.del));renderTeacher();renderStudent()});
 }
 function renderStudent(tab='active'){
   const host=$('studentAssignmentListV39');if(!host)return;
   const all=load().filter(x=>x.status!=='draft'),items=all.filter(x=>tab==='completed'?['submitted','reviewed'].includes(x.status):x.status==='assigned');
   $('studentDueCountV39').textContent=all.filter(x=>x.status==='assigned').length+' due';
   host.innerHTML=items.length?items.slice().reverse().map(x=>`<div class="student-assignment-card-v39"><div class="student-assignment-card-top-v39"><div><h3>${x.title}</h3><div class="assignment-meta-v39"><span>${x.topic}</span><span>${x.count} questions</span>${x.deadline?`<span>Due ${x.deadline}</span>`:''}</div></div><span class="assignment-status-v39 ${x.status}">${label(x.status)}</span></div><div class="student-progress-v39"><i style="width:${x.progress||0}%"></i></div>${x.status==='assigned'?`<button class="primary-btn" data-start="${x.id}">${x.progress?'Үргэлжлүүлэх':'Эхлэх'}</button>`:`<button class="secondary-btn" data-view="studentResultReviewV36">Үр дүн харах</button>`}</div>`).join(''):'<div class="empty-state-v37">Энд харуулах даалгавар алга.</div>';
   host.querySelectorAll('[data-start]').forEach(b=>b.onclick=()=>{const a=load(),x=a.find(v=>v.id==b.dataset.start);if(!x)return;localStorage.setItem('smarteshActiveAssignmentV39',JSON.stringify(x));x.progress=Math.max(x.progress||0,10);save(a);renderStudent(tab);renderTeacher();window.startSmartPracticeV38?.(x.topic)});
 }
 function update(id,fn){const a=load(),x=a.find(v=>v.id===id);if(x)fn(x);save(a);renderTeacher();renderStudent()}
 window.SmartESHAssignmentsV39={load,save,renderTeacher,renderStudent};

 $('newAssignmentFromBankV39')?.addEventListener('click',()=>$('assignmentBuilderModalV39')?.classList.remove('hidden'));
 $('closeAssignmentBuilderV39')?.addEventListener('click',()=>$('assignmentBuilderModalV39')?.classList.add('hidden'));
 $('saveAssignmentDraftV39')?.addEventListener('click',()=>create('draft'));
 $('assignNowV39')?.addEventListener('click',()=>create('assigned'));
 $('assignmentStatusFilterV39')?.addEventListener('change',renderTeacher);
 $('assignmentSearchV39')?.addEventListener('input',renderTeacher);
 $('refreshAssignmentsV39')?.addEventListener('click',renderTeacher);
 document.querySelectorAll('[data-student-assign-tab]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-student-assign-tab]').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderStudent(b.dataset.studentAssignTab)});

 if(!load().length){const d=new Date(Date.now()+3*86400000).toISOString().slice(0,10);save([{id:Date.now()-1,title:'Conditionals Smart Practice',topic:'Conditionals',count:10,deadline:d,audience:'Бүх сурагч',status:'assigned',shuffle:true,feedback:true,progress:0,submitted:0,totalStudents:30,createdAt:new Date().toISOString()}]);}
 renderTeacher();renderStudent();
})();

// v39 — Smart Practice completion closes the assignment loop
(function(){
 document.getElementById('smartPracticeSubmitV38')?.addEventListener('click',()=>{
   let active=null;try{active=JSON.parse(localStorage.getItem('smarteshActiveAssignmentV39')||'null')}catch(e){}
   if(!active||!window.SmartESHAssignmentsV39)return;
   const a=window.SmartESHAssignmentsV39.load(),x=a.find(v=>v.id===active.id);
   if(x){x.progress=100;x.submitted=Math.min((x.submitted||0)+1,x.totalStudents||30);x.status='submitted';window.SmartESHAssignmentsV39.save(a);window.SmartESHAssignmentsV39.renderTeacher();window.SmartESHAssignmentsV39.renderStudent('completed')}
   localStorage.removeItem('smarteshActiveAssignmentV39');
 },true);
})();

// v40 — Production database blueprint
(function(){
 const $=id=>document.getElementById(id);
 const schema={
 profiles:[['id','uuid • auth user'],['role','student | teacher | admin'],['full_name','text'],['access_status','free | premium | expired'],['created_at','timestamp']],
 questions:[['id','uuid'],['year','2006–2026 | null'],['version','text'],['skill','Grammar / Vocabulary / Communication / Reading'],['topic','text'],['subtopic','text'],['question_type','text'],['difficulty','easy / medium / hard'],['body','text'],['correct_answer','server protected'],['status','draft / review / published / archived'],['ai_confidence','numeric'],['answer_key_status','pending / verified'],['rights_status','pending / cleared']],
 question_options:[['id','uuid'],['question_id','FK questions'],['label','A–E'],['body','text'],['position','integer']],
 exams:[['id','uuid'],['title','text'],['exam_type','previous / mock / practice'],['year','integer | null'],['version','text'],['duration_minutes','integer'],['status','draft / published']],
 exam_questions:[['exam_id','FK exams'],['question_id','FK questions'],['position','integer'],['points','numeric']],
 assignments:[['id','uuid'],['teacher_id','FK profiles'],['title','text'],['source_type','exam / bank / smart_practice'],['deadline','timestamp'],['status','draft / assigned / closed']],
 assignment_targets:[['assignment_id','FK assignments'],['student_id','FK profiles'],['status','assigned / started / submitted / reviewed']],
 attempts:[['id','uuid'],['student_id','FK profiles'],['assignment_id','FK assignments | null'],['exam_id','FK exams | null'],['channel','digital / paper'],['started_at','timestamp'],['submitted_at','timestamp'],['score','numeric'],['percentage','numeric']],
 attempt_answers:[['attempt_id','FK attempts'],['question_id','FK questions'],['selected_answer','text'],['is_correct','boolean'],['answered_at','timestamp']],
 mistakes:[['id','uuid'],['student_id','FK profiles'],['attempt_id','FK attempts'],['question_id','FK questions'],['topic','text'],['status','new / reviewed / mastered']],
 paper_batches:[['id','uuid'],['teacher_id','FK profiles'],['exam_id','FK exams'],['batch_name','text'],['scanned_count','integer'],['created_at','timestamp']],
 notifications:[['id','uuid'],['audience','all / student / teacher'],['type','announcement / content / tip / reminder'],['title','text'],['body','text'],['publish_at','timestamp'],['pinned','boolean']],
 payments:[['id','uuid'],['user_id','FK profiles'],['provider','QPay'],['amount','integer MNT'],['provider_ref','text'],['status','pending / paid / failed'],['verified_at','timestamp']],
 entitlements:[['id','uuid'],['user_id','FK profiles'],['plan','student_annual / teacher_annual / admin_grant'],['starts_at','timestamp'],['ends_at','timestamp'],['status','active / expired']],
 audit_logs:[['id','uuid'],['admin_id','FK profiles'],['action','text'],['entity_type','text'],['entity_id','uuid | null'],['before_data','jsonb'],['after_data','jsonb'],['created_at','timestamp']]
 };
 function show(name){
   if(!$('dbDetailV40'))return;
   $('dbDetailTitleV40').textContent=name;
   $('dbDetailV40').innerHTML=(schema[name]||[]).map(([a,b])=>`<div class="db-field-v40"><code>${a}</code><span>${b}</span></div>`).join('');
 }
 document.querySelectorAll('[data-db-v40]').forEach(b=>b.onclick=()=>show(b.dataset.dbV40));
 show('profiles');

 $('runMigrationAuditV40')?.addEventListener('click',()=>{
   const mappings=[
    ['smarteshAssignmentsV39','assignments + assignment_targets'],
    ['smarteshMixedResultsV29','attempts + attempt_answers'],
    ['smarteshPaperResultsV17','paper_batches + attempts'],
    ['smarteshMistakesV37','mistakes'],
    ['smarteshV14Announcements','notifications'],
    ['smarteshAdminSettingsV33','server settings + audit_logs'],
    ['smarteshAIReviewQueueV35','questions review metadata'],
    ['smarteshPublishedBatchV36','questions published status']
   ];
   const found=mappings.filter(([k])=>localStorage.getItem(k)).length;
   $('migrationAuditV40').classList.add('ok');
   $('migrationAuditV40').innerHTML=`✓ ${mappings.length} prototype data mappings defined • ${found} key(s) currently contain browser data.<br><small>Production migration must validate user ownership, verified answer keys, rights status and timestamps before import.</small>`;
 });
})();

// v41 — prototype auth/account registry; production uses external Auth + profiles table
(function(){
 const KEY='smarteshAccountsV41',$=id=>document.getElementById(id);
 const seed=[];
 const load=()=>{try{const x=JSON.parse(localStorage.getItem(KEY)||'null');return Array.isArray(x)?x:seed}catch(e){return seed}};
 const save=x=>localStorage.setItem(KEY,JSON.stringify(x));
 if(!localStorage.getItem(KEY))save(seed);

 function render(){
   const host=$('accountListV41');if(!host)return;
   const role=$('accountRoleFilterV41')?.value||'all',q=($('accountSearchV41')?.value||'').toLowerCase();
   const a=load().filter(x=>(role==='all'||x.role===role)&&(!q||x.name.toLowerCase().includes(q)||x.email.toLowerCase().includes(q)));
   host.innerHTML=a.length?a.map(x=>`<div class="account-row-v41"><b>${x.name}</b><small>${x.email}</small><span class="account-role-v41">${x.role}</span><span class="account-access-v41 ${x.access==='free'?'free':''}">${x.access}</span><button data-auth-toggle="${x.id}" ${x.role==='admin'?'disabled':''}>${x.access==='premium'?'Free болгох':'Premium болгох'}</button></div>`).join(''):'<div class="empty-state-v37">Account олдсонгүй.</div>';
   host.querySelectorAll('[data-auth-toggle]').forEach(b=>b.onclick=()=>{const a=load(),x=a.find(v=>v.id===b.dataset.authToggle);if(x&&x.role!=='admin')x.access=x.access==='premium'?'free':'premium';save(a);render()});
 }
 $('createDemoAccountV41')?.addEventListener('click',()=>{
   const name=$('authDemoNameV41').value.trim(),email=$('authDemoEmailV41').value.trim().toLowerCase(),role=$('authDemoRoleV41').value;
   if(!name||!email||!email.includes('@')){$('authDemoStatusV41').textContent='Нэр болон зөв email оруулна уу.';return}
   const a=load();if(a.some(x=>x.email===email)){$('authDemoStatusV41').textContent='Энэ email бүртгэлтэй байна.';return}
   a.push({id:'demo-'+Date.now(),name,email,role,access:'free',verified:false});save(a);$('authDemoStatusV41').textContent='✓ Demo account үүслээ. Production дээр verification email илгээгдэнэ.';render();
 });
 $('accountRoleFilterV41')?.addEventListener('change',render);$('accountSearchV41')?.addEventListener('input',render);$('refreshAccountsV41')?.addEventListener('click',render);render();
})();

// v42 — Smart Question Bank prototype lifecycle
(function(){
 const KEY='smarteshQuestionBankV42',$=id=>document.getElementById(id);
 const years=Array.from({length:21},(_,i)=>2006+i);
 if($('qbYearV42')) $('qbYearV42').innerHTML=years.map(y=>`<option value="${y}">${y}</option>`).join('');
 const seed=[];
 const load=()=>{try{const x=JSON.parse(localStorage.getItem(KEY)||'null');return Array.isArray(x)?x:seed}catch(e){return seed}};
 const save=x=>localStorage.setItem(KEY,JSON.stringify(x));
 if(!localStorage.getItem(KEY))save(seed);

 function render(){
   const host=$('qbManagerV42'); if(!host)return;
   const status=$('qbStatusFilterV42')?.value||'all',
         skill=$('qbSkillFilterV42')?.value||'all',
         q=($('qbSearchV42')?.value||'').toLowerCase();
   const rows=load().filter(x=>(status==='all'||x.status===status)&&(skill==='all'||x.skill===skill)&&(!q||`${x.text} ${x.topic} ${x.subtopic}`.toLowerCase().includes(q)));
   host.innerHTML=rows.length?rows.map(x=>`
    <div class="qb-row-v42">
      <b>${x.year} ${x.version||''}</b>
      <div><span class="qb-status-v42 ${x.status}">${x.status}</span><small>${x.confidence}% AI</small></div>
      <div><b>${x.text}</b><div class="qb-meta-v42"><span class="qb-tag-v42">${x.skill}</span><span class="qb-tag-v42">${x.topic}</span><span class="qb-tag-v42">${x.subtopic}</span><span class="qb-tag-v42">${x.difficulty}</span></div></div>
      <div><small>Answer key</small><b>${x.key}</b></div>
      <div><small>Rights</small><b>${x.rights}</b></div>
      <div class="qb-actions-v42">
        <button data-qb-review="${x.id}">Review</button>
        <button data-qb-publish="${x.id}">Publish</button>
      </div>
    </div>`).join(''):'<div class="empty-state-v37">Question олдсонгүй.</div>';
   host.querySelectorAll('[data-qb-review]').forEach(b=>b.onclick=()=>{
      const a=load(),x=a.find(v=>v.id===b.dataset.qbReview); if(!x)return;
      x.status='review'; save(a); render();
   });
   host.querySelectorAll('[data-qb-publish]').forEach(b=>b.onclick=()=>{
      const a=load(),x=a.find(v=>v.id===b.dataset.qbPublish); if(!x)return;
      const ok=x.key==='verified'&&x.rights==='cleared'&&x.confidence>=80;
      if(!ok){ alert('Publish gate хангагдаагүй: verified answer key, rights cleared, review threshold шаардлагатай.'); return; }
      x.status='published'; save(a); render();
   });
 }
 $('createBatchV42')?.addEventListener('click',()=>{
   const year=+$('qbYearV42').value,version=$('qbVersionV42').value.trim()||'A',key=$('qbKeyStatusV42').value;
   const a=load();
   a.unshift({id:'batch-'+Date.now(),year,version,skill:'Grammar',topic:'Unclassified',subtopic:'Pending AI classification',difficulty:'medium',status:'draft',text:'New import batch placeholder — production parser required.',confidence:0,key,rights:'pending'});
   save(a);
   $('qbBatchStatusV42').textContent=`✓ ${year} ${version} batch үүслээ. Дараагийн шат: parse → AI classify → review.`;
   render();
 });
 $('seedQBV42')?.addEventListener('click',()=>{save(seed);render()});
 $('qbStatusFilterV42')?.addEventListener('change',render);
 $('qbSkillFilterV42')?.addEventListener('change',render);
 $('qbSearchV42')?.addEventListener('input',render);
 render();
})();

// v43 — canonical test engine demo
(function(){
  const STATE_KEY='smarteshTestEngineStateV43';
  const ATTEMPT_KEY='smarteshAttemptsV43';
  const $=id=>document.getElementById(id);

  const demoQuestions=[
    {id:'te43-q1',skill:'Grammar',topic:'Conditionals',subtopic:'Type 2',text:'If I ___ more time, I would learn another language.',options:{A:'have',B:'had',C:'will have',D:'am having'},correct:'B',verified:true,explanation:'Type 2 conditional uses past simple in the if-clause.'},
    {id:'te43-q2',skill:'Vocabulary',topic:'Phrasal verbs',subtopic:'Travel',text:'The plane will ___ at 8:30.',options:{A:'take off',B:'take after',C:'take in',D:'take over'},correct:'A',verified:true,explanation:'“Take off” means an aircraft leaves the ground.'},
    {id:'te43-q3',skill:'Communication',topic:'Requests & offers',subtopic:'Polite request',text:'Choose the most polite request.',options:{A:'Give me your pen.',B:'Could I borrow your pen, please?',C:'You give pen.',D:'Pen now.'},correct:'B',verified:true,explanation:'“Could I …, please?” is a polite request form.'},
    {id:'te43-q4',skill:'Reading',topic:'Inference',subtopic:'Everyday text',text:'Mina took an umbrella and wore waterproof boots before leaving home. What can we infer?',options:{A:'It may rain.',B:'It is very hot.',C:'She is going swimming.',D:'She lost her shoes.'},correct:'A',verified:true,explanation:'The umbrella and waterproof boots suggest rainy weather.'},
    {id:'te43-q5',skill:'Grammar',topic:'Question tags',subtopic:'Present simple',text:'You like English, ___?',options:{A:'do you',B:"don't you",C:'are you',D:"aren't you"},correct:'B',verified:true,explanation:'A positive statement takes a negative question tag: “don’t you?”'}
  ];

  let state;
  function fresh(){
    return {
      attemptId:'attempt-v43-'+Date.now(),
      title:'SmartESH Demo Check',
      current:0,
      startedAt:new Date().toISOString(),
      remaining:600,
      answers:{},
      flagged:[],
      submitted:false,
      lastSavedAt:null
    };
  }
  function loadState(){
    try{
      const x=JSON.parse(localStorage.getItem(STATE_KEY)||'null');
      state=x&&typeof x==='object'?x:fresh();
    }catch(e){state=fresh()}
    if(state.submitted) state=fresh();
    saveState(false);
  }
  function saveState(show=true){
    state.lastSavedAt=new Date().toISOString();
    localStorage.setItem(STATE_KEY,JSON.stringify(state));
    if(show&&$('teSaveV43')){
      $('teSaveV43').textContent='Saved '+new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
    }
  }
  function answeredCount(){return Object.keys(state.answers||{}).filter(k=>state.answers[k]).length}
  function render(){
    const host=$('teQuestionV43'); if(!host)return;
    const q=demoQuestions[state.current];
    host.innerHTML=`
      <div class="meta">
        <span class="qb-tag-v42">${q.skill}</span>
        <span class="qb-tag-v42">${q.topic}</span>
        <span class="qb-tag-v42">${q.subtopic}</span>
        <span class="qb-tag-v42">Q${state.current+1}/${demoQuestions.length}</span>
      </div>
      <h3>${q.text}</h3>
      <div>
        ${Object.entries(q.options).map(([label,body])=>`
          <label class="te-option-v43 ${state.answers[q.id]===label?'selected':''}">
            <input type="radio" name="te43answer" value="${label}" ${state.answers[q.id]===label?'checked':''}>
            <b>${label}.</b><span>${body}</span>
          </label>`).join('')}
      </div>`;
    host.querySelectorAll('input[name="te43answer"]').forEach(r=>r.onchange=()=>{
      state.answers[q.id]=r.value; saveState(); render();
    });

    $('teAnsweredV43').textContent=`${answeredCount()} / ${demoQuestions.length}`;
    $('teFlagV43').textContent=state.flagged.includes(q.id)?'🚩 Flagged':'🚩 Flag';
    $('tePrevV43').disabled=state.current===0;
    $('teNextV43').disabled=state.current===demoQuestions.length-1;
    renderNums();
  }
  function renderNums(){
    const host=$('teNumbersV43'); if(!host)return;
    host.innerHTML=demoQuestions.map((q,i)=>`<button class="te-num-v43 ${i===state.current?'active':''} ${state.answers[q.id]?'answered':''} ${state.flagged.includes(q.id)?'flagged':''}" data-i="${i}">${i+1}</button>`).join('');
    host.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>{state.current=+b.dataset.i;saveState(false);render()});
  }
  function renderReview(){
    const p=$('teReviewPanelV43'); if(!p)return;
    p.hidden=false;
    const unanswered=demoQuestions.filter(q=>!state.answers[q.id]).length;
    p.innerHTML=`<h3>Submit review</h3>
      <p><b>Answered:</b> ${answeredCount()} • <b>Unanswered:</b> ${unanswered} • <b>Flagged:</b> ${state.flagged.length}</p>
      <div class="te-review-grid-v43">
        ${demoQuestions.map((q,i)=>`<button data-review-i="${i}">Q${i+1}<br><small>${state.answers[q.id]?'Answered':'Unanswered'}${state.flagged.includes(q.id)?' • Flagged':''}</small></button>`).join('')}
      </div>`;
    p.querySelectorAll('[data-review-i]').forEach(b=>b.onclick=()=>{state.current=+b.dataset.reviewI;p.hidden=true;render()});
  }
  function submit(){
    if(state.submitted)return;
    const unanswered=demoQuestions.filter(q=>!state.answers[q.id]).length;
    if(unanswered && !confirm(`${unanswered} unanswered question байна. Submit хийх үү?`)) return;
    if(!confirm('Submit хийсний дараа энэ attempt-ийн хариулт түгжигдэнэ. Үргэлжлүүлэх үү?')) return;

    const perQuestion=demoQuestions.map(q=>{
      const selected=state.answers[q.id]||null;
      return {
        questionId:q.id,
        questionText:q.text,
        selectedAnswer:selected,
        correctAnswer:q.verified?q.correct:null,
        answerKeyVerified:q.verified,
        correct:q.verified?(selected===q.correct):null,
        skill:q.skill,
        topic:q.topic,
        subtopic:q.subtopic,
        explanation:q.verified?q.explanation:null
      };
    });
    const verified=perQuestion.filter(x=>x.answerKeyVerified);
    const correct=verified.filter(x=>x.correct===true).length;
    const wrong=verified.filter(x=>x.correct===false).length;
    const score=verified.length?Math.round(correct/verified.length*100):null;
    const attempt={
      id:state.attemptId,
      studentId:'student-demo',
      assignmentId:null,
      title:state.title,
      mode:'digital',
      startedAt:state.startedAt,
      submittedAt:new Date().toISOString(),
      durationSeconds:600-state.remaining,
      totalQuestions:demoQuestions.length,
      answered:answeredCount(),
      correct,
      wrong,
      scorePercent:score,
      verifiedQuestionCount:verified.length,
      perQuestion
    };
    let attempts=[];
    try{attempts=JSON.parse(localStorage.getItem(ATTEMPT_KEY)||'[]')}catch(e){}
    if(!Array.isArray(attempts))attempts=[];
    if(!attempts.some(a=>a.id===attempt.id))attempts.unshift(attempt);
    localStorage.setItem(ATTEMPT_KEY,JSON.stringify(attempts));
    state.submitted=true; saveState(false); localStorage.removeItem(STATE_KEY);
    renderAttempt(attempt);
    alert(score===null?'Answers saved. Official answer key required for scoring.':`Submit амжилттай. Score: ${score}%`);
    state=fresh(); saveState(false); render();
  }
  function renderAttempt(attempt){
    const host=$('teAttemptDetailV43'); if(!host)return;
    if(!attempt){host.innerHTML='Test submit хийсний дараа question-by-question result энд гарна.';return}
    host.innerHTML=`
      <div class="te-result-summary-v43">
        <div><small>Score</small><b>${attempt.scorePercent===null?'Unverified':attempt.scorePercent+'%'}</b></div>
        <div><small>Correct</small><b>${attempt.correct}</b></div>
        <div><small>Wrong</small><b>${attempt.wrong}</b></div>
        <div><small>Answered</small><b>${attempt.answered}/${attempt.totalQuestions}</b></div>
      </div>
      ${attempt.perQuestion.map((x,i)=>`
        <div class="te-answer-review-v43 ${x.answerKeyVerified?(x.correct?'correct':'wrong'):'unverified'}">
          <div class="row"><b>Q${i+1}. ${x.questionText}</b><span class="qb-tag-v42">${x.skill} • ${x.topic}</span></div>
          <div class="row"><span>Selected: <b>${x.selectedAnswer||'—'}</b></span><span>Correct: <b>${x.answerKeyVerified?x.correctAnswer:'Official answer key required'}</b></span></div>
          <small>${x.answerKeyVerified?(x.explanation||''):'Answers preserved; no correctness is fabricated.'}</small>
        </div>`).join('')}`;
  }

  $('tePrevV43')?.addEventListener('click',()=>{if(state.current>0){state.current--;saveState(false);render()}});
  $('teNextV43')?.addEventListener('click',()=>{if(state.current<demoQuestions.length-1){state.current++;saveState(false);render()}});
  $('teFlagV43')?.addEventListener('click',()=>{
    const id=demoQuestions[state.current].id,idx=state.flagged.indexOf(id);
    if(idx>=0)state.flagged.splice(idx,1); else state.flagged.push(id);
    saveState();render();
  });
  $('teReviewV43')?.addEventListener('click',renderReview);
  $('teSubmitV43')?.addEventListener('click',submit);
  $('teClearAttemptV43')?.addEventListener('click',()=>{
    localStorage.removeItem(STATE_KEY); localStorage.removeItem(ATTEMPT_KEY);
    state=fresh(); saveState(false); render(); renderAttempt(null);
  });

  loadState();
  render();
  try{
    const attempts=JSON.parse(localStorage.getItem(ATTEMPT_KEY)||'[]');
    if(Array.isArray(attempts)&&attempts[0])renderAttempt(attempts[0]);
  }catch(e){}

  setInterval(()=>{
    if(!$('teTimerV43')||!document.getElementById('testEngineV43')) return;
    if(state.remaining>0){
      state.remaining--;
      const m=Math.floor(state.remaining/60),s=state.remaining%60;
      $('teTimerV43').textContent=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
      if(state.remaining%10===0) saveState(false);
      if(state.remaining===60) alert('1 минут үлдлээ.');
    }
  },1000);
})();

// v58: legacy random OMR simulation removed. Real scanner UI below never fabricates answers or scores.

(function(){const P='smarteshPaymentsV45',E='smarteshEntitlementsV45',$=x=>document.getElementById(x),price={student:10000,teacher:20000};const load=k=>{try{return JSON.parse(localStorage.getItem(k)||'[]')}catch(e){return[]}},save=(k,v)=>localStorage.setItem(k,JSON.stringify(v)),money=n=>new Intl.NumberFormat('mn-MN').format(n)+'₮';
function render(){const host=$('paymentRegistryV45');if(!host)return;const a=load(P),e=load(E);host.innerHTML=a.length?a.map(p=>{const x=e.find(z=>z.userId===p.userId&&z.status==='active'),days=x?Math.max(0,Math.ceil((new Date(x.endsAt)-new Date())/86400000)):0;return `<div class="payment-row-v45"><b>${p.userId}</b><span>${money(p.amount)}</span><span>${p.status}</span><span>${x?'Premium':'Free'}</span><span>${x?days+' days':'No entitlement'}</span></div>`}).join(''):'<div class="empty-state-v37">Payment record алга.</div>'}
function invoice(){const [uid,role]=$('payUserV45').value.split('|'),plan=$('payPlanV45').value;if(role!==plan){alert('User role болон plan таарах ёстой.');return}const p={id:'pay-'+Date.now(),userId:uid,plan,amount:price[plan],senderInvoiceNo:'SMARTESH-'+Date.now(),status:'pending'};let a=load(P);a.unshift(p);save(P,a);$('invoiceCardV45').innerHTML=`<div class="invoice-live-v45"><div class="qr-demo-v45"></div><div><h3>${money(p.amount)}</h3><p>${p.senderInvoiceNo}</p><button class="primary-btn" id="demoPaidV45">Demo payment verify</button><p><small>Production QR/deeplink QPay response-оос ирнэ.</small></p></div></div>`;$('demoPaidV45').onclick=()=>paid(p.id);render()}
function paid(id){let a=load(P),p=a.find(x=>x.id===id);if(!p||p.status==='paid')return;p.status='paid';p.verifiedAt=new Date().toISOString();save(P,a);let es=load(E),x=es.find(z=>z.userId===p.userId&&z.status==='active'),now=new Date(),base=x&&new Date(x.endsAt)>now?new Date(x.endsAt):now,end=new Date(base);end.setDate(end.getDate()+365);if(x){x.endsAt=end.toISOString();x.paymentId=p.id}else es.unshift({id:'ent-'+Date.now(),userId:p.userId,plan:p.plan+'_annual',startsAt:now.toISOString(),endsAt:end.toISOString(),status:'active',paymentId:p.id});save(E,es);render();$('invoiceCardV45').innerHTML='<b>✓ Demo payment verified → 365-day Premium activated.</b>'}
$('payUserV45')?.addEventListener('change',()=>{$('payPlanV45').value=$('payUserV45').value.split('|')[1]});$('createInvoiceV45')?.addEventListener('click',invoice);$('resetPaymentsV45')?.addEventListener('click',()=>{localStorage.removeItem(P);localStorage.removeItem(E);render();$('invoiceCardV45').textContent='Invoice энд харагдана.'});render()})();

// ============================================================
// v47 — Interaction Fix + Supabase Assignment Flow
// ============================================================
(function(){
  const $=id=>document.getElementById(id);

  function toast(text){
    let t=document.querySelector('.v47-toast');
    if(!t){t=document.createElement('div');t.className='v47-toast';document.body.appendChild(t);}
    t.textContent=text; t.hidden=false;
    clearTimeout(window.__v47ToastTimer);
    window.__v47ToastTimer=setTimeout(()=>{t.hidden=true},2200);
  }

  function getWeakConfig(){
    const topic=$('weakPracticeTopicV37')?.value||'Conditionals';
    const count=Math.max(5,Math.min(50,Number($('weakPracticeCountV37')?.value||10)));
    const recipient=$('weakPracticeRecipientV37')?.value||'Сул сэдэвтэй сурагчид';
    const shuffle=!!$('weakPracticeShuffleV37')?.checked;
    const feedback=!!$('weakPracticeFeedbackV37')?.checked;
    return {topic,count,recipient,shuffle,feedback};
  }

  const demoBank={
    'Reading inference':[
      'Read a short paragraph and choose the best inference.',
      'Which detail most strongly supports the writer’s implied idea?',
      'What can be inferred about the speaker’s attitude?',
      'Choose the conclusion supported by the text.'
    ],
    'Conditionals':[
      'Choose the correct Type 1 conditional form.',
      'Complete the Type 2 conditional sentence.',
      'Choose the correct result clause.',
      'Identify the conditional pattern.'
    ],
    'Phrasal verbs':[
      'Choose the phrasal verb that matches the context.',
      'Select the meaning of the highlighted phrasal verb.',
      'Complete the sentence with the correct phrasal verb.',
      'Choose the closest synonym.'
    ],
    'Tenses':[
      'Choose the correct tense for the time marker.',
      'Complete the sentence with the correct verb form.',
      'Identify the tense used in context.',
      'Choose the form that shows an unfinished action.'
    ]
  };

  function renderWeakPreview(){
    const cfg=getWeakConfig();
    const host=$('weakPracticePreviewV47'); if(!host) return;
    const bank=demoBank[cfg.topic]||demoBank['Conditionals'];
    const n=Math.min(4,cfg.count);
    host.classList.remove('hidden');
    host.innerHTML=`<div class="preview-head-v47"><div><span class="eyebrow">STUDENT PREVIEW</span><h3>${cfg.topic} • ${cfg.count} questions</h3><small>${cfg.recipient} • ${cfg.shuffle?'Randomized':'Fixed order'} • ${cfg.feedback?'Explanation after submit':'No explanation'}</small></div><span class="pill">Draft preview</span></div>
      <div class="preview-grid-v47">${Array.from({length:n},(_,i)=>`<div class="preview-q-v47"><b>Q${i+1}</b><p>${bank[i%bank.length]}</p><small>A / B / C / D</small></div>`).join('')}</div>
      ${cfg.count>n?`<p class="helper-text">+ ${cfg.count-n} more questions will be selected from the Question Bank.</p>`:''}`;
    $('weakPracticeStatusV37').textContent=`Preview ready: ${cfg.topic} • ${cfg.count} questions`;
  }

  async function saveWeakDraft(){
    const cfg=getWeakConfig();
    const btn=$('saveWeakPracticeV37');
    if(btn){btn.disabled=true;btn.textContent='Хадгалж байна…';}
    const draft={
      id:'weak-v47-'+Date.now(),
      title:`Smart Practice — ${cfg.topic}`,
      topic:cfg.topic,
      count:cfg.count,
      recipient:cfg.recipient,
      shuffle:cfg.shuffle,
      feedback:cfg.feedback,
      source_type:'weak_topic',
      status:'draft',
      createdAt:new Date().toISOString()
    };

    let cloudSaved=false, cloudError='';
    try{
      const sb=window.smarteshSupabase;
      const user=typeof currentUser==='function'?currentUser():null;
      if(sb && user?.id && user?.role==='teacher'){
        const payload={
          teacher_id:user.id,
          title:draft.title,
          source_type:'weak_topic',
          status:'draft'
        };
        const {data,error}=await sb.from('assignments').insert(payload).select('id').single();
        if(error) throw error;
        draft.cloudId=data.id; cloudSaved=true;
      }
    }catch(e){ cloudError=e?.message||String(e); console.warn('v47 cloud draft fallback:',e); }

    let a=[];
    try{a=JSON.parse(localStorage.getItem('smarteshWeakPracticeDraftsV37')||'[]')}catch(e){}
    if(!Array.isArray(a)) a=[];
    a.push(draft);
    localStorage.setItem('smarteshWeakPracticeDraftsV37',JSON.stringify(a));

    const status=$('weakPracticeStatusV37');
    if(status){
      status.textContent=cloudSaved
        ? '✓ Draft Supabase-д хадгалагдлаа.'
        : '✓ Draft browser-д хадгалагдлаа.'+(cloudError?' Supabase policy/config-г дараа шалгана.':'');
    }
    toast(cloudSaved?'Draft cloud-д хадгалагдлаа':'Draft хадгалагдлаа');
    if(btn){btn.disabled=false;btn.textContent='Draft үүсгэх';}
  }

  // Replace brittle direct handlers with delegated handlers.
  document.addEventListener('click',e=>{
    const p=e.target.closest('#previewWeakPracticeV37');
    if(p){e.preventDefault();e.stopPropagation();renderWeakPreview();return;}
    const s=e.target.closest('#saveWeakPracticeV37');
    if(s){e.preventDefault();e.stopPropagation();saveWeakDraft();return;}
    const c=e.target.closest('#closeWeakPracticeV37');
    if(c){e.preventDefault();$('weakPracticeModalV37')?.classList.add('hidden');return;}
  },true);

  // Backdrop and Escape close.
  $('weakPracticeModalV37')?.addEventListener('click',e=>{
    if(e.target===e.currentTarget)e.currentTarget.classList.add('hidden');
  });
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape')$('weakPracticeModalV37')?.classList.add('hidden');
  });

  // Per-student Practice buttons: open same modal and keep recipient context.
  document.addEventListener('click',e=>{
    const b=e.target.closest('.v19-target, [data-v47-practice]');
    if(!b)return;
    e.preventDefault();
    const topic=b.dataset.topic && b.dataset.topic!=='Personal weak topics'?b.dataset.topic:'Conditionals';
    const select=$('weakPracticeTopicV37');
    if(select && [...select.options].some(o=>o.value===topic))select.value=topic;
    $('weakPracticeModalV37')?.classList.remove('hidden');
    $('weakPracticeStatusV37').textContent='Topic болон асуултын тоогоо сонгоно уу.';
  },true);

  // Ready-task Preview buttons that previously had no action.
  function ensureTaskPreview(){
    let modal=$('teacherTaskPreviewV47');
    if(modal)return modal;
    modal=document.createElement('div');
    modal.id='teacherTaskPreviewV47';
    modal.className='teacher-task-preview-v47 hidden';
    modal.innerHTML=`<div class="teacher-task-preview-card-v47"><div class="panel-head"><div><span class="eyebrow">STUDENT VIEW</span><h3 id="teacherTaskPreviewTitleV47">Task preview</h3></div><button class="icon-btn-v34" id="closeTeacherTaskPreviewV47">×</button></div><div id="teacherTaskPreviewBodyV47"></div><div class="form-actions"><button class="primary-btn" id="useTeacherTaskV47">Энэ даалгаврыг ашиглах</button></div></div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click',e=>{if(e.target===modal)modal.classList.add('hidden')});
    modal.querySelector('#closeTeacherTaskPreviewV47').onclick=()=>modal.classList.add('hidden');
    modal.querySelector('#useTeacherTaskV47').onclick=()=>{modal.classList.add('hidden');toast('Даалгавар сонгогдлоо')};
    return modal;
  }
  document.addEventListener('click',e=>{
    const b=e.target.closest('.teacher-task > .secondary-btn');
    if(!b)return;
    e.preventDefault();e.stopPropagation();
    const card=b.closest('.teacher-task');
    const title=card?.querySelector('b')?.textContent?.trim()||'Ready task';
    const meta=card?.querySelector('small')?.textContent?.trim()||'';
    const modal=ensureTaskPreview();
    modal.querySelector('#teacherTaskPreviewTitleV47').textContent=title;
    modal.querySelector('#teacherTaskPreviewBodyV47').innerHTML=`<p><b>${title}</b></p><p>${meta}</p><div class="preview-q-v47"><b>Sample question</b><p>Student view preview of this ready task.</p><small>A / B / C / D</small></div>`;
    modal.classList.remove('hidden');
  },true);

  // Give keyboard semantics to visible buttons and prevent accidental dead-looking controls.
  document.querySelectorAll('button').forEach(b=>{
    if(!b.type)b.type='button';
  });

  window.SmartESHInteractionsV47={renderWeakPreview,saveWeakDraft};
})();

// ============================================================
// v48 — Admin Mock Test: PDF → Answer Key → Preview → Publish
// ============================================================
(function(){
  const $=id=>document.getElementById(id);
  const KEY='smarteshMockTestsV48';
  let state={step:1,pdfName:'',keyFileName:'',answerVerified:false};

  function msg(id,text,ok=true){const el=$(id);if(el){el.textContent=text;el.className='form-message '+(ok?'success':'error');}}
  function tests(){try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch(e){return []}}
  function saveTests(v){localStorage.setItem(KEY,JSON.stringify(v));}
  function mode(){return document.querySelector('input[name="mockAnswerModeV48"]:checked')?.value||'manual';}
  function cfg(){
    return {
      id:'mock-v48-'+Date.now(),
      title:$('mockTitleV48')?.value.trim()||'Mock Test',
      minutes:Number($('mockMinutesV48')?.value||80),
      questionCount:Number($('mockQuestionCountV48')?.value||47),
      version:$('mockVersionV48')?.value.trim()||'A',
      pdfName:state.pdfName,
      answerMode:mode(),
      manualKey:$('mockManualKeyV48')?.value.trim()||'',
      keyFileName:state.keyFileName,
      answerKeyStatus:state.answerVerified?'verified':'unverified',
      reviewed:!!$('mockReviewedV48')?.checked,
      rightsChecked:!!$('mockRightsV48')?.checked,
      visibleToStudents:!!$('mockVisibleV48')?.checked,
      contentStatus:'draft',
      createdAt:new Date().toISOString()
    }
  }
  function showStep(n){
    state.step=n;
    document.querySelectorAll('[data-mock-panel]').forEach(p=>p.classList.toggle('hidden',Number(p.dataset.mockPanel)!==n));
    document.querySelectorAll('[data-mock-step]').forEach(b=>b.classList.toggle('active',Number(b.dataset.mockStep)===n));
    if(n===4) renderPublishSummary();
  }
  function validatePdf(){
    if(!state.pdfName){msg('mockStep1MsgV48','Mock Test-ийн PDF эсвэл зураг сонгоно уу.',false);return false;}
    const c=Number($('mockQuestionCountV48')?.value||0), m=Number($('mockMinutesV48')?.value||0);
    if(c<1||m<1){msg('mockStep1MsgV48','Асуултын тоо болон хугацааг зөв оруулна уу.',false);return false;}
    return true;
  }
  function validateAnswer(){
    const md=mode();
    state.answerVerified=(md==='manual' && !!$('mockManualKeyV48')?.value.trim()) || (md==='file' && !!state.keyFileName);
    if(md==='manual' && !state.answerVerified){msg('mockStep2MsgV48','Зөв хариуг 1-B, 2-D... хэлбэрээр оруулна уу.',false);return false;}
    if(md==='file' && !state.answerVerified){msg('mockStep2MsgV48','Answer key файлаа сонгоно уу.',false);return false;}
    return true;
  }
  function buildPreview(){
    if(!validateAnswer())return;
    const c=cfg();
    $('mockPreviewTitleV48').textContent=c.title;
    $('mockPreviewMetaV48').textContent=`${c.questionCount} questions • ${c.minutes} min • Version ${c.version}`;
    $('mockPreviewTimerV48').textContent=`${c.minutes}:00`;
    const grid=$('mockQGridV48'); if(grid)grid.innerHTML=Array.from({length:Math.min(c.questionCount,50)},(_,i)=>`<span>${i+1}</span>`).join('');
    $('mockReadinessV48').innerHTML=`<b>Import status</b><br>PDF: ${c.pdfName}<br>Answer key: ${c.answerKeyStatus==='verified'?'✓ оруулсан':'⚠ verified биш'}<br><small>v48 prototype нь PDF parsing/AI extraction-ийг live backend гэж дүр эсгэхгүй. PDF-ээс бодит асуулт салгах service дараагийн backend integration-д холбогдоно.</small>`;
    showStep(3);
  }
  function renderPublishSummary(){
    const c=cfg();
    $('mockPublishSummaryV48').innerHTML=`<b>${c.title}</b><br>${c.questionCount} questions • ${c.minutes} min • Version ${c.version}<br>PDF: ${c.pdfName||'—'}<br>Answer key: ${c.answerKeyStatus==='verified'?'✓ Verified input':'⚠ Unverified'}`;
  }
  async function persist(status){
    const c=cfg(); c.contentStatus=status;
    if(status==='published' && (!c.reviewed || !c.rightsChecked)){
      msg('mockPublishMsgV48','Publish хийхийн өмнө Admin review болон publishing rights хоёрыг шалгана уу.',false); return;
    }
    // Safe prototype persistence. Supabase schema mapping remains production-ready,
    // but no fake live PDF parsing or privileged publish call is claimed.
    const arr=tests(); arr.unshift(c); saveTests(arr);
    $('mockPublishStatusV48').textContent=status==='published'?'Published':'Draft';
    msg('mockPublishMsgV48',status==='published'
      ?'✓ Mock Test Published. Student → Mock Test хэсэгт нийтлэх төлөвтэй хадгалагдлаа.'
      :'✓ Mock Test Draft хадгалагдлаа.');
  }

  $('mockPdfV48')?.addEventListener('change',e=>{
    state.pdfName=e.target.files?.[0]?.name||'';
    $('mockPdfNameV48').textContent=state.pdfName||'PDF / зураг';
  });
  $('mockKeyFileV48')?.addEventListener('change',e=>state.keyFileName=e.target.files?.[0]?.name||'');
  document.querySelectorAll('input[name="mockAnswerModeV48"]').forEach(r=>r.addEventListener('change',()=>{
    $('mockManualKeyWrapV48')?.classList.toggle('hidden',mode()!=='manual');
    $('mockKeyFileWrapV48')?.classList.toggle('hidden',mode()!=='file');
  }));
  $('mockToAnswerV48')?.addEventListener('click',()=>{if(validatePdf())showStep(2)});
  $('mockBuildPreviewV48')?.addEventListener('click',buildPreview);
  $('mockToPublishV48')?.addEventListener('click',()=>showStep(4));
  $('mockSaveDraftV48')?.addEventListener('click',()=>persist('draft'));
  $('mockPublishV48')?.addEventListener('click',()=>persist('published'));
  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-mock-back]'); if(b){e.preventDefault();showStep(Number(b.dataset.mockBack));}
    const s=e.target.closest('[data-mock-step]'); if(s){e.preventDefault(); const n=Number(s.dataset.mockStep); if(n<=state.step)showStep(n);}
  });
  window.SmartESHMockTestV48={showStep,buildPreview,persist};
})();

// ============================================================
// v49 — Teacher Previous Exam: Preview Only, Student unchanged
// ============================================================
(function(){
  const $=id=>document.getElementById(id);
  let previewSet=[], previewIndex=0, previewSection='Grammar';

  function roleV49(){
    try{
      if(typeof currentUser==='function'){
        const u=currentUser();
        if(u?.role)return u.role;
      }
      if(typeof smartDB!=='undefined' && smartDB.session){
        const u=smartDB.users?.find(x=>x.id===smartDB.session.userId);
        if(u?.role)return u.role;
      }
    }catch(e){}
    return 'guest';
  }

  function applyTeacherMode(){
    const teacher=roleV49()==='teacher';
    document.body.classList.toggle('teacher-mode-v49',teacher);
    $('teacherPreviousExamHintV49')?.classList.toggle('hidden',!teacher);
    if($('start2024Full')) $('start2024Full').textContent=teacher?'Preview full 2024 A':'Start full 2024 A';
    if($('practice2024Section')) $('practice2024Section').textContent=teacher?'Preview selected section':'Practice selected section';
    const desc=document.querySelector('#previousExams .page-head p');
    if(desc) desc.textContent=teacher
      ?'Он, хувилбар, хэсгээр тестийн агуулгыг Preview хийж, дараа нь сурагчдад даалгавар болгоно.'
      :'Жил, хувилбар, хэсгээр ажиллаж feedback авах эсвэл бүтэн шалгалт эхлүүлнэ.';
  }

  function sectionQuestionsV49(section){
    if(typeof exam2024Questions==='undefined')return [];
    return exam2024Questions.filter(q=>q.section===section);
  }

  function openTeacherPreview(full=false,section=null){
    if(roleV49()!=='teacher')return false;
    previewSection=section||previewSection||'Grammar';
    previewSet=full?[...exam2024Questions]:sectionQuestionsV49(previewSection);
    if(!previewSet.length) previewSet=[...exam2024Questions].slice(0,1);
    previewIndex=0;
    $('teacherExamPreviewTitleV49').textContent=full?'2024 A • Full Test Preview':`2024 A • ${previewSection} Preview`;
    $('teacherExamPreviewMetaV49').textContent='Багшийн Preview горим • хариулт сонгохгүй • attempt үүсгэхгүй';
    $('teacherPreviewCountV49').textContent=previewSet.length;
    $('teacherExamPreviewV49')?.classList.remove('hidden');
    renderTeacherPreview();
    return true;
  }

  function renderTeacherPreview(){
    const q=previewSet[previewIndex]; if(!q)return;
    $('teacherPreviewSectionPillV49').textContent=`${q.section} • Q${q.n}`;
    $('teacherPreviewQuestionV49').textContent=q.q;
    $('teacherPreviewChoicesV49').innerHTML=(q.choices||[]).map((x,i)=>`<div class="teacher-preview-choice-v49"><b>${String.fromCharCode(65+i)}.</b> ${x}</div>`).join('');
    $('teacherPreviewPrevV49').disabled=previewIndex===0;
    $('teacherPreviewNextV49').disabled=previewIndex===previewSet.length-1;
    document.querySelectorAll('[data-teacher-preview-section]').forEach(b=>b.classList.toggle('active',b.dataset.teacherPreviewSection===q.section));
    const st=$('teacherExamPreviewStatusV49');
    if(st)st.textContent=`Question ${previewIndex+1} / ${previewSet.length} • Preview only`;
  }

  // Capture old "start/practice" clicks BEFORE original handlers run.
  document.addEventListener('click',e=>{
    const full=e.target.closest('#start2024Full');
    if(full && roleV49()==='teacher'){
      e.preventDefault(); e.stopImmediatePropagation();
      openTeacherPreview(true,null); return;
    }
    const sec=e.target.closest('#practice2024Section');
    if(sec && roleV49()==='teacher'){
      e.preventDefault(); e.stopImmediatePropagation();
      const selected=(typeof selectedSection!=='undefined'&&selectedSection)||'Grammar';
      openTeacherPreview(false,selected); return;
    }
  },true);

  // Teacher clicking 2024 archive year should reveal preview options, not a runner.
  document.addEventListener('click',e=>{
    const y=e.target.closest('[data-archive-year="2024"]');
    if(y && roleV49()==='teacher'){
      const st=$('eeshArchiveStatusV30');
      if(st)st.innerHTML='👩‍🏫 <b>2024 A</b> сонгогдлоо. Доорх хэсгээ сонгоод <b>Preview</b> хийнэ.';
      setTimeout(()=>document.querySelector('#previousExams .exam-section-grid')?.scrollIntoView({behavior:'smooth',block:'center'}),30);
    }
  },true);

  document.querySelectorAll('[data-teacher-preview-section]').forEach(b=>b.addEventListener('click',()=>{
    previewSection=b.dataset.teacherPreviewSection;
    previewSet=sectionQuestionsV49(previewSection);
    previewIndex=0;
    $('teacherExamPreviewTitleV49').textContent=`2024 A • ${previewSection} Preview`;
    $('teacherPreviewCountV49').textContent=previewSet.length;
    renderTeacherPreview();
  }));
  $('teacherPreviewPrevV49')?.addEventListener('click',()=>{if(previewIndex>0){previewIndex--;renderTeacherPreview()}});
  $('teacherPreviewNextV49')?.addEventListener('click',()=>{if(previewIndex<previewSet.length-1){previewIndex++;renderTeacherPreview()}});
  $('closeTeacherExamPreviewV49')?.addEventListener('click',()=>$('teacherExamPreviewV49')?.classList.add('hidden'));
  $('teacherExamPreviewV49')?.addEventListener('click',e=>{if(e.target===e.currentTarget)e.currentTarget.classList.add('hidden')});

  $('teacherUseExamAssignmentV49')?.addEventListener('click',()=>{
    const draft={
      id:'previous-exam-v49-'+Date.now(),
      title:$('teacherExamPreviewTitleV49')?.textContent.replace(' • Preview','')||'2024 A',
      source_type:'previous_exam',
      year:2024,
      version:'A',
      section:previewSet.length===47?'Full Section 1':previewSection,
      questionCount:previewSet.length,
      status:'draft',
      createdAt:new Date().toISOString()
    };
    let a=[];try{a=JSON.parse(localStorage.getItem('smarteshAssignmentsV39')||'[]')}catch(e){}
    if(!Array.isArray(a))a=[];
    a.unshift(draft);localStorage.setItem('smarteshAssignmentsV39',JSON.stringify(a));
    const st=$('teacherExamPreviewStatusV49');
    if(st)st.textContent='✓ Даалгаврын Draft үүслээ. Teacher → Даалгавар хэсгээс recipient/deadline тохируулна.';
  });

  // Apply whenever a role/view navigation click happens, and once at startup.
  document.addEventListener('click',e=>{
    if(e.target.closest('[data-view="previousExams"], #accountBtn, [data-role]'))setTimeout(applyTeacherMode,0);
  });
  setTimeout(applyTeacherMode,50);

  window.SmartESHTeacherExamPreviewV49={openTeacherPreview,applyTeacherMode};
})();

// ============================================================
// v50 — FINAL PRODUCTION CLEANUP / ZERO-STATE / CLOUD COUNTS
// ============================================================
(function(){
  const $=id=>document.getElementById(id);
  const RESET='smarteshV50ProductionResetDone';
  const DEMO_KEYS=[
    'smarteshDBv5','smarteshAccountsV41','smarteshQuestionBankV42',
    'smarteshAIReviewQueueV35','smarteshPaperBatchesV44','smarteshAttemptsV43',
    'smarteshPaymentsV45','smarteshEntitlementsV45','smarteshMistakesV37',
    'smarteshSmartPracticeResultsV38','smarteshMixedResultsV29',
    'smarteshPaperResultsV17','smarteshAssignmentsV39','smarteshV14Announcements',
    'smarteshPublishedBatchV36','smarteshQuestionBankV42'
  ];

  function toastV50(text){
    let n=document.getElementById('v50Toast');
    if(!n){n=document.createElement('div');n.id='v50Toast';n.className='v50-toast';document.body.appendChild(n);}
    n.textContent=text;n.classList.add('show');
    clearTimeout(window.__v50toast);window.__v50toast=setTimeout(()=>n.classList.remove('show'),2200);
  }

  function cleanupDemoStorage(){
    if(localStorage.getItem(RESET))return;
    DEMO_KEYS.forEach(k=>localStorage.removeItem(k));
    localStorage.setItem(RESET,new Date().toISOString());
    try{
      if(typeof smartDB!=='undefined'){
        smartDB.users=(smartDB.users||[]).filter(x=>x.cloud);
        smartDB.classes=[];smartDB.assignments=[];smartDB.results=[];
        if(!smartDB.session?.cloud)smartDB.session=null;
        saveDB?.();
      }
    }catch(e){}
  }

  function kpi(section,label,value){
    const root=$(section);if(!root)return;
    [...root.querySelectorAll('.kpi')].forEach(x=>{
      const s=x.querySelector('span'),b=x.querySelector('b');
      if(s&&b&&s.textContent.trim().toLowerCase()===label.toLowerCase())b.textContent=value;
    });
  }

  function zeroState(){
    document.body.classList.add('production-v50');
    kpi('teacher','Assigned this week','0'); kpi('teacher','Students','0');
    kpi('teacher','Exams created','0'); kpi('teacher','Average score','—');
    kpi('admin','Total students','0'); kpi('admin','Teachers','0');
    kpi('admin','Active premium','0'); kpi('admin','Tests this month','0');
    const n=$('sessionName'); if(n && n.textContent.includes('Demo')) n.textContent='Guest';
  }

  async function loadCloudCounts(){
    const sb=window.smarteshSupabase;
    if(!sb)return false;
    let u=null;
    try{u=typeof currentUser==='function'?currentUser():null}catch(e){}
    if(!u?.id)return false;

    try{
      if(u.role==='admin'){
        const [profiles,ents,attempts]=await Promise.all([
          sb.from('profiles').select('role',{count:'exact',head:false}),
          sb.from('entitlements').select('id',{count:'exact',head:true}).eq('status','active'),
          sb.from('attempts').select('id',{count:'exact',head:true})
        ]);
        const rows=profiles.data||[];
        kpi('admin','Total students',String(rows.filter(x=>x.role==='student').length));
        kpi('admin','Teachers',String(rows.filter(x=>x.role==='teacher').length));
        kpi('admin','Active premium',String(ents.count||0));
        kpi('admin','Tests this month',String(attempts.count||0));
      }
      if(u.role==='teacher'){
        const [asg,att]=await Promise.all([
          sb.from('assignments').select('id,created_at'),
          sb.from('attempts').select('student_id,score_percent')
        ]);
        kpi('teacher','Assigned this week',String((asg.data||[]).length));
        const attempts=att.data||[], students=new Set(attempts.map(x=>x.student_id).filter(Boolean));
        kpi('teacher','Students',String(students.size));
        const scores=attempts.map(x=>Number(x.score_percent)).filter(Number.isFinite);
        kpi('teacher','Average score',scores.length?Math.round(scores.reduce((a,b)=>a+b,0)/scores.length)+'%':'—');
      }
      if(u.role==='student'){
        const [att,mis]=await Promise.all([
          sb.from('attempts').select('score_percent,submitted_at').order('submitted_at',{ascending:false}),
          sb.from('mistakes').select('id,topic,status')
        ]);
        const attempts=att.data||[], scores=attempts.map(x=>Number(x.score_percent)).filter(Number.isFinite);
        kpi('student','Average score',scores.length?Math.round(scores.reduce((a,b)=>a+b,0)/scores.length)+'%':'—');
        kpi('student','Completed',String(attempts.length));
        if($('smartLatestScoreV34'))$('smartLatestScoreV34').textContent=scores.length?scores[0]+'%':'—';
        const topics=(mis.data||[]).map(x=>x.topic).filter(Boolean);
        if($('smartWeakTopicV34'))$('smartWeakTopicV34').textContent=topics[0]||'—';
      }
      return true;
    }catch(e){
      console.warn('SmartESH v50 cloud count:',e);
      return false;
    }
  }

  async function loadNotificationsV50(){
    const sb=window.smarteshSupabase,feed=$('notificationFeed');if(!sb||!feed)return;
    try{
      const {data,error}=await sb.from('notifications').select('type,title,body,publish_at,pinned').order('publish_at',{ascending:false}).limit(20);
      if(error)throw error;
      if(!data?.length){feed.innerHTML='<div class="empty-state-v50">Одоогоор мэдэгдэл алга.</div>';return;}
      feed.innerHTML=data.map(n=>`<article class="notification-card" data-type="${n.type||'announcement'}"><div class="notif-icon">📢</div><div><div class="notif-meta"><span>${(n.type||'announcement').toUpperCase()}</span><time>${n.publish_at?new Date(n.publish_at).toLocaleDateString():'—'}</time></div><h3>${esc(n.title||'')}</h3><p>${esc(n.body||'')}</p></div></article>`).join('');
    }catch(e){}
  }

  // No dead-looking controls: known legacy buttons get useful, safe behavior.
  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-v50-fallback="1"]');if(!b)return;
    e.preventDefault();
    const text=b.textContent.trim().toLowerCase();
    if(text.includes('тайлан татах')||text.includes('pdf тайлан')){window.print();return;}
    if(text.includes('start practice')||text==='retry'||text.includes('ажиллах')){
      showView?.('practiceHub');toastV50('Practice хэсэг нээгдлээ.');return;
    }
    if(text.includes('unlock')){showView?.('accountV21');return;}
    if(text.includes('feedback')){toastV50('Сурагчийн бодит үр дүн сонгосны дараа feedback илгээнэ.');return;}
    if(text.includes('edit')){toastV50('Засахын өмнө бодит контент сонгоно уу.');return;}
    if(text.includes('preview')){toastV50('Preview хийх бодит контент одоогоор алга.');return;}
    toastV50('Энэ үйлдэлд бодит өгөгдөл шаардлагатай.');
  });

  // Old sample-bank generator cannot create fabricated EESH content in production.
  $('buildTeacherSet')?.addEventListener('click',e=>{
    e.stopImmediatePropagation();e.preventDefault();
    if($('generatedCount'))$('generatedCount').textContent='0 questions';
    if($('generatedQuestions'))$('generatedQuestions').innerHTML='<div class="empty-state-v50">Published Question Bank одоогоор хоосон байна. Admin бодит асуултаа Publish хийсний дараа эндээс сонгоно.</div>';
    toastV50('Published Question Bank хоосон байна.');
  },true);

  // Fake OMR/demo scan actions are blocked until the actual service exists.
  ['simulateScan','v17AnalyzeBtn'].forEach(id=>{
    $(id)?.addEventListener('click',e=>{
      e.stopImmediatePropagation();e.preventDefault();
      toastV50('OMR scanner backend холбогдоогүй байна. Fake score үүсгэхгүй.');
    },true);
  });

  // Demo payment action stays disabled; browser never grants real premium.
  $('createInvoiceV45')?.addEventListener('click',e=>{
    e.preventDefault();toastV50('QPay merchant backend холбосны дараа invoice үүснэ.');
  },true);

  cleanupDemoStorage();zeroState();
  let tries=0;
  const timer=setInterval(async()=>{
    tries++;
    if(window.smarteshSupabase){
      await loadCloudCounts();await loadNotificationsV50();clearInterval(timer);
    } else if(tries>20) clearInterval(timer);
  },400);

  window.addEventListener('smartesh-auth-changed',()=>setTimeout(loadCloudCounts,100));
  window.SmartESHProductionV50={cleanupDemoStorage,zeroState,loadCloudCounts};
})();

// ============================================================
// v51 — Teacher Class Management
// ============================================================
(function(){
  const $=id=>document.getElementById(id);
  const LOCAL='smarteshClassesV51';
  let selectedClass=null;

  function user(){
    try{return typeof currentUser==='function'?currentUser():null}catch(e){return null}
  }
  function localLoad(){try{return JSON.parse(localStorage.getItem(LOCAL)||'[]')}catch(e){return []}}
  function localSave(x){localStorage.setItem(LOCAL,JSON.stringify(x))}
  function code(){
    const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let s='';for(let i=0;i<6;i++)s+=chars[Math.floor(Math.random()*chars.length)];
    return s;
  }
  function msg(id,text,ok=true){
    const el=$(id);if(!el)return;el.textContent=text;el.style.color=ok?'#1f7a4d':'#9a3c35';
  }
  function open(id){$(id)?.classList.remove('hidden')}
  function close(id){$(id)?.classList.add('hidden')}
  function esc51(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}

  async function cloudClasses(){
    const sb=window.smarteshSupabase,u=user();
    if(!sb||!u?.id||u.role!=='teacher')return null;
    const {data,error}=await sb.from('classes_v51')
      .select('id,name,level,school_year,description,join_code,status,created_at,class_members_v51(count)')
      .eq('teacher_id',u.id).order('created_at',{ascending:false});
    if(error){console.warn('v51 classes cloud:',error.message);return null}
    return data||[];
  }

  async function load(){
    if(user()?.role!=='teacher')return;
    let rows=await cloudClasses();
    let cloud=true;
    if(rows===null){rows=localLoad().filter(x=>x.teacher_id===user()?.id);cloud=false}
    render(rows,cloud);
  }

  function render(rows,cloud){
    const list=$('classListV51');if(!list)return;
    const active=rows.filter(x=>x.status!=='archived');
    const totalStudents=active.reduce((n,x)=>n+Number(x.class_members_v51?.[0]?.count??x.student_count??0),0);
    $('classCountV51').textContent=String(rows.length);
    $('activeClassCountV51').textContent=String(active.length);
    $('classStudentCountV51').textContent=String(totalStudents);
    $('avgStudentsV51').textContent=active.length?String(Math.round(totalStudents/active.length)):'0';
    if(!rows.length){
      list.innerHTML='<div class="empty-state-v50">Одоогоор анги үүсгээгүй байна. “+ Анги үүсгэх” дарж эхэлнэ.</div>';return;
    }
    list.innerHTML='<div class="class-grid-v51">'+rows.map(x=>{
      const count=Number(x.class_members_v51?.[0]?.count??x.student_count??0);
      return `<article class="class-card-v51">
        <div class="class-card-head-v51"><div><small>${esc51(x.school_year||'')}</small><h3>${esc51(x.name)}</h3></div><span class="pill">${x.status==='archived'?'Archived':'Active'}</span></div>
        <p>${esc51(x.level||x.description||'')}</p>
        <div class="class-meta-v51"><span>👥 ${count} сурагч</span><span>Code: <b class="join-code-v51">${esc51(x.join_code)}</b></span></div>
        <button class="secondary-btn" data-open-class-v51="${esc51(x.id)}" data-cloud-v51="${cloud?'1':'0'}">Анги нээх →</button>
      </article>`;
    }).join('')+'</div>';
  }

  async function createClass(){
    const u=user();if(!u||u.role!=='teacher'){msg('classCreateMsgV51','Teacher эрхээр нэвтэрнэ үү.',false);return}
    const name=$('classNameV51')?.value.trim();
    if(!name){msg('classCreateMsgV51','Ангийн нэр оруулна уу.',false);return}
    const row={teacher_id:u.id,name,level:$('classLevelV51')?.value.trim()||null,
      school_year:$('classYearV51')?.value.trim()||null,
      description:$('classDescriptionV51')?.value.trim()||null,join_code:code(),status:'active'};
    const sb=window.smarteshSupabase;
    if(sb){
      for(let i=0;i<5;i++){
        const {data,error}=await sb.from('classes_v51').insert(row).select().single();
        if(!error){
          msg('classCreateMsgV51','✓ Анги үүслээ. Join code: '+data.join_code,true);
          setTimeout(()=>{close('createClassModalV51');clearForm();load()},500);return;
        }
        if(String(error.message).toLowerCase().includes('join_code')){row.join_code=code();continue}
        if(!String(error.message).includes('classes_v51')){msg('classCreateMsgV51',error.message,false);return}
        break;
      }
    }
    // Offline/local fallback so the UI remains usable before migration is run.
    const rows=localLoad();row.id='local-'+Date.now();row.created_at=new Date().toISOString();row.student_count=0;
    rows.unshift(row);localSave(rows);
    msg('classCreateMsgV51','✓ Анги local draft байдлаар үүслээ. Supabase v51 migration ажиллуулбал cloud-д хадгална.',true);
    setTimeout(()=>{close('createClassModalV51');clearForm();load()},700);
  }

  function clearForm(){
    if($('classNameV51'))$('classNameV51').value='';
    if($('classLevelV51'))$('classLevelV51').value='';
    if($('classDescriptionV51'))$('classDescriptionV51').value='';
  }

  async function detail(id,cloud){
    selectedClass={id,cloud};
    if(cloud&&window.smarteshSupabase){
      const sb=window.smarteshSupabase;
      const {data:c,error}=await sb.from('classes_v51').select('*').eq('id',id).single();
      if(error){return}
      const {data:m}=await sb.from('class_members_v51')
        .select('student_id,joined_at,profiles:student_id(full_name)')
        .eq('class_id',id).order('joined_at',{ascending:true});
      showDetail(c,m||[]);
    }else{
      const c=localLoad().find(x=>x.id===id);if(c)showDetail(c,[]);
    }
  }

  function showDetail(c,members){
    $('classDetailTitleV51').textContent=c.name;
    $('classDetailCodeV51').textContent=c.join_code;
    const box=$('classMembersV51');
    box.innerHTML=members.length?members.map((m,i)=>`<div class="class-member-v51"><div><b>${i+1}. ${esc51(m.profiles?.full_name||'Student')}</b><small>${new Date(m.joined_at).toLocaleDateString()}</small></div></div>`).join('')
      :'<div class="empty-state-v50">Одоогоор сурагч нэгдээгүй байна. Join code-оо сурагчдадаа өгнө.</div>';
    open('classDetailModalV51');
  }

  async function archive(){
    if(!selectedClass)return;
    if(selectedClass.cloud&&window.smarteshSupabase){
      const {error}=await window.smarteshSupabase.from('classes_v51').update({status:'archived'}).eq('id',selectedClass.id);
      if(error){msg('classDetailMsgV51',error.message,false);return}
    }else{
      const rows=localLoad(),c=rows.find(x=>x.id===selectedClass.id);if(c)c.status='archived';localSave(rows);
    }
    msg('classDetailMsgV51','✓ Анги архивлагдлаа.',true);setTimeout(()=>{close('classDetailModalV51');load()},500);
  }

  $('openCreateClassV51')?.addEventListener('click',()=>open('createClassModalV51'));
  $('closeCreateClassV51')?.addEventListener('click',()=>close('createClassModalV51'));
  $('cancelCreateClassV51')?.addEventListener('click',()=>close('createClassModalV51'));
  $('saveClassV51')?.addEventListener('click',createClass);
  $('refreshClassesV51')?.addEventListener('click',load);
  $('closeClassDetailV51')?.addEventListener('click',()=>close('classDetailModalV51'));
  $('closeClassDetailBottomV51')?.addEventListener('click',()=>close('classDetailModalV51'));
  $('archiveClassV51')?.addEventListener('click',archive);
  $('copyClassCodeV51')?.addEventListener('click',async()=>{
    const c=$('classDetailCodeV51')?.textContent||'';
    try{await navigator.clipboard.writeText(c);msg('classDetailMsgV51','✓ Join code хууллаа.',true)}
    catch(e){msg('classDetailMsgV51','Join code: '+c,true)}
  });
  $('createClassModalV51')?.addEventListener('click',e=>{if(e.target===e.currentTarget)close('createClassModalV51')});
  $('classDetailModalV51')?.addEventListener('click',e=>{if(e.target===e.currentTarget)close('classDetailModalV51')});
  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-open-class-v51]');if(b)detail(b.dataset.openClassV51,b.dataset.cloudV51==='1');
    if(e.target.closest('[data-view="teacherClassesV51"]'))setTimeout(load,50);
  });
  window.addEventListener('smartesh-auth-changed',()=>setTimeout(load,100));
  window.SmartESHClassesV51={load,createClass};
})();

// ============================================================
// v52 — Teacher Excel Reports
// Class OR selected students • Assignment and Mock exported separately
// Pure XLSX writer: no external CDN/library dependency.
// ============================================================
(function(){
  const $=id=>document.getElementById(id);
  let reportType='assignment';
  let classes=[], members=[], contents=[];

  function currentTeacher(){
    try{return typeof currentUser==='function'?currentUser():null}catch(e){return null}
  }
  function escXml(v){
    return String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&apos;');
  }
  function escHtml(v){
    return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  }
  function msg(text,ok=true){
    const el=$('reportMsgV52');if(!el)return;
    el.textContent=text;el.style.color=ok?'#1f7a4d':'#9a3c35';
  }
  function setPreview(){
    $('reportPreviewTypeV52').textContent=reportType==='assignment'?'Даалгавар':'Mock Test';
    const c=classes.find(x=>x.id===$('reportClassV52')?.value);
    $('reportPreviewClassV52').textContent=c?.name||'—';
    const scope=document.querySelector('input[name="reportScopeV52"]:checked')?.value||'class';
    const n=scope==='class'?members.length:document.querySelectorAll('.report-student-check-v52:checked').length;
    $('reportPreviewStudentsV52').textContent=String(n);
    $('reportPreviewResultsV52').textContent=$('reportContentV52')?.value?'Бэлэн':'Тест сонгоно';
  }

  async function getClasses(){
    const sb=window.smarteshSupabase,u=currentTeacher();
    if(!sb||!u?.id)return [];
    const {data,error}=await sb.from('classes_v51').select('id,name,level,school_year,status')
      .eq('teacher_id',u.id).eq('status','active').order('name');
    if(error){console.warn(error);return []}
    return data||[];
  }
  async function getMembers(classId){
    if(!classId||!window.smarteshSupabase)return [];
    const {data,error}=await window.smarteshSupabase.from('class_members_v51')
      .select('student_id,joined_at,profiles:student_id(id,full_name)')
      .eq('class_id',classId).order('joined_at');
    if(error){console.warn(error);return []}
    return (data||[]).map(x=>({
      id:x.student_id,
      name:x.profiles?.full_name||'Student',
      joined_at:x.joined_at
    }));
  }
  async function getContents(){
    const sb=window.smarteshSupabase,u=currentTeacher();
    if(!sb||!u?.id)return [];
    if(reportType==='assignment'){
      const {data,error}=await sb.from('assignments').select('id,title,source_type,status,deadline,created_at')
        .eq('teacher_id',u.id).order('created_at',{ascending:false});
      if(error){console.warn(error);return []}
      return (data||[]).map(x=>({...x,label:x.title}));
    }
    const {data,error}=await sb.from('exams').select('id,title,exam_type,year,version,duration_minutes,status,created_at')
      .ilike('exam_type','%mock%').eq('status','published').order('created_at',{ascending:false});
    if(error){console.warn(error);return []}
    return (data||[]).map(x=>({...x,label:x.title}));
  }

  async function refreshClasses(){
    classes=await getClasses();
    const sel=$('reportClassV52');
    if(!sel)return;
    sel.innerHTML='<option value="">Анги сонгоно уу</option>'+classes.map(x=>
      `<option value="${escHtml(x.id)}">${escHtml(x.name)}${x.level?' • '+escHtml(x.level):''}</option>`).join('');
    members=[];renderMembers();setPreview();
  }
  async function refreshMembers(){
    members=await getMembers($('reportClassV52')?.value);
    renderMembers();setPreview();
  }
  function renderMembers(){
    const box=$('reportStudentsV52');if(!box)return;
    if(!members.length){box.innerHTML='<div class="empty-state-v50">Энэ ангид одоогоор сурагч алга.</div>';return}
    box.innerHTML=members.map((m,i)=>`<label class="report-student-v52">
      <input class="report-student-check-v52" type="checkbox" value="${escHtml(m.id)}" checked>
      <span>${i+1}. ${escHtml(m.name)}</span>
    </label>`).join('');
    box.querySelectorAll('input').forEach(x=>x.addEventListener('change',setPreview));
  }
  async function refreshContents(){
    contents=await getContents();
    const sel=$('reportContentV52');if(!sel)return;
    const empty=reportType==='assignment'?'Даалгавар сонгоно уу':'Mock Test сонгоно уу';
    sel.innerHTML=`<option value="">${empty}</option>`+contents.map(x=>
      `<option value="${escHtml(x.id)}">${escHtml(x.label)}</option>`).join('');
    setPreview();
  }
  async function openReport(type){
    const u=currentTeacher();
    if(!u||u.role!=='teacher'){return}
    reportType=type;
    $('reportTitleV52').textContent=type==='assignment'?'Даалгаврын Excel тайлан':'Mock Test-ийн Excel тайлан';
    $('reportTypeHintV52').textContent=type==='assignment'
      ?'Сонгосон даалгаврын үр дүнг ангиар эсвэл сонгосон сурагчдаар татна.'
      :'Сонгосон Mock Test-ийн үр дүнг ангиар эсвэл сонгосон сурагчдаар татна.';
    document.querySelectorAll('[data-report-type-v52]').forEach(b=>
      b.classList.toggle('active',b.dataset.reportTypeV52===type));
    $('reportModalV52')?.classList.remove('hidden');
    msg('');
    await Promise.all([refreshClasses(),refreshContents()]);
  }
  function closeReport(){$('reportModalV52')?.classList.add('hidden')}

  function selectedStudentIds(){
    const scope=document.querySelector('input[name="reportScopeV52"]:checked')?.value||'class';
    if(scope==='class')return members.map(x=>x.id);
    return [...document.querySelectorAll('.report-student-check-v52:checked')].map(x=>x.value);
  }

  async function loadReportData(){
    const sb=window.smarteshSupabase;
    const classId=$('reportClassV52')?.value;
    const contentId=$('reportContentV52')?.value;
    const studentIds=selectedStudentIds();
    if(!classId)throw new Error('Анги сонгоно уу.');
    if(!contentId)throw new Error(reportType==='assignment'?'Даалгавар сонгоно уу.':'Mock Test сонгоно уу.');
    if(!studentIds.length)throw new Error('Тайланд оруулах сурагч сонгоно уу.');
    if(!sb)throw new Error('Supabase холболт алга.');

    let q=sb.from('attempts').select(
      'id,student_id,assignment_id,exam_id,channel,status,started_at,submitted_at,score,percentage,score_percent,duration_seconds,answered_count,correct_count,wrong_count,scoring_status'
    ).in('student_id',studentIds);
    q=reportType==='assignment'?q.eq('assignment_id',contentId):q.eq('exam_id',contentId);
    const {data:attempts,error}=await q.order('submitted_at',{ascending:false});
    if(error)throw error;

    const names=new Map(members.map(m=>[m.id,m.name]));
    // Ask profiles too so selected IDs are named correctly even if membership order changes.
    const {data:profiles}=await sb.from('profiles').select('id,full_name').in('id',studentIds);
    (profiles||[]).forEach(p=>names.set(p.id,p.full_name||names.get(p.id)||'Student'));

    const attemptIds=(attempts||[]).map(a=>a.id);
    let answers=[];
    if(attemptIds.length){
      const r=await sb.from('attempt_answers').select(
        'attempt_id,question_id,selected_answer,is_correct,answered_at,answer_key_verified,correct_answer_snapshot,skill_snapshot,topic_snapshot,subtopic_snapshot,flagged'
      ).in('attempt_id',attemptIds);
      if(r.error)throw r.error;
      answers=r.data||[];
    }

    const content=contents.find(x=>x.id===contentId)||{};
    const cls=classes.find(x=>x.id===classId)||{};
    return {studentIds,names,attempts:attempts||[],answers,content,cls};
  }

  function fmtDate(v){
    if(!v)return '';
    try{return new Date(v).toLocaleString('en-GB',{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'})}
    catch(e){return String(v)}
  }
  function percent(a){
    const x=a.score_percent??a.percentage;
    return x==null?'':Number(x);
  }
  function reportMatrices(d){
    const byStudent=new Map();
    d.studentIds.forEach(id=>byStudent.set(id,[]));
    d.attempts.forEach(a=>{
      if(!byStudent.has(a.student_id))byStudent.set(a.student_id,[]);
      byStudent.get(a.student_id).push(a);
    });

    const summary=[[
      'Student','Status','Attempts','Best %','Latest %','Latest Score',
      'Latest Submitted','Latest Channel','Class','Report Type','Test / Assignment'
    ]];
    d.studentIds.forEach(id=>{
      const arr=byStudent.get(id)||[];
      const submitted=arr.filter(a=>a.submitted_at||a.status==='submitted'||a.status==='completed');
      const vals=submitted.map(percent).filter(Number.isFinite);
      const latest=arr[0];
      summary.push([
        d.names.get(id)||'Student',
        arr.length?(latest?.status||'attempted'):'Not started',
        arr.length,
        vals.length?Math.max(...vals):'',
        latest&&Number.isFinite(percent(latest))?percent(latest):'',
        latest?.score??'',
        fmtDate(latest?.submitted_at),
        latest?.channel||'',
        d.cls.name||'',
        reportType==='assignment'?'Assignment':'Mock Test',
        d.content.label||d.content.title||''
      ]);
    });

    const attempts=[[
      'Student','Attempt ID','Status','Channel','Started','Submitted','Score','Percent',
      'Answered','Correct','Wrong','Duration (min)','Scoring Status'
    ]];
    d.attempts.forEach(a=>attempts.push([
      d.names.get(a.student_id)||'Student',a.id,a.status||'',a.channel||'',
      fmtDate(a.started_at),fmtDate(a.submitted_at),a.score??'',
      Number.isFinite(percent(a))?percent(a):'',a.answered_count??'',a.correct_count??'',
      a.wrong_count??'',a.duration_seconds!=null?Math.round(Number(a.duration_seconds)/60*10)/10:'',
      a.scoring_status||''
    ]));

    const attemptOwner=new Map(d.attempts.map(a=>[a.id,a.student_id]));
    const details=[[
      'Student','Attempt ID','Question ID','Skill','Topic','Subtopic',
      'Selected Answer','Correct Answer','Correct?','Flagged','Answered At','Answer Key Verified'
    ]];
    d.answers.forEach(a=>details.push([
      d.names.get(attemptOwner.get(a.attempt_id))||'Student',a.attempt_id,a.question_id||'',
      a.skill_snapshot||'',a.topic_snapshot||'',a.subtopic_snapshot||'',a.selected_answer||'',
      a.answer_key_verified?(a.correct_answer_snapshot||''):'',
      a.is_correct===true?'Yes':a.is_correct===false?'No':'',
      a.flagged?'Yes':'No',fmtDate(a.answered_at),a.answer_key_verified?'Yes':'No'
    ]));

    return {summary,attempts,details};
  }

  // ---- Minimal XLSX generator (ZIP method=store; inline strings) ----
  const te=new TextEncoder();
  const crcTable=(()=>{
    const t=new Uint32Array(256);
    for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=(c&1)?(0xEDB88320^(c>>>1)):(c>>>1);t[n]=c>>>0}
    return t;
  })();
  function crc32(bytes){
    let c=0xFFFFFFFF;
    for(const b of bytes)c=crcTable[(c^b)&255]^(c>>>8);
    return (c^0xFFFFFFFF)>>>0;
  }
  function u16(n){return new Uint8Array([n&255,(n>>>8)&255])}
  function u32(n){return new Uint8Array([n&255,(n>>>8)&255,(n>>>16)&255,(n>>>24)&255])}
  function cat(parts){
    const len=parts.reduce((n,p)=>n+p.length,0),out=new Uint8Array(len);let o=0;
    for(const p of parts){out.set(p,o);o+=p.length}return out;
  }
  function zipStore(files){
    const locals=[],centrals=[];let offset=0;
    const now=new Date(),dosTime=((now.getHours()<<11)|(now.getMinutes()<<5)|(now.getSeconds()>>1))&0xFFFF;
    const dosDate=(((now.getFullYear()-1980)<<9)|((now.getMonth()+1)<<5)|now.getDate())&0xFFFF;
    files.forEach(f=>{
      const name=te.encode(f.name),data=typeof f.data==='string'?te.encode(f.data):f.data,crc=crc32(data),flag=0x0800;
      const local=cat([
        u32(0x04034b50),u16(20),u16(flag),u16(0),u16(dosTime),u16(dosDate),
        u32(crc),u32(data.length),u32(data.length),u16(name.length),u16(0),name,data
      ]);
      locals.push(local);
      const central=cat([
        u32(0x02014b50),u16(20),u16(20),u16(flag),u16(0),u16(dosTime),u16(dosDate),
        u32(crc),u32(data.length),u32(data.length),u16(name.length),u16(0),u16(0),
        u16(0),u16(0),u32(0),u32(offset),name
      ]);
      centrals.push(central);offset+=local.length;
    });
    const centralBlock=cat(centrals);
    const end=cat([u32(0x06054b50),u16(0),u16(0),u16(files.length),u16(files.length),
      u32(centralBlock.length),u32(offset),u16(0)]);
    return new Blob([...locals,centralBlock,end],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
  }
  function colName(n){
    let s='';n++;
    while(n){const r=(n-1)%26;s=String.fromCharCode(65+r)+s;n=Math.floor((n-1)/26)}
    return s;
  }
  function cellXml(v,r,c,header){
    const ref=colName(c)+(r+1),style=header?' s="1"':'';
    if(typeof v==='number'&&Number.isFinite(v))return `<c r="${ref}"${style}><v>${v}</v></c>`;
    const txt=escXml(v==null?'':v);
    return `<c r="${ref}" t="inlineStr"${style}><is><t xml:space="preserve">${txt}</t></is></c>`;
  }
  function sheetXml(matrix){
    const rows=matrix.length,cols=Math.max(1,...matrix.map(r=>r.length));
    const widths=[];
    for(let c=0;c<cols;c++){
      let m=10;for(let r=0;r<Math.min(rows,200);r++)m=Math.max(m,String(matrix[r]?.[c]??'').length+2);
      widths.push(Math.min(38,m));
    }
    const colXml=widths.map((w,i)=>`<col min="${i+1}" max="${i+1}" width="${w}" customWidth="1"/>`).join('');
    const data=matrix.map((row,r)=>`<row r="${r+1}">${row.map((v,c)=>cellXml(v,r,c,r===0)).join('')}</row>`).join('');
    const last=colName(cols-1)+Math.max(1,rows);
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>
<cols>${colXml}</cols><sheetData>${data}</sheetData>
<autoFilter ref="A1:${last}"/></worksheet>`;
  }
  function makeXlsx(sheets){
    const sheetNames=Object.keys(sheets);
    const files=[
      {name:'[Content_Types].xml',data:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
${sheetNames.map((_,i)=>`<Override PartName="/xl/worksheets/sheet${i+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}
</Types>`},
      {name:'_rels/.rels',data:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`},
      {name:'xl/workbook.xml',data:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets>${sheetNames.map((n,i)=>`<sheet name="${escXml(n)}" sheetId="${i+1}" r:id="rId${i+1}"/>`).join('')}</sheets>
</workbook>`},
      {name:'xl/_rels/workbook.xml.rels',data:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
${sheetNames.map((_,i)=>`<Relationship Id="rId${i+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i+1}.xml"/>`).join('')}
<Relationship Id="rId${sheetNames.length+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`},
      {name:'xl/styles.xml',data:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<fonts count="2"><font><sz val="11"/><name val="Aptos"/></font><font><b/><color rgb="FFFFFFFF"/><sz val="11"/><name val="Aptos"/></font></fonts>
<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF17324B"/><bgColor indexed="64"/></patternFill></fill></fills>
<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/></cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`}
    ];
    sheetNames.forEach((n,i)=>files.push({name:`xl/worksheets/sheet${i+1}.xml`,data:sheetXml(sheets[n])}));
    return zipStore(files);
  }
  function safeFile(s){return String(s||'report').replace(/[\\/:*?"<>|]+/g,'-').replace(/\s+/g,'_').slice(0,80)}
  function downloadBlob(blob,name){
    const a=document.createElement('a'),url=URL.createObjectURL(blob);
    a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1500);
  }

  async function download(){
    const btn=$('downloadReportV52');
    try{
      btn.disabled=true;btn.textContent='Бэлтгэж байна...';msg('Бодит үр дүнг ачаалж байна...');
      const d=await loadReportData();
      const m=reportMatrices(d);
      const blob=makeXlsx({'Summary':m.summary,'Attempts':m.attempts,'Question Details':m.details});
      const prefix=reportType==='assignment'?'Assignment':'MockTest';
      const name=`SmartESH_${prefix}_${safeFile(d.content.label||d.content.title)}_${safeFile(d.cls.name)}.xlsx`;
      downloadBlob(blob,name);
      msg(`✓ ${name} татагдлаа. Summary: ${d.studentIds.length} сурагч, Attempts: ${d.attempts.length}.`,true);
    }catch(e){
      msg(e?.message||String(e),false);
    }finally{
      btn.disabled=false;btn.textContent='Excel (.xlsx) татах';
    }
  }

  $('exportAssignmentExcelV52')?.addEventListener('click',()=>openReport('assignment'));
  $('exportMockExcelV52')?.addEventListener('click',()=>openReport('mock'));
  document.querySelectorAll('[data-report-type-v52]').forEach(b=>b.addEventListener('click',async()=>{
    reportType=b.dataset.reportTypeV52;
    document.querySelectorAll('[data-report-type-v52]').forEach(x=>x.classList.toggle('active',x===b));
    $('reportTitleV52').textContent=reportType==='assignment'?'Даалгаврын Excel тайлан':'Mock Test-ийн Excel тайлан';
    await refreshContents();
  }));
  $('closeReportV52')?.addEventListener('click',closeReport);
  $('cancelReportV52')?.addEventListener('click',closeReport);
  $('reportModalV52')?.addEventListener('click',e=>{if(e.target===e.currentTarget)closeReport()});
  $('reportClassV52')?.addEventListener('change',refreshMembers);
  $('reportContentV52')?.addEventListener('change',setPreview);
  document.querySelectorAll('input[name="reportScopeV52"]').forEach(r=>r.addEventListener('change',()=>{
    const selected=r.checked?r.value:document.querySelector('input[name="reportScopeV52"]:checked')?.value;
    $('reportStudentsWrapV52')?.classList.toggle('hidden',selected!=='students');setPreview();
  }));
  $('selectAllStudentsV52')?.addEventListener('click',()=>{
    const boxes=[...document.querySelectorAll('.report-student-check-v52')];
    const all=boxes.length&&boxes.every(x=>x.checked);boxes.forEach(x=>x.checked=!all);
    $('selectAllStudentsV52').textContent=all?'Бүгдийг сонгох':'Сонголт арилгах';setPreview();
  });
  $('downloadReportV52')?.addEventListener('click',download);

  window.SmartESHReportsV52={openReport,download,makeXlsx};
})();

// ============================================================
// v53 — QPay + 365-day Premium (production-ready client)
// ============================================================
(function(){
  const $=id=>document.getElementById(id);
  let pendingPaymentId=null, pendingPlan=null;

  function user(){try{return typeof currentUser==='function'?currentUser():null}catch(e){return null}}
  function money(n){return new Intl.NumberFormat('mn-MN').format(Number(n||0))+'₮'}
  function fmtDate(v){if(!v)return '—';try{return new Date(v).toLocaleDateString('mn-MN')}catch(e){return '—'}}
  function daysLeft(v){if(!v)return null;return Math.max(0,Math.ceil((new Date(v)-new Date())/86400000))}
  function show(id,on=true){$(id)?.classList.toggle('hidden',!on)}
  function err(text){const e=$('v53PaymentError');if(!e)return;e.textContent=text;show('v53PaymentError',true)}
  function clearErr(){show('v53PaymentError',false)}
  async function token(){
    const sb=window.smarteshSupabase;if(!sb)throw new Error('Supabase холболт алга.');
    const {data}=await sb.auth.getSession();
    const t=data?.session?.access_token;if(!t)throw new Error('Эхлээд нэвтэрнэ үү.');
    return t;
  }
  async function api(path,opts={}){
    const t=await token();
    const r=await fetch(path,{...opts,headers:{'Content-Type':'application/json','Authorization':'Bearer '+t,...(opts.headers||{})}});
    const j=await r.json().catch(()=>({}));
    if(!r.ok)throw new Error(j.error||j.message||'Server error');
    return j;
  }

  function applyRole(){
    const u=user();if(!u)return;
    $('v53Name').textContent=u.name||u.full_name||'—';
    $('v53Email').textContent=u.email||'—';
    $('v53RoleBadge').textContent=(u.role||'user').toUpperCase();
    const mismatch=u.role==='teacher'?'student':u.role==='student'?'teacher':null;
    document.querySelectorAll('.v53-buy').forEach(b=>{
      const bad=mismatch&&b.dataset.planV53===mismatch;
      b.disabled=!!bad;
      b.closest('.price-card-v21')?.classList.toggle('role-mismatch-v53',!!bad);
      if(bad)b.textContent='Таны account-д тохирохгүй';
    });
  }

  async function loadEntitlement(){
    const sb=window.smarteshSupabase,u=user();if(!sb||!u?.id)return;
    const {data}=await sb.from('entitlements').select('plan,starts_at,ends_at,status')
      .eq('user_id',u.id).order('ends_at',{ascending:false}).limit(1);
    const x=data?.[0],active=x&&x.status==='active'&&new Date(x.ends_at)>new Date();
    $('v53PlanName').textContent=active?(x.plan==='teacher'?'Teacher Premium':'Student Premium'):'Free';
    $('v53AccessStatus').textContent=active?'Premium':'Free';
    $('v53AccessExpiry').textContent=active?fmtDate(x.ends_at):'—';
    $('v53AccessDays').textContent=active?daysLeft(x.ends_at)+' хоног':'—';
    $('v53AccessText').textContent=active?'Таны Premium эрх идэвхтэй байна.':'Premium эрх идэвхгүй байна.';
    document.querySelectorAll('.price-card-v21').forEach(x=>x.classList.remove('current-plan-v53'));
    if(active)$(x.plan==='teacher'?'v53TeacherPlanCard':'v53StudentPlanCard')?.classList.add('current-plan-v53');
  }

  async function loadHistory(){
    const sb=window.smarteshSupabase,u=user(),host=$('v53PaymentHistory');if(!sb||!u?.id||!host)return;
    const {data,error}=await sb.from('payments').select('id,plan,amount,status,sender_invoice_no,verified_at,created_at')
      .eq('user_id',u.id).order('created_at',{ascending:false}).limit(30);
    if(error){host.innerHTML='<div class="empty-state-v50">Төлбөрийн түүхийг ачаалж чадсангүй.</div>';return}
    if(!data?.length){host.innerHTML='<div class="empty-state-v50">Одоогоор төлбөрийн түүх алга.</div>';return}
    host.innerHTML='<div class="payment-history-row-v53 header"><span>Огноо</span><span>Plan</span><span>Дүн</span><span>Төлөв</span><span>Invoice</span></div>'+
      data.map(p=>`<div class="payment-history-row-v53"><span>${fmtDate(p.created_at)}</span><b>${p.plan||'—'}</b><span>${money(p.amount)}</span><span><span class="payment-badge ${p.status==='paid'?'paid':p.status==='failed'?'failed':'pending'}">${p.status}</span></span><small>${p.sender_invoice_no||'—'}</small></div>`).join('');
  }

  async function start(plan){
    const u=user();
    if(!u){showView?.('auth');return}
    if(u.role!=='admin'&&u.role!==plan){err('Таны account role болон сонгосон plan таарахгүй байна.');return}
    pendingPlan=plan;clearErr();
    $('v53CheckoutPlan').textContent=plan==='teacher'?'Teacher Premium':'Student Premium';
    $('v53CheckoutAmount').textContent=money(plan==='teacher'?20000:10000);
    show('v53PaymentEmpty',false);show('v53Checkout',true);show('v53QpayLoading',true);show('v53Invoice',false);
    try{
      const j=await api('/api/qpay-create-invoice',{method:'POST',body:JSON.stringify({plan})});
      pendingPaymentId=j.payment_id;
      $('v53InvoiceAmount').textContent=money(j.amount);
      $('v53InvoiceNo').textContent=j.sender_invoice_no||'';
      $('v53InvoiceStatus').textContent='Төлбөр хүлээж байна';
      $('v53InvoiceStatus').className='payment-badge pending';
      const img=$('v53QrImage'),fb=$('v53QrFallback');
      if(j.qr_image){
        img.src=j.qr_image.startsWith('data:')?j.qr_image:'data:image/png;base64,'+j.qr_image;
        show('v53QrImage',true);show('v53QrFallback',false);
      }else{show('v53QrImage',false);show('v53QrFallback',true)}
      const links=Array.isArray(j.urls)?j.urls:[];
      $('v53BankLinks').innerHTML=links.map(x=>`<a class="qpay-bank-link-v53" href="${String(x.link||'#').replace(/"/g,'&quot;')}" target="_blank" rel="noopener">${x.logo?`<img src="${String(x.logo).replace(/"/g,'&quot;')}" alt="">`:''}<span>${x.name||x.description||'Bank app'}</span></a>`).join('');
      show('v53QpayLoading',false);show('v53Invoice',true);
      await loadHistory();
    }catch(e){
      show('v53QpayLoading',false);err(e.message);
    }
  }

  async function check(){
    if(!pendingPaymentId)return;
    const b=$('v53CheckPayment');b.disabled=true;b.textContent='Шалгаж байна...';clearErr();
    try{
      const j=await api('/api/qpay-payment-status',{method:'POST',body:JSON.stringify({payment_id:pendingPaymentId})});
      if(j.status==='paid'){
        $('v53InvoiceStatus').textContent='Төлбөр баталгаажлаа ✓';
        $('v53InvoiceStatus').className='payment-badge paid';
        b.textContent='Premium идэвхжлээ';
        await Promise.all([loadEntitlement(),loadHistory()]);
      }else{
        $('v53InvoiceStatus').textContent='Төлбөр хүлээж байна';
        b.textContent='Төлбөр шалгах';b.disabled=false;
      }
    }catch(e){err(e.message);b.textContent='Төлбөр шалгах';b.disabled=false}
  }

  async function adminStatus(){
    if(user()?.role!=='admin')return;
    try{
      const r=await fetch('/api/qpay-config-status',{headers:{'Authorization':'Bearer '+await token()}});
      const j=await r.json();
      const vals=[j.client_id,j.client_secret,j.invoice_code,j.service_role];
      document.querySelectorAll('#v53IntegrationChecklist b').forEach((b,i)=>{b.textContent=vals[i]?'✓ Configured':'Missing';b.className=vals[i]?'ok':'missing'});
      $('v53AdminQpayStatus').textContent=j.ready?'Ready':'Setup needed';
    }catch(e){}
  }
  async function adminPayments(){
    if(user()?.role!=='admin'||!window.smarteshSupabase)return;
    const host=$('paymentRegistryV45');if(!host)return;
    let q=window.smarteshSupabase.from('payments').select('id,user_id,plan,amount,status,sender_invoice_no,verified_at,created_at,profiles:user_id(full_name,email)')
      .order('created_at',{ascending:false}).limit(100);
    const s=$('v53AdminPaymentStatus')?.value;if(s)q=q.eq('status',s);
    const {data,error}=await q;
    if(error){host.innerHTML='<div class="empty-state-v50">Payment registry ачаалж чадсангүй.</div>';return}
    const term=($('v53AdminPaymentSearch')?.value||'').trim().toLowerCase();
    const rows=(data||[]).filter(x=>!term||String(x.sender_invoice_no||'').toLowerCase().includes(term)||String(x.profiles?.email||'').toLowerCase().includes(term));
    if(!rows.length){host.innerHTML='<div class="empty-state-v50">Төлбөрийн record алга.</div>';return}
    host.innerHTML='<div class="payment-history-row-v53 header"><span>Хэрэглэгч</span><span>Plan</span><span>Дүн</span><span>Төлөв</span><span>Invoice</span></div>'+
      rows.map(p=>`<div class="payment-history-row-v53"><span><b>${p.profiles?.full_name||'—'}</b><small>${p.profiles?.email||''}</small></span><span>${p.plan||'—'}</span><span>${money(p.amount)}</span><span><span class="payment-badge ${p.status==='paid'?'paid':p.status==='failed'?'failed':'pending'}">${p.status}</span></span><small>${p.sender_invoice_no||'—'}</small></div>`).join('');
  }

  document.querySelectorAll('.v53-buy').forEach(b=>b.addEventListener('click',()=>start(b.dataset.planV53)));
  $('v53CheckPayment')?.addEventListener('click',check);
  $('v53CancelCheckout')?.addEventListener('click',()=>{show('v53Checkout',false);show('v53PaymentEmpty',true)});
  $('v53RefreshPayments')?.addEventListener('click',()=>Promise.all([loadHistory(),loadEntitlement()]));
  $('v53AdminRefreshPayments')?.addEventListener('click',adminPayments);
  $('v53AdminPaymentStatus')?.addEventListener('change',adminPayments);
  $('v53AdminPaymentSearch')?.addEventListener('input',()=>{clearTimeout(window.__v53p);window.__v53p=setTimeout(adminPayments,250)});
  document.addEventListener('click',e=>{
    if(e.target.closest('[data-view="accountV21"]'))setTimeout(()=>{applyRole();loadEntitlement();loadHistory()},80);
    if(e.target.closest('[data-view="qpayPremiumV45"]'))setTimeout(()=>{adminStatus();adminPayments()},80);
  });
  window.addEventListener('smartesh-auth-changed',()=>setTimeout(()=>{applyRole();loadEntitlement();loadHistory()},100));
  setTimeout(()=>{applyRole();loadEntitlement();loadHistory()},300);
  window.SmartESHPaymentV53={start,check,loadEntitlement,loadHistory};
})();

// ============================================================
// v56 — Student joins Teacher class by secure join code
// ============================================================
(function(){
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  function user(){try{return typeof currentUser==='function'?currentUser():null}catch(e){return null}}
  function msg(text,ok=true){const e=$('studentJoinMsgV56');if(!e)return;e.textContent=text;e.style.color=ok?'#1f7a4d':'#9a3c35'}
  async function load(){
    const box=$('studentClassesV56'),sb=window.smarteshSupabase,u=user();
    if(!box||u?.role!=='student')return;
    if(!sb){box.innerHTML='<div class="empty-state-v50">Cloud холболт шаардлагатай.</div>';return}
    const {data:members,error}=await sb.from('class_members_v51').select('class_id,joined_at').eq('student_id',u.id).order('joined_at',{ascending:false});
    if(error){box.innerHTML='<div class="empty-state-v50">'+esc(error.message)+'</div>';return}
    if(!members?.length){box.innerHTML='<div class="empty-state-v50">Одоогоор ангид нэгдээгүй байна.</div>';return}
    const ids=members.map(x=>x.class_id);
    const {data:classes,error:ce}=await sb.from('classes_v51').select('id,name,level,school_year,status').in('id',ids);
    if(ce){box.innerHTML='<div class="empty-state-v50">'+esc(ce.message)+'</div>';return}
    const map=new Map((classes||[]).map(x=>[x.id,x]));
    box.innerHTML='<div class="student-class-list-v56">'+members.map(m=>{const c=map.get(m.class_id);return c?`<div class="student-class-item-v56"><div><b>${esc(c.name)}</b><small>${esc(c.level||'')}${c.school_year?' • '+esc(c.school_year):''}</small></div><button class="secondary-btn" data-leave-class-v56="${esc(c.id)}">Ангиас гарах</button></div>`:''}).join('')+'</div>';
  }
  async function join(){
    const sb=window.smarteshSupabase,u=user(),input=$('studentJoinCodeV56');
    if(!u||u.role!=='student'){msg('Student эрхээр нэвтэрнэ үү.',false);return}
    if(!sb){msg('Supabase cloud холболт алга.',false);return}
    const code=(input?.value||'').trim().toUpperCase();
    if(!/^[A-Z0-9]{6}$/.test(code)){msg('6 тэмдэгт join code оруулна уу.',false);return}
    const {error}=await sb.rpc('join_class_v51',{p_join_code:code});
    if(error){msg(error.message.includes('Invalid')?'Join code буруу эсвэл анги идэвхгүй байна.':error.message,false);return}
    input.value='';msg('✓ Ангид амжилттай нэгдлээ.',true);await load();
  }
  async function leave(id){
    const sb=window.smarteshSupabase,u=user();if(!sb||!u?.id)return;
    if(!confirm('Энэ ангиас гарах уу?'))return;
    const {error}=await sb.from('class_members_v51').delete().eq('class_id',id).eq('student_id',u.id);
    if(error){msg(error.message,false);return}msg('✓ Ангиас гарлаа.',true);await load();
  }
  $('joinClassV56')?.addEventListener('click',join);
  $('studentJoinCodeV56')?.addEventListener('keydown',e=>{if(e.key==='Enter')join()});
  $('refreshStudentClassesV56')?.addEventListener('click',load);
  document.addEventListener('click',e=>{const b=e.target.closest('[data-leave-class-v56]');if(b)leave(b.dataset.leaveClassV56);if(e.target.closest('[data-view="studentHomeV16"]'))setTimeout(load,60)});
  window.addEventListener('smartesh-auth-changed',()=>setTimeout(load,100));
  window.SmartESHStudentClassV56={load,join};
})();

// ---- SmartESH v57: Real Teacher → Student Assignment Flow ----
(()=>{
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  let draftItems=[]; let activeRun=null; let runAnswers={};
  const sb=()=>window.smarteshSupabase;
  async function authUser(){ const x=sb(); if(!x)return null; const {data}=await x.auth.getUser(); return data?.user||null; }
  async function profile(){ const u=await authUser(); if(!u)return null; const {data}=await sb().from('profiles').select('id,role,full_name').eq('id',u.id).maybeSingle(); return data||null; }
  function toast57(text,ok=true){let n=$('#v57Toast');if(!n){n=document.createElement('div');n.id='v57Toast';n.className='v47-toast';document.body.appendChild(n)}n.textContent=text;n.hidden=false;n.style.background=ok?'#13233f':'#8b1e1e';clearTimeout(window.__v57t);window.__v57t=setTimeout(()=>n.hidden=true,2600)}

  function injectTeacher(){
    const sec=$('#teacherAssignments .section-wrap'); if(!sec||$('#v57TeacherFlow'))return;
    const box=document.createElement('div');box.id='v57TeacherFlow';box.className='panel v57-shell';
    box.innerHTML=`<div class="panel-head"><div><span class="eyebrow">v57 • REAL ASSIGNMENT FLOW</span><h2>Ангидаа бодит даалгавар өгөх</h2><p>Асуулт үүсгэх → анги сонгох → сурагчдад өгөх → submit/оноо хянах.</p></div><span class="pill free">Supabase</span></div>
    <div class="v57-grid"><div>
      <div class="v57-form-row"><label class="bank-label">Даалгаврын нэр<input id="v57Title" placeholder="Grammar homework 1"></label><label class="bank-label">Анги<select id="v57Class"><option value="">Анги сонгоно уу</option></select></label></div>
      <div class="v57-form-row"><label class="bank-label">Skill<select id="v57Skill"><option>Grammar</option><option>Vocabulary</option><option>Communication</option><option>Reading</option><option>Mixed</option></select></label><label class="bank-label">Topic<input id="v57Topic" placeholder="e.g. Conditionals"></label></div>
      <div class="v57-form-row"><label class="bank-label">Deadline<input id="v57Deadline" type="datetime-local"></label><label class="bank-label">Хугацаа (мин)<input id="v57Minutes" type="number" min="1" max="180" value="20"></label></div>
      <label class="bank-label">Заавар<textarea id="v57Instructions" rows="2" placeholder="Choose the best answer."></textarea></label>
      <hr><h3>Асуулт нэмэх</h3><label class="bank-label">Question<textarea id="v57Body" rows="2" placeholder="If I ___ more time, I would travel more."></textarea></label>
      <div class="v57-form-row"><label class="bank-label">A<input id="v57A"></label><label class="bank-label">B<input id="v57B"></label></div><div class="v57-form-row"><label class="bank-label">C<input id="v57C"></label><label class="bank-label">D<input id="v57D"></label></div>
      <div class="v57-form-row"><label class="bank-label">Зөв хариу<select id="v57Correct"><option>A</option><option>B</option><option>C</option><option>D</option></select></label><label class="bank-label">Тайлбар<input id="v57Explanation" placeholder="Optional explanation"></label></div>
      <div class="v57-builder-actions"><button class="secondary-btn" id="v57AddItem">+ Асуулт нэмэх</button><button class="primary-btn" id="v57Assign">Ангидаа өгөх</button></div><div id="v57BuildMsg" class="form-message"></div>
      <div class="v57-q-list" id="v57DraftItems"></div>
    </div><div><div class="panel-head"><h3>Сүүлийн даалгавар & явц</h3><button class="secondary-btn small" id="v57RefreshTeacher">Шинэчлэх</button></div><div id="v57TeacherResults" class="v57-student-list"><div class="v57-mini">Өгөгдөл уншиж байна…</div></div></div></div>`;
    sec.prepend(box); bindTeacher(); loadClasses(); renderDraft(); refreshTeacher();
  }
  function injectStudent(){
    const sec=$('#assignmentsPlus'); if(!sec||$('#v57StudentFlow'))return;
    sec.innerHTML=`<div class="page-head"><span class="eyebrow">STUDENT • ASSIGNMENTS</span><h1>Миний даалгавар</h1><p>Багшийн өгсөн даалгаврыг ажиллаж, submit хийсний дараа оноогоо харна.</p></div><div class="section-wrap"><div class="panel v57-shell" id="v57StudentFlow"><div class="panel-head"><div><h2>Идэвхтэй ба дууссан</h2><p>Supabase-аас таны бодит даалгавруудыг уншина.</p></div><button class="secondary-btn" id="v57RefreshStudent">Шинэчлэх</button></div><div id="v57StudentAssignments" class="v57-student-list"><div class="v57-mini">Өгөгдөл уншиж байна…</div></div></div></div>`;
    $('#v57RefreshStudent')?.addEventListener('click',refreshStudent); refreshStudent();
  }
  function ensureRunner(){ if($('#v57Runner'))return; const m=document.createElement('div');m.id='v57Runner';m.className='v57-runner hidden';m.innerHTML=`<div class="v57-runner-card"><div class="v57-runner-head"><div><span class="eyebrow">ASSIGNMENT RUNNER</span><h2 id="v57RunTitle">Assignment</h2><small id="v57RunMeta"></small></div><button class="secondary-btn" id="v57CloseRun">×</button></div><div id="v57RunBody"></div><div class="form-actions"><button class="secondary-btn" id="v57Prev">← Previous</button><button class="primary-btn" id="v57Next">Next →</button><button class="primary-btn hidden" id="v57Submit">Submit</button></div></div>`;document.body.appendChild(m);$('#v57CloseRun').onclick=()=>m.classList.add('hidden');$('#v57Prev').onclick=()=>{if(activeRun&&activeRun.index>0){activeRun.index--;renderRun()}};$('#v57Next').onclick=()=>{if(activeRun&&activeRun.index<activeRun.items.length-1){activeRun.index++;renderRun()}};$('#v57Submit').onclick=submitRun; }
  function renderDraft(){const h=$('#v57DraftItems');if(!h)return;h.innerHTML=draftItems.length?draftItems.map((q,i)=>`<div class="v57-q-card"><header><b>Q${i+1}</b><button class="secondary-btn small" data-v57-del="${i}">Устгах</button></header><p>${esc(q.body)}</p><div class="v57-mini">A ${esc(q.options[0].body)} • B ${esc(q.options[1].body)} • C ${esc(q.options[2].body)} • D ${esc(q.options[3].body)} • Correct: ${esc(q.correct)}</div></div>`).join(''):'<div class="v57-notice">Эхлээд дор хаяж 1 асуулт нэмнэ.</div>'; $$('[data-v57-del]').forEach(b=>b.onclick=()=>{draftItems.splice(+b.dataset.v57Del,1);renderDraft()}); }
  function bindTeacher(){
    $('#v57AddItem').onclick=()=>{const body=$('#v57Body').value.trim(), vals=['A','B','C','D'].map(k=>$('#v57'+k).value.trim());if(!body||vals.some(x=>!x)){toast57('Асуулт болон A–D сонголтыг бүрэн оруулна уу.',false);return}draftItems.push({body,options:['A','B','C','D'].map((l,i)=>({label:l,body:vals[i]})),correct:$('#v57Correct').value,explanation:$('#v57Explanation').value.trim()});['Body','A','B','C','D','Explanation'].forEach(k=>$('#v57'+k).value='');renderDraft()};
    $('#v57Assign').onclick=createAssignment; $('#v57RefreshTeacher').onclick=refreshTeacher;
  }
  async function loadClasses(){const p=await profile();if(!p||p.role!=='teacher')return;const {data,error}=await sb().from('classes_v51').select('id,name,level').eq('teacher_id',p.id).eq('status','active').order('created_at',{ascending:false});const s=$('#v57Class');if(!s)return;if(error){s.innerHTML='<option value="">Анги уншиж чадсангүй</option>';return}s.innerHTML='<option value="">Анги сонгоно уу</option>'+((data||[]).map(c=>`<option value="${c.id}">${esc(c.name)}${c.level?' • '+esc(c.level):''}</option>`).join(''));}
  async function createAssignment(){
    const p=await profile(); if(!p||p.role!=='teacher'){toast57('Teacher account-аар нэвтэрнэ үү.',false);return}
    const title=$('#v57Title').value.trim(),classId=$('#v57Class').value;if(!title||!classId||!draftItems.length){toast57('Нэр, анги, дор хаяж 1 асуулт шаардлагатай.',false);return}
    const btn=$('#v57Assign');btn.disabled=true;btn.textContent='Өгөж байна…';
    try{
      const {data:members,error:me}=await sb().from('class_members_v51').select('student_id').eq('class_id',classId);if(me)throw me;if(!members?.length)throw new Error('Энэ ангид сурагч алга.');
      const payload={teacher_id:p.id,title,source_type:'teacher_manual_v57',deadline:$('#v57Deadline').value?new Date($('#v57Deadline').value).toISOString():null,status:'assigned',class_id_v57:classId,instructions_v57:$('#v57Instructions').value.trim()||null,duration_minutes_v57:+($('#v57Minutes').value||20),topic_v57:$('#v57Topic').value.trim()||null,skill_v57:$('#v57Skill').value};
      const {data:a,error:ae}=await sb().from('assignments').insert(payload).select('id').single();if(ae)throw ae;
      const items=draftItems.map((q,i)=>({assignment_id:a.id,position:i+1,body:q.body,options:q.options,correct_answer:q.correct,explanation:q.explanation||null,skill:payload.skill_v57,topic:payload.topic_v57,points:1}));const {error:ie}=await sb().from('assignment_items_v57').insert(items);if(ie)throw ie;
      const targets=members.map(m=>({assignment_id:a.id,student_id:m.student_id,status:'assigned'}));const {error:te}=await sb().from('assignment_targets').insert(targets);if(te)throw te;
      toast57(`✓ ${members.length} сурагчид даалгавар өглөө.`);draftItems=[];renderDraft();$('#v57Title').value='';refreshTeacher();
    }catch(e){console.error(e);toast57(e.message||'Даалгавар өгөхөд алдаа гарлаа.',false)}finally{btn.disabled=false;btn.textContent='Ангидаа өгөх'}
  }
  async function refreshTeacher(){const host=$('#v57TeacherResults');if(!host)return;const p=await profile();if(!p||p.role!=='teacher'){host.innerHTML='<div class="v57-notice">Teacher account-аар нэвтэрсний дараа үр дүн харагдана.</div>';return}const {data:asgs,error}=await sb().from('assignments').select('id,title,deadline,status,created_at').eq('teacher_id',p.id).in('source_type',['teacher_manual_v57','pdf_import_v75']).order('created_at',{ascending:false}).limit(8);if(error){host.innerHTML=`<div class="v57-error">${esc(error.message)}</div>`;return}if(!asgs?.length){host.innerHTML='<div class="v57-notice">Одоогоор v57 даалгавар алга.</div>';return}let html='';for(const a of asgs){const {data:t}=await sb().from('assignment_targets').select('student_id,status').eq('assignment_id',a.id);const ids=(t||[]).map(x=>x.student_id);let names={};if(ids.length){const {data:ps}=await sb().from('profiles').select('id,full_name').in('id',ids);(ps||[]).forEach(x=>names[x.id]=x.full_name||x.id.slice(0,8))}const {data:ats}=await sb().from('attempts').select('student_id,score,percentage,score_percent,status,submitted_at').eq('assignment_id',a.id);const amap={};(ats||[]).forEach(x=>amap[x.student_id]=x);html+=`<div class="v57-q-card"><header><div><b>${esc(a.title)}</b><div class="v57-mini">${t?.length||0} students • ${a.deadline?'Due '+new Date(a.deadline).toLocaleString(): 'No deadline'}</div></div><span class="v57-status">${esc(a.status)}</span></header><table class="v57-result-table"><tr><th>Сурагч</th><th>Төлөв</th><th>Оноо</th></tr>${(t||[]).map(x=>{const at=amap[x.student_id];return `<tr><td>${esc(names[x.student_id]||x.student_id.slice(0,8))}</td><td>${esc(x.status)}</td><td>${at&&at.submitted_at?`${Math.round(Number(at.score_percent??at.percentage??0))}%`:'—'}</td></tr>`}).join('')}</table></div>`}host.innerHTML=html;}
  async function refreshStudent(){const host=$('#v57StudentAssignments');if(!host)return;const p=await profile();if(!p||p.role!=='student'){host.innerHTML='<div class="v57-notice">Student account-аар нэвтэрсний дараа даалгавар харагдана.</div>';return}const {data:targets,error}=await sb().from('assignment_targets').select('assignment_id,status,assignments(id,title,deadline,status,instructions_v57,duration_minutes_v57,topic_v57,skill_v57,source_type)').eq('student_id',p.id).order('assignment_id',{ascending:false});if(error){host.innerHTML=`<div class="v57-error">${esc(error.message)}</div>`;return}const rows=(targets||[]).filter(x=>['teacher_manual_v57','pdf_import_v75'].includes(x.assignments?.source_type));if(!rows.length){host.innerHTML='<div class="v57-notice">Одоогоор багшаас ирсэн даалгавар алга.</div>';return}host.innerHTML=rows.map(x=>{const a=x.assignments;return `<div class="v57-student-card"><div><b>${esc(a.title)}</b><div class="v57-mini">${esc(a.skill_v57||'')} ${a.topic_v57?'• '+esc(a.topic_v57):''} ${a.deadline?'• Due '+new Date(a.deadline).toLocaleString():''}</div><small>${esc(a.instructions_v57||'')}</small></div><div><span class="v57-status ${esc(x.status)}">${esc(x.status)}</span><br><button class="${x.status==='submitted'?'secondary-btn':'primary-btn'} small" data-v57-start="${a.id}" ${x.status==='submitted'?'disabled':''}>${x.status==='submitted'?'Submitted':'Эхлэх'}</button></div></div>`}).join('');$$('[data-v57-start]').forEach(b=>b.onclick=()=>startRun(b.dataset.v57Start));}
  async function startRun(id){ensureRunner();const p=await profile();if(!p||p.role!=='student')return;const {data:a,error:ae}=await sb().from('assignments').select('*').eq('id',id).single();if(ae){toast57(ae.message,false);return}const {data:items,error:ie}=await sb().rpc('get_assignment_items_v75',{p_assignment_id:id});if(ie||!items?.length){toast57(ie?.message||'Асуулт алга.',false);return}let {data:atts}=await sb().from('attempts').select('*').eq('assignment_id',id).eq('student_id',p.id).order('started_at',{ascending:false}).limit(1);let attempt=atts?.[0];if(!attempt){const {data:newAt,error}=await sb().from('attempts').insert({student_id:p.id,assignment_id:id,channel:'digital',status:'in_progress',started_at:new Date().toISOString(),scoring_status:'pending'}).select('*').single();if(error){toast57(error.message,false);return}attempt=newAt;await sb().from('assignment_targets').update({status:'started'}).eq('assignment_id',id).eq('student_id',p.id)}activeRun={assignment:a,items,attempt,index:0,student:p};runAnswers={};const {data:old}=await sb().from('assignment_responses_v57').select('item_id,selected_answer').eq('attempt_id',attempt.id);(old||[]).forEach(r=>runAnswers[r.item_id]=r.selected_answer);$('#v57Runner').classList.remove('hidden');renderRun();}
  function renderRun(){const r=activeRun;if(!r)return;const q=r.items[r.index];$('#v57RunTitle').textContent=r.assignment.title;$('#v57RunMeta').textContent=`Question ${r.index+1}/${r.items.length} • ${r.assignment.duration_minutes_v57||'—'} min`;const opts=Array.isArray(q.options)?q.options:[];$('#v57RunBody').innerHTML=`<div class="v57-q-card"><h3>${esc(q.body)}</h3>${opts.map(o=>`<label class="v57-option"><input type="radio" name="v57ans" value="${esc(o.label)}" ${runAnswers[q.id]===o.label?'checked':''}><b>${esc(o.label)}.</b> ${esc(o.body)}</label>`).join('')}</div>`;$$('input[name="v57ans"]').forEach(x=>x.onchange=()=>{runAnswers[q.id]=x.value});$('#v57Prev').disabled=r.index===0;$('#v57Next').classList.toggle('hidden',r.index===r.items.length-1);$('#v57Submit').classList.toggle('hidden',r.index!==r.items.length-1);}
  async function submitRun(){const r=activeRun;if(!r)return;if(!confirm('Даалгавраа submit хийх үү?'))return;const {data,error}=await sb().rpc('submit_assignment_v75',{p_assignment_id:r.assignment.id,p_attempt_id:r.attempt.id,p_answers:runAnswers});if(error){toast57(error.message,false);return}const out=typeof data==='string'?JSON.parse(data):data;const correct=Number(out?.correct||0),pct=Number(out?.percentage||0),review=out?.review||[];try{const exact=(out?.mistakes||[]).map(x=>({id:`v75-${r.attempt.id}-${x.item_id}`,skill:x.skill||r.assignment.skill_v57||'Mixed',topic:x.topic||r.assignment.topic_v57||'Assignment',source:r.assignment.title,question:x.body,selected:x.selected||'—',correct:x.correct,explanation:x.explanation||'Review the correct answer and try a similar question.',status:'new'}));if(exact.length&&window.SmartESHDataV37)window.SmartESHDataV37.addMistakes(exact)}catch(e){console.warn('v75 local mistake sync',e)}$('#v57RunBody').innerHTML=`<div class="v57-result-box"><h2>Оноо: ${correct}/${r.items.length} (${pct}%)</h2><p>${pct>=80?'Сайн байна.':'Алдсан асуултуудаа Mistake Notebook-оос давтаарай.'}</p><table class="v57-result-table"><tr><th>#</th><th>Your answer</th><th>Correct</th></tr>${review.map((q,i)=>`<tr><td>${i+1}</td><td>${esc(q.selected||'—')}</td><td>${esc(q.correct||'—')}</td></tr>`).join('')}</table></div>`;$('#v57Prev').classList.add('hidden');$('#v57Next').classList.add('hidden');$('#v57Submit').classList.add('hidden');toast57('✓ Submit амжилттай. Server-side score хадгалагдлаа.');refreshStudent();}

  function boot(){injectTeacher();injectStudent();ensureRunner();document.addEventListener('click',e=>{const v=e.target.closest('[data-view]')?.dataset.view;if(v==='teacherAssignments')setTimeout(()=>{injectTeacher();loadClasses();refreshTeacher()},60);if(v==='assignmentsPlus')setTimeout(()=>{injectStudent();refreshStudent()},60)},true)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();


// ============================================================
// SmartESH v58 — Production UX Pack
// Paper intake + Next Best Action + notifications + mock resume + teacher action center
// ============================================================
(function(){
 const $=id=>document.getElementById(id), esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const toast=m=>window.toastV50?window.toastV50(m):alert(m);

 // 1) Paper scanner: real file intake only. No synthetic OMR, no synthetic score.
 const files=$('psFilesV58'), queue=$('psUploadQueueV58');
 function renderPaperFiles(){
   const list=[...(files?.files||[])];
   if(!queue)return;
   queue.innerHTML=list.length?list.map((f,i)=>`<div class="v58-file-row"><b>${i+1}. ${esc(f.name)}</b><span>${Math.ceil(f.size/1024)} KB</span><em>Queued • awaiting OMR</em></div>`).join(''):'<div class="empty-state-v50">Файл сонгоогүй байна.</div>';
   if($('psScanStatusV44'))$('psScanStatusV44').innerHTML=`<div><small>Uploaded</small><b>${list.length}</b></div><div><small>Need review</small><b>—</b></div><div><small>Confirmed</small><b>0</b></div>`;
 }
 files?.addEventListener('change',renderPaperFiles);
 $('psClearV58')?.addEventListener('click',()=>{if(files)files.value='';renderPaperFiles();if($('psStudentResultsV44'))$('psStudentResultsV44').innerHTML='Teacher баталгаажуулсан scan үр дүн энд гарна.';});
 $('psGenerateSheetV58')?.addEventListener('click',()=>{
   const key=($('psAnswerKeyV44')?.value||'').trim();
   const n=(key.match(/\d+\s*[-:=]\s*[A-E]/gi)||[]).length||50;
   const title=$('psBatchNameV44')?.value.trim()||'SmartESH Paper Test';
   const w=window.open('','_blank'); if(!w){toast('Popup blocked байна. Browser popup зөвшөөрнө үү.');return;}
   const rows=Array.from({length:n},(_,i)=>`<div class="q"><b>${i+1}</b>${['A','B','C','D','E'].map(x=>`<span>${x}</span>`).join('')}</div>`).join('');
   w.document.write(`<!doctype html><html><head><title>Answer Sheet</title><style>@page{size:A4;margin:10mm}body{font-family:Arial;color:#111}.head{display:flex;justify-content:space-between;border-bottom:2px solid #111;padding-bottom:8px}.fields{margin:12px 0;display:grid;grid-template-columns:1fr 1fr;gap:10px}.field{border-bottom:1px solid #555;padding:8px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:3px 24px}.q{display:grid;grid-template-columns:28px repeat(5,1fr);align-items:center;padding:3px;border-bottom:1px solid #ddd}.q span{border:1.5px solid #111;border-radius:50%;width:22px;height:22px;text-align:center;line-height:22px;font-size:11px}.marks{display:flex;justify-content:space-between}.mark{width:18px;height:18px;background:#000}.note{font-size:11px;margin-top:10px}@media print{button{display:none}}</style></head><body><div class="marks"><i class="mark"></i><i class="mark"></i></div><div class="head"><div><h2>SmartESH Answer Sheet</h2><b>${esc(title)}</b></div><div>Questions: ${n}</div></div><div class="fields"><div class="field">Нэр: ____________________</div><div class="field">Student ID: ____________________</div><div class="field">Анги: ____________________</div><div class="field">Test ID: ____________________</div></div><div class="grid">${rows}</div><p class="note">Нэг асуултад зөвхөн нэг дугуйг бүтэн будна. Хуудасны 4 булангийн marker-ийг бүү дар.</p><div class="marks"><i class="mark"></i><i class="mark"></i></div><button onclick="print()">Print / PDF</button></body></html>`);w.document.close();
 });

 // 2) Student next-best-action from real attempts + mistakes.
 async function nextBest(){
   const sb=window.smarteshSupabase,u=window.smarteshAuthUser;if(!sb||!u||u.role!=='student')return;
   try{
     const [a,m]=await Promise.all([sb.from('attempts').select('percentage,score,submitted_at').eq('student_id',u.id).order('submitted_at',{ascending:false}).limit(5),sb.from('mistakes').select('topic,status').eq('student_id',u.id).neq('status','mastered').limit(100)]);
     const ms=m.data||[], freq={};ms.forEach(x=>{if(x.topic)freq[x.topic]=(freq[x.topic]||0)+1});
     const weak=Object.entries(freq).sort((x,y)=>y[1]-x[1])[0];
     const latest=(a.data||[])[0], pct=Number(latest?.percentage??latest?.score);
     if($('smartWeakTopicV34'))$('smartWeakTopicV34').textContent=weak?.[0]||(!Number.isNaN(pct)&&pct<70?'Mixed review':'Practice');
     if($('smartNextActionV58'))$('smartNextActionV58').textContent=weak?`${weak[1]} алдаа байна → 10 targeted questions`:'10 асуулт ажиллаад сул сэдвээ тодорхойлоорой.';
     if($('smartReviewTopicV58'))$('smartReviewTopicV58').textContent=weak?.[0]||'Mistake Notebook';
     if($('smartReviewTextV58'))$('smartReviewTextV58').textContent=weak?`${weak[0]}-ийн алдаануудаа дахин шалга.`:'Шинэ алдаа бүр автоматаар энд орно.';
   }catch(e){console.warn('v58 next best',e)}
 }

 // 3) Mock resume indicator: existing engine autosave is preserved; surface saved session.
 function surfaceMockResume(){
   let s=null;try{s=JSON.parse(localStorage.getItem('smarteshTestEngineStateV43')||'null')}catch(e){}
   if(!s||s.submitted)return;
   const host=document.querySelector('#exams .page-head'); if(!host||$('mockResumeV58'))return;
   const box=document.createElement('div');box.id='mockResumeV58';box.className='v58-resume';box.innerHTML='<b>↻ Дуусаагүй Mock Test байна</b><span>Хадгалсан хариултаас үргэлжлүүлж болно.</span><button class="primary-btn">Үргэлжлүүлэх</button>';
   box.querySelector('button').onclick=()=>{window.showView?.('exams');toast('Хадгалсан session сэргээгдлээ.');};host.after(box);
 }

 // 4) Notification unread state is local-per-user until notification_reads table is available.
 function enhanceNotifications(){
   const feed=$('notificationFeed');if(!feed)return;
   const key='smarteshNotifReadV58:'+(window.smarteshAuthUser?.id||'guest');let read=[];try{read=JSON.parse(localStorage.getItem(key)||'[]')}catch(e){}
   [...feed.querySelectorAll('.notification-card')].forEach((c,i)=>{const id=(c.querySelector('h3')?.textContent||'')+'|'+(c.querySelector('time')?.textContent||i);if(!read.includes(id))c.classList.add('unread');c.onclick=()=>{if(!read.includes(id)){read.push(id);localStorage.setItem(key,JSON.stringify(read));c.classList.remove('unread')}}});
   $('markAllReadBtn')?.addEventListener('click',()=>{const ids=[...feed.querySelectorAll('.notification-card')].map((c,i)=>(c.querySelector('h3')?.textContent||'')+'|'+(c.querySelector('time')?.textContent||i));localStorage.setItem(key,JSON.stringify(ids));feed.querySelectorAll('.notification-card').forEach(c=>c.classList.remove('unread'));});
 }

 // 5) Teacher action center from real cloud counts.
 async function teacherActions(){
   const sb=window.smarteshSupabase,u=window.smarteshAuthUser;if(!sb||!u||u.role!=='teacher')return;
   const home=$('teacherHomeV16')||document.querySelector('#teacherHome');if(!home||$('teacherActionV58'))return;
   try{
     const [as,at]=await Promise.all([sb.from('assignments').select('id,status,due_at').eq('teacher_id',u.id),sb.from('attempts').select('id,submitted_at,percentage').not('submitted_at','is',null)]);
     const assigned=(as.data||[]).filter(x=>x.status==='assigned').length, submitted=(at.data||[]).length;
     const box=document.createElement('div');box.id='teacherActionV58';box.className='panel v58-action-center';box.innerHTML=`<div class="panel-head"><div><h3>⚡ Өнөөдөр хийх зүйл</h3><small>Бодит өгөгдлөөс автоматаар</small></div></div><div class="v58-actions"><button data-view="teacherAssignments"><b>${assigned}</b><span>идэвхтэй даалгавар</span></button><button data-view="teacherResultsV19"><b>${submitted}</b><span>ирсэн submission</span></button><button data-view="paperAnalyticsV17"><b>OMR</b><span>цаасан шалгалт</span></button></div>`;home.querySelector('.section-wrap')?.prepend(box);
   }catch(e){console.warn('v58 teacher actions',e)}
 }
 function boot(){nextBest();surfaceMockResume();setTimeout(enhanceNotifications,900);teacherActions();}
 setTimeout(boot,1000);window.addEventListener('smartesh-auth-changed',()=>setTimeout(boot,500));
})();
