// src/payment/payment.resolver.ts
import { Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import { PaymentService } from './payment.service';
import { CreateOrderInput } from './dto/create-payment.input';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';


@Resolver()
export class PaymentResolver {
  constructor(private readonly paymentService: PaymentService) {}

  @UseGuards(JwtAuthGuard)
  @Mutation(() => String)
  async createOrder(@Context() context,
  @Args('input') input: CreateOrderInput) {
    const userId:string|null=context.req.user.id;
    const order = await this.paymentService.createOrder(userId,input.amount, input.currency);
    return order.id;
  }
}
