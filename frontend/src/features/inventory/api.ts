import api from '../../api/axios';
import { ENDPOINTS } from '../../api/endpoints';
import { ApiResponse, Product, Stock } from '../../../types';

export const getProductByBarcode = async (barcode: string): Promise<ApiResponse<Product | null>> => {
  const { data } = await api.get<ApiResponse<Product | null>>(`${ENDPOINTS.PRODUCTS_BARCODE}/${barcode}`);
  return data;
};

export const getProducts = async (params?: { page?: number; limit?: number; search?: string; branchId?: string }): Promise<ApiResponse<Product[]>> => {
  const { data } = await api.get<ApiResponse<Product[]>>(ENDPOINTS.PRODUCTS, { params });
  return data;
};

export const getProduct = async (id: string): Promise<ApiResponse<Product>> => {
  const { data } = await api.get<ApiResponse<Product>>(`${ENDPOINTS.PRODUCTS}/${id}`);
  return data;
};

export const createProduct = async (input: Partial<Product>): Promise<ApiResponse<Product>> => {
  const { data } = await api.post<ApiResponse<Product>>(ENDPOINTS.PRODUCTS, input);
  return data;
};

export const updateProduct = async (id: string, input: Partial<Product>): Promise<ApiResponse<Product>> => {
  const { data } = await api.patch<ApiResponse<Product>>(`${ENDPOINTS.PRODUCTS}/${id}`, input);
  return data;
};

export const deleteProduct = async (id: string): Promise<ApiResponse<null>> => {
  const { data } = await api.delete<ApiResponse<null>>(`${ENDPOINTS.PRODUCTS}/${id}`);
  return data;
};

export const getStock = async (branchId?: string): Promise<ApiResponse<Stock[]>> => {
  const { data } = await api.get<ApiResponse<Stock[]>>(ENDPOINTS.STOCK, { params: { branchId } });
  return data;
};

export const getLowStock = async (branchId?: string): Promise<ApiResponse<Stock[]>> => {
  const { data } = await api.get<ApiResponse<Stock[]>>(ENDPOINTS.STOCK_LOW, { params: { branchId } });
  return data;
};

export const getOutOfStock = async (branchId?: string): Promise<ApiResponse<any[]>> => {
  const { data } = await api.get<ApiResponse<any[]>>(ENDPOINTS.STOCK_OUT, { params: { branchId } });
  return data;
};

export const initializeStock = async (input: { productId: string; price: number; quantity?: number; branchId?: string }): Promise<ApiResponse<Stock>> => {
  const { data } = await api.post<ApiResponse<Stock>>(ENDPOINTS.STOCK, input);
  return data;
};

export const adjustStock = async (productId: string, input: { quantity: number; note: string }): Promise<ApiResponse<null>> => {
  const { data } = await api.post<ApiResponse<null>>(`${ENDPOINTS.STOCK}/${productId}/adjust`, input);
  return data;
};

export const importProducts = async (body: { products: any[]; skipDuplicates?: boolean }): Promise<ApiResponse<{ created: number; errors: Array<{ row: number; message: string }> }>> => {
  const { data } = await api.post(ENDPOINTS.PRODUCTS_IMPORT, body);
  return data;
};

export const uploadProductImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);
  const { data } = await api.post(ENDPOINTS.PRODUCTS_UPLOAD_IMAGE, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data.url;
};

export const getExportUrl = () => {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
  return `${base}${ENDPOINTS.PRODUCTS_EXPORT}`;
};
