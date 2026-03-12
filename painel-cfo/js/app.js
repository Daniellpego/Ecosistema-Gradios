// ═══════════════════════════════════════════════
// CFO Dashboard v2 — Main Application Entry
// ═══════════════════════════════════════════════

import * as Auth from './auth.js';
import * as State from './state.js';
import * as DB from './db.js';
import * as Offline from './offline.js';
import { toast, maskMoney, cleanMoney, fmtR, filterData, safe, calcTax, CATS, esc } from './utils.js';
import { renderOverview } from './views/overview.js';
import { renderDRE } from './views/dre.js';
import { renderLancamentosTable } from './views/lancamentos.js';
import { renderAnnual } from './views/annual.js';
import { renderProjecoes } from './views/projecoes.js';

const loginScreen = document.getElementById('login-screen');
const appEl = document.getElementById('app');
let chartsInitialized = false;
let charts = { area: null, donut: null, dreBar: null, dreLine: null };
let _currentTags = [];

// ═══ FILTER DROPDOWNS ═══
function _populateFilterDropdowns() {
    const lans = State.getState().lancamentos;
    const clients = [...new Set(lans.map(l => l.cliente).filter(Boolean))].sort();
    const projects = [...new Set(lans.map(l => l.projeto).filter(Boolean))].sort();
    const fClient = document.getElementById('fClient');
    const fProject = document.getElementById('fProject');
    if (fClient) {
        const cur = fClient.value;
        fClient.innerHTML = '<option value="all">Todos Clientes</option>' + clients.map(c => `<option value="${c}">${esc(c)}</option>`).join('');
        if (cur && cur !== 'all') fClient.value = cur;
    }
    if (fProject) {
        const cur = fProject.value;
        fProject.innerHTML = '<option value="all">Todos Projetos</option>' + projects.map(p => `<option value="${p}">${esc(p)}</option>`).join('');
        if (cur && cur !== 'all') fProject.value = cur;
    }
}

// ═══ APP INIT ═══
async function initApp() {
    console.log('🚀 Initializing App...');

    // Monitor Network
    Offline.onNetworkChange(isOnline => {
        syncUI(isOnline ? 'ok' : 'err');
        if (isOnline) State.loadAll();
    });
    syncUI(navigator.onLine ? 'ok' : 'err');

    const safetyTimeout = setTimeout(() => {
        console.warn('⚠️ Safety timeout — forcing reveal');
        revealApp();
    }, 5000);

    try {
        await State.loadAll();
        navigate('overview');

        try {
            DB.subscribeRealtime(
                (p) => { State.handleRealtimeEvent('cfo_lancamentos', p); renderActiveView(); },
                (p) => { State.handleRealtimeEvent('cfo_projecoes', p); renderActiveView(); },
                (p) => { State.handleRealtimeEvent('cfo_config_v2', p); renderActiveView(); }
            );
        } catch (e) {
            console.warn('Realtime subscription failed (non-critical):', e);
        }

        clearTimeout(safetyTimeout);
        _populateFilterDropdowns();
        revealApp();
        syncUI('ok');
    } catch (err) {
        console.error('❌ Init Error:', err);
        toast('Erro ao carregar dados. Usando cache local.', 'danger');
        clearTimeout(safetyTimeout);
        revealApp();
        navigate('overview');
        syncUI('err');
    }
}

function revealApp() {
    console.log('✨ Revealing UI...');
    const overlay = document.getElementById('welcome-overlay');
    if (overlay) overlay.classList.remove('active');

    if (appEl) {
        appEl.style.display = 'flex';
        appEl.style.opacity = '1';
        appEl.style.visibility = 'visible';
    }
    if (loginScreen) loginScreen.style.display = 'none';

    if (window.lucide) lucide.createIcons();

    if (!chartsInitialized) {
        initCharts();
        chartsInitialized = true;
    }
}

