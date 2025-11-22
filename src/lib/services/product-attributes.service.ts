import axios from 'axios';
import {
  ProductAttribute,
  CreateProductAttributeDto,
  UpdateProductAttributeDto,
  CreateAttributeValueDto,
  UpdateAttributeValueDto,
} from '../types/product';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const productAttributesService = {
  async getAll(): Promise<ProductAttribute[]> {
    const response = await axios.get(`${API_URL}/product-attributes`);
    return response.data;
  },

  async getById(id: number): Promise<ProductAttribute> {
    const response = await axios.get(`${API_URL}/product-attributes/${id}`);
    return response.data;
  },

  async create(data: CreateProductAttributeDto): Promise<ProductAttribute> {
    const response = await axios.post(`${API_URL}/product-attributes`, data);
    return response.data;
  },

  async update(id: number, data: UpdateProductAttributeDto): Promise<ProductAttribute> {
    const response = await axios.patch(`${API_URL}/product-attributes/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await axios.delete(`${API_URL}/product-attributes/${id}`);
  },

  async addValue(attributeId: number, data: CreateAttributeValueDto): Promise<ProductAttribute> {
    const response = await axios.post(`${API_URL}/product-attributes/${attributeId}/values`, data);
    return response.data;
  },

  async updateValue(
    attributeId: number,
    valueId: number,
    data: UpdateAttributeValueDto
  ): Promise<ProductAttribute> {
    const response = await axios.patch(
      `${API_URL}/product-attributes/${attributeId}/values/${valueId}`,
      data
    );
    return response.data;
  },

  async deleteValue(attributeId: number, valueId: number): Promise<void> {
    await axios.delete(`${API_URL}/product-attributes/${attributeId}/values/${valueId}`);
  },
};
