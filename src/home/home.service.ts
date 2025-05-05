import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateHomeInput } from './dto/create-home.input';
import { UpdateHomeInput } from './dto/update-home.input';
import { Home } from './entities/home.entity'; // Make sure to adjust the import as per your project structure
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class HomeService {
  // Mocked in-memory data for demonstration
constructor(private readonly prisma:PrismaService){}
async create(createHomeInput: CreateHomeInput) {
  // Validate input
  if (!createHomeInput || !createHomeInput.paragraphs || createHomeInput.paragraphs.length === 0) {
    throw new BadRequestException("Invalid data: Paragraphs are required");
  }

  try {
    // Use Prisma to create HomePageContent with nested Paragraphs
    const newHomePageContent = await this.prisma.homePageContent.create({
      data: {
        image: createHomeInput.image,
        heading: createHomeInput.heading,
        paragraphs: {
          create: createHomeInput.paragraphs.map(paragraph => ({
            text: paragraph.text,
          })),
        },
      },
    });

    return newHomePageContent; // Return the created home page content
  } catch (error) {
    throw new BadRequestException("Error creating home page content: " + error.message);
  }
}

async findAll() {
  // Returns all homes (HomePageContent)
  return await this.prisma.homePageContent.findMany();
}

async findOne(id: string) {
  return await this.prisma.homePageContent.findUnique({
    where: {
      id: id,
    },
    include: {
      paragraphs: true, 
    },
  });
}

  
}