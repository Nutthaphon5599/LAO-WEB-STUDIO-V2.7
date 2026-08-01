(function(){
  const configured = window.LWS_SUPABASE_URL && !window.LWS_SUPABASE_URL.includes('PASTE_') && window.LWS_SUPABASE_ANON_KEY && !window.LWS_SUPABASE_ANON_KEY.includes('PASTE_');
  window.LWS_SUPABASE_CONFIGURED = Boolean(configured);
  window.lwsSupabase = configured && window.supabase ? window.supabase.createClient(window.LWS_SUPABASE_URL, window.LWS_SUPABASE_ANON_KEY) : null;
})();
