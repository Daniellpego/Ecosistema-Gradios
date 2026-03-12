// ═══════════════════════════════════════════════
// CFO Dashboard v2 — Overview View
// ═══════════════════════════════════════════════

import { fmtR, filterData, safe, pct } from '../utils.js';
import * as State from '../state.js';

function trendBadge(current, previous) {
    if (!previous || previous === 0) return '';
    const change = ((current - previous) / previous) * 100;
    const absChange = Math.abs(change).toFixed(1);
    if (Math.abs(change) < 0.5) return '<span class="trend-badge neutral">= 0%</span>';
    if (change > 0) return `<span class="trend-badge up">↑ ${absChange}%</span>`;
    return `<span class="trend-badge down">↓ ${absChange}%</span>`;
}

export function renderOverview() {
    const { m, y } = State.getFilters();
    const lancamentos = State.getState().lancamentos;
    const isConf = x => x?.status === 'Confirmado';

    // Filtros por período
    const eM = filterData(State.getEntradas(), m, y).filter(isConf);
    const fM = filterData(State.getFixos(), m, y).filter(isConf);
    const vM = filterData(State.getVariaveis(), m, y).filter(isConf);

    // Previous period for trend comparison
    let prevM = m, prevY = y;
    if (m !== 'anual') {
        const mi = parseInt(m);
        if (mi === 0) { prevM = '11'; prevY = String(parseInt(y) - 1); }
        else { prevM = String(mi - 1); prevY = y; }
    }
    const ePrev = m !== 'anual' ? filterData(State.getEntradas(), prevM, prevY).filter(isConf) : [];
    const fPrev = m !== 'anual' ? filterData(State.getFixos(), prevM, prevY).filter(isConf) : [];
    const vPrev = m !== 'anual' ? filterData(State.getVariaveis(), prevM, prevY).filter(isConf) : [];
    const prevEntradas = safe(ePrev.reduce((a, b) => a + Number(b.valor), 0));
    const prevFixos = safe(fPrev.reduce((a, b) => a + Number(b.valor), 0));
    const prevVariaveis = safe(vPrev.reduce((a, b) => a + Number(b.valor), 0));

    // MRR Lógica V2: Estritamente recorrência mensal nas receitas
    const sumMRR = safe(eM.filter(x => x.recorrencia === 'mensal').reduce((a, b) => a + Number(b.valor), 0));
    const sumEntradas = safe(eM.reduce((a, b) => a + Number(b.valor), 0));
    const sumFixos = safe(fM.reduce((a, b) => a + Number(b.valor), 0));
    const sumVariaveis = safe(vM.reduce((a, b) => a + Number(b.valor), 0));
    const totalGastos = sumFixos + sumVariaveis;

    // KPIs
    const taxRate = State.getState().aliquota_imposto;
    const impostos = sumEntradas * taxRate;
    const resLiq = sumEntradas - totalGastos - impostos;
    const burnRate = sumFixos + sumVariaveis + impostos;
    const margemLiq = sumEntradas > 0 ? resLiq / sumEntradas : 0;
    const runway = burnRate > 0 ? State.getState().caixa / burnRate : 99;

    // Render DOM
    const elCaixa = document.getElementById('v-caixa');
    const elMRR = document.getElementById('v-mrr-ov');
    const elReceita = document.getElementById('v-receita-ov');
    const elFixed = document.getElementById('v-fixos-ov');
    const elResLiq = document.getElementById('v-res-liq');
    const elMargin = document.getElementById('v-res-liq-sub');
    const elBurn = document.getElementById('v-burn-ov');
    const elRunway = document.getElementById('v-runway');

    if (elCaixa) elCaixa.textContent = fmtR(State.getState().caixa);
    if (elMRR) elMRR.textContent = fmtR(sumMRR);
    if (elReceita) elReceita.textContent = fmtR(sumEntradas);
    if (elFixed) elFixed.textContent = fmtR(sumFixos);

    if (elResLiq) {
        elResLiq.textContent = fmtR(resLiq);
        elResLiq.className = 'stat-value font-title ' + (resLiq >= 0 ? 'pos' : 'neg');
    }

    // Toggle card color based on result
    const cardResLiq = document.getElementById('card-res-liq');
    if (cardResLiq) {
        cardResLiq.classList.toggle('c-success', resLiq >= 0);
        cardResLiq.classList.toggle('c-danger', resLiq < 0);
    }

    if (elMargin) {
        elMargin.innerHTML = `<span class="badge ${resLiq >= 0 ? 'success' : 'danger'}">${resLiq >= 0 ? 'Lucro' : 'Déficit'}: ${(margemLiq * 100).toFixed(1)}%</span>`;
    }
    if (elBurn) elBurn.textContent = fmtR(burnRate);
    if (elRunway) elRunway.textContent = runway >= 99 ? '99+ Meses' : runway.toFixed(1) + ' Meses';

    // 8º card: Variáveis + Impostos
    const elVar = document.getElementById('v-var-ov');
    if (elVar) elVar.textContent = fmtR(sumVariaveis + impostos);

    // Trend indicators (month-over-month)
    if (m !== 'anual') {
        const tReceita = document.getElementById('t-receita-ov');
        const tFixos = document.getElementById('t-fixos-ov');
        const tBurn = document.getElementById('t-burn-ov');
        const tVar = document.getElementById('t-var-ov');
        const tMrr = document.getElementById('t-mrr-ov');
        const prevMRR = safe(ePrev.filter(x => x.recorrencia === 'mensal').reduce((a, b) => a + Number(b.valor), 0));
        const prevBurn = prevFixos + prevVariaveis + (prevEntradas * taxRate);

        if (tReceita) tReceita.innerHTML = trendBadge(sumEntradas, prevEntradas) + ' <span style="font-size:11px;color:var(--text-dim)">vs mês anterior</span>';
        if (tFixos) tFixos.innerHTML = trendBadge(sumFixos, prevFixos);
        if (tBurn) tBurn.innerHTML = trendBadge(burnRate, prevBurn);
        if (tVar) tVar.innerHTML = trendBadge(sumVariaveis + impostos, prevVariaveis + prevEntradas * taxRate);
        if (tMrr) tMrr.innerHTML = trendBadge(sumMRR, prevMRR);
    }

    // Status banner de saúde financeira
    const banner = document.getElementById('status-banner');
    if (banner) {
        let cls, iconName, msg;
        if (runway >= 99 && burnRate === 0) {
            cls = 'verde'; iconName = 'check-circle-2'; msg = 'Sem custos confirmados no período — sem queima de caixa.';
        } else if (runway >= 6) {
            cls = 'verde'; iconName = 'check-circle-2'; msg = `Financeiramente saudável — Runway de ${runway >= 99 ? '99+' : runway.toFixed(1)} meses. Margem líquida: ${(margemLiq * 100).toFixed(1)}%.`;
        } else if (runway >= 3) {
            cls = 'amarelo'; iconName = 'alert-triangle'; msg = `Atenção: Runway de ${runway.toFixed(1)} meses. Considere reduzir custos ou aumentar receitas.`;
        } else {
            cls = 'vermelho'; iconName = 'alert-octagon'; msg = `CRÍTICO: Runway de ${runway.toFixed(1)} meses. Caixa em risco — ação imediata necessária.`;
        }
        banner.className = `status-banner ${cls}`;
        banner.style.display = '';
        banner.innerHTML = `<i data-lucide="${iconName}" width="16" height="16" style="flex-shrink:0"></i><span>${msg}</span>`;
        if (window.lucide) lucide.createIcons();
    }
}
