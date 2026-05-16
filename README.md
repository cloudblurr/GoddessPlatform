# Goddess Annaleese Creator Platform

Official single-creator content platform built with Next.js App Router.

## 🎉 New Features

### Live Content Preview
- **Real-time preview** in Studio Composer showing exactly how content will appear to fans
- **Device toggles** for desktop, tablet, and mobile views
- **Dual view modes** for Feed and Store presentations
- **No guesswork** - see before you publish

### Demo Mode
- **5 realistic creator instances** with unique profiles and content
- **No placeholders** - all data follows real platform flows
- **Full feature showcase** - feeds, stores, polls, PPV content
- **Professional demos** ready for presentations

📖 **Documentation**: See `CONTENT_PREVIEW_AND_DEMO_MODE.md` and `FEATURE_GUIDE.md` for details.

## Core Experience

- Animated splash screen with dive-in logo and zoom-out transition.
- Creator entry portal with bio, niches, previews, and subscription pricing.
- Subscriber app with Daily Feed, Inbox, Gallery, and Store Drops.
- Ownership-aware unlocks for PPV and one-time purchases.
- Private creator portal with dashboard, analytics, storage, studio, and admin controls.
- **Live content preview** with device-specific views before publishing.
- **Demo mode** with multiple creator instances for platform showcase.

## Security Model

- Signed token cookie (HTTP-only, strict same-site, secure in production).
- Middleware route protection for `/app/*` and `/creator/*`.
- Server-side guards per route segment.
- Creator portal is accessible only with creator credentials.

## Setup

1. Copy `.env.example` to `.env.local`.
2. Set strong values for `AUTH_SECRET` and `CREATOR_PASSWORD`.
3. Install dependencies.
4. Start development server.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Routes

### Public
- `/` splash animation
- `/entry` creator entry + subscription and creator login

### Subscriber (requires subscription)
- `/app` subscriber home (Daily Feed)
- `/app/inbox`
- `/app/gallery`
- `/app/store`

### Creator (requires creator login)
- `/creator` dashboard with analytics
- `/creator/studio` content composer with **live preview**
- `/creator/storage` vault manager
- `/creator/appearance` entry page customization
- `/creator/admin` platform settings

### Demo Mode
- `/demo` platform showcase dashboard
- `/demo/[creatorId]/feed` individual creator feeds
- `/demo/[creatorId]/store` individual creator stores

## Key Features

### Content Preview
Navigate to `/creator/studio` to:
- ✅ See real-time preview as you type
- ✅ Toggle between desktop/tablet/mobile views
- ✅ Switch between feed and store presentations
- ✅ Preview polls, media, pricing, and access levels

### Demo Mode
Navigate to `/demo` to:
- ✅ Explore 5 unique creator instances
- ✅ View realistic feeds and stores
- ✅ See real data flow (no placeholders)
- ✅ Test all platform features

## Documentation

- `README.md` - This file (overview)
- `CONTENT_PREVIEW_AND_DEMO_MODE.md` - Technical documentation
- `IMPLEMENTATION_SUMMARY.md` - Implementation details
- `FEATURE_GUIDE.md` - User guide for new features
- `PHASE1_COMPLETE.md` - Phase 1 completion summary
- `SESSION_SUMMARY.md` - Development session notes
