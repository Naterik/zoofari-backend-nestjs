import { UsersModule } from './users/users.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
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
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/passport/jwt-auth.guard';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';

@Module({
  imports: [
    UsersModule,
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
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
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
        dropSchema: false,
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          ignoreTLS: true,
          auth: {
            user: configService.get('MAIL_USER'),
            pass: configService.get('MAIL_PASS'),
          },
        },
        defaults: {
          from: '"No Reply" <no-reply@localhost>',
        },
        // preview: true,
        template: {
          dir: join(__dirname, '/mail/templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
  ],

  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
