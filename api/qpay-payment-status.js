const {sbUser,sb}=require('./_qpay-common');
module.exports=async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  try{
    const auth=await sbUser(req),id=String(req.body?.payment_id||'');
    const rows=await sb(`payments?id=eq.${encodeURIComponent(id)}&user_id=eq.${encodeURIComponent(auth.id)}&select=id,status,verified_at`);
    const p=rows?.[0];if(!p)return res.status(404).json({error:'Payment not found'});
    return res.status(200).json(p);
  }catch(e){return res.status(500).json({error:e.message})}
};