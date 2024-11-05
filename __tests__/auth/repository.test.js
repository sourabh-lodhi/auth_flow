import { UserRepository } from '../../src/repositories/authRepository';
import { User } from '../../src/models';
import crypto from 'crypto';

jest.mock('../../src/models');
jest.mock('crypto');

describe('UserRepository', () => {
  let userRepository;

  beforeEach(() => {
    userRepository = new UserRepository();
  });

  describe('createUser', () => {
    it('should create a new user with provided data', async () => {
      const userData = { email: 'test@example.com', password: 'password123' };
      const createdUser = { id: '123', ...userData };
      User.create.mockResolvedValue(createdUser);

      const result = await userRepository.createUser(userData);
      expect(User.create).toHaveBeenCalledWith(userData);
      expect(result).toEqual(createdUser);
    });
  });

  describe('findUserByEmail', () => {
    it('should find a user by email', async () => {
      const email = 'test@example.com';
      const user = { id: '123', email };
      User.findOne.mockResolvedValue(user);

      const result = await userRepository.findUserByEmail(email);
      expect(User.findOne).toHaveBeenCalledWith({ email });
      expect(result).toEqual(user);
    });
  });

  describe('updateAuthKey', () => {
    it('should update the auth key of a user by user ID', async () => {
      const userId = '123';
      const authKey = 'newAuthKey';
      const updatedUser = { id: userId, authkey: authKey };
      User.findByIdAndUpdate.mockResolvedValue(updatedUser);

      const result = await userRepository.updateAuthKey(userId, authKey);
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        { authkey: authKey },
        { new: true }
      );
      expect(result).toEqual(updatedUser);
    });
  });

  describe('updateUserAuthKey', () => {
    it('should set the auth key to null and save the user', async () => {
      const user = { authkey: 'oldAuthKey', save: jest.fn().mockResolvedValue(true) };
      
      await userRepository.updateUserAuthKey(user);
      expect(user.authkey).toBeNull();
      expect(user.save).toHaveBeenCalled();
    });
  });

  describe('findUserById', () => {
    it('should find a user by ID', async () => {
      const userId = '123';
      const user = { id: userId, email: 'test@example.com' };
      User.findById.mockResolvedValue(user);

      const result = await userRepository.findUserById(userId);
      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(user);
    });
  });

  describe('updateUserPassword', () => {
    it('should update the user password and reset password fields', async () => {
      const user = {
        password: 'oldPassword',
        resetPasswordToken: 'someToken',
        resetPasswordExpires: Date.now() + 3600000,
        save: jest.fn().mockResolvedValue(true),
      };
      const newPassword = 'newPassword123';

      await userRepository.updateUserPassword(user, newPassword);
      expect(user.password).toBe(newPassword);
      expect(user.resetPasswordToken).toBeUndefined();
      expect(user.resetPasswordExpires).toBeUndefined();
      expect(user.save).toHaveBeenCalled();
    });
  });

  describe('findUserByResetToken', () => {
    it('should find a user by reset token if it is still valid', async () => {
      const token = 'resetToken';
      const hashedToken = 'hashedToken';
      const user = { id: '123', resetPasswordToken: hashedToken };
      
      crypto.createHash.mockReturnValue({ update: jest.fn().mockReturnThis(), digest: jest.fn().mockReturnValue(hashedToken) });
      User.findOne.mockResolvedValue(user);

      const result = await userRepository.findUserByResetToken(token);
      expect(crypto.createHash).toHaveBeenCalledWith('sha256');
      expect(User.findOne).toHaveBeenCalledWith({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: expect.any(Number) },
      });
      expect(result).toEqual(user);
    });
  });
});
