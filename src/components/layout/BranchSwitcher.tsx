"use client";

import * as React from 'react';
import { Check, ChevronsUpDown, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useBranch } from '@/lib/contexts/BranchContext';

export default function BranchSwitcher() {
  const [open, setOpen] = React.useState(false);
  const { activeBranchId, activeBranchName, userBranches, setActiveBranch, isLoading } = useBranch();

  // Obtener solo las sucursales activas (compatible con MySQL que devuelve 1/0)
  const activeBranches = userBranches.filter(ub => {
    const ubActive = ub.isActive === true || ub.isActive === 1;
    const branchActive = ub.branch.isActive === true || ub.branch.isActive === 1;
    return ubActive && branchActive;
  });

  console.log('BranchSwitcher - Debug:', {
    activeBranchId,
    activeBranchName,
    userBranches,
    activeBranches,
    isLoading
  });

  const handleSelectBranch = (branchId: number, branchName: string) => {
    setActiveBranch(branchId, branchName);
    setOpen(false);
  };

  // Si no hay sucursales, mostrar un mensaje informativo
  if (activeBranches.length === 0 && !isLoading) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 px-2 py-1 border border-dashed border-gray-300 dark:border-gray-700 rounded">
        <Building2 className="h-3 w-3" />
        <span>Sin sucursales asignadas</span>
      </div>
    );
  }

  // Mostrar loading
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <Building2 className="h-3 w-3 animate-pulse" />
        <span>Cargando...</span>
      </div>
    );
  }

  // Si solo hay una sucursal, mostrar solo el nombre sin selector
  if (activeBranches.length === 1) {
    return (
      <div className="flex items-center gap-1.5 sm:gap-2 text-sm text-gray-600 dark:text-gray-300">
        <Building2 className="h-4 w-4 shrink-0" />
        <span className="truncate max-w-[80px] sm:max-w-[150px]">{activeBranchName || activeBranches[0].branch.name}</span>
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          role="button"
          tabIndex={0}
          aria-expanded={open}
          aria-label="Seleccionar sucursal"
          className="flex items-center justify-between gap-1.5 sm:gap-2 h-8 sm:h-9 px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setOpen(!open);
            }
          }}
        >
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Building2 className="h-4 w-4 text-gray-600 dark:text-gray-300 shrink-0" />
            <span className="truncate max-w-[60px] sm:max-w-[120px] md:max-w-[150px] text-gray-700 dark:text-gray-200">
              {activeBranchName || 'Seleccionar sucursal'}
            </span>
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 text-gray-500" />
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-[280px] p-0 "
        align="start"
        style={{ backgroundColor: 'white' }}
      >
        <div className="p-2 bg-white dark:bg-gray-900 rounded-md">
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 py-1.5 mb-1">
            Sucursales disponibles
          </div>
          <div className="space-y-1">
            {isLoading ? (
              <div className="px-2 py-1.5 text-sm text-gray-500 dark:text-gray-400">
                Cargando sucursales...
              </div>
            ) : activeBranches.length === 0 ? (
              <div className="px-2 py-1.5 text-sm text-gray-500 dark:text-gray-400">
                No tienes sucursales asignadas
              </div>
            ) : (
              activeBranches.map((userBranch) => {
                const branch = userBranch.branch;
                const isSelected = activeBranchId === branch.id;

                return (
                  <div
                    key={branch.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSelectBranch(branch.id, branch.name)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleSelectBranch(branch.id, branch.name);
                      }
                    }}
                    className={cn(
                      'w-full flex items-center gap-2 rounded-md px-2 py-2 text-sm cursor-pointer',
                      'hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors',
                      isSelected && 'bg-blue-50 dark:bg-blue-900/20'
                    )}
                  >
                    <div className="flex h-4 w-4 items-center justify-center shrink-0">
                      {isSelected && <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                    </div>
                    <div className="flex-1 text-left min-w-0 overflow-hidden">
                      <div className={cn(
                        'font-medium text-gray-900 dark:text-gray-100 truncate',
                        isSelected && 'text-blue-600 dark:text-blue-400'
                      )}>
                        {branch.name}
                      </div>
                      {branch.description && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {branch.description}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
