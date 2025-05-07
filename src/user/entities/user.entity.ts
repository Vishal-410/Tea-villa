// src/user/entities/user.entity.ts
import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field()
  id: string;

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

  @Field(() => [Address], { nullable: true })
  addresses?: Address[];

  
  @Field({ nullable: true })
  role?: string; 
}



@ObjectType()
export class Address {
  @Field()
  id: string;

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

  @Field()
  isDefault: boolean;
}
