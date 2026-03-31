# Deploying Redneck Angular App to GitHub Pages

This guide explains how to deploy the Redneck Angular application to GitHub Pages at `https://voidbrain.github.io/Grover/CLIENT-ANGULAR/redneck/`.

## Configuration Changes Made

### 1. Angular Configuration (`angular.json`)
- Added `github-pages` build configuration with base href `/Grover/CLIENT-ANGULAR/redneck/`
- Increased bundle size budgets to accommodate the application size

### 2. App Configuration (`app.config.ts`)
- Added `withHashLocation()` to use hash-based routing for better GitHub Pages compatibility

### 3. Index HTML (`src/index.html`)
- Updated base href to `/Grover/CLIENT-ANGULAR/redneck/`
- Added redirect handling script for SPA routing

### 4. Package.json
- Added `build:github-pages` script for building with GitHub Pages configuration

### 5. GitHub Actions Workflow
- Created `.github/workflows/deploy-angular-to-github-pages.yml` for automated deployment

### 6. 404.html
- Created `public/404.html` for handling SPA routing on GitHub Pages

## Manual Deployment

To manually build and deploy:

```bash
cd CLIENT-ANGULAR/redneck
npm run build:github-pages
```

The build output will be in `dist/redneck/browser/` directory.

## Automated Deployment

The GitHub Actions workflow will automatically deploy when:
- Code is pushed to the `main` branch
- Changes are made in the `CLIENT-ANGULAR/redneck/` directory
- The workflow is manually triggered

## GitHub Pages Setup

To enable GitHub Pages:

1. Go to your repository settings
2. Navigate to Pages section
3. Set Source to "GitHub Actions"
4. The workflow will handle the deployment

## URL Structure

The app will be available at:
- Main app: `https://voidbrain.github.io/Grover/CLIENT-ANGULAR/redneck/`
- Routes will use hash-based URLs (e.g., `https://voidbrain.github.io/Grover/CLIENT-ANGULAR/redneck/#/home`)

## Troubleshooting

### Build Fails
- Check that all dependencies are installed: `npm ci`
- Verify Node.js version (recommended: 20.x)

### Routing Issues
- The app uses hash-based routing for GitHub Pages compatibility
- All routes should work with the `#/` prefix

### 404 Errors
- The `404.html` file handles redirects for SPA routing
- Ensure the file is included in the build output

## Notes

- The app uses Ionic Angular components
- Localization is enabled for English (en-US) and Italian (it)
- The build includes all necessary assets and dependencies
