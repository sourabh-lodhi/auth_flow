import { AuthController } from '../../src/controllers/index.js';
import { catchAsync } from '../../src/utils/errorHandler.js'; // Adjust the path as necessary

describe('AuthController', () => {
  let authController;
  let req;
  let res;
  let next;
  let authServiceMock;
  let responseHandlerMock;

  beforeEach(() => {
    // Mocking the service and response handler
    authServiceMock = {
      signupService: jest.fn(),
      loginService: jest.fn(),
      forgotPassword: jest.fn(),
      resetPassword: jest.fn(),
      logout: jest.fn(),
    };

    responseHandlerMock = {
      handleServiceResponse: jest.fn(),
    };

    // Initializing the AuthController
    authController = new AuthController({
      bAuthService: authServiceMock,
      responseHandler: responseHandlerMock,
    });

    // Mocking request, response, and next function
    req = { body: {}, params: {}, user: { id: 'userId' } };
    res = {};
    next = jest.fn();
  });

  describe('signup', () => {
    it('should call signupService and handleServiceResponse', async () => {
      const returnData = { success: true };
      authServiceMock.signupService.mockResolvedValue(returnData);

      req.body = { email: 'test@example.com', password: 'password' };

      await authController.signup(req, res, next);

      expect(authServiceMock.signupService).toHaveBeenCalledWith(req.body);
      expect(responseHandlerMock.handleServiceResponse).toHaveBeenCalledWith(req, res, returnData);
    });
  });

  describe('login', () => {
    it('should call loginService and handleServiceResponse', async () => {
      const returnData = { success: true };
      authServiceMock.loginService.mockResolvedValue(returnData);

      req.body = { email: 'test@example.com', password: 'password' };

      await authController.login(req, res, next);

      expect(authServiceMock.loginService).toHaveBeenCalledWith(req.body);
      expect(responseHandlerMock.handleServiceResponse).toHaveBeenCalledWith(req, res, returnData);
    });
  });

  describe('forgotPassword', () => {
    it('should call forgotPassword and handleServiceResponse', async () => {
      const returnData = { success: true };
      authServiceMock.forgotPassword.mockResolvedValue(returnData);

      req.body = { email: 'test@example.com' };

      await authController.forgotPassword(req, res, next);

      expect(authServiceMock.forgotPassword).toHaveBeenCalledWith(req.body.email, req);
      expect(responseHandlerMock.handleServiceResponse).toHaveBeenCalledWith(req, res, returnData);
    });
  });

  describe('resetPassword', () => {
    it('should call resetPassword and handleServiceResponse', async () => {
      const returnData = { success: true };
      authServiceMock.resetPassword.mockResolvedValue(returnData);

      req.body = { password: 'newPassword' };
      req.params.token = 'token123';

      await authController.resetPassword(req, res, next);

      expect(authServiceMock.resetPassword).toHaveBeenCalledWith(req.params.token, req.body.password);
      expect(responseHandlerMock.handleServiceResponse).toHaveBeenCalledWith(req, res, returnData);
    });
  });

  describe('logout', () => {
    it('should call logout and handleServiceResponse', async () => {
      const returnData = { success: true };
      authServiceMock.logout.mockResolvedValue(returnData);

      await authController.logout(req, res, next);

      expect(authServiceMock.logout).toHaveBeenCalledWith(req.user.id);
      expect(responseHandlerMock.handleServiceResponse).toHaveBeenCalledWith(req, res, returnData);
    });
  });
});
