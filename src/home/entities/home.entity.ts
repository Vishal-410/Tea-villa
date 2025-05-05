import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class Home {
  @Field({ description: 'Unique identifier for the homepage content' })
  id: string;

  @Field({ description: 'Image URL or path for the homepage content' })
  image: string;

  @Field({ description: 'Heading text for the homepage content' })
  heading: string;

  @Field(() => [Paragraph], { description: 'List of paragraphs associated with the homepage content' })
  paragraphs: Paragraph[];

  @Field(() => Date, { description: 'When the homepage content was created' })
  createdAt: Date;

  @Field(() => Date, { description: 'When the homepage content was last updated' })
  updatedAt: Date;
}

@ObjectType()
export class Paragraph {
  @Field({ description: 'Unique identifier for the paragraph' })
  id: string;

  @Field({ description: 'Text content of the paragraph' })
  text: string;
}