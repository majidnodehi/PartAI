/**
 * اجرای جدا برای قانون‌های نمونه.
 * سرویس را بالا نمی‌آورد و به سرویس عامل وصل نمی‌شود.
 * هنگام اجرای عادی هم، اگر عنوان قانون نمونه نباشد، همان قانون‌ها ساخته می‌شوند.
 */
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { RuleSeederService } from '../rules/rule-seeder.service';
import { SeedModule } from './seed.module';

async function seed(): Promise<void> {
  const app = await NestFactory.createApplicationContext(SeedModule);
  try {
    const inserted = await app.get(RuleSeederService).seed();
    Logger.log(
      inserted === 0
        ? 'Sample rules are already present'
        : `Inserted ${inserted} rules`,
      'RuleSeeder',
    );
  } finally {
    await app.close();
  }
}

void seed().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Rule seed failed';
  console.error(message);
  process.exit(1);
});
