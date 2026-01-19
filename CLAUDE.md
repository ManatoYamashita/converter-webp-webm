# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Converter WebP/WebM is a Next.js 16 App Router application for batch WebP (image) and WebM (video) conversion. Users upload images (JPG/JPEG/PNG/WEBP/AVIF/SVG/HEIC/HEIF/TIFF/BMP/GIF) and videos (MP4/MOV/MKV/AVI/WEBM/M4V) up to 25 files (max 20MB each), reorder them via drag-and-drop, and convert them to WebP/WebM format with sequential numbering. Single files download directly; multiple files are zipped server-side. Features a modern dark mode UI with component-based architecture and Toast notifications.

**Tech Stack:**
- Next.js 16.0.10 with App Router + TypeScript (strict mode)
- React 19.2.1 with hooks-based components
- Tailwind CSS for styling with dark mode support, `clsx` for conditional classes
- `sortablejs` for drag-and-drop reordering
- `sharp` for server-side WebP conversion (Node runtime, animated GIF support)
- `heic-convert` for HEIC/HEIF to JPEG conversion before WebP processing
- `ffmpeg-static` + `fluent-ffmpeg` for video to WebM conversion (VP9 + Opus)
- `jszip` for server-side ZIP generation
- `sonner` for Toast notification system

**Node.js Requirement:** 20.20+ (Next.js 16 requirement, specified in `package.json` engines)

## Development Commands

