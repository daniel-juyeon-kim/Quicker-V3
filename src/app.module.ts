import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath:
        process.env.NODE_ENV === 'production' ? '.env' : ['.env', '.env.local'],
      isGlobal: true,
      load: [],
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
