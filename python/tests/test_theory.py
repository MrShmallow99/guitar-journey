import pytest

from guitarlab.theory import SCALE_TYPES, build_scale, note_pc, spell_heptatonic


def names(scale_id, tonic):
    return [n.name for n in build_scale(scale_id, tonic)]


def test_note_pc():
    assert note_pc("C") == 0
    assert note_pc("F#") == note_pc("Gb") == 6
    assert note_pc("Cb") == 11
    assert note_pc("B#") == 0
    with pytest.raises(ValueError):
        note_pc("H")


@pytest.mark.parametrize(
    "tonic, expected",
    [
        ("C", ["C", "D", "E", "F", "G", "A", "B"]),
        ("F", ["F", "G", "A", "Bb", "C", "D", "E"]),
        ("E", ["E", "F#", "G#", "A", "B", "C#", "D#"]),
        ("F#", ["F#", "G#", "A#", "B", "C#", "D#", "E#"]),
    ],
)
def test_major_spelling(tonic, expected):
    assert names("major", tonic) == expected


def test_minor_and_pentatonic_spelling():
    assert names("natural_minor", "A") == ["A", "B", "C", "D", "E", "F", "G"]
    assert names("minor_pentatonic", "A") == ["A", "C", "D", "E", "G"]
    assert names("minor_pentatonic", "E") == ["E", "G", "A", "B", "D"]
    assert names("major_pentatonic", "G") == ["G", "A", "B", "D", "E"]
    assert names("minor_pentatonic", "Bb") == ["Bb", "Db", "Eb", "F", "Ab"]


def test_intervals():
    assert [n.interval for n in build_scale("minor_pentatonic", "A")] == ["1", "b3", "4", "5", "b7"]
    assert [n.interval for n in build_scale("major_pentatonic", "C")] == ["1", "2", "3", "5", "6"]
    assert [n.interval for n in build_scale("major", "D")] == ["1", "2", "3", "4", "5", "6", "7"]


@pytest.mark.parametrize("scale_id", sorted(SCALE_TYPES))
def test_every_offered_key_spells_cleanly(scale_id):
    """Each offered key uses each letter at most once and no double accidentals."""
    for tonic in SCALE_TYPES[scale_id].tonics:
        notes = build_scale(scale_id, tonic)
        letters = [n.name[0] for n in notes]
        assert len(set(letters)) == len(letters), (scale_id, tonic)
        assert not any("##" in n.name or "bb" in n.name for n in notes), (scale_id, tonic)
        # spelling and pitch class agree
        assert all(note_pc(n.name) == n.pc for n in notes)


def test_offered_tonics_cover_all_pitch_classes():
    for scale_type in SCALE_TYPES.values():
        assert sorted(note_pc(t) for t in scale_type.tonics) == list(range(12))


def test_relative_keys_share_notes():
    assert set(names("minor_pentatonic", "A")) == set(names("major_pentatonic", "C"))
    assert set(spell_heptatonic("A", (0, 2, 3, 5, 7, 8, 10))) == set(names("major", "C"))
