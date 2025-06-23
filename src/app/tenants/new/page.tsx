"use client";

import React from 'react';
import { TenantForm } from '../components/TenantForm';
import { TenantService, CreateTenantDto } from '@/lib/services/tenantService';
import { toast } from '@/components/ui/use-toast';

export default function NewTenantPage() {
  const handleSubmit = async (data: Record<string, unknown>) => {
    // Aseguramos que data tenga al menos la propiedad name que es requerida
    const createData: CreateTenantDto = {
      name: String(data.name || ''),
      description: data.description ? String(data.description) : undefined,
      address: data.address ? String(data.address) : undefined,
      phone: data.phone ? String(data.phone) : undefined,
      email: data.email ? String(data.email) : undefined,
      taxId: data.taxId ? String(data.taxId) : undefined,
      logo: data.logo ? String(data.logo) : undefined
    };
    try {
      await TenantService.createTenant(createData);
      toast({
        title: "Empresa creada",
        description: "La empresa ha sido creada exitosamente.",
      });
    } catch (error) {
      console.error('Error al crear empresa:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la empresa. Por favor, intente de nuevo.",
        variant: "destructive",
      });
      throw error; // Re-throw para que el formulario pueda manejar el error
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Nueva Empresa</h1>
      <TenantForm onSubmit={handleSubmit} />
    </div>
  );
}
