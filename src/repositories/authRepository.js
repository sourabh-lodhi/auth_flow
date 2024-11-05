import { User } from "../models/index.js";
import crypto from "crypto";

export class UserRepository {
  async createUser(userData) {
    return await User.create(userData);
  }

  async findUserByEmail(email) {
    return await User.findOne({ email });
  }

  async updateAuthKey(userId, authKey) {
    return await User.findByIdAndUpdate(userId, { authkey: authKey }, { new: true });
  }

  async updateUserAuthKey(user) {
    user.authkey = null;
    await user.save();
  }

  async findUserById(id) {
    return await User.findById(id);
  }

  async updateUserPassword(user, newPassword) {
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
  }

  async findUserByResetToken(token) {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    return await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });
  }
}
