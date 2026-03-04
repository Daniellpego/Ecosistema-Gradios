import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentTenant } from '../common/decorators/tenant.decorator';
import { PrismaService } from '../common/prisma.service';

/**
 * /kpis — Dashboard-oriented KPI endpoint.
 * Returns aggregated data in the exact format the frontend KpiData interface expects.
 */
@ApiTags('kpis')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('kpis')
export class KpisController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Dashboard KPIs in frontend-compatible format' })
  @ApiResponse({ status: 200, description: 'KpiData object' })
  async getDashboardKpis(@CurrentTenant() tenantId: string) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const twelveMonthsAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);

    // --- Parallel data fetching ---
    const [
      allOpps,
      closedWonOpps,
      activeProjects,
      activeSlas,
      pipelineByStage,
    ] = await Promise.all([
      // All active opportunities
      this.prisma.opportunity.findMany({
        where: { tenantId, stage: { notIn: ['closed_lost'] } },
        select: { value: true, stage: true },
      }),
      // closed_won last 12 months
      this.prisma.opportunity.findMany({
        where: { tenantId, stage: 'closed_won', updatedAt: { gte: twelveMonthsAgo } },
        select: { value: true, updatedAt: true },
      }),
      // active projects
      this.prisma.project.count({
        where: { tenantId, status: { in: ['active', 'planning'] } },
      }),
      // active SLAs monthly value
      this.prisma.sLA.findMany({
        where: { tenantId, status: 'active' },
        select: { metrics: true },
      }),
      // pipeline grouped by stage
      this.prisma.opportunity.groupBy({
        by: ['stage'],
        where: { tenantId },
        _count: { id: true },
        _sum: { value: true },
      }),
    ]);

    // Compute KPIs
    const allActiveOpps = allOpps.filter((o) => !['closed_won', 'closed_lost'].includes(o.stage));
    const totalPipelineValue = allActiveOpps.reduce((s, o) => s + (o.value ?? 0), 0);
    const opportunitiesCount = allOpps.length;

    const totalOpps = allOpps.length;
    const closedWonCount = closedWonOpps.length;
    const winRate = totalOpps > 0 ? (closedWonCount / totalOpps) * 100 : 0;

    const closedWonValues = closedWonOpps.map((o) => o.value ?? 0);
    const avgDealSize = closedWonCount > 0
      ? closedWonValues.reduce((s, v) => s + v, 0) / closedWonCount
      : (totalPipelineValue > 0 && opportunitiesCount > 0 ? totalPipelineValue / opportunitiesCount : 0);

    // MRR from active SLAs
    const mrr = activeSlas.reduce((sum, sla) => {
      const m = sla.metrics as Record<string, unknown> | null;
      return sum + (typeof m?.monthlyPrice === 'number' ? m.monthlyPrice : 0);
    }, 0);

    // Pipeline by stage
    const pipeline_by_stage = pipelineByStage.map((s) => ({
      stage: s.stage,
      count: s._count.id,
      value: s._sum.value ?? 0,
    }));

    // Revenue by month (last 12 months)
    const monthlyMap: Record<string, number> = {};
    for (const opp of closedWonOpps) {
      const d = opp.updatedAt;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap[key] = (monthlyMap[key] ?? 0) + (opp.value ?? 0);
    }
    // Fill in missing months
    const revenue_by_month: Array<{ month: string; revenue: number }> = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      revenue_by_month.push({ month: key, revenue: monthlyMap[key] ?? 0 });
    }

    return {
      total_pipeline_value: totalPipelineValue,
      opportunities_count: opportunitiesCount,
      win_rate: Math.round(winRate * 100) / 100,
      avg_deal_size: Math.round(avgDealSize),
      active_projects: activeProjects,
      mrr,
      pipeline_by_stage,
      revenue_by_month,
    };
  }

  @Get('pipeline')
  @ApiOperation({ summary: 'Pipeline data for chart' })
  async getPipeline(@CurrentTenant() tenantId: string) {
    const stages = await this.prisma.opportunity.groupBy({
      by: ['stage'],
      where: { tenantId },
      _count: { id: true },
      _sum: { value: true },
    });
    return {
      data: stages.map((s) => ({
        stage: s.stage,
        count: s._count.id,
        value: s._sum.value ?? 0,
      })),
    };
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Revenue by month for chart' })
  async getRevenue(@CurrentTenant() tenantId: string) {
    const twelveMonthsAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    const closedWon = await this.prisma.opportunity.findMany({
      where: { tenantId, stage: 'closed_won', updatedAt: { gte: twelveMonthsAgo } },
      select: { value: true, updatedAt: true },
    });

    const monthlyMap: Record<string, number> = {};
    for (const opp of closedWon) {
      const d = opp.updatedAt;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap[key] = (monthlyMap[key] ?? 0) + (opp.value ?? 0);
    }

    const data: Array<{ month: string; revenue: number }> = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      data.push({ month: key, revenue: monthlyMap[key] ?? 0 });
    }
    return { data };
  }
}
