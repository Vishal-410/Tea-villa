import { Injectable } from '@nestjs/common';
import { CreateRatingInput } from './dto/create-rating.input';
import { UpdateRatingInput } from './dto/update-rating.input';
import { PrismaService } from 'src/prisma.service';
import { Rating } from './entities/rating.entity';

@Injectable()
export class RatingService {
  constructor(private readonly prisma: PrismaService) {}
 async create(userId: string, createRatingInput: CreateRatingInput):Promise<Rating|{}> {
    const { productId, rating, review } = createRatingInput;

    return this.prisma.rating.upsert({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
      create: {
        userId,
        productId,
        rating,
        review: typeof review !== 'undefined' ? review : null,
      },
      update: {
        rating,
        review: typeof review !== 'undefined' ? review : null,
      },
    });
  }

  async deleteRating(userId:string,productId:string):Promise<Rating|{}>{
    return await this.prisma.rating.delete({
      where: {
        userId_productId: {  // unique combination of userId and productId
          userId,
          productId,
        },
      },
    });
  }
}
