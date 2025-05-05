// src/user/user.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserInput } from './dto/update-user.input';
import { PrismaService } from 'src/prisma.service';
import { CreateUserInput } from './dto/create-user.input';
import { isEmail, isPhoneNumber } from 'src/utils/validateString';
import * as bcrypt from 'bcrypt';
import { User as PrismaUser } from 'generated/prisma';
import * as nodemailer from 'nodemailer';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserInput: CreateUserInput) {
    // Validate if the provided input is either a valid email or a valid phone number

    let hashedPassword: string;
    if (createUserInput.password) {
      const saltOrRounds = 10;
      hashedPassword = await bcrypt.hash(
        createUserInput.password,
        saltOrRounds,
      );
    } else {
      throw new BadRequestException('Password is compulsory');
    }

    // Check if the user already exists with either the email or phone
    // Check if the user already exists with either the email or phone
const existingUser = await this.prisma.user.findFirst({
  where: {
    OR: [
      { email: createUserInput.email },
      { phone: String(createUserInput.phone) },
    ],
  },
});

if (existingUser) {
  throw new BadRequestException('User already exists');
}


    // Make sure to validate name and password if needed

    const userData = {
      firstName: createUserInput.firstName,
      lastName: createUserInput.lastName,
      phone: String(createUserInput.phone), // Handle null phone if not provided
      email: createUserInput.email, // Handle null email if not provided
      password: hashedPassword,
    };

    // Proceed to create the user only after validation
    const newUser = await this.prisma.user.create({
      data: userData,
    });

    // Return the created user object
    return newUser;
  }

  async forgetUserPassword(email: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Generate new password logic
    const generateSixDigitPassword = () =>
      Math.floor(100000 + Math.random() * 900000).toString();
    let newPassword = generateSixDigitPassword();

    // Hash the password (as you were doing previously)
    let hashedPassword = await bcrypt.hash(newPassword, 10);

    // Save the new password
    await this.prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    // Set up the transporter for sending email
    const transporter = nodemailer.createTransport({
      service: 'gmail', // You can change this to the email provider you're using
      auth: {
        user: process.env.EMAIL_USER, // Email address
        pass: process.env.EMAIL_PASSWORD, // Email password (be cautious with storing in env files)
      },
    });

    // Send the email with the new password
    const mailOptions = {
      from: process.env.EMAIL_USER, // sender address
      to: email, // list of receivers
      subject: 'Your New Password', // Subject line
      text: `Your new password is: ${newPassword} you can Change your password After Login`, // plaintext body
    };
    transporter.sendMail(mailOptions);
    return existingUser;
  }

  async findOne(userId: string): Promise<PrismaUser | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
    });
  }

  // update(updateUserInput: UpdateUserInput) {
  //   const { id, ...data } = updateUserInput;
  //   return this.prisma.user.update({
  //     where: { id },
  //     data,
  //   });
  // }

  // remove(id: number) {
  //   return this.prisma.user.delete({ where: { id } });
  // }
}
