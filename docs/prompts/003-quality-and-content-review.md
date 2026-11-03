# Prompt 003: Quality and content review

| | |
|---|---|
| **Date** | 2026-11-03 |
| **Phase** | Iteration 003: improve the 3D model, mobile layout, long-term progression view, content accuracy |
| **Tool** | Claude Code (Claude Opus 5.5) |
| **Fidelity** | Exact prompt text, verbatim |

## Prompt (verbatim)

````markdown
I've reviewed the first working prototype, including the presentation screenshots, project structure, and implementation report.

The overall direction is strong. I especially like the visual identity, the skill radar, the progression roadmap, and the connection between the Python-generated fretboard data and the presentation.

I don't want to redesign the project from scratch. Instead, I'd like to improve several specific areas before adding more features.

## 1. Improve the 3D guitar model

The current procedural guitar is a good starting point, but it still looks noticeably simplified.

Since the guitar is one of the presentation's main visual elements, I want to improve its visual quality and resemblance to Jimmy Page's Les Paul "Number One".

Please review and improve:

- Body shape and proportions.
- The carved-top appearance and sunburst finish.
- The neck, fretboard, inlays, and binding.
- Bridge, tailpiece, pickups, tuning machines, and control knobs.
- Material properties, reflections, and lighting.
- Camera framing and transitions between slides.

Use reliable visual references for the guitar's construction and appearance.

The model should remain interactive and efficiently rendered using Three.js.

If a detailed procedural implementation is practical, improve the existing model. If a GLB asset would provide substantially better results, evaluate that approach and explain the trade-offs before introducing external dependencies.

Do not use unlicensed assets or copy proprietary brand graphics unnecessarily.

The goal is a visually convincing educational 3D model, not an inaccurate claim of historical reproduction.

## 2. Fix mobile layout problems

The screenshots show that the 3D guitar can overlap important content on mobile, particularly on slide 8.

Please review the mobile presentation layout and correct this issue.

Important requirements:

- The guitar must not obscure titles, descriptions, or interactive controls.
- The 3D viewer should remain usable on smaller screens.
- Navigation controls should not overlap essential content.
- Interactive elements must remain readable and touch-friendly.
- RTL and BiDi behavior must remain correct.

Review every slide at both desktop and mobile sizes rather than fixing only slide 8.

Preserve the current desktop design unless a change clearly improves it.

## 3. Restore the long-term progression perspective

One of my original goals was to illustrate how guitarists develop over months and years.

The current progression roadmap explains competency levels well, but the time dimension is not sufficiently visible.

I'd like to explore a clearer visualization of long-term progression.

Please enhance slide 3 or its existing roadmap to communicate:

- What a guitarist might focus on during the first months.
- How priorities evolve during the first year.
- How learning can develop over several years.
- Why different skills improve at different rates.
- Why elapsed time alone does not determine playing ability.

Avoid rigid claims such as "everyone becomes intermediate after one year".

Use illustrative examples and competency-based milestones, clearly distinguishing them from guaranteed timelines.

Keep the existing multidimensional skill roadmap and self-assessment integration.

I want this improvement to complement the current visualization, not replace it with a generic timeline.

## 4. Verify and refine the educational content

Please perform a focused content review, especially for:

- Jimmy Page's Number One guitar.
- Musical technique terminology.
- Learning and practice recommendations.
- Descriptions of recommended learning resources and their free/paid features.

For the guitar's history, consider these reference sources:

- https://archive.gibson.jp/news-events/5036
- https://guitar.com/features/artist-rigs/the-inside-story-of-jimmy-pages-led-zeppelin-guitars/
- https://www.guitarworld.com/features/interview-joe-walsh-discusses-his-career-gear-and-new-album-analog-man

For example, the guitar's exact production year is not completely certain, and its neck had already been modified before Jimmy Page acquired it.

Please verify these details, use appropriately qualified language, and update `docs/content-sources.md` with direct source links.

For third-party learning resources, verify any claims about their features, availability, or pricing models using official sources where possible.

Pay particular attention to the distinction between free and premium guitar stem separation in Moises.

If a claim cannot be verified, qualify or remove it rather than presenting it as fact.

## 5. Preserve the existing strengths

Do not remove or break:

- The 11-slide structure.
- Skill radar and persistent self-assessment.
- Personalized roadmap and next steps.
- Python-generated fretboard data.
- Interactive scale and interval visualization.
- Hebrew RTL/BiDi support.
- Keyboard and mouse navigation.
- The current visual identity.

Avoid introducing unrelated new features during this iteration.

I would prefer improvements to the existing experience over adding more functionality.

## 6. Testing and documentation

After implementing the changes:

1. Run the Python tests and data freshness check.
2. Run the browser tests where possible.
3. Capture updated screenshots, including the improved 3D model and mobile layouts.
4. Inspect the screenshots for visual issues, not just functional errors.
5. Update the PRD and relevant documentation to reflect the actual changes.
6. Record this prompt verbatim in `docs/prompts/003-quality-and-content-review.md`.
7. Document the issues identified, what was changed, and what remains unresolved in `docs/iterations.md`.
8. Create logical Git commits for the actual improvements.

Do not rewrite earlier prompts or fabricate development history.

Do not push to GitHub yet.

When finished, provide a concise report describing the main improvements, verification results, remaining limitations, and recommendations for the next iteration.

I want this iteration to measurably improve the presentation's educational accuracy, visual quality, and usability.
````

## Outcome

See `docs/iterations.md` → *Iteration 003*.
