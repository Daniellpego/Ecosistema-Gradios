// ═══════════════════════════════════════════════
// CFO Dashboard v2 — Projeções View
// ═══════════════════════════════════════════════

import { fmtR, safe, esc } from '../utils.js';
import * as State from '../state.js';

export function renderProjecoes() {
    const allProj = State.getState().projecoes.filter(p => p.status !== 'Cancelado');

    // Filtro de horizonte (3/6/12 meses a partir do mês atual)
    const horizonte = parseInt(document.getElementById('p-horizonte')?.value || '6');
    const now = new Date();
    const startYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const cutoff = new Date(now.getFullYear(), now.getMonth() + horizonte, 1);
    const cutoffYM = `${cutoff.getFullYear()}-${String(cutoff.getMonth() + 1).padStart(2, '0')}`;
    const proj = allProj.filter(p => {
        const mesStr = (p.mes || p.data || '').substring(0, 7);
        return !mesStr || (mesStr >= startYM && mesStr <= cutoffYM);
    });

    const tbody = document.getElementById('p-table-body');
    const emptyEl = document.getElementById('p-table-empty');

    const entradas = proj.filter(p => p.tipo === 'entrada');
    const saidas = proj.filter(p => p.tipo === 'saida');

    const totalIn = safe(entradas.reduce((a, b) => a + Number(b.valor), 0));
    const totalOut = safe(saidas.reduce((a, b) => a + Number(b.valor), 0));
    const saldo = totalIn - totalOut;

    // Update KPI cards
    const elIn = document.getElementById('p-v-entradas');
    const elOut = document.getElementById('p-v-saidas');
    const elSaldo = document.getElementById('p-v-saldo');
    const cardSaldo = document.getElementById('p-card-saldo');

    if (elIn) elIn.textContent = fmtR(totalIn);
    if (elOut) elOut.textContent = fmtR(totalOut);
    if (elSaldo) elSaldo.textContent = fmtR(saldo);
    if (cardSaldo) {
        cardSaldo.classList.toggle('c-success', saldo >= 0);
        cardSaldo.classList.toggle('c-danger', saldo < 0);
    }

    if (!tbody) return;

    const tfoot = document.getElementById('tfoot-proj');

    if (proj.length === 0) {
        tbody.innerHTML = '';
        if (tfoot) tfoot.innerHTML = '';
        if (emptyEl) { emptyEl.classList.add('visible'); if (window.lucide) lucide.createIcons(); }
        return;
    }

    if (emptyEl) emptyEl.classList.remove('visible');

    const netTotal = totalIn - totalOut;
    if (tfoot) {
        tfoot.innerHTML = `<tr class="tfoot-row"><td colspan="3"><span class="tfoot-count">${proj.length} ${proj.length === 1 ? 'projeção' : 'projeções'}</span></td><td></td><td class="tfoot-amount ${netTotal >= 0 ? 'pos' : 'neg'}">${fmtR(netTotal)}</td><td></td></tr>`;
    }

    tbody.innerHTML = proj.map(p => `
        <tr>
            <td>${esc(p.mes || p.data || '—')}</td>
            <td>
                <div class="table-main-text">${esc(p.nome)}</div>
                <span class="badge ${p.tipo === 'entrada' ? 'success' : 'danger'}">${p.tipo === 'entrada' ? 'Entrada' : 'Saída'}</span>
            </td>
            <td>${esc(p.categoria || '—')}</td>
            <td><span class="badge ${(p.status || '').toLowerCase()}">${esc(p.status || 'Previsto')}</span></td>
            <td style="text-align:right" class="font-title ${p.tipo === 'entrada' ? 'pos' : 'neg'}">${fmtR(p.valor)}</td>
            <td style="text-align:center">
                <div class="row-actions">
                    <button class="btn-icon" onclick="window.CFO.openProjDrawer('${p.tipo}','${p.id}')"><i data-lucide="edit-3"></i></button>
                    <button class="btn-icon danger" onclick="window.CFO.deleteProjecao('${p.id}','${esc(p.nome)}')"><i data-lucide="trash-2"></i></button>
                </div>
            </td>
        </tr>
    `).join('');

    if (window.lucide) lucide.createIcons();
}
