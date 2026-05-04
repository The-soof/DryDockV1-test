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
      "Axiom sequences high-priority defense jobs through composite layup first, then protects CNC throughput by front-loading material-ready work. The hybrid layer only activates on the most conflict-heavy machine and tooling clusters, keeping the schedule credible while improving slack on downstream assembly.",
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
      "The decision engine inserted the rush order by moving one lower-priority panel into the evening shift, preserving all P1 due dates while increasing assembly load. The deterministic rules layer focused on the highest-conflict routing choices because standard heuristics produced two tooling deadlocks.",
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
      "When M3 goes down, Axiom reroutes one titanium job to a slower backup cell and protects the highest-priority radar frame by shifting lower-priority work into inspection slack. The engine explicitly preserves traceability requirements and flags the cost of every fallback choice.",
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

const inputDescriptions = {
  "Jobs / orders": "Jobs define demand, priority, due dates, routing, and the production quantities the schedule must protect.",
  Operations: "Operations are the process steps, cycle times, and precedence rules that become the line flow.",
  "Machines / work cells": "Machines and work cells determine parallel capacity, utilization pressure, and outage sensitivity.",
  "Labor skills & shifts": "Labor coverage controls availability, overtime options, cross-training leverage, and downtime risk.",
  "Material readiness": "Material readiness gates release timing and can add dependency bars before production work starts.",
  "Tooling constraints": "Tooling constraints catch fixture conflicts, setup windows, and constrained shared resources.",
  "Quality holds": "Quality holds feed scrap, rework, inspection delay, and first-article risk into the plan.",
  "Traceability rules": "Traceability rules protect serialized parts, compliance paths, and program-specific routing requirements."
};

const selectedInputChips = new Set(["Jobs / orders", "Operations", "Machines / work cells"]);

const scenarioList = document.getElementById("scenarioList");
const inputChipsEl = document.getElementById("inputChips");
const inputDetail = document.getElementById("inputDetail");
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

const hasPlannerPage = Boolean(
  scenarioList &&
  inputChipsEl &&
  inputDetail &&
  scenarioName &&
  solverMode &&
  narrative &&
  scheduleTableBody &&
  alertList &&
  resourceList
);

function renderInputs() {
  if (!hasPlannerPage) {
    return;
  }

  inputChipsEl.innerHTML = inputChips
    .map(
      (chip) => `
        <button class="chip ${selectedInputChips.has(chip) ? "active" : ""}" data-input-chip="${chip}" type="button">
          ${chip}
        </button>
      `
    )
    .join("");
  const selected = [...selectedInputChips];
  inputDetail.textContent = selected.length
    ? selected.map((chip) => inputDescriptions[chip]).join(" ")
    : "No factory inputs selected. Choose one or more inputs to see how they shape the planning model.";
}

function renderScenarios(activeId) {
  if (!hasPlannerPage) {
    return;
  }

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
  if (!hasPlannerPage) {
    return;
  }

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

function initPlannerPage() {
  if (!hasPlannerPage) {
    return;
  }

  scenarioList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-scenario-id]");

    if (!button) {
      return;
    }

    renderScenario(button.dataset.scenarioId);
  });

  inputChipsEl.addEventListener("click", (event) => {
    const button = event.target.closest("[data-input-chip]");

    if (!button) {
      return;
    }

    const chip = button.dataset.inputChip;

    if (selectedInputChips.has(chip)) {
      selectedInputChips.delete(chip);
    } else {
      selectedInputChips.add(chip);
    }

    renderInputs();
  });

  renderInputs();
  renderScenario("baseline");
}

