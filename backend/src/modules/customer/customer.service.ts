import Customer from '../../shared/models/customer/customer.model';
import { ApiError } from '../../shared/utils/apiError/ApiError';

interface CreateCustomerInput {
  tenantId: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  taxId?: string;
}

interface UpdateCustomerInput {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  taxId?: string;
  isActive?: boolean;
}

export const getCustomers = async (
  tenantId: string,
  options?: { search?: string; page?: number; limit?: number }
) => {
  const { search, page = 1, limit = 20 } = options || {};
  const query: any = { tenantId, isActive: true };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const total = await Customer.countDocuments(query);
  const customers = await Customer.find(query)
    .sort({ totalPurchases: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return { data: customers, meta: { total, page, limit } };
};

export const getCustomerById = async (customerId: string, tenantId: string) => {
  const query: any = { _id: customerId, tenantId };
  const customer = await Customer.findOne(query);
  if (!customer) throw ApiError.notFound('Customer not found');
  return customer;
};

export const findCustomerByNamePhone = async (tenantId: string, name: string, phone?: string) => {
  const query: any = { tenantId, name: { $regex: `^${name}$`, $options: 'i' }, isActive: true };
  if (phone) query.phone = phone;
  return Customer.findOne(query);
};

export const createCustomer = async (input: CreateCustomerInput) => {
  const customer = new Customer(input);
  await customer.save();
  return customer;
};

export const updateCustomer = async (customerId: string, tenantId: string, input: UpdateCustomerInput) => {
  const query: any = { _id: customerId, tenantId };
  const customer = await Customer.findOne(query);
  if (!customer) throw ApiError.notFound('Customer not found');

  Object.assign(customer, input);
  await customer.save();
  return customer;
};

export const deleteCustomer = async (customerId: string, tenantId: string) => {
  const query: any = { _id: customerId, tenantId };
  const customer = await Customer.findOneAndDelete(query);
  if (!customer) throw ApiError.notFound('Customer not found');
  return customer;
};

export const recordPurchase = async (customerId: string, tenantId: string, total: number) => {
  const customer = await Customer.findOne({ _id: customerId, tenantId });
  if (!customer) throw ApiError.notFound('Customer not found');

  const c = customer as any;
  c.totalPurchases += 1;
  c.totalSpent += total;
  c.lastPurchaseDate = new Date();
  await customer.save();
  return customer;
};