// ═══ NAVIGATION ═══
function navigate(tab, opts) {
    State.setTab(tab);

    // Aplica filtros passados (ex: navigate('dre', { m: '3' }))
    if (opts && opts.m !== undefined) {
        State.getState().filters.m = String(opts.m);
        const fMonth = document.getElementById('fMonth');
        if (fMonth) fMonth.value = String(opts.m);
    }

    document.querySelectorAll('.nav-btn, .m-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.tab === tab);
    });

    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const viewEl = document.getElementById(`view-${tab}`);
    if (viewEl) viewEl.classList.add('active');

    const titles = {
        overview: ['Visão Geral', 'Indicadores-chave em tempo real.'],
        dre: ['DRE Gerencial', 'Demonstrativo de Resultado do Exercício.'],
        annual: ['Balanço Anual', 'Visão consolidada mês a mês.'],
        entradas: ['Receitas', 'Todas as entradas financeiras.'],
        fixos: ['Custos Fixos', 'Despesas recorrentes da operação.'],
        unicos: ['Gastos Variáveis', 'Despesas pontuais e variáveis.'],
        projecoes: ['Projeções', 'Simulação de cenários futuros.'],
        academia: ['Academia CFO', 'Entenda cada indicador do dashboard.'],
    };
    const [title, sub] = titles[tab] || [tab, ''];
    const titleEl = document.getElementById('page-title');
    const subEl = document.getElementById('page-sub-text');
    if (titleEl) titleEl.textContent = title;
    if (subEl) subEl.textContent = sub;

    const btnGasto = document.getElementById('btn-add-gasto');
    const btnReceita = document.getElementById('btn-add-receita');
    const btnProj = document.getElementById('btn-add-proj');
    const btnExport = document.getElementById('btn-export');
    const filterBar = document.getElementById('filter-bar');

    if (btnGasto) btnGasto.style.display = (tab === 'fixos' || tab === 'unicos') ? '' : 'none';
    if (btnReceita) btnReceita.style.display = (tab === 'entradas') ? '' : 'none';
    if (btnProj) btnProj.style.display = (tab === 'projecoes') ? '' : 'none';
    if (btnExport) btnExport.style.display = ['overview', 'dre', 'annual'].includes(tab) ? '' : 'none';
    if (filterBar) filterBar.style.display = ['overview', 'dre', 'annual', 'entradas', 'fixos', 'unicos'].includes(tab) ? 'flex' : 'none';

    if (tab === 'academia') refreshTaxDisplay();
    renderActiveView();
}

function renderActiveView() {
    const tab = State.getTab();
    try {
        if (tab === 'overview') { renderOverview(); updateCharts(); }
        else if (tab === 'dre') { renderDRE(); updateCharts(); }
        else if (tab === 'annual') renderAnnual();
        else if (['entradas', 'fixos', 'unicos'].includes(tab)) renderLancamentosTable();
        else if (tab === 'projecoes') renderProjecoes();
    } catch (err) {
        console.error(`Error rendering ${tab}:`, err);
    }

    if (window.lucide) lucide.createIcons();
}

// ═══ SYNC UI ═══
function syncUI(status) {
    const dot = document.getElementById('sync-dot');
    const txt = document.getElementById('sync-txt');
    if (!dot || !txt) return;
    const map = {
        ok: ['var(--success)', 'Conectado'],
        err: ['var(--danger)', 'Offline'],
        load: ['var(--warning)', 'Sincronizando...']
    };
    const [color, label] = map[status] || map.ok;
    dot.style.background = color;
    dot.style.boxShadow = `0 0 12px ${color}`;
    txt.textContent = label;
}

// ═══ CHARTS ═══
function initCharts() {
    const base = {
        chart: { background: 'transparent', fontFamily: 'Poppins', toolbar: { show: false }, animations: { enabled: true, speed: 800 } },
        theme: { mode: 'dark' }
    };

    const areaEl = document.getElementById('chart-area');
    const donutEl = document.getElementById('chart-donut');
    const dreBarEl = document.getElementById('chart-dre-bar');
    const dreLineEl = document.getElementById('chart-dre-line');

    if (areaEl && typeof ApexCharts !== 'undefined') {
        charts.area = new ApexCharts(areaEl, {
            ...base, series: [], chart: { ...base.chart, type: 'area', height: 280 },
            colors: ['#10b981', '#ef4444'],
            fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0 } },
            stroke: { curve: 'smooth', width: 3 }, dataLabels: { enabled: false },
            grid: { borderColor: 'rgba(255,255,255,0.05)' },
            xaxis: { categories: [], labels: { style: { colors: '#94a3b8' } } },
            yaxis: { labels: { style: { colors: '#94a3b8' }, formatter: v => `R$${(v / 1000).toFixed(0)}k` } },
            tooltip: { theme: 'dark', y: { formatter: v => fmtR(v) } }
        });
        charts.area.render();
    }

    if (donutEl && typeof ApexCharts !== 'undefined') {
        charts.donut = new ApexCharts(donutEl, {
            ...base, series: [1], labels: ['Sem dados'], chart: { ...base.chart, type: 'donut', height: 280 },
            colors: ['#1e293b'],
            stroke: { show: true, colors: ['#0a0f1a'], width: 4 },
            dataLabels: { enabled: false },
            plotOptions: { pie: { donut: { size: '75%', labels: { show: true, name: { color: '#94a3b8' }, value: { color: '#fff', fontSize: '20px', fontWeight: 900, formatter: v => fmtR(v) }, total: { show: true, label: 'Total', color: '#94a3b8', formatter: w => fmtR(w.globals.seriesTotals.reduce((a, b) => a + b, 0)) } } } } },
            legend: { position: 'bottom', labels: { colors: '#94a3b8' } },
            tooltip: { theme: 'dark' }
        });
        charts.donut.render();
    }

    if (dreBarEl && typeof ApexCharts !== 'undefined') {
        charts.dreBar = new ApexCharts(dreBarEl, {
            ...base, series: [], chart: { ...base.chart, type: 'bar', height: 280 },
            colors: ['#10b981', '#f59e0b', '#ef4444'],
            plotOptions: { bar: { borderRadius: 4, columnWidth: '50%' } },
            dataLabels: { enabled: false },
            xaxis: { categories: [], labels: { style: { colors: '#94a3b8' } } },
            yaxis: { labels: { style: { colors: '#94a3b8' }, formatter: v => `R$${(v / 1000).toFixed(0)}k` } },
            grid: { borderColor: 'rgba(255,255,255,0.05)' },
            tooltip: { theme: 'dark', y: { formatter: v => fmtR(v) } }
        });
        charts.dreBar.render();
    }

    if (dreLineEl && typeof ApexCharts !== 'undefined') {
        charts.dreLine = new ApexCharts(dreLineEl, {
            ...base, series: [], chart: { ...base.chart, type: 'area', height: 280 },
            colors: ['#0ea5e9'],
            fill: { type: 'gradient', gradient: { opacityFrom: 0.4, opacityTo: 0 } },
            stroke: { curve: 'smooth', width: 3 }, dataLabels: { enabled: false },
            markers: { size: 4, colors: ['#0ea5e9'], strokeColors: '#0a0f1a', strokeWidth: 2 },
            xaxis: { categories: [], labels: { style: { colors: '#94a3b8' } } },
            yaxis: { labels: { style: { colors: '#94a3b8' }, formatter: v => `R$${(v / 1000).toFixed(0)}k` } },
            grid: { borderColor: 'rgba(255,255,255,0.05)' },
            tooltip: { theme: 'dark', y: { formatter: v => fmtR(v) } }
        });
        charts.dreLine.render();
    }
}

