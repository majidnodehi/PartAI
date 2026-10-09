import type { NewRuleMatch } from './rule-match.interface';

export interface MatchStore {
  saveAll(matches: readonly NewRuleMatch[]): Promise<void>;
}

export const MATCH_STORE = Symbol('MATCH_STORE');
