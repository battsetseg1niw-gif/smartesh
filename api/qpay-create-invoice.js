const crypto=require('crypto');
const {QPAY_BASE,sbUser,sb,qpayToken,origin,planInfo}=require('./_qpay-common');
module.exports=async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  try{
    const auth=await sbUser(req), plan=req.body?.plan, info=planInfo(plan);
    if(!info)return res.status(400).json({error:'Invalid plan'});
    const profiles=await sb(`profiles?id=eq.${encodeURIComponent(auth.id)}&select=id,role,full_name`);
    const p=profiles?.[0]; if(!p)return res.status(403).json({error:'Profile not found'});
    if(p.role!=='admin'&&p.role!==plan)return res.status(403).json({error:'Account role and plan do not match'});
    const paymentId=crypto.randomUUID(), sender='SMARTESH-'+Date.now()+'-'+crypto.randomBytes(3).toString('hex').toUpperCase();
    const callback=origin(req)+'/api/qpay-callback?sender_invoice_no='+encodeURIComponent(sender);
    await sb('payments',{method:'POST',body:JSON.stringify({
      id:paymentId,user_id:auth.id,provider:'QPay',plan,amount:info.amount,status:'pending',
      sender_invoice_no:sender,created_at:new Date().toISOString()
    })});
    const token=await qpayToken();
    const body={
      invoice_code:process.env.QPAY_INVOICE_CODE,
      sender_invoice_no:sender,
      invoice_receiver_code:auth.id,
      invoice_description:`SmartESH ${info.label} — 365 days`,
      amount:info.amount,
      callback_url:callback
    };
    const qr=await fetch(QPAY_BASE+'/v2/invoice',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(body)});
    const j=await qr.json();
    if(!qr.ok){
      await sb(`payments?id=eq.${paymentId}`,{method:'PATCH',body:JSON.stringify({status:'failed',raw_verification:j})});
      throw new Error(j.message||'QPay invoice creation failed');
    }
    await sb(`payments?id=eq.${paymentId}`,{method:'PATCH',body:JSON.stringify({
      qpay_invoice_id:j.invoice_id||null,provider_ref:j.invoice_id||null,qr_text:j.qr_text||null,
      qpay_urls:j.urls||[],invoice_created_at:new Date().toISOString()
    })});
    return res.status(200).json({
      payment_id:paymentId,amount:info.amount,sender_invoice_no:sender,
      invoice_id:j.invoice_id,qr_image:j.qr_image||null,qr_text:j.qr_text||null,urls:j.urls||[]
    });
  }catch(e){return res.status(500).json({error:e.message})}
};