function updateCharts() {
    const MONTHS_SHORT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const entradas = State.getEntradas();
    const fixos = State.getFixos();
    const variaveis = State.getVariaveis();
    const isConf = x => x?.status === 'Confirmado';

    const cats6 = [], rev6 = [], burn6 = [], dreRB = [], dreCF = [], dreCV = [], dreRL = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(); d.setMonth(d.getMonth() - i);
        const mStr = d.getMonth(), yStr = d.getFullYear();

        const eV = safe(filterData(entradas, mStr, yStr).filter(isConf).reduce((a, b) => a + Number(b.valor), 0));
        const fV = safe(filterData(fixos, mStr, yStr).filter(isConf).reduce((a, b) => a + Number(b.valor), 0));
        const vV = safe(filterData(variaveis, mStr, yStr).filter(isConf).reduce((a, b) => a + Number(b.valor), 0));
        const tax = calcTax(eV);
        const totalOut = fV + vV + tax;

        cats6.push(MONTHS_SHORT[d.getMonth()]); rev6.push(eV); burn6.push(totalOut);
        dreRB.push(eV); dreCF.push(fV); dreCV.push(vV + tax); dreRL.push(eV - totalOut);
    }

    if (charts.area) {
        charts.area.updateSeries([{ name: 'Receita', data: rev6 }, { name: 'Burn Rate', data: burn6 }]);
        charts.area.updateOptions({ xaxis: { categories: cats6 } });
    }
    if (charts.dreBar) {
        charts.dreBar.updateSeries([{ name: 'Receita', data: dreRB }, { name: 'Variáveis+Imp', data: dreCV }, { name: 'Fixos', data: dreCF }]);
        charts.dreBar.updateOptions({ xaxis: { categories: cats6 } });
    }
    if (charts.dreLine) {
        charts.dreLine.updateSeries([{ name: 'Resultado', data: dreRL }]);
        charts.dreLine.updateOptions({ xaxis: { categories: cats6 } });
    }

    // Donut
    const { m, y } = State.getFilters();
    const curFixos = filterData(fixos, m, y).filter(isConf);
    const catMap = {};
    curFixos.forEach(x => { catMap[x.categoria || 'Outros'] = (catMap[x.categoria || 'Outros'] || 0) + Number(x.valor); });
    const labels = Object.keys(catMap), series = Object.values(catMap);
    if (charts.donut) {
        if (series.length > 0) {
            charts.donut.updateOptions({ labels, colors: ['#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd', '#0284c7', '#0369a1'] });
            charts.donut.updateSeries(series);
        } else {
            charts.donut.updateSeries([1]);
            charts.donut.updateOptions({ labels: ['Sem dados'], colors: ['#1e293b'] });
        }
    }
}

// ═══ TAX CONFIG ═══
function refreshTaxDisplay() {
    const s = State.getState();
    const elRegime = document.getElementById('cfg-regime');
    const elAliquota = document.getElementById('cfg-aliquota');
    if (elRegime) elRegime.textContent = s.regime_tributario;
    if (elAliquota) elAliquota.textContent = `${(s.aliquota_imposto * 100).toFixed(1)}%`;
}

