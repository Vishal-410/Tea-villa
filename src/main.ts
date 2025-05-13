import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*', // allow from anywhere
    credentials: true, // allow cookies if needed (optional)
  });
  // app.use(cors())

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
