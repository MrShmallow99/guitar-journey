# Prompt 001: Initial planning

| | |
|---|---|
| **Date** | 2026-11-03 |
| **Phase** | Pre-implementation planning |
| **Tool** | Claude Code (Claude Opus 5.5) |
| **Fidelity** | Exact original prompt text, recovered from the conversation transcript. It is not a summary. |

## Original prompt (verbatim)

````markdown
I want to develop an interactive HTML presentation about learning electric guitar and progressing as a guitarist over time.

Before writing any code, I want to explore the concept, establish the requirements, and make informed design and technical decisions.

## Project concept

The presentation should explore the journey of becoming a better electric guitarist, from learning the fundamentals to developing advanced techniques, musical independence, and a personal playing style.

I want to cover topics such as:

- The different stages of learning electric guitar, from beginner to advanced.
- How skills typically develop over months and years, without assuming everyone progresses at the same pace.
- What guitarists should focus on at each stage.
- Effective practice routines and techniques.
- Common mistakes that slow down progress.
- Developing rhythm, technique, improvisation, musical understanding, and creativity.
- Recommended resources for guitar tabs, lessons, and practice.
- How to measure progress and identify areas for improvement.

I also want to incorporate interactive visual elements that make the presentation more engaging and useful than a conventional slide deck.

One visual feature I am particularly interested in is an animated, interactive 3D representation of one of Jimmy Page's iconic electric guitars, preferably his Gibson Les Paul "Number One". I would like to explore how this element could contribute to the presentation rather than simply serve as decoration.

## Technical requirements

The final project must include:

1. An HTML-based presentation containing approximately 10 slides.
2. JavaScript for navigation and meaningful interactive functionality.
3. Python used for a meaningful and demonstrable purpose within the project.
4. An animated 3D element, preferably implemented using Three.js.
5. Hebrew presentation content, with proper RTL layout and BiDi text handling.
6. A well-organized GitHub repository.
7. A comprehensive README.md containing documentation, screenshots, and instructions.
8. A PRD.md describing the project's goals, functionality, technical requirements, and design decisions.
9. Documentation of the development prompts and iterations.

Planning and technical documentation should be written in English. The presentation itself should be in Hebrew.

## My preferences

I want the presentation to feel modern, visually polished, intuitive, and engaging.

The information should be practical and accurate, not merely motivational or superficial.

I particularly like the idea of an interactive progression roadmap that illustrates how different guitar skills develop, as well as features that encourage users to explore their own learning journey.

The presentation should communicate that guitar development is not strictly linear. Different skills can develop at different rates, and effective practice depends on individual goals.

Interactive features should have a clear purpose and contribute to understanding the subject.

## Your task

For now, do not implement the presentation.

Instead, help me plan it by producing:

1. **Project concept:** A clear description of the intended experience and educational goals.

2. **Presentation structure:** A proposed outline of approximately 10 slides, including the purpose and main content of each slide.

3. **PRD.md:** An initial Product Requirements Document covering functionality, audience, content, technical requirements, visual direction, and success criteria.

4. **Python integration:** Propose 2–3 meaningful ways Python could contribute to the project. Explain how each would technically integrate with an HTML presentation, including any browser execution limitations. Recommend the most appropriate option.

5. **3D guitar visualization:** Suggest an implementation approach for Jimmy Page's guitar using Three.js, including possible interactive features, technical challenges, and asset considerations.

6. **JavaScript interactions:** Suggest several features that would add meaningful interactivity beyond basic slide navigation.

7. **Visual design:** Propose a consistent design direction, including typography, colors, layout, visual hierarchy, and approaches to presenting technical information.

8. **Development roadmap:** Divide the implementation into four logical phases, with clear deliverables and validation criteria for each phase.

9. **Repository structure:** Propose a GitHub repository structure that supports the application, documentation, development records, and supporting assets.

10. **Technical and content risks:** Identify important challenges or assumptions that should be validated before implementation.

11. **Recommended starting point:** Explain what we should implement first and why.

Please prioritize educational value, technical correctness, usability, and visual quality.

Where multiple approaches are possible, explain the trade-offs rather than making arbitrary decisions.

Treat this as an initial planning document. I will review your recommendations, provide feedback, and make the final decisions before we begin implementation.
````

## Output of this iteration

- `docs/PLANNING.md`: the 11 planning sections (v0.1)
- `PRD.md`: initial requirements (v0.1)
- `docs/prompts/001-initial-planning.md`: this log entry. It first held only a summary; iteration 002 replaced that with the verbatim prompt.