// ═══ DRAWER: Lançamentos ═══
function openDrawer(id, modo) {
    const drawer = document.getElementById('drawer');
    const overlay = document.getElementById('overlay');
    if (!drawer || !overlay) return;

    drawer.classList.add('open');
    overlay.classList.add('open');

    document.getElementById('f-id').value = '';
    document.getElementById('f-nome').value = '';
    document.getElementById('f-valor').value = '';
    document.getElementById('f-data').value = new Date().toISOString().split('T')[0];
    document.getElementById('f-status').value = 'Confirmado';
    document.getElementById('f-recor').value = 'unico';
    document.getElementById('f-cliente').value = '';
    document.getElementById('f-projeto').value = '';
    if (document.getElementById('f-desc')) document.getElementById('f-desc').value = '';
    _currentTags = [];
    _renderTagChips();

    if (id && typeof id === 'string') {
        const item = State.getState().lancamentos.find(l => l.id === id);
        if (item) {
            document.getElementById('f-id').value = item.id;
            document.getElementById('f-nome').value = item.nome || '';
            document.getElementById('f-valor').value = item.valor ? fmtR(item.valor).replace(/R\$\s?/, '') : '';
            document.getElementById('f-data').value = item.data || '';
            document.getElementById('f-status').value = item.status || 'Confirmado';
            document.getElementById('f-recor').value = item.recorrencia || 'unico';
            document.getElementById('f-cliente').value = item.cliente || '';
            document.getElementById('f-projeto').value = item.projeto || '';
            if (document.getElementById('f-desc')) document.getElementById('f-desc').value = item.descricao || '';
            _currentTags = Array.isArray(item.tags) ? [...item.tags] : [];
            _renderTagChips();
            modo = item.tipo === 'receita' ? 'entrada' : 'despesa';
            document.getElementById('drawer-title').textContent = modo === 'entrada' ? 'Editar Receita' : 'Editar Lançamento';
        }
    } else {
        document.getElementById('drawer-title').textContent = modo === 'entrada' ? 'Nova Receita' : 'Novo Lançamento';
    }

    setDrawerMode(modo || 'despesa');
    if (window.lucide) lucide.createIcons();
}

function closeDrawer() {
    const drawer = document.getElementById('drawer');
    const overlay = document.getElementById('overlay');
    if (drawer) drawer.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
}

function setDrawerMode(modo) {
    const tabD = document.getElementById('tab-modo-despesa');
    const tabE = document.getElementById('tab-modo-entrada');
    const subs = document.getElementById('sub-type-tabs');
    const lbl = document.getElementById('lbl-nome');
    const catSel = document.getElementById('f-cat');

    if (tabD) tabD.classList.toggle('active', modo === 'despesa');
    if (tabE) tabE.classList.toggle('active', modo === 'entrada');
    if (subs) subs.style.display = modo === 'entrada' ? 'none' : '';
    if (lbl) lbl.innerHTML = `<i data-lucide="tag" width="14" height="14"></i> ${modo === 'entrada' ? 'Origem da Receita *' : 'O que está sendo pago? *'}`;

    if (modo === 'entrada') {
        State._drawerSubType = null;
    }

    if (catSel) {
        const cats = modo === 'entrada' ? CATS.entradas : CATS[State._drawerSubType || 'fixos'];
        catSel.innerHTML = cats.map(c => `<option value="${c}">${c}</option>`).join('');
    }

    State._drawerMode = modo;
    if (window.lucide) lucide.createIcons();
}

function setDrawerSubType(subType) {
    State._drawerSubType = subType;
    const tabF = document.getElementById('tab-fixos');
    const tabU = document.getElementById('tab-unicos');
    if (tabF) tabF.classList.toggle('active', subType === 'fixos');
    if (tabU) tabU.classList.toggle('active', subType === 'unicos');
    const catSel = document.getElementById('f-cat');
    if (catSel) {
        catSel.innerHTML = CATS[subType].map(c => `<option value="${c}">${c}</option>`).join('');
    }
}

