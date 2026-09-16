const {sb,qpayCheck}=require('./_qpay-common');
module.exports=async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  try{
    const sender=String(req.query?.sender_invoice_no||'');
    if(!sender)return res.status(400).json({error:'Missing sender invoice'});
    const rows=await sb(`payments?sender_invoice_no=eq.${encodeURIComponent(sender)}&select=*`);
    const p=rows?.[0];if(!p)return res.status(404).json({error:'Payment not found'});
    if(p.status==='paid')return res.status(200).json({ok:true,status:'paid'});
    await sb(`payments?id=eq.${p.id}`,{method:'PATCH',body:JSON.stringify({callback_received_at:new Date().toISOString()})});
    const check=await qpayCheck(p.qpay_invoice_id);
    const list=check.rows||check.items||check.payments||[];
    const paid=list.find(x=>String(x.payment_status||x.status||'').toUpperCase()==='PAID')||list[0];
    const paidAmount=Number(paid?.payment_amount??paid?.amount??0);
    const isPaid=!!paid && (String(paid.payment_status||paid.status||'').toUpperCase()==='PAID'||paidAmount>=Number(p.amount));
    if(!isPaid)return res.status(200).json({ok:true,status:'pending'});

    const expected=Number(p.amount);
    if(paidAmount && paidAmount<expected)throw new Error('Paid amount mismatch');
    const now=new Date();
    const ents=await sb(`entitlements?user_id=eq.${p.user_id}&status=eq.active&order=ends_at.desc&limit=1&select=*`);
    const active=ents?.[0], base=active&&new Date(active.ends_at)>now?new Date(active.ends_at):now;
    const end=new Date(base);end.setDate(end.getDate()+365);

    await sb(`payments?id=eq.${p.id}`,{method:'PATCH',body:JSON.stringify({
      status:'paid',verified_at:now.toISOString(),provider_ref:paid?.payment_id||p.provider_ref,
      raw_verification:check
    })});
    if(active){
      await sb(`entitlements?id=eq.${active.id}`,{method:'PATCH',body:JSON.stringify({
        plan:p.plan,ends_at:end.toISOString(),status:'active',payment_id:p.id
      })});
    }else{
      await sb('entitlements',{method:'POST',body:JSON.stringify({
        user_id:p.user_id,plan:p.plan,starts_at:now.toISOString(),ends_at:end.toISOString(),
        status:'active',payment_id:p.id
      })});
    }
    return res.status(200).json({ok:true,status:'paid'});
  }catch(e){return res.status(500).json({error:e.message})}
};