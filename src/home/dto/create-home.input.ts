import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateHomeInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
