import * as dotenv from "dotenv"
import mongoose from 'mongoose';
import { User } from '../../src/models';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { messages, appSettings } from '../../src/constants/constant.js';

dotenv.config()

console.log("test cases",process.env.TEST_DB_URI)

describe('User Model', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.TEST_DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  });

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  it('should save a user with valid data', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      phoneNumber: 1234567890,
      password: 'password123',
      role: appSettings.role.user,
    };

    const user = await User.create(userData);

    expect(user.name).toBe(userData.name);
    expect(user.email).toBe(userData.email);
    expect(user.phoneNumber).toBe(userData.phoneNumber);
    expect(user.role).toBe(userData.role);
    expect(user.flightHours).toBe(0); // default value
    expect(user.rewardsPoints).toBe(0); // default value
  });

  it('should hash the password before saving', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      phoneNumber: 1234567890,
      password: 'password123',
    };

    const user = await User.create(userData);
    expect(user.password).not.toBe(userData.password);
    const isMatch = await bcrypt.compare(userData.password, user.password);
    expect(isMatch).toBe(true);
  });

  it('should not hash the password again if it is not modified', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      phoneNumber: 1234567890,
      password: 'password123',
    };

    const user = await User.create(userData);
    const originalPasswordHash = user.password;
    user.name = 'Updated Name';
    await user.save();

    expect(user.password).toBe(originalPasswordHash);
  });

  it('should compare passwords correctly with matchPassword method', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      phoneNumber: 1234567890,
      password: 'password123',
    };

    const user = await User.create(userData);
    const isMatch = await user.matchPassword('password123');
    expect(isMatch).toBe(true);
  });

  it('should generate a reset password token', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      phoneNumber: 1234567890,
      password: 'password123',
    };

    const user = await User.create(userData);
    const resetToken = user.createPasswordResetToken();
    expect(resetToken).toBeDefined();
    expect(user.resetPasswordToken).toBe(crypto.createHash('sha256').update(resetToken).digest('hex'));
    expect(user.resetPasswordExpires).toBeGreaterThan(Date.now());
  });

  it('should throw validation error if required fields are missing', async () => {
    const userData = { email: 'test@example.com' };

    try {
      await User.create(userData);
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.errors.name.message).toBe(messages.user.validation.nameRequired);
      expect(error.errors.password.message).toBe(messages.user.validation.passwordRequired);
      expect(error.errors.phoneNumber.message).toBe(messages.user.validation.phoneNumberRequired);
    }
  });

  it('should enforce unique email and phone number', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      phoneNumber: 1234567890,
      password: 'password123',
    };

    await User.create(userData);

    try {
      await User.create(userData); // Trying to create another user with the same email and phone number
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.code).toBe(11000);
    }
  });
});
