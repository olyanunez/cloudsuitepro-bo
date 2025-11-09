"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { TenantService, Tenant } from '@/lib/services/tenantService';
import { useTenant } from '@/lib/contexts/TenantContext';

export default function TenantsPage() {
  const router = useRouter();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState<string | null>(null);
  const { tenantId: currentTenantId } = useTenant();

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    setLoading(true);
    try {
      const data = await TenantService.getTenants();
      setTenants(data);
      setError(null);
    } catch (err) {
      console.error('Error al cargar empresas:', err);
      setError('No se pudieron cargar las empresas. Por favor, intente de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!tenantToDelete) return;

    try {
      await TenantService.deleteTenant(tenantToDelete);
      setTenants(tenants.filter(tenant => tenant.id !== tenantToDelete));
      setDeleteDialogOpen(false);
      setTenantToDelete(null);
    } catch (err) {
      console.error('Error al eliminar empresa:', err);
      setError('No se pudo eliminar la empresa. Por favor, intente de nuevo.');
    }
  };

  const confirmDelete = (id: string) => {
    setTenantToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      const updatedTenant = await TenantService.toggleTenantStatus(id, !isActive);
      setTenants(tenants.map(tenant =>
        tenant.id === id ? updatedTenant : tenant
      ));
    } catch (err) {
      console.error('Error al cambiar estado de empresa:', err);
      setError('No se pudo cambiar el estado de la empresa. Por favor, intente de nuevo.');
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Empresas</h1>
        <Button onClick={() => router.push('/tenants/new')}>
          Nueva Empresa
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Lista de Empresas</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Cargando empresas...</div>
          ) : tenants.length === 0 ? (
            <div className="text-center py-4">No hay empresas registradas.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>RNC/Cédula</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenants.map((tenant) => (
                  <TableRow key={tenant.id}>
                    <TableCell className="font-medium">
                      {tenant.name}
                      {tenant.description && (
                        <p className="text-sm text-gray-500">{tenant.description}</p>
                      )}
                    </TableCell>
                    <TableCell>{tenant.taxId || '-'}</TableCell>
                    <TableCell>
                      {tenant.email && <div>{tenant.email}</div>}
                      {tenant.phone && <div>{tenant.phone}</div>}
                    </TableCell>
                    <TableCell>
                      <Badge variant={tenant.isActive ? "success" : "destructive"}>
                        {tenant.isActive ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/tenants/${tenant.id}`)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant={tenant.isActive ? "destructive" : "outline"}
                          size="sm"
                          onClick={() => handleToggleStatus(tenant.id, tenant.isActive)}
                          disabled={tenant.id === currentTenantId}
                        >
                          {tenant.isActive ? 'Desactivar' : 'Activar'}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => confirmDelete(tenant.id)}
                          disabled={tenant.id === currentTenantId}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente esta empresa y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
