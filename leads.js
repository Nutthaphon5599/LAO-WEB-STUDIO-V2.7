const LEAD_STATUSES = ['new','contacted','quotation_sent','in_progress','waiting','completed','cancelled'];

async function createLead(lead){
  if(!window.lwsSupabase) throw new Error('Supabase ยังไม่ได้ตั้งค่า');
  const payload={
    name:lead.name.trim(), phone:lead.phone.trim(), email:(lead.email||'').trim()||null,
    business_name:(lead.business_name||'').trim()||null, service:lead.service||'website',
    budget:(lead.budget||'').trim()||null, message:lead.message.trim(),
    preferred_contact:lead.preferred_contact||'whatsapp', language:lead.language||'lo',
    status:'new', source:'website'
  };
  const {data,error}=await window.lwsSupabase.from('leads').insert(payload).select('id').single();
  if(error){if(String(error.message||'').includes('public.leads'))throw new Error('ยังไม่ได้ติดตั้งตาราง leads กรุณารัน supabase-setup-v2.2.sql');throw error;}
  return data;
}

async function getLeads(){
  if(!window.lwsSupabase) return [];
  const {data,error}=await window.lwsSupabase.from('leads').select('*').order('created_at',{ascending:false});
  if(error) throw error;
  return data||[];
}

async function updateLeadStatus(id,status){
  if(!LEAD_STATUSES.includes(status)) throw new Error('สถานะไม่ถูกต้อง');
  const {error}=await window.lwsSupabase.from('leads').update({status,updated_at:new Date().toISOString()}).eq('id',id);
  if(error) throw error;
}

async function deleteLead(id){
  const {error}=await window.lwsSupabase.from('leads').delete().eq('id',id);
  if(error) throw error;
}
