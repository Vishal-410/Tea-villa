import { Injectable } from '@nestjs/common';
import { CreateCheckoutInput } from './dto/create-checkout.input';
import { UpdateCheckoutInput } from './dto/update-checkout.input';

@Injectable()
export class CheckoutService {
  create(createCheckoutInput: CreateCheckoutInput) {
    return 'This action adds a new checkout';
  }

  findAll() {
    return `This action returns all checkout`;
  }

  findOne(id: number) {
    return `This action returns a #${id} checkout`;
  }

  update(id: number, updateCheckoutInput: UpdateCheckoutInput) {
    return `This action updates a #${id} checkout`;
  }

  remove(id: number) {
    return `This action removes a #${id} checkout`;
  }
}
