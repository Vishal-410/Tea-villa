import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateParagraphInput {
  @Field({ description: 'Text content of the paragraph' })
  text: string;
}

@InputType()
export class CreateHomeInput {
  @Field({ description: 'Image URL or path for the homepage content' })
  image: string;

  @Field({ description: 'Heading text for the homepage content' })
  heading: string;

  @Field(() => [CreateParagraphInput], { description: 'List of paragraphs associated with the homepage content' })
  paragraphs: CreateParagraphInput[];

  @Field(() => Date, { description: 'When the homepage content is created' })
  createdAt: Date;

  @Field(() => Date, { description: 'When the homepage content is last updated' })
  updatedAt: Date;
}
