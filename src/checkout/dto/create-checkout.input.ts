import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateCheckoutInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
