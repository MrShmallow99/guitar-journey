# Prompt 007: Publish to GitHub and verify the live deployment

| | |
|---|---|
| **Date** | 2026-11-03 |
| **Phase** | Iteration 007: publication and live verification |
| **Tool** | Claude Code (Claude Opus 5.5) |
| **Fidelity** | Exact prompt text, verbatim |

## Prompt (verbatim)

````markdown
The release-readiness review is complete. I want to publish the existing project to GitHub and verify the live deployment.

I will provide the URL of the empty GitHub repository.

Please:

1. Preserve the complete existing Git history, including all 25 commits.
2. Add the repository as the Git remote.
3. Verify that no generated environments, node_modules, temporary files, or sensitive local files are tracked.
4. Push the existing main branch to GitHub.
5. Verify the GitHub Actions workflow completes successfully.
6. If GitHub Pages needs to be enabled manually, provide the exact settings I should select.
7. Once deployed, verify the actual public URL, including navigation, Three.js, the fretboard, and the practice planner.
8. Verify that the README screenshots and documentation render correctly on GitHub.
9. Add the real live presentation URL to the README, then commit and push that change as a separate, genuine update.
10. Record the publication and verification results in docs/iterations.md.

Do not rewrite Git history, squash existing commits, or add unnecessary features.

Do not push until I provide the repository URL and explicitly authorize publication.

Report the final GitHub repository URL, GitHub Pages URL, deployment status, and any unresolved issues.
````

## Outcome

See `docs/iterations.md` → *Iteration 007*.
