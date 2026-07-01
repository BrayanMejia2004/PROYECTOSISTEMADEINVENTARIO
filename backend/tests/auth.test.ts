import 'jest';
import { registerTenant, login, refreshTokens, logout, getProfile } from '../src/modules/auth/auth.service';
import User from '../src/shared/models/user/user.model';

const testTenant = {
  tenantName: 'Test Store',
  tenantSlug: 'test-store',
  email: 'owner@test.com',
  password: 'Password123!',
  firstName: 'John',
  lastName: 'Doe',
};

describe('Auth Service', () => {
  describe('registerTenant', () => {
    it('should reject duplicate tenant slug', async () => {
      await registerTenant({
        ...testTenant,
        tenantSlug: 'dup-slug',
        email: 'first@test.com',
      });

      await expect(
        registerTenant({
          ...testTenant,
          tenantSlug: 'dup-slug',
          email: 'second@test.com',
        })
      ).rejects.toThrow('ya existe');
    });

    it('should register a new tenant and create owner user', async () => {
      const result = await registerTenant({
        ...testTenant,
        tenantSlug: 'register-success',
        email: 'register-success@test.com',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user).toMatchObject({
        email: 'register-success@test.com',
        firstName: testTenant.firstName,
        lastName: testTenant.lastName,
        role: 'owner',
      });
      expect(result.tenant).toMatchObject({
        name: testTenant.tenantName,
        slug: 'register-success',
      });
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      await registerTenant({
        ...testTenant,
        tenantSlug: 'login-test',
        email: 'login@test.com',
      });
    });

    it('should login with valid credentials', async () => {
      const result = await login({
        email: 'login@test.com',
        password: testTenant.password,
        tenantSlug: 'login-test',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe('login@test.com');
      expect(result.tenant.slug).toBe('login-test');
    });

    it('should reject invalid password', async () => {
      await expect(
        login({
          email: 'login@test.com',
          password: 'wrongpassword',
          tenantSlug: 'login-test',
        })
      ).rejects.toThrow('Credenciales inválidas');
    });

    it('should reject non-existent tenant slug', async () => {
      await expect(
        login({
          email: 'login@test.com',
          password: testTenant.password,
          tenantSlug: 'non-existent',
        })
      ).rejects.toThrow('Credenciales inválidas');
    });

    it('should lock account after 5 failed attempts', async () => {
      for (let i = 0; i < 5; i++) {
        await expect(
          login({
            email: 'login@test.com',
            password: 'wrong',
            tenantSlug: 'login-test',
          })
        ).rejects.toThrow();
      }

      await expect(
        login({
          email: 'login@test.com',
          password: testTenant.password,
          tenantSlug: 'login-test',
        })
      ).rejects.toThrow('bloqueada');
    });
  });

  describe('refreshTokens', () => {
    let refreshToken: string;

    beforeEach(async () => {
      const result = await registerTenant({
        ...testTenant,
        tenantSlug: 'refresh-test',
        email: 'refresh@test.com',
      });
      refreshToken = result.refreshToken;
    });

    it('should return new access token with valid refresh token', async () => {
      const result = await refreshTokens(refreshToken);

      expect(result).toHaveProperty('accessToken');
      expect(typeof result.accessToken).toBe('string');
    });

    it('should reject invalid refresh token', async () => {
      await expect(refreshTokens('invalid-token-here')).rejects.toThrow('Sesión inválida');
    });
  });

  describe('logout', () => {
    it('should increment tokenVersion on logout', async () => {
      const { refreshToken, user } = await registerTenant({
        ...testTenant,
        tenantSlug: 'logout-test',
        email: 'logout@test.com',
      });

      await logout(refreshToken);

      const updatedUser = await User.findById(user._id);
      expect(updatedUser).toBeDefined();
      expect(updatedUser!.tokenVersion).toBe(1);
    });
  });

  describe('getProfile', () => {
    let userId: string;
    let tenantId: string;

    beforeEach(async () => {
      const result = await registerTenant({
        ...testTenant,
        tenantSlug: 'profile-test',
        email: 'profile@test.com',
      });
      userId = result.user._id;
      tenantId = result.tenant._id;
    });

    it('should return user and tenant for valid ids', async () => {
      const result = await getProfile(userId, tenantId);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('tenant');
      expect(result.user.email).toBe('profile@test.com');
    });

    it('should throw not found for invalid user id', async () => {
      const fakeId = '000000000000000000000000';
      await expect(getProfile(fakeId, tenantId)).rejects.toThrow('no encontrado');
    });
  });
});
