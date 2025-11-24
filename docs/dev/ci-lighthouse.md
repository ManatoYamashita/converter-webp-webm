# Lighthouse CI Configuration

## Overview
This project uses Lighthouse CI in the `prod-quality.yml` workflow to ensure performance standards on the `prod` branch. Lighthouse CI runs automated performance, accessibility, and best practices audits on every push to production.

## Configuration Files
- **Workflow**: `.github/workflows/prod-quality.yml`
- **Lighthouse Config**: `.lighthouserc.js`

## Known Issues and Solutions

### NO_FCP (No First Contentful Paint) Error

**Symptoms:**
```
Error: Lighthouse failed with exit code 1
runtimeError: {
  "code": "NO_FCP",
  "message": "The page did not paint any content. Please ensure you keep the browser window in the foreground during the load and try again. (NO_FCP)"
}
```

**Root Causes:**

1. **`wait-on` Limitation**: The `wait-on` tool only checks for HTTP 200 status, not actual page rendering completion
2. **Next.js Hydration Delay**: Next.js 16 with React 19 requires 5-10 seconds for complete hydration in CI environments
3. **Headless Chrome Performance**: GitHub Actions' Headless Chrome is 2-3x slower than local environments
4. **Missing Content Verification**: No check to verify that the page actually rendered before Lighthouse runs

**Solutions Implemented:**

#### 1. Enhanced `wait-on` Configuration
```yaml
- name: Wait for server (HTTP ready)
  run: npx wait-on@7.0.1 http://localhost:3000 --timeout 60000 --interval 1000 --verbose
```
- `--timeout 60000`: Extended timeout to 60 seconds (default: 30s)
- `--interval 1000`: Check every 1 second (default: 250ms reduces accuracy)
- `--verbose`: Output detailed logs for debugging

#### 2. Hydration Wait Step
```yaml
- name: Wait for Next.js hydration
  run: |
    echo "Waiting for Next.js to fully initialize and hydrate..."
    sleep 10
    echo "Checking server logs:"
    tail -n 50 /tmp/next.log || true
```
**Why 10 seconds?**
- `app/page.tsx` contains multiple `useEffect` hooks (184-281 lines) that initialize:
  - SortableJS (drag-and-drop library)
  - IntersectionObserver (floating button visibility)
  - Structured Data JSON-LD generation
- React 19's Selective Hydration can delay client component hydration
- CI environment CPU throttling adds 2-3x overhead

#### 3. Content Verification
```yaml
- name: Verify page content
  run: |
    echo "Fetching page content to verify rendering..."
    CONTENT=$(curl -s http://localhost:3000 | head -n 100)
    echo "$CONTENT"
    if echo "$CONTENT" | grep -q "Converter WebP/WebM"; then
      echo "Page content verified successfully"
    else
      echo "ERROR: Page content not found!"
      tail -n 100 /tmp/next.log || true
      exit 1
    fi
```
**What it checks:**
- Actual HTML content is returned (not just HTTP 200)
- Page title "Converter WebP/WebM" is present in the response
- Fails early with detailed logs if rendering fails

#### 4. Lighthouse CI Configuration

**Workflow Step (Simplified):**
```yaml
- name: Lighthouse audit
  run: npx @lhci/cli@0.13.0 autorun
```

**Why simplified?** All configuration is now in `.lighthouserc.js` to avoid CLI option conflicts and improve maintainability. Previously, passing Chrome flags as a space-separated string in CLI caused parsing issues.

**Configuration in `.lighthouserc.js`:**
```javascript
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000'],
      numberOfRuns: 1,
      settings: {
        maxWaitForLoad: 90000, // 90 seconds for page load
        maxWaitForFcp: 90000, // 90 seconds for First Contentful Paint
        pauseAfterLoadMs: 5000, // Additional 5s wait after load event
        chromeFlags: [
          '--no-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-software-rasterizer',
          '--disable-extensions',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-ipc-flooding-protection',
        ],
      },
    },
    // ... upload and assert config
  },
};
```

