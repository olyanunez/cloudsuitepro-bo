"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TenantForm } from '../components/TenantForm';
import { TenantService, Tenant, UpdateTenantDto } from '@/lib/services/tenantService';
import { toast } from '@/components/ui/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditTenantPage() {
  const params = useParams();
  const router = useRouter();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const id = params?.id as string;

  useEffect(() => {
    if (!id) return;
    
    const loadTenant = async () => {
      setLoading(true);
      try {
        const data = await TenantService.getTenantById(id);
        setTenant(data);
        setError(null);
      } catch (err) {
        console.error(`Error al cargar empresa con ID ${id}:`, err);
        setError('No se pudo cargar la información de la empresa. Por favor, intente de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    loadTenant();
  }, [id]);

  const handleSubmit = async (data: Partial<Tenant>) => {
    // Convertimos los datos a UpdateTenantDto
    const updateData: UpdateTenantDto = {
      name: data.name,
      description: data.description,
      address: data.address,
      phone: data.phone,
      email: data.email,
      taxId: data.taxId,
      logo: data.logo,
      active: data.active
    };
    if (!id) return;
    
    try {
      await TenantService.updateTenant(id, updateData);
      toast({
        title: "Empresa actualizada",
        description: "La información de la empresa ha sido actualizada exitosamente.",
      });
    } catch (error) {
      console.error('Error al actualizar empresa:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la empresa. Por favor, intente de nuevo.",
        variant: "destructive",
      });
      throw error; // Re-throw para que el formulario pueda manejar el error
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Editar Empresa</h1>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Editar Empresa</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error || 'No se encontró la empresa solicitada.'}
        </div>
        <button 
          className="text-blue-600 hover:underline"
          onClick={() => router.push('/tenants')}
        >
          Volver a la lista de empresas
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Editar Empresa</h1>
      <TenantForm initialData={tenant} onSubmit={handleSubmit} isEditing={true} />
    </div>
  );
}
