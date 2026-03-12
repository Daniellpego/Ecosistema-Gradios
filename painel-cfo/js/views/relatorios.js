// ═══════════════════════════════════════════════
// CFO Dashboard v2 — Relatórios View
// ═══════════════════════════════════════════════

import { fmtR, fmtD, esc, filterData, safe, calcTax, MONTHS } from '../utils.js';
import * as State from '../state.js';

export function renderRelatorios() {
    const container = document.getElementById('view-relatorios');
    if (!container) return;

    const { m, y } = State.getFilters();
    const entradas = State.getEntradas();
    const fixos = State.getFixos();
    const variaveis = State.getVariaveis();
    const isConf = x => x?.status === 'Confirmado';

    const eFiltered = filterData(entradas, m, y).filter(isConf);
    const fFiltered = filterData(fixos, m, y).filter(isConf);
    const vFiltered = filterData(variaveis, m, y).filter(isConf);

    const totalReceita = safe(eFiltered.reduce((a, b) => a + Number(b.valor), 0));
    const totalFixo = safe(fFiltered.reduce((a, b) => a + Number(b.valor), 0));
    const totalVar = safe(vFiltered.reduce((a, b) => a + Number(b.valor), 0));
    const imposto = calcTax(totalReceita);
    const totalDespesa = totalFixo + totalVar + imposto;
    const resultado = totalReceita - totalDespesa;

    const periodoLabel = m === 'anual' ? `Ano ${y}` : `${MONTHS[parseInt(m)]} ${y}`;

    container.innerHTML = `
        <div style="margin-bottom:1.5rem">
            <h3 style="font-size:1rem;font-weight:600;color:var(--text);margin-bottom:0.25rem">
                Relatório Gerencial — ${esc(periodoLabel)}
            </h3>
            <p style="font-size:0.78rem;color:var(--text-dim)">
                ${eFiltered.length + fFiltered.length + vFiltered.length} lançamentos confirmados no período
            </p>
        </div>

        <!-- Summary Cards -->
        <div class="grid-3" style="gap:1rem;margin-bottom:1.5rem">
            <div class="metric-card" style="border-left:3px solid var(--success)">
                <span class="metric-label">Receita Total</span>
                <span class="metric-value" style="color:var(--success)">${fmtR(totalReceita)}</span>
                <span class="metric-sub">${eFiltered.length} lançamento(s)</span>
            </div>
            <div class="metric-card" style="border-left:3px solid var(--danger)">
                <span class="metric-label">Despesa Total</span>
                <span class="metric-value" style="color:var(--danger)">${fmtR(totalDespesa)}</span>
                <span class="metric-sub">Fixos + Variáveis + Impostos</span>
            </div>
            <div class="metric-card" style="border-left:3px solid ${resultado >= 0 ? 'var(--success)' : 'var(--danger)'}">
                <span class="metric-label">Resultado Líquido</span>
                <span class="metric-value" style="color:${resultado >= 0 ? 'var(--success)' : 'var(--danger)'}">${fmtR(resultado)}</span>
                <span class="metric-sub">Margem: ${totalReceita > 0 ? ((resultado / totalReceita) * 100).toFixed(1) : '0.0'}%</span>
            </div>
        </div>

        <!-- Breakdown Table -->
        <div class="card" style="margin-bottom:1.5rem">
            <h4 style="font-size:0.85rem;font-weight:600;margin-bottom:1rem">DRE Simplificado</h4>
            <table class="table" style="font-size:0.82rem">
                <tbody>
                    <tr><td style="font-weight:600">Receita Bruta</td><td style="text-align:right;color:var(--success);font-weight:700">${fmtR(totalReceita)}</td></tr>
                    <tr><td style="padding-left:1.5rem;color:var(--text-dim)">(-) Custos Fixos</td><td style="text-align:right;color:var(--danger)">${fmtR(totalFixo)}</td></tr>
                    <tr><td style="padding-left:1.5rem;color:var(--text-dim)">(-) Gastos Variáveis</td><td style="text-align:right;color:var(--danger)">${fmtR(totalVar)}</td></tr>
                    <tr><td style="padding-left:1.5rem;color:var(--text-dim)">(-) Impostos (${(State.getState().aliquota_imposto * 100).toFixed(1)}%)</td><td style="text-align:right;color:var(--danger)">${fmtR(imposto)}</td></tr>
                    <tr style="border-top:2px solid var(--border)"><td style="font-weight:700">Resultado Líquido</td><td style="text-align:right;font-weight:700;color:${resultado >= 0 ? 'var(--success)' : 'var(--danger)'}">${fmtR(resultado)}</td></tr>
                </tbody>
            </table>
        </div>

        <!-- Category Breakdown -->
        <div class="card" style="margin-bottom:1.5rem">
            <h4 style="font-size:0.85rem;font-weight:600;margin-bottom:1rem">Despesas por Categoria</h4>
            ${_renderCategoryBreakdown([...fFiltered, ...vFiltered])}
        </div>

        <!-- Export Actions -->
        <div style="display:flex;gap:0.75rem;flex-wrap:wrap">
            <button class="btn btn-sm" onclick="window.CFO.openExportModal()" style="display:inline-flex;align-items:center;gap:0.5rem">
                <i data-lucide="download" width="14" height="14"></i> Exportar Dados
            </button>
        </div>
    `;

    if (window.lucide) lucide.createIcons();
}

