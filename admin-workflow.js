(() => {
  const statuses=['new','contacted','quotation_sent','in_progress','waiting','completed','cancelled'];
  const statusLabel={new:'ลูกค้าใหม่',contacted:'ติดต่อแล้ว',quotation_sent:'ส่งใบเสนอราคา',in_progress:'กำลังทำ',waiting:'รอลูกค้า',completed:'ส่งมอบแล้ว',cancelled:'ยกเลิก'};
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const today=()=>new Date().toISOString().slice(0,10);

  function addWorkflowToolbar(){
    const toolbar=document.querySelector('.lead-toolbar');
    if(!toolbar||document.getElementById('workflow-priority'))return;
    toolbar.insertAdjacentHTML('beforeend',`
      <label>ความสำคัญ<select id="workflow-priority"><option value="all">ทั้งหมด</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></label>
      <label>งานติดตาม<select id="workflow-follow"><option value="all">ทั้งหมด</option><option value="today">วันนี้/เกินกำหนด</option><option value="week">ภายใน 7 วัน</option><option value="none">ยังไม่กำหนด</option></select></label>`);
    document.getElementById('workflow-priority').addEventListener('change',paintWorkflowCards);
    document.getElementById('workflow-follow').addEventListener('change',paintWorkflowCards);
  }

  function matchesWorkflow(x){
    const p=document.getElementById('workflow-priority')?.value||'all';
    const f=document.getElementById('workflow-follow')?.value||'all';
    if(p!=='all'&&(x.priority||'medium')!==p)return false;
    const d=x.next_follow_up;
    if(f==='none'&&d)return false;
    if(f==='today'&&(!d||d>today()))return false;
    if(f==='week'){
      if(!d)return false;
      const end=new Date();end.setDate(end.getDate()+7);
      if(d> end.toISOString().slice(0,10))return false;
    }
    return true;
  }

  function paintWorkflowCards(){
    const leads=window.cachedLeads||[];
    document.querySelectorAll('.lead-item').forEach(card=>{
      const x=leads.find(v=>String(v.id)===String(card.dataset.id));
      if(!x)return;
      card.hidden=!matchesWorkflow(x);
      if(card.querySelector('.v27-summary'))return;
      card.querySelector('.v24-crm-fields')?.remove();
      const follow=x.next_follow_up?`ติดตาม: ${esc(x.next_follow_up)}`:'ยังไม่กำหนดวันติดตาม';
      const summary=document.createElement('div');summary.className='v27-summary';
      summary.innerHTML=`<div><span class="v27-priority priority-${esc(x.priority||'medium')}">${esc((x.priority||'medium').toUpperCase())}</span><span>${follow}</span></div><div class="v27-card-actions"><a class="btn btn-primary small" href="admin-customer-detail.html?id=${encodeURIComponent(x.id)}">เปิดรายละเอียด</a><a class="btn btn-secondary small" href="tel:${esc(x.phone||'')}">โทร</a>${x.email?`<a class="btn btn-secondary small" href="mailto:${esc(x.email)}">Email</a>`:''}</div>`;
      card.appendChild(summary);
    });
  }

  function addDashboardTasks(){
    const dash=document.getElementById('v24-dashboard');
    if(!dash||document.getElementById('v27-task-panel'))return;
    const leads=window.cachedLeads||[];
    const overdue=leads.filter(x=>x.next_follow_up&&x.next_follow_up<=today()&&!['completed','cancelled'].includes(x.status));
    const high=leads.filter(x=>x.priority==='high'&&!['completed','cancelled'].includes(x.status));
    const host=dash.closest('.pricing-admin-card');
    host?.insertAdjacentHTML('beforeend',`<div id="v27-task-panel" class="v27-task-panel"><div class="admin-list-head"><div><span class="mini-label">TODAY</span><h2>งานที่ต้องจัดการ</h2></div><a class="btn btn-secondary small" href="admin-customers.html">ดูลูกค้าทั้งหมด</a></div><div class="v27-task-grid"><a href="admin-customers.html"><b>${overdue.length}</b><span>ต้องติดตามวันนี้/เกินกำหนด</span></a><a href="admin-customers.html"><b>${high.length}</b><span>งานความสำคัญสูง</span></a></div></div>`);
  }

  const observer=new MutationObserver(()=>{addWorkflowToolbar();paintWorkflowCards();addDashboardTasks();});
  window.addEventListener('load',()=>{
    addWorkflowToolbar();
    setTimeout(()=>{paintWorkflowCards();addDashboardTasks();},1200);
    const list=document.getElementById('lead-list');if(list)observer.observe(list,{childList:true,subtree:true});
  });
})();