async function save() {
    const btn = document.getElementById('btn-save');
    if (!btn || btn.classList.contains('loading')) return;

    const nome = document.getElementById('f-nome').value.trim();
    const valor = cleanMoney(document.getElementById('f-valor').value);
    if (!nome || valor <= 0) { toast('Preencha descrição e valor.', 'danger'); return; }

    btn.classList.add('loading');
    try {
        const editId = document.getElementById('f-id').value;
        const drawerTitle = document.getElementById('drawer-title')?.textContent || '';
        const isReceita = drawerTitle.toLowerCase().includes('receita');

        let modo = State._drawerMode || (isReceita ? 'entrada' : 'despesa');
        const _subtypeMap = { fixos: 'fixo', unicos: 'variavel' };
        let tipo = isReceita ? 'receita' : (_subtypeMap[State._drawerSubType] || 'fixo');


        const item = {
            id: editId || `off_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            nome,
            valor,
            data: document.getElementById('f-data').value,
            tipo,
            categoria: document.getElementById('f-cat').value,
            status: document.getElementById('f-status').value,
            recorrencia: document.getElementById('f-recor').value,
            cliente: document.getElementById('f-cliente')?.value?.trim() || null,
            projeto: document.getElementById('f-projeto')?.value?.trim() || null,
            descricao: document.getElementById('f-desc')?.value?.trim() || null,
            tags: [..._currentTags]
        };

        // If online and it's a new record (starts with off_ or is empty), remove ID so Supabase generates a UUID
        if (!editId && navigator.onLine) {
            delete item.id;
        }

        if (!navigator.onLine) {
            if (!item.id) item.id = `off_${Date.now()}`;
            await State.saveLancamento(item);
        } else {
            await State.saveLancamento(item);
        }
        closeDrawer();
        renderActiveView();
        toast('Salvo com sucesso! ✅');
    } catch (err) {
        console.error('Save error details:', err.message || err, err);
        toast('Erro ao salvar. Verifique o console.', 'danger');
    } finally {
        btn.classList.remove('loading');
    }
}

// ═══ DRAWER: Projeções ═══
function openProjDrawer(tipo, id) {
    const drawer = document.getElementById('proj-drawer');
    const overlay = document.getElementById('proj-overlay');
    if (!drawer || !overlay) return;
    drawer.classList.add('open');
    overlay.classList.add('open');

    document.getElementById('pf-id').value = '';
    document.getElementById('pf-nome').value = '';
    document.getElementById('pf-valor').value = '';
    const now = new Date();
    document.getElementById('pf-mes').value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    document.getElementById('pf-status').value = 'Previsto';
    setProjType(tipo || 'saida');

    if (id) {
        const item = State.getState().projecoes.find(p => p.id === id);
        if (item) {
            document.getElementById('pf-id').value = item.id;
            document.getElementById('pf-nome').value = item.nome;
            document.getElementById('pf-valor').value = item.valor ? fmtR(item.valor).replace(/R\$\s?/, '') : '';
            document.getElementById('pf-mes').value = item.mes || item.data;
            document.getElementById('pf-status').value = item.status || 'Previsto';
            setProjType(item.tipo === 'entrada' ? 'entrada' : 'saida');
            document.getElementById('proj-drawer-title').textContent = 'Editar Projeção';
        }
    } else {
        document.getElementById('proj-drawer-title').textContent = 'Nova Projeção';
    }
    if (window.lucide) lucide.createIcons();
}

function closeProjDrawer() {
    const d = document.getElementById('proj-drawer');
    const o = document.getElementById('proj-overlay');
    if (d) d.classList.remove('open');
    if (o) o.classList.remove('open');
}

function setProjType(t) {
    State._projType = t;
    const eBtn = document.getElementById('ptab-entrada');
    const sBtn = document.getElementById('ptab-saida');
    if (eBtn) eBtn.classList.toggle('active', t === 'entrada');
    if (sBtn) sBtn.classList.toggle('active', t === 'saida');
    const catSel = document.getElementById('pf-cat');
    if (catSel) {
        const cats = t === 'entrada' ? CATS.entradas : [...CATS.fixos, ...CATS.unicos];
        catSel.innerHTML = cats.map(c => `<option value="${c}">${c}</option>`).join('');
    }
}

async function saveProj() {
    const btn = document.getElementById('btn-proj-save');
    if (!btn || btn.classList.contains('loading')) return;

    const nome = document.getElementById('pf-nome').value.trim();
    const valor = cleanMoney(document.getElementById('pf-valor').value);
    const mes = document.getElementById('pf-mes').value;
    if (!nome || valor <= 0 || !mes) { toast('Preencha todos os campos.', 'danger'); return; }

    btn.classList.add('loading');
    try {
        const item = {
            id: document.getElementById('pf-id').value || undefined,
            nome,
            valor,
            data: mes,
            mes,
            tipo: State._projType || 'saida',
            categoria: document.getElementById('pf-cat')?.value || '',
            status: document.getElementById('pf-status').value
        };
        await State.saveProjecao(item);
        closeProjDrawer();
        navigate('projecoes');
        toast('Projeção salva! 🔮');
    } catch (err) {
        console.error('Save proj error:', err);
        toast('Erro ao salvar projeção.', 'danger');
    } finally {
        btn.classList.remove('loading');
    }
}

// ═══ CAIXA ═══
function editCaixa() {
    const current = State.getState().caixa || 0;
    const input = document.getElementById('caixa-input');
    if (input) {
        input.value = current > 0 ? current.toFixed(2).replace('.', ',') : '';
        maskMoney({ target: input });
    }
    document.getElementById('caixa-modal')?.classList.add('open');
    document.getElementById('caixa-overlay')?.classList.add('open');
    setTimeout(() => input?.focus(), 100);
}

function closeCaixaModal() {
    document.getElementById('caixa-modal')?.classList.remove('open');
    document.getElementById('caixa-overlay')?.classList.remove('open');
}

async function saveCaixaModal() {
    const input = document.getElementById('caixa-input');
    const valor = cleanMoney(input?.value || '0');
    await State.saveCaixa(valor);
    closeCaixaModal();
    renderActiveView();
    toast('Caixa atualizado!');
}

// ═══ MODALS ═══
function openExportModal() {
    const m = document.getElementById('export-modal');
    const o = document.getElementById('export-overlay');
    if (m) m.classList.add('open');
    if (o) o.classList.add('open');
}

function closeExportModal() {
    const m = document.getElementById('export-modal');
    const o = document.getElementById('export-overlay');
    if (m) m.classList.remove('open');
    if (o) o.classList.remove('open');
}

function openTaxModal() {
    const s = State.getState();
    const regime = document.getElementById('tax-regime');
    const rate = document.getElementById('tax-rate');
    if (regime) regime.value = s.regime_tributario;
    if (rate) rate.value = (s.aliquota_imposto * 100).toFixed(1);
    const m = document.getElementById('tax-modal');
    const o = document.getElementById('tax-overlay');
    if (m) m.classList.add('open');
    if (o) o.classList.add('open');
}

async function saveTaxConfig() {
    const rate = parseFloat(document.getElementById('tax-rate').value) / 100;
    const regime = document.getElementById('tax-regime').value;
    if (await State.updateTaxConfig(rate, regime)) {
        const m = document.getElementById('tax-modal');
        const o = document.getElementById('tax-overlay');
        if (m) m.classList.remove('open');
        if (o) o.classList.remove('open');
        refreshTaxDisplay();
        renderActiveView();
        toast('Configuração fiscal atualizada!');
    }
}

function closeTaxModal() {
    const m = document.getElementById('tax-modal');
    const o = document.getElementById('tax-overlay');
    if (m) m.classList.remove('open');
    if (o) o.classList.remove('open');
}

function openDREModal(key) {
    const parts = key.split('_');
    const tipo = parts[0];
    const mRaw = parts[1]; // pode ser 'anual' ou número
    const yNum = parseInt(parts[2]);
    const mIdx = mRaw === 'anual' ? 'anual' : parseInt(mRaw);
    const MONTHS_PT = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    const tipoLabels = { receita: 'Receitas', fixo: 'Custos Fixos', variavel: 'Gastos Variáveis' };

    const isConf = x => x?.status === 'Confirmado';
    let data = [];
    if (tipo === 'receita') data = State.getEntradas();
    else if (tipo === 'fixo') data = State.getFixos();
    else if (tipo === 'variavel') data = State.getVariaveis();

    const filtered = filterData(data, mIdx, yNum).filter(isConf);
    const total = safe(filtered.reduce((a, b) => a + Number(b.valor), 0));

    const periodoLabel = mIdx === 'anual' ? `Ano ${yNum}` : `${MONTHS_PT[mIdx]} ${yNum}`;
    document.getElementById('dre-modal-title').textContent = `${tipoLabels[tipo] || tipo} — ${periodoLabel}`;
    document.getElementById('dre-modal-sub').textContent = `${filtered.length} registro(s) confirmados`;
    document.getElementById('dre-modal-total').textContent = fmtR(total);
    document.getElementById('dre-modal-count').textContent = filtered.length;

    const tbody = document.getElementById('dre-modal-tbody');
    if (tbody) {
        tbody.innerHTML = filtered.length === 0
            ? `<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--text-dim)">Nenhum registro encontrado.</td></tr>`
            : filtered.map(l => `<tr>
                <td>${l.data ? l.data.split('-').reverse().join('/') : '—'}</td>
                <td>${esc(l.nome)}</td>
                <td>${esc(l.cliente || '—')}</td>
                <td>${esc(l.projeto || '—')}</td>
                <td style="text-align:right;font-weight:700">${fmtR(l.valor)}</td>
            </tr>`).join('');
    }

    const m = document.getElementById('dre-modal');
    const o = document.getElementById('dre-overlay');
    if (m) m.classList.add('open');
    if (o) o.classList.add('open');
    if (window.lucide) lucide.createIcons();
}