function _renderCategoryBreakdown(despesas) {
    const catMap = {};
    despesas.forEach(d => {
        const cat = d.categoria || 'Outros';
        catMap[cat] = (catMap[cat] || 0) + Number(d.valor);
    });

    const sorted = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
    const total = sorted.reduce((s, [, v]) => s + v, 0);

    if (sorted.length === 0) {
        return '<p style="font-size:0.78rem;color:var(--text-dim)">Nenhuma despesa no período</p>';
    }

    return sorted.map(([cat, val]) => {
        const pct = total > 0 ? (val / total * 100).toFixed(1) : 0;
        return `
            <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.75rem">
                <div style="flex:1;min-width:0">
                    <div style="display:flex;justify-content:space-between;margin-bottom:0.25rem">
                        <span style="font-size:0.78rem;font-weight:500">${esc(cat)}</span>
                        <span style="font-size:0.78rem;color:var(--text-dim)">${fmtR(val)} (${pct}%)</span>
                    </div>
                    <div style="height:6px;background:var(--bg-card);border-radius:3px;overflow:hidden">
                        <div style="height:100%;width:${pct}%;background:var(--danger);border-radius:3px;transition:width 0.3s"></div>
                    </div>
                </div>
            </div>`;
    }).join('');
}

export function exportPDF() {
    if (typeof window.jspdf === 'undefined') {
        alert('jsPDF não disponível. Use CSV.');
        return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('CFO Dashboard — Relatório Gerencial', 14, 20);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 28);

    const data = State.getState().lancamentos;
    const tableData = data.map(l => [
        l.data || '', l.nome || '', l.tipo || '',
        l.categoria || '', l.status || '',
        `R$ ${Number(l.valor || 0).toFixed(2)}`
    ]);

    if (doc.autoTable) {
        doc.autoTable({
            head: [['Data', 'Descrição', 'Tipo', 'Categoria', 'Status', 'Valor']],
            body: tableData,
            startY: 35,
            styles: { fontSize: 8 }
        });
    }
    doc.save(`relatorio-cfo-${new Date().toISOString().split('T')[0]}.pdf`);
}

export function exportCSV() {
    const data = State.getState().lancamentos;
    const headers = ['Data', 'Nome', 'Valor', 'Tipo', 'Categoria', 'Status', 'Recorrência', 'Cliente', 'Projeto'];
    const rows = data.map(l => [
        l.data || '', l.nome || '', Number(l.valor || 0).toFixed(2),
        l.tipo || '', l.categoria || '', l.status || '',
        l.recorrencia || '', l.cliente || '', l.projeto || ''
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-cfo-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}
