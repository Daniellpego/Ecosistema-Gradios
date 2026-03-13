'use client'

import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { LeadStatus, LeadTemperatura } from '@/types/database'
import { LEAD_STATUS_LABELS, RESPONSAVEIS } from '@/types/database'

interface LeadsFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  statusFilter: LeadStatus | 'all'
  onStatusChange: (value: LeadStatus | 'all') => void
  origemFilter: string
  onOrigemChange: (value: string) => void
  temperaturaFilter: LeadTemperatura | 'all'
  onTemperaturaChange: (value: LeadTemperatura | 'all') => void
  responsavelFilter: string
  onResponsavelChange: (value: string) => void
  onClear: () => void
  hasFilters: boolean
}

export function LeadsFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  origemFilter,
  onOrigemChange,
  temperaturaFilter,
  onTemperaturaChange,
  responsavelFilter,
  onResponsavelChange,
  onClear,
  hasFilters,
}: LeadsFiltersProps) {
  return (
    <div className="card-glass">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-dark" />
          <Input
            placeholder="Buscar por nome ou empresa..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Status */}
        <Select value={statusFilter} onValueChange={(v) => onStatusChange(v as LeadStatus | 'all')}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {(Object.entries(LEAD_STATUS_LABELS) as Array<[LeadStatus, string]>).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Origem */}
        <Select value={origemFilter} onValueChange={onOrigemChange}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="Origem" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="quiz">Quiz</SelectItem>
            <SelectItem value="whatsapp">WhatsApp</SelectItem>
            <SelectItem value="indicacao">Indicação</SelectItem>
            <SelectItem value="meta_ads">Meta Ads</SelectItem>
            <SelectItem value="direto">Direto</SelectItem>
          </SelectContent>
        </Select>

        {/* Temperatura */}
        <Select value={temperaturaFilter} onValueChange={(v) => onTemperaturaChange(v as LeadTemperatura | 'all')}>
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue placeholder="Temp." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="quente">Quente</SelectItem>
            <SelectItem value="morno">Morno</SelectItem>
            <SelectItem value="frio">Frio</SelectItem>
          </SelectContent>
        </Select>

        {/* Responsável */}
        <Select value={responsavelFilter} onValueChange={onResponsavelChange}>
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue placeholder="Resp." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {RESPONSAVEIS.map((r) => (
              <SelectItem key={r} value={r}>{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" size="icon" onClick={onClear} className="shrink-0">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
