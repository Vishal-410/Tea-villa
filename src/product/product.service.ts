import { Injectable } from '@nestjs/common';
import { CreateProductInput } from './dto/create-product.input';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProductInput: CreateProductInput) {
    const {
      image,
      name,
      collection,
      flavour,
      origin,
      qualities,
      caffeine,
      allegens,
      isOrganic,
      isVegan,
      variants,
    } = createProductInput;

    return this.prisma.product.create({
      data: {
        image,
        name,
        collection,
        flavour,
        origin,
        qualities,
        caffeine,
        allegens,
        isOrganic,
        isVegan,
        variants: {
          create: variants.map((variant) => ({
            size: variant.size,
            price: variant.price,
          })),
        },
      },
      include: {
        variants: true,
      },
    });
  }

  async findAll(pageNumber: number = 1, pageSize: number) {
    const skip = (pageNumber - 1) * pageSize;
    const [items, totalItems] = await Promise.all([
      this.prisma.product.findMany({
        skip,
        take: pageSize,
        include: { variants: true },
      }),
      this.prisma.product.count(),
    ]);
    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      items,
      totalItems,
      totalPages,
      hasNextPage: pageNumber < totalPages,
    };
  }

  async findOne(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    });
  }
  async deleteOne(id: string) {
    try {
      const deletedProduct = await this.prisma.product.delete({
        where: { id }, // the unique identifier for the product
      });

      return deletedProduct;
    } catch (error) {
      throw new Error(`Error deleting product with id ${id}: ${error.message}`);
    }
  }
}
