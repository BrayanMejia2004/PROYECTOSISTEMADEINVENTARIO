import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import tenantRoutes from '../modules/tenant/tenant.routes';
import branchRoutes from '../modules/branch/branch.routes';
import userRoutes from '../modules/user/user.routes';
import departmentRoutes from '../modules/department/department.routes';
import brandRoutes from '../modules/brand/brand.routes';
import supplierRoutes from '../modules/supplier/supplier.routes';
import customerRoutes from '../modules/customer/customer.routes';
import productRoutes from '../modules/product/product.routes';
import stockRoutes from '../modules/stock/stock.routes';
import saleRoutes from '../modules/sale/sale.routes';
import reportRoutes from '../modules/report/report.routes';
import cashierShiftRoutes from '../modules/cashierShift/cashierShift.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/tenant', tenantRoutes);
router.use('/branches', branchRoutes);
router.use('/users', userRoutes);
router.use('/departments', departmentRoutes);
router.use('/brands', brandRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/customers', customerRoutes);
router.use('/products', productRoutes);
router.use('/stock', stockRoutes);
router.use('/sales', saleRoutes);
router.use('/reports', reportRoutes);
router.use('/cashier-shifts', cashierShiftRoutes);

export default router;
