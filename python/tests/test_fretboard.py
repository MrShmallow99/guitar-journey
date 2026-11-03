import pytest

from guitarlab.fretboard import (
    LES_PAUL_SCALE_IN,
    STANDARD_TUNING,
    fret_distances,
    note_grid,
    pentatonic_positions,
    scale_cells,
)
from guitarlab.theory import SCALE_TYPES, build_scale


def test_standard_tuning_pitches():
    # E2 A2 D3 G3 B3 E4
    assert [s.midi for s in STANDARD_TUNING] == [40, 45, 50, 55, 59, 64]
    assert [s.number for s in STANDARD_TUNING] == [6, 5, 4, 3, 2, 1]


def test_note_grid_landmarks():
    grid = note_grid()
    assert len(grid) == 6 and all(len(row) == 23 for row in grid)
    assert grid[0][5] == grid[1][0]  # 5th fret low E = open A
    assert grid[3][4] == grid[4][0]  # 4th fret G = open B (the B-string exception)
    assert grid[0][12] == grid[0][0] + 12  # 12th fret is the octave
    assert grid[5][0] == grid[0][0] + 24  # high E is two octaves above low E


def test_fret_distances():
    d = fret_distances()
    assert d[0] == 0
    assert d[12] == pytest.approx(LES_PAUL_SCALE_IN / 2)
    assert d[22] < LES_PAUL_SCALE_IN
    gaps = [b - a for a, b in zip(d, d[1:])]
    assert all(g1 > g2 for g1, g2 in zip(gaps, gaps[1:])), "frets get closer together"


def test_a_minor_pentatonic_position_1():
    """The classic first box: frets 5-8, root on the 5th fret of the low E."""
    pos1 = pentatonic_positions(build_scale("minor_pentatonic", "A"))[0]
    expected = [(0, 5), (0, 8), (1, 5), (1, 7), (2, 5), (2, 7), (3, 5), (3, 7), (4, 5), (4, 8), (5, 5), (5, 8)]
    assert pos1["notes"] == expected
    assert pos1["span"] == [5, 8]


def test_a_minor_pentatonic_all_positions():
    spans = [p["span"] for p in pentatonic_positions(build_scale("minor_pentatonic", "A"))]
    # Each box sits at the lowest fret where it fits, so position 4 is the open-position box.
    assert spans == [[5, 8], [7, 10], [9, 13], [0, 3], [2, 5]]


@pytest.mark.parametrize("scale_id", ["minor_pentatonic", "major_pentatonic"])
def test_positions_invariants_all_keys(scale_id):
    for tonic in SCALE_TYPES[scale_id].tonics:
        scale = build_scale(scale_id, tonic)
        pcs = {n.pc for n in scale}
        positions = pentatonic_positions(scale)
        assert [p["number"] for p in positions] == [1, 2, 3, 4, 5]
        covered = set()
        for p in positions:
            notes = p["notes"]
            assert len(notes) == 12  # two notes on each of six strings
            assert all(0 <= f <= 15 for _, f in notes)
            assert p["span"][1] - p["span"][0] <= 4, (tonic, p)  # playable without shifting
            for si, f in notes:
                assert (STANDARD_TUNING[si].midi + f) % 12 in pcs
                covered.add(si)
            # notes ascend in pitch through the box
            pitches = [STANDARD_TUNING[si].midi + f for si, f in notes]
            assert pitches == sorted(pitches) and len(set(pitches)) == 12
        assert covered == set(range(6))


def test_position_1_starts_on_root():
    for tonic in SCALE_TYPES["minor_pentatonic"].tonics:
        scale = build_scale("minor_pentatonic", tonic)
        si, f = pentatonic_positions(scale)[0]["notes"][0]
        assert si == 0 and (STANDARD_TUNING[0].midi + f) % 12 == scale[0].pc


def test_scale_cells_only_contain_scale_tones():
    scale = build_scale("major", "G")
    cells = scale_cells(scale)
    pcs = {n.pc for n in scale}
    assert all((STANDARD_TUNING[c.string_index].midi + c.fret) % 12 in pcs for c in cells)
    # 7 of 12 pitch classes, on 6 strings x 23 frets
    assert 70 < len(cells) < 90
    assert any(c.note.name == "F#" for c in cells) and not any(c.note.name == "Gb" for c in cells)
