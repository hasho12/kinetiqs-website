# Scene architecture

## Document and rendering

The website is a semantic React page with a single fixed R3F canvas behind the document. HTML handles navigation, product copy, headings, links, controls and accessible dialogs. GPU visuals are decorative. Every product and metric remains represented in the DOM, including when its visible numeral is rendered as particles.

Vite produces static files. `scripts/prerender.mjs` renders the complete document into the generated HTML. React hydrates it, then a WebGL2 preflight decides whether to load the graphics bundle. No Node server is needed on GitHub Pages. WebGL failure leaves the SVG/CSS artwork and functional document available.

| Module                                | Responsibility                                                                 |
| ------------------------------------- | ------------------------------------------------------------------------------ |
| `src/App.jsx`                         | Page layout, product dialogs, field controls, links and fallback art           |
| `src/config/site.js`                  | Brand, contacts, product status, real metrics and sample export                |
| `src/animation/timeline.js`           | ScrollTrigger phases, Lenis, pointer events, inertia and DOM measurements      |
| `src/engine/state.js`                 | Mutable frame data, bounded ripple history, quality settings and spring helper |
| `src/components/Experience.jsx`       | Canvas, camera, lifecycle, quality adaptation and post-processing              |
| `src/components/GpuParticles.jsx`     | Particle geometry, simulation updates, connected lines and world transforms    |
| `src/engine/particles.js`             | Seed data and ping-pong GPUComputationRenderer integration                     |
| `src/components/LiquidCore.jsx`       | Hero/Engine raymarch planes and shader uniforms                                |
| `src/components/PortfolioPhysics.jsx` | Rapier bodies, collisions, alignment impulses, previews and trails             |
| `src/components/StatParticles.jsx`    | Numeral raster sampling and GPU scatter/reform points                          |
| `src/components/LiquidFooter.jsx`     | Interactive surface geometry and ripple uniform history                        |
| `src/engine/textures.js`              | Original studio reflection map and animated concept-preview textures           |
| `src/engine/audio.js`                 | Optional, gesture-activated local synthesis                                    |

## GPU particles

High mode uses a 256 × 256 texture grid: **65,536 particles**. Each texel stores one position or velocity vector plus a seed. Positions begin on a deterministic lobed Fibonacci sphere. `GPUComputationRenderer` maintains two render targets for each of the two simulation variables, swapping them after each compute step.

Both kernels read the previous position and velocity. The velocity kernel combines a restoring spring, damping, an analytic divergence-free trigonometric field, cursor mode forces and a radial burst. Its target can morph from the hero shell into three measured portfolio clusters. The position kernel integrates the previous velocity. The timestep is capped at 1/30 second; velocity and runaway position guards protect against large suspended-tab deltas.

This is a fluid-like artistic particle simulation, **not** a Navier–Stokes pressure solver. Particle positions update in GPU textures. The CPU updates only a small set of uniforms and DOM target coordinates; it does not integrate 65,536 individual particles every frame.

Render targets use half-float storage; immutable home positions use a floating-point data texture. If render-to-float support is unavailable, the point vertex shader supplies an analytic animated fallback. 1,536 line segments connect selected particles, using the same position texture.

## Liquid and glass

The liquid fragment shader raymarches a smooth union of five animated lobes. Surface deformation, a soft film response, Fresnel reflectance and analytic studio lights create a metallic silhouette. Refraction uses three slightly different indices of refraction to separate red, green and blue. The full-screen Engine shares this material but changes its field composition and response to vortex/repel/attract controls.

This is a procedural environment reflection, not path-traced reflections of the full DOM or the entire 3D scene. The portfolio shader samples a self-generated studio reflection map and an artwork/video texture, blending the latter into the capsule on hover. No external HDRI is required.

`src/shaders/` contains all editable GLSL sources. Vite imports them as raw strings.

## Rapier portfolio

Three dynamic bodies represent FitTrack90, VaultLedger and MindLock. Sphere colliders resolve inter-body collisions; front/back collider planes keep the bodies in the presentation volume. A damped spring pulls each body toward a world-space position derived from its corresponding HTML artwork slot. Early in the sequence, oscillating target offsets create free-floating drift. As scroll alignment reaches one, drift stops, spring stiffness increases, and the bodies form the grid. A temporary downward impulse during alignment supplies a visible gravity shift.

Hover adds torque, increases refractive highlights and reveals a 90-point ambient trail. Real MP4 textures are supported when supplied; otherwise the preview is an original animated orbital mark. Pausing motion freezes time and physics while allowing layout positions to follow scrolling. These are display bodies, not a product database or backend.

## Metrics and footer

Each numeral is drawn into a small in-memory canvas and sampled into a point cloud. A vertex shader interpolates between glyph targets and deterministic explosion vectors. A chrome-like fragment shading response gives the reformed numbers a metallic appearance. Scroll coordinates come from the HTML metric slots.

The footer is a subdivided plane. Six bounded ripple events feed a damped radial sine displacement in the vertex shader. Derivative-based normals and analytic reflected strips create a liquid-metal response. Link hover adds energy; the DOM remains responsible for the actual links.

## Motion and quality

| Setting  | Particle count | DPR cap | Raymarch steps | Effects                                               |
| -------- | -------------: | ------: | -------------: | ----------------------------------------------------- |
| High     |         65,536 |     1.5 |             48 | Bloom, chromatic aberration, vignette, depth of field |
| Balanced |         36,864 |     1.2 |             36 | Bloom, chromatic aberration, vignette                 |
| Eco      |         16,384 |     1.0 |             24 | No full-screen post-processing                        |

Auto selects a starting tier from viewport width and reported CPU count. If average frame time exceeds 31 ms over a 150-frame sample after the cooldown, it reduces detail. Manual selection is respected. Browser resize re-evaluates Auto for the new viewport. Effects that require floating-point render targets are disabled without that support.

These are budgets, not measured performance promises. CPU count is only a coarse startup heuristic. The largest graphics chunk includes Rapier WASM and is loaded separately from the document application. The page itself is immediately readable with self-hosted fallback art.

Reduced-motion preferences start with animation paused. Touch uses native scrolling. The dock can pause/resume animation or select detail. Hidden tabs stop the continuous render loop and physics. Context loss restores static artwork and offers retry; restoration remounts scene resources. Materials, textures and owned geometries are disposed on teardown.

## Data and hosting

No analytics, accounts, cookies, storage persistence, contact form backend or external asset CDN is added by this application. Email uses a `mailto:` link; social/product links open external services. Hosting requests still go through GitHub Pages. The website is a showcase, not itself an offline-installable PWA. Its sample JSON is explicitly fictional and does not claim to match a real FitTrack90 export format.

Font and dependency licence notices are included. Do not insert secrets in the public config: the website is entirely client-side and its source/bundle is public.

## Primary implementation references

- [Three.js GPUComputationRenderer](https://threejs.org/docs/pages/GPUComputationRenderer.html)
- [React Three Fiber](https://r3f.docs.pmnd.rs/getting-started/introduction)
- [Drei](https://drei.docs.pmnd.rs/)
- [React Three Rapier](https://github.com/pmndrs/react-three-rapier)
- [React Postprocessing](https://react-postprocessing.docs.pmnd.rs/)
- [GSAP ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)
- [Lenis integration](https://github.com/darkroomengineering/lenis)
