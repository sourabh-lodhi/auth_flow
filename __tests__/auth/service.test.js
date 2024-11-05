import { AuthService } from '../../src/services/authService';
import { AppError, handleValidationError, handleDuplicateFieldsDB } from '../../src/utils/errorHandler';
import { UserRepository } from '../../src/repositories/authRepository';
import { AuthHelper } from '../../src/helpers/helper';
import { EmailService } from '../../src/services/emailService';
import { messages } from '../../src/constants/constant';

jest.mock('../../src/repositories/authRepository');
jest.mock('../../src/helpers/helper');
jest.mock('../../src/services/emailService');

describe('AuthService', () => {
  let authService;

  beforeEach(() => {
    authService = new AuthService();
  });

  describe('signupService', () => {
    it('should create a user and return success response', async () => {
      const userData = { email: 'test@example.com', password: 'password123' };
      const user = { id: '123', email: 'test@example.com' };
      UserRepository.prototype.createUser.mockResolvedValue(user);

      const result = await authService.signupService(userData);
      expect(result).toEqual({ success: true, statusCode: 201, data: user });
    });

    it('should throw validation error if user data is invalid', async () => {
      const error = new Error();
      error.name = 'ValidationError';
      UserRepository.prototype.createUser.mockRejectedValue(error);

      await expect(authService.signupService({})).rejects.toThrow(AppError);
    });

    it('should throw duplicate field error if email already exists', async () => {
      const error = new Error();
      error.code = 11000;
      UserRepository.prototype.createUser.mockRejectedValue(error);

      await expect(authService.signupService({ email: 'duplicate@example.com' })).rejects.toThrow(AppError);
    });
  });

  describe('loginService', () => {
    it('should authenticate user and return token', async () => {
      const credentials = { email: 'test@example.com', password: 'password123' };
      const user = {
        _id: '123',
        email: 'test@example.com',
        role: 'user',
        matchPassword: jest.fn().mockResolvedValue(true),
      };
      UserRepository.prototype.findUserByEmail.mockResolvedValue(user);
      AuthHelper.prototype.generateToken.mockReturnValue('test-token');
      AuthHelper.prototype.generateRandomString.mockReturnValue('random-key');

      const result = await authService.loginService(credentials);
      expect(result.success).toBe(true);
      expect(result.token).toBe('test-token');
    });

    it('should throw error if credentials are invalid', async () => {
      const credentials = { email: 'test@example.com', password: 'wrongpassword' };
      const user = { _id: '123', email: 'test@example.com', matchPassword: jest.fn().mockResolvedValue(false) };
      UserRepository.prototype.findUserByEmail.mockResolvedValue(user);

      await expect(authService.loginService(credentials)).rejects.toThrow(AppError);
    });
  });

  describe('forgotPassword', () => {
    it('should send reset email if user exists', async () => {
      const email = 'test@example.com';
      const user = {
        email,
        createPasswordResetToken: jest.fn().mockReturnValue('reset-token'),
        save: jest.fn(),
      };
      UserRepository.prototype.findUserByEmail.mockResolvedValue(user);
      EmailService.prototype.sendResetPasswordEmail.mockResolvedValue(true);

      const req = { protocol: 'http', get: jest.fn().mockReturnValue('localhost:3000') };
      const result = await authService.forgotPassword(email, req);
      expect(result.message).toBe(messages.auth.forgotPassword.emailSent);
    });

    it('should throw error if user is not found', async () => {
      const email = 'notfound@example.com';
      UserRepository.prototype.findUserByEmail.mockResolvedValue(null);

      await expect(authService.forgotPassword(email, {})).rejects.toThrow(AppError);
    });
  });

  describe('resetPassword', () => {
    it('should reset password if token is valid', async () => {
      const token = 'reset-token';
      const password = 'newpassword123';
      const user = { _id: '123' };
      UserRepository.prototype.findUserByResetToken.mockResolvedValue(user);
      UserRepository.prototype.updateUserPassword.mockResolvedValue(true);

      const result = await authService.resetPassword(token, password);
      expect(result.message).toBe(messages.auth.resetPassword.passwordUpdated);
    });

    it('should throw error if token is invalid', async () => {
      UserRepository.prototype.findUserByResetToken.mockResolvedValue(null);

      await expect(authService.resetPassword('invalid-token', 'newpassword')).rejects.toThrow(AppError);
    });
  });

  describe('logout', () => {
    it('should log out user by clearing auth key', async () => {
      const userId = '123';
      const user = { _id: userId };
      UserRepository.prototype.findUserById.mockResolvedValue(user);
      UserRepository.prototype.updateUserAuthKey.mockResolvedValue(true);

      const result = await authService.logout(userId);
      expect(result.message).toBe(messages.auth.login.logout);
    });
  });
});
