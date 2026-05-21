import { Module } from '@nestjs/common';
import { FuelModule } from './fuel/fuel.module';

@Module({
  imports: [
    // ... alte module existente
    FuelModule,
  ],
})
export class AppModule {}
