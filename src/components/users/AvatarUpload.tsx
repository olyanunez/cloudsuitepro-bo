'use client';

import { useState, useCallback } from 'react';
import { X, Upload, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface AvatarUploadProps {
  currentAvatar?: string | null;
  onImageChange: (file: File | null, previewUrl: string | null) => void;
}

export function AvatarUpload({ currentAvatar, onImageChange }: AvatarUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatar || null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        setPreviewUrl(url);
        onImageChange(file, url);
      };
      reader.readAsDataURL(file);
    }
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
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-700">
              <Image
                src={previewUrl}
                alt="Avatar"
                fill
                className="object-cover"
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
              id="avatar-change"
              className="hidden"
              accept="image/*"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
            <label htmlFor="avatar-change">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('avatar-change')?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Cambiar foto
              </Button>
            </label>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragOver
              ? 'border-primary bg-primary/5'
              : 'border-gray-300 dark:border-gray-600'
          } cursor-pointer`}
        >
          <input
            type="file"
            id="avatar-upload"
            className="hidden"
            accept="image/*"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
          <label
            htmlFor="avatar-upload"
            className="flex flex-col items-center cursor-pointer"
          >
            <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3">
              <UserIcon className="h-12 w-12 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Arrastra una imagen aquí o haz clic para seleccionar
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG, WEBP hasta 5MB
            </p>
          </label>
        </div>
      )}
    </div>
  );
}
