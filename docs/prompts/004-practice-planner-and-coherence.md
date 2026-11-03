# Prompt 004: Personalized practice planner and cross-slide coherence

| | |
|---|---|
| **Date** | 2026-11-03 |
| **Phase** | Iteration 004: practice planner, shared state across slides, Python data-flow explanation, content refinements, validation |
| **Tool** | Claude Code (Claude Opus 5.5) |
| **Fidelity** | Exact prompt text, verbatim |

## Prompt (verbatim)

````markdown
I've reviewed iteration 003, including the updated screenshots, implementation, documentation, and Git history.

I'm satisfied with the direction of the project. The improved 3D guitar, the mobile layout, and the long-term progression visualization are substantial improvements.

For this iteration, I want to focus on making the presentation more useful to the viewer, rather than adding unrelated visual effects or expanding the technical stack unnecessarily.

## 1. Interactive personalized practice planner

The presentation already asks users to rate themselves across eight guitar skills, and those ratings influence the roadmap and final recommendations.

I'd like to extend this into a practical, personalized practice planner.

The idea is to help viewers turn their self-assessment into an actionable guitar practice session.

Please integrate this primarily into slide 10, which already discusses effective practice.

The planner should allow users to:

- Select how much time they have available: 15, 30, 45, or 60 minutes.
- Select a primary musical goal, such as improving rhythm, lead guitar, learning songs, improvisation, or general development.
- Reuse their existing skill ratings from slide 2.
- Generate a suggested practice session based on their goal, available time, and current skill profile.

The generated session should include:

- A realistic allocation of practice time.
- Specific exercises relevant to the selected skills.
- Clear instructions for each exercise.
- An observable success criterion.
- A brief explanation of why those exercises were recommended.

Avoid generic recommendations such as "practice technique for 10 minutes" without explaining what to do.

For example, a guitarist struggling with rhythm might receive a focused metronome exercise, a subdivision exercise, and a short musical application.

A guitarist struggling with lead technique might receive controlled bending, vibrato, or scale-position exercises.

Use the presentation's existing educational content wherever possible.

## 2. Personalization logic

I don't want the planner to simply select the two lowest-rated skills without considering the user's goals.

Please design a transparent recommendation approach that balances:

- The user's selected musical goal.
- Their self-assessed strengths and weaknesses.
- The available session duration.
- The importance of maintaining foundational skills.
- The need to apply technical exercises to actual music.

The planner should not pretend to provide a scientifically optimized training program.

Treat its output as an adaptable starting point based on practical learning principles.

Keep the recommendation logic deterministic and explainable. It should work entirely in the browser, without external APIs or a backend.

Users should also be able to adjust their choices and regenerate the session.

If feasible without unnecessary complexity, provide a button to copy the generated practice plan as readable text.

## 3. Connect the experience across slides

The presentation's central concept is that guitar progress is a map, not a ladder.

I want that idea to connect the interactive features more clearly.

The flow should be:

1. Slide 2: The viewer evaluates their skills.
2. Slide 3: They explore their position and possible progression.
3. Slides 4–9: They learn what the different skills involve.
4. Slide 10: They generate a practice routine suited to their current situation.
5. Slide 11: They receive a concise personal summary and useful resources for continuing.

Please ensure that the practice planner and final summary use shared state consistently.

Do not duplicate recommendation logic across different components.

The final slide should be able to reference the generated practice plan when one exists, while still working properly for viewers who skip the self-assessment or planner.

## 4. Python integration clarity

The existing Python-generated fretboard data is working and should remain unchanged unless a specific improvement is needed.

However, I'd like the educational and technical contribution of Python to be clearer to someone viewing the presentation.

Please consider adding a small, unobtrusive "How this works" explanation or interactive information panel on slide 7.

It should explain the actual data flow:

Python music theory calculations → generated data → JavaScript visualization.

It should distinguish build-time Python execution from browser-side JavaScript rather than implying Python is running in the browser.

Keep this explanation accessible without making the slide feel like a programming lecture.

Do not introduce Pyodide or a Python backend merely for the sake of displaying Python execution.

## 5. Final content and presentation refinements

Please review the current content for small inconsistencies introduced during previous iterations.

In particular:

- The opening slide still describes the 3D guitar as an initial model. Update that wording to reflect the current implementation accurately.
- Ensure the PRD and planning documents distinguish between rejected calendar-based predictions and the illustrative progression timeline now present on slide 3.
- Check that navigation and interactive controls are understandable without requiring technical knowledge.
- Check that the Hebrew wording remains natural and consistent.
- Avoid presenting the practice planner's recommendations as guaranteed outcomes.

I don't want major design changes. Preserve the current visual identity and slide structure.

## 6. Validation and accessibility

Please run a focused quality review of the updated presentation.

Test:

- The practice planner with different time budgets and goals.
- How recommendations change when skill ratings change.
- Behavior when no self-assessment has been completed.
- State persistence and reset behavior.
- The relationship between slides 2, 3, 10, and 11.
- Keyboard accessibility for the new controls.
- Mobile usability, including scrolling and control sizes.
- RTL/BiDi display of generated exercise instructions, times, and English musical terms.
- The existing Python data generation and fretboard functionality.
- The existing Three.js model and camera controls.

Run the automated tests and extend them where appropriate.

If Lighthouse is available, run a desktop accessibility and performance audit. If it isn't available, report that clearly and perform the accessibility checks that can be verified with existing tools.

Capture updated screenshots of the affected slides and inspect them visually.

Do not claim any test or audit was completed unless it was actually performed.

## 7. Documentation and version control

- Record this prompt verbatim as iteration 004 in `docs/prompts/`.
- Update `docs/iterations.md` with the actual changes and validation results.
- Update the PRD to reflect implemented functionality and revised decisions.
- Update the README to explain the personalized practice planner and the Python data flow.
- Create logical Git commits reflecting the implementation and verification.
- Preserve the existing Git history and previous prompts.
- Do not push to GitHub yet.

## 8. Completion report

When finished, summarize:

1. The new functionality and how users interact with it.
2. How the practice recommendations are calculated.
3. Which existing components were reused.
4. The results of automated and visual testing.
5. Any remaining accessibility or usability issues.
6. What should be completed before the final GitHub release.

The objective is a coherent and genuinely useful interactive presentation, where the technology supports the educational experience rather than distracting from it.
````

## Outcome

See `docs/iterations.md` → *Iteration 004*.
