import nodemailer from 'nodemailer';
import { EmailService } from '../src/services/emailService';
import { template } from '../src/templates/resetPassword.template';
import { messages } from '../src/constants/constant';

jest.mock('nodemailer');

describe('EmailService', () => {
  let emailService;
  let mockSendMail;

  beforeAll(() => {
    // Mock transporter and its sendMail method
    mockSendMail = jest.fn();
    nodemailer.createTransport.mockReturnValue({ sendMail: mockSendMail });
  });

  beforeEach(() => {
    emailService = new EmailService();
  });

  describe('sendResetPasswordEmail', () => {
    it('should send a reset password email with correct options', async () => {
      const toEmail = 'test@example.com';
      const resetLink = 'https://example.com/reset-password';
      const htmlContent = template.replace('{{resetLink}}', resetLink);

      mockSendMail.mockResolvedValue(true);

      await emailService.sendResetPasswordEmail(toEmail, resetLink);

      const mailOptions = {
        from: process.env.MAIL_USERNAME,
        to: toEmail,
        subject: 'Reset Your Password',
        html: htmlContent,
      };

      expect(mockSendMail).toHaveBeenCalledWith(mailOptions);
      expect(console.log).toHaveBeenCalledWith('Reset password email sent successfully');
    });

    it('should throw an error if sending email fails', async () => {
      const toEmail = 'test@example.com';
      const resetLink = 'https://example.com/reset-password';
      
      const errorMessage = 'Error sending email';
      mockSendMail.mockRejectedValue(new Error(errorMessage));

      await expect(emailService.sendResetPasswordEmail(toEmail, resetLink)).rejects.toThrow(
        messages.auth.forgotPassword.emailSendError
      );

      expect(console.error).toHaveBeenCalledWith('Error sending reset password email:', expect.any(Error));
    });
  });
});
