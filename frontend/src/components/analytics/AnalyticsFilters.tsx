'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, RefreshCw, Download } from 'lucide-react';
import { AnalyticsFiltersProps } from '@/types/ui';

export default function AnalyticsFilters({ onFilterChange, onRefresh, onExport }: AnalyticsFiltersProps) {
  const [date] = useState<Date>(new Date());
  const [period, setPeriod] = useState<string>('day');

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
    onFilterChange({ date, period: newPeriod });
  };

  // Função para formatar a data usando o formato brasileiro
  const formatDate = (date: Date): string => {
    return format(date, 'dd/MM/yyyy');
  };

  return (
    <Card className="bg-white dark:bg-white rounded-xl shadow-md mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-montserrat font-light text-gray-800">
          FILTROS
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Período:</span>
            <Select value={period} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Diário</SelectItem>
                <SelectItem value="week">Semanal</SelectItem>
                <SelectItem value="month">Mensal</SelectItem>
                <SelectItem value="quarter">Trimestral</SelectItem>
                <SelectItem value="year">Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Data:</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-[180px] justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? formatDate(date) : <span>Selecione uma data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar>
                  Seletor de data em desenvolvimento
                </Calendar>
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="flex gap-2 ml-auto">
            <Button 
              variant="outline" 
              size="icon"
              onClick={onRefresh}
              title="Atualizar dados"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={onExport}
              title="Exportar dados"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
