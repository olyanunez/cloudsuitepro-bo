import axios from 'axios';
import {
  ProductVariant,
  CreateProductVariantDto,
  UpdateProductVariantDto,
  BulkCreateVariantsDto,
  BulkCreateVariantsResponse,
  VariantStockInfo,
} from '../types/product';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const productVariantsService = {
  async getAll(productId?: number): Promise<ProductVariant[]> {
    const params = productId ? { productId } : {};
    const response = await axios.get(`${API_URL}/product-variants`, { params });
    return response.data;
  },

  async getById(id: number): Promise<ProductVariant> {
    const response = await axios.get(`${API_URL}/product-variants/${id}`);
    return response.data;
  },

  async create(data: CreateProductVariantDto): Promise<ProductVariant> {
    const response = await axios.post(`${API_URL}/product-variants`, data);
    return response.data;
  },

  async bulkCreate(data: BulkCreateVariantsDto): Promise<BulkCreateVariantsResponse> {
    const response = await axios.post(`${API_URL}/product-variants/bulk`, data);
    return response.data;
  },

  async update(id: number, data: UpdateProductVariantDto): Promise<ProductVariant> {
    const response = await axios.patch(`${API_URL}/product-variants/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await axios.delete(`${API_URL}/product-variants/${id}`);
  },

  async getTotalStock(id: number): Promise<VariantStockInfo> {
    const response = await axios.get(`${API_URL}/product-variants/${id}/stock`);
    return response.data;
  },
};
