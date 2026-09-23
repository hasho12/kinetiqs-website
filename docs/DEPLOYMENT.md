# Publish Kinetiqs v3 on GitHub Pages

Your domain is already connected. Keep the existing DNS records at name.com. The new website still uses **kinetiqs.app**.

## Easiest route: upload the finished website

1. Download **kinetiqs-vector-v3-ready-to-upload.zip** and extract it. Open the extracted folder: it must contain `index.html`, `assets/`, `artwork/`, `fonts/`, `CNAME`, and other website files.
2. Open `https://github.com/hasho12/kinetiqs-website`. Save a backup using **Code → Download ZIP** before replacing your current homepage.
3. Check **Settings → Pages → Build and deployment**. For this route, use **Deploy from a branch**, your publishing branch (normally `main`), and **/(root)**.
4. On that branch, choose **Add file → Upload files**. Upload the **contents of the extracted folder**, including all its subfolders, into the repository root. Replace the existing `index.html`. Do not upload the ZIP itself, an enclosing folder, or the source ZIP.
5. Preserve `CNAME`, containing `kinetiqs.app`. Include the empty `.nojekyll` file; if the file picker hides it, create a new file named `.nojekyll` in the repository root.
6. Commit the uploaded files. This publishes your change through the repository's Pages deployment.
7. Wait for the Pages deployment to finish under **Actions**. In **Settings → Pages**, keep the custom domain `kinetiqs.app` and **Enforce HTTPS** enabled when available.
8. Open `https://kinetiqs.app/`. If the previous page appears, perform a hard refresh: Ctrl+Shift+R on Windows/Linux or Cmd+Shift+R on macOS. Check an incognito window as well.
9. Confirm the new two-line heading **DIRECTING FORCE. BUILDING VENTURES.**, cobalt/violet/amber artwork, Engine controls and the three new venture presentations. This distinguishes v3 from the earlier “Yours. By design.” build.

Old unused assets can remain while you verify the new deployment. Do not remove files used by other existing pages. Avoid publishing both an old custom deployment workflow and the new branch-based route at the same time.

## Source route: rebuild automatically after future changes

Choose this route if you want to edit copy, replace media and develop the website further.

1. Extract **kinetiqs-vector-v3-source.zip**. Put its contents in your repository root, preserving your Git history and any unrelated pages. The root must contain `package.json`, `src/`, `public/`, `index.html` and `.github/workflows/deploy.yml`.
2. In **Settings → Pages**, select **GitHub Actions** as the build source. Keep the existing custom domain in the Pages settings; a CNAME file alone does not configure the domain for an Actions deployment.
3. Commit the source files and `package-lock.json` to `main`. If your default branch has a different name, change `branches: [main]` in the workflow first. Do not upload `node_modules/`.
4. Open **Actions → Build and deploy Kinetiqs v3**. The workflow installs the locked dependencies, runs the checks, builds `dist/`, and deploys that folder. You may also select **Run workflow** on the default branch.
5. After the workflow succeeds, open the domain and complete the checks in `VALIDATION.md`.
6. For each later update, change the relevant source or add your media to `public/media/`, then commit. The next build discovers those files and publishes the update.

The included workflow grants read access during build and Pages/OIDC write access only to its deployment job. It needs no personal access token. Check that any other existing workflows do not also deploy an older build.

## Preview on your own computer

With Node.js 24 installed, run `npm ci`, `npm run build`, then `npm run preview` in the source directory. Open the address printed by Vite. Use a browser with hardware acceleration enabled for the full 3D experience. Opening the HTML directly as a local file will not load the module application correctly.

## If something looks wrong

| Symptom                       | Check                                                                                                                                |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| The same old homepage         | Verify that the latest Pages deployment succeeded and that `index.html` is in the configured publishing root. Hard refresh.          |
| Blank page / missing CSS      | Upload the whole compiled folder, including `assets/`. Do not upload the source `index.html` on its own.                             |
| Artwork but no moving 3D      | Check Motion and Detail in the dock. Reduced motion, unsupported WebGL2, or graphics initialization failure can select the fallback. |
| Choppy animation              | Leave Detail on Auto or select Eco. High mode intentionally uses more GPU resources.                                                 |
| Screenshots are not appearing | Use the exact filenames in `ASSETS.md`, in the source project's `public/media/`, and rebuild.                                        |
| Google Play button missing    | Intentional: the current URL is a developer preview. Update the link and label once the real listing exists.                         |

Official references: [GitHub publishing sources](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site), [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages), [setup-node](https://github.com/actions/setup-node).
