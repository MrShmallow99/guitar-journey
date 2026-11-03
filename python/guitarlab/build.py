"""Generate src/data/fretboard.json for the presentation.

Usage (from the python/ directory):
    python -m guitarlab.build           # write the data file
    python -m guitarlab.build --check   # exit 1 if the committed file is stale
"""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
from pathlib import Path

from . import __version__
from .fretboard import (
    FRET_COUNT,
    LES_PAUL_SCALE_IN,
    POSITION_MAX_FRET,
    STANDARD_TUNING,
    fret_distances,
    note_grid,
    pentatonic_positions,
    scale_cells,
    scale_has_positions,
)
from .theory import SCALE_TYPES, build_scale

SCHEMA_VERSION = 1
REPO_ROOT = Path(__file__).resolve().parents[2]
OUTPUT = REPO_ROOT / "src" / "data" / "fretboard.json"


def build_payload() -> dict:
    """Assemble the full data set. Deterministic: same code -> same bytes."""
    scales = {}
    for scale_id, scale_type in SCALE_TYPES.items():
        keys = {}
        for tonic in scale_type.tonics:
            notes = build_scale(scale_id, tonic)
            positions = pentatonic_positions(notes) if scale_has_positions(scale_id) else []
            membership = {}
            for p in positions:
                for si, f in p["notes"]:
                    membership.setdefault((si, f), []).append(p["number"])
            keys[tonic] = {
                "notes": [{"name": n.name, "pc": n.pc, "interval": n.interval} for n in notes],
                # Compact cell rows: [string_index, fret, note_name, interval, [positions]]
                "cells": [
                    [c.string_index, c.fret, c.note.name, c.note.interval, membership.get((c.string_index, c.fret), [])]
                    for c in scale_cells(notes)
                ],
                "positions": [{"number": p["number"], "span": p["span"]} for p in positions],
            }
        scales[scale_id] = {"name_en": scale_type.name_en, "has_positions": scale_has_positions(scale_id), "keys": keys}

    data = {
        "tuning": {
            "name": "standard",
            "strings": [{"number": s.number, "name": s.name, "midi": s.midi} for s in STANDARD_TUNING],
        },
        "frets": FRET_COUNT,
        "position_max_fret": POSITION_MAX_FRET,
        "midi_grid": note_grid(),
        "fret_positions": {
            "scale_length_in": LES_PAUL_SCALE_IN,
            "distance_from_nut_in": [round(d, 4) for d in fret_distances()],
        },
        "scales": scales,
    }
    digest = hashlib.sha256(_canonical(data).encode("utf-8")).hexdigest()
    return {
        "meta": {
            "generator": "guitarlab",
            "generator_version": __version__,
            "schema_version": SCHEMA_VERSION,
            "source": "python/guitarlab/build.py",
            "content_sha256": digest,
        },
        **data,
    }


def _canonical(obj) -> str:
    return json.dumps(obj, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def render() -> str:
    return _canonical(build_payload()) + "\n"


def summary(payload: dict) -> str:
    n_keys = sum(len(s["keys"]) for s in payload["scales"].values())
    return (
        f"guitarlab {payload['meta']['generator_version']}: {len(payload['scales'])} scale types, "
        f"{n_keys} scale/key combinations, {payload['frets']} frets, "
        f"sha256 {payload['meta']['content_sha256'][:12]}"
    )


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--check", action="store_true", help="verify the committed file is up to date")
    parser.add_argument("--output", type=Path, default=OUTPUT)
    args = parser.parse_args(argv)

    text = render()
    payload = json.loads(text)
    if args.check:
        current = args.output.read_text(encoding="utf-8") if args.output.exists() else None
        if current != text:
            print(f"STALE: {args.output} does not match the generator output. Run: python -m guitarlab.build")
            return 1
        print(f"OK: {args.output} is up to date. {summary(payload)}")
        return 0

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(text, encoding="utf-8", newline="\n")
    print(f"Wrote {args.output} ({len(text.encode('utf-8')) // 1024} KB). {summary(payload)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
