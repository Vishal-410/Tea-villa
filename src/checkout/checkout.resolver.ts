import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { CheckoutService } from './checkout.service';
import { Checkout } from './entities/checkout.entity';
import { CreateCheckoutInput } from './dto/create-checkout.input';
import { UpdateCheckoutInput } from './dto/update-checkout.input';

@Resolver(() => Checkout)
export class CheckoutResolver {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Mutation(() => Checkout)
  createCheckout(@Args('createCheckoutInput') createCheckoutInput: CreateCheckoutInput) {
    return this.checkoutService.create(createCheckoutInput);
  }

  @Query(() => [Checkout], { name: 'checkout' })
  findAll() {
    return this.checkoutService.findAll();
  }

  @Query(() => Checkout, { name: 'checkout' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.checkoutService.findOne(id);
  }

  @Mutation(() => Checkout)
  updateCheckout(@Args('updateCheckoutInput') updateCheckoutInput: UpdateCheckoutInput) {
    return this.checkoutService.update(updateCheckoutInput.id, updateCheckoutInput);
  }

  @Mutation(() => Checkout)
  removeCheckout(@Args('id', { type: () => Int }) id: number) {
    return this.checkoutService.remove(id);
  }
}
