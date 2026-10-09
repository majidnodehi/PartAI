import type { RuleSnapshot } from './rule.interface';
import type { StoredEvent } from './telemetry-event.interface';

export interface RuleMatchRecord {
  readonly id: string;
  readonly agentInstanceId: string;
  readonly ruleId: string;
  readonly rule: RuleSnapshot;
  readonly event: StoredEvent;
  readonly matchedAt: Date;
}

export interface NewRuleMatch {
  readonly agentInstanceId: string;
  readonly ruleId: string;
  readonly rule: RuleSnapshot;
  readonly event: StoredEvent;
  readonly matchedAt: Date;
}
