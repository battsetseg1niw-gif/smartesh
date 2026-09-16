const {sbUser,sb}=require('./_qpay-common');
module.exports=async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  try{
    const auth=await sbUser(req);
    const p=await sb(`profiles?id=eq.${encodeURIComponent(auth.id)}&select=role`);
    if(p?.[0]?.role!=='admin')return res.status(403).json({error:'Admin only'});
    const x={
      client_id:!!process.env.QPAY_CLIENT_ID,
      client_secret:!!process.env.QPAY_CLIENT_SECRET,
      invoice_code:!!process.env.QPAY_INVOICE_CODE,
      service_role:!!process.env.SUPABASE_SERVICE_ROLE_KEY
    };
    x.ready=Object.values(x).every(Boolean);
    return res.status(200).json(x);
  }catch(e){return res.status(500).json({error:e.message})}
};