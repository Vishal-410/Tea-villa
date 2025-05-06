import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';


@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  // Adds item to cart or updates quantity if item already exists
  async addToCart(userId: string, variantId: string, quantity: number) {
    // 1. Find or create a cart for the user
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    });

    if (!cart) {
      // Create a new cart if one doesn't exist
      cart = await this.prisma.cart.create({
        data: {
          user: { connect: { id: userId } },
        },
        include: { items: true },
      });
    }

    // 2. Check if item with the same variant already exists in cart
    const existingItem = cart.items.find(
      (item) => item.variantId === variantId,
    );

    if (existingItem) {
      // 3. Update quantity if item already exists
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: quantity,
        },
      });
    } else {
      // 4. Add new cart item if item doesn't exist
      await this.prisma.cartItem.create({
        data: {
          cart: { connect: { id: cart.id } },
          variant: { connect: { id: variantId } },
          quantity,
        },
      });
    }

    const totalPrice = await this.calculateTotalPrice(cart.id);

  let cartDetail=  this.getCart(userId);
    return {cartDetail,totalPrice}
  }
  async calculateTotalPrice(cartId: string): Promise<number> {
    const cartItems = await this.prisma.cartItem.findMany({
      where: { cartId },
      include: { variant: true },  // Include variant to get the price
    });

    let totalPrice = 0;

    for (const item of cartItems) {
      const itemPrice = item.variant.price;  
      totalPrice += itemPrice * item.quantity; 
    }

    return totalPrice;
  }
  // Retrieves the user's cart with item and variant details
  async getCart(userId: string) {
    return this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            variant: {
              include: { product: true },
            },
          },
        },
      },
    });
  }
  // async update(id: number, updateCartInput: UpdateCartInput) {
  //   // Update the cart's fields if needed (for example, cart status or other properties)
  //   return this.prisma.cart.update({
  //     where: { id },
  //     data: updateCartInput,
  //   });
  // }

  // Optional: remove an item from the cart
  async removeItemFromCart(userId: string, variantId: string) {
    // Find the cart for the user
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    });

    if (cart) {
      const itemToRemove = cart.items.find(
        (item) => item.variantId === variantId,
      );

      if (itemToRemove) {
        // Delete the item from cart
        await this.prisma.cartItem.delete({
          where: { id: itemToRemove.id },
        });
      }
    }

    // Return updated cart
    return this.getCart(userId);
  }
}
