import { AppError, handleValidationError, handleDuplicateFieldsDB } from "../utils/errorHandler.js";
import { AuthHelper } from "../helpers/helper.js";
import { EmailService } from "./emailService.js";
import { messages } from "../constants/constant.js";
import { UserRepository } from "../repositories/authRepository.js";

export class AuthService {
  constructor() {
    this.userRepo = new UserRepository();
    this.authHelper = new AuthHelper();
    this.emailService = new EmailService();
  }

  async signupService(userData) {
    try {
      const user = await this.userRepo.createUser(userData);
      return { success: true, statusCode: 201, data: user };
    } catch (error) {
      if (error.name === "ValidationError") {
        throw handleValidationError(error);
      }
      if (error.code === 11000) {
        throw handleDuplicateFieldsDB(error);
      }
      throw new AppError(messages.auth.signup.signupFailed, 500);
    }
  }

  async loginService(credentials) {
    try {
      const { email, password } = credentials;
      const user = await this.userRepo.findUserByEmail(email);
      if (!user || !(await user.matchPassword(password))) {
        throw new AppError(messages.auth.login.invalidCredentials, 401);
      }

      const authKey = this.authHelper.generateRandomString();
      const token = this.authHelper.generateToken({
        id: user._id,
        email: user.email,
        role: user.role,
        authKey,
      });

      await this.userRepo.updateAuthKey(user._id, authKey);

      return {
        success: true,
        statusCode: 200,
        data: { id: user._id, email: user.email },
        token,
      };
    } catch (error) {
      throw new AppError(error, 500);
    }
  }

  async forgotPassword(email, req) {
    const user = await this.userRepo.findUserByEmail(email);
    if (!user) throw new AppError(messages.auth.forgotPassword.noUser, 404);

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `${req.protocol}://${req.get("host")}/api/v1/auth/resetPassword/${resetToken}`;
    try {
      await this.emailService.sendResetPasswordEmail(user.email, resetURL);
      return { success: true, statusCode: 200, message: messages.auth.forgotPassword.emailSent };
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });
      throw new AppError(messages.auth.forgotPassword.emailSendError, 500);
    }
  }

  async resetPassword(token, password) {
    const user = await this.userRepo.findUserByResetToken(token);
    if (!user) throw new AppError(messages.auth.resetPassword.tokenInvalidOrExpired, 400);

    await this.userRepo.updateUserPassword(user, password);
    return { success: true, statusCode: 200, message: messages.auth.resetPassword.passwordUpdated };
  }

  async logout(id) {
    const user = await this.userRepo.findUserById(id);
    await this.userRepo.updateUserAuthKey(user);
    return { success: true, statusCode: 200, message: messages.auth.login.logout };
  }
}
