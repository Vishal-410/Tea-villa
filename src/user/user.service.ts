// src/user/user.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  UpdateUserInput,
  UpdateUserAddressInput,
} from './dto/update-user.input';
import { PrismaService } from 'src/prisma.service';
import { CreateUserAddressInput, CreateUserInput } from './dto/create-user.input';
import * as bcrypt from 'bcrypt';
import { User as PrismaUser } from 'generated/prisma';
import * as nodemailer from 'nodemailer';
import { Address } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserInput: CreateUserInput) {
    const {
      firstName,
      lastName,
      phone,
      email,
      password,
      profileImage,
      dateOfBirth,
      gender,
      addresses,
    } = createUserInput;

    if (!password) {
      throw new BadRequestException('Password is compulsory');
    }

    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
    });

    if (existingUser) {
      throw new BadRequestException('Please enter unique email and phone');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Ensure only one default address is set
    let defaultSet = false;
    const cleanedAddresses =
      addresses?.map((address) => {
        if (address.isDefault && !defaultSet) {
          defaultSet = true;
          return { ...address, isDefault: true };
        }
        return { ...address, isDefault: false };
      }) || [];

    const newUser = await this.prisma.user.create({
      data: {
        firstName,
        lastName,
        phone,
        email,
        password: hashedPassword,
        profileImage,
        dateOfBirth,
        gender,
        addresses:
          cleanedAddresses.length > 0
            ? {
                create: cleanedAddresses,
              }
            : undefined,
      },
      include: {
        addresses: true,
      },
    });

    return newUser;
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
    confirmNewPassword: string,
  ) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!existingUser) {
      throw new Error('User Not found');
    }
    const existingUserPassword = existingUser.password;
    const isValidatePassword = await bcrypt.compare(
      oldPassword,
      existingUserPassword,
    );
    console.log(existingUserPassword, oldPassword);
    if (isValidatePassword && newPassword === confirmNewPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await this.prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });
    } else {
      throw new UnauthorizedException('credential not matched');
    }
    return existingUser;
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
    /* this is used by jwtStrategy */
    return this.prisma.user.findUnique({
      where: { id: userId },
    });
  }
  async getProfile(userId: string): Promise<PrismaUser | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
    });
  }

  async updateProfile(userId: string, updateUserInput: UpdateUserInput) {
    // Optionally validate user exists before update
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    const { id, addresses, ...data } = updateUserInput;

    return this.prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  async updateAddress(
    userId:string,
    updateUserAddressInput: UpdateUserAddressInput,
  ) {
    const { id, isDefault, ...updateData } = updateUserAddressInput;

    // Find the address by ID and userId
    const existingAddress = await this.prisma.address.findUnique({
      where: {
        id,
      },
    });

    if (!existingAddress) {
      throw new NotFoundException('Address not found for this user');
    }

    if (isDefault === true) {
      await this.prisma.address.updateMany({
        where: {
          userId,
          NOT: { id },
        },
        data: { isDefault: false },
      });
    }

    // Update the selected address
    const updatedAddress = await this.prisma.address.update({
      where: { id },
      data: {
        ...updateData,
        isDefault: isDefault ?? existingAddress.isDefault,
      },
    });

    return updatedAddress;
  }

  async addAddress(userId: string, addressData:CreateUserAddressInput) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
  
    if (!user) {
      throw new NotFoundException('User not found');
    }
  
    if (addressData.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }
  
    const newAddress = await this.prisma.address.create({
      data: {
        ...addressData,
        user: { connect: { id: userId } },
      },
    });
  
    return newAddress
  }

  async makeDefaultAddress(userId: string, addressFieldId: string) {
    // Check if address exists and belongs to the user
    const address = await this.prisma.address.findFirst({
      where: {
        id: addressFieldId,
        userId: userId,
      },
    });
  
    if (!address) {
      throw new NotFoundException('Address not found for this user');
    }
  
    // Set all other addresses to isDefault: false
    await this.prisma.address.updateMany({
      where: {
        userId,
        NOT: { id: addressFieldId },
      },
      data: {
        isDefault: false,
      },
    });
  
    // Set the selected address to isDefault: true
    const updatedAddress = await this.prisma.address.update({
      where: { id: addressFieldId },
      data: { isDefault: true },
    });
  
    return updatedAddress;
  }
  

  async removeUser(userId: string) {
    const user = await this.prisma.user.delete({
      where: { id: userId },
    });
    return user;
  }
  async deleteAddress(addressId: string) {
    const address = await this.prisma.address.delete({
      where: { id: addressId },
    });
    return address;
  }
}
