'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Pencil, Trash2, Tag } from 'lucide-react';
import { productAttributesService } from '@/lib/services/product-attributes.service';
import { ProductAttribute } from '@/lib/types/product';
import { toast } from 'sonner';
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

export default function ProductAttributesPage() {
  const router = useRouter();
  const [attributes, setAttributes] = useState<ProductAttribute[]>([]);
  const [filteredAttributes, setFilteredAttributes] = useState<ProductAttribute[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [attributeToDelete, setAttributeToDelete] = useState<ProductAttribute | null>(null);

  useEffect(() => {
    loadAttributes();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredAttributes(attributes);
    } else {
      const filtered = attributes.filter(
        (attr) =>
          attr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          attr.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          attr.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredAttributes(filtered);
    }
  }, [searchTerm, attributes]);

  const loadAttributes = async () => {
    try {
      setLoading(true);
      const data = await productAttributesService.getAll();
      setAttributes(data);
      setFilteredAttributes(data);
    } catch (error) {
      console.error('Error loading attributes:', error);
      toast.error('Error al cargar los atributos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!attributeToDelete) return;

    try {
      await productAttributesService.delete(attributeToDelete.id);
      toast.success('Atributo eliminado exitosamente');
      loadAttributes();
    } catch (error: any) {
      console.error('Error deleting attribute:', error);
      toast.error(error.response?.data?.message || 'Error al eliminar el atributo');
    } finally {
      setDeleteDialogOpen(false);
      setAttributeToDelete(null);
    }
  };

  const openDeleteDialog = (attribute: ProductAttribute) => {
    setAttributeToDelete(attribute);
    setDeleteDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando atributos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Atributos de Productos</h1>
          <p className="text-muted-foreground">
            Gestiona los atributos y sus valores para productos con variantes
          </p>
        </div>
        <Button onClick={() => router.push('/inventory/attributes/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Atributo
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar atributos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAttributes.length === 0 ? (
            <div className="text-center py-12">
              <Tag className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No hay atributos</h3>
              <p className="text-muted-foreground mt-2">
                {searchTerm
                  ? 'No se encontraron atributos que coincidan con tu búsqueda'
                  : 'Comienza creando tu primer atributo de producto'}
              </p>
              {!searchTerm && (
                <Button
                  onClick={() => router.push('/inventory/attributes/create')}
                  className="mt-4"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Atributo
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredAttributes.map((attribute) => (
                <Card key={attribute.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{attribute.displayName}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {attribute.name}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            router.push(`/inventory/attributes/edit/${attribute.id}`)
                          }
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog(attribute)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    {attribute.description && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {attribute.description}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">
                        Valores ({attribute.values?.length || 0}):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {attribute.values && attribute.values.length > 0 ? (
                          attribute.values
                            .slice(0, 5)
                            .map((value) => (
                              <Badge key={value.id} variant="secondary">
                                {value.displayName}
                              </Badge>
                            ))
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Sin valores configurados
                          </p>
                        )}
                        {attribute.values && attribute.values.length > 5 && (
                          <Badge variant="outline">
                            +{attribute.values.length - 5} más
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el atributo &quot;{attributeToDelete?.displayName}&quot; y
              todos sus valores. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
