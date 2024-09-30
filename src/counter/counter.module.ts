import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Counter, CounterSchema } from '../schemas/counter.schema';
import { CounterService } from './counter.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Counter.name, schema: CounterSchema }])
  ],
  providers: [CounterService],
  exports: [CounterService]  // Make sure to export the service for use in other modules
})
export class CounterModule {}