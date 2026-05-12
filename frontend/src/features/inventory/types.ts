export interface InventoryFilters {
  page: number;
  limit: number;
  search?: string;
  departmentId?: string;
  supplierId?: string;
}
