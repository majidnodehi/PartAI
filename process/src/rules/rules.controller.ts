import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import type { Page } from '../domain/page.interface';
import type { RuleDefinition } from '../domain/rule.interface';
import { CreateRuleDto } from './dto/create-rule.dto';
import { RuleQueryDto } from './dto/rule-query.dto';
import { UpdateRuleDto } from './dto/update-rule.dto';
import { ruleApi, RulesTag } from './rules.docs';
import { RulesService } from './rules.service';

/**
 * رابط قانون.
 * ساخت، فهرست، دیدن یکی، تغییر و حذف از اینجا انجام می‌شود.
 * هر تغییر بلافاصله فهرست حافظه را تازه می‌کند تا بررسی رویداد قانون جدید را ببیند.
 */
@RulesTag
@Controller('rules')
export class RulesController {
  constructor(private readonly rules: RulesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ruleApi.create
  create(@Body() dto: CreateRuleDto): Promise<RuleDefinition> {
    return this.rules.create(dto);
  }

  @Get()
  @ruleApi.list
  list(@Query() query: RuleQueryDto): Promise<Page<RuleDefinition>> {
    return this.rules.list(query);
  }

  @Get(':id')
  @ruleApi.findOne
  findOne(@Param('id') id: string): Promise<RuleDefinition> {
    return this.rules.findOne(id);
  }

  @Patch(':id')
  @ruleApi.update
  update(
    @Param('id') id: string,
    @Body() dto: UpdateRuleDto,
  ): Promise<RuleDefinition> {
    return this.rules.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ruleApi.remove
  remove(@Param('id') id: string): Promise<void> {
    return this.rules.remove(id);
  }
}
