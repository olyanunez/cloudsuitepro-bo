'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { apiGet, apiPost } from '@/lib/services/apiService';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

interface Account {
  id: number;
  code: string;
  name: string;
  accountType: string;
}

interface FormData {
  code: string;
  name: string;
  description: string;
  accountType: string;
  accountSubtype: string;
  nature: string;
  parentId: number | null;
  level: number;
  isGroup: boolean;
  acceptsEntries: boolean;
  isActive: boolean;
}

export default function CreateAccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [parentAccounts, setParentAccounts] = useState<Account[]>([]);
  const [formData, setFormData] = useState<FormData>({
    code: '',
    name: '',
    description: '',
    accountType: 'ASSET',
    accountSubtype: '',
    nature: 'DEBIT',
    parentId: null,
    level: 1,
    isGroup: false,
    acceptsEntries: true,
    isActive: true,
  });

  useEffect(() => {
    fetchParentAccounts();
  }, []);

  const fetchParentAccounts = async () => {
    try {
      const accounts = await apiGet<Account[]>('/accounting/accounts');
      // Solo mostrar cuentas de agrupación como opciones de padre
      setParentAccounts(accounts.filter((a) => a.accountType === formData.accountType));
    } catch (error: any) {
      toast.error('Error al cargar cuentas', {
        description: error.message,
      });
    }
  };

  useEffect(() => {
    // Actualizar cuentas padre cuando cambia el tipo
    fetchParentAccounts();
  }, [formData.accountType]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!formData.code.trim()) {
      toast.error('El código es requerido');
      return;
    }

    if (!formData.name.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    if (formData.isGroup && formData.acceptsEntries) {
      toast.error('Las cuentas de agrupación no pueden aceptar asientos directos');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...formData,
        parentId: formData.parentId || undefined,
        accountSubtype: formData.accountSubtype || undefined,
        description: formData.description || undefined,
      };

      await apiPost('/accounting/accounts', payload);

      toast.success('Cuenta creada exitosamente');
      router.push('/accounting/accounts');
    } catch (error: any) {
      toast.error('Error al crear cuenta', {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nueva Cuenta Contable</h1>
          <p className="text-gray-600 mt-1">Crea una nueva cuenta en el plan de cuentas</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Información Básica</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="code">
                    Código <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="code"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    placeholder="1.1.01"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Formato jerárquico, ej: 1.1.01.001
                  </p>
                </div>

                <div>
                  <Label htmlFor="name">
                    Nombre <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Caja General"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="description">Descripción</Label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md"
                    rows={3}
                    placeholder="Descripción detallada de la cuenta..."
                  />
                </div>

                <div>
                  <Label htmlFor="accountType">
                    Tipo de Cuenta <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="accountType"
                    name="accountType"
                    value={formData.accountType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  >
                    <option value="ASSET">Activo</option>
                    <option value="LIABILITY">Pasivo</option>
                    <option value="EQUITY">Patrimonio</option>
                    <option value="INCOME">Ingreso</option>
                    <option value="EXPENSE">Gasto</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="accountSubtype">Subtipo de Cuenta</Label>
                  <select
                    id="accountSubtype"
                    name="accountSubtype"
                    value={formData.accountSubtype}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">Sin subtipo</option>
                    <option value="CURRENT">Corriente</option>
                    <option value="NON_CURRENT">No Corriente</option>
                    <option value="OPERATING">Operacional</option>
                    <option value="NON_OPERATING">No Operacional</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="nature">
                    Naturaleza <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="nature"
                    name="nature"
                    value={formData.nature}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  >
                    <option value="DEBIT">Deudora (Débito)</option>
                    <option value="CREDIT">Acreedora (Crédito)</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="level">
                    Nivel <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="level"
                    name="level"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.level}
                    onChange={handleChange}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    1=Mayor, 2=Sub-mayor, 3=Detalle, etc.
                  </p>
                </div>

                <div>
                  <Label htmlFor="parentId">Cuenta Padre (Opcional)</Label>
                  <select
                    id="parentId"
                    name="parentId"
                    value={formData.parentId || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        parentId: e.target.value ? Number(e.target.value) : null,
                      }))
                    }
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">Sin cuenta padre</option>
                    {parentAccounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.code} - {account.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Configuración</h3>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isGroup"
                    name="isGroup"
                    checked={formData.isGroup}
                    onChange={handleChange}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="isGroup" className="cursor-pointer">
                    Es cuenta de agrupación
                  </Label>
                </div>
                <p className="text-xs text-gray-500">
                  Las cuentas de agrupación solo organizan, no reciben movimientos
                </p>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="acceptsEntries"
                    name="acceptsEntries"
                    checked={formData.acceptsEntries}
                    onChange={handleChange}
                    className="w-4 h-4"
                    disabled={formData.isGroup}
                  />
                  <Label htmlFor="acceptsEntries" className="cursor-pointer">
                    Acepta asientos directos
                  </Label>
                </div>
                <p className="text-xs text-gray-500">
                  Permite registrar movimientos en esta cuenta
                </p>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="isActive" className="cursor-pointer">
                    Cuenta activa
                  </Label>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Ayuda</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  <strong>Código:</strong> Use un formato jerárquico como 1.1.01.001
                </p>
                <p>
                  <strong>Nivel:</strong> 1 para cuentas principales, 2 para subcuentas, etc.
                </p>
                <p>
                  <strong>Naturaleza:</strong> Activos, Gastos = Débito. Pasivos, Ingresos,
                  Patrimonio = Crédito
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              'Guardando...'
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Crear Cuenta
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
