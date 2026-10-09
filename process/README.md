# Process

NestJS service that subscribes to the agent WebSocket, stores every event, and evaluates rules.

MongoDB keeps every event, every rule, and every match. Redis keeps a bounded event stream and the active rule set so checks do not read the database per event. The in-memory rule index is grouped by metric and is replaced whenever a rule is created, updated, or deleted.

## Run

From the repository root, the full stack starts the agent, the process service, MongoDB, and Redis:

```bash
docker compose up --build
```

The agent is published on port 3000 and the process service on port 3001. Sample rules are inserted when the process service starts.

To run only this service on the host, install dependencies and start it while MongoDB and Redis are already listening:

```bash
npm install
npm run start:dev
```

The agent should already be publishing on `http://127.0.0.1:3000`.

Starting the service inserts any missing sample rules, then loads the enabled ones into memory. A rule that is already stored is left unchanged, including after it has been edited. `npm run build` and `npm run seed` load the same rules without starting the subscriber.

Interactive documentation is at `http://localhost:3001/api/docs`. Every route, field, and error response is described there.

## Rules

`POST /api/rules`

```json
{
  "title": "High temperature",
  "metric": "temperature",
  "operator": "gt",
  "value": 80
}
```

Operators are `gt`, `gte`, `lt`, `lte`, `eq`, and `between`. A `between` rule also needs `valueTo`, and the range is inclusive.

- `GET /api/rules?page=1&limit=20&metric=temperature&enabled=true`
- `GET /api/rules/:id`
- `PATCH /api/rules/:id`
- `DELETE /api/rules/:id`

## Stored data

- `GET /api/events` — every event received from the agent
- `GET /api/matches` — agent instance id, rule snapshot, and event when a rule matched
- `GET /api/status` — subscription state and the active rule count
