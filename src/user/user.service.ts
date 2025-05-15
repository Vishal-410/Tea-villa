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
import {
  CreateUserAddressInput,
  CreateUserInput,
} from './dto/create-user.input';
import * as bcrypt from 'bcrypt';
import { User as PrismaUser } from 'generated/prisma';
import * as nodemailer from 'nodemailer';
import { Address, User, UserProfile } from './entities/user.entity';


function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone: string): boolean {
  
  const phoneRegex = /^\+?\d{1,4}[- ]?\d{10}$/;
  return phoneRegex.test(phone);
}


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
  
    if (!isValidEmail(email)) {
      throw new BadRequestException('Invalid email format');
    }
    if (!isValidPhone(phone)) {
      throw new BadRequestException('Invalid phone number. Must be 10 digits with country code');
    } new BadRequestException('Password is compulsory');
    

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
    if (newPassword !== confirmNewPassword) {
      throw new Error(' the new and confirmPassword note match');
    }
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
      if(!isValidatePassword){
        throw new Error("please enter correct old password")
      }
    const isNewAndOldPasswordSame = await bcrypt.compare(
      newPassword,
      existingUserPassword,
    );
    if (isNewAndOldPasswordSame) {
      throw new Error("the  old and new password can't be same");
    }


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

  async forgetUserPassword(email: string,phone:string) {
    let existingUser: User | null = null;
if (email) {
  existingUser = await this.prisma.user.findUnique({
    where: { email },
    include:{addresses:true}
  });
} else if (phone) {
  existingUser = await this.prisma.user.findUnique({
    where: { phone },
    include:{addresses:true}

  });
} else {
  throw new BadRequestException('Either email or phone must be provided');
}
if(existingUser === null){
  throw new Error("User not register with this email and phone number" )
}
let userEmail=existingUser.email;


  
    const generateSixDigitPassword = () =>
      Math.floor(100000 + Math.random() * 900000).toString();
    let newPassword = generateSixDigitPassword();

   
    let hashedPassword = await bcrypt.hash(newPassword, 10);

 
    await this.prisma.user.update({
      where: { email:userEmail },
      data: { password: hashedPassword },
    });

   
    const transporter = nodemailer.createTransport({
      service: 'gmail', 
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASSWORD, 
      },
    });

   
    const mailOptions = {
      from: process.env.EMAIL_USER, 
      to: userEmail, 
      subject: 'Your New Password', 
      text: `Your new password is: ${newPassword} you can Change your password After Login`, 
    };
    transporter.sendMail(mailOptions);
    return existingUser;
  }

  async findOne(userId: string): Promise<PrismaUser | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
    });
  }
  async getProfile(userId: string):Promise<UserProfile|null> {
   const user=await  this.prisma.user.findUnique({
      where: { id: userId },
      include:{addresses:true}
    });
    if(!user){
      return null;
    }
    const {password, ...userwithoutPAssword}=user
    return userwithoutPAssword;
  }
 

  async updateProfile(userId: string, updateUserInput: UpdateUserInput):Promise<User|null> {
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });
  
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }
  
    const {id, addresses, ...data } = updateUserInput;
  
    return this.prisma.user.update({
      where: { id: userId },
      data,
      include:{addresses:true}
    });
  }
  

  async updateAddress(
    userId: string,
    updateUserAddressInput: UpdateUserAddressInput,
  ) :Promise<Address|null>{
    const { id, isDefault, ...updateData } = updateUserAddressInput;

   
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


    const updatedAddress = await this.prisma.address.update({
      where: { id },
      data: {
        ...updateData,
        isDefault: isDefault ?? existingAddress.isDefault,
      },
    });

    return updatedAddress;
  }

  async addAddress(userId: string, addressData: CreateUserAddressInput):Promise<Address|null> {
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

    return newAddress;
  }

  async makeDefaultAddress(userId: string, addressFieldId: string):Promise<Address|null> {
   
    const address = await this.prisma.address.findUnique({
      where: {
        id: addressFieldId,
      },
    });
 

    if (!address) {
      throw new NotFoundException('Address not found for this user');
    }

    
    await this.prisma.address.updateMany({
      where: {
        userId,
        NOT: { id: addressFieldId },
      },
      data: {
        isDefault: false,
      },
    });

   
    const updatedAddress = await this.prisma.address.update({
      where: { id: addressFieldId },
      data: { isDefault: true },
    });

    return updatedAddress;
  }

  async deleteUser(userId: string) {
    const user = await this.prisma.user.delete({
      where: { id: userId },
    });
    return user;
  }
  async deleteAddress(addressId: string)  {
    const address = await this.prisma.address.delete({
      where: { id: addressId },
    });
    return address;
  }
}
