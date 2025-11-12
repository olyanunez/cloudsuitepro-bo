'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { apiGet, apiPatch } from '@/lib/services/apiService';
import {
  Plus,
  Search,
  Edit,
  Eye,
  ChevronRight,
  ChevronDown,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { toast } from 'sonner';

interface Account {
  id: number;
  code: string;
  name: string;
  description?: string;
  accountType: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE';
  accountSubtype?: string;
  nature: 'DEBIT' | 'CREDIT';
  parentId?: number;
  level: number;
  isGroup: boolean;
  acceptsEntries: boolean;
  isActive: boolean;
  isSystem: boolean;
  debitBalance: number;
  creditBalance: number;
  balance: number;
  children?: Account[];
  parent?: Account;
}

const accountTypeLabels: Record<string, string> = {
  ASSET: 'Activo',
  LIABILITY: 'Pasivo',
  EQUITY: 'Patrimonio',
  INCOME: 'Ingreso',
  EXPENSE: 'Gasto',
};

const accountTypeColors: Record<string, string> = {
  ASSET: 'bg-blue-100 text-blue-800',
  LIABILITY: 'bg-red-100 text-red-800',
  EQUITY: 'bg-purple-100 text-purple-800',
  INCOME: 'bg-green-100 text-green-800',
  EXPENSE: 'bg-orange-100 text-orange-800',
};

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [expandedAccounts, setExpandedAccounts] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    filterAccounts();
  }, [accounts, search, filterType]);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const data = await apiGet<Account[]>('/accounting/accounts');
      setAccounts(data);
    } catch (error: any) {
      toast.error('Error al cargar cuentas', {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const filterAccounts = () => {
    let filtered = accounts;

    // Filtrar por tipo
    if (filterType !== 'ALL') {
      filtered = filtered.filter((account) => account.accountType === filterType);
    }

    // Filtrar por búsqueda
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (account) =>
          account.code.toLowerCase().includes(searchLower) ||
          account.name.toLowerCase().includes(searchLower) ||
          account.description?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredAccounts(filtered);
  };

  const toggleExpand = (accountId: number) => {
    const newExpanded = new Set(expandedAccounts);
    if (newExpanded.has(accountId)) {
      newExpanded.delete(accountId);
    } else {
      newExpanded.add(accountId);
    }
    setExpandedAccounts(newExpanded);
  };

  const renderAccountRow = (account: Account, depth: number = 0) => {
    const hasChildren = account.children && account.children.length > 0;
    const isExpanded = expandedAccounts.has(account.id);
    const indent = depth * 24;

    return (
      <div key={account.id}>
        <div
          className={`flex items-center py-3 px-4 hover:bg-gray-50 border-b ${
            depth > 0 ? 'bg-gray-50/50' : ''
          }`}
          style={{ paddingLeft: `${16 + indent}px` }}
        >
          {/* Expand/Collapse Icon */}
          <div className="w-6 mr-2">
            {hasChildren && (
              <button
                onClick={() => toggleExpand(account.id)}
                className="hover:bg-gray-200 rounded p-1"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            )}
          </div>

          {/* Code */}
          <div className="w-32">
            <span className="font-mono text-sm font-medium">{account.code}</span>
          </div>

          {/* Name */}
          <div className="flex-1 min-w-0">
            <div className={`${account.isGroup ? 'font-bold' : 'font-medium'}`}>
              {account.name}
            </div>
            {account.description && (
              <div className="text-xs text-gray-500 truncate">
                {account.description}
              </div>
            )}
          </div>

          {/* Type */}
          <div className="w-28">
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${
                accountTypeColors[account.accountType]
              }`}
            >
              {accountTypeLabels[account.accountType]}
            </span>
          </div>

          {/* Nature */}
          <div className="w-24 text-center">
            {account.nature === 'DEBIT' ? (
              <span className="flex items-center justify-center text-sm">
                <TrendingUp className="h-4 w-4 mr-1 text-blue-600" />
                Débito
              </span>
            ) : (
              <span className="flex items-center justify-center text-sm">
                <TrendingDown className="h-4 w-4 mr-1 text-green-600" />
                Crédito
              </span>
            )}
          </div>

          {/* Balance */}
          <div className="w-40 text-right">
            {!account.isGroup && (
              <span className={`font-medium ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                RD${Number(account.balance).toLocaleString('es-DO', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            )}
          </div>

          {/* Status */}
          <div className="w-24 text-center">
            {account.isGroup ? (
              <span className="text-xs text-gray-500">Grupo</span>
            ) : !account.acceptsEntries ? (
              <span className="text-xs text-gray-500">No acepta</span>
            ) : account.isActive ? (
              <span className="text-xs text-green-600">Activa</span>
            ) : (
              <span className="text-xs text-red-600">Inactiva</span>
            )}
          </div>

          {/* Actions */}
          <div className="w-24 flex justify-end space-x-2">
            <Link href={`/accounting/accounts/${account.id}`}>
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
            {!account.isSystem && (
              <Link href={`/accounting/accounts/edit/${account.id}`}>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Render children if expanded */}
        {hasChildren && isExpanded && account.children?.map((child) => renderAccountRow(child, depth + 1))}
      </div>
    );
  };

  // Build hierarchy
  const buildHierarchy = (accounts: Account[]): Account[] => {
    const accountMap = new Map<number, Account>();
    const rootAccounts: Account[] = [];

    // First pass: create map
    accounts.forEach((account) => {
      accountMap.set(account.id, { ...account, children: [] });
    });

    // Second pass: build hierarchy
    accounts.forEach((account) => {
      const acc = accountMap.get(account.id)!;
      if (account.parentId) {
        const parent = accountMap.get(account.parentId);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(acc);
        } else {
          rootAccounts.push(acc);
        }
      } else {
        rootAccounts.push(acc);
      }
    });

    return rootAccounts;
  };

  const hierarchicalAccounts = buildHierarchy(filteredAccounts);

  // Calculate totals
  const totalBalance = filteredAccounts
    .filter((a) => !a.isGroup)
    .reduce((sum, account) => sum + Number(account.balance), 0);

  const assetBalance = filteredAccounts
    .filter((a) => a.accountType === 'ASSET' && !a.isGroup)
    .reduce((sum, account) => sum + Number(account.balance), 0);

  const liabilityBalance = filteredAccounts
    .filter((a) => a.accountType === 'LIABILITY' && !a.isGroup)
    .reduce((sum, account) => sum + Number(account.balance), 0);

  const equityBalance = filteredAccounts
    .filter((a) => a.accountType === 'EQUITY' && !a.isGroup)
    .reduce((sum, account) => sum + Number(account.balance), 0);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Plan de Cuentas</h1>
          <p className="text-gray-600 mt-1">
            Catálogo de cuentas contables del sistema
          </p>
        </div>
        <Link href="/accounting/accounts/create">
          <Button className="bg-primary hover:bg-primary-600">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Cuenta
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Cuentas</p>
              <p className="text-2xl font-bold">{accounts.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Activos</p>
              <p className="text-xl font-bold">
                RD${assetBalance.toLocaleString('es-DO', { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pasivos</p>
              <p className="text-xl font-bold">
                RD${liabilityBalance.toLocaleString('es-DO', { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Patrimonio</p>
              <p className="text-xl font-bold">
                RD${equityBalance.toLocaleString('es-DO', { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Minus className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Buscar por código, nombre o descripción..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border rounded-md px-3 py-2"
          >
            <option value="ALL">Todos los tipos</option>
            <option value="ASSET">Activos</option>
            <option value="LIABILITY">Pasivos</option>
            <option value="EQUITY">Patrimonio</option>
            <option value="INCOME">Ingresos</option>
            <option value="EXPENSE">Gastos</option>
          </select>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          {/* Header */}
          <div className="flex items-center py-3 px-4 bg-gray-50 border-b font-medium text-sm text-gray-700">
            <div className="w-6 mr-2"></div>
            <div className="w-32">Código</div>
            <div className="flex-1">Nombre de Cuenta</div>
            <div className="w-28">Tipo</div>
            <div className="w-24 text-center">Naturaleza</div>
            <div className="w-40 text-right">Saldo</div>
            <div className="w-24 text-center">Estado</div>
            <div className="w-24 text-right">Acciones</div>
          </div>

          {/* Body */}
          {loading ? (
            <div className="py-12 text-center text-gray-500">
              Cargando cuentas...
            </div>
          ) : hierarchicalAccounts.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              No se encontraron cuentas
            </div>
          ) : (
            <div>
              {hierarchicalAccounts.map((account) => renderAccountRow(account))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
