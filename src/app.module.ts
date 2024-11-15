import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf'; 
import { BotService } from './bot';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { session } from 'telegraf';
import { botConfig } from './config/bot.config';
import { appConfig } from './config';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig,botConfig],
    }),
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        token: config.get<string>('bot.token'),
        middlewares: [session()],
      }),
    }),
  ],
  providers: [BotService],
})
export class AppModule {}
