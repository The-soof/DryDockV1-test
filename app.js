const scenarios = [
  {
    id: "baseline",
    name: "Baseline production plan",
    summary: "Balanced flow across layup, CNC, and final assembly with no major disruptions.",
    solverMode: "Classical baseline + hybrid assist",
    metrics: {
      onTime: "92%",
      onTimeDelta: "+4 pts vs manual baseline",
      utilization: "78%",
      utilizationDelta: "+9 pts on constrained cells",
      reschedule: "12 min",
      rescheduleDelta: "41% faster than current workflow",
      risk: "Moderate",
      riskDelta: "Composite layup remains the pacing resource"
    },
    narrative:
      "Dry Dock sequences high-priority defense jobs through composite layup first, then protects CNC throughput by front-loading material-ready work. The hybrid layer only activates on the most conflict-heavy machine and tooling clusters, keeping the schedule credible while improving slack on downstream assembly.",
    alerts: [
      {
        level: "info",
        title: "Priority jobs protected",
        body: "All P1 flight-critical jobs maintain on-time completion with 6.2 hours of schedule slack."
      },
      {
        level: "warning",
        title: "Layup cell near saturation",
        body: "Cell C2 is projected at 91% utilization. A 2-hour delay would affect two downstream jobs."
      },
      {
        level: "info",
        title: "Tooling conflict resolved",
        body: "Autoclave fixture AF-4 was reassigned to Job J-104 overnight to eliminate an assembly stall."
      }
    ],
    schedule: [
      ["J-101", "Wing bracket / Program Atlas", "P1", "Composite Layup C2", "06:00", "10:30", "On track"],
      ["J-104", "Radar frame / Program Sentinel", "P1", "CNC Cell M3", "07:00", "12:15", "On track"],
      ["J-112", "Bulkhead panel / Program Harbor", "P2", "Autoclave A1", "10:45", "15:30", "Watch"],
      ["J-118", "Sensor housing / Program Atlas", "P2", "Assembly Bay F1", "13:00", "16:45", "On track"],
      ["J-121", "Control mount / Program Falcon", "P3", "Inspection Q2", "15:00", "17:30", "Watch"]
    ],
    resources: [
      {
        name: "Composite Layup C2",
        detail: "Highest-value constraint cluster with certified labor and fragile material handling.",
        tags: ["91% utilization", "2 certified operators", "Tool set AF-4"]
      },
      {
        name: "CNC Cell M3",
        detail: "Protected for titanium jobs requiring traceability and precision fixturing.",
        tags: ["78% utilization", "Maintenance clear", "Night shift available"]
      },
      {
        name: "Assembly Bay F1",
        detail: "Downstream pacing point once autoclave queue is stabilized.",
        tags: ["66% utilization", "Cross-trained crew", "Low tooling risk"]
      }
    ]
  },
  {
    id: "rush-order",
    name: "Rush order inserted",
    summary: "A priority defense order lands mid-cycle and must be absorbed without breaking existing commitments.",
    solverMode: "Hybrid assist engaged on priority routing",
    metrics: {
      onTime: "89%",
      onTimeDelta: "+2 pts vs manual baseline",
      utilization: "84%",
      utilizationDelta: "+13 pts on constrained cells",
      reschedule: "9 min",
      rescheduleDelta: "54% faster than current workflow",
      risk: "Elevated",
      riskDelta: "Assembly labor becomes the next likely constraint"
    },
    narrative:
      "The decision engine inserted the rush order by moving one lower-priority panel into the evening shift, preserving all P1 due dates while increasing assembly load. Quantum-assisted search was used on the highest-conflict routing choices because standard heuristics produced two tooling deadlocks.",
    alerts: [
      {
        level: "critical",
        title: "Rush order accepted",
        body: "Job J-130 was inserted with no P1 deadline misses, but one P3 order moves to the next shift."
      },
      {
        level: "warning",
        title: "Assembly overtime suggested",
        body: "Adding a 3-person swing crew for 4 hours restores full on-time delivery across all tiers."
      },
      {
        level: "info",
        title: "Material gate cleared",
        body: "Priority carbon inventory was reserved automatically to prevent a layup hold."
      }
    ],
    schedule: [
      ["J-130", "Emergency bracket / Program Vanguard", "P1", "Composite Layup C2", "08:00", "11:00", "On track"],
      ["J-101", "Wing bracket / Program Atlas", "P1", "CNC Cell M3", "11:30", "15:45", "On track"],
      ["J-104", "Radar frame / Program Sentinel", "P1", "Assembly Bay F1", "12:00", "17:15", "On track"],
      ["J-112", "Bulkhead panel / Program Harbor", "P2", "Autoclave A1", "15:30", "20:15", "Watch"],
      ["J-121", "Control mount / Program Falcon", "P3", "Inspection Q2", "18:15", "20:30", "Risk"]
    ],
    resources: [
      {
        name: "Composite Layup C2",
        detail: "Reordered to accommodate the emergency bracket before lower-priority work enters cure.",
        tags: ["96% utilization", "Priority queue active", "No spare fixture capacity"]
      },
      {
        name: "Assembly Bay F1",
        detail: "Now the likely pacing resource because two P1 jobs converge in the same window.",
        tags: ["88% utilization", "Overtime recommended", "Cross-train option available"]
      },
      {
        name: "Inspection Q2",
        detail: "Low direct risk, but downstream overflow can push inspection into overtime.",
        tags: ["71% utilization", "Traceability intact", "Shift extension optional"]
      }
    ]
  },
  {
    id: "machine-down",
    name: "Machine M3 outage",
    summary: "A critical CNC cell fails for 8 hours, forcing rerouting and protection of top-priority work.",
    solverMode: "Hybrid assist on rerouting and slack preservation",
    metrics: {
      onTime: "86%",
      onTimeDelta: "+5 pts vs manual recovery",
      utilization: "73%",
      utilizationDelta: "+7 pts on backup resources",
      reschedule: "7 min",
      rescheduleDelta: "62% faster than current workflow",
      risk: "High",
      riskDelta: "Titanium routing is the dominant bottleneck"
    },
    narrative:
      "When M3 goes down, Dry Dock reroutes one titanium job to a slower backup cell and protects the highest-priority radar frame by shifting lower-priority work into inspection slack. The engine explicitly preserves traceability requirements and flags the cost of every fallback choice.",
    alerts: [
      {
        level: "critical",
        title: "CNC outage detected",
        body: "M3 is unavailable for 8 hours. Backup route to M5 adds 55 minutes of cycle time to one P2 job."
      },
      {
        level: "warning",
        title: "Priority sequence preserved",
        body: "All P1 jobs remain on time, but two P2 jobs lose buffer and require closer release control."
      },
      {
        level: "info",
        title: "Maintenance impact quantified",
        body: "The recovery plan costs 3.4 machine-hours less than the current manual playbook."
      }
    ],
    schedule: [
      ["J-104", "Radar frame / Program Sentinel", "P1", "Backup CNC Cell M5", "07:00", "13:10", "On track"],
      ["J-101", "Wing bracket / Program Atlas", "P1", "Composite Layup C2", "06:00", "10:30", "On track"],
      ["J-118", "Sensor housing / Program Atlas", "P2", "Assembly Bay F1", "11:00", "14:45", "Watch"],
      ["J-112", "Bulkhead panel / Program Harbor", "P2", "Autoclave A1", "12:30", "17:45", "Risk"],
      ["J-121", "Control mount / Program Falcon", "P3", "Inspection Q2", "16:00", "18:15", "Watch"]
    ],
    resources: [
      {
        name: "Backup CNC Cell M5",
        detail: "Activated as the recovery route for traceable titanium work with a slower cycle profile.",
        tags: ["82% utilization", "Qualified for titanium", "Longer setup time"]
      },
      {
        name: "Composite Layup C2",
        detail: "Stable, but now carries more schedule protection burden for downstream recovery.",
        tags: ["87% utilization", "Buffer preserved", "Material-ready queue"]
      },
      {
        name: "Autoclave A1",
        detail: "Absorbs downstream compression after rerouting and should be monitored for lateness spillover.",
        tags: ["79% utilization", "No maintenance window", "Queue sensitivity high"]
      }
    ]
  },
  {
    id: "material-delay",
    name: "Material shortage",
    summary: "Carbon stock for one high-priority part is delayed, and the engine must resequence without starving the line.",
    solverMode: "Classical baseline + predictive material gate",
    metrics: {
      onTime: "90%",
      onTimeDelta: "+3 pts vs manual baseline",
      utilization: "76%",
      utilizationDelta: "+8 pts on downstream cells",
      reschedule: "11 min",
      rescheduleDelta: "39% faster than current workflow",
      risk: "Moderate",
      riskDelta: "Material readiness is the dominant limiter"
    },
    narrative:
      "The system detects the delayed material gate early and fills the gap with material-ready work instead of letting composite layup sit idle. This keeps utilization healthy while surfacing the exact cost of the delay to planners and program managers.",
    alerts: [
      {
        level: "warning",
        title: "Material delay detected",
        body: "Job J-101 cannot release at 06:00. Carbon roll CR-88 is now expected 3.5 hours late."
      },
      {
        level: "info",
        title: "Idle time avoided",
        body: "Job J-118 was pulled forward to protect layup and assembly utilization during the delay window."
      },
      {
        level: "warning",
        title: "Program impact visible",
        body: "If the material slip exceeds 5 hours, Atlas due-date risk rises from low to medium."
      }
    ],
    schedule: [
      ["J-118", "Sensor housing / Program Atlas", "P2", "Composite Layup C2", "06:15", "09:45", "On track"],
      ["J-104", "Radar frame / Program Sentinel", "P1", "CNC Cell M3", "07:00", "12:15", "On track"],
      ["J-101", "Wing bracket / Program Atlas", "P1", "Composite Layup C2", "10:00", "14:30", "Watch"],
      ["J-112", "Bulkhead panel / Program Harbor", "P2", "Autoclave A1", "14:45", "19:20", "On track"],
      ["J-121", "Control mount / Program Falcon", "P3", "Inspection Q2", "16:00", "18:15", "Watch"]
    ],
    resources: [
      {
        name: "Material Gate",
        detail: "Tracks release readiness across carbon stock, adhesives, and serialized tooling packs.",
        tags: ["3.5 hour delay", "Atlas affected", "Auto resequencing active"]
      },
      {
        name: "Composite Layup C2",
        detail: "Protected from idle time by pulling forward a material-ready sensor housing job.",
        tags: ["74% utilization", "Stable labor coverage", "Queue rebalanced"]
      },
      {
        name: "CNC Cell M3",
        detail: "Unaffected directly, but remains key to preserving downstream schedule confidence.",
        tags: ["78% utilization", "No tooling conflict", "Traceability clean"]
      }
    ]
  }
];

