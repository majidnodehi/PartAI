import { Logger } from '@nestjs/common';
import { MetricName } from '../domain/metric-name';
import type { EventCache, EventStore } from '../domain/event-store.interface';
import type { MatchStore } from '../domain/match-store.interface';
import type { RuleMatcher } from '../domain/rule-matcher.interface';
import { RuleOperator } from '../domain/rule-operator';
import type { CompiledRule } from '../domain/rule.interface';
import type { NewRuleMatch } from '../domain/rule-match.interface';
import type { StoredEvent } from '../domain/telemetry-event.interface';
import { EventIngestHandler } from './event-ingest.handler';
import { RuleEvaluationHandler } from '../rules/rule-evaluation.handler';

describe('EventIngestHandler', () => {
  it('stores the event and the matching rule with the agent id', async () => {
    const saved: StoredEvent[] = [];
    const cached: StoredEvent[] = [];
    const matches: NewRuleMatch[] = [];
    const rule: CompiledRule = {
      id: 'rule-1',
      title: 'Hot',
      metric: MetricName.Temperature,
      operator: RuleOperator.GreaterThan,
      value: 80,
      valueTo: null,
      test: (value) => value > 80,
    };
    const events: EventStore = {
      save: (event) => {
        saved.push(event);
        return Promise.resolve();
      },
    };
    const cache: EventCache = {
      append: (event) => {
        cached.push(event);
        return Promise.resolve();
      },
    };
    const matcher: RuleMatcher = {
      match: () => [rule],
    };
    const matchStore: MatchStore = {
      saveAll: (items) => {
        matches.push(...items);
        return Promise.resolve();
      },
    };
    const handler = new EventIngestHandler(
      events,
      cache,
      new RuleEvaluationHandler(matcher, matchStore),
    );

    await handler.handle({ name: MetricName.Temperature, value: 91 }, 'k7m2qx');

    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({
      agentInstanceId: 'k7m2qx',
      name: MetricName.Temperature,
      value: 91,
    });
    expect(cached).toEqual(saved);
    expect(matches).toHaveLength(1);
    expect(matches[0]).toMatchObject({
      agentInstanceId: 'k7m2qx',
      ruleId: 'rule-1',
      rule: { id: 'rule-1', operator: RuleOperator.GreaterThan, value: 80 },
      event: saved[0],
    });
  });

  it('keeps the event when the redis write fails', async () => {
    const saved: StoredEvent[] = [];
    const events: EventStore = {
      save: (event) => {
        saved.push(event);
        return Promise.resolve();
      },
    };
    const cache: EventCache = {
      append: () => Promise.reject(new Error('redis down')),
    };
    const matcher: RuleMatcher = { match: () => [] };
    const matchStore: MatchStore = { saveAll: () => Promise.resolve() };
    const handler = new EventIngestHandler(
      events,
      cache,
      new RuleEvaluationHandler(matcher, matchStore),
    );
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);

    await handler.handle({ name: MetricName.Noise, value: 40 }, 'k7m2qx');

    expect(saved).toHaveLength(1);
  });
});
