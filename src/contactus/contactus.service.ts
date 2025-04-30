import { Injectable } from '@nestjs/common';
import { CreateContactusInput } from './dto/create-contactus.input';
import { UpdateContactusInput } from './dto/update-contactus.input';
import { PrismaService } from 'src/prisma.service';
import { Contactus } from './entities/contactus.entity';
import * as nodemailer from 'nodemailer';

@Injectable()
export class ContactusService {
  constructor(private readonly prisma:PrismaService){}
  async create(createContactusInput: CreateContactusInput) {
    if(!createContactusInput){
     throw new Error("invalid credentials")

    }
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: createContactusInput.email,
      subject: 'Your OTP for Login',
      text: `we got your message soon we will be connection to you`,
    };

    await transporter.sendMail(mailOptions);

    return await this.prisma.contactUs.create({data:createContactusInput})
  }

 
}
