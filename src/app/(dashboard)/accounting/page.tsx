'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiGet } from '@/lib/services/apiService';
import {
  BookOpen,
  FileText,
  TrendingUp,
  DollarSign,
  Calculator,
  BarChart3,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';

interface AccountingStats {
  totalAccounts: number;
  totalJournalEntries: number;
  draftEntries: number;
  postedEntries: number;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  netIncome: number;
}

export default function AccountingPage() {
  const [stats, setStats] = useState<AccountingStats>({
    totalAccounts: 0,
    totalJournalEntries: 0,
    draftEntries: 0,
    postedEntries: 0,
    totalAssets: 0,
    totalLiabilities: 0,
    totalEquity: 0,
    monthlyRevenue: 0,
    monthlyExpenses: 0,
    netIncome: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      // Obtener cuentas
      const accounts = await apiGet<any[]>('/accounting/accounts');

      // Obtener asientos (ahora con paginación)
      const journalEntriesResponse = await apiGet<any>('/accounting/journal-entries?limit=1000');
      const journalEntries = journalEntriesResponse.data || [];

      setStats({
        totalAccounts: accounts.length,
        totalJournalEntries: journalEntriesResponse.meta?.total || journalEntries.length,
        draftEntries: journalEntries.filter((e: any) => e.status === 'DRAFT').length,
        postedEntries: journalEntries.filter((e: any) => e.status === 'POSTED').length,
        totalAssets: 0,
        totalLiabilities: 0,
        totalEquity: 0,
        monthlyRevenue: 0,
        monthlyExpenses: 0,
        netIncome: 0,
      });
    } catch (error: any) {
      toast.error('Error al cargar estadísticas', {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Plan de Cuentas',
      description: 'Gestiona el catálogo de cuentas contables',
      icon: BookOpen,
      href: '/accounting/accounts',
      color: 'bg-blue-500',
    },
    {
      title: 'Asientos Contables',
      description: 'Registra y consulta asientos contables',
      icon: FileText,
      href: '/accounting/journal-entries',
      color: 'bg-green-500',
    },
    {
      title: 'Balance General',
      description: 'Consulta el balance de situación',
      icon: BarChart3,
      href: '/accounting/reports/balance-sheet',
      color: 'bg-purple-500',
    },
    {
      title: 'Estado de Resultados',
      description: 'Analiza ingresos y gastos del período',
      icon: TrendingUp,
      href: '/accounting/reports/income-statement',
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Contabilidad</h1>
        <p className="text-gray-600 mt-1">
          Gestión contable y reportes financieros
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Cuentas</p>
              <p className="text-2xl font-bold">{stats.totalAccounts}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Asientos</p>
              <p className="text-2xl font-bold">{stats.totalJournalEntries}</p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.draftEntries} borradores
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Activos</p>
              <p className="text-2xl font-bold">
                RD${stats.totalAssets.toLocaleString()}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Resultado Neto</p>
              <p className={`text-2xl font-bold ${stats.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                RD${stats.netIncome.toLocaleString()}
              </p>
            </div>
            <div className={`${stats.netIncome >= 0 ? 'bg-green-100' : 'bg-red-100'} p-3 rounded-full`}>
              <Calculator className={`h-6 w-6 ${stats.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Accesos Rápidos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                <div className="flex flex-col h-full">
                  <div className={`${action.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{action.title}</h3>
                  <p className="text-sm text-gray-600 flex-grow">{action.description}</p>
                  <div className="mt-4 flex items-center text-sm text-primary">
                    Ver más
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Asientos Recientes</h3>
          <div className="space-y-3">
            <div className="text-center text-gray-500 py-8">
              No hay asientos recientes
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Resumen Financiero</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">Ingresos del Mes</span>
              <span className="font-semibold text-green-600">
                RD${stats.monthlyRevenue.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">Gastos del Mes</span>
              <span className="font-semibold text-red-600">
                RD${stats.monthlyExpenses.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">Utilidad del Mes</span>
              <span className={`font-bold text-lg ${stats.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                RD${stats.netIncome.toLocaleString()}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
