# Dry Dock V1

Dry Dock is a static prototype for a quantum-assisted manufacturing optimization company focused on production scheduling for low-volume, high-mix, high-constraint manufacturing.

## What this prototype includes

- A startup/product landing page that positions Dry Dock as an industrial decision intelligence platform
- A planning console with sample factory inputs and solver stack
- A scenario simulator for:
  - baseline production planning
  - rush order insertion
  - machine outage recovery
  - material delay resequencing
- KPI cards, exception alerts, resource views, and planner narrative output

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
- Add a real optimization service behind the scenario engine
- Introduce authentication and pilot-customer workspaces
- Add ERP/MES connector surfaces and persistent scenario history
