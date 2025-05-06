import { CreateCheckoutInput } from './create-checkout.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateCheckoutInput extends PartialType(CreateCheckoutInput) {
  @Field(() => Int)
  id: number;
}
