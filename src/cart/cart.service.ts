import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateCartInput } from './dto/create-cart.input';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async addToCart(userId: string | null, createCartInput:CreateCartInput) {
    let {cartId,variantId,quantity}=createCartInput
    let cart;

    // Check if cartId is provided
    if (cartId) {
      cart = await this.prisma.cart.findUnique({
        where: { id: cartId },
        include: { items: true },
      });

      if (!cart) {
        throw new Error('Cart not found');
      }

      // If the cart is not linked to a user and a userId is provided, associate the cart with the user
      if (userId && !cart.userId) {
        cart = await this.prisma.cart.update({
          where: { id: cart.id },
          data: { user: { connect: { id: userId } } },
          include: { items: true },
        });
      }
    } else {
      // Create a new cart
      // Only connect the user if userId is provided
      cart = await this.prisma.cart.create({
        data: userId ? { user: { connect: { id: userId } } } : {}, // Conditionally pass user data
        include: { items: true },
      });
    }

    // Check if item already exists in cart
    const existingItem = cart.items.find(item => item.variantId === variantId);

    if (existingItem) {
      // If item exists, update the quantity
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity },
      });
    } else {
      // If item does not exist, create a new cart item
      await this.prisma.cartItem.create({
        data: {
          cart: { connect: { id: cart.id } },
          variant: { connect: { id: variantId } },
          quantity,
        },
      });
    }

    // Calculate the total price of the cart
    const totalPrice = await this.calculateTotalPrice(cart.id);

    // Retrieve the updated cart details
    const cartDetail = await this.getCartById(cart.id);
    return { cartId: cart.id, cart: cartDetail, totalPrice };
  }

  async mergeCarts(userId: string, guestCartId: string) {
    const guestCart = await this.prisma.cart.findUnique({
      where: { id: guestCartId },
      include: { items: true },
    });

    if (!guestCart || guestCart.userId) return;

    // Check if user already has a cart
    let userCart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    });

    // If user doesn't have a cart, link guest cart to user
    if (!userCart) {
      await this.prisma.cart.update({
        where: { id: guestCart.id },
        data: { user: { connect: { id: userId } } },
      });
      return;
    }

    // Merge items from guest cart into user's cart
    for (const guestItem of guestCart.items) {
      const userItem = userCart.items.find(i => i.variantId === guestItem.variantId);
      if (userItem) {
        // If item exists, update quantity
        await this.prisma.cartItem.update({
          where: { id: userItem.id },
          data: { quantity: userItem.quantity + guestItem.quantity },
        });
      } else {
        // If item doesn't exist, create a new cart item
        await this.prisma.cartItem.create({
          data: {
            cart: { connect: { id: userCart.id } },
            variant: { connect: { id: guestItem.variantId } },
            quantity: guestItem.quantity,
          },
        });
      }
    }

    // Delete the guest cart after merging
    await this.prisma.cart.delete({ where: { id: guestCart.id } });
    return true;
  }

  // Calculate the total price of the cart
  async calculateTotalPrice(cartId: string): Promise<number> {
    const cartItems = await this.prisma.cartItem.findMany({
      where: { cartId },
      include: { variant: true },
    });

    let totalPrice = 0;
    for (const item of cartItems) {
      const itemPrice = item.variant.price;
      totalPrice += itemPrice * item.quantity;
    }
    return totalPrice;
  }

  // Get the cart by cart ID
  async getCartById(cartId: string) {
    return this.prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: {
            variant: { include: { product: true } },
          },
        },
      },
    });
  }

  // Get the cart by user ID
  async getCartByUserId(userId: string) {
    return this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            variant: { include: { product: true } },
          },
        },
      },
    });
  }

  // Remove an item from the cart
  async removeItemFromCart(cartId: string, variantId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { id:cartId },
      include: { items: true },
    });

    if (cart) {
      const itemToRemove = cart.items.find(item => item.variantId === variantId);
      if (itemToRemove) {
        await this.prisma.cartItem.delete({ where: { id: itemToRemove.id } });
      }
    }

    return this.getCartById(cartId);
  }
}
