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

  @Field(() => String, { nullable: true })
  profileImage: string | null;

  @Field(() => String, { nullable: true })
  dateOfBirth: string | null;

  @Field(() => String, { nullable: true })
  gender: string | null;

  @Field(() => [Address], { nullable: true })
  addresses: Address[] | null;

  @Field(() => String, { nullable: true })
  role: string | null;
}

@ObjectType()
export class Address {
  @Field()
  id: string;

  @Field()
  pincode: string;

  @Field()
  userId:string;
  

  @Field()
  city: string;

  @Field()
  state: string;

  @Field()
  country: string;

  @Field()
  street: string;

  @Field(() => String, { nullable: true })
  landmark: string | null;

  @Field()
  isDefault: boolean;
}

@ObjectType()
export class UserProfile {
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

  @Field(() => String, { nullable: true })
  profileImage: string | null;

  @Field(() => String, { nullable: true })
  dateOfBirth: string | null;

  @Field(() => String, { nullable: true })
  gender: string | null;

  @Field(() => [Address], { nullable: true })
  addresses: Address[] | null;

  @Field(() => String, { nullable: true })
  role: string | null;
}
