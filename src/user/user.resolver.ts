// src/user/user.resolver.ts
import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { UserService } from './user.service';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserAddressInput, UpdateUserInput } from './dto/update-user.input';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Req, UseGuards } from '@nestjs/common';
import { User as PrismaUser } from 'generated/prisma';
import { User } from './entities/user.entity';
import { PrismaService } from 'src/prisma.service';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService,private prisma:PrismaService
    ) {}

  @Mutation(() => User)
  createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.userService.create(createUserInput);
  }

  @Mutation(() => User)
  async forgotUserPassword(@Args('email') email: string) {
    
    return await this.userService.forgetUserPassword(email);
  }
  @UseGuards(JwtAuthGuard)
  @Mutation(()=>User)
  changePassword(@Context() context,
  @Args('oldPassword') oldPassword:string,@Args('newPassword') newPassword:string,@Args('confirmNewPassword') confirmNewPassword:string
  ){
    const userId=context.req.user.id;

    return this.userService.changePassword(userId,oldPassword,newPassword,confirmNewPassword)
  }

  @UseGuards(JwtAuthGuard)
  @Query(()=>User)
  getProfile(@Context() context){
    const userId:string=context.req.user.id
    return this.userService.getProfile(userId)
  }

  @Mutation(()=>User)
  @UseGuards(JwtAuthGuard)
  updateProfile(@Context() context,updateUserInput:UpdateUserInput){
    const userId:string=context.req.user.id
    return this.userService.updateProfile(userId,updateUserInput)

  }
  @Mutation(()=>User)
  @UseGuards(JwtAuthGuard)
  updateAddress(@Context() context,@Args('updateUserAddressInput') updateUserAddressInput:UpdateUserAddressInput){
    const userId:string=context.req.user.id
    return this.userService.updateAddress(userId,updateUserAddressInput)

  }
  @Mutation(()=>User)
  @UseGuards(JwtAuthGuard)
  removeUser(@Context() context){
    const userId:string=context.req.user.id
    return this.userService.removeUser(userId)

  }
  @Mutation(()=>User)
  @UseGuards(JwtAuthGuard)
  deleteAddress(@Context() context,@Args('addressId' ) addressId:string
  ){
    const userId:string=context.req.user.id
    return this.userService.deleteAddress(addressId)

  }

  
}