// ═══════════════════════════════════════════════
// CFO Dashboard v2 — Lançamentos Table View
// ═══════════════════════════════════════════════

import { fmtR, fmtD, esc } from '../utils.js';
import * as State from '../state.js';

const TBODY_IDS = {
    entradas: 'table-entradas',
    fixos: 'table-body',
    unicos: 'table-body-unicos'
};

const EMPTY_IDS = {
    entradas: 'entradas-empty',
    fixos: 'table-empty',
    unicos: 'table-empty-unicos'
};

export function renderLancamentosTable() {
    const tab = State.getTab();
    const { m, y } = State.getFilters();
    let data = [];

    if (tab === 'entradas') data = State.getEntradas();
    else if (tab === 'fixos') data = State.getFixos();
    else if (tab === 'unicos') data = State.getVariaveis();

    const filtered = data.filter(l => {
        if (!l.data) return false;
        const [ly, lm] = l.data.split('-');
        return ly === String(y) && (m === 'anual' || lm === String(parseInt(m) + 1).padStart(2, '0'));
    });

    const tbodyId = TBODY_IDS[tab];
    const emptyId = EMPTY_IDS[tab];
    const tbody = document.getElementById(tbodyId);
    const emptyEl = document.getElementById(emptyId);

    if (!tbody) return;

    const tfootMap = { entradas: 'tfoot-entradas', fixos: 'tfoot-fixos', unicos: 'tfoot-unicos' };
    const tfoot = document.getElementById(tfootMap[tab]);

    if (filtered.length === 0) {
        tbody.innerHTML = '';
        if (tfoot) tfoot.innerHTML = '';
        if (emptyEl) { emptyEl.classList.add('visible'); if (window.lucide) lucide.createIcons(); }
        return;
    }

    if (emptyEl) emptyEl.classList.remove('visible');

    const total = filtered.reduce((sum, l) => sum + Number(l.valor || 0), 0);
    if (tfoot) {
        tfoot.innerHTML = `<tr class="tfoot-row"><td colspan="5"><span class="tfoot-count">${filtered.length} ${filtered.length === 1 ? 'item' : 'itens'}</span></td><td class="tfoot-amount">${fmtR(total)}</td><td></td></tr>`;
    }

    tbody.innerHTML = filtered.map(l => `
        <tr>
            <td>${fmtD(l.data)}</td>
            <td>
                <div class="table-main-text">${esc(l.nome)}</div>
                ${(l.cliente || l.projeto) ? `<div class="table-sub-text">${esc([l.cliente, l.projeto].filter(Boolean).join(' · '))}</div>` : ''}
            </td>
            <td>${esc(l.categoria || '—')}</td>
            <td>${esc(l.recorrencia === 'mensal' ? 'Mensal' : 'Único')}</td>
            <td><span class="badge ${(l.status || '').toLowerCase()}">${esc(l.status)}</span></td>
            <td style="text-align:right" class="font-title">${fmtR(l.valor)}</td>
            <td style="text-align:center">
                <div class="row-actions">
                    <button class="btn-icon" onclick="window.CFO.openDrawer('${l.id}')"><i data-lucide="edit-3"></i></button>
                    <button class="btn-icon danger" onclick="window.CFO.deleteLancamento('${l.id}', '${esc(l.nome)}')"><i data-lucide="trash-2"></i></button>
                </div>
            </td>
        </tr>
    `).join('');

    if (window.lucide) lucide.createIcons();
}
