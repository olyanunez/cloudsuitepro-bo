"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BranchService, UserBranch } from '../services/branchService';

interface BranchContextType {
  activeBranchId: number | null;
  activeBranchName: string | null;
  userBranches: UserBranch[];
  setActiveBranch: (branchId: number, branchName: string) => void;
  clearActiveBranch: () => void;
  loadUserBranches: (userId: number) => Promise<void>;
  isLoading: boolean;
}

const BranchContext = createContext<BranchContextType>({
  activeBranchId: null,
  activeBranchName: null,
  userBranches: [],
  setActiveBranch: () => {},
  clearActiveBranch: () => {},
  loadUserBranches: async () => {},
  isLoading: false,
});

export const useBranch = () => useContext(BranchContext);

interface BranchProviderProps {
  children: ReactNode;
}

export const BranchProvider: React.FC<BranchProviderProps> = ({ children }) => {
  const [activeBranchId, setActiveBranchId] = useState<number | null>(null);
  const [activeBranchName, setActiveBranchName] = useState<string | null>(null);
  const [userBranches, setUserBranches] = useState<UserBranch[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Cargar la sucursal activa del localStorage al iniciar
  useEffect(() => {
    const loadActiveBranch = () => {
      const storedBranchId = BranchService.getActiveBranchId();
      const storedBranchName = BranchService.getActiveBranchName();

      console.log('Loading active branch from localStorage:');
      console.log('- storedBranchId:', storedBranchId);
      console.log('- storedBranchName:', storedBranchName);

      if (storedBranchId) {
        setActiveBranchId(storedBranchId);
        setActiveBranchName(storedBranchName || `Sucursal ${storedBranchId}`);
      }
    };

    loadActiveBranch();

    // Escuchar cambios en localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'active_branch_id' || e.key === 'active_branch_name') {
        console.log('Storage changed:', e.key, '=', e.newValue);
        loadActiveBranch();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Función para establecer la sucursal activa
  const setActiveBranch = (branchId: number, branchName: string) => {
    console.log('setActiveBranch called with:', { branchId, branchName });
    BranchService.setActiveBranch(branchId, branchName);
    setActiveBranchId(branchId);
    setActiveBranchName(branchName);
  };

  // Función para limpiar la sucursal activa
  const clearActiveBranch = () => {
    BranchService.clearActiveBranch();
    setActiveBranchId(null);
    setActiveBranchName(null);
  };

  // Función para cargar las sucursales del usuario
  const loadUserBranches = async (userId: number) => {
    console.log('🔄 loadUserBranches called with userId:', userId);
    setIsLoading(true);
    try {
      const branches = await BranchService.getUserBranches(userId);
      console.log('✅ Loaded user branches:', branches);
      console.log('📊 Number of branches:', branches.length);
      setUserBranches(branches);

      // Si no hay sucursal activa y el usuario tiene sucursales, seleccionar la primera
      if (!activeBranchId && branches.length > 0) {
        const firstBranch = branches[0].branch;
        console.log('🎯 Setting first branch as active:', firstBranch);
        setActiveBranch(firstBranch.id, firstBranch.name);
      }
    } catch (error) {
      console.error('❌ Error loading user branches:', error);
      setUserBranches([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BranchContext.Provider
      value={{
        activeBranchId,
        activeBranchName,
        userBranches,
        setActiveBranch,
        clearActiveBranch,
        loadUserBranches,
        isLoading,
      }}
    >
      {children}
    </BranchContext.Provider>
  );
};

export default BranchContext;
