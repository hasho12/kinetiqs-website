# Kinetiqs — Yours. By design.

An original, immersive showcase for **kinetiqs.app**, built for the existing GitHub Pages repository. This second version uses a continuous chrome-and-lime 3D world, large editorial typography, a full-screen menu, an app showcase, an interactive antigravity playground and an expandable local-first comparison.

The earlier version is preserved separately as `kinetiqs-website-v1-backup.zip`. This project has not been published or pushed to GitHub from this workspace.

## Publish to your existing website

1. Extract `kinetiqs-immersive-v2.zip` into a new folder on your computer. The redesigned hero says **Yours. By design.** and includes **Disrupt the orbit**.
2. Open `https://github.com/hasho12/kinetiqs-website` and choose **Add file → Upload files**.
3. Upload the extracted contents into the repository root. Preserve the `assets`, `css` and `js` folders. Upload the files and folders, not the ZIP or an extra enclosing folder.
4. Replace the existing HTML, CSS, JavaScript and assets with this version. The root should contain `index.html`, `CNAME`, `README.md`, `404.html`, `robots.txt`, `sitemap.xml`, `.nojekyll`, and the three asset/code folders.
5. Commit to your configured Pages source branch, currently `main`. Keep the custom domain and `CNAME` value **kinetiqs.app**.
6. Wait for the Pages deployment in **Actions** to finish. Open `https://kinetiqs.app` and hard refresh (Ctrl+F5).

No npm installation, framework, build step or backend is required. Fonts, graphics and libraries are served with the website. There are no analytics or advertising scripts.

## Preview before uploading

Open `index.html` in a current browser for a quick preview. For normal browser behaviour, serve the extracted folder with VS Code Live Server or `python -m http.server 8000`, then open `http://localhost:8000`.

Check a desktop and phone viewport, use the orbit control, throw the lab blocks, toggle their lock and open the contact/sample dialogs. Check the page with motion paused. Optional device tilt and clipboard access depend on secure context and device support; test tilt on a physical phone.

## Where to edit

| Item | File |
| --- | --- |
| Copy, app status, contact and public links | `index.html` |
| Layout, colour, type and responsive rules | `css/style.css` |
| Shared frame scheduler and sound feedback | `js/core.js` |
| 3D sculpture, scroll poses, orbit and tilt | `js/hero.js` |
| Antigravity physics, dragging and vault lock | `js/lab.js` |
| Navigation, dialogs, export and page choreography | `js/main.js` |
| Supplied brand logos | `assets/brand/` |
| Static sculpture fallback | `assets/sculpture.svg` |
| Fictional export sample | `assets/data/backup_export.json` |

When replacing the sample export, update both `js/main.js` and `assets/data/backup_export.json`. It is a clearly labelled concept format, not an importable FitTrack90 backup.

## Product status and placeholders

- **FitTrack90** is developed and awaiting its Google Play launch. **Explore the preview** opens the requested temporary URL `https://cznhash.me`. Replace this link with the real Google Play listing and update its label/status when released.
- **VaultLedger and MindLock** are planned concepts. No download links or release dates are fabricated.
- The phone and concept illustrations are **brand artwork**, not actual screenshots. Real app screenshots and individual pages can be added later.
- Instagram uses the supplied placeholder `https://instagram.com/kinetiq.apps`.
- **X / soon** opens a coming-soon message. Replace it with a link once the valid official handle is available; the draft handle was `kinetiq.apps`.
- Email links point to **care@kinetiqs.app**. The website does not create the mailbox.
- The architecture explains a local-first design approach. It is not an audit or a guarantee of encryption, latency or total privacy. Add app-specific policies with each release.

## Interaction and fallbacks

- One Three.js context renders an original chrome knot, lime collars and an instanced satellite field. Cursor motion tilts the sculpture; scrolling moves it into the philosophy introduction. Click the sculpture or use **Disrupt the orbit** to expand its satellites.
- A vector sculpture remains visible if WebGL is absent or its context is lost. The orbit control also works with this fallback. There is no blocking loading screen.
- Three.js caps device pixel ratio and lowers it after sustained slow frames. Its studio environment is generated locally rather than downloaded.
- Matter.js runs the bounded zero-gravity illustration. Mouse/pointer dragging throws blocks. **Engage zero-cloud lock** brings them into a vault; **Give it a nudge** releases or redistributes them. Both controls work from a keyboard. Vertical page scrolling stays available on touchscreens.
- Scrolling stays native. GSAP adds entrance motion and a desktop reveal on FitTrack90 artwork; there is no forced scroll interception or horizontal rail.
- The motion preference follows the operating system initially and can be changed in the floating dock. Shared canvas animation stops while the relevant section is offscreen or the tab is hidden.
- Sound is off initially. Optional feedback is synthesized locally after a click; vibration is a best-effort enhancement.
- Device tilt is opt-in and requests permission where required. It does not transmit sensor data.
- The full-screen menu and information panels use native dialogs for keyboard focus and Escape handling. Page content remains readable without JavaScript.

## Validation and limits

Completed checks include JavaScript syntax; CSS parsing; HTML, SVG and JSON validity; duplicate IDs; internal anchors and local resource paths; and consistency between the download and generated JSON.

Simulated DOM checks at 320, 390 and 1440 pixels cover navigation, dialogs, clipboard, orbit state, physics dragging, lock/release, reduced motion, sample export and the optional backup switch. Real Three.js geometry was also exercised with a mocked renderer to check finite transforms/buffers, scroll poses, context loss and recovery.

These are **not rendered visual or GPU tests**. The available browser blocks local previews and has WebGL disabled, so final visual quality, GPU performance and physical-device behaviour must be checked in a real browser before deployment. A 60 FPS experience is a target, not a guarantee across all devices.

## Dependencies and credits

Dependencies are bundled locally and pinned:

- Three.js **0.180.0**, MIT: `https://threejs.org/`
- Matter.js **0.20.0**, MIT: `https://brm.io/matter-js/`
- GSAP / ScrollTrigger **3.13.0**, GSAP Standard License: `https://gsap.com/standard-license/`
- Syne and JetBrains Mono, SIL Open Font License, via the Google Fonts project

Notices are in `assets/licenses/`; vendor headers are retained. The Kinetiqs identity was supplied by the brand owner. Scene geometry, illustrations and page code are original for this website. The design direction references immersive creative-studio websites; it does not reuse Lusion's assets, code or branding.
