'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, TrendingUp } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// Datos hardcoded mientras se desarrolla el módulo de clientes
const MOCK_CUSTOMERS = [
  {
    id: 1,
    name: 'María González',
    initials: 'MG',
    totalPurchases: 12,
    totalAmount: 5600.50,
    trend: '+15%',
  },
  {
    id: 2,
    name: 'Juan Pérez',
    initials: 'JP',
    totalPurchases: 8,
    totalAmount: 4200.00,
    trend: '+8%',
  },
  {
    id: 3,
    name: 'Ana Martínez',
    initials: 'AM',
    totalPurchases: 10,
    totalAmount: 3800.75,
    trend: '+22%',
  },
  {
    id: 4,
    name: 'Carlos Rodríguez',
    initials: 'CR',
    totalPurchases: 6,
    totalAmount: 3200.00,
    trend: '+5%',
  },
  {
    id: 5,
    name: 'Laura Sánchez',
    initials: 'LS',
    totalPurchases: 7,
    totalAmount: 2900.25,
    trend: '+12%',
  },
];

export function TopCustomersWidget() {
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
        <div className="space-y-4">
          {MOCK_CUSTOMERS.map((customer, index) => (
            <div
              key={customer.id}
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
                  <p className="font-medium text-sm">{customer.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {customer.totalPurchases} compras
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm">${customer.totalAmount.toFixed(2)}</p>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>{customer.trend}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Top 5</span>
            <span className="font-bold">
              ${MOCK_CUSTOMERS.reduce((sum, c) => sum + c.totalAmount, 0).toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            📊 Módulo de clientes en desarrollo - Datos de ejemplo
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
