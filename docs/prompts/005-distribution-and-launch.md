# Prompt 005: Distribution and launch options

| | |
|---|---|
| **Date** | 2026-11-03 |
| **Phase** | Iteration 005: standalone HTML, GitHub Pages support, Windows launcher |
| **Tool** | Claude Code (Claude Opus 5.5) |
| **Fidelity** | Exact prompt text, verbatim |

## Prompt (verbatim)

````markdown
I want to improve how the existing presentation is launched and distributed.

Currently, the application requires a local HTTP server (`python -m http.server`) because it uses JavaScript ES modules, external data files, and Three.js.

I want the presentation to be much easier to open, share, and demonstrate, without compromising any existing functionality.

Please implement the following three distribution options.

## 1. Standalone HTML presentation

Create a fully self-contained version of the presentation that can be opened directly by double-clicking an HTML file.

Requirements:

- The output should be `dist/presentation.html`.
- It must work directly through `file://`, without localhost, a backend, Python, or internet access.
- Bundle the required JavaScript, CSS, Three.js dependencies, Python-generated data, fonts, and assets.
- Preserve all 11 slides and their existing content.
- Preserve the interactive skill radar, progression roadmap, fretboard, practice planner, and personal summary.
- Preserve the animated, interactive 3D guitar model and its camera controls.
- Preserve navigation, keyboard shortcuts, RTL/BiDi handling, and responsive layouts.
- Preserve localStorage functionality where browser security policies permit it, with a graceful fallback where storage is unavailable.
- Do not load anything from external CDNs or URLs at runtime.

Use an appropriate bundling approach, such as Vite, Rollup, or esbuild, if necessary.

Important: A standard JavaScript bundle is not automatically a fully self-contained HTML document. Make sure all required resources are embedded and that no runtime network requests are needed.

If a particular feature cannot operate reliably under `file://` browser restrictions, investigate a compatible implementation rather than silently removing the feature.

Keep the original source project intact. The standalone HTML should be a generated distribution artifact, not a replacement for the maintainable source code.

## 2. GitHub Pages support

Prepare the existing project for hosting through GitHub Pages.

Requirements:

- Ensure the complete presentation works correctly when hosted under a repository subpath, not only at the domain root.
- Avoid hardcoded absolute asset paths that would break on GitHub Pages.
- Preserve the existing Python-generated data integration.
- Provide a reproducible build and deployment process.
- Add a GitHub Actions deployment workflow if appropriate.
- Explain how GitHub Pages can be enabled in repository settings.
- Document the resulting URL structure.

Do not push the repository or enable any remote deployment yet. I will handle publication separately.

## 3. One-click local launcher

Add a convenient launcher for Windows.

Requirements:

- Create a `launch.bat` or similarly simple launcher in the repository root.
- Detect whether Python is available.
- Start a local HTTP server automatically.
- Open the presentation in the default browser.
- Avoid launching duplicate servers unnecessarily.
- Handle a busy port gracefully.
- Display helpful error messages if launching fails.
- Ensure the server has a clear shutdown mechanism.
- Work when the repository path contains spaces.

The launcher is a convenience feature. It should not be required for the standalone HTML or GitHub Pages versions.

## 4. Build and project structure

Keep the existing development architecture wherever practical.

Provide straightforward commands to:

- Run the original project locally.
- Generate the standalone HTML.
- Test the standalone output.
- Prepare the GitHub Pages deployment.

Avoid unnecessary dependencies or complex infrastructure.

Generated files should be clearly separated from source files.

Decide whether `dist/` should be committed to Git, and document the rationale.

## 5. Verification

Please perform actual functional testing, not just a successful build.

For the standalone version, explicitly test opening `dist/presentation.html` using a `file://` URL in a real browser.

Verify:

1. All 11 slides load and navigate correctly.
2. The 3D guitar renders, animates, and responds to interaction.
3. The skill radar works and its values propagate through the other slides.
4. The interactive fretboard displays the Python-generated music theory data correctly.
5. The personalized practice planner generates appropriate sessions.
6. The personal summary reflects the user's selections.
7. RTL/BiDi rendering remains correct.
8. No required runtime requests fail.
9. There are no JavaScript console errors.
10. The standalone version works with networking disabled.
11. Desktop and mobile layouts remain usable.

For GitHub Pages, test the site under a simulated repository subpath.

For the Windows launcher, validate its behavior where the environment allows. If Windows execution is unavailable, explain what remains untested.

Compare the standalone output against the original application to ensure functional parity.

Do not claim a test passed unless it was actually executed.

## 6. Documentation

Update the README to clearly explain the three supported launch methods:

- GitHub Pages: recommended for sharing and evaluation.
- Standalone HTML: portable, offline, double-click execution.
- Local launcher: convenient development and demonstration.

Include the relevant commands and limitations.

Update the project's technical documentation and record this prompt verbatim in the next sequential file under `docs/prompts/`.

Update `docs/iterations.md` with the actual implementation decisions, changes, tests, and any unresolved limitations.

Create logical Git commits, preserving all existing history.

Do not push anything to GitHub yet.

## 7. Completion report

When finished, report:

- Which launch methods are fully implemented.
- How to build and use each method.
- Whether the standalone HTML truly works without localhost or internet.
- The size of the generated standalone file.
- Any differences in functionality between the original and standalone versions.
- The tests actually performed and their results.
- Any remaining limitations or risks.

The goal is simple: the same complete presentation should be easy to run locally, share online, and open offline, while preserving the quality and functionality of the existing project.
````

## Outcome

See `docs/iterations.md` → *Iteration 005*.
