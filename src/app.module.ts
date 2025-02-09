import { UsersModule } from './users/users.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesModule } from './roles/roles.module';
import { AnimalsModule } from './animals/animals.module';
import { ProductsModule } from './products/products.module';
import { ProductItemOptionsModule } from './product.item.options/product.item.options.module';
import { ProductItemsModule } from './product.items/product.items.module';
import { OrdersModule } from './orders/orders.module';
import { OrderDetailModule } from './order.detail/order.detail.module';
import { NewsModule } from './news/news.module';
import { ImagesModule } from './images/images.module';
import { TicketsModule } from './tickets/tickets.module';
import { EventsModule } from './events/events.module';
import 'dotenv/config';
import * as dotenv from 'dotenv';
dotenv.config({ path: __dirname + '/.env' });

@Module({
  imports: [
    UsersModule,
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('HOST'),
        port: +configService.get('PORT'),
        username: configService.get('USER'),
        password: configService.get('PASS'),
        database: configService.get('DATABASE'),
        entities: [__dirname + '/**/entities/*.entity{.ts,.js}'],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    RolesModule,
    AnimalsModule,
    ProductsModule,
    ProductItemOptionsModule,
    ProductItemsModule,
    OrdersModule,
    OrderDetailModule,
    NewsModule,
    ImagesModule,
    TicketsModule,
    EventsModule,
  ],

  controllers: [AppController, UsersController],
  providers: [AppService, UsersService],
})
export class AppModule {}
