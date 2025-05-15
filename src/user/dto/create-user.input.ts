  import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, Matches } from 'class-validator';

  @InputType()
  export class CreateUserAddressInput {
    
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
    @IsEmail({}, { message: 'Invalid email format' })
    email: string;

    @Field()
    @Matches(/^\+\d{1,3}[6-9]\d{9}$/, {
      message: 'Phone must include country code and be a valid 10-digit Indian mobile number (e.g. +91XXXXXXXXXX)',
    })
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