**Key Settings:**
- `maxWaitForLoad=90000`: Extended page load wait time to 90 seconds (default: 45s insufficient for CI)
- `maxWaitForFcp=90000`: Extended FCP-specific wait time to 90 seconds
- `pauseAfterLoadMs=5000`: Additional 5-second wait after load event to ensure full hydration
- Chrome flags (CI environment optimizations):
  - `--no-sandbox`: Required for CI environments (security constraint)
  - `--disable-dev-shm-usage`: Prevents `/dev/shm` memory issues
  - `--disable-gpu`: No GPU available in CI
  - `--disable-software-rasterizer`: Improves rendering performance
  - `--disable-extensions`: Disables Chrome extensions
  - `--disable-background-timer-throttling`: Prevents timer throttling
  - `--disable-backgrounding-occluded-windows`: Disables window occlusion optimization
  - `--disable-renderer-backgrounding`: Prevents renderer backgrounding
  - `--disable-ipc-flooding-protection`: Disables IPC flooding protection (improves CI stability)

## Performance Thresholds

Defined in `.lighthouserc.js`:

| Metric | Threshold | Severity |
|--------|-----------|----------|
| First Contentful Paint (FCP) | 5 seconds | Error |
| Speed Index (SI) | 8 seconds | Warning |
| Time to Interactive (TTI) | 10 seconds | Error |

## Testing Locally

To reproduce CI behavior locally:

```bash
# Build production version
npm run build

# Start production server in background
npm run start &

# Wait for server and hydration (same as CI)
npx wait-on http://localhost:3000 --timeout 60000 --interval 1000 --verbose
sleep 10

# Verify page content
curl http://localhost:3000 | grep "Converter WebP/WebM"

# Run Lighthouse CI
npx @lhci/cli@0.13.0 autorun

# Stop server
pkill -f "next start"
```

## Troubleshooting

### Lighthouse Still Fails with NO_FCP

1. **CLI Option Conflicts (Common Issue)**: If using CLI options like `--collect.settings.chromeFlags="..."`, these may conflict with `.lighthouserc.js` settings. Passing Chrome flags as a space-separated string causes parsing issues. **Solution**: Remove all CLI options from the workflow and rely solely on `.lighthouserc.js` configuration. Use `npx @lhci/cli autorun` without additional options.

2. **Check server logs**: Review `/tmp/next.log` in CI output

3. **Verify content step**: Check if "Verify page content" step passes

4. **Increase sleep duration**: Try `sleep 15` or `sleep 20` in the hydration wait step

5. **Check maxWaitForFcp**: In `.lighthouserc.js`, ensure `maxWaitForFcp` is set to 90000 or higher. This is separate from `maxWaitForLoad` and specifically controls FCP timeout.

6. **Add pauseAfterLoadMs**: In `.lighthouserc.js`, add `pauseAfterLoadMs: 5000` to wait an additional 5 seconds after the load event before running audits.

### False Positives (Performance Threshold Exceeded)

1. **Review Lighthouse artifacts**: Download artifacts from GitHub Actions
2. **Adjust thresholds**: Edit `.lighthouserc.js` assertions
3. **Optimize application**: If genuine performance issue, optimize code

### CI Timeout (Job exceeds 10 minutes)

1. **Reduce Lighthouse runs**: Already set to 1 run (minimum)
2. **Skip non-critical audits**: Add `--collect.settings.skipAudits` in workflow
3. **Use Lighthouse CI server**: Consider `--upload.target=temporary-public-storage` instead of filesystem

## Related Files

- `.github/workflows/prod-quality.yml:35-66` - Lighthouse CI workflow steps
- `.lighthouserc.js` - Lighthouse CI configuration and assertions
- `app/page.tsx:184-281` - Heavy client-side initialization code
- `app/layout.tsx:7-11` - Google Fonts that affect FCP

## References

- [Lighthouse CI Documentation](https://github.com/GoogleChrome/lighthouse-ci)
- [Next.js 16 Deployment Guide](https://nextjs.org/docs/deployment)
- [React 19 Hydration](https://react.dev/reference/react-dom/client/hydrateRoot)

---

Last updated: 2025-11-24
**Changes**: Fixed CLI option conflicts by removing redundant CLI options and relying solely on `.lighthouserc.js` configuration. Added `maxWaitForFcp` and `pauseAfterLoadMs` settings. Enhanced Chrome flags for CI environment stability.
