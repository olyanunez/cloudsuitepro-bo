'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ReportPeriod, ReportFilters as ReportFiltersType } from '@/lib/services/reportsService';
import { Calendar, Filter, X } from 'lucide-react';

interface ReportFiltersProps {
  filters: ReportFiltersType;
  onChange: (filters: ReportFiltersType) => void;
  onApply: () => void;
  showBranchFilter?: boolean;
  showLimitFilter?: boolean;
}

export default function ReportFilters({
  filters,
  onChange,
  onApply,
  showBranchFilter = true,
  showLimitFilter = false,
}: ReportFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handlePeriodChange = (period: ReportPeriod) => {
    onChange({
      ...filters,
      period,
      startDate: period === ReportPeriod.CUSTOM ? filters.startDate : undefined,
      endDate: period === ReportPeriod.CUSTOM ? filters.endDate : undefined,
    });
  };

  const handleReset = () => {
    onChange({
      period: ReportPeriod.THIS_MONTH,
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          <CardTitle className="text-lg">Filtros</CardTitle>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Ocultar' : 'Mostrar'}
        </Button>
      </CardHeader>
      {isExpanded && (
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="period">Período</Label>
              <Select
                value={filters.period || ReportPeriod.THIS_MONTH}
                onValueChange={handlePeriodChange}
              >
                <SelectTrigger id="period">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ReportPeriod.TODAY}>Hoy</SelectItem>
                  <SelectItem value={ReportPeriod.YESTERDAY}>Ayer</SelectItem>
                  <SelectItem value={ReportPeriod.THIS_WEEK}>Esta Semana</SelectItem>
                  <SelectItem value={ReportPeriod.LAST_WEEK}>Semana Pasada</SelectItem>
                  <SelectItem value={ReportPeriod.THIS_MONTH}>Este Mes</SelectItem>
                  <SelectItem value={ReportPeriod.LAST_MONTH}>Mes Pasado</SelectItem>
                  <SelectItem value={ReportPeriod.THIS_YEAR}>Este Año</SelectItem>
                  <SelectItem value={ReportPeriod.CUSTOM}>Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filters.period === ReportPeriod.CUSTOM && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Fecha Inicio</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={filters.startDate || ''}
                    onChange={(e) => onChange({ ...filters, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Fecha Fin</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={filters.endDate || ''}
                    onChange={(e) => onChange({ ...filters, endDate: e.target.value })}
                  />
                </div>
              </>
            )}

            {showLimitFilter && (
              <div className="space-y-2">
                <Label htmlFor="limit">Límite</Label>
                <Select
                  value={filters.limit?.toString() || '10'}
                  onValueChange={(value) => onChange({ ...filters, limit: parseInt(value) })}
                >
                  <SelectTrigger id="limit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">Top 10</SelectItem>
                    <SelectItem value="20">Top 20</SelectItem>
                    <SelectItem value="50">Top 50</SelectItem>
                    <SelectItem value="100">Top 100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={handleReset}>
              <X className="h-4 w-4 mr-1" />
              Limpiar
            </Button>
            <Button size="sm" onClick={onApply}>
              <Calendar className="h-4 w-4 mr-1" />
              Aplicar Filtros
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
