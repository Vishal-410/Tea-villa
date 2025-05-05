import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service'; // assuming you have a PrismaService

@Injectable()
export class WishlistService {
  constructor(private readonly prisma: PrismaService) {}

  // Method to add a product to the wishlist
  async create(userId: string, productId: string) {
    // Check if the product exists in the Product table
    const productExists = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!productExists) {
      throw new Error('Product not found');
    }

    // Check if the product is already in the user's wishlist
    const existingWishlistItem = await this.prisma.wishList.findFirst({
      where: {
        userId,
        productId,
      },
    });

    if (existingWishlistItem) {
      throw new Error('This product is already in your wishlist');
    }

    // Create a new wishlist entry for the product
    const newWishlistItem = await this.prisma.wishList.create({
      data: {
        userId,
        productId,
      },
    });

    return newWishlistItem;
  }

  // Get all wishlist entries for the logged-in user
  async findAll(userId: string) {
    const wishlists = await this.prisma.wishList.findMany({
      where: {
        userId,
      },
      include: {
        product: true, // Include the product data for each wishlist item
      },
    });

    return wishlists.map((wishlist) => wishlist.product);
  }

  // Delete all items from the wishlist of the logged-in user
  async deleteAll(userId: string) {
    const deletedItems = await this.prisma.wishList.deleteMany({
      where: {
        userId,
      },
    });

    if (deletedItems.count === 0) {
      throw new Error('No items to delete');
    }

    return deletedItems.count;
  }

  // Remove a specific wishlist item by its ID
  async remove(id: string) {
    const removedWishlist = await this.prisma.wishList.delete({
      where: {
        id,
      },
    });

    if (!removedWishlist) {
      throw new NotFoundException('Wishlist item not found');
    }

    return removedWishlist;
  }
}
