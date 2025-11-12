'use client';

import { useState, useCallback } from 'react';
import { X, Upload, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LogoUploadProps {
  currentLogo?: string | null;
  onImageChange: (file: File | null, previewUrl: string | null) => void;
}

export function LogoUpload({ currentLogo, onImageChange }: LogoUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentLogo || null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, GIF, WebP)');
      return;
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('El archivo es demasiado grande. Tamaño máximo: 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setPreviewUrl(url);
      onImageChange(file, url);
    };
    reader.readAsDataURL(file);
  }, [onImageChange]);

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

  const removeImage = () => {
    setPreviewUrl(null);
    onImageChange(null, null);
  };

  return (
    <div className="space-y-4">
      {previewUrl ? (
        <div className="space-y-3">
          <div className="relative group inline-block">
            <div className="relative w-48 h-48 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-center">
              <img
                src={previewUrl}
                alt="Logo"
                className="max-w-full max-h-full object-contain p-2"
              />
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 h-8 w-8 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={removeImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <input
              type="file"
              id="logo-change"
              className="hidden"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
            <label htmlFor="logo-change">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('logo-change')?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Cambiar logo
              </Button>
            </label>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver
              ? 'border-primary bg-primary/5'
              : 'border-gray-300 dark:border-gray-600'
          } cursor-pointer`}
        >
          <input
            type="file"
            id="logo-upload"
            className="hidden"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
          <label
            htmlFor="logo-upload"
            className="flex flex-col items-center cursor-pointer"
          >
            <div className="w-24 h-24 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3">
              <Building2 className="h-12 w-12 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              Arrastra una imagen aquí o haz clic para seleccionar
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG, GIF, WEBP hasta 5MB
            </p>
          </label>
        </div>
      )}
    </div>
  );
}
