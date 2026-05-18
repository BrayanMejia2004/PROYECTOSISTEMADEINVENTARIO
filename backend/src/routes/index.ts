import { Router } from 'express';
import authRoutes from './auth.routes';
import tenantRoutes from './tenant.routes';
import branchRoutes from './branch.routes';
import userRoutes from './user.routes';
import departmentRoutes from './department.routes';
import brandRoutes from './brand.routes';
import supplierRoutes from './supplier.routes';
import customerRoutes from './customer.routes';
import productRoutes from './product.routes';
import stockRoutes from './stock.routes';
import saleRoutes from './sale.routes';
import reportRoutes from './report.routes';
import cashierShiftRoutes from './cashierShift.routes';

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
