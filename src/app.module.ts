import { UsersModule } from "./modules/users/users.module";
import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RolesModule } from "./modules/roles/roles.module";
import { ProductsModule } from "./modules/products/products.module";
import { ProductItemOptionsModule } from "./modules/product.item.options/product.item.options.module";
import { ProductItemsModule } from "./modules/product.items/product.items.module";
import { OrdersModule } from "./modules/orders/orders.module";
import { OrderDetailModule } from "./modules/order.detail/order.detail.module";
import { NewsModule } from "./modules/news/news.module";
import { ImagesModule } from "./modules/images/images.module";
import { EventsModule } from "./modules/events/events.module";
import { AuthModule } from "./auth/auth.module";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { JwtAuthGuard } from "./auth/passport/jwt-auth.guard";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
import { MailerModule } from "@nestjs-modules/mailer";
import { join } from "path";
import { TransformInterceptor } from "./core/transform.interceptor";
import { SpeciesModule } from "./modules/species/species.module";
import { EnclosuresModule } from "./modules/enclosures/enclosures.module";
import { EmployeesModule } from "./modules/employees/employees.module";

@Module({
  imports: [
    UsersModule,
    RolesModule,
    ProductsModule,
    ProductItemOptionsModule,
    ProductItemsModule,
    OrdersModule,
    OrderDetailModule,
    NewsModule,
    ImagesModule,
    EventsModule,
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ".env" }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: "mysql",
        host: configService.get("HOST"),
        port: +configService.get("PORT"),
        username: configService.get("USER"),
        password: configService.get("PASS"),
        database: configService.get("DATABASE"),
        entities: [__dirname + "/**/entities/*.entity{.ts,.js}"],
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
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          ignoreTLS: true,
          auth: {
            user: configService.get("MAIL_USER"),
            pass: configService.get("MAIL_PASS"),
          },
        },
        defaults: {
          from: '"No Reply" <no-reply@localhost>',
        },
        // preview: true,
        template: {
          dir: join(__dirname, "/mail/templates"),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    SpeciesModule,
    EnclosuresModule,
    EmployeesModule,
  ],

  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
