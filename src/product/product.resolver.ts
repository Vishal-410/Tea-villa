import { Resolver, Query, Mutation, Args, Int, Float } from '@nestjs/graphql';
import { ProductService } from './product.service';
import { CreateProductInput } from './dto/create-product.input';
import { Product } from './entities/product.entity';
import { ProductPaginationResponse } from './entities/product-pagination.response';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { UseGuards } from '@nestjs/common';
import { Roles } from 'src/auth/roles.decorator';

@Resolver(() => Product)
export class ProductResolver {
  constructor(private readonly productService: ProductService) {}

  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles("ADMIN")
  @Mutation(() => Product)
  createProduct(
    @Args('createProductInput') createProductInput: CreateProductInput,
  ) {
    return this.productService.create(createProductInput);
  }

  @Query(() => ProductPaginationResponse, { name: 'products' })
  findAll(
    @Args('pageNumber', { type: () => Float }) pageNumber: number,
    @Args('pageSize', { type: () => Float, defaultValue: 5 }) pageSize: number,
  ) {
    return this.productService.findAll(pageNumber, pageSize);
  }

  @Query(() => Product, { name: 'product' })
  findOne(@Args('id') id: string) {
    return this.productService.findOne(id);
  }
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles("ADMIN")
  @Mutation(() => Product, { name: 'product' })
  deleteOne(@Args('id') id: string) {
    return this.productService.deleteOne(id);
  }
}
