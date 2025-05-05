import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Cart {
  @Field( { description: 'Unique identifier for the cart' })
  id: string;

  @Field(() => Int, { description: 'ID of the user who owns the cart' })
  userId: number;

  @Field(() => [CartItem], { description: 'List of items in the cart' })
  items: CartItem[];

  @Field(() => Date, { description: 'When the cart was created' })
  createdAt: Date;

  @Field(() => Date, { description: 'When the cart was last updated' })
  updatedAt: Date;
}

@ObjectType()
export class CartItem {
  @Field( { description: 'Unique identifier for the cart item' })
  id: string;

  @Field(() => Int, { description: 'ID of the variant being added to the cart' })
  variantId: number;

  @Field(() => Int, { description: 'Quantity of the product variant' })
  quantity: number;

 
}
