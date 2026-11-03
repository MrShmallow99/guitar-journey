import hashlib
import json

from guitarlab import build


def test_output_is_deterministic():
    assert build.render() == build.render()


def test_hash_matches_content():
    payload = json.loads(build.render())
    meta = payload.pop("meta")
    canonical = json.dumps(payload, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    assert meta["content_sha256"] == hashlib.sha256(canonical.encode("utf-8")).hexdigest()
    assert meta["generator"] == "guitarlab"


def test_payload_shape():
    payload = build.build_payload()
    assert set(payload["scales"]) == {"minor_pentatonic", "major_pentatonic", "natural_minor", "major"}
    a_min = payload["scales"]["minor_pentatonic"]["keys"]["A"]
    assert [n["name"] for n in a_min["notes"]] == ["A", "C", "D", "E", "G"]
    # a cell row: [string_index, fret, name, interval, positions]
    assert [0, 5, "A", "1", [1, 5]] in a_min["cells"]  # shared by positions 1 and 5
    assert payload["scales"]["major"]["has_positions"] is False
    assert payload["scales"]["major"]["keys"]["C"]["positions"] == []
    assert len(payload["fret_positions"]["distance_from_nut_in"]) == payload["frets"] + 1


def test_check_mode(tmp_path):
    out = tmp_path / "fretboard.json"
    assert build.main(["--output", str(out), "--check"]) == 1  # missing file is stale
    assert build.main(["--output", str(out)]) == 0
    assert build.main(["--output", str(out), "--check"]) == 0
    out.write_text(out.read_text(encoding="utf-8").replace('"A"', '"H"', 1), encoding="utf-8")
    assert build.main(["--output", str(out), "--check"]) == 1


def test_committed_data_is_fresh():
    """The JSON the presentation loads must match what the code generates."""
    assert build.OUTPUT.read_text(encoding="utf-8") == build.render()
