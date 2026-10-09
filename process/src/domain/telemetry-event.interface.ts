import type { MetricName } from './metric-name';

export interface AgentEvent {
  readonly name: MetricName;
  readonly value: number;
}

export interface StoredEvent extends AgentEvent {
  readonly id: string;
  readonly agentInstanceId: string;
  readonly receivedAt: Date;
}
