'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { CustomerService, TopCustomer } from '@/lib/services/customerService';
import { toast } from 'sonner';

export function TopCustomersWidget() {
  const [customers, setCustomers] = useState<TopCustomer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar datos inicialmente
    loadTopCustomers();

    // Recargar cuando la ventana recibe focus
    const handleFocus = () => {
      loadTopCustomers();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadTopCustomers = async () => {
    try {
      setLoading(true);
      const data = await CustomerService.getTopCustomers(5);
      setCustomers(data);
    } catch (error) {
      console.error('Error loading top customers:', error);
      toast.error('Error al cargar los clientes');
    } finally {
      setLoading(false);
    }
  };
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <CardTitle className="text-base sm:text-lg truncate">Top Clientes del Mes</CardTitle>
            <CardDescription className="text-xs sm:text-sm truncate">Clientes con mayores compras</CardDescription>
          </div>
          <Users className="h-5 w-5 text-muted-foreground shrink-0" />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">Cargando clientes...</div>
          </div>
        ) : customers.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">No hay datos disponibles</div>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {customers.map((customer, index) => {
                // Obtener colores diferentes para cada posición
                const rankColors = [
                  'bg-amber-500/10 text-amber-700 dark:text-amber-400',
                  'bg-slate-500/10 text-slate-700 dark:text-slate-400',
                  'bg-orange-500/10 text-orange-700 dark:text-orange-400',
                  'bg-blue-500/10 text-blue-700 dark:text-blue-400',
                  'bg-purple-500/10 text-purple-700 dark:text-purple-400',
                ];

                return (
                  <div
                    key={customer.id}
                    className="flex items-start sm:items-center justify-between gap-2 p-3 rounded-lg border bg-card hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className={`flex items-center justify-center h-8 w-8 rounded-full font-bold text-sm ${rankColors[index] || 'bg-muted text-muted-foreground'}`}
                      >
                        #{index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate" title={customer.name}>
                          {customer.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {customer.totalPurchases} {customer.totalPurchases === 1 ? 'compra' : 'compras'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right ml-2 shrink-0 max-w-[45%]">
                      <p className="font-bold text-sm sm:text-base break-words">
                        {formatCurrency(customer.totalAmount)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="text-muted-foreground">Total Top {customers.length}</span>
                <span className="font-bold text-right break-words max-w-[55%]">
                  {formatCurrency(customers.reduce((sum, c) => sum + parseFloat(c.totalAmount), 0))}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                📊 Clientes del mes actual
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
