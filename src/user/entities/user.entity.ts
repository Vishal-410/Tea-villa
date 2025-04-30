// src/user/entities/user.entity.ts
import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class User {
  
  @Field(() => Int)
  id: number;

  @Field()
  firstName: string;
  
  @Field()
  lastName: string;

  @Field()
  email: string;

  @Field()
  phone: string;

  @Field()
  password:string;
}
