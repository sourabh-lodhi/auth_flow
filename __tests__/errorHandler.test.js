import {
  AppError,
  globalErrorHandler,
  handleValidationError,
  handleDuplicateFieldsDB,
  handleCastErrorDB,
  catchAsync,
} from "../src/utils/errorHandler.js"; // Adjust the path as necessary

describe("Error Handling Utilities", () => {
  describe("AppError", () => {
    it("should create an instance of AppError", () => {
      const error = new AppError("Some error message", 404);

      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe("Some error message");
      expect(error.statusCode).toBe(404);
      expect(error.status).toBe("fail");
      expect(error.isOperational).toBe(true);
      expect(error.stack).toBeDefined();
    });
  });

  describe("globalErrorHandler", () => {
    let req, res, next;

    beforeEach(() => {
      req = {};
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      next = jest.fn();
    });

    it("should handle errors in development mode", () => {
      process.env.NODE_ENV = "development";
      const error = new AppError("Test error", 400);

      globalErrorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: "fail",
        error: error,
        message: "Test error",
        stack: error.stack,
      });
    });

    it("should handle operational errors in production mode", () => {
      process.env.NODE_ENV = "production";
      const error = new AppError("Test error", 400);

      globalErrorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: "fail",
        message: "Test error",
      });
    });

    it("should handle non-operational errors in production mode", () => {
      process.env.NODE_ENV = "production";
      const error = new Error("Non-operational error");

      globalErrorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "Something went wrong!",
      });
    });
  });

  describe("handleValidationError", () => {
    it("should create an AppError for validation errors", () => {
      const mockError = {
        errors: {
          field1: { message: "Field 1 is required" },
          field2: { message: "Field 2 must be a string" },
        },
      };

      const error = handleValidationError(mockError);

      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe(
        "Invalid input data: Field 1 is required. Field 2 must be a string"
      );
      expect(error.statusCode).toBe(400);
    });
  });

  describe("handleDuplicateFieldsDB", () => {
    it("should create an AppError for duplicate fields", () => {
      const mockError = {
        keyValue: { email: "test@example.com" },
      };

      const error = handleDuplicateFieldsDB(mockError);

      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe(
        "Duplicate field value: email. Please use a different value!"
      );
      expect(error.statusCode).toBe(400);
    });
  });

  describe("handleCastErrorDB", () => {
    it("should create an AppError for cast errors", () => {
      const mockError = {
        path: "userId",
        value: "invalidId",
      };

      const error = handleCastErrorDB(mockError);

      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe("Invalid userId: invalidId.");
      expect(error.statusCode).toBe(400);
    });
  });

  describe("catchAsync", () => {
    it("should catch async errors and pass them to the next middleware", async () => {
      const asyncFn = jest.fn().mockRejectedValue(new Error("Async error"));
      const next = jest.fn();

      const wrappedFn = catchAsync(asyncFn);
      await wrappedFn({}, {}, next);

      expect(next).toHaveBeenCalledWith(new Error("Async error"));
    });
  });
});
