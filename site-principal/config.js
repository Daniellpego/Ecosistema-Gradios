// ══════════════════════════════════════════════════════════
// CONFIGURAÇÃO CENTRAL DO SITE BG TECH
// Altere os valores abaixo UMA VEZ e todos os links se atualizam.
// ══════════════════════════════════════════════════════════

const SITE_CONFIG = {
  // WhatsApp — número comercial da empresa
  whatsapp: '5543997800051',
  whatsappMensagem: 'Olá! Vi o site da BG Tech e quero saber mais sobre automação para minha empresa.',

  // Dados da empresa
  cnpj: '65.663.208/0001-36',
  razaoSocial: 'BG Tech Soluções em Tecnologia LTDA',
  endereco: 'R. Joaquim Antônio dos Santos, 148 - Jardim Tarumã, Londrina/PR - CEP 86.038-610',

  // Números exibidos no site (manter consistentes)
  empresasAtendidas: '47+',
  diagnosticosRealizados: '47+',

  // Supabase (anon key pública — segura para client-side)
  supabaseUrl: 'https://urpuiznydrlwmaqhdids.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVycHVpem55ZHJsd21hcWhkaWRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MjQ0OTIsImV4cCI6MjA4NzIwMDQ5Mn0.qSoyYmBTvgdOAickkuLCYCveOj2ELIZt85LFZb6veQ8',
};

// Atualiza automaticamente todos os links com classe js-wpp-link
document.addEventListener('DOMContentLoaded', function () {
  var links = document.querySelectorAll('.js-wpp-link');
  for (var i = 0; i < links.length; i++) {
    links[i].href = 'https://wa.me/' + SITE_CONFIG.whatsapp + '?text=' + encodeURIComponent(SITE_CONFIG.whatsappMensagem);
  }
});