function closeDREModal() {
    const m = document.getElementById('dre-modal');
    const o = document.getElementById('dre-overlay');
    if (m) m.classList.remove('open');
    if (o) o.classList.remove('open');
}

function openMonthModal(mIdx, yNum) {
    const MONTHS_PT = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    const isConf = x => x?.status === 'Confirmado';
    const eV = safe(filterData(State.getEntradas(), mIdx, yNum).filter(isConf).reduce((a, b) => a + Number(b.valor), 0));
    const fV = safe(filterData(State.getFixos(), mIdx, yNum).filter(isConf).reduce((a, b) => a + Number(b.valor), 0));
    const vV = safe(filterData(State.getVariaveis(), mIdx, yNum).filter(isConf).reduce((a, b) => a + Number(b.valor), 0));
    const tax = eV * State.getState().aliquota_imposto;
    const saldo = eV - fV - vV - tax;

    document.getElementById('mm-title').textContent = `${MONTHS_PT[mIdx]} ${yNum}`;
    document.getElementById('mm-rec').textContent = fmtR(eV);
    document.getElementById('mm-fix').textContent = fmtR(fV);
    document.getElementById('mm-var').textContent = fmtR(vV + tax);
    const elSaldo = document.getElementById('mm-saldo');
    if (elSaldo) {
        elSaldo.textContent = fmtR(saldo);
        elSaldo.style.color = saldo >= 0 ? 'var(--success)' : 'var(--danger)';
    }

    const m = document.getElementById('month-modal');
    const o = document.getElementById('month-overlay');
    if (m) m.classList.add('open');
    if (o) o.classList.add('open');
}

