import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateUserAddressInput {
  @Field()
  fullName: string;

  @Field()
  phone: string;

  @Field()
  pincode: string;

  @Field()
  city: string;

  @Field()
  state: string;

  @Field()
  country: string;

  @Field()
  street: string;

  @Field({ nullable: true })
  landmark?: string;

  @Field({ defaultValue: false })
  isDefault?: boolean;
}

@InputType()
export class CreateUserInput {
  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  email: string;

  @Field()
  phone: string;

  @Field()
  password: string;

  @Field({ nullable: true })
  profileImage?: string;

  @Field({ nullable: true })
  dateOfBirth?: string;

  @Field({ nullable: true })
  gender?: string;

  @Field(() => [CreateUserAddressInput], { nullable: true })
  addresses?: CreateUserAddressInput[];
}
