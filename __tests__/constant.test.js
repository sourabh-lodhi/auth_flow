import { messages, appSettings } from '../src/constants/constant.js';

describe("Messages and App Settings Constants", () => {
  
  describe("Auth Messages", () => {
    it("should have a success message for login", () => {
      expect(messages.authMessages.SUCCESS.LOGIN).toBe("User logged in successfully.");
    });

    it("should have an error message for invalid credentials", () => {
      expect(messages.authMessages.ERROR.INVALID_CREDENTIALS).toBe("Invalid credentials. Please try again.");
    });

    it("should have a warning message for weak passwords", () => {
      expect(messages.authMessages.WARNING.PASSWORD_WEAK).toBe("Password is too weak. Please choose a stronger password.");
    });

    it("should have an info message for password reset link sent", () => {
      expect(messages.authMessages.INFO.PASSWORD_RESET_LINK_SENT).toBe("Password reset link sent to your email.");
    });
  });

  describe("Log Messages", () => {
    it("should format incoming request messages correctly", () => {
      const method = "GET";
      const url = "/api/user";
      expect(messages.logMessages.REQUEST.INCOMING(method, url)).toBe(`Incoming request: ${method} ${url}`);
    });

    it("should format error messages correctly", () => {
      const errorMessage = "An error occurred";
      expect(messages.logMessages.ERROR.GENERAL(errorMessage)).toBe(`Error occurred: ${errorMessage}`);
    });

    it("should have a database connection error message", () => {
      expect(messages.logMessages.ERROR.DB_CONNECTION).toBe("Database connection error.");
    });
  });

  describe("Auth Module Messages", () => {
    it("should have a validation error message for signup", () => {
      expect(messages.auth.signup.validationError).toBe("Invalid input data.");
    });

    it("should have an error message for invalid credentials during login", () => {
      expect(messages.auth.login.invalidCredentials).toBe("Invalid email or password.");
    });

    it("should have a success message for password update", () => {
      expect(messages.auth.resetPassword.passwordUpdated).toBe("Password has been updated successfully!");
    });

    it("should have an access denial message for roles", () => {
      expect(messages.auth.role.access).toBe("Access denied. You do not have the required role.");
    });
  });

  describe("General and User Module Messages", () => {
    it("should have an internal server error message", () => {
      expect(messages.general.internalServerError).toBe("Something went wrong. Please try again later.");
    });

    it("should have a validation message for required name field", () => {
      expect(messages.user.validation.nameRequired).toBe("Name is required.");
    });

    it("should have a unique constraint message for email", () => {
      expect(messages.user.unique.emailInUse).toBe("Email is already in use.");
    });
  });

  describe("App Settings", () => {
    it("should have a standard tier setting", () => {
      expect(appSettings.tier.standard).toBe("standard");
    });

    it("should have a user role setting", () => {
      expect(appSettings.role.user).toBe("user");
    });

    it("should have a production environment setting", () => {
      expect(appSettings.environment.production).toBe("production");
    });
  });
});