function closeMonthModal() {
    const m = document.getElementById('month-modal');
    const o = document.getElementById('month-overlay');
    if (m) m.classList.remove('open');
    if (o) o.classList.remove('open');
}

// ═══ DELETE ═══
async function deleteLancamento(id, nome) {
    if (!confirm(`Excluir "${nome}"?\n\nEsta ação não pode ser desfeita.`)) return;
    try {
        await State.deleteLancamento(id);
        renderActiveView();
        toast('Lançamento excluído.', 'success');
    } catch (err) {
        toast('Erro ao excluir lançamento.', 'danger');
    }
}

async function deleteProjecao(id, nome) {
    if (!confirm(`Excluir projeção "${nome}"?\n\nEsta ação não pode ser desfeita.`)) return;
    try {
        await State.deleteProjecao(id);
        renderActiveView();
        toast('Projeção excluída.', 'success');
    } catch (err) {
        toast('Erro ao excluir projeção.', 'danger');
    }
}

// ═══ EXPORT ═══
function runExport() {
    const format = document.getElementById('exp-format')?.value || 'csv';
    const months = parseInt(document.getElementById('exp-period')?.value || '1');
    const lancamentos = State.getState().lancamentos;

    // Filtra pelo período selecionado
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - months);
    const data = lancamentos.filter(l => l.data && new Date(l.data) >= cutoff);

    if (format === 'csv') {
        const headers = ['Data', 'Descrição', 'Tipo', 'Categoria', 'Status', 'Recorrência', 'Cliente', 'Projeto', 'Valor'];
        const rows = data.map(l => [
            l.data || '', l.nome || '', l.tipo || '', l.categoria || '',
            l.status || '', l.recorrencia || '', l.cliente || '', l.projeto || '',
            Number(l.valor || 0).toFixed(2)
        ]);
        const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url;
        a.download = `CFO_Relatorio_${new Date().toISOString().split('T')[0]}.csv`;
        a.click(); URL.revokeObjectURL(url);
        closeExportModal();
        toast('CSV gerado com sucesso! 📊');
    } else if (format === 'pdf') {
        if (typeof window.jspdf === 'undefined' && typeof jsPDF === 'undefined') {
            toast('jsPDF não carregado. Use CSV.', 'danger'); return;
        }
        const { jsPDF: J } = window.jspdf || { jsPDF };
        const doc = new J();
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.text('Relatório CFO — BG Tech', 14, 20);
        doc.setFontSize(10); doc.setFont('helvetica', 'normal');
        doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 28);
        const tableData = data.map(l => [l.data || '', l.nome || '', l.tipo || '', l.categoria || '', l.status || '', `R$ ${Number(l.valor||0).toFixed(2)}`]);
        if (doc.autoTable) {
            doc.autoTable({ head: [['Data','Descrição','Tipo','Categoria','Status','Valor']], body: tableData, startY: 35, styles: { fontSize: 8 } });
        }
        doc.save(`CFO_Relatorio_${new Date().toISOString().split('T')[0]}.pdf`);
        closeExportModal();
        toast('PDF gerado com sucesso! 📄');
    }
}

// ═══ TAGS ═══
function _renderTagChips() {
    const chips = document.getElementById('f-tags-chips');
    if (!chips) return;
    chips.innerHTML = _currentTags.map(t =>
        `<span class="tag-chip">${esc(t)}<span class="tag-chip-remove" onclick="window.CFO.removeTag('${esc(t)}')">&times;</span></span>`
    ).join('');
}

function addTag(tag) {
    tag = (tag || '').trim();
    if (!tag || _currentTags.includes(tag)) return;
    _currentTags.push(tag);
    _renderTagChips();
    const input = document.getElementById('f-tags-input');
    if (input) input.value = '';
}

function removeTag(tag) {
    _currentTags = _currentTags.filter(t => t !== tag);
    _renderTagChips();
}

// ═══ SIGN OUT ═══
async function signOut() {
    try { await Auth.signOut(); } catch (e) { window.location.reload(); }
}

