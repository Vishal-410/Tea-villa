import { CreateUserAddressInput, CreateUserInput } from './create-user.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateUserInput extends PartialType(CreateUserInput) {
  @Field()
  id: string;
}

@InputType()
export class UpdateUserAddressInput extends PartialType(CreateUserAddressInput){
  @Field()
  id: string;
}