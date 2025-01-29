import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: ':memory:',
      entities: [`${__dirname}/entity/**/*.entity.{t,j}s`],
      autoLoadEntities: true,
      synchronize: true,
      // logging: true,
    }),
  ],
})
export class TestTypeormModule {}
