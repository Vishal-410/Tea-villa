// src/user/user.resolver.ts
import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { UserService } from './user.service';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Req, UseGuards } from '@nestjs/common';
import { User as PrismaUser } from 'generated/prisma';
import { User } from './entities/user.entity';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => User)
  createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.userService.create(createUserInput);
  }

  // @Query(() => [User])
  // @UseGuards(JwtAuthGuard)
  // findAll() {
  //   return this.userService.findAll();
  // }

  // @Query(() => User, { nullable: true }) // Mark the return type as nullable
  // @UseGuards(JwtAuthGuard)
  // async getUser(@Context() context): Promise<PrismaUser | null> {
  //   const userId = context.req.user.id;
  //   const user = await this.userService.findOne(userId);
  //   if (!user) {
  //     throw new Error('User not found');
  //   }
  //   return user;
  // }

  @Mutation(() => User)
  async forgetUserPassword(@Args('email') email: string) {
    return await this.userService.forgetUserPassword(email);
  }

  // @Mutation(() => User)
  // removeUser(@Args('id', { type: () => Int }) id: number) {
  //   return this.userService.remove(id);
  // }
  // @Mutation('')
  // async editProfile()
  
}
