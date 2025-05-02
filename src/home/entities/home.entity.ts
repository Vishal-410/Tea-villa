import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Home {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
