#!/usr/bin/env python3
"""Qiskit-backed manufacturing line optimizer CLI.

Input can be passed as a JSON string argument or piped through stdin:

    python3 optimizer.py '{"steps":[...],"goal":{"targetRate":18}}'

The model creates a compact QUBO where binary decisions represent adding a
parallel resource or extending shift coverage for each process step. The
objective minimizes the squared production-rate gap plus implementation costs.
"""

from __future__ import annotations

import json
import sys
from dataclasses import dataclass
from typing import Any


@dataclass
class Step:
    name: str
    cycle_time: float
    machines: int
    shift_hours: float
    scrap_rate: float

    @property
    def output_per_hour(self) -> float:
        cycle = max(self.cycle_time, 0.1)
        machines = max(self.machines, 1)
        quality = max(0.0, 1.0 - self.scrap_rate / 100.0)
        return (machines * 60.0 / cycle) * quality

    @property
    def added_machine_gain(self) -> float:
        quality = max(0.0, 1.0 - self.scrap_rate / 100.0)
        return (60.0 / max(self.cycle_time, 0.1)) * quality

    @property
    def shift_gain(self) -> float:
        if self.shift_hours >= 12:
            return 0.0
        return self.output_per_hour * 0.12


def load_payload() -> dict[str, Any]:
    raw = sys.argv[1] if len(sys.argv) > 1 else sys.stdin.read()
    if not raw.strip():
        raise SystemExit("Expected JSON input with steps and optional goal.")
    return json.loads(raw)


def parse_steps(payload: dict[str, Any]) -> list[Step]:
    steps = []
    for item in payload.get("steps", []):
        steps.append(
            Step(
                name=str(item.get("name", "Unnamed step")),
                cycle_time=float(item.get("cycleTime", item.get("cycle_time", 1))),
                machines=int(item.get("machines", 1)),
                shift_hours=float(item.get("shiftHours", item.get("shift_hours", 8))),
                scrap_rate=float(item.get("scrapRate", item.get("scrap_rate", 0))),
            )
        )
    return steps


def target_rate(payload: dict[str, Any], current_rate: float) -> float:
    goal = payload.get("goal", {})
    explicit_rate = float(goal.get("targetRate") or goal.get("target_rate") or 0)
    return explicit_rate or current_rate * 1.15


def build_qubo(steps: list[Step], target: float):
    from qiskit_optimization import QuadraticProgram

    qp = QuadraticProgram("drydock_manufacturing_schedule")
    gains: dict[str, float] = {}
    costs: dict[str, float] = {}
    gap = max(0.0, target - min((step.output_per_hour for step in steps), default=0.0))

    for index, step in enumerate(steps):
        machine_var = f"add_machine_{index}"
        shift_var = f"extend_shift_{index}"
        qp.binary_var(machine_var)
        qp.binary_var(shift_var)
        gains[machine_var] = step.added_machine_gain
        gains[shift_var] = step.shift_gain
        costs[machine_var] = max(0.8, step.added_machine_gain * 0.18)
        costs[shift_var] = 0.65

    linear: dict[str, float] = {}
    quadratic: dict[tuple[str, str], float] = {}

    for var, gain in gains.items():
        linear[var] = costs[var] - 2 * gap * gain + gain * gain

    variables = list(gains)
    for left_index, left in enumerate(variables):
        for right in variables[left_index + 1 :]:
            quadratic[(left, right)] = 2 * gains[left] * gains[right]

    qp.minimize(constant=gap * gap, linear=linear, quadratic=quadratic)
    return qp, gains


def solve_qubo(qp):
    from qiskit_algorithms import QAOA
    from qiskit_algorithms.optimizers import COBYLA
    from qiskit_aer.primitives import Sampler
    from qiskit_optimization.algorithms import MinimumEigenOptimizer

    sampler = Sampler()
    qaoa = QAOA(sampler=sampler, optimizer=COBYLA(maxiter=80), reps=1)
    optimizer = MinimumEigenOptimizer(qaoa)
    return optimizer.solve(qp)


def classical_fallback(steps: list[Step], target: float) -> dict[str, int]:
    if not steps:
        return {}
    current = min(step.output_per_hour for step in steps)
    decisions: dict[str, int] = {}
    gap = max(0.0, target - current)
    ranked = sorted(enumerate(steps), key=lambda item: item[1].output_per_hour)

    for index, step in ranked:
        add_machine = f"add_machine_{index}"
        extend_shift = f"extend_shift_{index}"
        decisions[add_machine] = 0
        decisions[extend_shift] = 0
        if gap <= 0:
            continue
        decisions[add_machine] = 1
        gap -= step.added_machine_gain
        if gap > 0 and step.shift_gain > 0:
            decisions[extend_shift] = 1
            gap -= step.shift_gain

    return decisions


def build_response(payload: dict[str, Any]) -> dict[str, Any]:
    steps = parse_steps(payload)
    current_rate = min((step.output_per_hour for step in steps), default=0.0)
    target = target_rate(payload, current_rate)
    solver = "qiskit_qaoa"
    recommendations: list[str] = []

    try:
        qp, gains = build_qubo(steps, target)
        result = solve_qubo(qp)
        decisions = {name: int(round(result.variables_dict.get(name, 0))) for name in gains}
        objective = float(result.fval)
    except Exception as exc:  # Keeps the CLI useful before optional Qiskit deps are installed.
        solver = f"classical_fallback ({exc.__class__.__name__})"
        decisions = classical_fallback(steps, target)
        objective = 0.0

    optimized_rate = current_rate
    schedule = []
    for index, step in enumerate(steps):
        machine_key = f"add_machine_{index}"
        shift_key = f"extend_shift_{index}"
        gain = 0.0
        actions = []
        if decisions.get(machine_key):
            gain += step.added_machine_gain
            actions.append("add one parallel machine/operator")
        if decisions.get(shift_key):
            gain += step.shift_gain
            actions.append("extend shift coverage")
        optimized_rate = max(optimized_rate, min(target, step.output_per_hour + gain))
        schedule.append(
            {
                "step": step.name,
                "base_output_per_hour": round(step.output_per_hour, 3),
                "optimized_output_per_hour": round(step.output_per_hour + gain, 3),
                "actions": actions or ["hold current configuration"],
            }
        )
        if actions:
            recommendations.append(f"{step.name}: {', '.join(actions)}.")

    return {
        "solver": solver,
        "target_output_per_hour": round(target, 3),
        "current_output_per_hour": round(current_rate, 3),
        "optimized_output_per_hour": round(optimized_rate, 3),
        "meets_goal": optimized_rate >= target,
        "objective_value": round(objective, 3),
        "schedule": schedule,
        "recommendations": recommendations,
    }


def main() -> None:
    payload = load_payload()
    print(json.dumps(build_response(payload), indent=2))


if __name__ == "__main__":
    main()