function cloneValue(value) {
  return JSON.parse(JSON.stringify(value));
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

function formatAge(timestamp) {
  const ageMs = Math.max(0, Date.now() - new Date(timestamp).getTime());
  if (ageMs < 60000) {
    return `${Math.max(1, Math.round(ageMs / 1000))} sec`;
  }

  return `${Math.round(ageMs / 60000)} min`;
}

class ManufacturingAPI {
  static sequence = 0;
  static lastRawSnapshot = null;

  static baseModel = {
    lineName: "Axiom Composite Line",
    shiftName: "Shift 1",
    refreshIntervalMs: 5000,
    mes: {
      lineStatus: "Running",
      processSteps: [
        {
          id: "mes-step-layup",
          name: "Composite layup",
          station: "Cell C2",
          cycleTimeMin: 12.5,
          idealCycleTimeMin: 11.8,
          machinesActive: 2,
          uptimePercent: 94,
          scrapRatePercent: 2.5,
          queueMinutes: 8,
          state: "Running"
        },
        {
          id: "mes-step-cure",
          name: "Curing oven",
          station: "Oven A1",
          cycleTimeMin: 45,
          idealCycleTimeMin: 41,
          machinesActive: 1,
          uptimePercent: 91,
          scrapRatePercent: 0.5,
          queueMinutes: 18,
          state: "Watch"
        },
        {
          id: "mes-step-trim",
          name: "Trimming & inspection",
          station: "Inspection Q2",
          cycleTimeMin: 8,
          idealCycleTimeMin: 7.6,
          machinesActive: 3,
          uptimePercent: 88,
          scrapRatePercent: 5,
          queueMinutes: 5,
          state: "Watch"
        }
      ]
    },
    erp: {
      productionGoal: {
        targetRatePerHour: 18,
        totalQuantity: 500,
        deadlineDate: "2026-05-30"
      },
      components: [
        {
          id: "comp_001",
          name: "Carbon pre-preg roll",
          sourceType: "purchase",
          onHand: 14,
          reserved: 6,
          costPerUnit: 250,
          leadTimeDays: 5,
          risk: "warning"
        },
        {
          id: "comp_002",
          name: "Epoxy resin",
          sourceType: "purchase",
          onHand: 22,
          reserved: 4,
          costPerUnit: 45.5,
          leadTimeDays: 2,
          risk: "ok"
        }
      ]
    }
  };

  static async getNormalizedSnapshot() {
    const sequence = this.sequence + 1;
    this.sequence = sequence;
    
    try {
      // 1. Fetch the raw data from your Python backend
      const response = await fetch('/api/live-feed');
      const rawData = await response.json();
      
      // 2. Format it into the snapshot wrapper your UI expects
      const rawSnapshot = {
        sequence: sequence,
        updatedAt: new Date().toISOString(),
        source: "fastapi-backend", // Changed to show it's coming from Python!
        mes: rawData.mes,
        erp: rawData.erp
      };
      
      this.lastRawSnapshot = rawSnapshot;
      
      // 3. Run your UI normalizer
      return this.normalizeSnapshot(rawSnapshot, sequence);

    } catch (error) {
      console.error("Failed to fetch live feed from backend:", error);
      throw error;
    }
  }

  static async getMesData() {
    if (!this.lastRawSnapshot) {
      await this.getNormalizedSnapshot();
    }

    return cloneValue(this.lastRawSnapshot.mes);
  }

  static async getErpData() {
    if (!this.lastRawSnapshot) {
      await this.getNormalizedSnapshot();
    }

    return cloneValue(this.lastRawSnapshot.erp);
  }

  static subscribe(onUpdate, onError, options = {}) {
    const intervalMs = options.intervalMs || this.baseModel.refreshIntervalMs;
    let cancelled = false;
    let timerId = null;

    const poll = async () => {
      if (cancelled) {
        return;
      }

      try {
        const snapshot = await this.getNormalizedSnapshot();
        if (!cancelled) {
          onUpdate(snapshot);
        }
      } catch (error) {
        if (onError) {
          onError(error);
        }
      } finally {
        if (!cancelled) {
          timerId = window.setTimeout(poll, intervalMs);
        }
      }
    };

    poll();

    return () => {
      cancelled = true;
      if (timerId) {
        window.clearTimeout(timerId);
      }
    };
  }

  static buildRawSnapshot(sequence) {
    const mes = cloneValue(this.baseModel.mes);
    const erp = cloneValue(this.baseModel.erp);

    mes.lineStatus = sequence % 5 === 0 ? "Watch" : "Running";
    mes.processSteps = mes.processSteps.map((step, index) => {
      const cycleShift = 1 + ((Math.sin(sequence / 2 + index) * 0.04) + ((sequence + index) % 3) * 0.01);
      const scrapShift = ((sequence + index) % 4 === 0 ? 0.6 : -0.15) + Math.cos(sequence + index) * 0.2;
      const uptimeShift = ((sequence + index) % 5 === 0 ? -2.5 : 0.8) + Math.sin(sequence / 3 + index) * 0.4;
      const queueShift = ((sequence + index) % 4) * 1.2;

      return {
        ...step,
        cycleTimeMin: Number((step.cycleTimeMin * cycleShift).toFixed(2)),
        scrapRatePercent: Number(Math.max(0, step.scrapRatePercent + scrapShift).toFixed(2)),
        uptimePercent: Number(Math.max(70, Math.min(99, step.uptimePercent + uptimeShift)).toFixed(2)),
        queueMinutes: Number(Math.max(0, step.queueMinutes + queueShift).toFixed(1)),
        state: index === 1 && sequence % 4 === 0 ? "Watch" : step.state
      };
    });

    erp.productionGoal = {
      ...erp.productionGoal,
      targetRatePerHour: Number((erp.productionGoal.targetRatePerHour + ((sequence % 3) - 1) * 0.5).toFixed(1))
    };

    erp.components = erp.components.map((component, index) => {
      const leadShift = (sequence + index) % 4 === 0 ? 1 : 0;
      const onHandShift = (sequence + index) % 5 === 0 ? -2 : 0;

      return {
        ...component,
        leadTimeDays: component.leadTimeDays + leadShift,
        onHand: Math.max(0, component.onHand + onHandShift),
        reserved: component.reserved + (sequence % 2 === 0 ? 1 : 0)
      };
    });

    return {
      sequence,
      updatedAt: new Date().toISOString(),
      source: "mock-polling",
      mes,
      erp
    };
  }

  static normalizeSnapshot(rawSnapshot, sequence) {
    const targetRate = rawSnapshot.erp.productionGoal.targetRatePerHour;
    const steps = rawSnapshot.mes.processSteps.map((step) => {
      const grossThroughputPerHour = (60 / Math.max(step.cycleTimeMin, 0.1)) * Math.max(step.machinesActive, 1);
      const quality = clamp(1 - step.scrapRatePercent / 100, 0, 1);
      const performance = clamp(step.idealCycleTimeMin / Math.max(step.cycleTimeMin, 0.1), 0, 1);
      const availability = clamp(step.uptimePercent / 100, 0, 1);
      const netThroughputPerHour = grossThroughputPerHour * quality;
      const oee = availability * performance * quality * 100;
      const targetShare = targetRate / Math.max(rawSnapshot.mes.processSteps.length, 1);
      const pressure = targetShare > 0 ? netThroughputPerHour / targetShare : 1;
      let state = "Running";

      if (pressure < 0.88 || step.queueMinutes > 18) {
        state = "Risk";
      } else if (pressure < 1 || step.scrapRatePercent > 3.5) {
        state = "Watch";
      }

      return {
        ...step,
        grossThroughputPerHour: Number(grossThroughputPerHour.toFixed(2)),
        netThroughputPerHour: Number(netThroughputPerHour.toFixed(2)),
        oee: Number(oee.toFixed(2)),
        pressure: Number(pressure.toFixed(2)),
        state
      };
    });

    const bottleneckStep = steps.reduce((slowest, current) => {
      if (!slowest) {
        return current;
      }

      return current.netThroughputPerHour < slowest.netThroughputPerHour ? current : slowest;
    }, null);

    const highestScrapStep = steps.reduce((highest, current) => {
      if (!highest) {
        return current;
      }

      return current.scrapRatePercent > highest.scrapRatePercent ? current : highest;
    }, null);

    const lineThroughputPerHour = bottleneckStep ? bottleneckStep.netThroughputPerHour : 0;
    const lineOee = steps.length
      ? steps.reduce((sum, step) => sum + step.oee, 0) / steps.length
      : 0;
    const lineYield = steps.reduce((yieldTotal, step) => {
      return yieldTotal * (1 - step.scrapRatePercent / 100);
    }, 1);
    const lineScrapRate = (1 - lineYield) * 100;
    const targetAttainment = targetRate > 0 ? (lineThroughputPerHour / targetRate) * 100 : 0;
    const healthScore = clamp(
      Math.round(lineOee * 0.45 + targetAttainment * 0.35 + (100 - lineScrapRate) * 0.2),
      0,
      100
    );

    const lineStatus = healthScore >= 82 ? "Running" : healthScore >= 68 ? "Watch" : "At risk";

    const recommendations = buildLineRecommendations({
      steps,
      bottleneckStep,
      highestScrapStep,
      lineThroughputPerHour,
      lineOee,
      lineScrapRate,
      targetAttainment,
      targetRate,
      components: rawSnapshot.erp.components
    });

    return {
      sequence,
      updatedAt: rawSnapshot.updatedAt,
      source: rawSnapshot.source,
      line: {
        name: this.baseModel.lineName,
        shift: this.baseModel.shiftName,
        status: lineStatus,
        healthScore,
        healthLabel: lineStatus,
        throughputPerHour: Number(lineThroughputPerHour.toFixed(2)),
        oee: Number(lineOee.toFixed(2)),
        scrapRate: Number(lineScrapRate.toFixed(2)),
        targetAttainment: Number(targetAttainment.toFixed(2)),
        bottleneckStep,
        highestScrapStep
      },
      mes: rawSnapshot.mes,
      erp: {
        ...rawSnapshot.erp,
        productionGoal: {
          ...rawSnapshot.erp.productionGoal,
          deadlineDateLabel: new Date(rawSnapshot.erp.productionGoal.deadlineDate).toLocaleDateString()
        }
      },
      steps,
      recommendations,
      focusViews: [
        {
          id: "overview",
          title: "Live snapshot",
          summary: "Merged MES and ERP feed with line health and target pressure."
        },
        {
          id: "steps",
          title: "Step analysis",
          summary: "Per-step cycle time, throughput, scrap, and OEE."
        },
        {
          id: "constraints",
          title: "ERP constraints",
          summary: "Materials, lead times, and production-goal pressure."
        }
      ],
      feedCards: [
        {
          title: `${this.baseModel.lineName}`,
          detail: `${lineStatus} | ${formatTimestamp(rawSnapshot.updatedAt)}`,
          meta: `Target ${Number(targetRate).toFixed(1)}/hr`
        },
        {
          title: "MES feed",
          detail: `${steps.length} live steps polled from the mock adapter.`,
          meta: `${formatAge(rawSnapshot.updatedAt)} old`
        },
        {
          title: "ERP pressure",
          detail: bottleneckStep
            ? `Bottleneck: ${bottleneckStep.name} at ${formatNumber(bottleneckStep.netThroughputPerHour)} units/hr.`
            : "No bottleneck detected.",
          meta: `${formatNumber(targetAttainment)}% target attainment`
        }
      ],
      constraints: rawSnapshot.erp.components.map((component) => {
        const isRisky = component.leadTimeDays > 3 || component.onHand <= component.reserved;
        return {
          id: component.id,
          title: component.name,
          detail: `${component.sourceType === "purchase" ? "Purchase" : "Produce"} | ${component.onHand} on hand | ${component.reserved} reserved`,
          meta: `${component.leadTimeDays} day lead | ${isRisky ? "watch" : "stable"}`,
          severity: component.risk
        };
      })
    };
  }
}

function buildLineRecommendations(context) {
  const {
    steps,
    bottleneckStep,
    highestScrapStep,
    lineThroughputPerHour,
    lineOee,
    lineScrapRate,
    targetAttainment,
    targetRate,
    components
  } = context;

  const recommendations = [];

  if (bottleneckStep) {
    const throughputGap = Math.max(0, targetRate - lineThroughputPerHour);
    recommendations.push({
      title: `Protect ${bottleneckStep.name}`,
      body: `${bottleneckStep.name} is the bottleneck at ${formatNumber(bottleneckStep.netThroughputPerHour)} units/hr. Resequence work ahead of it and limit WIP feeding that step to recover ${formatNumber(throughputGap)} units/hr of target gap.`,
      reason: `Bottleneck pressure is ${formatNumber(bottleneckStep.pressure)}x the local target share.`,
      severity: bottleneckStep.state === "Risk" ? "critical" : "warning"
    });
  }

  if (highestScrapStep) {
    recommendations.push({
      title: `Reduce scrap at ${highestScrapStep.name}`,
      body: `${highestScrapStep.name} is losing ${formatNumber(highestScrapStep.scrapRatePercent)}% of output. Prioritize first-article checks, incoming material verification, and setup review to lift overall line OEE from ${formatNumber(lineOee)}%.`,
      reason: `This is the highest scrap step in the live feed.`,
      severity: highestScrapStep.scrapRatePercent >= 4 ? "warning" : "info"
    });
  }

  const lowInventory = components.find((component) => component.onHand <= component.reserved || component.leadTimeDays > 3);
  if (lowInventory) {
    recommendations.push({
      title: `Secure ${lowInventory.name}`,
      body: `${lowInventory.name} has ${lowInventory.onHand} on hand, ${lowInventory.reserved} reserved, and a ${lowInventory.leadTimeDays}-day lead time. Release replenishment earlier or dual-source this component before it constrains the schedule.`,
      reason: "ERP inventory and lead-time pressure can stall the line before MES capacity does.",
      severity: "warning"
    });
  }

  recommendations.push({
    title: "Keep the line balanced",
    body: `Current target attainment is ${formatNumber(targetAttainment)}%. Maintain the current sequence, protect the curing oven queue, and use the low-scrap steps to absorb any short-term surge.`,
    reason: "The deterministic optimizer favors the highest-impact bottleneck and quality fixes first.",
    severity: targetAttainment >= 100 ? "info" : "warning"
  });

  return recommendations.slice(0, 4);
}

const liveFocusChips = [
  "Line health",
  "MES steps",
  "ERP targets",
  "Inventory risk",
  "Quality drift",
  "Refresh mode"
];

const liveFocusDescriptions = {
  "Line health": "Shows the merged line status, target attainment, and overall OEE coming from the MES and ERP snapshot.",
  "MES steps": "Highlights live process-step throughput, scrap, queue pressure, and bottleneck detection.",
  "ERP targets": "Surfaces the target rate, deadline, and production planning pressure from the ERP layer.",
  "Inventory risk": "Calls out component shortages, lead-time gaps, and other schedule constraints.",
  "Quality drift": "Focuses the highest scrap step and its downstream effect on line OEE.",
  "Refresh mode": "Explains the polling feed so the UI is easy to swap to WebSockets or SSE later."
};

const selectedLiveFocusChips = new Set(["Line health", "MES steps", "ERP targets"]);
const livePlannerState = {
  activeViewId: "overview",
  snapshot: null,
  unsubscribe: null
};

function renderLiveFocusChips() {
  if (!hasPlannerPage) {
    return;
  }

  inputChipsEl.innerHTML = liveFocusChips
    .map(
      (chip) => `
        <button class="chip ${selectedLiveFocusChips.has(chip) ? "active" : ""}" data-live-focus-chip="${chip}" type="button">
          ${chip}
        </button>
      `
    )
    .join("");

  const selected = [...selectedLiveFocusChips];
  inputDetail.textContent = selected.length
    ? selected.map((chip) => liveFocusDescriptions[chip]).join(" ")
    : "Choose one or more live focus areas to tailor the summary."
}

function renderLiveViews(snapshot) {
  if (!hasPlannerPage || !snapshot) {
    return;
  }

  scenarioList.innerHTML = snapshot.focusViews
    .map(
      (view) => `
        <button class="scenario-button ${view.id === livePlannerState.activeViewId ? "active" : ""}" data-live-view-id="${view.id}">
          <strong>${view.title}</strong>
          <p>${view.summary}</p>
        </button>
      `
    )
    .join("");
}

function renderLiveMetrics(snapshot) {
  if (!hasPlannerPage || !snapshot) {
    return;
  }

  metricEls.onTime.textContent = `${formatNumber(snapshot.line.oee)}%`;
  metricEls.onTimeDelta.textContent = `Target ${formatNumber(snapshot.erp.productionGoal.targetRatePerHour, 1)}/hr`;
  metricEls.utilization.textContent = `${formatNumber(snapshot.line.throughputPerHour)}/hr`;
  metricEls.utilizationDelta.textContent = `Attainment ${formatNumber(snapshot.line.targetAttainment)}%`;
  metricEls.reschedule.textContent = `${formatNumber(snapshot.line.scrapRate)}%`;
  metricEls.rescheduleDelta.textContent = snapshot.line.highestScrapStep
    ? `Highest scrap: ${snapshot.line.highestScrapStep.name}`
    : "No scrap leader";
  metricEls.risk.textContent = snapshot.line.healthLabel;
  metricEls.riskDelta.textContent = snapshot.line.bottleneckStep
    ? `Bottleneck: ${snapshot.line.bottleneckStep.name}`
    : "All steps balanced";
}

function renderLiveSteps(snapshot) {
  if (!hasPlannerPage || !snapshot) {
    return;
  }

  scheduleTableBody.innerHTML = snapshot.steps
    .map(
      (step) => `
        <tr>
          <td>${step.name}</td>
          <td>${step.station}</td>
          <td>${formatNumber(step.cycleTimeMin)} min</td>
          <td>${formatNumber(step.netThroughputPerHour)} / hr</td>
          <td>${formatNumber(step.scrapRatePercent)}%</td>
          <td>${formatNumber(step.oee)}%</td>
          <td class="${statusClass(step.state === "Running" ? "On track" : step.state === "Watch" ? "Watch" : "Risk")}">${step.state}</td>
        </tr>
      `
    )
    .join("");
}

function renderLiveRecommendations(snapshot) {
  if (!hasPlannerPage || !snapshot) {
    return;
  }

  alertList.innerHTML = snapshot.recommendations
    .map(
      (recommendation) => `
        <article class="alert-card" data-level="${recommendation.severity}">
          <strong>${recommendation.title}</strong>
          <p>${recommendation.body}</p>
        </article>
      `
    )
    .join("");
}

function renderLiveResources(snapshot) {
  if (!hasPlannerPage || !snapshot) {
    return;
  }

  resourceList.innerHTML = snapshot.constraints
    .map(
      (constraint) => `
        <article class="resource-card">
          <strong>${constraint.title}</strong>
          <p>${constraint.detail}</p>
          <div class="resource-meta">
            <span>${constraint.meta}</span>
            <span>${constraint.severity === "ok" ? "stable" : constraint.severity}</span>
          </div>
        </article>
      `
    )
    .join("");
}

function renderLiveNarrative(snapshot) {
  if (!hasPlannerPage || !snapshot) {
    return;
  }

  const bottleneck = snapshot.line.bottleneckStep ? snapshot.line.bottleneckStep.name : "no single step";
  const ageText = formatAge(snapshot.updatedAt);
  const activeFilterText = [...selectedLiveFocusChips].length
    ? [...selectedLiveFocusChips].join(", ").toLowerCase()
    : "none";

  scenarioName.textContent = `${snapshot.line.name} | ${snapshot.line.shift}`;
  solverMode.textContent = `${snapshot.source === "mock-polling" ? "Mock polling feed" : snapshot.source} | refresh every ${Math.round(ManufacturingAPI.baseModel.refreshIntervalMs / 1000)}s`;

  if (livePlannerState.activeViewId === "steps") {
    narrative.textContent = `The MES feed shows ${snapshot.steps.length} live steps. ${snapshot.line.bottleneckStep ? `${snapshot.line.bottleneckStep.name} is the bottleneck at ${formatNumber(snapshot.line.bottleneckStep.netThroughputPerHour)} units/hr.` : "The line is currently balanced."} Target attainment is ${formatNumber(snapshot.line.targetAttainment)}% and the current snapshot is ${ageText} old.`;
    return;
  }

  if (livePlannerState.activeViewId === "constraints") {
    const constraintSummary = snapshot.constraints.map((constraint) => constraint.title).join(", ");
    narrative.textContent = `The ERP layer is constraining the line through ${constraintSummary}. Keep an eye on ${bottleneck} while the planner preserves the ${snapshot.erp.productionGoal.deadlineDateLabel} deadline and the ${formatNumber(snapshot.erp.productionGoal.targetRatePerHour, 1)}/hr target.`;
    return;
  }

  narrative.textContent = `Axiom is ${snapshot.line.healthLabel.toLowerCase()} with ${formatNumber(snapshot.line.oee)}% OEE, ${formatNumber(snapshot.line.throughputPerHour)}/hr throughput, and ${formatNumber(snapshot.line.scrapRate)}% scrap. Focus filters are set to ${activeFilterText}. The last mock MES/ERP refresh landed ${ageText} ago.`;
}

function renderLiveDashboard(snapshot) {
  if (!hasPlannerPage || !snapshot) {
    return;
  }

  livePlannerState.snapshot = snapshot;
  renderLiveFocusChips();
  renderLiveViews(snapshot);
  renderLiveMetrics(snapshot);
  renderLiveSteps(snapshot);
  renderLiveRecommendations(snapshot);
  renderLiveResources(snapshot);
  renderLiveNarrative(snapshot);
}

function initLivePlannerPage() {
  if (!hasPlannerPage) {
    return;
  }

  scenarioList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-live-view-id]");
    if (!button) {
      return;
    }

    livePlannerState.activeViewId = button.dataset.liveViewId;
    if (livePlannerState.snapshot) {
      renderLiveDashboard(livePlannerState.snapshot);
    }
  });

  inputChipsEl.addEventListener("click", (event) => {
    const button = event.target.closest("[data-live-focus-chip]");
    if (!button) {
      return;
    }

    const chip = button.dataset.liveFocusChip;
    if (selectedLiveFocusChips.has(chip)) {
      selectedLiveFocusChips.delete(chip);
    } else {
      selectedLiveFocusChips.add(chip);
    }

    renderLiveFocusChips();
    if (livePlannerState.snapshot) {
      renderLiveNarrative(livePlannerState.snapshot);
    }
  });

  if (livePlannerState.unsubscribe) {
    livePlannerState.unsubscribe();
  }

  livePlannerState.unsubscribe = ManufacturingAPI.subscribe(
    (snapshot) => {
      renderLiveDashboard(snapshot);
    },
    (error) => {
      console.error("Failed to refresh live manufacturing snapshot:", error);
      solverMode.textContent = "Mock polling feed | refresh failed";
    },
    { intervalMs: ManufacturingAPI.baseModel.refreshIntervalMs }
  );
}

