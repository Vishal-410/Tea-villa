import { InputType, Field, Int } from '@nestjs/graphql';

// Custom Validator
// @ValidatorConstraint({ name: 'EmailOrPhone', async: false })
// class EmailOrPhoneConstraint implements ValidatorConstraintInterface {
//   validate(_: any, args: ValidationArguments) {
//     const obj = args.object as any;
//     return !!(obj.email || obj.phone); // true if email or phone exists
//   }

//   defaultMessage(args: ValidationArguments) {
//     return 'Either email or phone must be provided.';
//   }
// }

@InputType()
export class CreateUserInput {
  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  email: string;

  @Field()
  phone:string;

  @Field()
  password: string;

  // @Validate(EmailOrPhoneConstraint) // 👈 custom validation lagayi
  // dummyField?: string; // dummy field just to trigger validation
}
