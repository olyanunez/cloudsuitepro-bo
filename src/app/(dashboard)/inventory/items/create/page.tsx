'use client';

import { useState, useEffect } from 'react';
import { CreateInventoryItemDto, Product, Warehouse } from '@/lib/types/inventory';
import { InventoryService, ProductService, WarehouseService } from '@/lib/services/inventoryService';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, SaveIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function CreateInventoryItemPage() {
  const router = useRouter();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  
  const [formData, setFormData] = useState<CreateInventoryItemDto>({
    productId: 0,
    warehouseId: 0,
    quantity: 0,
    minStock: 0,
    maxStock: 0
  });
  
  const [errors, setErrors] = useState<{
    productId?: string;
    warehouseId?: string;
    quantity?: string;
    minStock?: string;
    maxStock?: string;
  }>({});

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        // Cargar productos y almacenes
        const productsData = await ProductService.getProducts();
        const warehousesData = await WarehouseService.getWarehouses();
        
        setProducts(productsData);
        setWarehouses(warehousesData);
      } catch (error) {
        console.error('Error loading data:', error);
        alert('Ocurrió un error al cargar los datos.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value === '' ? '' : Number(value) }));
    
    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: Number(value) }));
    
    // Clear error when user selects
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {
      productId?: string;
      warehouseId?: string;
      quantity?: string;
      minStock?: string;
      maxStock?: string;
    } = {};
    
    if (!formData.productId) {
      newErrors.productId = 'Debe seleccionar un producto';
    }
    
    if (!formData.warehouseId) {
      newErrors.warehouseId = 'Debe seleccionar un almacén';
    }
    
    if (formData.quantity === undefined || formData.quantity === null || formData.quantity < 0) {
      newErrors.quantity = 'La cantidad debe ser un número mayor o igual a cero';
    }
    
    if (formData.minStock === undefined || formData.minStock === null || formData.minStock < 0) {
      newErrors.minStock = 'El stock mínimo debe ser un número mayor o igual a cero';
    }
    
    if (formData.maxStock === undefined || formData.maxStock === null || formData.maxStock < 0) {
      newErrors.maxStock = 'El stock máximo debe ser un número mayor o igual a cero';
    } else if (formData.maxStock < formData.minStock) {
      newErrors.maxStock = 'El stock máximo debe ser mayor o igual al stock mínimo';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSaving(true);
      
      // Crear el nuevo item
      const newItem = await InventoryService.createItem(formData);
      
      console.log('Item creado:', newItem);
      router.push(`/inventory/items/${newItem.id}`);
    } catch (error) {
      console.error('Error creating item:', error);
      alert('Ocurrió un error al crear el item.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center">
        <Link href="/inventory/items">
          <Button variant="outline" size="sm" className="mr-4">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Crear Nuevo Item de Inventario</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label htmlFor="productId">Producto <span className="text-red-500">*</span></Label>
              <Select 
                value={formData.productId ? formData.productId.toString() : undefined} 
                onValueChange={(value) => handleSelectChange('productId', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Seleccionar producto" />
                </SelectTrigger>
                <SelectContent>
                  {products.length === 0 ? (
                    <SelectItem value="no-products" disabled>No hay productos disponibles</SelectItem>
                  ) : (
                    products.map(product => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.name} ({product.code})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.productId && <p className="text-red-500 text-xs mt-1">{errors.productId}</p>}
            </div>
            
            <div>
              <Label htmlFor="warehouseId">Almacén <span className="text-red-500">*</span></Label>
              <Select 
                value={formData.warehouseId ? formData.warehouseId.toString() : undefined} 
                onValueChange={(value) => handleSelectChange('warehouseId', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Seleccionar almacén" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.length === 0 ? (
                    <SelectItem value="no-warehouses" disabled>No hay almacenes disponibles</SelectItem>
                  ) : (
                    warehouses.map(warehouse => (
                      <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                        {warehouse.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.warehouseId && <p className="text-red-500 text-xs mt-1">{errors.warehouseId}</p>}
            </div>
            
            <div>
              <Label htmlFor="quantity">Cantidad <span className="text-red-500">*</span></Label>
              <Input 
                id="quantity" 
                name="quantity" 
                type="number" 
                value={formData.quantity?.toString() || ''} 
                onChange={handleInputChange} 
                className="mt-1" 
                min="0"
              />
              {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
            </div>
            
            <div>
              <Label htmlFor="minStock">Stock Mínimo <span className="text-red-500">*</span></Label>
              <Input 
                id="minStock" 
                name="minStock" 
                type="number" 
                value={formData.minStock?.toString() || ''} 
                onChange={handleInputChange} 
                className="mt-1" 
                min="0"
              />
              {errors.minStock && <p className="text-red-500 text-xs mt-1">{errors.minStock}</p>}
            </div>
            
            <div>
              <Label htmlFor="maxStock">Stock Máximo <span className="text-red-500">*</span></Label>
              <Input 
                id="maxStock" 
                name="maxStock" 
                type="number" 
                value={formData.maxStock?.toString() || ''} 
                onChange={handleInputChange} 
                className="mt-1" 
                min="0"
              />
              {errors.maxStock && <p className="text-red-500 text-xs mt-1">{errors.maxStock}</p>}
            </div>
          </div>
          
          <div className="flex justify-end mt-6">
            <Link href="/inventory/items" className="mr-4">
              <Button type="button" variant="outline">Cancelar</Button>
            </Link>
            <Button type="submit" className="bg-primary hover:bg-primary-600" disabled={saving}>
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <SaveIcon className="mr-2 h-4 w-4" />
                  Guardar
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
