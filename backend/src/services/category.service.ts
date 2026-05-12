import Category from '../models/category.model';
import { ApiError } from '../utils/ApiError';

interface CreateCategoryInput {
  tenantId: string;
  branchId?: string;
  name: string;
  parentId?: string;
}

interface UpdateCategoryInput {
  name?: string;
  parentId?: string;
  isActive?: boolean;
}

export const getCategories = async (tenantId: string, branchId?: string, options?: { page?: number; limit?: number }) => {
  const { page = 1, limit = 10 } = options || {};
  const query: any = { tenantId };
  if (branchId) query.branchId = branchId;
  const [total, categories] = await Promise.all([
    Category.countDocuments(query),
    Category.find(query).sort({ name: 1 }).skip((page - 1) * limit).limit(limit),
  ]);
  return { data: categories, meta: { total, page, limit } };
};

export const getCategoryById = async (categoryId: string, tenantId: string, branchId?: string) => {
  const query: any = { _id: categoryId, tenantId };
  if (branchId) query.branchId = branchId;
  const category = await Category.findOne(query);
  if (!category) throw ApiError.notFound('Category not found');
  return category;
};

export const createCategory = async (input: CreateCategoryInput) => {
  if (input.parentId) {
    const parent = await Category.findOne({ _id: input.parentId, tenantId: input.tenantId, branchId: input.branchId });
    if (!parent) throw ApiError.notFound('Parent category not found');
  }

  const category = new Category({
    tenantId: input.tenantId,
    branchId: input.branchId,
    name: input.name,
    parentId: input.parentId,
  });

  await category.save();
  return category;
};

export const updateCategory = async (categoryId: string, tenantId: string, branchId: string | undefined, input: UpdateCategoryInput) => {
  const query: any = { _id: categoryId, tenantId };
  if (branchId) query.branchId = branchId;
  const category = await Category.findOne(query);
  if (!category) throw ApiError.notFound('Category not found');

  if (input.parentId) {
    if (input.parentId === categoryId) {
      throw ApiError.badRequest('Category cannot be its own parent');
    }
    const parent = await Category.findOne({ _id: input.parentId, tenantId, branchId });
    if (!parent) throw ApiError.notFound('Parent category not found');
  }

  Object.assign(category, input);
  await category.save();
  return category;
};

export const deleteCategory = async (categoryId: string, tenantId: string, branchId?: string) => {
  const query: any = { _id: categoryId, tenantId };
  if (branchId) query.branchId = branchId;
  const category = await Category.findOneAndDelete(query);
  if (!category) throw ApiError.notFound('Category not found');
  return category;
};
