import { BadRequestException } from '@nestjs/common';
import { isMetricName, METRIC_NAMES } from '../domain/metric-name';

export function parseMetricNamesQuery(
  names: string | undefined,
): ReadonlySet<string> | null {
  if (names === undefined || names.trim() === '') {
    return null;
  }
  const parts = names
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
  if (parts.length === 0) {
    return null;
  }
  const unique = new Set<string>();
  for (const name of parts) {
    if (!isMetricName(name)) {
      throw new BadRequestException(
        `Invalid metric name "${name}". Use one of: ${METRIC_NAMES.join(', ')}.`,
      );
    }
    unique.add(name);
  }
  return unique;
}
