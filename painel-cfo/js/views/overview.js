// ═══════════════════════════════════════════════
// CFO Dashboard v2 — Overview View
// ═══════════════════════════════════════════════

import { fmtR, filterData, safe, pct } from '../utils.js';
import * as State from '../state.js';

export function renderOverview() {
    const { m, y } = State.getFilters();
    const lancamentos = State.getState().lancamentos;
    const isConf = x => x?.status === 'Confirmado';

    // Filtros por período
    const eM = filterData(State.getEntradas(), m, y).filter(isConf);
    const fM = filterData(State.getFixos(), m, y).filter(isConf);
    const vM = filterData(State.getVariaveis(), m, y).filter(isConf);

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

    if (elMargin) {
        elMargin.innerHTML = `<span class="badge ${resLiq >= 0 ? 'success' : 'danger'}">${resLiq >= 0 ? 'Lucro' : 'Déficit'}: ${(margemLiq * 100).toFixed(1)}%</span>`;
    }
    if (elBurn) elBurn.textContent = fmtR(burnRate);
    if (elRunway) elRunway.textContent = runway >= 99 ? '99+ Meses' : runway.toFixed(1) + ' Meses';

    // 8º card: Variáveis + Impostos
    const elVar = document.getElementById('v-var-ov');
    if (elVar) elVar.textContent = fmtR(sumVariaveis + impostos);

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
