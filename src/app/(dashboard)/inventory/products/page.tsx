'use client';

import { useState, useEffect, useMemo } from 'react';
import { Product } from '@/lib/types/inventory';
import { ProductService } from '@/lib/services/inventoryService';
import { useCompactView } from '@/lib/hooks/useCompactView';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, SearchIcon, ArrowUpDown, ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import ProtectedPage from '@/components/ProtectedPage';
import { usePermissions } from '@/lib/hooks/usePermissions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
// Importaciones de utilidades

export default function ProductsPage() {
  const { compactView } = useCompactView();
  const { canCreate, canUpdate, canDelete } = usePermissions('PRODUCTS');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  // Helper function for compact view classes
  const getTableCellClass = (baseClass: string) => {
    return compactView
      ? baseClass.replace('py-4', 'py-2').replace('py-3', 'py-1.5')
      : baseClass;
  };

  // Image carousel state
  const [isCarouselOpen, setIsCarouselOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'name' | 'code' | 'price' | 'createdAt' | 'isActive'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    async function loadData() {
      try {
        const productsData = await ProductService.getProducts();
        console.log('Productos recibidos del backend:', productsData);
        setProducts(productsData);
      } catch (error) {
        console.error('Error loading products data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const confirmDelete = (productId: string | number) => {
    setProductToDelete(String(productId));
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      await ProductService.deleteProduct(parseInt(productToDelete, 10));
      setProducts(products.filter(product => product.id !== parseInt(productToDelete, 10)));
      console.log('Producto eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting product:', error);
    } finally {
      setProductToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const openImageCarousel = (product: Product, imageIndex: number = 0) => {
    setSelectedProduct(product);
    setCurrentImageIndex(imageIndex);
    setIsCarouselOpen(true);
  };

  const closeCarousel = () => {
    setIsCarouselOpen(false);
    setSelectedProduct(null);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    if (selectedProduct && selectedProduct.images) {
      setCurrentImageIndex((prev) => (prev + 1) % selectedProduct.images!.length);
    }
  };

  const prevImage = () => {
    if (selectedProduct && selectedProduct.images) {
      setCurrentImageIndex((prev) => (prev - 1 + selectedProduct.images!.length) % selectedProduct.images!.length);
    }
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP'
    }).format(amount);
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter(product => {
        const searchTermLower = searchTerm.toLowerCase();
        return (
          product.name.toLowerCase().includes(searchTermLower) ||
          product.code.toLowerCase().includes(searchTermLower) ||
          (product.description && product.description.toLowerCase().includes(searchTermLower))
        );
      })
      .sort((a, b) => {
        // Usar tipos específicos en lugar de any
        let fieldA: string | Date | boolean | number;
        let fieldB: string | Date | boolean | number;

        if (sortField === 'createdAt') {
          // Asegurarse de que createdAt sea un valor válido para crear una fecha
          fieldA = a.createdAt ? new Date(a.createdAt) : new Date(0);
          fieldB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        } else if (sortField === 'isActive') {
          // Manejar el campo booleano
          fieldA = a.isActive ?? false;
          fieldB = b.isActive ?? false;
        } else if (sortField === 'price') {
          // Manejar el campo numérico - obtener precio de la variante por defecto
          fieldA = a.variants?.[0]?.price || 0;
          fieldB = b.variants?.[0]?.price || 0;
        } else {
          // Asegurarse de que los campos sean strings
          fieldA = (a[sortField] as string)?.toLowerCase() || '';
          fieldB = (b[sortField] as string)?.toLowerCase() || '';
        }

        if (fieldA < fieldB) return sortDirection === 'asc' ? -1 : 1;
        if (fieldA > fieldB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [products, searchTerm, sortField, sortDirection]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle sorting
  const handleSort = (field: 'name' | 'code' | 'price' | 'createdAt' | 'isActive') => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
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
    <ProtectedPage screenCode="PRODUCTS" requiredPermission="VIEW">
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gestión de Productos</h1>
          {canCreate && (
            <Link href="/inventory/products/create">
              <Button className="bg-primary hover:bg-primary-600">
                <PlusIcon className="mr-2 h-4 w-4" />
                Nuevo Producto
              </Button>
            </Link>
          )}
        </div>

      {/* Search and filter controls */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar productos..."
            className="pl-10 w-full"
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select value={sortField} onValueChange={(value: string) => setSortField(value as 'name' | 'code' | 'price' | 'createdAt' | 'isActive')}>
          <SelectTrigger>
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Nombre</SelectItem>
            <SelectItem value="code">Código</SelectItem>
            <SelectItem value="price">Precio</SelectItem>
            <SelectItem value="isActive">Estado</SelectItem>
            <SelectItem value="createdAt">Fecha de Creación</SelectItem>
          </SelectContent>
        </Select>

        <Select value={itemsPerPage.toString()} onValueChange={(value: string) => setItemsPerPage(Number(value))}>
          <SelectTrigger>
            <SelectValue placeholder="Elementos por página" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5 por página</SelectItem>
            <SelectItem value="10">10 por página</SelectItem>
            <SelectItem value="25">25 por página</SelectItem>
            <SelectItem value="50">50 por página</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th
                  scope="col"
                  className={getTableCellClass("px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider")}
                >
                  Imagen
                </th>
                <th
                  scope="col"
                  className={getTableCellClass("px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer")}
                  onClick={() => handleSort('code')}
                >
                  <div className="flex items-center">
                    Código
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </th>
                <th
                  scope="col"
                  className={getTableCellClass("px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider")}
                >
                  <div className="flex items-center">
                    Código de Barras
                  </div>
                </th>
                <th
                  scope="col"
                  className={getTableCellClass("px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer")}
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Nombre
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </th>
                <th
                  scope="col"
                  className={getTableCellClass("px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer")}
                  onClick={() => handleSort('price')}
                >
                  <div className="flex items-center">
                    Precio
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </th>
                <th
                  scope="col"
                  className={getTableCellClass("px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider")}
                >
                  <div className="flex items-center">
                    Categoría
                  </div>
                </th>
                <th
                  scope="col"
                  className={getTableCellClass("px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider")}
                >
                  <div className="flex items-center">
                    Tipo
                  </div>
                </th>
                <th
                  scope="col"
                  className={getTableCellClass("px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider")}
                >
                  <div className="flex items-center justify-center">
                    Variantes
                  </div>
                </th>
                <th
                  scope="col"
                  className={getTableCellClass("px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer")}
                  onClick={() => handleSort('isActive')}
                >
                  <div className="flex items-center">
                    Estado
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </th>
                <th
                  scope="col"
                  className={getTableCellClass("px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer")}
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center">
                    Fecha de Creación
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </th>
                <th scope="col" className={getTableCellClass("px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider")}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedProducts.map((product) => {
                const defaultVariant = product.variants?.[0];

                // For simple products (no hasVariants), use variant images; otherwise use product images
                let imagesToUse = product.hasVariants ? product.images : null;

                // If product has no images, look for images in variants (in order)
                if (!imagesToUse || imagesToUse.length === 0) {
                  const variantWithImages = product.variants?.find(v => v.images && v.images.length > 0);
                  imagesToUse = variantWithImages?.images || null;
                }

                const primaryImage = imagesToUse?.find(img => img.isPrimary) || imagesToUse?.[0];

                return (
                  <tr key={product.id}>
                    <td className={getTableCellClass("px-6 py-4 whitespace-nowrap")}>
                      <div
                        className={`relative ${compactView ? 'w-12 h-12' : 'w-16 h-16'} cursor-pointer rounded-md overflow-hidden border border-gray-200 dark:border-gray-600 hover:border-primary transition-colors`}
                        onClick={() => openImageCarousel(product, 0)}
                      >
                        {primaryImage ? (
                          <Image
                            src={primaryImage.url}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                            <ImageIcon className={`${compactView ? 'h-6 w-6' : 'h-8 w-8'} text-gray-400`} />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className={getTableCellClass("px-6 py-4 whitespace-nowrap")}>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {product.code}
                      </div>
                    </td>
                    <td className={getTableCellClass("px-6 py-4 whitespace-nowrap")}>
                      <div className="text-sm font-mono text-gray-900 dark:text-white">
                        {defaultVariant?.barcode || 'N/A'}
                      </div>
                    </td>
                    <td className={getTableCellClass("px-6 py-4 whitespace-nowrap")}>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {product.name}
                      </div>
                    </td>
                    <td className={getTableCellClass("px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300")}>
                      {defaultVariant?.price ? formatCurrency(defaultVariant.price) : 'N/A'}
                    </td>
                    <td className={getTableCellClass("px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300")}>
                      {product.category?.name || `Categoría #${product.categoryId}`}
                    </td>
                    <td className={getTableCellClass("px-6 py-4 whitespace-nowrap")}>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${product.isStockable ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' : 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100'}`}>
                        {product.isStockable ? 'Inventariable' : 'Servicio'}
                      </span>
                    </td>
                    <td className={getTableCellClass("px-6 py-4 whitespace-nowrap text-center")}>
                      <span className="inline-flex items-center justify-center px-2 py-1 text-sm font-medium text-gray-900 dark:text-white">
                        {product.variants?.length || 0}
                      </span>
                    </td>
                    <td className={getTableCellClass("px-6 py-4 whitespace-nowrap")}>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${product.isActive ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'}`}>
                        {product.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className={getTableCellClass("px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300")}>
                      {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className={getTableCellClass("px-6 py-4 whitespace-nowrap text-right text-sm font-medium")}>
                      <div className="flex justify-end space-x-2">
                        <Link href={`/inventory/products/${product.id}`}>
                          <Button variant="outline" size="sm" className="px-2 py-1">
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                        </Link>
                        {canUpdate && (
                          <Link href={`/inventory/products/edit/${product.id}`}>
                            <Button variant="outline" size="sm" className="px-2 py-1">
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                          </Link>
                        )}
                        {canDelete && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="px-2 py-1 border-red-300 text-red-500 hover:bg-red-50 dark:hover:bg-red-900"
                            onClick={() => confirmDelete(product.id)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination controls */}
      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Mostrando {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredProducts.length)} de {filteredProducts.length} productos
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            // Show pages around current page
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </Button>
            );
          })}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Image Carousel Dialog */}
      <Dialog open={isCarouselOpen} onOpenChange={closeCarousel}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedProduct?.name}</DialogTitle>
          </DialogHeader>
          {selectedProduct && selectedProduct.images && selectedProduct.images.length > 0 ? (
            <div className="space-y-4">
              <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                <Image
                  src={selectedProduct.images[currentImageIndex].url}
                  alt={`${selectedProduct.name} - Imagen ${currentImageIndex + 1}`}
                  fill
                  className="object-contain"
                />
                {selectedProduct.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="outline absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full transition-all hover:scale-110"
                      aria-label="Imagen anterior"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="outline absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full transition-all hover:scale-110"
                      aria-label="Imagen siguiente"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}
              </div>
              {selectedProduct.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {selectedProduct.images.map((image, index) => (
                    <div
                      key={image.id}
                      className={`relative w-20 h-20 flex-shrink-0 cursor-pointer rounded-md overflow-hidden border-2 transition-colors ${index === currentImageIndex
                        ? 'border-primary'
                        : 'border-gray-200 dark:border-gray-600 hover:border-primary/50'
                        }`}
                      onClick={() => setCurrentImageIndex(index)}
                    >
                      <Image
                        src={image.url}
                        alt={`Miniatura ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
              <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                Imagen {currentImageIndex + 1} de {selectedProduct.images.length}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <div className="text-center">
                <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400">No hay imágenes disponibles</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el producto y no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct} className="!bg-red-600 hover:!bg-red-700 !text-white border-red-600">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </ProtectedPage>
  );
}