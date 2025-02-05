import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: ':memory:',
      entities: [
        join(__dirname, '/../../src/database/type-orm/entity/*.entity.{t,j}s'),
      ],
      autoLoadEntities: true,
      synchronize: true,
      logging: true,
    }),
  ],
})
export class TestTypeormModule {}
