export interface CartItem {
  productId: string;
  productName: string;
  sku: string;
  barcode?: string;
  stock: number;
  quantity: number;
  unitPrice: number;
  total: number;
}
