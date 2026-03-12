// ═══════════════════════════════════════════════
// CFO Dashboard v2 — Annual Balance View
// ═══════════════════════════════════════════════

import { fmtR, filterData, safe, MONTHS } from '../utils.js';
import * as State from '../state.js';

export function renderAnnual() {
  const { y, client, project } = State.getFilters();
  const entradas = State.getEntradas();
  const variaveis = State.getVariaveis();
  const fixos = State.getFixos();
  const isConf = x => x?.status === 'Confirmado';
  const taxRate = State.getState().aliquota_imposto;

  const grid = document.getElementById('annual-grid');
  if (!grid) return;

  const nowMonth = new Date().getMonth();
  const nowYear = new Date().getFullYear();

  let totalIn = 0, totalOut = 0;
  let html = '';
  for (let i = 0; i < 12; i++) {
    const eM = filterData(entradas, i, y, false, client, project).filter(isConf);
    const vM = filterData(variaveis, i, y, false, client, project).filter(isConf);
    const fM = filterData(fixos, i, y, false, client, project).filter(isConf);

    const income = safe(eM.reduce((a, b) => a + Number(b.valor), 0));
    const rawExpense = safe(vM.reduce((a, b) => a + Number(b.valor), 0)) + safe(fM.reduce((a, b) => a + Number(b.valor), 0));
    const tax = income * taxRate;
    const expense = rawExpense + tax; // alinhado com DRE: inclui impostos
    const balance = income - expense;

    totalIn += income;
    totalOut += expense;

    const isCurrent = (i === nowMonth && String(y) === String(nowYear));
    const isEmpty = (income === 0 && rawExpense === 0);

    html += `
            <div class="card annual-card${isEmpty ? ' empty' : ' clickable'}${isCurrent ? ' current' : ''}"${isEmpty ? '' : ` onclick="window.CFO.navigate('dre', { m: '${i}' })"`}>
                <div class="annual-month">${MONTHS[i]}${isCurrent ? ' <span style="color:var(--primary);font-size:8px;font-weight:700;letter-spacing:.08em">● ATUAL</span>' : ''}</div>
                <div class="annual-vals">
                    <div class="annual-val income"><span class="annual-val-label">Rec.</span><span>${fmtR(income)}</span></div>
                    <div class="annual-val expense"><span class="annual-val-label">Desp.</span><span>${fmtR(expense)}</span></div>
                </div>
                <div class="annual-balance-wrap">
                    <span class="annual-balance-label">Saldo</span>
                    <div class="annual-balance ${balance >= 0 ? 'pos' : 'neg'}">${fmtR(balance)}</div>
                </div>
            </div>
        `;
  }
  grid.innerHTML = html;

  // Summary cards do topo
  const annualSaldo = totalIn - totalOut;
  const elIn = document.getElementById('annual-total-in');
  const elOut = document.getElementById('annual-total-out');
  const elSaldo = document.getElementById('annual-saldo');
  if (elIn) elIn.textContent = fmtR(totalIn);
  if (elOut) elOut.textContent = fmtR(totalOut);
  if (elSaldo) {
    elSaldo.textContent = fmtR(annualSaldo);
    elSaldo.style.color = annualSaldo >= 0 ? 'var(--green)' : 'var(--red)';
  }
}
