
const QPAY_BASE = process.env.QPAY_BASE_URL || 'https://merchant.qpay.mn';

async function sbUser(req) {
  const token=(req.headers.authorization||'').replace(/^Bearer\s+/i,'');
  if(!token) throw new Error('Unauthorized');
  const url=process.env.SUPABASE_URL, anon=process.env.SUPABASE_PUBLISHABLE_KEY;
  if(!url||!anon) throw new Error('Supabase config missing');
  const r=await fetch(url+'/auth/v1/user',{headers:{apikey:anon,Authorization:'Bearer '+token}});
  if(!r.ok) throw new Error('Unauthorized');
  return await r.json();
}
async function sb(path, opts={}) {
  const url=process.env.SUPABASE_URL, key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url||!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY missing');
  const r=await fetch(url+'/rest/v1/'+path,{...opts,headers:{
    apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json',
    Prefer:opts.prefer||'return=representation',...(opts.headers||{})
  }});
  const text=await r.text(); let data=null; try{data=text?JSON.parse(text):null}catch(e){data=text}
  if(!r.ok) throw new Error(typeof data==='string'?data:(data?.message||'Supabase error'));
  return data;
}
let qpayTokenCache={token:null,expires:0};
async function qpayToken(){
  if(qpayTokenCache.token && Date.now()<qpayTokenCache.expires-60000)return qpayTokenCache.token;
  const id=process.env.QPAY_CLIENT_ID, secret=process.env.QPAY_CLIENT_SECRET;
  if(!id||!secret)throw new Error('QPay merchant credentials missing');
  const basic=Buffer.from(id+':'+secret).toString('base64');
  const r=await fetch(QPAY_BASE+'/v2/auth/token',{method:'POST',headers:{Authorization:'Basic '+basic}});
  const j=await r.json(); if(!r.ok)throw new Error(j.message||'QPay auth failed');
  qpayTokenCache={token:j.access_token,expires:Date.now()+Number(j.expires_in||3600)*1000};
  return j.access_token;
}
async function qpayCheck(invoiceId){
  const t=await qpayToken();
  const r=await fetch(QPAY_BASE+'/v2/payment/check',{method:'POST',headers:{Authorization:'Bearer '+t,'Content-Type':'application/json'},body:JSON.stringify({object_type:'INVOICE',object_id:invoiceId,offset:{page_number:1,page_limit:100}})});
  const j=await r.json();if(!r.ok)throw new Error(j.message||'QPay payment check failed');return j;
}
function origin(req){return process.env.PUBLIC_SITE_URL||('https://'+(req.headers['x-forwarded-host']||req.headers.host));}
function planInfo(plan){if(plan==='student')return {amount:10000,label:'Student Premium'};if(plan==='teacher')return {amount:20000,label:'Teacher Premium'};return null}

module.exports={QPAY_BASE,sbUser,sb,qpayToken,qpayCheck,origin,planInfo};