### Essential Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (Turbopack is built-in since Next.js 16, http://localhost:3000)
npm run build        # Production build (Next.js 16 with Turbopack)
npm run start        # Start production server
npm run lint         # Run ESLint (eslint .)
```

### Before Committing

Always run:

```bash
npm run lint         # Must pass with no errors
npm run build        # Must complete successfully
```

### Manual Testing Checklist

No automated tests exist. Before creating a PR, verify:

**File Conversion & Naming (v2.1.0+):**
- Single image (WebP) → Downloads as `{baseName}_1.webp`
- Single image (JPG format) → Downloads as `{baseName}_1.jpg`
- Single video (WebM) → Downloads as `{baseName}_1.webm`
- Single video (MP4 format) → Downloads as `{baseName}_1.mp4`
- Multiple images + reorder → ZIP contains `{baseName}_1.webp`, `{baseName}_2.webp`, etc. in UI order
- Multiple videos + mixed media → ZIP file order matches UI, names follow `{baseName}_{ordinal}.{mimeType}` format
- HEIC/HEIF conversion → Converts to WebP successfully as `{baseName}_1.webp`
- Animated GIF → Converts to animated WebP as `{baseName}_1.webp`
- Mixed images + videos (JPG format) → ZIP contains `{baseName}_1.jpg`, `{baseName}_2.mp4`, etc.
- Mixed files (3 images + 2 videos) → ZIP contains files with correct MIME type suffixes, order matches UI
- ZIP filename (mixed files) → `{baseName}_converted.zip`

**Quality & Format Selection:**
- Quality slider (70) → Lower quality, smaller file size
- Quality slider (100) → Higher quality, larger file size
- Format selector (WebP/WebM) → StickyConvertButton displays "Convert to WebP / WebM"
- Format selector (JPG/MP4) → StickyConvertButton displays "Convert to JPG / MP4"
- Converting state → StickyConvertButton displays "Converting" (regardless of format)

**Error Handling & UI:**
- Invalid file type (unsupported) → Toast error message displays
- File size exceeds 20MB → Toast error message displays
- Dark mode → All UI elements display correctly in dark theme
- Toast notifications → Success/error messages appear and auto-dismiss

## Architecture & Key Files

### App Router Structure (`app/`)

- **`app/page.tsx`** (616 lines): Main app logic and state management (`useState`, `useEffect`). Handles file upload, conversion orchestration, and progress tracking. Imports UI components from `components/` directory.
- **`app/layout.tsx`**: Root layout with metadata, `sonner` Toaster component, globals.css import, and dark mode enabled by default (`class="dark"`).
- **`app/globals.css`**: Tailwind directives, dark mode color scheme, custom scrollbar styles.
- **`app/api/convert/route.ts`**: WebP/WebM conversion API endpoint (Node runtime, maxDuration: 60s). Accepts `FormData` with `base_name`, `file_index`, and `files`. Returns single WebP/WebM or ZIP of multiple converted files. Uses `heic-convert` for HEIC/HEIF (converts to JPEG first), `sharp` for WebP conversion (quality 90, animated GIF support), and `ffmpeg` for video to WebM (VP9 + Opus).

### UI Components (`components/`)

**6 components extracted from `app/page.tsx` for better maintainability:**

- **`AppHeader.tsx`**: Header with app title and help button
- **`UploadDropzone.tsx`**: Drag-and-drop zone for file upload with visual feedback
- **`SelectedFiles.tsx`**: SortableJS-powered file list with reordering, thumbnails, and individual file removal
- **`ProgressPanel.tsx`**: Conversion progress display with file count and completion status
- **`StickyConvertButton.tsx`**: Fixed bottom convert button with disabled state during conversion
- **`FloatingUploader.tsx`**: Floating upload button that appears on scroll for quick access
- **`types.ts`**: Shared TypeScript types for file items and props

### Libraries (`lib/`)
- **`lib/sanitizeFilename.ts`**: Exports `sanitizeFilename()` (removes dangerous characters), `ALLOWED_EXTENSIONS` (18 formats including images and videos), `MAX_FILES` (25), and `MAX_FILE_SIZE_BYTES` (20MB). Used by both client and server.

### Configuration

- **`next.config.mjs`**: Enables `optimizePackageImports` for SortableJS. ESLint runs on `app`, `components`, `lib`.
- **`tsconfig.json`**: Strict TypeScript with `@/*` path alias pointing to root.
- **`tailwind.config.ts`**: Defines `brand` colors (blue) and `dark` mode colors (bg/text/border variants) with `darkMode: 'class'` enabled.
- **`types/ffmpeg-installer.d.ts`**: Type definitions for `@ffmpeg-installer/ffmpeg` package.

### Environment Variables

- **`.env`**: Local environment variables (gitignored). Created from `.env.example`.
- **`.env.local`**: Local overrides (gitignored, highest priority). Takes precedence over `.env`.
- **`.env.example`**: Template for environment variables. Committed to repository.

**Required Variables:**

```bash
# Production (default)
NEXT_PUBLIC_URL=https://2ewbp.manapuraza.com

# Development (see .env.example)
NEXT_PUBLIC_URL=http://localhost:3000
```

- **`NEXT_PUBLIC_URL`**: Base URL for the application. Used in metadata (`app/layout.tsx`) and OGP image URLs (`app/page.tsx`). Must include protocol (`https://` or `http://`). **Do NOT use double quotes** in `.env` files.

**Important Notes:**

- Next.js environment variable priority (highest to lowest): `.env.local` > `.env`
- `NEXT_PUBLIC_*` variables are exposed to the browser and embedded at build time
- Always use `process.env.NEXT_PUBLIC_URL` to access the URL in code
- Provide fallback values: `process.env.NEXT_PUBLIC_URL || "https://2ewbp.manapuraza.com"`
- Production URL: `https://2ewbp.manapuraza.com`
- Development URL: `http://localhost:3000` (defined in `.env.example`)

### Key Architectural Patterns
1. **Client-Server Separation**: Image and video conversion happens server-side (Node runtime required for `sharp`, `heic-convert`, and `ffmpeg`). Client handles file selection, reordering, progress tracking, and download triggering. ZIP generation happens server-side.
2. **Sequential Conversion**: Client sends files one-by-one to `/api/convert` with `file_index` to maintain order. Server validates extension, routes to appropriate converter (image/video), returns buffer.
3. **Multi-Format Support**:
   - **HEIC/HEIF**: Uses `heic-convert` to convert to JPEG before `sharp` WebP conversion (two-step process due to patent licensing)
   - **Images**: `sharp` converts to WebP (quality 90, animated GIF support via `animated: true`)
   - **Videos**: `ffmpeg` converts to WebM with VP9 video codec and Opus audio codec
4. **Component-Based UI**: `app/page.tsx` orchestrates state management, while presentational logic is split into 6 dedicated components in `components/` directory.
5. **Dark Mode UI**: Tailwind class-based dark mode with custom color palette. HTML element has `class="dark"` by default, enabling dark theme globally.
6. **Toast Notification System**: Uses `sonner` library for non-blocking, auto-dismissing success/error messages. Eliminates layout shift by using fixed positioning (top-right).
7. **Error Handling**: API returns JSON `{ error: "code" }` for validation failures. Client translates error codes to Toast notifications.

### Critical Constraints
- **MAX_FILES = 25**: Enforced in `lib/sanitizeFilename.ts`, validated server-side.
- **MAX_FILE_SIZE_BYTES = 20MB**: Individual file size limit enforced in `lib/sanitizeFilename.ts`.
- **maxDuration = 60s**: Serverless function timeout for video conversion (defined in `app/api/convert/route.ts`).
- **Node Runtime Required**: `export const runtime = "nodejs"` in API route. Edge Runtime does NOT support `sharp` or `ffmpeg`.
- **No Persistent Storage**: Files are processed in-memory and discarded after response.
- **Filename Sanitization**: Applied to `base_name` on both client and server to prevent directory traversal.

## Coding Standards

### TypeScript
- Strict mode enabled (`tsconfig.json`). All code must type-check.
- Use `@/*` imports (e.g., `@/lib/sanitizeFilename`) for cleaner paths.
- Avoid `any`; prefer `unknown` or specific types.

### React Components
- Function components with hooks only (no class components).
- Use `useEffect` for side effects, `async/await` for async operations.
- Keep state in `useState`; avoid global state unless necessary.

### API Routes
- Always specify `export const runtime = "nodejs"` for routes using `sharp`.
- Use Web standard `Response` for binary data (not Next.js-specific helpers).
- Return JSON errors with appropriate status codes (400/500).

### Styling
- Tailwind utility classes directly in JSX.
- Complex class logic uses `clsx` for readability.
- Theme colors: Use `brand-*` tokens from `tailwind.config.ts`.

### File Naming
- Components: PascalCase (e.g., `FileUploadCard.tsx`)
- Utilities: camelCase (e.g., `sanitizeFilename.ts`)
- API routes: lowercase (e.g., `convert/route.ts`)

## Common Development Tasks

### Modifying Conversion Logic (Image)
1. Edit `app/api/convert/route.ts` to adjust `sharp` options (quality, format, animated support, etc.).
2. Update `docs/specs/spec.md` if constraints change (e.g., quality level).
3. Run manual tests for single/multiple file conversions with various formats (HEIC, animated GIF, etc.).

### Modifying Conversion Logic (Video)
1. Edit `app/api/convert/route.ts` to adjust `ffmpeg` options (codec, bitrate, CRF, etc.).
2. Update `docs/specs/spec.md` if performance/quality constraints change.
3. Run manual tests for video conversion with various formats (MP4, MOV, MKV, etc.).
4. Monitor conversion time to ensure it stays within `maxDuration` (60s).

### Adding New File Type Support
1. Add extension to `ALLOWED_EXTENSIONS` in `lib/sanitizeFilename.ts`.
2. Verify `sharp` (images) or `ffmpeg` (videos) supports the format.
3. Update validation logic in `app/api/convert/route.ts` if needed (add to `VIDEO_EXTENSIONS` or `HEIC_EXTENSIONS` sets).
4. Update Manual Testing Checklist in `CLAUDE.md`.
5. Document change in `docs/specs/spec.md`.

### Adding New UI Components
1. Create new component file in `components/` with PascalCase naming.
2. Define TypeScript types/props interface at top of file.
3. Import into `app/page.tsx` or other parent component.
4. Use `@/components/*` import path.
5. Maintain state management (`useState`) in `app/page.tsx`, pass via props.
6. Document component purpose and props in `docs/dev/ui-components.md`.

### Modifying Toast Notifications
1. Edit `app/page.tsx` to update `toast.success()` or `toast.error()` calls.
2. For styling changes, edit Toaster config in `app/layout.tsx`.
3. Refer to `docs/dev/toast-system.md` for usage patterns.

## Deployment & Runtime

### Vercel Deployment
- Uses `npm run build` script (Next.js 16 with Turbopack).
- `sharp` and `ffmpeg-static` install native binaries automatically during Vercel build.
- API routes run on Node runtime (Serverless Functions, maxDuration: 60s for video conversion).
- No additional environment variables required.

### Local Production Testing
```bash
npm run build
npm run start
# Visit http://localhost:3000
```

### Known Issues

- **Video Conversion Timeout**: Large video files (>100MB) may exceed the 60s `maxDuration` limit on Vercel Serverless Functions. Consider pre-processing or using Vercel Edge Functions with streaming for larger files.
- **HEIC Memory Usage**: Converting multiple large HEIC files simultaneously may cause memory issues. The 20MB file size limit helps mitigate this.

## Documentation & Knowledge Base

### Documentation Strategy

**Note**: See `.claude/CLAUDE.md` for docs operation rules and PDCA workflow guidelines.

All project knowledge lives in `docs/` (single source of truth). When adding/updating knowledge:

1. Edit appropriate file in `docs/` (or create new file using `kebab-case.md`).
2. Update `docs/index.md` index with new links/changes.
3. Use `DOC:` commit prefix for documentation changes.

### Key Documents

- **`docs/index.md`**: Documentation hub and update rules.
- **`docs/specs/spec.md`**: Product requirements, system constraints, feature definitions.
- **`docs/dev/branch.md`**: Branch strategy, commit conventions, PR templates.
- **`AGENTS.md`**: Contributor guidelines (module organization, coding style, testing).
- **`README.md`**: User-facing setup and feature overview.

### When to Update Docs

- **Specs Change**: Update `docs/specs/spec.md`.
- **New Architecture Pattern**: Update `AGENTS.md` or create new doc in `docs/dev/`.
- **Branch/CI Flow Change**: Update `docs/dev/branch.md`.
- **New Knowledge Category**: Create new file, link in `docs/index.md`.

## Branch & Commit Workflow

### Git Remote Configuration

See `.claude/CLAUDE.md` for Git remote configuration details (origin vs legacy remotes).

See `docs/dev/branch.md` for detailed branch strategy and workflow.

### Branch Naming

```text
<type>/<short-description>
```

Types: `feat`, `fix`, `refactor`, `docs`, `chore`, `test`

Example: `feat/quality-slider`, `fix/zip-filename`, `docs/api-guide`

### Commit Message Format

```text
<type>: <summary>
```

Example: `feat: add image quality selector`, `fix: preserve EXIF orientation`

### Pull Request Requirements

- **Title**: Same format as commit (`<type>: <summary>`)
- **Description**: Include:
  - Bullet-point summary of changes
  - Manual test checklist (single file, multiple files, locale switch, error cases)
  - Screenshots/GIF for UI changes
  - Confirmed locales if translations updated
- **Before Merge**: Rebase on `main` (`git pull --ff-only origin main && git rebase main`)
- **After Merge**: Delete remote and local branches

## Tips for AI Agents

### Context Gathering

- **Start with**: `docs/index.md` → `docs/specs/spec.md` → `CLAUDE.md` (this file)
- **UI Logic**: Read `app/page.tsx` (state management) + `components/` (presentational components)
- **API Logic**: Read `app/api/convert/route.ts` (image/video conversion + validation)
- **Shared Utils**: Check `lib/sanitizeFilename.ts` (constraints, validation, allowed extensions)

### Common Pitfalls

- **Don't use Edge Runtime**: API route MUST use Node runtime for `sharp` and `ffmpeg`.
- **Don't skip sanitization**: Always sanitize `base_name` on client AND server.
- **Don't exceed MAX_FILES (25)**: Validate file count before upload and in API.
- **Don't exceed MAX_FILE_SIZE_BYTES (20MB)**: Validate individual file size.
- **Don't forget Toast notifications**: Use `sonner` Toast instead of inline error messages for better UX.
- **Don't modify `components/` without updating `app/page.tsx` props**: Maintain type safety across component boundaries.

### Making Changes

1. Read relevant files first (use `@/*` imports to find dependencies).
2. Check `docs/specs/spec.md` for constraints before modifying logic.
3. Run `npm run lint && npm run build` before committing.
4. Update `docs/` if architectural or constraint changes occurred.
5. Follow manual test checklist before creating PR (images, videos, Toast notifications, dark mode).

## Final Notes

- This project uses **stable releases** of Next.js 16.0.3 and React 19.2.0.
- **Node.js 20.9+** is recommended (Next.js 16 requirement). See `.nvmrc`.
- **No automated tests** exist. Manual testing is required for all changes.
- **All knowledge must be documented** in `docs/` per project conventions.
- **Component-based architecture**: UI is split into 6 components in `components/` directory.
