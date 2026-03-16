import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller.js';
import { AuthService, TokenUser } from './auth.service.js';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: {
    requestOtp: jest.Mock;
    verifyOtp: jest.Mock;
    register: jest.Mock;
    login: jest.Mock;
    forgotPassword: jest.Mock;
    resetPassword: jest.Mock;
    findOrCreateOAuthUser: jest.Mock;
    generateTokenPair: jest.Mock;
    validateRefreshToken: jest.Mock;
    revokeRefreshToken: jest.Mock;
    deleteRefreshToken: jest.Mock;
  };
  let configService: { get: jest.Mock };

  beforeEach(async () => {
    authService = {
      requestOtp: jest.fn().mockResolvedValue({
        message: 'If this email is valid, you will receive an OTP code.',
      }),

      // FIXED: verifyOtp giờ trả message (không còn tokens + cookie)
      verifyOtp: jest.fn().mockResolvedValue({
        message: 'Email đã được xác thực. Bạn có thể đăng nhập.',
      }),

      // THÊM MỚI:
      register: jest.fn().mockResolvedValue({
        message: 'Đăng ký thành công. Vui lòng kiểm tra email để xác thực.',
      }),
      login: jest.fn().mockResolvedValue({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        user: { id: 'user-1', email: 'test@example.com', role: 'USER', displayName: 'Test', isNewUser: false },
      }),
      forgotPassword: jest.fn().mockResolvedValue({ message: 'Nếu email tồn tại, mã OTP đã được gửi.' }),
      resetPassword: jest.fn().mockResolvedValue({ message: 'Mật khẩu đã được thay đổi thành công.' }),

      // Giữ nguyên:
      findOrCreateOAuthUser: jest.fn().mockResolvedValue({ id: 'user-1', email: 'oauth@example.com', role: 'USER', isNewUser: false }),
      generateTokenPair: jest.fn().mockResolvedValue({ accessToken: 'oauth-access-token', refreshToken: 'oauth-refresh-token' }),
      validateRefreshToken: jest.fn().mockResolvedValue({ id: 'user-1', email: 'test@example.com', role: 'USER' } satisfies TokenUser),
      revokeRefreshToken: jest.fn().mockResolvedValue(undefined),
      deleteRefreshToken: jest.fn().mockResolvedValue(undefined),
    };

    configService = {
      get: jest.fn().mockReturnValue('development'),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('POST /auth/otp/request', () => {
    it('should call authService.requestOtp with email from DTO', async () => {
      const dto = { email: 'test@example.com' };
      await controller.requestOtp(dto);

      expect(authService.requestOtp).toHaveBeenCalledWith('test@example.com');
    });

    it('should return message from authService', async () => {
      const result = await controller.requestOtp({
        email: 'test@example.com',
      });

      expect(result).toEqual({
        message: 'If this email is valid, you will receive an OTP code.',
      });
    });
  });

  describe('POST /auth/otp/verify', () => {
    it('should call authService.verifyOtp with email and code', async () => {
      const dto = { email: 'test@example.com', code: '123456' };
      await controller.verifyOtp(dto);
      expect(authService.verifyOtp).toHaveBeenCalledWith('test@example.com', '123456');
    });

    it('should return message from authService', async () => {
      const result = await controller.verifyOtp({ email: 'test@example.com', code: '123456' });
      expect(result).toEqual({ message: 'Email đã được xác thực. Bạn có thể đăng nhập.' });
    });
  });

  // ─── POST /auth/register ──────────────────────────────────────────────────

  describe('POST /auth/register', () => {
    it('should call authService.register with DTO', async () => {
      const dto = { email: 'new@example.com', displayName: 'Leminho', password: 'Pass123!' };
      await controller.register(dto);
      expect(authService.register).toHaveBeenCalledWith(dto);
    });

    it('should return message from authService', async () => {
      const result = await controller.register({
        email: 'new@example.com', displayName: 'Leminho', password: 'Pass123!',
      });
      expect(result).toEqual({ message: expect.stringContaining('Đăng ký thành công') });
    });
  });

  // ─── POST /auth/login ─────────────────────────────────────────────────────

  describe('POST /auth/login', () => {
    let mockRes: { cookie: jest.Mock };
    beforeEach(() => { mockRes = { cookie: jest.fn() }; });

    it('should call authService.login with DTO', async () => {
      const dto = { email: 'test@example.com', password: 'Pass123!' };
      await controller.login(dto, mockRes as any);
      expect(authService.login).toHaveBeenCalledWith(dto);
    });

    it('should set refreshToken as HttpOnly cookie', async () => {
      await controller.login({ email: 'test@example.com', password: 'x' }, mockRes as any);
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'refreshToken', 'mock-refresh-token',
        expect.objectContaining({ httpOnly: true, sameSite: 'strict', path: '/api/v1/auth' }),
      );
    });

    it('should return accessToken and user in body — NOT refreshToken', async () => {
      const result = await controller.login({ email: 'test@example.com', password: 'x' }, mockRes as any);
      expect(result).toEqual({
        accessToken: 'mock-access-token',
        user: { id: 'user-1', email: 'test@example.com', role: 'USER', displayName: 'Test', isNewUser: false },
      });
      expect(result).not.toHaveProperty('refreshToken');
    });
  });

  // ─── POST /auth/forgot-password ───────────────────────────────────────────

  describe('POST /auth/forgot-password', () => {
    it('should call authService.forgotPassword with email', async () => {
      await controller.forgotPassword({ email: 'test@example.com' });
      expect(authService.forgotPassword).toHaveBeenCalledWith('test@example.com');
    });

    it('should return message from authService', async () => {
      const result = await controller.forgotPassword({ email: 'test@example.com' });
      expect(result).toEqual({ message: 'Nếu email tồn tại, mã OTP đã được gửi.' });
    });
  });

  // ─── POST /auth/reset-password ────────────────────────────────────────────

  describe('POST /auth/reset-password', () => {
    it('should call authService.resetPassword with full DTO', async () => {
      const dto = { email: 'test@example.com', code: '123456', newPassword: 'NewPass123!' };
      await controller.resetPassword(dto);
      expect(authService.resetPassword).toHaveBeenCalledWith(dto);
    });

    it('should return message from authService', async () => {
      const result = await controller.resetPassword({
        email: 'test@example.com', code: '123456', newPassword: 'NewPass123!',
      });
      expect(result).toEqual({ message: 'Mật khẩu đã được thay đổi thành công.' });
    });
  });

  // ─── Google OAuth Callback ──────────────────────────────────────────────

  describe('GET /auth/google/callback', () => {
    let mockReq: { user: any };
    let mockRes: { cookie: jest.Mock; redirect: jest.Mock };

    beforeEach(() => {
      mockReq = {
        user: {
          provider: 'google',
          providerId: 'google-123',
          email: 'oauth@example.com',
          displayName: 'OAuth User',
          avatarUrl: 'https://example.com/avatar.jpg',
        },
      };
      mockRes = {
        cookie: jest.fn(),
        redirect: jest.fn(),
      };
    });

    it('should call findOrCreateOAuthUser with req.user profile', async () => {
      await controller.googleCallback(mockReq as any, mockRes as any);

      expect(authService.findOrCreateOAuthUser).toHaveBeenCalledWith(
        mockReq.user,
      );
    });

    it('should call generateTokenPair with the returned user', async () => {
      await controller.googleCallback(mockReq as any, mockRes as any);

      expect(authService.generateTokenPair).toHaveBeenCalledWith({
        id: 'user-1',
        email: 'oauth@example.com',
        role: 'USER',
        isNewUser: false,
      });
    });

    it('should set refreshToken as HttpOnly cookie', async () => {
      await controller.googleCallback(mockReq as any, mockRes as any);

      expect(mockRes.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'oauth-refresh-token',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'strict',
          path: '/api/v1/auth',
        }),
      );
    });

    it('should redirect to frontend with accessToken and isNewUser', async () => {
      configService.get.mockReturnValue('http://localhost:5174');

      await controller.googleCallback(mockReq as any, mockRes as any);

      expect(mockRes.redirect).toHaveBeenCalledWith(
        'http://localhost:5174/auth/callback?token=oauth-access-token&isNewUser=false',
      );
    });

    it('should set isNewUser=true in redirect URL for new users', async () => {
      authService.findOrCreateOAuthUser.mockResolvedValueOnce({
        id: 'new-user',
        email: 'new@example.com',
        role: 'USER',
        isNewUser: true,
      });
      configService.get.mockReturnValue('http://localhost:5174');

      await controller.googleCallback(mockReq as any, mockRes as any);

      expect(mockRes.redirect).toHaveBeenCalledWith(
        expect.stringContaining('isNewUser=true'),
      );
    });
  });

  // ─── GitHub OAuth Callback ──────────────────────────────────────────────

  describe('GET /auth/github/callback', () => {
    let mockReq: { user: any };
    let mockRes: { cookie: jest.Mock; redirect: jest.Mock };

    beforeEach(() => {
      mockReq = {
        user: {
          provider: 'github',
          providerId: 'github-789',
          email: 'ghuser@example.com',
          displayName: 'GitHub User',
          avatarUrl: 'https://avatars.githubusercontent.com/u/123',
        },
      };
      mockRes = {
        cookie: jest.fn(),
        redirect: jest.fn(),
      };
    });

    it('should call findOrCreateOAuthUser with GitHub profile', async () => {
      await controller.githubCallback(mockReq as any, mockRes as any);

      expect(authService.findOrCreateOAuthUser).toHaveBeenCalledWith(
        mockReq.user,
      );
    });

    it('should set refreshToken cookie and redirect', async () => {
      configService.get.mockReturnValue('http://localhost:5174');

      await controller.githubCallback(mockReq as any, mockRes as any);

      expect(mockRes.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'oauth-refresh-token',
        expect.objectContaining({ httpOnly: true }),
      );
      expect(mockRes.redirect).toHaveBeenCalledWith(
        'http://localhost:5174/auth/callback?token=oauth-access-token&isNewUser=false',
      );
    });
  });

  // ─── POST /auth/refresh ────────────────────────────────────────────────────

  describe('POST /auth/refresh', () => {
    let mockReq: { cookies: Record<string, string> };
    let mockRes: { cookie: jest.Mock };

    beforeEach(() => {
      mockReq = { cookies: { refreshToken: 'valid-refresh-token' } };
      mockRes = { cookie: jest.fn() };
    });

    it('should return new accessToken when refresh token is valid', async () => {
      authService.generateTokenPair.mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });

      const result = await controller.refresh(mockReq as any, mockRes as any);

      expect(authService.validateRefreshToken).toHaveBeenCalledWith('valid-refresh-token');
      expect(authService.deleteRefreshToken).toHaveBeenCalledWith('valid-refresh-token');
      expect(authService.generateTokenPair).toHaveBeenCalled();
      expect(result).toEqual({ accessToken: 'new-access-token' });
    });

    it('should set new refreshToken cookie', async () => {
      authService.generateTokenPair.mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });

      await controller.refresh(mockReq as any, mockRes as any);

      expect(mockRes.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'new-refresh-token',
        expect.objectContaining({ httpOnly: true }),
      );
    });

    it('should throw UnauthorizedException when no refresh token in cookie', async () => {
      mockReq.cookies = {};

      await expect(
        controller.refresh(mockReq as any, mockRes as any),
      ).rejects.toThrow(UnauthorizedException);

      expect(authService.validateRefreshToken).not.toHaveBeenCalled();
    });

    it('should throw when validateRefreshToken rejects', async () => {
      authService.validateRefreshToken.mockRejectedValue(
        new UnauthorizedException('Refresh token has been revoked'),
      );

      await expect(
        controller.refresh(mockReq as any, mockRes as any),
      ).rejects.toThrow('Refresh token has been revoked');
    });
  });

  // ─── POST /auth/logout ─────────────────────────────────────────────────────

  describe('POST /auth/logout', () => {
    let mockReq: { cookies: Record<string, string> };
    let mockRes: { cookie: jest.Mock };

    beforeEach(() => {
      mockReq = { cookies: { refreshToken: 'valid-refresh-token' } };
      mockRes = { cookie: jest.fn() };
    });

    it('should revoke refresh token and clear cookie', async () => {
      const result = await controller.logout(mockReq as any, mockRes as any);

      expect(authService.revokeRefreshToken).toHaveBeenCalledWith('valid-refresh-token');
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'refreshToken',
        '',
        expect.objectContaining({ maxAge: 0 }),
      );
      expect(result).toEqual({ message: 'Logged out successfully' });
    });

    it('should still clear cookie even if no refresh token in cookie', async () => {
      mockReq.cookies = {};

      const result = await controller.logout(mockReq as any, mockRes as any);

      expect(authService.revokeRefreshToken).not.toHaveBeenCalled();
      expect(mockRes.cookie).toHaveBeenCalledWith('refreshToken', '', expect.anything());
      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });

  // ─── GET /auth/me ──────────────────────────────────────────────────────────

  describe('GET /auth/me', () => {
    it('should return req.user from JWT payload', () => {
      const mockUser = { id: 'user-1', email: 'me@example.com', role: 'USER' };
      const mockReq = { user: mockUser };

      const result = controller.getMe(mockReq as any);

      expect(result).toEqual(mockUser);
    });
  });
});
