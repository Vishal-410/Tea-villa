import { Module} from '@nestjs/common';

import { UserModule } from './user/user.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { join } from 'path';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { ContactusModule } from './contactus/contactus.module';
import { HomeModule } from './home/home.module';
import { UploadModule } from './upload/upload.module';
import { ProductModule } from './product/product.module';
import { CartModule } from './cart/cart.module';
import { BlogModule } from './blog/blog.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { CoupounModule } from './coupoun/coupoun.module';
import { PaymentModule } from './payment/payment.module';
import { RatingModule } from './rating/rating.module';
@Module({
  imports: [
    // ServeStaticModule.forRoot({
    //   rootPath: join(__dirname, '..', 'public'), // 'public' folder me aap apne HTML files rakhenge
    // }),
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      context: ({ req }) => ({ req }), // 👈 जरूरी है
      uploads: false,
    }),

    UserModule,
    AuthModule,
    ContactusModule,
    HomeModule,
    UploadModule,
    ProductModule,
    CartModule,
    BlogModule,
    WishlistModule,
    CoupounModule,
    PaymentModule,
    RatingModule,
  ],
  providers: [ PrismaService],
})
export class AppModule {}
