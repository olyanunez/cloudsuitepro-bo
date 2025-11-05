'use client';

import { useState, useCallback } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export interface ProductImage {
  id?: number;
  url: string;
  publicId?: string;
  isPrimary?: boolean;
  order: number;
  file?: File;
}

interface ProductImageUploadProps {
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
  maxImages?: number;
}

export function ProductImageUpload({ images, onChange, maxImages = 10 }: ProductImageUploadProps) {
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;

    const newImages: ProductImage[] = [];
    const currentOrder = images.length;

    Array.from(files).forEach((file, index) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const url = e.target?.result as string;
          newImages.push({
            url,
            order: currentOrder + index,
            file,
            isPrimary: images.length === 0 && index === 0
          });

          if (newImages.length === Math.min(files.length, maxImages - images.length)) {
            onChange([...images, ...newImages]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }, [images, onChange, maxImages]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    // Reordenar
    const reorderedImages = newImages.map((img, i) => ({ ...img, order: i }));
    onChange(reorderedImages);
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    // Reordenar
    const reorderedImages = newImages.map((img, i) => ({ ...img, order: i }));
    onChange(reorderedImages);
  };

  const setPrimaryImage = (index: number) => {
    const newImages = images.map((img, i) => ({
      ...img,
      isPrimary: i === index
    }));
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragOver
            ? 'border-primary bg-primary/5'
            : 'border-gray-300 dark:border-gray-600'
          } ${images.length >= maxImages ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <input
          type="file"
          id="image-upload"
          className="hidden"
          accept="image/*"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          disabled={images.length >= maxImages}
        />
        <label
          htmlFor="image-upload"
          className={`flex flex-col items-center ${images.length >= maxImages ? 'cursor-not-allowed' : 'cursor-pointer'
            }`}
        >
          <Upload className="h-12 w-12 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {images.length >= maxImages
              ? `Máximo ${maxImages} imágenes alcanzadas`
              : 'Arrastra imágenes aquí o haz clic para seleccionar'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            PNG, JPG, WEBP hasta 10MB ({images.length}/{maxImages})
          </p>
        </label>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={index}
              className="relative group rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800"
            >
              <div className="relative aspect-square">
                <Image
                  src={image.url}
                  alt={`Producto ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-50">
                <div className="flex space-x-2">
                  {index > 0 && (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => moveImage(index, index - 1)}
                      className="h-8 w-8 p-0"
                    >
                      ←
                    </Button>
                  )}
                  {index < images.length - 1 && (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => moveImage(index, index + 1)}
                      className="h-8 w-8 p-0"
                    >
                      →
                    </Button>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => removeImage(index)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
                <div className="flex gap-1">
                  {image.isPrimary && (
                    <span className="bg-primary text-white text-xs px-2 py-1 rounded">
                      Principal
                    </span>
                  )}
                  <span className="bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                    #{index + 1}
                  </span>
                </div>
                {!image.isPrimary && (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setPrimaryImage(index)}
                    className="h-6 text-xs px-2"
                  >
                    Principal
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
