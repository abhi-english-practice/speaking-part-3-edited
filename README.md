# Aptis Speaking Part 3

GitHub Pages-ready static website. No build step or external dependency is required.

## Upload to GitHub

1. Create a new repository.
2. Upload **all files and folders in this directory**, keeping the structure unchanged.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select **main** and **/(root)**, then click **Save**.

The site entry point is `index.html`. Microphone recording requires HTTPS, which GitHub Pages provides.

## Structure

- `index.html`: page structure
- `styles.css`: responsive presentation
- `data.js`: lesson content and image paths
- `app.js`: navigation, timer, speech, clipboard and recording
- `assets/images/`: 50 extracted lesson images
