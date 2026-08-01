const q=new URLSearchParams(location.search),leadId=q.get('id');
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let lead,employees=[],activities=[],files=[],quotes=[],appointments=[];
const statuses=['new','contacted','quotation_sent','in_progress','waiting','completed','cancelled'];
async function ensureAuth(){const {data}=await lwsSupabase.auth.getSession();if(!data.session){location.href='admin-customers.html';return false}return true}
function money(v){return new Intl.NumberFormat('lo-LA').format(Number(v||0))+' ກີບ'}
async function loadAll(){
 const results=await Promise.all([
  lwsSupabase.from('leads').select('*').eq('id',leadId).single(),
  lwsSupabase.from('employees').select('*').eq('active',true).order('created_at'),
  lwsSupabase.from('lead_activities').select('*').eq('lead_id',leadId).order('created_at',{ascending:false}),
  lwsSupabase.from('client_files').select('*').eq('lead_id',leadId).order('created_at',{ascending:false}),
  lwsSupabase.from('quotations').select('*').eq('lead_id',leadId).order('created_at',{ascending:false}),
  lwsSupabase.from('appointments').select('*').eq('lead_id',leadId).order('appointment_at',{ascending:true})
 ]);
 if(results[0].error)throw results[0].error;
 lead=results[0].data;employees=results[1].data||[];activities=results[2].data||[];files=results[3].data||[];quotes=results[4].data||[];appointments=results[5].data||[];paint();
}
function paint(){
 $('customer-name').textContent=lead.name||'Customer';$('customer-business').textContent=lead.business_name||'—';
 $('customer-contact').innerHTML=`<a href="tel:${esc(lead.phone)}">☎ ${esc(lead.phone)}</a>${lead.email?`<a href="mailto:${esc(lead.email)}">✉ ${esc(lead.email)}</a>`:''}<a target="_blank" rel="noopener" href="https://wa.me/${String(lead.phone||'').replace(/\D/g,'')}">WhatsApp</a>`;
 $('status').innerHTML=statuses.map(s=>`<option value="${s}" ${lead.status===s?'selected':''}>${s.replaceAll('_',' ')}</option>`).join('');
 $('priority').value=lead.priority||'medium';$('owner').innerHTML='<option value="">—</option>'+employees.map(e=>`<option value="${e.id}" ${lead.owner_id===e.id?'selected':''}>${esc(e.name)}</option>`).join('');
 ['next_follow_up','deadline','project_name','admin_note'].forEach(k=>$(k).value=lead[k]||'');
 $('service-info').innerHTML=`<b>${esc(lead.service||'website')}</b><span>${esc(lead.budget||'ไม่ระบุงบประมาณ')}</span><p>${esc(lead.message||'')}</p>`;
 $('quotes').innerHTML=quotes.length?quotes.map(x=>`<article><div><b>${esc(x.quote_no)}</b><span>${esc(x.status)}</span></div><strong>${money(x.amount)}</strong></article>`).join(''):'<p class="empty-admin">ยังไม่มีใบเสนอราคา</p>';
 $('appointments').innerHTML=appointments.length?appointments.map(x=>`<article><div><b>${esc(x.title)}</b><span>${new Date(x.appointment_at).toLocaleString()}</span></div><span>${esc(x.status)}</span></article>`).join(''):'<p class="empty-admin">ยังไม่มีนัดหมาย</p>';
 $('files').innerHTML=files.length?files.map(x=>`<button class="text-btn" data-file="${x.id}">${esc(x.file_name)}</button>`).join(''):'<p class="empty-admin">ยังไม่มีไฟล์</p>';
 $('activities').innerHTML=activities.length?activities.map(x=>`<article><b>${esc(x.title)}</b><p>${esc(x.detail||'')}</p><time>${new Date(x.created_at).toLocaleString()}</time></article>`).join(''):'<p class="empty-admin">ยังไม่มีกิจกรรม</p>';
}
async function saveWorkflow(){
 const payload={status:$('status').value,priority:$('priority').value,owner_id:$('owner').value||null,next_follow_up:$('next_follow_up').value||null,deadline:$('deadline').value||null,project_name:$('project_name').value.trim()||null,admin_note:$('admin_note').value.trim()||null,last_contact_at:new Date().toISOString()};
 if(payload.status==='completed'&&!lead.completed_at)payload.completed_at=new Date().toISOString();
 $('save').disabled=true;$('save-status').textContent='กำลังบันทึก…';
 const {error}=await lwsSupabase.from('leads').update(payload).eq('id',leadId);$('save').disabled=false;if(error)throw error;
 await lwsSupabase.from('lead_activities').insert({lead_id:leadId,activity_type:'workflow',title:'อัปเดต Workflow',detail:`Status: ${payload.status}, Priority: ${payload.priority}`});
 $('save-status').textContent='บันทึกสำเร็จ ✓';await loadAll();
}
async function addActivity(e){e.preventDefault();const title=$('activity-title').value.trim(),detail=$('activity-detail').value.trim();if(!title)return;const {error}=await lwsSupabase.from('lead_activities').insert({lead_id:leadId,title,detail:detail||null});if(error)throw error;e.target.reset();await loadAll();}
async function downloadFile(id){const f=files.find(x=>x.id===id);const {data,error}=await lwsSupabase.storage.from('client-files').createSignedUrl(f.file_path,60);if(error)throw error;open(data.signedUrl,'_blank')}
$('workflow-form').addEventListener('submit',e=>{e.preventDefault();saveWorkflow().catch(err=>$('save-status').textContent=err.message)});
$('activity-form').addEventListener('submit',e=>addActivity(e).catch(err=>alert(err.message)));
$('files').addEventListener('click',e=>{if(e.target.dataset.file)downloadFile(e.target.dataset.file).catch(err=>alert(err.message))});
(async()=>{if(!leadId){location.href='admin-customers.html';return}if(await ensureAuth())loadAll().catch(err=>{$('page-status').textContent='กรุณารัน supabase-migration-v2.7.sql ก่อน: '+err.message})})();
