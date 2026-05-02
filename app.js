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

const processSteps = [
  {
    id: "step-layup",
    name: "Composite Layup",
    cycleTime: 18,
    machines: 2,
    shiftHours: 8,
    scrapRate: 4,
    materialSource: "purchased"
  },
  {
    id: "step-cnc",
    name: "CNC Machining",
    cycleTime: 12,
    machines: 1,
    shiftHours: 8,
    scrapRate: 2,
    materialSource: "in-house"
  },
  {
    id: "step-assembly",
    name: "Final Assembly",
    cycleTime: 9,
    machines: 2,
    shiftHours: 7.5,
    scrapRate: 1.5,
    materialSource: "purchased"
  }
];

const components = [
  {
    id: "component-carbon",
    name: "Carbon pre-preg roll",
    source: "purchase",
    cost: 34,
    leadTime: 2
  },
  {
    id: "component-fixture",
    name: "Assembly fixture insert",
    source: "produce",
    cost: 18,
    leadTime: 6
  }
];

let activeStepId = processSteps[0]?.id || null;

const processForm = document.getElementById("processForm");
const componentForm = document.getElementById("componentForm");
const goalForm = document.getElementById("goalForm");
const analyzeLineButton = document.getElementById("analyzeLineButton");
const stepTabs = document.getElementById("stepTabs");
const componentList = document.getElementById("componentList");
const processTimeline = document.getElementById("processTimeline");
const stepDetail = document.getElementById("stepDetail");
const activeStepTitle = document.getElementById("activeStepTitle");
const activeBottleneckBadge = document.getElementById("activeBottleneckBadge");
const recommendationList = document.getElementById("recommendationList");
const goalResponse = document.getElementById("goalResponse");
const lineStatus = document.getElementById("lineStatus");

const builderMetricEls = {
  oee: document.getElementById("lineOee"),
  throughput: document.getElementById("lineThroughput"),
  downtime: document.getElementById("lineDowntime"),
  scrap: document.getElementById("lineScrap"),
  standardActual: document.getElementById("standardActual")
};

