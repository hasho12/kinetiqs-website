# Kinetiqs

A static, responsive showcase for **kinetiqs.app**. No framework, build step, account system, backend, external font requests or analytics. Upload the files directly to the existing GitHub Pages repository.

## Publish

1. Unzip `kinetiqs-website.zip` on your computer.
2. Open `https://github.com/hasho12/kinetiqs-website` and choose **Add file → Upload files**.
3. Drag the extracted contents into the repository root, preserving the `assets`, `css` and `js` folders. Upload the contents, not the ZIP or an extra enclosing folder.
4. Replace `index.html` with the supplied version. GitHub should show `index.html`, `css/style.css`, `js/main.js` and `assets/brand/...` at their intended paths.
5. Commit to the configured Pages source branch (`main`). Keep the custom domain and `CNAME` value `kinetiqs.app`.
6. Wait for the Pages deployment in **Actions** to succeed. Open `https://kinetiqs.app` and hard refresh (Ctrl+F5).

The ZIP includes the existing brand assets and CNAME. Ordinary GitHub history provides a way to revert the upload. There is no npm installation required on your computer or on GitHub.

## Local preview

Open `index.html` in Chrome for a quick visual preview. For full browser behaviour, serve the folder over HTTP with VS Code Live Server or `python -m http.server 8000`, then visit `http://localhost:8000`. Clipboard permissions and device motion depend on secure context and device support.

## Where to edit

| Item | File / location |
| --- | --- |
| Copy, apps, contact email, public links | `index.html` |
| Colours, typography, layout, breakpoints | `css/style.css` |
| Frame scheduler, audio feedback | `js/core.js` |
| 3D sculpture, lighting, optional device tilt | `js/hero.js` |
| Antigravity physics, dragging, vault lock | `js/lab.js` |
| Navigation, dialogs, export, pin-scroll, cursor | `js/main.js` |
| Brand logos | `assets/brand/` |
| Demo JSON file | `assets/data/backup_export.json` |

When replacing the sample data, update both `js/main.js` and `assets/data/backup_export.json`. It is intentionally labelled as illustrative and is not an importable FitTrack90 backup.

## Product status and intentional placeholders

- **FitTrack90**: Developed; coming soon to Google Play. `Explore FitTrack90` currently opens the requested developer-preview URL `https://cznhash.me`. Replace its `href` with the actual Google Play listing when released and update the button text/status at the same time.
- **VaultLedger and MindLock**: clearly labelled as planned concepts; no fake screenshots, download links, release dates or app functionality are presented.
- **Instagram**: `https://instagram.com/kinetiq.apps`, supplied placeholder handle.
- **X**: the supplied draft `https://x.com/kinetiq.apps` is not treated as a verified profile. The visible `X / soon` button opens a coming-soon message. Replace it with an anchor once the actual handle is set.
- **Email**: `care@kinetiqs.app`. The website links to this address; it does not create or configure the mailbox.
- **App visuals**: abstract, clearly labelled brand artwork. Real app screenshots and individual app pages can be added later.
- **Privacy**: no unsupported “100% verified,” zero-latency or encryption guarantees. The comparison describes design approaches rather than auditing the apps. Add app-specific policies before their store launch.

## Interaction and fallback behaviour

- Three.js renders a metallic orbital sculpture with cursor-sensitive lighting, an icosahedral core and restrained motion. A static CSS sculpture is retained if WebGL is unavailable or its context is lost.
- Matter.js handles bounded zero-gravity data blocks. Pointer dragging throws blocks; the lock gathers them into a wireframe vault. Lock and Nudge controls are keyboard alternatives.
- GSAP ScrollTrigger pins the app rail on sufficiently large viewports. Smaller screens, short windows and paused motion use a native swipeable rail with previous/next buttons.
- Motion follows the system reduced-motion preference initially; the persistent dock can pause/resume it. Canvas loops stop when their sections are offscreen or the tab is hidden.
- Sound is off initially and starts only after a click. Feedback uses short synthesized tones; vibration is a best-effort enhancement on supported devices.
- Device tilt is optional, touch-device-only, and permission-gated where required.
- Native dialogs provide Escape-to-close and focus management. Menus, links, buttons and toggles have visible focus states.

## Validation and practical limits

Syntax, internal resource references and interactive state transitions have been checked. The hosted browser environment blocked local preview URLs, so a real desktop/mobile visual pass has **not** been completed. Before publishing, open the local page at desktop and phone sizes, drag the lab blocks, toggle the lock, inspect the app rail, and check the contact/sample dialogs. Test device tilt on a physical phone. Smooth performance depends on device GPU, browser and screen resolution; 60 FPS is a target, not a guarantee.

## Third-party assets

All dependencies are served locally and pinned:

- Three.js **0.180.0**, MIT — `https://threejs.org/`.
- Matter.js **0.20.0**, MIT — `https://brm.io/matter-js/`.
- GSAP and ScrollTrigger **3.13.0**, GSAP Standard License — `https://gsap.com/standard-license/`.
- Syne and JetBrains Mono fonts, SIL Open Font License; supplied through the Google Fonts project.

Licence notices live in `assets/licenses/`; original vendor headers are retained. The Kinetiqs logo files were supplied by the brand owner. Site-specific source is supplied to the owner; third-party licences remain applicable.
