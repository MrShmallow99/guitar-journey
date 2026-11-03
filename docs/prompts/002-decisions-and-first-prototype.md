# Prompt 002: Scope decisions and first functional prototype

| | |
|---|---|
| **Date** | 2026-11-03 |
| **Phase** | Planning revision, then Phase 1 implementation |
| **Tool** | Claude Code (Claude Opus 5.5) |
| **Fidelity** | Exact prompt text, verbatim |

## Prompt (verbatim)

````markdown
I've reviewed the initial planning documents (`PRD.md` and `docs/PLANNING.md`). I like the overall concept, particularly the idea that guitar progression is multidimensional rather than linear.

Before continuing, I'd like to make several decisions and refine the project scope.

## 1. Presentation structure

I want to give Jimmy Page's Les Paul "Number One" its own dedicated slide rather than combining its exploration with general playing technique.

An 11-slide presentation is acceptable.

Please revise the outline accordingly, preserving the other important educational topics.

The presentation should have a coherent narrative that connects the different stages of learning, instead of feeling like a collection of unrelated guitar facts.

## 2. Feature priorities

I like the proposed interactive features, but I don't want the implementation to become unnecessarily complicated.

The most important elements are:

- A polished HTML presentation with smooth, intuitive navigation.
- An interactive guitar skill progression roadmap.
- A self-assessment visualization showing strengths and weaknesses across different guitar skills.
- An interactive fretboard powered by data generated using Python.
- A high-quality animated 3D electric guitar visualization using Three.js.
- Practical recommendations for learning, practicing, and tracking improvement.
- A curated list of useful guitar learning resources, including tablature websites.

The metronome, practice routine builder, advanced audio synthesis, and additional interactive demonstrations are interesting features, but they can be implemented in later iterations.

Please update the PRD priorities accordingly.

## 3. Python integration

I agree that Python can generate musical theory data, including fretboard notes, intervals, and scale positions.

However, Python must be a meaningful and clearly demonstrable part of the presentation, not merely an unrelated script stored in the repository.

For now, implement the initial Python data-generation pipeline, but make sure its output is designed to power visible interactive functionality in the HTML presentation.

We can evaluate whether an additional runtime Python demonstration would be beneficial in a later iteration.

Make the relationship between Python and the presentation explicit and verifiable.

## 4. Three.js visualization

I want the final 3D guitar to be visually impressive and recognizable as a representation inspired by Jimmy Page's "Number One" Les Paul.

For the initial implementation, a simplified procedural model is acceptable to validate rendering, interaction, and integration.

However, I don't want to treat a basic geometric placeholder as the final result.

Please keep the 3D architecture flexible enough to support a more detailed guitar model later, without requiring a complete rewrite.

Do not introduce unlicensed third-party assets.

## 5. Design direction

Keep the proposed "Late-night studio" aesthetic:

- Dark, warm backgrounds.
- Amber and subtle red accents inspired by vintage electric guitars.
- Clear Hebrew typography.
- Strong visual hierarchy.
- Modern animations and smooth transitions.
- Consistent design across slides.
- Proper RTL and BiDi handling.

I want it to look like a thoughtfully designed interactive educational experience, not a generic PowerPoint presentation converted into HTML.

Maintain good readability and avoid overwhelming slides with text.

## 6. Content quality

The presentation should offer practical advice based on real guitar-learning principles.

Please emphasize:

- The importance of consistent and focused practice.
- Rhythm and timing.
- Clean technique and preventing unnecessary tension.
- Developing musical understanding rather than memorizing shapes.
- Learning complete songs and building a repertoire.
- Ear training, improvisation, and personal musical expression.
- Evaluating progress through observable improvements.

Avoid presenting arbitrary timelines as universal facts.

For technical or historical claims, especially those concerning Jimmy Page's guitar, identify what needs source verification.

Use clear, natural Hebrew terminology appropriate for guitarists. Introduce relevant English terms when helpful.

## 7. Initial implementation

After updating the planning documents, begin implementing the first functional version.

For this iteration, focus on the foundation rather than completing every advanced feature.

Please implement:

1. The initial project structure.
2. The main HTML presentation entry point.
3. All 11 slides with meaningful initial Hebrew content.
4. A consistent CSS design system.
5. Working JavaScript navigation, including keyboard controls and a slide progress indicator.
6. Correct RTL/BiDi handling, while keeping musical diagrams in their conventional orientation.
7. Responsive presentation behavior.
8. An initial working Three.js scene containing a simplified electric guitar model, with basic animation or camera interaction.
9. An initial Python module generating fretboard note data in standard tuning, including at least one scale, with basic automated tests.

Advanced interactions can remain planned for subsequent iterations. Do not implement incomplete controls that appear functional but do nothing.

The result should already be usable as a basic presentation.

## 8. Development documentation and version control

Please preserve the existing planning documents and update them to reflect the decisions made here.

Regarding `docs/prompts/001-initial-planning.md`: it currently contains a summary instead of the complete original prompt. Replace that summary with the exact original prompt from our conversation if it is available. If the exact wording cannot be recovered, clearly mark it as unavailable rather than reconstructing or inventing it.

Record this current prompt in full as the next entry in `docs/prompts/`.

Document the design decisions and implementation changes accurately.

Initialize Git if necessary. Create a commit for the planning baseline before implementation, followed by another commit for the working prototype. Commit only changes that have actually been made.

Do not publish the repository to GitHub yet. We will review the implementation first.

## 9. Validation and deliverables

After implementation:

- Run the available tests.
- Check that the presentation can be started and navigated.
- Verify the Python-generated output.
- Check the Three.js integration.
- Report any errors, missing features, or limitations.
- Provide the commands needed to run the project locally.
- Summarize the files created and the changes made.
- Explain what should be reviewed before the next development iteration.

Do not claim a feature has been tested unless you actually tested it.

Please proceed with this first implementation and report the results.
````

## Outcome

See `docs/iterations.md` → *Iteration 002*.
