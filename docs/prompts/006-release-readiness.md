# Prompt 006: Release readiness

| | |
|---|---|
| **Date** | 2026-11-03 |
| **Phase** | Iteration 006: release-readiness review (cross-platform tests, workflow audit, documentation accuracy, assignment compliance) |
| **Tool** | Claude Code (Claude Opus 5.5) |
| **Fidelity** | Exact prompt text, verbatim |

## Prompt (verbatim)

````markdown
I've reviewed iteration 005 and the distribution implementation.

The standalone HTML, GitHub Pages preparation, and Windows launcher are all valuable additions. I want to perform one final release-readiness pass before publishing the repository.

This should be a focused maintenance and compliance iteration, not another feature-development cycle.

## 1. Fix the cross-platform test command

An independent review found that the following command fails on Linux:

`npm run test:unit`

The current package.json uses:

`node --test tests/js/`

On Linux with Node.js 22, this can be interpreted as a module path instead of automatically discovering the test files.

The actual planner tests pass when invoked directly.

Please fix the npm script using an explicit, cross-platform test file path or another reliable approach.

This is important because `.github/workflows/pages.yml` runs `npm run test:unit` on Ubuntu. A failure here could prevent GitHub Pages deployment.

Verify the corrected command using the same Node.js version and operating system configuration used by GitHub Actions, where possible.

Do not treat a successful direct test invocation as proof that the npm script works. Test the actual npm command.

## 2. Audit the GitHub Actions workflow

Review the full deployment workflow for compatibility with the current repository.

Check:

- Python installation and tests.
- Generated-data freshness verification.
- Node.js setup and npm dependency installation.
- JavaScript unit tests.
- Standalone HTML generation.
- GitHub Pages artifact creation.
- Deployment permissions and branch configuration.
- Compatibility with repository subpaths.

Confirm that the workflow uses paths and commands that will work on a fresh Ubuntu runner.

Fix any issues found.

If the complete workflow cannot be executed locally, distinguish validated steps from steps that still require an actual GitHub Actions run.

## 3. Correct outdated documentation

The README currently contains statements that are no longer accurate.

For example:

- It says CI is deferred, although a GitHub Actions workflow now exists.
- It says Lighthouse has not been run, but also lists Lighthouse results.
- Its browser testing limitations do not fully reflect the recent Firefox testing.

The PRD also contains at least one outdated CI implementation status.

Review the README, PRD, planning document, and iteration log for contradictions or outdated statements.

Update them to accurately describe the current project.

Do not remove legitimate limitations or exaggerate test coverage.

## 4. Final assignment compliance review

Review the repository against these assignment requirements:

- An HTML presentation containing approximately 10 slides.
- JavaScript functionality.
- Meaningful Python integration into the presentation.
- An animated 3D element using Three.js.
- Personal input and iterative improvements.
- A comprehensive root-level README.md.
- Screenshots and visual explanations in the README.
- A PRD.md document.
- A dedicated directory containing the complete development prompts.
- A Git history demonstrating multiple meaningful development iterations.

Produce a concise compliance checklist with references to actual repository files or functionality.

Pay special attention to the Python requirement.

The current implementation uses Python at build time to generate musical data that directly powers the interactive fretboard. Document exactly how this satisfies the intended integration, but do not claim that Python executes in the browser.

If the assignment wording leaves room for interpretation, explicitly identify that uncertainty.

Do not introduce Pyodide or new Python functionality without first explaining why it is necessary.

## 5. Final repository quality checks

Please check:

- No uncommitted changes or accidentally tracked development environments.
- No generated caches, virtual environments, node_modules, or local temporary files committed.
- No broken README image references.
- No missing files required for reproduction.
- No outdated commands in documentation.
- No hardcoded local computer paths.
- No broken relative URLs for GitHub Pages.
- No misleading claims about completed tests.

Do not spend time optimizing Lighthouse Performance unless you find a clear regression or functional issue. The current performance target is an internal project goal, not an explicit assignment requirement.

## 6. Documentation and Git history

Record this prompt verbatim under `docs/prompts/006-release-readiness.md`.

Update `docs/iterations.md` to record the actual review findings, corrections, and verification results.

Create logical commits for any changes.

Preserve all previous commits and prompt files.

Do not push to GitHub yet.

## 7. Completion report

When finished, provide:

1. All issues found and their fixes.
2. Test commands executed and actual results.
3. Whether the GitHub Actions workflow is ready for its first remote run.
4. Any remaining assignment-compliance uncertainties.
5. The exact steps required to publish the repository and activate GitHub Pages.
6. A final short checklist of actions I must complete personally before submitting the assignment.

Do not claim the GitHub Pages deployment is working until it has actually been deployed and checked through GitHub.

The objective is to ensure that the project is technically reproducible, accurately documented, and ready for submission without unnecessary changes to the presentation itself.
````

## Outcome

See `docs/iterations.md` → *Iteration 006*.
