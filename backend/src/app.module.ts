import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/index.js';

@Module({
  imports: [
    // ConfigModule loads environment variables from .env file
    // isGlobal: true makes ConfigService available everywhere
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // PrismaModule is @Global() so it's available everywhere
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
