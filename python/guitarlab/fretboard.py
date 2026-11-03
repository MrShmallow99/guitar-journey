"""Fretboard geometry and scale mapping for a six-string guitar.

Strings are listed from the lowest-pitched (6th, low E) to the highest
(1st, high E), matching the order used in tablature from bottom to top.
"""

from __future__ import annotations

from dataclasses import dataclass

from .theory import SCALE_TYPES, ScaleNote, build_scale


@dataclass(frozen=True)
class GuitarString:
    number: int  # guitarist numbering: 1 = high E ... 6 = low E
    name: str
    midi: int  # open-string pitch


STANDARD_TUNING = (
    GuitarString(6, "E", 40),  # E2
    GuitarString(5, "A", 45),  # A2
    GuitarString(4, "D", 50),  # D3
    GuitarString(3, "G", 55),  # G3
    GuitarString(2, "B", 59),  # B3
    GuitarString(1, "E", 64),  # E4
)

FRET_COUNT = 22  # a Les Paul has 22 frets
POSITION_MAX_FRET = 15  # pentatonic boxes are placed within frets 0-15
LES_PAUL_SCALE_IN = 24.75  # nominal scale length in inches


def fret_distances(scale_length: float = LES_PAUL_SCALE_IN, frets: int = FRET_COUNT) -> list[float]:
    """Distance from the nut to each fret (index 0 = nut = 0.0).

    Equal temperament: each fret shortens the vibrating length by a factor of
    2 ** (1/12), so d(n) = L * (1 - 2 ** (-n / 12)). Fret 12 lands at L / 2.
    """
    return [scale_length * (1 - 2 ** (-n / 12)) for n in range(frets + 1)]


def note_grid(tuning=STANDARD_TUNING, frets: int = FRET_COUNT) -> list[list[int]]:
    """MIDI pitch at every (string, fret), strings ordered low to high."""
    return [[s.midi + f for f in range(frets + 1)] for s in tuning]


@dataclass(frozen=True)
class Cell:
    string_index: int  # 0 = low E string
    fret: int
    note: ScaleNote


def scale_cells(scale: list[ScaleNote], tuning=STANDARD_TUNING, frets: int = FRET_COUNT) -> list[Cell]:
    """Every fretboard location whose pitch belongs to the scale."""
    by_pc = {n.pc: n for n in scale}
    cells = []
    for si, s in enumerate(tuning):
        for f in range(frets + 1):
            note = by_pc.get((s.midi + f) % 12)
            if note:
                cells.append(Cell(si, f, note))
    return cells


def _box(scale_pcs: list[int], start_degree: int, start_fret: int, tuning) -> list[tuple[int, int]]:
    """Two-notes-per-string box starting on the low string at start_fret.

    Walks up the scale from the starting pitch and gives each string the next
    two scale tones, so the B-string offset is handled by pitch arithmetic.
    """
    pitch = tuning[0].midi + start_fret
    degree = start_degree
    out = []
    for si, s in enumerate(tuning):
        for _ in range(2):
            out.append((si, pitch - s.midi))
            step = (scale_pcs[(degree + 1) % len(scale_pcs)] - scale_pcs[degree]) % 12
            pitch += step
            degree = (degree + 1) % len(scale_pcs)
    return out


def pentatonic_positions(scale: list[ScaleNote], tuning=STANDARD_TUNING, max_fret: int = POSITION_MAX_FRET):
    """The five standard pentatonic positions (CAGED-style 'boxes').

    Position k starts on scale degree k on the low E string. It is placed at
    the lowest fret where the whole box fits on the neck (no negative frets),
    so every box lies within frets 0-15.
    """
    if len(scale) != 5:
        raise ValueError("pentatonic positions need a five-note scale")
    pcs = [n.pc for n in scale]
    root_fret = (pcs[0] - tuning[0].midi) % 12
    positions = []
    for k in range(5):
        start = root_fret + (pcs[k] - pcs[0]) % 12
        start %= 12
        box = _box(pcs, k, start, tuning)
        if min(f for _, f in box) < 0:
            box = _box(pcs, k, start + 12, tuning)
        if max(f for _, f in box) > max_fret:
            raise ValueError(f"position {k + 1} does not fit within frets 0-{max_fret}")
        frets = [f for _, f in box]
        positions.append({"number": k + 1, "notes": box, "span": [min(frets), max(frets)]})
    return positions


def scale_has_positions(scale_id: str) -> bool:
    scale_type = SCALE_TYPES[scale_id]
    return scale_type.degrees is not None and len(scale_type.degrees) == 5


__all__ = [
    "STANDARD_TUNING",
    "FRET_COUNT",
    "POSITION_MAX_FRET",
    "LES_PAUL_SCALE_IN",
    "fret_distances",
    "note_grid",
    "scale_cells",
    "pentatonic_positions",
    "scale_has_positions",
    "build_scale",
]
