# Dry Dock V1

Dry Dock is a static prototype for a manufacturing operations dashboard focused on live MES/ERP line visibility and deterministic schedule optimization for low-volume, high-mix, high-constraint manufacturing.

## What this prototype includes

- A startup/product landing page that positions Dry Dock as an industrial decision intelligence platform
- A live operations dashboard that merges MES and ERP data through a polling adapter
- A deterministic optimizer that ranks bottlenecks, highlights inventory risk, and explains the next best action
- A line builder for process modeling, sourcing, and goal analysis
- KPI cards, recommendations, ERP constraints, and live step analysis output

## Run locally

From this directory:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Prototype framing

This V1 is intentionally dependency-free so it can run in a clean environment without Node or package installation. It is structured as a front-end concept prototype rather than a production application.

## Suggested next steps

- Add CSV upload and parsing for jobs, machines, and labor constraints
- Add a backend MES/ERP bridge with WebSocket or SSE delivery
- Introduce authentication and pilot-customer workspaces
- Add persistent live feed history and audit logs
