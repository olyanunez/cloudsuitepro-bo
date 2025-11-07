'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatCurrency } from '@/lib/utils';
import { CustomerService, TopCustomer } from '@/lib/services/customerService';
import { toast } from 'sonner';

export function TopCustomersWidget() {
  const [customers, setCustomers] = useState<TopCustomer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTopCustomers();
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
          <div>
            <CardTitle>Top Clientes del Mes</CardTitle>
            <CardDescription>Clientes con mayores compras</CardDescription>
          </div>
          <Users className="h-5 w-5 text-muted-foreground" />
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
            <div className="space-y-4">
              {customers.map((customer, index) => (
                <div
                  key={customer.customerId}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-muted-foreground w-6">
                        #{index + 1}
                      </span>
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {customer.initials}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{customer.customerName}</p>
                      <p className="text-xs text-muted-foreground">
                        {customer.totalPurchases} {customer.totalPurchases === 1 ? 'compra' : 'compras'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">{formatCurrency(parseFloat(customer.totalAmount))}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Top {customers.length}</span>
                <span className="font-bold">
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