function numberValue(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function formatNumber(value, digits = 1) {
  if (!Number.isFinite(value)) {
    return "0";
  }

  return value.toLocaleString(undefined, {
    maximumFractionDigits: digits,
    minimumFractionDigits: value % 1 === 0 ? 0 : digits
  });
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function calculateStepMetrics(step, averageOutput) {
  const machines = Math.max(1, numberValue(step.machines, 1));
  const cycleTime = Math.max(0.1, numberValue(step.cycleTime, 1));
  const shiftHours = clamp(numberValue(step.shiftHours, 8), 0, 24);
  const scrapRate = clamp(numberValue(step.scrapRate, 0), 0, 100);
  const rawOutputPerHour = (machines * 60) / cycleTime;
  const outputPerHour = rawOutputPerHour * (1 - scrapRate / 100);
  const utilizationRate = averageOutput > 0 ? clamp(averageOutput / rawOutputPerHour, 0, 1) : 0;
  const availability = clamp(shiftHours / 8, 0, 1);
  const quality = 1 - scrapRate / 100;
  const performance = averageOutput > 0 ? clamp(outputPerHour / averageOutput, 0, 1.2) / 1.2 : 0.8;

  // Efficiency score balances utilization, quality loss, and capacity performance into a simple 0-100 manufacturing health score.
  const efficiencyScore = clamp(
    Math.round((utilizationRate * 0.38 + quality * 0.34 + availability * 0.16 + performance * 0.12) * 100),
    0,
    100
  );

  return {
    rawOutputPerHour,
    outputPerHour,
    utilizationRate,
    availability,
    quality,
    performance,
    efficiencyScore
  };
}

function analyzeProcesses() {
  const rawRates = processSteps.map((step) => {
    const machines = Math.max(1, numberValue(step.machines, 1));
    const cycleTime = Math.max(0.1, numberValue(step.cycleTime, 1));
    const scrapRate = clamp(numberValue(step.scrapRate, 0), 0, 100);
    return ((machines * 60) / cycleTime) * (1 - scrapRate / 100);
  });
  const averageOutput = rawRates.length
    ? rawRates.reduce((sum, rate) => sum + rate, 0) / rawRates.length
    : 0;
  const bottleneckThreshold = averageOutput * 0.85;
  const steps = processSteps.map((step) => {
    const metrics = calculateStepMetrics(step, averageOutput);
    return {
      ...step,
      metrics,
      isBottleneck: rawRates.length > 1 && metrics.outputPerHour < bottleneckThreshold
    };
  });
  const lineOutput = steps.length
    ? Math.min(...steps.map((step) => step.metrics.outputPerHour))
    : 0;
  const standardOutput = steps.length
    ? Math.min(...steps.map((step) => step.metrics.rawOutputPerHour)) * averageShiftHours()
    : 0;
  const actualOutput = lineOutput * averageShiftHours();
  const averageScrap = steps.length
    ? steps.reduce((sum, step) => sum + numberValue(step.scrapRate), 0) / steps.length
    : 0;
  const averageAvailability = steps.length
    ? steps.reduce((sum, step) => sum + step.metrics.availability, 0) / steps.length
    : 0;
  const averagePerformance = steps.length
    ? steps.reduce((sum, step) => sum + step.metrics.performance, 0) / steps.length
    : 0;
  const quality = 1 - averageScrap / 100;

  // OEE follows the standard Availability x Performance x Quality model and uses line-wide averages from configured steps.
  const oee = clamp(averageAvailability * averagePerformance * quality * 100, 0, 100);

  return {
    steps,
    averageOutput,
    lineOutput,
    standardOutput,
    actualOutput,
    averageScrap,
    averageAvailability,
    oee,
    bottlenecks: steps.filter((step) => step.isBottleneck)
  };
}

function averageShiftHours() {
  if (!processSteps.length) {
    return 0;
  }

  return processSteps.reduce((sum, step) => sum + numberValue(step.shiftHours, 0), 0) / processSteps.length;
}

function renderBuilder() {
  const analysis = analyzeProcesses();
  const activeStep = analysis.steps.find((step) => step.id === activeStepId) || analysis.steps[0];
  activeStepId = activeStep?.id || null;

  renderStepTabs(analysis);
  renderComponentList();
  renderBuilderMetrics(analysis);
  renderTimeline(analysis);
  renderStepDetail(activeStep);
  renderRecommendations(analysis);
}

function renderStepTabs(analysis) {
  stepTabs.innerHTML = analysis.steps
    .map(
      (step, index) => `
        <button
          class="step-tab ${step.id === activeStepId ? "active" : ""}"
          draggable="true"
          data-step-id="${step.id}"
          data-index="${index}"
          title="Double-click to rename. Drag to reorder."
          type="button"
        >
          <span>${step.name}</span>
          ${step.isBottleneck ? '<strong class="tab-warning">!</strong>' : ""}
        </button>
      `
    )
    .join("");
}

function renderBuilderMetrics(analysis) {
  const downtime = clamp((1 - analysis.averageAvailability) * 100, 0, 100);

  builderMetricEls.oee.textContent = `${formatNumber(analysis.oee)}%`;
  builderMetricEls.throughput.textContent = `${formatNumber(analysis.lineOutput)}/hr`;
  builderMetricEls.downtime.textContent = `${formatNumber(downtime)}%`;
  builderMetricEls.scrap.textContent = `${formatNumber(analysis.averageScrap)}%`;
  builderMetricEls.standardActual.textContent = `${formatNumber(analysis.standardOutput, 0)} / ${formatNumber(analysis.actualOutput, 0)}`;
  lineStatus.textContent = analysis.bottlenecks.length
    ? `${analysis.bottlenecks.length} bottleneck${analysis.bottlenecks.length > 1 ? "s" : ""} flagged`
    : "Balanced flow";
}

function renderTimeline(analysis) {
  const dependencyItems = components.map((component) => {
    const hours = component.source === "purchase"
      ? numberValue(component.leadTime) * 24
      : numberValue(component.leadTime);

    return {
      id: component.id,
      label: `${component.name} dependency`,
      meta: component.source === "purchase" ? `${component.leadTime} day lead` : `${component.leadTime} hr internal cycle`,
      duration: Math.max(1, hours),
      type: "dependency"
    };
  });
  const processItems = analysis.steps.map((step) => {
    const lotSize = 100;
    const duration = step.metrics.outputPerHour > 0 ? lotSize / step.metrics.outputPerHour : 0;

    return {
      id: step.id,
      label: step.name,
      meta: `${formatNumber(step.metrics.outputPerHour)} units/hr`,
      duration: Math.max(0.5, duration),
      type: step.isBottleneck ? "bottleneck" : "process"
    };
  });
  const timelineItems = [...dependencyItems, ...processItems];
  const totalDuration = timelineItems.reduce((sum, item) => sum + item.duration, 0) || 1;
  let cursor = 0;

  if (!timelineItems.length) {
    processTimeline.innerHTML = '<p class="empty-state">Add a process step to generate a schedule.</p>';
    return;
  }

  processTimeline.innerHTML = timelineItems
    .map((item) => {
      const left = (cursor / totalDuration) * 100;
      const width = Math.max((item.duration / totalDuration) * 100, 8);
      cursor += item.duration;

      return `
        <article class="timeline-row" data-type="${item.type}">
          <div>
            <strong>${item.label}</strong>
            <span>${item.meta}</span>
          </div>
          <div class="timeline-track">
            <span class="timeline-bar" style="left: ${left}%; width: ${Math.min(width, 100 - left)}%;"></span>
          </div>
          <em>${formatNumber(item.duration)} hr</em>
        </article>
      `;
    })
    .join("");
}

function renderStepDetail(step) {
  if (!step) {
    activeStepTitle.textContent = "No process selected";
    activeBottleneckBadge.classList.add("hidden");
    stepDetail.innerHTML = '<p class="empty-state">Add a process step to see step-level analysis.</p>';
    return;
  }

  activeStepTitle.textContent = step.name;
  activeBottleneckBadge.classList.toggle("hidden", !step.isBottleneck);
  stepDetail.innerHTML = `
    <div class="detail-grid">
      <div><span>Efficiency score</span><strong>${step.metrics.efficiencyScore}%</strong></div>
      <div><span>Predicted output</span><strong>${formatNumber(step.metrics.outputPerHour)}/hr</strong></div>
      <div><span>Utilization</span><strong>${formatNumber(step.metrics.utilizationRate * 100)}%</strong></div>
      <div><span>Quality yield</span><strong>${formatNumber(step.metrics.quality * 100)}%</strong></div>
    </div>
    <form class="builder-form inline-edit-form" id="stepEditForm">
      <div class="form-grid">
        <label><span>Cycle time</span><input name="cycleTime" type="number" min="0.1" step="0.1" value="${step.cycleTime}" /></label>
        <label><span>Machines</span><input name="machines" type="number" min="1" step="1" value="${step.machines}" /></label>
      </div>
      <div class="form-grid">
        <label><span>Shift hours</span><input name="shiftHours" type="number" min="1" max="24" step="0.5" value="${step.shiftHours}" /></label>
        <label><span>Scrap %</span><input name="scrapRate" type="number" min="0" max="100" step="0.1" value="${step.scrapRate}" /></label>
      </div>
      <label>
        <span>Materials source</span>
        <select name="materialSource">
          <option value="purchased" ${step.materialSource === "purchased" ? "selected" : ""}>Purchased</option>
          <option value="in-house" ${step.materialSource === "in-house" ? "selected" : ""}>Produced in-house</option>
        </select>
      </label>
      <button class="button button-secondary full-button" type="submit">Update Selected Step</button>
    </form>
  `;
}

function componentAlternative(component) {
  const source = component.source;
  const cost = numberValue(component.cost);
  const time = numberValue(component.leadTime);

  if (source === "purchase") {
    return {
      source: "produce",
      cost: cost * 1.18,
      leadTime: Math.max(4, time * 24 * 0.7),
      unit: "hours"
    };
  }

  return {
    source: "purchase",
    cost: cost * 0.88,
    leadTime: Math.max(1, time / 24),
    unit: "days"
  };
}

function makeVsBuyRecommendations() {
  // Make-vs-buy compares the entered current source against a lightweight estimated alternative so the static prototype can still flag sourcing tradeoffs.
  return components.map((component) => {
    const alternative = componentAlternative(component);
    const currentTimeHours = component.source === "purchase"
      ? numberValue(component.leadTime) * 24
      : numberValue(component.leadTime);
    const alternativeTimeHours = alternative.source === "purchase"
      ? alternative.leadTime * 24
      : alternative.leadTime;
    const currentCost = numberValue(component.cost);
    const alternativeCost = alternative.cost;

    if (alternativeCost < currentCost && alternativeTimeHours < currentTimeHours) {
      return `Switch ${component.name} to ${alternative.source === "purchase" ? "purchased supply" : "internal production"}; the modeled alternative is faster and about ${formatNumber(((currentCost - alternativeCost) / currentCost) * 100)}% cheaper.`;
    }

    if (component.source === "purchase" && currentTimeHours > 72) {
      return `Qualify a second supplier for ${component.name}; current purchased lead time adds ${formatNumber(currentTimeHours)} hours before the line can release.`;
    }

    if (component.source === "produce" && currentTimeHours > 8) {
      return `Evaluate buying ${component.name} for rush orders; current in-house cycle time consumes ${formatNumber(currentTimeHours)} hours before downstream work can start.`;
    }

    return `Keep ${component.name} ${component.source === "purchase" ? "purchased" : "in-house"} for now; current source is competitive on cost or lead time.`;
  });
}

function renderRecommendations(analysis) {
  const bottleneckRecommendations = analysis.bottlenecks.flatMap((step) => {
    const rateGap = Math.max(0, analysis.averageOutput - step.metrics.outputPerHour);
    const addedMachines = Math.max(1, Math.ceil(rateGap / (60 / Math.max(0.1, step.cycleTime))));

    // Bottleneck detection flags any step materially below the line average and generates specific capacity, labor, cycle-time, and quality actions.
    return [
      `Add ${addedMachines} parallel machine/operator${addedMachines > 1 ? "s" : ""} to ${step.name} to close an estimated ${formatNumber(rateGap)} units/hr gap.`,
      `Reduce ${step.name} cycle time by 10-15% through setup reduction, fixture prep, or pre-kitting.`,
      `Shift one cross-trained operator into ${step.name} during the first ${formatNumber(step.shiftHours)}-hour shift to protect downstream flow.`,
      `Cut ${step.name} scrap from ${formatNumber(step.scrapRate)}% toward ${formatNumber(Math.max(0, step.scrapRate - 1))}% with incoming material checks and first-article verification.`
    ];
  });
  const sourcingRecommendations = makeVsBuyRecommendations();
  const allRecommendations = [...bottleneckRecommendations, ...sourcingRecommendations].slice(0, 8);

  recommendationList.innerHTML = allRecommendations.length
    ? allRecommendations.map((item) => `<article class="recommendation-card">${item}</article>`).join("")
    : '<p class="empty-state">No constraints flagged yet. Add process steps or components to generate recommendations.</p>';
}

function renderComponentList() {
  componentList.innerHTML = components.length
    ? components
        .map(
          (component) => `
            <article class="component-card">
              <strong>${component.name}</strong>
              <span>${component.source === "purchase" ? "Purchased" : "Produced"} | $${formatNumber(component.cost, 2)} | ${component.leadTime} ${component.source === "purchase" ? "days" : "hrs"}</span>
            </article>
          `
        )
        .join("")
    : '<p class="empty-state">No components added yet.</p>';
}

function updateGoalResponse(goal = {}) {
  const analysis = analyzeProcesses();
  const targetRate = numberValue(goal.targetRate);
  const targetQuantity = numberValue(goal.targetQuantity);
  const deadline = goal.deadlineDate ? new Date(`${goal.deadlineDate}T23:59:59`) : null;
  const now = new Date();
  const availableHours = deadline && deadline > now ? (deadline - now) / 36e5 : 0;
  const deadlineRate = targetQuantity && availableHours ? targetQuantity / availableHours : 0;
  const requiredRate = Math.max(targetRate, deadlineRate);
  const gap = Math.max(0, requiredRate - analysis.lineOutput);
  const achievable = requiredRate > 0 && analysis.lineOutput >= requiredRate;
  const bottleneckNames = analysis.bottlenecks.map((step) => step.name).join(", ") || "none";
  const extraMachines = analysis.bottlenecks.reduce((sum, step) => {
    const perMachineRate = (60 / Math.max(0.1, numberValue(step.cycleTime))) * (1 - numberValue(step.scrapRate) / 100);
    return sum + Math.ceil(gap / Math.max(0.1, perMachineRate));
  }, 0);

  if (!requiredRate) {
    goalResponse.innerHTML = '<p class="empty-state">Enter a target output rate or a quantity with deadline to generate a goal plan.</p>';
    return;
  }

  goalResponse.innerHTML = `
    <article class="goal-card" data-achievable="${achievable}">
      <strong>${achievable ? "Goal is achievable" : "Goal needs intervention"}</strong>
      <p>Current line capacity is ${formatNumber(analysis.lineOutput)} units/hr against a required ${formatNumber(requiredRate)} units/hr.</p>
      ${gap ? `<p>Gap: ${formatNumber(gap)} units/hr. Primary bottleneck candidates: ${bottleneckNames}.</p>` : ""}
    </article>
    <ul class="goal-guidelines">
      <li>${gap ? `Add about ${Math.max(1, extraMachines)} parallel resource${extraMachines === 1 ? "" : "s"} across bottleneck steps or split work into an added shift.` : "Maintain current staffing and protect material readiness windows."}</li>
      <li>${averageShiftHours() < 10 ? "Extend the constraint shift toward 10 hours/day before adding weekend work." : "Use current shift coverage and focus on cycle-time reduction before overtime."}</li>
      <li>Prioritize purchased components with lead times under 48 hours for near-term goals; make long-lead internal parts only when cost advantage is clear.</li>
      <li>Target the highest-scrap step first; each percentage point of yield improvement flows directly into full-line throughput.</li>
    </ul>
  `;
}

processForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(processForm);
  const step = {
    id: createId("step"),
    name: formData.get("name").trim(),
    cycleTime: numberValue(formData.get("cycleTime"), 1),
    machines: numberValue(formData.get("machines"), 1),
    shiftHours: numberValue(formData.get("shiftHours"), 8),
    scrapRate: numberValue(formData.get("scrapRate"), 0),
    materialSource: formData.get("materialSource")
  };

  processSteps.push(step);
  activeStepId = step.id;
  processForm.reset();
  renderBuilder();
});

componentForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(componentForm);
  components.push({
    id: createId("component"),
    name: formData.get("name").trim(),
    source: formData.get("source"),
    cost: numberValue(formData.get("cost"), 0),
    leadTime: numberValue(formData.get("leadTime"), 0)
  });
  componentForm.reset();
  renderBuilder();
});

goalForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(goalForm);
  updateGoalResponse({
    targetRate: formData.get("targetRate"),
    targetQuantity: formData.get("targetQuantity"),
    deadlineDate: formData.get("deadlineDate")
  });
});

analyzeLineButton.addEventListener("click", () => {
  renderBuilder();
  updateGoalResponse({
    targetRate: document.getElementById("targetRate").value,
    targetQuantity: document.getElementById("targetQuantity").value,
    deadlineDate: document.getElementById("deadlineDate").value
  });
});

stepTabs.addEventListener("click", (event) => {
  const button = event.target.closest("[data-step-id]");

  if (!button) {
    return;
  }

  activeStepId = button.dataset.stepId;
  renderBuilder();
});

stepTabs.addEventListener("dblclick", (event) => {
  const button = event.target.closest("[data-step-id]");

  if (!button) {
    return;
  }

  const step = processSteps.find((item) => item.id === button.dataset.stepId);
  const nextName = window.prompt("Rename process step", step.name);

  if (nextName?.trim()) {
    step.name = nextName.trim();
    renderBuilder();
  }
});

