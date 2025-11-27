"use client";

import { apiGet, apiPost, apiPatch, apiDelete } from './apiService';
import {
  ProductCategory,
  CreateProductCategoryDto,
  UpdateProductCategoryDto,
} from '../types/product';

export const productCategoriesService = {
  async getAll(): Promise<ProductCategory[]> {
    return await apiGet<ProductCategory[]>('/product-categories');
  },

  async getById(id: number): Promise<ProductCategory> {
    return await apiGet<ProductCategory>(`/product-categories/${id}`);
  },

  async create(data: CreateProductCategoryDto): Promise<ProductCategory> {
    return await apiPost<ProductCategory>('/product-categories', data);
  },

  async update(id: number, data: UpdateProductCategoryDto): Promise<ProductCategory> {
    return await apiPatch<ProductCategory>(`/product-categories/${id}`, data);
  },

  async delete(id: number): Promise<void> {
    await apiDelete(`/product-categories/${id}`);
  },
};
