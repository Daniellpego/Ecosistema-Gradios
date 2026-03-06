# Configuração de Variáveis de Ambiente (Vercel)

Para que o deploy funcione corretamente, você precisa adicionar as seguintes variáveis no painel da Vercel (Settings > Environment Variables):

1. `SUPABASE_URL`: https://urpuiznydrlwmaqhdids.supabase.co
2. `SUPABASE_ANON_KEY`: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVycHVpem55ZHJsd21hcWhkaWRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MjQ0OTIsImV4cCI6MjA4NzIwMDQ5Mn0.qSoyYmBTvgdOAickkuLCYCveOj2ELIZt85LFZb6veQ8
O script `build.js` vai ler esses valores e gerar o arquivo `js/config.js` automaticamente durante o deploy.
