# Content Sources and Verification Status

Every factual claim shown in the presentation is listed here with its source and status. The content review was done in iteration 003 (2026-11-03). Sources were fetched on that date.

Status key: ✅ verified (source linked) · ✏️ reworded or qualified after checking · ⚠️ partly verified (see note) · 📚 standard reference, cited from the literature but not re-fetched · 🎨 design decision, not a factual claim

## Sources consulted

| ID | Source | Type | Fetch result |
|---|---|---|---|
| S1 | [Gibson: Jimmy Page's "Number 1" Les Paul (archive.gibson.jp/news-events/5036)](https://archive.gibson.jp/news-events/5036) | Manufacturer article | Fetched OK |
| S2 | [Guitar.com: "The inside story of Jimmy Page's Led Zeppelin guitars"](https://guitar.com/features/artist-rigs/the-inside-story-of-jimmy-pages-led-zeppelin-guitars/) | Feature article | Fetched OK |
| S3 | [Guitar World: Joe Walsh interview, "Analog Man"](https://www.guitarworld.com/features/interview-joe-walsh-discusses-his-career-gear-and-new-album-analog-man) | Interview | **The article body didn't load** (only navigation and sign-up text came back). It could not be used. |
| S4 | [Ground Guitar: Joe Walsh's 1959/60 Les Paul (Jimmy Page #1)](https://www.groundguitar.com/joe-walsh/joe-walshs-1959-60-gibson-les-paul-standard-jimmy-page-1/) | Gear-database article quoting Walsh interviews | Fetched OK. Secondary source, used only for the price discrepancy. |

## Jimmy Page's Les Paul "Number One" (slide 8)

| # | Claim on the slide (Hebrew paraphrase) | Status | Evidence |
|---|---|---|---|
| N1 | "A late-1950s Les Paul Standard, usually dated to 1959, but the exact production year is unknown" | ✏️ ✅ | S1 calls it a "'59 Les Paul". S2: "an accurate production year will never be possible", "a late '59 or early '60 example" is an educated guess, and a headstock repair "probably done during Walsh's ownership had removed the guitar's serial number". **Changed from** the earlier unqualified "1959". |
| N2 | "Page bought it from Joe Walsh in April 1969, during the American tour" | ✅ | S1: bought from Walsh in April 1969 while touring the U.S. S2: Page saw it in America in 1969, most likely at the Fillmore West at the end of April. |
| N3 | "Walsh had already shaved the neck to a slim profile before the sale" | ✏️ ✅ | S1: Walsh had the neck "shaved to a thinner profile" before selling it. S2: Walsh shaved it "to an unusual profile". **Changed from** the earlier passive, unattributed phrasing. |
| N4 | "His favourite guitar for most of the Led Zeppelin years, on stage and in the studio" | ✏️ ✅ | S2: Page's favourite through most of his Zeppelin years, onstage and in the studio, used for the second album. **Changed from** "accompanied him through the Led Zeppelin years". |
| N5 | Two humbuckers, 3-way toggle, volume and tone per pickup | ⚠️ | This is the standard Les Paul Standard layout and is presented as general information. Number One was modified: S1 says the bridge pickup "was replaced after it failed on tour" and a tone pot was replaced with a push-pull pot for out-of-phase sounds. The slide doesn't claim the controls are original. |
| — | **Deliberately omitted: purchase price** | — | Accounts conflict. S4 quotes Walsh as saying both "about 1,200 bucks" (an offline Guitar World interview) and "1,500 bucks or something" (a podcast). Other reports give $500. |

### Visual references used for the 3D model (slide 1, 4, 6, 8, 11)

The model is an **educational illustration, not a historical reproduction**. The slide says so.

| Model detail | Basis |
|---|---|
| Single-cutaway solid body with a carved maple top, sunburst finish, cream body binding, bound rosewood fingerboard, trapezoid inlays, two humbuckers with cream rings, tune-o-matic bridge and stopbar tailpiece, 4 knobs and a toggle on the upper bass bout | Generic late-1950s Les Paul Standard construction (general knowledge) |
| **Gold-plated Grover-style tuners** | S1 ("Gold-plated Grover tuners") and S2 (originals replaced with "a robust set of gold-plated Grovers") ✅ |
| **Uncovered bridge humbucker with white bobbins**; covered neck pickup | S2: the bridge pickup cover was removed, revealing "double-white bobbins" ✅. The neck cover is a generic choice, since S2 doesn't describe it. |
| No pickguard | 🎨 Modelling choice so the burst stays visible. Not verified from S1–S4. |
| Faded honey-to-brown sunburst | 🎨 A stylised "faded burst". S1/S2 don't describe the exact colours. |
| Headstock: generic flared shape with a plain truss-rod cover. **No logo, no "open-book" outline, no brand text.** | 🎨 Avoids reproducing Gibson trade dress and brand graphics |

## Technical claims

| # | Claim | Slide | Status | Notes |
|---|---|---|---|---|
| T1 | With a tube amp set for distortion, lowering the guitar's volume *usually* cleans up the sound | 8 | ✏️ 📚 | Now qualified with "usually" (בדרך כלל). It's a well-established behaviour with passive pickups, but it varies with pedals and solid-state amps, and treble loss depends on the circuit. |
| T2 | Neck pickup is warmer and rounder; bridge pickup is brighter | 8 | 📚 | Follows from where each pickup sits along the string's vibration. Standard explanation. |
| T3 | Fret positions follow d(n) = L·(1 − 2^(−n/12)) | 7 (data) | ✅ | Equal temperament. Tested in `python/tests/test_fretboard.py`. The diagram ignores saddle compensation. |
| T4 | Pentatonic positions and spelling | 7 (data) | ✅ | Algorithmic, tested against the known A minor pentatonic boxes and spellings |
| T5 | Fret *just behind* the fret wire, not on it | 4 | ✏️ 📚 | **Changed from** "close to the fret". Standard technique advice. |
| T6 | Rock/blues vibrato comes from the wrist and forearm rather than the finger alone | 6 | 📚 | Common pedagogy for bend-style vibrato. Classical-style vibrato differs, but it isn't the topic here. |
| T7 | Click on 2 & 4: set the metronome to half tempo and hear the clicks as beats 2 and 4 | 5 | 📚 | Standard practice method |

### Terminology review (Hebrew)

| Term on the slides | Status |
|---|---|
| סריג (fret), צוואר (neck), פיקאפ, מתג שלושה מצבים, ראש הגיטרה | Standard usage among Israeli guitarists |
| בנד (bend), ויברטו, לגאטו (legato), פאלם מיוט, פאוור-קורדס, אקורדי בר | Transliterated English terms, as commonly spoken. The English is given on first use, per PRD C5. |
| ~~שקט בין התווים~~ → **השתקת מיתרים (muting)** | ✏️ Renamed to the standard term |
| פריטה מתחלפת (alternate picking) | Standard |

## Learning principles

| # | Claim | Slides | Status | Reference |
|---|---|---|---|---|
| L1 | Short, frequent, focused practice is *usually* better than long, infrequent sessions | 10 | 📚 (qualified) | Spacing and distributed-practice research, e.g. Shea, Lai, Black & Park (2000), "Spacing practice sessions across days benefits the learning of motor skills", *Human Movement Science* 19(5). The slide keeps "usually" (בדרך כלל). |
| L2 | Deliberate, goal-focused practice with feedback | 4, 10 | 📚 | Ericsson, Krampe & Tesch-Römer (1993), *Psychological Review* 100(3). Its explanatory power is debated: Macnamara, Hambrick & Oswald (2014), *Psychological Science* 25(8), so the slides don't claim it is the only factor. |
| L3 | Practising faster than you can play cleanly reinforces errors; excess tension limits speed and can cause pain | 4, 6 | 📚 | Mainstream guitar pedagogy. Worded as advice, not as a research finding. |
| L4 | "One-minute changes" | 4 | 📚 | The exercise is widely associated with JustinGuitar's beginner course |
| L5 | No universal timeline; stages are defined by competencies; time ranges are illustrative | 3 | 🎨 | PRD C2. The slide 3 time view (iteration 003) labels every time reference as an illustrative example, not a forecast. |
| L6 | Clean BPM "for example, three times in a row" | 10 | ✏️ | Now presented as an example criterion, not a rule |

## Resources (slide 11)

Checked 2026-11-03. Pricing and feature tiers change, so re-check them before presenting.

| Resource | Label and description on slide | Status | Evidence |
|---|---|---|---|
| Ultimate Guitar | Free + subscription. The community tab library is free; official tabs and practice tools are in **Pro**. | ✅ | [UG help: What is the Pro subscription](https://help.ultimate-guitar.com/en/articles/6741560-what-is-ultimate-guitar-pro-subscription) and [Guide to premium services](https://help.ultimate-guitar.com/en/articles/6741293-guide-to-ultimate-guitar-s-premium-services). Basic (free) gives access to 2M+ tabs; Pro adds official tabs, auto-scroll, transpose and Practice mode. *(The help pages were read through search-result extracts.)* |
| Songsterr | Free + subscription. Interactive tabs with playback; **slow-down, loop and sync with the original recording are Plus features.** | ✏️ ✅ | [songsterr.com/plus](https://www.songsterr.com/plus) lists "Playback Speed", "Loop" and "Pause-Free Sync with Original Audio" as Plus features. **Corrected:** the slide previously implied speed control was free. |
| Guitar Pro | Paid, with a trial. Tab editor with playback, tempo control and loops. | ✅ | [guitar-pro.com](https://www.guitar-pro.com/): "free for the first 7 days", tempo adjustment and looping |
| JustinGuitar | Free + extras. Most website lessons are free, including the beginner and intermediate courses; the app and some courses are paid. | ⚠️ ✏️ | The official site returned 403. Evidence comes from the [JustinGuitar community forum](https://community.justinguitar.com/t/ready-to-buy-in-the-subscription-for-justin-guitar-products/412072): website lessons are free, while premium courses and the Songs & Lessons app are separate purchases. Re-check on the site. |
| Fender Play | Subscription with a trial. Structured video lesson paths by instrument and style. | ✅ | [Fender Play free-trial FAQ](https://play-support.fender.com/hc/en-us/articles/44538271886235-Free-Trial-FAQs) (7-day monthly / 14-day annual trial) and the [subscription page](https://www.fender.com/products/fender-play-subscription). *(fender.com/play returned 403; read through search-result extracts.)* |
| musictheory.net | Free; the app is paid. Lessons and exercises, including interval ear training. | ✏️ ⚠️ | [Tenuto](https://www.musictheory.net/products/tenuto) is sold ("Buy Tenuto"), described as "an enhanced version of the exercises". The website itself doesn't state that it is free; this is widely reported (e.g. university library guides). |
| teoria.com | Free (donation-supported). Theory and ear-training exercises in the browser. | ⚠️ | [teoria.com/en/exercises](https://www.teoria.com/en/exercises/) lists the exercises and asks for donations ("Donations are now vital"). No paywall is stated. The membership terms aren't described. |
| Transcribe! | Paid, with a trial. Slows recordings down without changing pitch. | ✅ | [seventhstring.com overview](https://www.seventhstring.com/xscribe/overview.html): a 30-day free evaluation, then "you must buy it", and "slow down music without changing its pitch" |
| Moises | Free + subscription. **Free:** vocals, drums, bass and "other". **A separate guitar stem requires Premium.** | ✏️ ⚠️ | Moises help center: ["Which instruments can be separated on the Free plan?"](https://help.moises.ai/hc/en-us/articles/29530482524316-Which-instruments-can-be-separated-on-the-Free-plan) gives the free presets (2 stems: vocals/instrumental; 4 stems: vocals, drums, bass, other), with 5 uploads/month up to 5 min. ["…on the Premium plan?"](https://help.moises.ai/hc/en-us/articles/29530520103324-Which-instruments-can-be-separated-on-the-Premium-plan) lists guitars (electric, acoustic, lead, rhythm) as Premium. **Direct fetch returned 403. The content was read from search-indexed extracts of these official pages.** **Corrected:** the slide previously implied guitar isolation was included. The slow-down claim was removed because its tier wasn't verified. |

## Open verification items

1. Re-open S3 (Guitar World / Walsh) in a browser and confirm whether it adds anything about the neck or the sale.
2. Confirm the JustinGuitar and Moises tiers on their official sites directly. Both blocked automated fetching.
3. If the model should match Number One more closely (knob type, neck pickup cover, pickguard), collect licensed photo references and record them here.