// ═══ MONEY MASKS ═══
document.querySelectorAll('[data-mask="money"]').forEach(el => {
    el.addEventListener('input', maskMoney);
});
document.getElementById('caixa-input')?.addEventListener('input', maskMoney);

// ═══ GLOBAL API ═══
window.CFO = {
    navigate, openDrawer, closeDrawer, setDrawerMode, setDrawerSubType, save,
    openProjDrawer, closeProjDrawer, setProjType, saveProj,
    editCaixa, closeCaixaModal, saveCaixaModal,
    openExportModal, closeExportModal, runExport,
    openTaxModal, closeTaxModal, saveTaxConfig,
    openDREModal, closeDREModal, openMonthModal, closeMonthModal,
    deleteLancamento, deleteProjecao,
    addTag, removeTag,
    signOut,
    drilldown: (tipo, m, y) => openDREModal(`${tipo}_${m}_${y}`),
};

// ═══ EVENT LISTENERS ═══
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;
    const btn = document.getElementById('btn-login');
    const errEl = document.getElementById('login-error');

    if (errEl) { errEl.textContent = ''; errEl.style.display = 'none'; }
    if (btn) btn.classList.add('loading');

    try {
        await Auth.signIn(email, pass);
        // onAuthChange will fire and call initApp() — nothing more needed here
    } catch (err) {
        if (errEl) { errEl.textContent = err.message; errEl.style.display = 'block'; }
        if (btn) btn.classList.remove('loading');
    }
});

// Filter changes
['fMonth', 'fYear', 'fClient', 'fProject'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', () => {
        const s = State.getState();
        s.filters = {
            m: document.getElementById('fMonth')?.value || 'anual',
            y: document.getElementById('fYear')?.value || String(new Date().getFullYear()),
            client: (document.getElementById('fClient')?.value || 'all') === 'all' ? '' : document.getElementById('fClient').value,
            project: (document.getElementById('fProject')?.value || 'all') === 'all' ? '' : document.getElementById('fProject').value,
        };
        renderActiveView();
    });
});

// Search handlers
['search-entradas', 'search-gastos', 'search-unicos'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase().trim();
        const tbodyMap = { 'search-entradas': 'table-entradas', 'search-gastos': 'table-body', 'search-unicos': 'table-body-unicos' };
        const tbody = document.getElementById(tbodyMap[id]);
        if (!tbody) return;
        tbody.querySelectorAll('tr').forEach(row => {
            row.style.display = !term || row.textContent.toLowerCase().includes(term) ? '' : 'none';
        });
    });
});

// Tags: Enter key handler
document.getElementById('f-tags-input')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        addTag(e.target.value);
    }
});

// Overlay close handlers
document.getElementById('overlay')?.addEventListener('click', closeDrawer);
document.getElementById('proj-overlay')?.addEventListener('click', closeProjDrawer);
document.getElementById('dre-overlay')?.addEventListener('click', closeDREModal);
document.getElementById('month-overlay')?.addEventListener('click', closeMonthModal);
document.getElementById('export-overlay')?.addEventListener('click', closeExportModal);
document.getElementById('tax-overlay')?.addEventListener('click', closeTaxModal);
document.getElementById('caixa-overlay')?.addEventListener('click', closeCaixaModal);

// Mobile sidebar toggle
(function() {
    const btnMenu = document.getElementById('btn-menu');
    const sidebar = document.querySelector('.sidebar');
    if (!btnMenu || !sidebar) return;

    // Create overlay element for closing sidebar on outside click
    let sidebarOverlay = document.querySelector('.sidebar-overlay');
    if (!sidebarOverlay) {
        sidebarOverlay = document.createElement('div');
        sidebarOverlay.className = 'sidebar-overlay';
        document.body.appendChild(sidebarOverlay);
    }

    function openSidebar() {
        sidebar.classList.add('open');
        sidebarOverlay.classList.add('open');
    }

    function closeSidebar() {
        sidebar.classList.remove('open');
        sidebarOverlay.classList.remove('open');
    }

    btnMenu.addEventListener('click', () => {
        sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
    });

    sidebarOverlay.addEventListener('click', closeSidebar);

    // Close sidebar when a nav item is tapped on mobile
    sidebar.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (window.innerWidth <= 1024) closeSidebar();
        });
    });
})();

// ═══ AUTH STATE ═══
let _appInitialized = false;
Auth.onAuthChange(user => {
    if (user) {
        if (!_appInitialized) {
            _appInitialized = true;
            if (loginScreen) loginScreen.style.display = 'none';
            const overlay = document.getElementById('welcome-overlay');
            if (overlay) overlay.classList.add('active');
            initApp();
        }
    } else {
        _appInitialized = false;
        if (loginScreen) loginScreen.style.display = 'flex';
        if (appEl) { appEl.style.display = 'none'; appEl.style.opacity = '0'; }
    }
});
