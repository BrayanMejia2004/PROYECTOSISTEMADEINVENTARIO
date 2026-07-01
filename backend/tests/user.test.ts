import 'jest';
import { getUsers, getUserById, createUser, updateUser, deleteUser } from '../src/modules/user/user.service';
import Tenant from '../src/shared/models/tenant/tenant.model';
import User from '../src/shared/models/user/user.model';

let tenantId: string;
let ownerUserId: string;

beforeEach(async () => {
  const tenant = await Tenant.create({
    slug: 'user-test-store',
    name: 'User Test Store',
    email: 'admin@usertest.com',
  });
  tenantId = tenant._id.toString();

  const owner = await User.create({
    tenantId,
    email: 'owner@usertest.com',
    password: 'hashedpassword',
    firstName: 'Owner',
    lastName: 'User',
    role: 'owner',
  });
  ownerUserId = owner._id.toString();
});

describe('User Service', () => {
  describe('getUsers', () => {
    it('should return paginated users list', async () => {
      await User.create([
        { tenantId, email: 'user1@test.com', password: 'hash', firstName: 'User', lastName: 'One', role: 'cashier' },
        { tenantId, email: 'user2@test.com', password: 'hash', firstName: 'User', lastName: 'Two', role: 'cashier' },
      ]);

      const result = await getUsers(tenantId);

      expect(result.data).toHaveLength(3);
      expect(result.meta).toMatchObject({ total: 3, page: 1, limit: 10 });
    });

    it('should filter users by role', async () => {
      const result = await getUsers(tenantId, 'admin');

      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });
  });

  describe('getUserById', () => {
    it('should return user by id within tenant', async () => {
      const result = await getUserById(ownerUserId, tenantId);

      expect(result._id.toString()).toBe(ownerUserId);
      expect(result.email).toBe('owner@usertest.com');
    });

    it('should throw not found for non-existent user', async () => {
      const fakeId = '000000000000000000000000';
      await expect(getUserById(fakeId, tenantId)).rejects.toThrow('not found');
    });

    it('should throw not found for user in different tenant', async () => {
      const otherTenant = await Tenant.create({
        slug: 'other-tenant',
        name: 'Other Tenant',
        email: 'other@test.com',
      });
      const otherUserId = (await User.create({
        tenantId: otherTenant._id.toString(),
        email: 'other@test.com',
        password: 'hash',
        firstName: 'Other',
        lastName: 'User',
        role: 'cashier',
      }))._id.toString();

      await expect(getUserById(otherUserId, tenantId)).rejects.toThrow('not found');
    });
  });

  describe('createUser', () => {
    it('should create a user under the tenant', async () => {
      const result = await createUser({
        tenantId,
        email: 'newguy@test.com',
        password: 'SecurePass1!',
        firstName: 'New',
        lastName: 'Guy',
        role: 'cashier',
      }, ownerUserId);

      expect(result).toMatchObject({
        email: 'newguy@test.com',
        firstName: 'New',
        lastName: 'Guy',
        role: 'cashier',
      });
      expect(result).not.toHaveProperty('password');
    });

    it('should reject duplicate email in same tenant', async () => {
      await createUser({
        tenantId,
        email: 'dupe@test.com',
        password: 'SecurePass1!',
        firstName: 'First',
        lastName: 'Dup',
        role: 'cashier',
      });

      await expect(
        createUser({
          tenantId,
          email: 'dupe@test.com',
          password: 'OtherPass1!',
          firstName: 'Second',
          lastName: 'Dup',
          role: 'cashier',
        })
      ).rejects.toThrow('already exists');
    });

    it('should reject non-existent tenant', async () => {
      const fakeTenantId = '000000000000000000000000';
      await expect(
        createUser({
          tenantId: fakeTenantId,
          email: 'notenant@test.com',
          password: 'SecurePass1!',
          firstName: 'No',
          lastName: 'Tenant',
          role: 'cashier',
        })
      ).rejects.toThrow('not found');
    });
  });

  describe('updateUser', () => {
    let cashierUserId: string;

    beforeEach(async () => {
      const cashier = await User.create({
        tenantId,
        email: 'cashier@test.com',
        password: 'hash',
        firstName: 'Cash',
        lastName: 'Ier',
        role: 'cashier',
      });
      cashierUserId = cashier._id.toString();
    });

    it('should update user fields', async () => {
      const result = await updateUser(cashierUserId, tenantId, { firstName: 'Updated' }, 'owner', ownerUserId);

      expect(result.firstName).toBe('Updated');
    });

    it('should throw forbidden when updating same or higher role', async () => {
      await expect(
        updateUser(ownerUserId, tenantId, { firstName: 'Hacker' }, 'admin', cashierUserId)
      ).rejects.toThrow('No puedes modificar');
    });
  });

  describe('deleteUser', () => {
    let cashierUserId: string;

    beforeEach(async () => {
      const cashier = await User.create({
        tenantId,
        email: 'delete-cashier@test.com',
        password: 'hash',
        firstName: 'Delete',
        lastName: 'Me',
        role: 'cashier',
      });
      cashierUserId = cashier._id.toString();
    });

    it('should delete a user', async () => {
      const result = await deleteUser(cashierUserId, tenantId, 'owner', ownerUserId);

      expect(result._id.toString()).toBe(cashierUserId);

      const found = await User.findById(cashierUserId);
      expect(found).toBeNull();
    });

    it('should throw forbidden when deleting same or higher role', async () => {
      await expect(
        deleteUser(ownerUserId, tenantId, 'admin', cashierUserId)
      ).rejects.toThrow('No puedes eliminar');
    });
  });
});
