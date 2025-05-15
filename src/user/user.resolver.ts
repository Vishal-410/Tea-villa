// src/user/user.resolver.ts
import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UserService } from './user.service';
import {
  CreateUserAddressInput,
  CreateUserInput,
} from './dto/create-user.input';
import {
  UpdateUserAddressInput,
  UpdateUserInput,
} from './dto/update-user.input';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { BadRequestException, UseGuards } from '@nestjs/common';
import { Address, User, UserProfile } from './entities/user.entity';

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => User)
  createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.userService.create(createUserInput);
  }

  @Mutation(() => User)
  async forgotUserPassword(
    @Args('email', { nullable: true }) email: string,
    @Args('phone', { nullable: true }) phone: string,
  ) {
    if (!email && !phone) {
      throw new BadRequestException('Either email or phone is required');
    }

    return await this.userService.forgetUserPassword(email, phone);
  }
  @UseGuards(JwtAuthGuard)
  @Mutation(() => User)
  changeUserPassword(
    @Context() context,
    @Args('oldPassword') oldPassword: string,
    @Args('newPassword') newPassword: string,
    @Args('confirmNewPassword') confirmNewPassword: string,
  ) {
    const userId = context.req.user.id;

    return this.userService.changePassword(
      userId,
      oldPassword,
      newPassword,
      confirmNewPassword,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => UserProfile)
  getUserProfile(@Context() context) {
    const userId: string = context.req.user.id;
    return this.userService.getProfile(userId);
  }

  @Mutation(() => User)
  @UseGuards(JwtAuthGuard)
  updateUserProfile(@Context() context, updateUserInput: UpdateUserInput) {
    const userId: string = context.req.user.id;
    return this.userService.updateProfile(userId, updateUserInput);
  }
  @Mutation(() => Address)
  @UseGuards(JwtAuthGuard)
  updateUserAddress(
    @Context() context,
    @Args('updateUserAddressInput')
    updateUserAddressInput: UpdateUserAddressInput,
  ): Promise<Address | null> {
    const userId: string = context.req.user.id;
    return this.userService.updateAddress(userId, updateUserAddressInput);
  }
  @Mutation(() => Address)
  @UseGuards(JwtAuthGuard)
  addUserAddress(
    @Context() context,
    @Args('updateUserAddressInput')
    createUserAddressInput: CreateUserAddressInput,
  ): Promise<Address | null> {
    const userId: string = context.req.user.id;
    return this.userService.addAddress(userId, createUserAddressInput);
  }
  @Mutation(() => Address)
  @UseGuards(JwtAuthGuard)
  makeDefaultAddress(
    @Context() context,
    @Args('addressFieldId') addressFieldId: string,
  ) {
    const userId: string = context.req.user.id;
    return this.userService.makeDefaultAddress(userId, addressFieldId);
  }

  @Mutation(() => User)
  @UseGuards(JwtAuthGuard)
  deleteAccount(@Context() context) {
    const userId: string = context.req.user.id;
    return this.userService.deleteUser(userId);
  }
  @Mutation(() => Address)
  @UseGuards(JwtAuthGuard)
  deleteUserAddress(@Args('addressId') addressId: string) {
    return this.userService.deleteAddress(addressId);
  }
}
