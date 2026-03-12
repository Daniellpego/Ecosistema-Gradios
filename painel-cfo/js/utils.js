// ═══════════════════════════════════════════════
// CFO Dashboard v2 — Utilities
// ═══════════════════════════════════════════════

export const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

export const CATS = {
  entradas: ['Receita de Setup', 'Mensalidade', 'Projetos Avulsos', 'Outras Receitas'],
  fixos: ['Contabilidade', 'Ferramentas', 'Hospedagem', 'Pró-labore', 'Taxas Bancárias', 'Outros Fixos'],
  unicos: ['Marketing', 'Taxas de Pagamento', 'Freelancers', 'Serviços Pontuais', 'APIs', 'Imprevistos']
};

let TAX_RATE = 0.06;
export function getTaxRate() { return TAX_RATE; }
export function setTaxRate(rate) { TAX_RATE = rate; }

export function calcTax(revenue) { return revenue > 0 ? revenue * TAX_RATE : 0; }

export function fmtR(v) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v) || 0);
}

export function fmtD(d) {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
}

export function cleanMoney(s) {
  if (!s) return 0;
  if (typeof s === 'number') return s;
  // Remove everything EXCEPT numbers and comma
  let v = String(s).replace(/[^\d,]/g, '').replace(',', '.');
  return parseFloat(v) || 0;
}

export function maskMoney(e) {
  let v = e.target.value.replace(/\D/g, '');
  if (!v) { e.target.value = ''; return; }
  v = (parseInt(v) / 100).toFixed(2);
  e.target.value = v.replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
}

export function safe(v) { return isNaN(v) || v === null ? 0 : v; }

export function pct(v, total) {
  if (!total) return '0%';
  return ((v / total) * 100).toFixed(1) + '%';
}

export function esc(s) {
  if (!s) return '';
  return String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}

export function filterData(arr, m, y, ytd = false, client = '', project = '') {
  return arr.filter(x => {
    if (!x.data) return false;
    const [xy, xm] = x.data.split('-');
    const matchYear = xy === String(y);
    // m is 0-based (0=Jan), xm is 1-based from DB date string ("01"=Jan)
    const m1 = parseInt(m) + 1; // convert to 1-based for comparison
    const matchMonth = ytd ? parseInt(xm) <= m1 : (m === 'anual' || xm === String(m1).padStart(2, '0'));
    const matchClient = !client || x.cliente === client;
    const matchProj = !project || x.projeto === project;
    return matchYear && matchMonth && matchClient && matchProj;
  });
}

export function toast(msg, type = 'success') {
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = msg;
  const wrap = document.getElementById('toast-wrap') || document.body;
  wrap.appendChild(t);
  setTimeout(() => t.classList.add('show'), 100);
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 500);
  }, 3000);
}
