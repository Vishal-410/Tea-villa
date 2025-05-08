import { Injectable } from '@nestjs/common';
const Razorpay = require('razorpay');
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class PaymentService {
  private razorpay: any;

  constructor(private readonly prisma: PrismaService) {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  async createOrder(userId: string | null, amount: number, currency = 'INR') {
    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency,
      receipt: `receipt_order_${Date.now()}`,
    };

    try {
      const order = await this.razorpay.orders.create(options);
      console.log('Razorpay Order Created:', order);

      // Check if the order creation failed
      if (!order || !order.id) {
        console.error('Failed to create Razorpay order:', order);
        throw new Error('Razorpay order creation failed');
      }

      // Save to the database
      const payment = await this.prisma.payment.create({
        data: {
          razorpayOrderId: order.id,
          amount: order.amount,
          currency: order.currency,
          receipt: order.receipt,
          status: order.status,
          userId: userId || null, // if available from context
        },
      });

      console.log('Payment saved to database:', payment);
      return order.id;
    } catch (error) {
      console.error('Error in createOrder:', error); // Log the full error
      throw new Error('Could not create order');
    }
  }
}
