import { CreateHomeInput } from './create-home.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateHomeInput extends PartialType(CreateHomeInput) {
  @Field(() => Int)
  id: number;
}
