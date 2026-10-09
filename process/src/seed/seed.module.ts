import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_CONFIG } from '../config/app-config.interface';
import type { AppConfig } from '../config/app-config.interface';
import { AppConfigModule } from '../config/app-config.module';
import { RuleSeederService } from '../rules/rule-seeder.service';
import { RuleEntity, RuleSchema } from '../rules/schemas/rule.schema';

@Module({
  imports: [
    AppConfigModule,
    MongooseModule.forRootAsync({
      inject: [APP_CONFIG],
      useFactory: (config: AppConfig) => ({ uri: config.mongoUri }),
    }),
    MongooseModule.forFeature([{ name: RuleEntity.name, schema: RuleSchema }]),
  ],
  providers: [RuleSeederService],
})
export class SeedModule {}
