// src/user/user.resolver.ts
import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { UserService } from './user.service';
import { CreateUserAddressInput, CreateUserInput } from './dto/create-user.input';
import { UpdateUserAddressInput, UpdateUserInput } from './dto/update-user.input';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Req, UseGuards } from '@nestjs/common';
import { User as PrismaUser, Role } from 'generated/prisma';
import { User } from './entities/user.entity';
import { PrismaService } from 'src/prisma.service';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';

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
  changeUserPassword(@Context() context,
  @Args('oldPassword') oldPassword:string,@Args('newPassword') newPassword:string,@Args('confirmNewPassword') confirmNewPassword:string
  ){
    const userId=context.req.user.id;

    return this.userService.changePassword(userId,oldPassword,newPassword,confirmNewPassword)
  }

  @UseGuards(JwtAuthGuard)
  @Query(()=>User)
  getUserProfile(@Context() context){
    const userId:string=context.req.user.id
    return this.userService.getProfile(userId)
  }

  @Mutation(()=>User)
  @UseGuards(JwtAuthGuard)
  updateUserProfile(@Context() context,updateUserInput:UpdateUserInput){
    const userId:string=context.req.user.id
    return this.userService.updateProfile(userId,updateUserInput)

  }
  @Mutation(()=>User)
  @UseGuards(JwtAuthGuard)
  updateUserAddress(@Context() context,@Args('updateUserAddressInput') updateUserAddressInput:UpdateUserAddressInput){
    const userId:string=context.req.user.id
    return this.userService.updateAddress(userId,updateUserAddressInput)

  }
  @Mutation(()=>User)
  @UseGuards(JwtAuthGuard)
  addUserAddress(@Context() context,@Args('updateUserAddressInput') createUserAddressInput:CreateUserAddressInput){
    const userId:string=context.req.user.id
    return this.userService.addAddress(userId,createUserAddressInput)
  }
  @Mutation(()=>User)
  @UseGuards(JwtAuthGuard)
  makeDefaultAddress(@Context() context,@Args('addressFieldId') addressFieldId:string){
    const userId:string=context.req.user.id
    return this.userService.makeDefaultAddress(userId,addressFieldId)
  }

  @Mutation(()=>User)
  @UseGuards(JwtAuthGuard)
  removeUser(@Context() context){
    const userId:string=context.req.user.id
    return this.userService.removeUser(userId)

  }
  @Mutation(()=>User)
  @UseGuards(JwtAuthGuard)
  deleteUserAddress(@Context() context,@Args('addressId' ) addressId:string
  ){
    const userId:string=context.req.user.id
    return this.userService.deleteAddress(addressId)

  }

  
}