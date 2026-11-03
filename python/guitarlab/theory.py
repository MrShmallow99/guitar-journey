"""Pitch-class arithmetic and correctly spelled scales.

Scales are spelled the way musicians write them: a seven-note scale uses each
letter A-G exactly once, so F major contains Bb (not A#) and E major contains
G# (not Ab). Pentatonic scales are derived from their seven-note parent scale,
which keeps their spelling consistent with it.
"""

from __future__ import annotations

from dataclasses import dataclass

LETTERS = "CDEFGAB"
LETTER_PC = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}
ACCIDENTALS = {-2: "bb", -1: "b", 0: "", 1: "#", 2: "##"}

# Interval label for each semitone distance above the root, as used for the
# scales generated here (none of them contains an augmented fourth).
INTERVAL_LABELS = ("1", "b2", "2", "b3", "3", "4", "b5", "5", "b6", "6", "b7", "7")

MAJOR_STEPS = (0, 2, 4, 5, 7, 9, 11)
NATURAL_MINOR_STEPS = (0, 2, 3, 5, 7, 8, 10)


@dataclass(frozen=True)
class ScaleType:
    id: str
    name_en: str
    parent_steps: tuple[int, ...]
    # Indexes into the parent scale; None means "all seven degrees".
    degrees: tuple[int, ...] | None
    # Conventional tonic spellings for this scale family (minimise accidentals).
    tonics: tuple[str, ...]


MINOR_TONICS = ("C", "C#", "D", "Eb", "E", "F", "F#", "G", "G#", "A", "Bb", "B")
MAJOR_TONICS = ("C", "Db", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B")

SCALE_TYPES: dict[str, ScaleType] = {
    s.id: s
    for s in (
        ScaleType("minor_pentatonic", "Minor pentatonic", NATURAL_MINOR_STEPS, (0, 2, 3, 4, 6), MINOR_TONICS),
        ScaleType("major_pentatonic", "Major pentatonic", MAJOR_STEPS, (0, 1, 2, 4, 5), MAJOR_TONICS),
        ScaleType("natural_minor", "Natural minor (Aeolian)", NATURAL_MINOR_STEPS, None, MINOR_TONICS),
        ScaleType("major", "Major (Ionian)", MAJOR_STEPS, None, MAJOR_TONICS),
    )
}


def note_pc(name: str) -> int:
    """Pitch class (0-11) of a note name such as 'C', 'F#', 'Bb' or 'E##'."""
    letter, accidental = name[0].upper(), name[1:]
    if letter not in LETTER_PC or accidental not in ACCIDENTALS.values():
        raise ValueError(f"not a note name: {name!r}")
    shift = accidental.count("#") - accidental.count("b")
    return (LETTER_PC[letter] + shift) % 12


def spell_heptatonic(tonic: str, steps: tuple[int, ...]) -> list[str]:
    """Spell a seven-note scale so each letter appears exactly once."""
    root_pc = note_pc(tonic)
    start = LETTERS.index(tonic[0].upper())
    names = []
    for i, step in enumerate(steps):
        letter = LETTERS[(start + i) % 7]
        diff = (root_pc + step - LETTER_PC[letter]) % 12
        if diff > 6:
            diff -= 12
        if diff not in ACCIDENTALS:
            raise ValueError(f"{tonic} needs a triple accidental on degree {i + 1}")
        names.append(letter + ACCIDENTALS[diff])
    return names


@dataclass(frozen=True)
class ScaleNote:
    name: str
    pc: int
    interval: str  # label relative to the root, e.g. "b3"


def build_scale(scale_id: str, tonic: str) -> list[ScaleNote]:
    """Notes of a scale in ascending degree order, starting from the root."""
    scale = SCALE_TYPES[scale_id]
    parent_names = spell_heptatonic(tonic, scale.parent_steps)
    degrees = scale.degrees if scale.degrees is not None else range(7)
    root_pc = note_pc(tonic)
    notes = []
    for d in degrees:
        semis = scale.parent_steps[d]
        notes.append(ScaleNote(parent_names[d], (root_pc + semis) % 12, INTERVAL_LABELS[semis]))
    return notes
