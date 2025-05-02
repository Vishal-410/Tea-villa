import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { HomeService } from './home.service';
import { Home } from './entities/home.entity';
import { CreateHomeInput } from './dto/create-home.input';
import { UpdateHomeInput } from './dto/update-home.input';

@Resolver(() => Home)
export class HomeResolver {
  constructor(private readonly homeService: HomeService) {}

  @Mutation(() => Home)
  createHome(@Args('createHomeInput') createHomeInput: CreateHomeInput) {
    return this.homeService.create(createHomeInput);
  }

  @Query(() => [Home], { name: 'home' })
  findAll() {
    return this.homeService.findAll();
  }

  @Query(() => Home, { name: 'home' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.homeService.findOne(id);
  }

  @Mutation(() => Home)
  updateHome(@Args('updateHomeInput') updateHomeInput: UpdateHomeInput) {
    return this.homeService.update(updateHomeInput.id, updateHomeInput);
  }

  @Mutation(() => Home)
  removeHome(@Args('id', { type: () => Int }) id: number) {
    return this.homeService.remove(id);
  }
}
