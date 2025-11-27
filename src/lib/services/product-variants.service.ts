"use client";

import { apiGet, apiPost, apiPatch, apiDelete } from './apiService';
import {
  ProductVariant,
  CreateProductVariantDto,
  UpdateProductVariantDto,
  BulkCreateVariantsDto,
  BulkCreateVariantsResponse,
  VariantStockInfo,
} from '../types/product';

export const productVariantsService = {
  async getAll(productId?: number): Promise<ProductVariant[]> {
    const params = productId ? { productId } : undefined;
    return await apiGet<ProductVariant[]>('/product-variants', params);
  },

  async getById(id: number): Promise<ProductVariant> {
    return await apiGet<ProductVariant>(`/product-variants/${id}`);
  },

  async create(data: CreateProductVariantDto): Promise<ProductVariant> {
    return await apiPost<ProductVariant>('/product-variants', data);
  },

  async bulkCreate(data: BulkCreateVariantsDto): Promise<BulkCreateVariantsResponse> {
    return await apiPost<BulkCreateVariantsResponse>('/product-variants/bulk', data);
  },

  async update(id: number, data: UpdateProductVariantDto): Promise<ProductVariant> {
    return await apiPatch<ProductVariant>(`/product-variants/${id}`, data);
  },

  async delete(id: number): Promise<void> {
    await apiDelete(`/product-variants/${id}`);
  },

  async getTotalStock(id: number): Promise<VariantStockInfo> {
    return await apiGet<VariantStockInfo>(`/product-variants/${id}/stock`);
  },

  async uploadImages(variantId: number, images: File[]): Promise<ProductVariant> {
    const formData = new FormData();
    images.forEach((image) => {
      formData.append('images', image);
    });

    const token = localStorage.getItem('auth_token');
    const tenantId = localStorage.getItem('tenant_id');
    const headers: Record<string, string> = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (tenantId) {
      headers['x-tenant-id'] = tenantId;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product-variants/${variantId}/images`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Error uploading images');
    }

    return await response.json();
  },

  async deleteImage(variantId: number, imageId: number): Promise<ProductVariant> {
    const token = localStorage.getItem('auth_token');
    const tenantId = localStorage.getItem('tenant_id');
    const headers: Record<string, string> = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (tenantId) {
      headers['x-tenant-id'] = tenantId;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product-variants/${variantId}/images/${imageId}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      throw new Error('Error deleting image');
    }

    return await response.json();
  },
};
