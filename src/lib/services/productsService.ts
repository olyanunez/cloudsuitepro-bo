"use client";

import { apiGet, apiPost, apiPatch, apiDelete } from './apiService';
import { Product, CreateProductDto, UpdateProductDto } from '../types/product';

export const productsService = {
  async getAll(categoryId?: number, search?: string): Promise<Product[]> {
    const params: any = {};
    if (categoryId) params.categoryId = categoryId;
    if (search) params.search = search;

    return await apiGet<Product[]>('/products', params);
  },

  async getById(id: number): Promise<Product> {
    return await apiGet<Product>(`/products/${id}`);
  },

  async create(data: CreateProductDto): Promise<Product> {
    return await apiPost<Product>('/products', data);
  },

  async update(id: number, data: UpdateProductDto): Promise<Product> {
    return await apiPatch<Product>(`/products/${id}`, data);
  },

  async delete(id: number): Promise<void> {
    await apiDelete(`/products/${id}`);
  },
};
