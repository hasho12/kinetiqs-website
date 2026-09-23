# Validation — Vector Studio v3.0.0

## Completed checks

| Check                           | Result and scope                                                                                                                                                                                  |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run build`                 | Pass. Vite production bundle and full-page React prerender succeed.                                                                                                                               |
| `npm run check`                 | 8 passing checks: GPU data/fallback, stable springs, quality tiers, bounded interactions, honest product states, DOM hydration/controls, and R3F scene lifecycle with real Rapier initialization. |
| Custom GLSL compilation/linking | 8 programs pass: particle points, connections, liquid core, glass, footer, stats, position simulation and velocity simulation.                                                                    |
| Production dependency audit     | `npm audit --omit=dev --audit-level=high` returned zero known vulnerabilities at build time. This is a package database check, not a complete security review.                                    |

The shader check uses an isolated EGL OpenGL ES 3.2 context on Mesa llvmpipe, with Three.js shader chunks and matching program prefixes. It verifies compilation and linking, not the rendered composition or timing on a physical GPU.

The React Three Fiber test renderer mocks WebGL and the texture canvas. Actual React hooks, Three scene objects and Rapier WASM initialize and step through the narrative with finite transforms and uniforms. It does not render real frames. The Node test harness emits dependency warnings about mixed CommonJS/ESM Three imports, a deprecated Three clock and Rapier's initialization signature; these are not test failures. The Vite production graph is bundled separately.

The graphics bundle is approximately 3.3 MB minified / 1.12 MB gzip, including physics and post-processing. The document application is approximately .39 MB minified / .13 MB gzip. Graphics load asynchronously; supplied fallback artwork is visible first. The build reports the graphics chunk size as a warning. No circular-chunk warning remains.

The build also verifies local HTML/CSS resources, the prerendered headline, the v3 release marker and domain files. Both delivery archives are checked for ZIP integrity and contain their entry files at the archive root.

## Not yet verified

A local interactive browser preview was blocked by this environment. No browser screenshot, visual sign-off, Lighthouse result, mobile GPU test or measured 60 FPS result is claimed. These require a browser on your own computer/device or the deployed preview. No push or live deployment was performed.

## Final device review before launch

1. Open the built site with a hardware-accelerated desktop browser. Confirm the liquid core and particle field appear without losing the headline or contact link.
2. Move and drag over the hero; use the pulse button. Scroll to the portfolio and check that the three glass bodies settle on their corresponding app slots.
3. Hover/open FitTrack90. Confirm the developer preview opens the requested URL and “Google Play launch soon” remains accurate. VaultLedger and MindLock must remain planned concepts.
4. Try the three Engine modes, force slider, pulse and reset. Scroll through the metrics and contact area; check the numerals are legible and the surface ripples are visible.
5. Use the keyboard: Skip to content, navigation links, dialogs, Escape, focus return, field controls and footer links. Confirm the fixed dock does not cover important controls.
6. Check portrait mobile at approximately 390px and narrow 320px widths. Confirm there is no horizontal page overflow, body text is readable, native scrolling works, and dialogs remain scrollable.
7. Enable reduced motion in the device settings or use Pause. Motion should stop while the entire page and all links remain usable. Change graphics detail and switch tabs to check pause/resume.
8. Test with WebGL disabled or unavailable. Original artwork, product content, links and dialogs should remain usable. Test JavaScript disabled separately: prerendered content and ordinary links remain, while interactive controls require JavaScript.
9. Check the Network/Console panels for missing files, failed shaders, uncaught exceptions or unexpected third-party requests. With ordinary site navigation and no external link opened, assets should be served from the site.
10. When adding real app media later, rebuild and inspect both the hovered glass preview and the full dialog video/screenshot on desktop and mobile.

## Reproduce the optional shader compiler check

On Linux with Python 3, EGL and GLES libraries installed:

```bash
node scripts/prepare-shader-validation.mjs
python3 scripts/validate-shaders.py
```

This check is separate from the cross-platform npm checks; the GitHub Pages workflow does not require a graphics driver.
