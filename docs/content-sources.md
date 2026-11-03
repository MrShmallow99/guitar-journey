# Content Sources and Verification Status

Every factual claim shown in the presentation is listed here. **Nothing in this file has been verified against external sources yet.** The claims were written from general knowledge, and they must be checked before the final presentation.

Status key: ⏳ needs verification · ✅ verified (with source) · ✏️ reworded or removed after checking

## Jimmy Page's Les Paul "Number One" (slide 8)

| # | Claim on the slide | Status | Notes for verification |
|---|---|---|---|
| N1 | It is a 1959 Gibson Les Paul Standard | ⏳ | Widely reported. The serial number is commonly said to have been removed, so the year may be attributed from construction details. Confirm how sources phrase this, and consider wording such as "late-1950s". |
| N2 | Page bought it from Joe Walsh in 1969 | ⏳ | Widely reported. The purchase price varies between sources, so it is deliberately not stated. |
| N3 | The neck was shaved to a slim profile | ⏳ | Widely reported to have been done *before* Page owned it. The slide uses a passive phrasing, so it doesn't say who did it. |
| N4 | It was his main guitar during the Led Zeppelin years ("ליוותה אותו בשנות לד זפלין") | ⏳ | Check which albums and tours. Avoid overstating "every recording". |
| N5 | Two humbuckers, a 3-way toggle, and volume/tone per pickup | ⏳ | This is the standard Les Paul Standard layout. Number One was **modified later** (reportedly in the 1980s, adding switching options). The slide describes the general layout only. Confirm before adding detail. |

**The 3D model is not a historical reproduction.** Pickup covers, knob style, tuners, the headstock shape, and the presence or absence of a pickguard were chosen for the generic look of a single-cut, not to match Number One. The model shows no logos. If the final model aims to resemble Number One more closely, collect reference material, such as licensed photos or published specifications, and note the sources here.

## Technical claims

| # | Claim | Slide | Status | Notes |
|---|---|---|---|---|
| T1 | Lowering the guitar's volume knob cleans up a tube amp set for distortion | 8 | ⏳ | A well-established effect with passive pickups. It is less pronounced with some pedals and solid-state amps, and the amount of treble loss depends on the circuit. |
| T2 | Neck pickup is warmer and rounder; bridge pickup is brighter | 8 | ⏳ | General principle (string-vibration position). |
| T3 | Fret positions follow d(n) = L·(1 − 2^(−n/12)) | 7 (data) | ✅ | Equal temperament. Fret 12 at L/2 is tested in `python/tests/test_fretboard.py`. Real guitars add compensation at the saddle, which the diagram ignores. |
| T4 | Pentatonic "positions" and scale spellings | 7 (data) | ✅ | Generated algorithmically and checked by tests against the known A minor pentatonic boxes (5–8, 7–10, 9–13, 0–3/12–15, 2–5) and correct spellings (F major has Bb, E major has G#). |

## Learning principles

| # | Claim | Slides | Status | Suggested source to cite |
|---|---|---|---|---|
| L1 | Short, frequent, focused practice usually beats long, infrequent sessions (distributed practice) | 10 | ⏳ | Spacing-effect and motor-learning literature, e.g. reviews of distributed vs. massed practice |
| L2 | Deliberate practice: specific goals, immediate feedback, working at the edge of ability | 4, 10 | ⏳ | Ericsson, Krampe & Tesch-Römer (1993), and later critiques of how much it explains |
| L3 | Practising faster than you can play cleanly reinforces errors; tension limits speed | 4, 6 | ⏳ | Guitar pedagogy consensus. Cite a reputable teacher or source. |
| L4 | "One-minute changes" | 4 | ⏳ | A method popularised by JustinGuitar. Attribute it if the slide names it. |
| L5 | No universal timeline; stages are defined by competencies | 3 | Design decision | Deliberately avoids time claims (PRD C2) |

## Resources (slide 11)

The free/paid labels reflect general knowledge, not a check against current pricing. **Verify each link and its pricing model before presenting, and record the date.**

| Resource | URL | Label on slide | Status |
|---|---|---|---|
| Ultimate Guitar | ultimate-guitar.com | Free + subscription | ⏳ |
| Songsterr | songsterr.com | Free + subscription | ⏳ |
| Guitar Pro | guitar-pro.com | Paid | ⏳ |
| JustinGuitar | justinguitar.com | Free | ⏳ (also has paid extras) |
| Fender Play | fender.com/play | Subscription | ⏳ |
| musictheory.net | musictheory.net | Free | ⏳ (paid mobile apps exist) |
| teoria.com | teoria.com | Free | ⏳ |
| Transcribe! | seventhstring.com | Paid | ⏳ (has a trial) |
| Moises | moises.ai | Free + subscription | ⏳ |

Last checked: *not yet checked*.