let processSteps = [
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
let activeAnalysis = { type: "step", id: activeStepId };

const processForm = document.getElementById("processForm");
const componentForm = document.getElementById("componentForm");
const goalForm = document.getElementById("goalForm");
const analyzeLineButton = document.getElementById("analyzeLineButton");
const clearLineButton = document.getElementById("clearLineButton");
const clearComponentsButton = document.getElementById("clearComponentsButton");
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

const hasBuilderPage = Boolean(
  processForm &&
  componentForm &&
  goalForm &&
  analyzeLineButton &&
  clearLineButton &&
  clearComponentsButton &&
  componentList &&
  processTimeline &&
  stepDetail &&
  activeStepTitle &&
  activeBottleneckBadge &&
  recommendationList &&
  goalResponse &&
  lineStatus &&
  builderMetricEls.oee &&
  builderMetricEls.throughput &&
  builderMetricEls.downtime &&
  builderMetricEls.scrap &&
  builderMetricEls.standardActual
);

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
  if (!hasBuilderPage) {
    return;
  }

  const analysis = analyzeProcesses();
  const hasActiveStep = activeAnalysis.type === "step" && analysis.steps.some((step) => step.id === activeAnalysis.id);
  const hasActiveComponent = activeAnalysis.type === "component" && components.some((component) => component.id === activeAnalysis.id);

  if (!hasActiveStep && !hasActiveComponent) {
    if (analysis.steps[0]) {
      activeAnalysis = { type: "step", id: analysis.steps[0].id };
    } else if (components[0]) {
      activeAnalysis = { type: "component", id: components[0].id };
    } else {
      activeAnalysis = { type: "empty", id: null };
    }
  }

  activeStepId = activeAnalysis.type === "step" ? activeAnalysis.id : analysis.steps[0]?.id || null;
  const activeStep = analysis.steps.find((step) => step.id === activeAnalysis.id);
  const activeComponent = components.find((component) => component.id === activeAnalysis.id);

  renderComponentList();
  renderBuilderMetrics(analysis);
  renderTimeline(analysis);
  renderAnalysisDetail(activeStep, activeComponent);
  renderRecommendations(analysis);
}

