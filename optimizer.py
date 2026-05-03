#!/usr/bin/env python3
"""Deterministic manufacturing line optimizer CLI.

Input can be passed as a JSON string argument or piped through stdin:

    python3 optimizer.py '{"steps":[...],"goal":{"targetRate":18}}'

The phase-1 optimizer uses rules-based throughput math and does not depend on
quantum or LLM services. It ranks bottlenecks, suggests capacity moves, and
returns a compact schedule summary that mirrors the browser dashboard.
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
    def quality(self) -> float:
        return max(0.0, 1.0 - self.scrap_rate / 100.0)

    @property
    def output_per_hour(self) -> float:
        cycle = max(self.cycle_time, 0.1)
        machines = max(self.machines, 1)
        return (machines * 60.0 / cycle) * self.quality

    @property
    def added_machine_gain(self) -> float:
        return (60.0 / max(self.cycle_time, 0.1)) * self.quality

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
    steps: list[Step] = []
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


def build_response(payload: dict[str, Any]) -> dict[str, Any]:
    steps = parse_steps(payload)
    if not steps:
        return {
            "solver": "rules_based_v1",
            "target_output_per_hour": 0.0,
            "current_output_per_hour": 0.0,
            "optimized_output_per_hour": 0.0,
            "meets_goal": False,
            "objective_value": 0.0,
            "schedule": [],
            "recommendations": ["Add at least one process step before optimizing."],
        }

    current_rate = min(step.output_per_hour for step in steps)
    target = target_rate(payload, current_rate)
    gap = max(0.0, target - current_rate)
    ranked = sorted(enumerate(steps), key=lambda item: item[1].output_per_hour)

    recommendations: list[str] = []
    schedule = []
    optimized_rate = current_rate

    for index, step in enumerate(steps):
        machine_gain = 0.0
        shift_gain = 0.0
        actions = []

        if gap > 0 and ranked and ranked[0][0] == index:
            machine_gain = step.added_machine_gain
            actions.append("add one parallel machine/operator")
            if step.shift_gain > 0:
                shift_gain = step.shift_gain
                actions.append("extend shift coverage")

        optimized_step_rate = step.output_per_hour + machine_gain + shift_gain
        optimized_rate = max(optimized_rate, min(target, optimized_step_rate))
        schedule.append(
            {
                "step": step.name,
                "base_output_per_hour": round(step.output_per_hour, 3),
                "optimized_output_per_hour": round(optimized_step_rate, 3),
                "actions": actions or ["hold current configuration"],
            }
        )

        if actions:
            recommendations.append(f"{step.name}: {', '.join(actions)}.")

    if gap > 0:
        bottleneck = ranked[0][1]
        recommendations.insert(
            0,
            (
                f"{bottleneck.name} is the bottleneck at {bottleneck.output_per_hour:.3f} units/hr. "
                f"Prioritize it first to recover the {gap:.3f} units/hr target gap."
            ),
        )

    objective_value = max(0.0, target - optimized_rate)

    return {
        "solver": "rules_based_v1",
        "target_output_per_hour": round(target, 3),
        "current_output_per_hour": round(current_rate, 3),
        "optimized_output_per_hour": round(optimized_rate, 3),
        "meets_goal": optimized_rate >= target,
        "objective_value": round(objective_value, 3),
        "schedule": schedule,
        "recommendations": recommendations,
    }


def main() -> None:
    payload = load_payload()
    print(json.dumps(build_response(payload), indent=2))


if __name__ == "__main__":
    main()
