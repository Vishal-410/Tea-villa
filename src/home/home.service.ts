import { Injectable } from '@nestjs/common';
import { CreateHomeInput } from './dto/create-home.input';
import { UpdateHomeInput } from './dto/update-home.input';

@Injectable()
export class HomeService {
  create(createHomeInput: CreateHomeInput) {
    return 'This action adds a new home';
  }

  findAll() {
    return `This action returns all home`;
  }

  findOne(id: number) {
    return `This action returns a #${id} home`;
  }

  update(id: number, updateHomeInput: UpdateHomeInput) {
    return `This action updates a #${id} home`;
  }

  remove(id: number) {
    return `This action removes a #${id} home`;
  }
}