const inputChips = [
  "Jobs / orders",
  "Operations",
  "Machines / work cells",
  "Labor skills & shifts",
  "Material readiness",
  "Tooling constraints",
  "Quality holds",
  "Traceability rules"
];

const scenarioList = document.getElementById("scenarioList");
const inputChipsEl = document.getElementById("inputChips");
const scenarioName = document.getElementById("scenarioName");
const solverMode = document.getElementById("solverMode");
const narrative = document.getElementById("narrative");
const scheduleTableBody = document.getElementById("scheduleTableBody");
const alertList = document.getElementById("alertList");
const resourceList = document.getElementById("resourceList");

const metricEls = {
  onTime: document.getElementById("metricOnTime"),
  onTimeDelta: document.getElementById("metricOnTimeDelta"),
  utilization: document.getElementById("metricUtilization"),
  utilizationDelta: document.getElementById("metricUtilizationDelta"),
  reschedule: document.getElementById("metricReschedule"),
  rescheduleDelta: document.getElementById("metricRescheduleDelta"),
  risk: document.getElementById("metricRisk"),
  riskDelta: document.getElementById("metricRiskDelta")
};

function renderInputs() {
  inputChipsEl.innerHTML = inputChips
    .map((chip) => `<div class="chip">${chip}</div>`)
    .join("");
}

