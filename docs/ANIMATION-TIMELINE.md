# Choreography specification

All scene parameters are defined in `src/engine/state.js` and animated in `src/animation/timeline.js`. Values are read directly inside R3F `useFrame`; no React state update is used for every particle frame.

## Opening choreography

| Element              | Start → finish                                           | Timing                                                                              |
| -------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Hero headline rows   | 45% vertical offset / opacity 0 → position 0 / opacity 1 | 1.35 seconds, 0.16-second stagger, `power4.out`                                     |
| Section headings     | 35px below / opacity .4 → natural position / opacity 1   | 1 second, `power3.out`, when the heading reaches 90% of viewport height; once       |
| Orbit seal           | 0° → 80°                                                 | Manifesto top at viewport bottom → manifesto bottom at viewport top; scrub 1 second |
| Static hero artwork  | −8° / .96 scale → 12° / 1.04 scale                       | 18-second alternating CSS breath while the WebGL layer loads or is unsupported      |
| Fallback fluid lobes | Changing radii, rotation and scale                       | 19-second alternating CSS animation, staggered negative delays                      |

The page never waits for a full-screen loader. Original artwork is already visible while the optional graphics initialize, then fades out after the scene reports readiness.

## Scroll narrative

“Top 85%” means the section's top reaches a line 85% down the viewport. “Top −30%” means it has moved above the viewport by 30% of the viewport height. These are ScrollTrigger coordinates, not fixed pixel offsets.

All progress values below move from 0 to 1 with linear easing and a 0.7-second scrub catch-up when motion is enabled. Reduced-motion mode uses immediate scroll progress without easing lag.

| State value    | Trigger      | Start      | End      | Scene effect                                                                  |
| -------------- | ------------ | ---------- | -------- | ----------------------------------------------------------------------------- |
| `heroExit`     | `#manifesto` | top bottom | top 18%  | Core scale recedes and camera depth shifts                                    |
| `portfolio`    | `#portfolio` | top 85%    | top 17%  | Hero fluid fades; GPU sphere morphs into three clouds; glass bodies fade in   |
| `alignment`    | `#portfolio` | top 35%    | top −30% | Floating bodies settle into measured grid anchors; spring stiffness increases |
| `portfolioOut` | `#engine`    | top 100%   | top 35%  | Portfolio objects, connecting lines and particles fade away                   |
| `engine`       | `#engine`    | top 100%   | top 5%   | Full-screen liquid field fades in                                             |
| `engineOut`    | `#studio`    | top 100%   | top 35%  | Liquid field fades as studio metrics enter                                    |
| `stats`        | `#studio`    | top 95%    | top 20%  | Chrome particle numerals appear                                               |
| `footer`       | `#contact`   | top 100%   | top 5%   | Metrics fade and rippling metal plane appears                                 |

The particle-number sequence has its own timeline, from `.stats-grid` top at 95% of the viewport to its bottom at 30%:

| Timeline progress | Scatter value       | Behavior                                          |
| ----------------- | ------------------- | ------------------------------------------------- |
| 0–55%             | 1 → 0, `power2.out` | Dispersed particles reform into readable numerals |
| 55–77%            | 0                   | Numerals hold                                     |
| 77–100%           | 0 → .8, `power2.in` | Particles scatter away on exit                    |

The desktop portfolio section reserves 170svh and pins its stage with CSS `position: sticky`. The Engine reserves 180svh with a sticky stage. Mobile layouts and reduced-motion mode remove these runways and use a straightforward document flow. DOM anchors are remeasured during scroll, resize and font readiness, keeping the WebGL objects aligned with the real layout.

## Live interactions

- **Mouse/touch field:** pointer coordinates become normalized device coordinates, then map to the current camera viewport. The selected mode controls vortex, repel or attract forces. Force slider range is .2–2.0.
- **Core drag:** pointer deltas inject angular velocity. Rotation uses inertia and exponential damping. Normal touch scrolling remains available.
- **Energy pulse:** burst begins at 1 and decays exponentially with rate 3.5. It drives particle impulses and liquid deformation. The fallback artwork responds with a scale/rotation pulse.
- **Capsule hover:** reveal/refraction eases toward its hover value with an exponential rate of 6. The body receives a small torque and a colored particle trail appears.
- **Magnetic CTA:** button position is drawn toward the pointer with a maximum 14px displacement and a .32-second `power3` response. Pointer leave/focus blur returns it to center.
- **Cursor:** decorative circle follows with .22-second `power3` lag. It enlarges on links and shows DRAG over the playroom. The system cursor remains available.
- **Footer:** at most one ripple is added every .12 seconds; only the six latest events are stored. Hover energy eases with rate 5.
- **Sound:** off by default. Only an explicit click enables a locally synthesized, quiet tone. No remote audio file or microphone is used.

## Frame order

1. The World callback updates time, inertia, camera distance and quality sampling at priority −4.
2. GpuParticles updates target positions, uniforms and the GPU simulation at priority −2.
3. LiquidCore updates hero and Engine uniforms at priority −1.
4. Normal frame callbacks update capsule presentation, metrics and footer. Rapier uses its 1/60-second fixed timestep.
5. The post-processing composer renders enabled effects.

Lenis is attached to the GSAP ticker on fine-pointer devices. Dialogs stop background scrolling and are excluded from Lenis interception. Pausing motion stops time-based updates, physics, CSS animation and smooth-scroll inertia, while direct scrolling continues to reveal the whole document.
