"use client";

import { apiGet, apiPost, apiPatch, apiDelete } from './apiService';
import {
  ProductAttribute,
  CreateProductAttributeDto,
  UpdateProductAttributeDto,
  CreateAttributeValueDto,
  UpdateAttributeValueDto,
} from '../types/product';

export const productAttributesService = {
  async getAll(): Promise<ProductAttribute[]> {
    return await apiGet<ProductAttribute[]>('/product-attributes');
  },

  async getById(id: number): Promise<ProductAttribute> {
    return await apiGet<ProductAttribute>(`/product-attributes/${id}`);
  },

  async create(data: CreateProductAttributeDto): Promise<ProductAttribute> {
    return await apiPost<ProductAttribute>('/product-attributes', data);
  },

  async update(id: number, data: UpdateProductAttributeDto): Promise<ProductAttribute> {
    return await apiPatch<ProductAttribute>(`/product-attributes/${id}`, data);
  },

  async delete(id: number): Promise<void> {
    await apiDelete(`/product-attributes/${id}`);
  },

  async addValue(attributeId: number, data: CreateAttributeValueDto): Promise<ProductAttribute> {
    return await apiPost<ProductAttribute>(`/product-attributes/${attributeId}/values`, data);
  },

  async updateValue(
    attributeId: number,
    valueId: number,
    data: UpdateAttributeValueDto
  ): Promise<ProductAttribute> {
    return await apiPatch<ProductAttribute>(
      `/product-attributes/${attributeId}/values/${valueId}`,
      data
    );
  },

  async deleteValue(attributeId: number, valueId: number): Promise<void> {
    await apiDelete(`/product-attributes/${attributeId}/values/${valueId}`);
  },
};