function renderScenarios(activeId) {
  scenarioList.innerHTML = scenarios
    .map(
      (scenario) => `
        <button class="scenario-button ${scenario.id === activeId ? "active" : ""}" data-scenario-id="${scenario.id}">
          <strong>${scenario.name}</strong>
          <p>${scenario.summary}</p>
        </button>
      `
    )
    .join("");
}

function statusClass(status) {
  if (status === "Risk") {
    return "status-risk";
  }

  if (status === "Watch") {
    return "status-watch";
  }

  return "status-ok";
}

function renderScenario(activeId) {
  const scenario = scenarios.find((item) => item.id === activeId) || scenarios[0];

  scenarioName.textContent = scenario.name;
  solverMode.textContent = scenario.solverMode;
  narrative.textContent = scenario.narrative;

  metricEls.onTime.textContent = scenario.metrics.onTime;
  metricEls.onTimeDelta.textContent = scenario.metrics.onTimeDelta;
  metricEls.utilization.textContent = scenario.metrics.utilization;
  metricEls.utilizationDelta.textContent = scenario.metrics.utilizationDelta;
  metricEls.reschedule.textContent = scenario.metrics.reschedule;
  metricEls.rescheduleDelta.textContent = scenario.metrics.rescheduleDelta;
  metricEls.risk.textContent = scenario.metrics.risk;
  metricEls.riskDelta.textContent = scenario.metrics.riskDelta;

  scheduleTableBody.innerHTML = scenario.schedule
    .map(
      ([job, part, priority, cell, start, end, status]) => `
        <tr>
          <td>${job}</td>
          <td>${part}</td>
          <td>${priority}</td>
          <td>${cell}</td>
          <td>${start}</td>
          <td>${end}</td>
          <td class="${statusClass(status)}">${status}</td>
        </tr>
      `
    )
    .join("");

  alertList.innerHTML = scenario.alerts
    .map(
      (alert) => `
        <article class="alert-card" data-level="${alert.level}">
          <strong>${alert.title}</strong>
          <p>${alert.body}</p>
        </article>
      `
    )
    .join("");

  resourceList.innerHTML = scenario.resources
    .map(
      (resource) => `
        <article class="resource-card">
          <strong>${resource.name}</strong>
          <p>${resource.detail}</p>
          <div class="resource-meta">
            ${resource.tags.map((tag) => `<span>${tag}</span>`).join("")}
          </div>
        </article>
      `
    )
    .join("");

  renderScenarios(scenario.id);
}

scenarioList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-scenario-id]");

  if (!button) {
    return;
  }

  renderScenario(button.dataset.scenarioId);
});

renderInputs();
renderScenario("baseline");
