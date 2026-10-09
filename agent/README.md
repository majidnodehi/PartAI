# Agent

NestJS service that publishes live telemetry. Each event has two fields, `name` and `value`. Subscriber services connect over WebSocket or HTTP and apply their own rules to those names.

This process is one running instance. Its short id is `AGENT_INSTANCE_ID` in `.env` (this copy uses `k7m2qx`). The id is logged at startup, returned by diagnostics, and sent on the `X-Agent-Instance-Id` response header.

## Run

From the repository root, the full stack starts this service together with the process service, MongoDB, and Redis:

```bash
docker compose up --build
```

To run only this service on the host:

```bash
npm install
npm run start:dev
```

`EVENT_COUNT` is how many events to publish, and `INTERVAL_SECONDS` is how many seconds that takes. The default is 5 events every 1 second.

Generated names come from the `MetricName` enum: `speed`, `temperature`, `voltage`, `noise`, `pressure`, `humidity`, `current`, and `vibration`. `METRIC_DEFS` can override a numeric range for one of those names. Thresholds and alerts are not evaluated here.

## HTTP

- `GET /api/diagnostics` — instance id, uptime, publish counters, and metric names
- `POST /api/events` — body `{ "name": "voltage", "value": 12.5 }`
- `GET /api/events?limit=100&names=temperature,voltage` — recent events
- `GET /api/events/stream?names=temperature,voltage` — server-sent events

Stream frames look like:

```text
data: {"name":"temperature","value":21.54}
```

## WebSocket

Connect to `ws://localhost:3000/events`. Each text frame is one event:

```json
{"name":"noise","value":63.4}
```

Send a filter to receive only the metrics a subscriber has rules for:

```json
{"names":["temperature","voltage"]}
```

An empty `names` list selects every metric again.