function renderBuilderMetrics(analysis) {
  if (!hasBuilderPage) {
    return;
  }

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
  if (!hasBuilderPage) {
    return;
  }

  const dependencyItems = components.map((component) => {
    const hours = component.source === "purchase"
      ? numberValue(component.leadTime) * 24
      : numberValue(component.leadTime);

    return {
      id: component.id,
      label: `${component.name} dependency`,
      meta: component.source === "purchase" ? `${component.leadTime} day lead` : `${component.leadTime} hr internal cycle`,
      duration: Math.max(1, hours),
      type: "dependency",
      analysisType: "component"
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
      type: step.isBottleneck ? "bottleneck" : "process",
      analysisType: "step"
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
        <button
          class="timeline-row ${activeAnalysis.type === item.analysisType && activeAnalysis.id === item.id ? "active" : ""}"
          data-type="${item.type}"
          data-analysis-type="${item.analysisType}"
          data-analysis-id="${item.id}"
          draggable="${item.analysisType === "step"}"
          type="button"
        >
          <div>
            <strong>${item.label}</strong>
            <span>${item.meta}</span>
          </div>
          <div class="timeline-track">
            <span class="timeline-bar" style="left: ${left}%; width: ${Math.min(width, 100 - left)}%;"></span>
          </div>
          <em>${formatNumber(item.duration)} hr</em>
        </button>
      `;
    })
    .join("");
}

function renderAnalysisDetail(step, component) {
  if (!hasBuilderPage) {
    return;
  }

  if (component) {
    renderComponentDetail(component);
    return;
  }

  renderStepDetail(step);
}

function renderStepDetail(step) {
  if (!hasBuilderPage) {
    return;
  }

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
      <div class="button-row">
        <button class="button button-secondary full-button" type="submit">Update Selected Step</button>
        <button class="button button-danger full-button" data-remove-step="${step.id}" type="button">Remove Step</button>
      </div>
    </form>
  `;
}

function renderComponentDetail(component) {
  if (!hasBuilderPage) {
    return;
  }

  const alternative = componentAlternative(component);
  const currentTime = component.source === "purchase"
    ? `${component.leadTime} days`
    : `${component.leadTime} hours`;
  const alternativeTime = alternative.source === "purchase"
    ? `${formatNumber(alternative.leadTime)} days`
    : `${formatNumber(alternative.leadTime)} hours`;

  activeStepTitle.textContent = component.name;
  activeBottleneckBadge.classList.add("hidden");
  stepDetail.innerHTML = `
    <div class="detail-grid">
      <div><span>Current source</span><strong>${component.source === "purchase" ? "Purchased" : "In-house"}</strong></div>
      <div><span>Current cost</span><strong>$${formatNumber(component.cost, 2)}</strong></div>
      <div><span>Current timing</span><strong>${currentTime}</strong></div>
      <div><span>Modeled alternative</span><strong>${alternative.source === "purchase" ? "Buy" : "Make"}</strong></div>
    </div>
    <article class="recommendation-card">
      Alternative estimate: $${formatNumber(alternative.cost, 2)} per unit with ${alternativeTime} timing. ${makeVsBuyRecommendations().find((item) => item.includes(component.name)) || "Keep monitoring this component as demand changes."}
    </article>
    <button class="button button-danger full-button" data-remove-component="${component.id}" type="button">Remove Component</button>
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
  if (!hasBuilderPage) {
    return;
  }

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
  if (!hasBuilderPage) {
    return;
  }

  componentList.innerHTML = components.length
    ? components
        .map(
          (component) => `
            <article class="component-card">
              <button data-component-id="${component.id}" type="button">${component.name}</button>
              <span>${component.source === "purchase" ? "Purchased" : "Produced"} | $${formatNumber(component.cost, 2)} | ${component.leadTime} ${component.source === "purchase" ? "days" : "hrs"}</span>
            </article>
          `
        )
        .join("")
    : '<p class="empty-state">No components added yet.</p>';
}

function updateGoalResponse(goal = {}) {
  if (!hasBuilderPage) {
    return;
  }

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

function initBuilderPage() {
  if (!hasBuilderPage) {
    return;
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
    activeAnalysis = { type: "step", id: step.id };
    processForm.reset();
    renderBuilder();
  });

  componentForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(componentForm);
    const component = {
      id: createId("component"),
      name: formData.get("name").trim(),
      source: formData.get("source"),
      cost: numberValue(formData.get("cost"), 0),
      leadTime: numberValue(formData.get("leadTime"), 0)
    };

    components.push(component);
    activeAnalysis = { type: "component", id: component.id };
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

  processTimeline.addEventListener("click", (event) => {
    const row = event.target.closest("[data-analysis-id]");

    if (!row) {
      return;
    }

    activeAnalysis = {
      type: row.dataset.analysisType,
      id: row.dataset.analysisId
    };
    renderBuilder();
  });

  processTimeline.addEventListener("dblclick", (event) => {
    const row = event.target.closest('[data-analysis-type="step"]');

    if (!row) {
      return;
    }

    const step = processSteps.find((item) => item.id === row.dataset.analysisId);
    const nextName = window.prompt("Rename process step", step.name);

    if (nextName?.trim()) {
      step.name = nextName.trim();
      renderBuilder();
    }
  });

  processTimeline.addEventListener("dragstart", (event) => {
    const row = event.target.closest('[data-analysis-type="step"]');

    if (row) {
      event.dataTransfer.setData("text/plain", row.dataset.analysisId);
    }
  });

  processTimeline.addEventListener("dragover", (event) => {
    if (event.target.closest('[data-analysis-type="step"]')) {
      event.preventDefault();
    }
  });

  processTimeline.addEventListener("drop", (event) => {
    const target = event.target.closest('[data-analysis-type="step"]');
    const draggedId = event.dataTransfer.getData("text/plain");

    if (!target || !draggedId || target.dataset.analysisId === draggedId) {
      return;
    }

    const fromIndex = processSteps.findIndex((step) => step.id === draggedId);
    const toIndex = processSteps.findIndex((step) => step.id === target.dataset.analysisId);
    const [draggedStep] = processSteps.splice(fromIndex, 1);
    processSteps.splice(toIndex, 0, draggedStep);
    renderBuilder();
  });

  componentList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-component-id]");

    if (!button) {
      return;
    }

    activeAnalysis = { type: "component", id: button.dataset.componentId };
    renderBuilder();
  });

  clearLineButton.addEventListener("click", () => {
    processSteps.splice(0, processSteps.length);
    activeAnalysis = components[0]
      ? { type: "component", id: components[0].id }
      : { type: "empty", id: null };
    renderBuilder();
    updateGoalResponse({
      targetRate: document.getElementById("targetRate").value,
      targetQuantity: document.getElementById("targetQuantity").value,
      deadlineDate: document.getElementById("deadlineDate").value
    });
  });

  clearComponentsButton.addEventListener("click", () => {
    components.splice(0, components.length);
    activeAnalysis = processSteps[0]
      ? { type: "step", id: processSteps[0].id }
      : { type: "empty", id: null };
    renderBuilder();
  });

  stepDetail.addEventListener("submit", (event) => {
    if (event.target.id !== "stepEditForm") {
      return;
    }

    event.preventDefault();
    const step = processSteps.find((item) => item.id === activeAnalysis.id);
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

    const uploadCsvBtn = document.getElementById('uploadCsvBtn');
    const csvFileInput = document.getElementById('csvFileInput');

    if (uploadCsvBtn && csvFileInput) {
        const fileNameDisplay = document.getElementById('fileNameDisplay');
        const fileDropZone = document.getElementById('fileDropZone');

        // The ERP Alias Dictionary
        const columnAliases = {
            name: ['name', 'process', 'step', 'operation', 'description', 'op_description'],
            cycleTime: ['cycletime', 'cycle_time', 'run_time', 'time_per_part', 'processing_time', 'ct'],
            scrapRate: ['scraprate', 'scrap_rate', 'scrap', 'defect', 'quality', 'yield'],
            machines: ['machines', 'operators', 'crew_size', 'resources', 'headcount']
        };

        // Watch for file selection to trigger the Auto-Mapper
        csvFileInput.addEventListener('change', async function(e) {
            if (e.target.files.length > 0) {
                const file = e.target.files[0];
                if(fileNameDisplay) {
                    fileNameDisplay.textContent = "📄 " + file.name;
                    fileNameDisplay.style.color = "#f2ecdf"; // Matches your var(--text)
                }
                if(fileDropZone) fileDropZone.style.borderColor = "rgba(208, 138, 90, 0.48)"; 

                // 1. Read just the first line of the CSV to get headers
                const text = await file.text();
                const firstLine = text.split('\n')[0].trim();
                const headers = firstLine.split(',').map(h => h.trim());

                // 2. Populate the dropdown menus
                const selects = [document.getElementById('mapName'), document.getElementById('mapCycleTime'), document.getElementById('mapScrapRate'), document.getElementById('mapMachines')];
                
                selects.forEach(select => {
                    if(!select) return;
                    select.innerHTML = ''; 
                    headers.forEach(h => {
                        const opt = document.createElement('option');
                        opt.value = h;
                        opt.textContent = h;
                        select.appendChild(opt);
                    });
                });

                // 3. The Heuristic Matcher: Guess the best fit
                function guessHeader(headerList, aliasList) {
                    for (let h of headerList) {
                        const cleanH = h.toLowerCase().replace(/[^a-z0-9]/g, '');
                        for (let a of aliasList) {
                            const cleanA = a.toLowerCase().replace(/[^a-z0-9]/g, '');
                            if (cleanH.includes(cleanA) || cleanA.includes(cleanH)) return h;
                        }
                    }
                    return headerList[0]; // Fallback if no match
                }

                if(document.getElementById('mapName')) document.getElementById('mapName').value = guessHeader(headers, columnAliases.name);
                if(document.getElementById('mapCycleTime')) document.getElementById('mapCycleTime').value = guessHeader(headers, columnAliases.cycleTime);
                if(document.getElementById('mapScrapRate')) document.getElementById('mapScrapRate').value = guessHeader(headers, columnAliases.scrapRate);
                if(document.getElementById('mapMachines')) document.getElementById('mapMachines').value = guessHeader(headers, columnAliases.machines);

                // 4. Reveal the Mapping UI
                if(document.getElementById('columnMappingUI')) document.getElementById('columnMappingUI').style.display = 'block';
                uploadCsvBtn.innerText = "Confirm Mapping & Parse";

            } else {
                // Reset if they cancel
                if(fileNameDisplay) {
                    fileNameDisplay.textContent = "📁 Click to select a CSV file";
                    fileNameDisplay.style.color = "#a9b4c6"; // Matches your var(--muted)
                }
                if(fileDropZone) fileDropZone.style.borderColor = "#101b31"; // Matches your var(--panel-strong)
                if(document.getElementById('columnMappingUI')) document.getElementById('columnMappingUI').style.display = 'none';
                uploadCsvBtn.innerText = "Upload & Parse";
            }
        });

        uploadCsvBtn.addEventListener('click', async () => {
            const file = csvFileInput.files[0];
        
            if (!file) {
                alert("Please select a CSV file first.");
                return;
            }

            // 1. Package the file AND the column mapping into the payload
            const formData = new FormData();
            formData.append("file", file);
            formData.append("mapping", JSON.stringify({
                name: document.getElementById('mapName').value,
                cycleTime: document.getElementById('mapCycleTime').value,
                scrapRate: document.getElementById('mapScrapRate').value,
                machines: document.getElementById('mapMachines').value
            }));

            try {
                // 2. Send it to FastAPI
                uploadCsvBtn.innerText = "Uploading...";
                const response = await fetch('/api/upload-csv', {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) throw new Error("Upload failed");

                const data = await response.json();

                // 3. Update the global array
                processSteps = data.processSteps;

                // 4. Trigger UI refresh
                renderBuilder(); 
            
                // 5. Clean up the UI
                uploadCsvBtn.innerText = "Upload & Parse";
                csvFileInput.value = ""; 
                if(fileNameDisplay) {
                    fileNameDisplay.textContent = "📁 Click to select a CSV file";
                    fileNameDisplay.style.color = "#a9b4c6";
                }
                if(fileDropZone) fileDropZone.style.borderColor = "#101b31";
                if(document.getElementById('columnMappingUI')) document.getElementById('columnMappingUI').style.display = 'none';

            } catch (error) {
                console.error("Error parsing CSV:", error);
                alert("Failed to parse CSV. Check console for details.");
                uploadCsvBtn.innerText = "Upload & Parse";
            }
        });
    }
  stepDetail.addEventListener("click", (event) => {
    const removeStepButton = event.target.closest("[data-remove-step]");
    const removeComponentButton = event.target.closest("[data-remove-component]");

    if (removeStepButton) {
      const index = processSteps.findIndex((step) => step.id === removeStepButton.dataset.removeStep);
      if (index < 0) {
        return;
      }
      processSteps.splice(index, 1);
      activeAnalysis = processSteps[index] || processSteps[index - 1]
        ? { type: "step", id: (processSteps[index] || processSteps[index - 1]).id }
        : components[0]
          ? { type: "component", id: components[0].id }
          : { type: "empty", id: null };
      renderBuilder();
    }

    if (removeComponentButton) {
      const index = components.findIndex((component) => component.id === removeComponentButton.dataset.removeComponent);
      if (index < 0) {
        return;
      }
      components.splice(index, 1);
      activeAnalysis = components[index] || components[index - 1]
        ? { type: "component", id: (components[index] || components[index - 1]).id }
        : processSteps[0]
          ? { type: "step", id: processSteps[0].id }
          : { type: "empty", id: null };
      renderBuilder();
    }
  });

  renderBuilder();
  updateGoalResponse();
}

initLivePlannerPage();
initBuilderPage();
