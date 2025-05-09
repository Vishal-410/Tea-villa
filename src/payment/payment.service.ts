import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import Razorpay = require('razorpay');
import * as crypto from 'crypto';
import { Order } from './entities/payment.entity';

@Injectable()
export class PaymentService {
  private razorpay: any;

  constructor(private readonly prisma: PrismaService) {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  // Create a Razorpay Order
  async createOrder(userId: string | null, amount: number, currency = 'INR') {
    const options = {
      amount: amount * 100,
      currency,
      receipt: `receipt_order_${Date.now()}`,
    };

    try {
      // Create the Razorpay order
      const order = await this.razorpay.orders.create(options);
      console.log('Razorpay Order Created:', order);

      if (!order || !order.id) {
        console.error('Failed to create Razorpay order:', order);
        throw new Error('Razorpay order creation failed');
      }

      // Save the payment details in the database
      const payment = await this.prisma.payment.create({
        data: {
          razorpayOrderId: order.id,
          razorpayPaymentId: null,
          amount: order.amount / 100, // Convert from paise to rupees
          currency: order.currency,
          receipt: order.receipt,
          status: 'created', // Payment is created but not yet paid
          userId: userId || null, // Null if no user is logged in
        },
      });

      console.log('Payment saved to database:', payment);
      return order.id;
    } catch (error) {
      console.error('Error in createOrder:', error);
      throw new Error('Could not create Razorpay order');
    }
  }

  // Confirm the Razorpay order after payment is made
  async confirmOrder(
    userId: string,
    razorpayOrderId: string,
    razorpayPaymentId: string,
    signature: string,
  ) {
    try {
      // Validate the signature to verify the payment

      const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
      if (!RAZORPAY_KEY_SECRET) {
        throw new BadRequestException('Invalid secret key');
      }

      const expectedSignature = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(razorpayOrderId + '|' + razorpayPaymentId)
        .digest('hex');

      if (expectedSignature !== signature) {
        throw new Error('Payment signature verification failed');
      }

      // Update the payment status and store the payment ID
      const payment = await this.prisma.payment.update({
        where: { razorpayOrderId },
        data: {
          status: 'paid',
          razorpayPaymentId,
        },
      });

      // Retrieve the user's cart to create the order
      const cart = await this.prisma.cart.findUnique({
        where: { userId },
        include: {
          items: { include: { variant: true } },
        },
      });

      if (!cart || cart.items.length === 0) {
        throw new Error('Cart is empty');
      }

      // Calculate the total amount from the cart
      const total = cart.items.reduce(
        (sum, item) => sum + item.variant.price * item.quantity,
        0,
      );

      // Create an order and link the payment
      const order = await this.prisma.order.create({
        data: {
          userId,
          total,
          status: 'paid',
          paymentId: payment.id,
          items: {
            create: cart.items.map((item) => ({
              variantId: item.variantId,
              quantity: item.quantity,
            })),
          },
        },
      });

      // Clear the cart after the order is created
      await this.prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return order;
    } catch (error) {
      throw new Error('Could not confirm the payment');
    }
  }

  async getOrdersByUserId(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            variant: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
