import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './dto/jwt-payload';
import { JwtAuthResponse } from './dto/jwt-auth.response';
import { OAuth2Client } from 'google-auth-library';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // Validate the user and send OTP
  async validateUser(
    email: string,
    password: string,
  ): Promise<JwtAuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new BadRequestException('Invalid credentials');
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 5 * 60 * 1000); // valid for 5 minutes

    await this.prisma.user.update({
      where: { email },
      data: {
        otp,
        otpExpiresAt: expires,
      },
    });

    // Send OTP via email
    await this.sendOtpEmail(email, otp);

    return { access_token: '', requires2FA: true };
  }

  private async sendOtpEmail(email: string, otp: string) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP for Login',
      text: `Your OTP is: ${otp}. It is valid for 5 minutes.`,
    };

    await transporter.sendMail(mailOptions);
  }

  // Verify OTP and issue JWT
  async verifyOtp(email: string, otp: string): Promise<JwtAuthResponse> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (
      !user ||
      user.otp !== otp ||
      !user.otpExpiresAt ||
      new Date() > user.otpExpiresAt
    ) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Clear OTP after use
    await this.prisma.user.update({
      where: { email },
      data: {
        otp: null,
        otpExpiresAt: null,
      },
    });

    const payload = { sub: user.id, email: user.email,role:user.role };
    const token = this.jwtService.sign(payload);

    // Save the token (after removing old)
    await this.prisma.userToken.deleteMany({ where: { userId: user.id } });

    await this.prisma.userToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day
      },
    });

    return { access_token: token, requires2FA: false }; // Now user has passed OTP
  }

  // Google Login
  async loginWithGoogle(idToken: string): Promise<JwtAuthResponse> {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload?.email;
    const name = payload?.given_name || 'User';

    if (!email) {
      throw new BadRequestException('Invalid Google token');
    }

    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          firstName: name,
          lastName: 'singh',
          phone: String(12345),
          password: '',
        },
      });
    }

    const jwtPayload = { sub: user.id, email: user.email ,role:user.role};
    const token = this.jwtService.sign(jwtPayload);

    await this.prisma.userToken.deleteMany({ where: { userId: user.id } });
    await this.prisma.userToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      },
    });

    return { access_token: token, requires2FA: false };
  }

  // Logout
  async logout(token: string): Promise<boolean> {
    if (!token) {
      throw new BadRequestException('Token not found');
    }

    const deleted = await this.prisma.userToken.deleteMany({
      where: { token },
    });

    return deleted.count > 0;
  }
}
