// ==========================================
// 1. GLOBAL UTILITIES
// ==========================================
function numberValue(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  
  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
  
  function formatNumber(value, digits = 1) {
    if (!Number.isFinite(value)) return "0";
    return value.toLocaleString(undefined, {
      maximumFractionDigits: digits,
      minimumFractionDigits: value % 1 === 0 ? 0 : digits
    });
  }
  
  function createId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
  
  function cloneValue(value) {
    return JSON.parse(JSON.stringify(value));
  }
  
  function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  }
  
  function formatAge(timestamp) {
    const ageMs = Math.max(0, Date.now() - new Date(timestamp).getTime());
    if (ageMs < 60000) return `${Math.max(1, Math.round(ageMs / 1000))} sec`;
    return `${Math.round(ageMs / 60000)} min`;
  }
  
  function statusClass(status) {
    if (status === "Risk") return "status-risk";
    if (status === "Watch") return "status-watch";
    return "status-ok";
  }
  
  // ==========================================
  // 2. MANUFACTURING API (MOCK BACKEND)
  // ==========================================
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
          { id: "mes-step-layup", name: "Composite layup", station: "Cell C2", cycleTimeMin: 12.5, idealCycleTimeMin: 11.8, machinesActive: 2, uptimePercent: 94, scrapRatePercent: 2.5, queueMinutes: 8, state: "Running" },
          { id: "mes-step-cure", name: "Curing oven", station: "Oven A1", cycleTimeMin: 45, idealCycleTimeMin: 41, machinesActive: 1, uptimePercent: 91, scrapRatePercent: 0.5, queueMinutes: 18, state: "Watch" },
          { id: "mes-step-trim", name: "Trimming & inspection", station: "Inspection Q2", cycleTimeMin: 8, idealCycleTimeMin: 7.6, machinesActive: 3, uptimePercent: 88, scrapRatePercent: 5, queueMinutes: 5, state: "Watch" }
        ]
      },
      erp: {
        productionGoal: { targetRatePerHour: 18, totalQuantity: 500, deadlineDate: "2026-05-30" },
        components: [
          { id: "comp_001", name: "Carbon pre-preg roll", sourceType: "purchase", onHand: 14, reserved: 6, costPerUnit: 250, leadTimeDays: 5, risk: "warning" },
          { id: "comp_002", name: "Epoxy resin", sourceType: "purchase", onHand: 22, reserved: 4, costPerUnit: 45.5, leadTimeDays: 2, risk: "ok" }
        ]
      }
    };
  
    static async getNormalizedSnapshot() {
      const sequence = this.sequence + 1;
      this.sequence = sequence;
      
      let rawSnapshot;
      try {
        // Try to get data from Python
        const response = await fetch('/api/live-feed');
        if (!response.ok) throw new Error("Backend offline");
        const rawData = await response.json();
        
        rawSnapshot = {
          sequence: sequence,
          updatedAt: new Date().toISOString(),
          source: "fastapi-backend",
          mes: rawData.mes,
          erp: rawData.erp
        };
      } catch (error) {
        // FALLBACK: If Python isn't running, simulate it in JS so the dashboard doesn't freeze!
        const mes = cloneValue(this.baseModel.mes);
        mes.processSteps = mes.processSteps.map((step, index) => ({
          ...step,
          cycleTimeMin: Number((step.cycleTimeMin * (1 + Math.sin(sequence + index) * 0.05)).toFixed(2)),
          scrapRatePercent: Number(Math.max(0, step.scrapRatePercent + Math.cos(sequence + index) * 0.3).toFixed(2))
        }));

        rawSnapshot = {
          sequence: sequence,
          updatedAt: new Date().toISOString(),
          source: "js-mock-polling",
          mes: mes,
          erp: cloneValue(this.baseModel.erp)
        };
      }

      this.lastRawSnapshot = rawSnapshot;
      return this.normalizeSnapshot(rawSnapshot, sequence);
    }
  
    static subscribe(onUpdate, onError, options = {}) {
      const intervalMs = options.intervalMs || this.baseModel.refreshIntervalMs;
      let cancelled = false;
      let timerId = null;
  
      const poll = async () => {
        if (cancelled) return;
        try {
          const snapshot = await this.getNormalizedSnapshot();
          if (!cancelled) onUpdate(snapshot);
        } catch (error) {
          if (onError) onError(error);
        } finally {
          if (!cancelled) timerId = window.setTimeout(poll, intervalMs);
        }
      };
      poll();
      return () => {
        cancelled = true;
        if (timerId) window.clearTimeout(timerId);
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
  
        if (pressure < 0.88 || step.queueMinutes > 18) state = "Risk";
        else if (pressure < 1 || step.scrapRatePercent > 3.5) state = "Watch";
  
        return { ...step, grossThroughputPerHour: Number(grossThroughputPerHour.toFixed(2)), netThroughputPerHour: Number(netThroughputPerHour.toFixed(2)), oee: Number(oee.toFixed(2)), pressure: Number(pressure.toFixed(2)), state };
      });
  
      const bottleneckStep = steps.reduce((slowest, current) => !slowest ? current : (current.netThroughputPerHour < slowest.netThroughputPerHour ? current : slowest), null);
      const highestScrapStep = steps.reduce((highest, current) => !highest ? current : (current.scrapRatePercent > highest.scrapRatePercent ? current : highest), null);
  
      const lineThroughputPerHour = bottleneckStep ? bottleneckStep.netThroughputPerHour : 0;
      const lineOee = steps.length ? steps.reduce((sum, step) => sum + step.oee, 0) / steps.length : 0;
      const lineScrapRate = steps.length ? steps.reduce((sum, step) => sum + step.scrapRatePercent, 0) / steps.length : 0;
      const targetAttainment = targetRate > 0 ? (lineThroughputPerHour / targetRate) * 100 : 0;
      const healthScore = clamp(Math.round(lineOee * 0.45 + targetAttainment * 0.35 + (100 - lineScrapRate) * 0.2), 0, 100);
      const lineStatus = healthScore >= 82 ? "Running" : healthScore >= 68 ? "Watch" : "At risk";
  
      const recommendations = buildLineRecommendations({ steps, bottleneckStep, highestScrapStep, lineThroughputPerHour, lineOee, lineScrapRate, targetAttainment, targetRate, components: rawSnapshot.erp.components });
  
      return {
        sequence, updatedAt: rawSnapshot.updatedAt, source: rawSnapshot.source,
        line: {
          name: this.baseModel.lineName, shift: this.baseModel.shiftName, status: lineStatus, healthScore, healthLabel: lineStatus, throughputPerHour: Number(lineThroughputPerHour.toFixed(2)),
          oee: Number(lineOee.toFixed(2)), scrapRate: Number(lineScrapRate.toFixed(2)), targetAttainment: Number(targetAttainment.toFixed(2)), bottleneckStep, highestScrapStep
        },
        mes: rawSnapshot.mes,
        erp: { ...rawSnapshot.erp, productionGoal: { ...rawSnapshot.erp.productionGoal, deadlineDateLabel: new Date(rawSnapshot.erp.productionGoal.deadlineDate).toLocaleDateString() } },
        steps, recommendations,
        focusViews: [
          { id: "steps", title: "Step analysis", summary: "Raw per-step cycle time and throughput data." },
          { id: "graph", title: "Visual analysis", summary: "Visual telemetry for throughput and bottlenecks." },
          { id: "constraints", title: "ERP constraints", summary: "Materials, lead times, and pressure." }
        ],
        constraints: rawSnapshot.erp.components.map((component) => {
          const isRisky = component.leadTimeDays > 3 || component.onHand <= component.reserved;
          return { id: component.id, title: component.name, detail: `${component.sourceType === "purchase" ? "Purchase" : "Produce"} | ${component.onHand} on hand | ${component.reserved} reserved`, meta: `${component.leadTimeDays} day lead | ${isRisky ? "watch" : "stable"}`, severity: component.risk };
        })
      };
    }
  }
  
  function buildLineRecommendations(context) {
    const { bottleneckStep, highestScrapStep, lineThroughputPerHour, lineOee, targetAttainment, targetRate, components } = context;
    const recommendations = [];
  
    if (bottleneckStep) {
      const throughputGap = Math.max(0, targetRate - lineThroughputPerHour);
      recommendations.push({ title: `Protect ${bottleneckStep.name}`, body: `${bottleneckStep.name} is the bottleneck at ${formatNumber(bottleneckStep.netThroughputPerHour)} units/hr. Resequence work to recover ${formatNumber(throughputGap)} units/hr.`, severity: bottleneckStep.state === "Risk" ? "critical" : "warning" });
    }
    if (highestScrapStep) {
      recommendations.push({ title: `Reduce scrap at ${highestScrapStep.name}`, body: `${highestScrapStep.name} is losing ${formatNumber(highestScrapStep.scrapRatePercent)}%. Fix this to lift line OEE from ${formatNumber(lineOee)}%.`, severity: highestScrapStep.scrapRatePercent >= 4 ? "warning" : "info" });
    }
    const lowInventory = components.find((c) => c.onHand <= c.reserved || c.leadTimeDays > 3);
    if (lowInventory) {
      recommendations.push({ title: `Secure ${lowInventory.name}`, body: `${lowInventory.name} has ${lowInventory.onHand} on hand, ${lowInventory.reserved} reserved. Secure material.`, severity: "warning" });
    }
    recommendations.push({ title: "Keep the line balanced", body: `Current target attainment is ${formatNumber(targetAttainment)}%.`, severity: targetAttainment >= 100 ? "info" : "warning" });
    return recommendations.slice(0, 4);
  }
  
  // ==========================================
  // 3. PLANNER DASHBOARD LOGIC
  // ==========================================
  const scenarioList = document.getElementById("scenarioList");
  const timeframeFilters = document.getElementById("timeframeFilters");
  const timeframeDetail = document.getElementById("timeframeDetail");
  const scenarioName = document.getElementById("scenarioName");
  const solverMode = document.getElementById("solverMode");
  const narrative = document.getElementById("narrative");
  const scheduleTableBody = document.getElementById("scheduleTableBody");
  const tableViewContainer = document.getElementById("tableViewContainer"); 
  const graphViewContainer = document.getElementById("graphViewContainer"); 
  const resourceList = document.getElementById("resourceList");
  
  const metricEls = {
    onTime: document.getElementById("metricOnTime"), onTimeDelta: document.getElementById("metricOnTimeDelta"),
    utilization: document.getElementById("metricUtilization"), utilizationDelta: document.getElementById("metricUtilizationDelta"),
    reschedule: document.getElementById("metricReschedule"), rescheduleDelta: document.getElementById("metricRescheduleDelta"),
    risk: document.getElementById("metricRisk"), riskDelta: document.getElementById("metricRiskDelta")
  };
  
  const hasPlannerPage = Boolean(scenarioList && timeframeFilters && timeframeDetail && scenarioName && solverMode && narrative && scheduleTableBody && resourceList && tableViewContainer && graphViewContainer);
  
  const livePlannerState = { activeViewId: "steps", snapshot: null, unsubscribe: null };
  
  const timeframes = [
    { id: "Live", label: "Live", desc: "Real-time telemetry and active queue constraints.", refresh: "refresh every 5s", interval: 5000 },
    { id: "Shift", label: "Shift", desc: "Averaged metrics for the current 8-hour shift.", refresh: "updated hourly", interval: 3600000 },
    { id: "Day", label: "Day", desc: "Averaged metrics over the trailing 24 hours.", refresh: "updated daily", interval: 86400000 },
    { id: "Week", label: "Week", desc: "Historical performance over the last 7 days.", refresh: "updated weekly", interval: 604800000 },
    // Capped at 2,147,483,647 ms (24.8 days) to prevent 32-bit integer overflow loop!
    { id: "Month", label: "Month", desc: "Macro-level trends over 30 days.", refresh: "updated monthly", interval: 2147483647 }
  ];
  let activeTimeframe = timeframes[0];
  
  function renderTimeframeToggles() {
    if (!timeframeFilters) return;
    timeframeFilters.innerHTML = timeframes.map(tf => `<button class="chip ${tf.id === activeTimeframe.id ? 'active' : ''}" data-timeframe="${tf.id}">${tf.label}</button>`).join("");
    if (timeframeDetail) timeframeDetail.textContent = activeTimeframe.desc;
    if (solverMode) solverMode.textContent = `Mock MES/ERP feed | ${activeTimeframe.refresh}`;
  }
  
  function renderLiveViews(snapshot) {
    if (!hasPlannerPage || !snapshot) return;
    scenarioList.innerHTML = snapshot.focusViews.map(view => `
      <button class="scenario-button ${view.id === livePlannerState.activeViewId ? "active" : ""}" data-live-view-id="${view.id}">
        <strong>${view.title}</strong><p>${view.summary}</p>
      </button>`).join("");
  }
  
  function renderLiveMetrics(snapshot) {
    if (!hasPlannerPage || !snapshot) return;
    
    // Applying your exact logic: Tied to a Target OEE and Target Throughput
    const targetThr = snapshot.erp.productionGoal.targetRatePerHour; 
    const targetOee = 85.0;
    const targetScrap = 1.5;

    let oee = snapshot.line.oee;
    let thr = snapshot.line.throughputPerHour;
    let scr = snapshot.line.scrapRate;
    
    // When "Live", we show the actual volatile data from the feed
    if (activeTimeframe.id === "Shift") {
      oee = targetOee - 2.5;
      thr = targetThr - 1.2;
      scr = targetScrap + 0.8;
    } else if (activeTimeframe.id === "Day") {
      oee = targetOee - 1.0;
      thr = targetThr - 0.5;
      scr = targetScrap + 0.3;
    } else if (activeTimeframe.id === "Week") {
      oee = targetOee + 0.5;
      thr = targetThr + 0.2;
      scr = targetScrap - 0.2;
    } else if (activeTimeframe.id === "Month") {
      oee = targetOee + 1.2;
      thr = targetThr + 0.6;
      scr = targetScrap - 0.4;
    }
  
    metricEls.onTime.textContent = `${formatNumber(oee)}%`;
    metricEls.onTimeDelta.textContent = `Target ${formatNumber(targetThr, 1)}/hr`;
    metricEls.utilization.textContent = `${formatNumber(thr)}/hr`;
    metricEls.utilizationDelta.textContent = `Attainment ${formatNumber((thr/targetThr)*100)}%`;
    metricEls.reschedule.textContent = `${formatNumber(scr)}%`;
    metricEls.rescheduleDelta.textContent = snapshot.line.highestScrapStep ? `Highest scrap: ${snapshot.line.highestScrapStep.name}` : "No scrap leader";
    metricEls.risk.textContent = snapshot.line.healthLabel;
    metricEls.riskDelta.textContent = snapshot.line.bottleneckStep ? `Bottleneck: ${snapshot.line.bottleneckStep.name}` : "All steps balanced";
  }
  
  function renderLiveSteps(snapshot) {
    if (!hasPlannerPage || !snapshot) return;

    // --- 1. TIMEFRAME SMOOTHING MATH ---
    // Smooths individual step metrics so the table/graph visually shift with the KPIs
    const adjustedSteps = snapshot.steps.map(step => {
      let stepThr = step.netThroughputPerHour;
      let stepScrap = step.scrapRatePercent;
      let stepOee = step.oee;

      if (activeTimeframe.id === "Shift") { stepThr += 0.2; stepScrap = Math.max(0, stepScrap - 0.2); stepOee += 1.0; }
      if (activeTimeframe.id === "Day") { stepThr += 0.4; stepScrap = Math.max(0, stepScrap - 0.4); stepOee += 1.5; }
      if (activeTimeframe.id === "Week") { stepThr += 0.6; stepScrap = Math.max(0, stepScrap - 0.7); stepOee += 2.0; }
      if (activeTimeframe.id === "Month") { stepThr += 0.8; stepScrap = Math.max(0, stepScrap - 1.0); stepOee += 3.0; }

      return { ...step, netThroughputPerHour: stepThr, scrapRatePercent: stepScrap, oee: stepOee };
    });

    // --- 2. TOGGLE VIEWS ---
    const isGraphView = livePlannerState.activeViewId === "graph";
    if (tableViewContainer) tableViewContainer.style.display = isGraphView ? "none" : "block";
    if (graphViewContainer) graphViewContainer.style.display = isGraphView ? "flex" : "none";

    // --- 3. RENDER CONTENT ---
    if (isGraphView) {
      // Draw Graph using the adjusted steps
      const targetRate = snapshot.erp.productionGoal.targetRatePerHour;
      const maxThroughput = Math.max(...adjustedSteps.map(s => s.netThroughputPerHour), targetRate + 5);
      const targetHeightPct = (targetRate / maxThroughput) * 100;

      graphViewContainer.innerHTML = adjustedSteps.map(step => {
        const heightPct = (step.netThroughputPerHour / maxThroughput) * 100;
        const isBottleneck = snapshot.line.bottleneckStep && snapshot.line.bottleneckStep.id === step.id;
        const barColor = isBottleneck ? "rgba(255, 127, 150, 0.85)" : step.state === "Watch" ? "rgba(255, 184, 108, 0.6)" : "rgba(208, 138, 90, 0.85)";

        return `
          <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%; position: relative;">
            <div style="position: absolute; bottom: ${targetHeightPct}%; width: 100%; height: 1px; background: rgba(255,255,255,0.1); z-index: 0; pointer-events: none;"></div>
            <span style="font-size: 0.75rem; color: #f2ecdf; margin-bottom: 8px; font-weight: 500; z-index: 1;">${formatNumber(step.netThroughputPerHour)}</span>
            <div style="width: 100%; max-width: 48px; height: ${heightPct}%; background: ${barColor}; border-radius: 6px 6px 0 0; transition: height 0.4s cubic-bezier(0.22, 1, 0.36, 1), background 0.4s ease; z-index: 1;"></div>
            <span style="font-size: 0.7rem; color: #a9b4c6; text-align: center; margin-top: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;" title="${step.name}">${step.name.split(" ")[0]}</span>
          </div>
        `;
      }).join("");

    } else {
      // Draw Table using the adjusted steps
      scheduleTableBody.innerHTML = adjustedSteps.map(step => `
        <tr>
          <td>${step.name}</td><td>${step.station}</td><td>${formatNumber(step.cycleTimeMin)} min</td>
          <td>${formatNumber(step.netThroughputPerHour)} / hr</td><td>${formatNumber(step.scrapRatePercent)}%</td>
          <td>${formatNumber(step.oee)}%</td><td class="${statusClass(step.state === "Running" ? "On track" : step.state === "Watch" ? "Watch" : "Risk")}">${step.state}</td>
        </tr>`).join("");
    }
  }
  
  function renderLiveResources(snapshot) {
    if (!hasPlannerPage || !snapshot) return;
    resourceList.innerHTML = snapshot.constraints.map(c => `
      <article class="resource-card">
        <strong>${c.title}</strong><p>${c.detail}</p>
        <div class="resource-meta"><span>${c.meta}</span><span>${c.severity === "ok" ? "stable" : c.severity}</span></div>
      </article>`).join("");
  }
  
  function renderLiveNarrative(snapshot) {
    if (!hasPlannerPage || !snapshot) return;
    const bottleneck = snapshot.line.bottleneckStep ? snapshot.line.bottleneckStep.name : "no single step";
    const ageText = formatAge(snapshot.updatedAt);
  
    scenarioName.textContent = `${snapshot.line.name} | ${snapshot.line.shift}`;
    
    if (livePlannerState.activeViewId === "steps") {
      narrative.textContent = `The MES feed shows ${snapshot.steps.length} live steps. ${snapshot.line.bottleneckStep ? `${snapshot.line.bottleneckStep.name} is the bottleneck.` : "The line is currently balanced."} The snapshot is ${ageText} old.`;
      return;
    }
    if (livePlannerState.activeViewId === "graph") {
      narrative.textContent = `Visualizing live throughput across all steps. The red bar indicates the active pacing constraint (${bottleneck}) against the ${formatNumber(snapshot.erp.productionGoal.targetRatePerHour, 1)}/hr target line.`;
      return;
    }
    if (livePlannerState.activeViewId === "constraints") {
      narrative.textContent = `The ERP layer is constraining the line through active inventory. Keep an eye on ${bottleneck} while preserving the ${formatNumber(snapshot.erp.productionGoal.targetRatePerHour, 1)}/hr target.`;
      return;
    }
  }
  
  function renderLiveDashboard(snapshot) {
    if (!hasPlannerPage || !snapshot) return;
    livePlannerState.snapshot = snapshot;
    renderLiveViews(snapshot);
    renderLiveMetrics(snapshot);
    renderLiveSteps(snapshot);
    renderLiveResources(snapshot);
    renderLiveNarrative(snapshot);
  }
  
  function initLivePlannerPage() {
    if (!hasPlannerPage) return;
  
    // Helper function to restart the timer with the correct speed
    const startPolling = () => {
      if (livePlannerState.unsubscribe) livePlannerState.unsubscribe();
      livePlannerState.unsubscribe = ManufacturingAPI.subscribe(
        (snapshot) => renderLiveDashboard(snapshot),
        (error) => { console.error("API error:", error); },
        { intervalMs: activeTimeframe.interval } // <-- Uses the actual timeframe delay!
      );
    };

    scenarioList.addEventListener("click", (event) => {
      const button = event.target.closest("[data-live-view-id]");
      if (!button) return;
      livePlannerState.activeViewId = button.dataset.liveViewId;
      if (livePlannerState.snapshot) renderLiveDashboard(livePlannerState.snapshot);
    });
  
    timeframeFilters.addEventListener("click", (event) => {
      if (event.target.classList.contains("chip")) {
        const selectedId = event.target.dataset.timeframe;
        activeTimeframe = timeframes.find(tf => tf.id === selectedId);
        
        renderTimeframeToggles();
        startPolling(); // Automatically updates the background timer!

        if (livePlannerState.snapshot) renderLiveDashboard(livePlannerState.snapshot);
      }
    });
    
    renderTimeframeToggles();
    startPolling();
  }
  
  // ==========================================
  // 4. LINE BUILDER LOGIC
  // ==========================================
  let processSteps = [
    { id: "step-layup", name: "Composite Layup", cycleTime: 18, machines: 2, shiftHours: 8, scrapRate: 4, materialSource: "purchased" },
    { id: "step-cnc", name: "CNC Machining", cycleTime: 12, machines: 1, shiftHours: 8, scrapRate: 2, materialSource: "in-house" },
    { id: "step-assembly", name: "Final Assembly", cycleTime: 9, machines: 2, shiftHours: 7.5, scrapRate: 1.5, materialSource: "purchased" }
  ];
  
  let activeStepId = processSteps[0]?.id || null;
  let activeAnalysis = { type: "step", id: activeStepId };
  
  const processForm = document.getElementById("processForm");
  const goalForm = document.getElementById("goalForm");
  const analyzeLineButton = document.getElementById("analyzeLineButton");
  const clearLineButton = document.getElementById("clearLineButton");
  const processTimeline = document.getElementById("processTimeline");
  const stepDetail = document.getElementById("stepDetail");
  const activeStepTitle = document.getElementById("activeStepTitle");
  const activeBottleneckBadge = document.getElementById("activeBottleneckBadge");
  const recommendationList = document.getElementById("recommendationList");
  const goalResponse = document.getElementById("goalResponse");
  const lineStatus = document.getElementById("lineStatus");
  
  const builderMetricEls = {
    oee: document.getElementById("lineOee"), throughput: document.getElementById("lineThroughput"),
    downtime: document.getElementById("lineDowntime"), scrap: document.getElementById("lineScrap"),
    standardActual: document.getElementById("standardActual")
  };
  
  const hasBuilderPage = Boolean(processForm && goalForm && analyzeLineButton && clearLineButton && processTimeline && stepDetail && activeStepTitle && activeBottleneckBadge && recommendationList && goalResponse && lineStatus && builderMetricEls.oee && builderMetricEls.throughput && builderMetricEls.downtime && builderMetricEls.scrap && builderMetricEls.standardActual);
  
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
    const efficiencyScore = clamp(Math.round((utilizationRate * 0.38 + quality * 0.34 + availability * 0.16 + performance * 0.12) * 100), 0, 100);
    return { rawOutputPerHour, outputPerHour, utilizationRate, availability, quality, performance, efficiencyScore };
  }
  
  function analyzeProcesses() {
    const rawRates = processSteps.map((step) => {
      const machines = Math.max(1, numberValue(step.machines, 1));
      const cycleTime = Math.max(0.1, numberValue(step.cycleTime, 1));
      const scrapRate = clamp(numberValue(step.scrapRate, 0), 0, 100);
      return ((machines * 60) / cycleTime) * (1 - scrapRate / 100);
    });
    const averageOutput = rawRates.length ? rawRates.reduce((sum, rate) => sum + rate, 0) / rawRates.length : 0;
    const bottleneckThreshold = averageOutput * 0.85;
    const steps = processSteps.map((step) => {
      const metrics = calculateStepMetrics(step, averageOutput);
      return { ...step, metrics, isBottleneck: rawRates.length > 1 && metrics.outputPerHour < bottleneckThreshold };
    });
    const lineOutput = steps.length ? Math.min(...steps.map((s) => s.metrics.outputPerHour)) : 0;
    const standardOutput = steps.length ? Math.min(...steps.map((s) => s.metrics.rawOutputPerHour)) * averageShiftHours() : 0;
    const actualOutput = lineOutput * averageShiftHours();
    const averageScrap = steps.length ? steps.reduce((sum, s) => sum + numberValue(s.scrapRate), 0) / steps.length : 0;
    const averageAvailability = steps.length ? steps.reduce((sum, s) => sum + s.metrics.availability, 0) / steps.length : 0;
    const averagePerformance = steps.length ? steps.reduce((sum, s) => sum + s.metrics.performance, 0) / steps.length : 0;
    const quality = 1 - averageScrap / 100;
    const oee = clamp(averageAvailability * averagePerformance * quality * 100, 0, 100);
    return { steps, averageOutput, lineOutput, standardOutput, actualOutput, averageScrap, averageAvailability, oee, bottlenecks: steps.filter((s) => s.isBottleneck) };
  }
  
  function averageShiftHours() {
    if (!processSteps.length) return 0;
    return processSteps.reduce((sum, step) => sum + numberValue(step.shiftHours, 0), 0) / processSteps.length;
  }
  
  function renderBuilder() {
    if (!hasBuilderPage) return;
    const analysis = analyzeProcesses();
    const hasActiveStep = activeAnalysis.type === "step" && analysis.steps.some((step) => step.id === activeAnalysis.id);
    if (!hasActiveStep) activeAnalysis = analysis.steps[0] ? { type: "step", id: analysis.steps[0].id } : { type: "empty", id: null };
    activeStepId = activeAnalysis.type === "step" ? activeAnalysis.id : analysis.steps[0]?.id || null;
    const activeStep = analysis.steps.find((step) => step.id === activeAnalysis.id);
    renderBuilderMetrics(analysis);
    renderTimeline(analysis);
    renderStepDetail(activeStep);
    renderRecommendations(analysis);
  }
  
  function renderBuilderMetrics(analysis) {
    if (!hasBuilderPage) return;
    const downtime = clamp((1 - analysis.averageAvailability) * 100, 0, 100);
    builderMetricEls.oee.textContent = `${formatNumber(analysis.oee)}%`;
    builderMetricEls.throughput.textContent = `${formatNumber(analysis.lineOutput)}/hr`;
    builderMetricEls.downtime.textContent = `${formatNumber(downtime)}%`;
    builderMetricEls.scrap.textContent = `${formatNumber(analysis.averageScrap)}%`;
    builderMetricEls.standardActual.textContent = `${formatNumber(analysis.standardOutput, 0)} / ${formatNumber(analysis.actualOutput, 0)}`;
    lineStatus.textContent = analysis.bottlenecks.length ? `${analysis.bottlenecks.length} bottleneck flagged` : "Balanced flow";
  }
  
  function renderTimeline(analysis) {
    if (!hasBuilderPage) return;
    const timelineItems = analysis.steps.map((step) => {
      const duration = step.metrics.outputPerHour > 0 ? 100 / step.metrics.outputPerHour : 0;
      return { id: step.id, label: step.name, meta: `${formatNumber(step.metrics.outputPerHour)} units/hr`, duration: Math.max(0.5, duration), type: step.isBottleneck ? "bottleneck" : "process", analysisType: "step" };
    });
    const totalDuration = timelineItems.reduce((sum, item) => sum + item.duration, 0) || 1;
    let cursor = 0;
    if (!timelineItems.length) { processTimeline.innerHTML = '<p class="empty-state">Add a process step to generate a schedule.</p>'; return; }
    processTimeline.innerHTML = timelineItems.map((item) => {
      const left = (cursor / totalDuration) * 100;
      const width = Math.max((item.duration / totalDuration) * 100, 8);
      cursor += item.duration;
      return `<button class="timeline-row ${activeAnalysis.type === item.analysisType && activeAnalysis.id === item.id ? "active" : ""}" data-type="${item.type}" data-analysis-type="${item.analysisType}" data-analysis-id="${item.id}" draggable="true" type="button"><div><strong>${item.label}</strong><span>${item.meta}</span></div><div class="timeline-track"><span class="timeline-bar" style="left: ${left}%; width: ${Math.min(width, 100 - left)}%;"></span></div><em>${formatNumber(item.duration)} hr</em></button>`;
    }).join("");
  }
  
  function renderStepDetail(step) {
    if (!hasBuilderPage) return;
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
        <label><span>Materials source</span><select name="materialSource"><option value="purchased" ${step.materialSource === "purchased" ? "selected" : ""}>Purchased</option><option value="in-house" ${step.materialSource === "in-house" ? "selected" : ""}>Produced in-house</option></select></label>
        <div class="button-row">
          <button class="button button-secondary full-button" type="submit">Update Selected Step</button>
          <button class="button button-danger full-button" data-remove-step="${step.id}" type="button">Remove Step</button>
        </div>
      </form>
    `;
  }
  
  function renderRecommendations(analysis) {
    if (!hasBuilderPage) return;
    const bottleneckRecommendations = analysis.bottlenecks.flatMap((step) => {
      const rateGap = Math.max(0, analysis.averageOutput - step.metrics.outputPerHour);
      const addedMachines = Math.max(1, Math.ceil(rateGap / (60 / Math.max(0.1, step.cycleTime))));
      return [
        `Add ${addedMachines} parallel machine to ${step.name} to close a ${formatNumber(rateGap)} units/hr gap.`,
        `Reduce ${step.name} cycle time by 10-15% through setup reduction.`,
        `Cut ${step.name} scrap from ${formatNumber(step.scrapRate)}% to ${formatNumber(Math.max(0, step.scrapRate - 1))}% with material checks.`
      ];
    });
    const allRecommendations = [...bottleneckRecommendations].slice(0, 8);
    recommendationList.innerHTML = allRecommendations.length ? allRecommendations.map((item) => `<article class="recommendation-card">${item}</article>`).join("") : '<p class="empty-state">No constraints flagged yet.</p>';
  }
  
  function updateGoalResponse(goal = {}) {
    if (!hasBuilderPage) return;
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
    if (!requiredRate) { goalResponse.innerHTML = '<p class="empty-state">Enter a target output rate or a quantity with deadline to generate a goal plan.</p>'; return; }
    goalResponse.innerHTML = `
      <article class="goal-card" data-achievable="${achievable}">
        <strong>${achievable ? "Goal is achievable" : "Goal needs intervention"}</strong>
        <p>Current line capacity is ${formatNumber(analysis.lineOutput)} units/hr against a required ${formatNumber(requiredRate)} units/hr.</p>
        ${gap ? `<p>Gap: ${formatNumber(gap)} units/hr. Primary bottlenecks: ${bottleneckNames}.</p>` : ""}
      </article>
      <ul class="goal-guidelines">
        <li>${gap ? `Add parallel resources across bottleneck steps.` : "Maintain current staffing and protect material readiness windows."}</li>
        <li>Target the highest-scrap step first; each percentage point of yield improvement flows directly into full-line throughput.</li>
      </ul>
    `;
  }
  
  function initBuilderPage() {
    if (!hasBuilderPage) return;
  
    processForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(processForm);
      const step = { id: createId("step"), name: formData.get("name").trim(), cycleTime: numberValue(formData.get("cycleTime"), 1), machines: numberValue(formData.get("machines"), 1), shiftHours: numberValue(formData.get("shiftHours"), 8), scrapRate: numberValue(formData.get("scrapRate"), 0), materialSource: formData.get("materialSource") };
      processSteps.push(step);
      activeStepId = step.id;
      activeAnalysis = { type: "step", id: step.id };
      processForm.reset();
      renderBuilder();
    });
  
    goalForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(goalForm);
      updateGoalResponse({ targetRate: formData.get("targetRate"), targetQuantity: formData.get("targetQuantity"), deadlineDate: formData.get("deadlineDate") });
    });
  
    analyzeLineButton.addEventListener("click", () => {
      renderBuilder();
      updateGoalResponse({ targetRate: document.getElementById("targetRate").value, targetQuantity: document.getElementById("targetQuantity").value, deadlineDate: document.getElementById("deadlineDate").value });
    });
  
    processTimeline.addEventListener("click", (event) => {
      const row = event.target.closest("[data-analysis-id]");
      if (!row) return;
      activeAnalysis = { type: row.dataset.analysisType, id: row.dataset.analysisId };
      renderBuilder();
    });
  
    processTimeline.addEventListener("dblclick", (event) => {
      const row = event.target.closest('[data-analysis-type="step"]');
      if (!row) return;
      const step = processSteps.find((item) => item.id === row.dataset.analysisId);
      const nextName = window.prompt("Rename process step", step.name);
      if (nextName?.trim()) { step.name = nextName.trim(); renderBuilder(); }
    });
  
    processTimeline.addEventListener("dragstart", (event) => { const row = event.target.closest('[data-analysis-type="step"]'); if (row) event.dataTransfer.setData("text/plain", row.dataset.analysisId); });
    processTimeline.addEventListener("dragover", (event) => { if (event.target.closest('[data-analysis-type="step"]')) event.preventDefault(); });
    processTimeline.addEventListener("drop", (event) => {
      const target = event.target.closest('[data-analysis-type="step"]');
      const draggedId = event.dataTransfer.getData("text/plain");
      if (!target || !draggedId || target.dataset.analysisId === draggedId) return;
      const fromIndex = processSteps.findIndex((step) => step.id === draggedId);
      const toIndex = processSteps.findIndex((step) => step.id === target.dataset.analysisId);
      const [draggedStep] = processSteps.splice(fromIndex, 1);
      processSteps.splice(toIndex, 0, draggedStep);
      renderBuilder();
    });
  
    clearLineButton.addEventListener("click", () => {
      processSteps.splice(0, processSteps.length);
      activeAnalysis = { type: "empty", id: null };
      renderBuilder();
      updateGoalResponse({ targetRate: document.getElementById("targetRate").value, targetQuantity: document.getElementById("targetQuantity").value, deadlineDate: document.getElementById("deadlineDate").value });
    });
  
    stepDetail.addEventListener("click", (event) => {
      const removeStepButton = event.target.closest("[data-remove-step]");
      if (removeStepButton) {
        const index = processSteps.findIndex((step) => step.id === removeStepButton.dataset.removeStep);
        if (index < 0) return;
        processSteps.splice(index, 1);
        activeAnalysis = processSteps[index] || processSteps[index - 1] ? { type: "step", id: (processSteps[index] || processSteps[index - 1]).id } : { type: "empty", id: null };
        renderBuilder();
      }
    });
  
    const uploadCsvBtn = document.getElementById('uploadCsvBtn');
    const csvFileInput = document.getElementById('csvFileInput');
  
    if (uploadCsvBtn && csvFileInput) {
      const fileNameDisplay = document.getElementById('fileNameDisplay');
      const fileDropZone = document.getElementById('fileDropZone');
      const columnAliases = {
        name: ['name', 'process', 'step', 'operation', 'description', 'op_description'],
        cycleTime: ['cycletime', 'cycle_time', 'run_time', 'time_per_part', 'processing_time', 'ct'],
        scrapRate: ['scraprate', 'scrap_rate', 'scrap', 'defect', 'quality', 'yield'],
        machines: ['machines', 'operators', 'crew_size', 'resources', 'headcount']
      };
  
      csvFileInput.addEventListener('change', async function(e) {
        if (e.target.files.length > 0) {
          const file = e.target.files[0];
          if(fileNameDisplay) { fileNameDisplay.textContent = "📄 " + file.name; fileNameDisplay.style.color = "#f2ecdf"; }
          if(fileDropZone) fileDropZone.style.borderColor = "rgba(208, 138, 90, 0.48)"; 
  
          const text = await file.text();
          const firstLine = text.split('\n')[0].trim();
          const headers = firstLine.split(',').map(h => h.trim());
          const selects = [document.getElementById('mapName'), document.getElementById('mapCycleTime'), document.getElementById('mapScrapRate'), document.getElementById('mapMachines')];
          
          selects.forEach(select => {
            if(!select) return;
            select.innerHTML = ''; 
            headers.forEach(h => { const opt = document.createElement('option'); opt.value = h; opt.textContent = h; select.appendChild(opt); });
          });
  
          function guessHeader(headerList, aliasList) {
            for (let h of headerList) {
              const cleanH = h.toLowerCase().replace(/[^a-z0-9]/g, '');
              for (let a of aliasList) { const cleanA = a.toLowerCase().replace(/[^a-z0-9]/g, ''); if (cleanH.includes(cleanA) || cleanA.includes(cleanH)) return h; }
            }
            return headerList[0];
          }
  
          if(document.getElementById('mapName')) document.getElementById('mapName').value = guessHeader(headers, columnAliases.name);
          if(document.getElementById('mapCycleTime')) document.getElementById('mapCycleTime').value = guessHeader(headers, columnAliases.cycleTime);
          if(document.getElementById('mapScrapRate')) document.getElementById('mapScrapRate').value = guessHeader(headers, columnAliases.scrapRate);
          if(document.getElementById('mapMachines')) document.getElementById('mapMachines').value = guessHeader(headers, columnAliases.machines);
  
          if(document.getElementById('columnMappingUI')) document.getElementById('columnMappingUI').style.display = 'block';
          uploadCsvBtn.innerText = "Confirm Mapping & Parse";
        } else {
          if(fileNameDisplay) { fileNameDisplay.textContent = "📁 Click to select a CSV file"; fileNameDisplay.style.color = "#a9b4c6"; }
          if(fileDropZone) fileDropZone.style.borderColor = "#101b31";
          if(document.getElementById('columnMappingUI')) document.getElementById('columnMappingUI').style.display = 'none';
          uploadCsvBtn.innerText = "Upload & Parse";
        }
      });
  
      uploadCsvBtn.addEventListener('click', async () => {
        const file = csvFileInput.files[0];
        if (!file) { alert("Please select a CSV file first."); return; }
        const formData = new FormData();
        formData.append("file", file);
        formData.append("mapping", JSON.stringify({ name: document.getElementById('mapName').value, cycleTime: document.getElementById('mapCycleTime').value, scrapRate: document.getElementById('mapScrapRate').value, machines: document.getElementById('mapMachines').value, cycleTimeUnit: document.getElementById('cycleTimeUnit').value, scrapFormat: document.getElementById('scrapFormat').value }));
  
        try {
          uploadCsvBtn.innerText = "Uploading...";
          const response = await fetch('/api/upload-csv', { method: 'POST', body: formData });
          if (!response.ok) throw new Error("Upload failed");
          const data = await response.json();
          processSteps = data.processSteps;
          renderBuilder(); 
          uploadCsvBtn.innerText = "Upload & Parse";
          csvFileInput.value = ""; 
          if(fileNameDisplay) { fileNameDisplay.textContent = "📁 Click to select a CSV file"; fileNameDisplay.style.color = "#a9b4c6"; }
          if(fileDropZone) fileDropZone.style.borderColor = "#101b31";
          if(document.getElementById('columnMappingUI')) document.getElementById('columnMappingUI').style.display = 'none';
        } catch (error) {
          console.error("Error parsing CSV:", error);
          alert("Failed to parse CSV. Check console for details.");
          uploadCsvBtn.innerText = "Upload & Parse";
        }
      });
    }
  
    renderBuilder();
    updateGoalResponse();
  }
  
  // ==========================================
  // 5. INITIALIZE
  // ==========================================
  initLivePlannerPage();
  initBuilderPage();