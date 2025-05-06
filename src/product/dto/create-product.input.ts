import { InputType, Float, Field } from '@nestjs/graphql';

@InputType()
export class CreateVariantInput {
  @Field()
  size: string;

  @Field(() => Float)
  price: number;
}

@InputType()
export class CreateProductInput {
  @Field()
  image:string;
  
  @Field()
  name: string;

  @Field()
  collection: string;

  @Field()
  flavour: string;

  @Field()
  origin: string;

  @Field(()=>[String])
  qualities: string[];

  @Field()
  caffeine: string;

  @Field(()=>[String])
  allegens: string[];

  @Field()
  isOrganic: boolean;

  @Field()
  isVegan: boolean;

  @Field(() => [CreateVariantInput])
  variants: CreateVariantInput[];
}
