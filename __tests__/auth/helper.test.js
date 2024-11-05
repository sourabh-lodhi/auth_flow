import jwt from 'jsonwebtoken';
import { AuthHelper } from '../../src/helpers/helper.js';

import { AppError } from '../../src/utils/errorHandler.js';
import { User } from '../../src/models/userModel.js';
import { messages } from '../../src/constants/constant.js';

jest.mock('jsonwebtoken');
jest.mock('../../src/models/userModel.js');

describe('AuthHelper', () => {
  let authHelper;

  beforeEach(() => {
    authHelper = new AuthHelper('testsecret', '1d');
  });

  describe('generateToken', () => {
    it('should generate a token with the correct payload and options', () => {
      const user = { _id: '123', email: 'test@example.com', role: 'user', authKey: 'authKey123' };
      jwt.sign.mockReturnValue('mockToken');

      const token = authHelper.generateToken(user);

      expect(jwt.sign).toHaveBeenCalledWith(
        {
          id: user._id,
          email: user.email,
          role: user.role,
          authKey: user.authKey,
        },
        'testsecret',
        { expiresIn: '1d' }
      );
      expect(token).toBe('mockToken');
    });
  });

  describe('jwtVerifyToken', () => {
    let req, res, next;

    beforeEach(() => {
      req = { headers: {} };
      res = {};
      next = jest.fn();
    });

    it('should call next with an error if no token is provided', async () => {
      req.headers.authorization = '';

      await authHelper.jwtVerifyToken(req, res, next);

      expect(next).toHaveBeenCalledWith(new AppError(messages.auth.login.notLogin, 401));
    });

    it('should call next with an error if token verification fails', async () => {
      req.headers.authorization = 'Bearer invalidtoken';
      jwt.verify.mockImplementation(() => {
        throw new Error('Token verification failed');
      });

      await authHelper.jwtVerifyToken(req, res, next);

      expect(next).toHaveBeenCalledWith(new AppError(messages.auth.login.loginFailed, 401));
    });

    it('should call next with an error if user does not exist', async () => {
      req.headers.authorization = 'Bearer validtoken';
      jwt.verify.mockReturnValue({ id: '123', authKey: 'authKey123' });
      User.findOne.mockResolvedValue(null);

      await authHelper.jwtVerifyToken(req, res, next);

      expect(next).toHaveBeenCalledWith(new AppError(messages.auth.login.noLongerExists, 401));
    });

    it('should set req.user and call next if token and user are valid', async () => {
      req.headers.authorization = 'Bearer validtoken';
      jwt.verify.mockReturnValue({ id: '123', authKey: 'authKey123' });
      const mockUser = { id: '123', authKey: 'authKey123', role: 'user' };
      User.findOne.mockResolvedValue(mockUser);

      await authHelper.jwtVerifyToken(req, res, next);

      expect(req.user).toBe(mockUser);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('roleMiddleware', () => {
    it('should return 403 if user role is not authorized', () => {
      const req = { user: { role: 'user' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      const middleware = authHelper.roleMiddleware('admin');
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: messages.auth.role.access,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next if user role is authorized', () => {
      const req = { user: { role: 'admin' } };
      const res = {};
      const next = jest.fn();

      const middleware = authHelper.roleMiddleware('admin');
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('generateRandomString', () => {
    it('should generate a random string of the specified length', () => {
      const randomString = authHelper.generateRandomString(10);
      expect(randomString).toHaveLength(10);
    });

    it('should generate a random string of the default length if no length is provided', () => {
      const randomString = authHelper.generateRandomString();
      expect(randomString).toHaveLength(9);
    });
  });
});
