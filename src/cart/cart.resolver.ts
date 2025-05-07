import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { CartService } from './cart.service';
import { Cart } from './entities/cart.entity';
import { CreateCartInput } from './dto/create-cart.input';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';

@Resolver(() => Cart)
export class CartResolver {
  constructor(private readonly cartService: CartService) {}

  @Mutation(() => Cart)
  @UseGuards(JwtAuthGuard)
  async createCart(@Context() context, @Args('createCartInput') createCartInput: CreateCartInput) {
    const userId=context.req.user.id;
    return this.cartService.addToCart(userId, createCartInput.variantId, createCartInput.quantity);
  }
  
  @Query(() => Cart, { name: 'cart' })
  findOne(@Args('id') id: string) {
    return this.cartService.getCart(id);
  }


  @Mutation(() => Cart)
  async removeItem(@Args('userId') userId: string, @Args('variantId') variantId: string) {
    return this.cartService.removeItemFromCart(userId, variantId);
  }
}
