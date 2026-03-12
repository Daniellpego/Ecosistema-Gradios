// ═══════════════════════════════════════════════
// CFO Dashboard v2 — Charts (ApexCharts)
// ═══════════════════════════════════════════════

import { fmtR, MONTHS, filterData, calcTax, safe } from './utils.js';
import * as State from './state.js';

let charts = { area: null, donut: null, dreBar: null, dreLine: null };

const LABEL_COLOR = '#94A3B8';
const GRID_COLOR  = 'rgba(255,255,255,0.04)';
const BG_STROKE   = '#0A1628';

const baseOpts = {
    chart: { background: 'transparent', fontFamily: 'Poppins', toolbar: { show: false }, animations: { enabled: true, speed: 700, easing: 'easeinout' } },
    theme: { mode: 'dark' }
};

const tooltip = (extraY = {}) => ({
    theme: 'dark',
    style: { fontSize: '12px', fontFamily: 'Poppins' },
    y: { formatter: v => fmtR(v), ...extraY }
});

const grid = { borderColor: GRID_COLOR, strokeDashArray: 3, padding: { left: 4, right: 4 } };

const xaxis = (cats = []) => ({
    categories: cats,
    labels: { style: { colors: LABEL_COLOR, fontSize: '11px', fontWeight: 500 } },
    axisBorder: { show: false }, axisTicks: { show: false }
});

const yaxis = { labels: { style: { colors: LABEL_COLOR, fontSize: '11px' }, formatter: v => `R$${(v / 1000).toFixed(0)}k` } };

const legend = { position: 'bottom', labels: { colors: LABEL_COLOR }, fontSize: '11px', fontFamily: 'Poppins' };

export function initCharts() {
    charts.area = new ApexCharts(document.querySelector('#chart-area'), {
        ...baseOpts,
        series: [], chart: { ...baseOpts.chart, type: 'area', height: 280 },
        colors: ['#10B981', '#EF4444'],
        fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.45, opacityTo: 0.02, stops: [0, 100] } },
        stroke: { curve: 'smooth', width: 2 }, dataLabels: { enabled: false },
        grid, xaxis: xaxis(), yaxis,
        legend,
        tooltip: tooltip()
    });

    charts.donut = new ApexCharts(document.querySelector('#chart-donut'), {
        ...baseOpts,
        series: [], labels: [], chart: { ...baseOpts.chart, type: 'donut', height: 280 },
        colors: ['#00C8F0', '#2B7AB5', '#1A6AAA', '#153B5F'],
        stroke: { show: true, colors: [BG_STROKE], width: 3 },
        dataLabels: { enabled: false },
        legend,
        plotOptions: { pie: { donut: { size: '68%', labels: { show: true, name: { color: LABEL_COLOR, fontSize: '11px', fontFamily: 'Poppins' }, value: { color: '#FFFFFF', fontSize: '22px', fontWeight: 700, formatter: v => fmtR(v) }, total: { show: true, label: 'Total Fixos', color: LABEL_COLOR, fontSize: '11px', fontFamily: 'Poppins', formatter: w => fmtR(w.globals.seriesTotals.reduce((a, b) => a + b, 0)) } } } } },
        tooltip: tooltip()
    });

    charts.dreBar = new ApexCharts(document.querySelector('#chart-dre-bar'), {
        ...baseOpts,
        series: [], chart: { ...baseOpts.chart, type: 'bar', height: 280 },
        colors: ['#10B981', '#F59E0B', '#EF4444'],
        plotOptions: { bar: { borderRadius: 6, borderRadiusApplication: 'end', columnWidth: '48%' } },
        dataLabels: { enabled: false },
        xaxis: xaxis(), yaxis,
        grid,
        legend,
        tooltip: tooltip()
    });

    charts.dreLine = new ApexCharts(document.querySelector('#chart-dre-line'), {
        ...baseOpts,
        series: [], chart: { ...baseOpts.chart, type: 'area', height: 280 },
        colors: ['#00C8F0'],
        fill: { type: 'gradient', gradient: { opacityFrom: 0.35, opacityTo: 0.02, stops: [0, 100] } },
        stroke: { curve: 'smooth', width: 2 }, dataLabels: { enabled: false },
        markers: { size: 4, colors: ['#00C8F0'], strokeColors: BG_STROKE, strokeWidth: 2, hover: { size: 6 } },
        xaxis: xaxis(), yaxis,
        grid,
        legend,
        tooltip: tooltip()
    });

    Object.values(charts).forEach(c => c.render());
}

export function updateCharts() {
    const { client, project } = State.getFilters();
    const entradas = State.getEntradas();
    const fixos = State.getFixos();
    const variaveis = State.getVariaveis();
    const isConf = x => x?.status === 'Confirmado';

    const aRec = [], aDesp = [], aCats = [], dreRB = [], dreCV = [], dreCF = [], dreRL = [];

    for (let i = 5; i >= 0; i--) {
        const d = new Date(); d.setMonth(d.getMonth() - i);
        const mStr = d.getMonth().toString(), yStr = d.getFullYear().toString();

        const e = safe(filterData(entradas, mStr, yStr, false, client, project).filter(isConf).reduce((a, b) => a + safe(Number(b.valor)), 0));
        const f = safe(filterData(fixos, mStr, yStr, false, client, project).filter(isConf).reduce((a, b) => a + safe(Number(b.valor)), 0));
        const u = safe(filterData(variaveis, mStr, yStr, false, client, project).filter(isConf).reduce((a, b) => a + safe(Number(b.valor)), 0));
        const tax = calcTax(e);
        const totalSaidas = f + u + tax;

        aRec.push(e); aDesp.push(totalSaidas);
        aCats.push(MONTHS[d.getMonth()].substring(0, 3));
        dreRB.push(e); dreCV.push(u + tax); dreCF.push(f);
        dreRL.push(e - totalSaidas);
    }

    if (charts.area) {
        charts.area.updateSeries([{ name: 'Receita Bruta', data: aRec }, { name: 'Burn Rate', data: aDesp }]);
        charts.area.updateOptions({ xaxis: { categories: aCats } });
    }
    if (charts.dreBar) {
        charts.dreBar.updateSeries([{ name: 'Receita', data: dreRB }, { name: 'Var.+Imp', data: dreCV }, { name: 'Fixo', data: dreCF }]);
        charts.dreBar.updateOptions({ xaxis: { categories: aCats } });
    }
    if (charts.dreLine) {
        charts.dreLine.updateSeries([{ name: 'Resultado Líquido', data: dreRL }]);
        charts.dreLine.updateOptions({ xaxis: { categories: aCats } });
    }

    // Donut — current filter period
    const { m, y } = State.getFilters();
    const curFixos = filterData(fixos, m, y, false, client, project).filter(isConf);
    const catMap = {};
    curFixos.forEach(x => { catMap[x.categoria || 'Outros'] = (catMap[x.categoria || 'Outros'] || 0) + Number(x.valor); });
    const labels = Object.keys(catMap), series = Object.values(catMap);

    if (charts.donut) {
        if (series.length > 0) {
            charts.donut.updateOptions({ labels });
            charts.donut.updateSeries(series);
        } else {
            charts.donut.updateSeries([1]);
            charts.donut.updateOptions({ labels: ['Sem dados'], colors: ['#1e293b'] });
        }
    }
}
