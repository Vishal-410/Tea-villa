// src/user/entities/user.entity.ts
import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Contactus {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field()
  phone: string;

  @Field()
  email: string;

  @Field()
  message: string;

}