stepTabs.addEventListener("dragstart", (event) => {
  const button = event.target.closest("[data-step-id]");

  if (button) {
    event.dataTransfer.setData("text/plain", button.dataset.stepId);
  }
});

stepTabs.addEventListener("dragover", (event) => {
  if (event.target.closest("[data-step-id]")) {
    event.preventDefault();
  }
});

stepTabs.addEventListener("drop", (event) => {
  const target = event.target.closest("[data-step-id]");
  const draggedId = event.dataTransfer.getData("text/plain");

  if (!target || !draggedId || target.dataset.stepId === draggedId) {
    return;
  }

  const fromIndex = processSteps.findIndex((step) => step.id === draggedId);
  const toIndex = processSteps.findIndex((step) => step.id === target.dataset.stepId);
  const [draggedStep] = processSteps.splice(fromIndex, 1);
  processSteps.splice(toIndex, 0, draggedStep);
  renderBuilder();
});

stepDetail.addEventListener("submit", (event) => {
  if (event.target.id !== "stepEditForm") {
    return;
  }

  event.preventDefault();
  const step = processSteps.find((item) => item.id === activeStepId);
  const formData = new FormData(event.target);

  if (!step) {
    return;
  }

  step.cycleTime = numberValue(formData.get("cycleTime"), step.cycleTime);
  step.machines = numberValue(formData.get("machines"), step.machines);
  step.shiftHours = numberValue(formData.get("shiftHours"), step.shiftHours);
  step.scrapRate = numberValue(formData.get("scrapRate"), step.scrapRate);
  step.materialSource = formData.get("materialSource");
  renderBuilder();
});

renderBuilder();
updateGoalResponse();
