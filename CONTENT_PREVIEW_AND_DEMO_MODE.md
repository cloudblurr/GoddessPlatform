# Content Preview & Demo Mode

## Overview

This document describes the new **Content Preview** and **Demo Mode** features added to the Goddess Platform. These features eliminate all placeholder/mock data and ensure that everything published in the Creator Platform makes real updates to the FanFront.

## Features

### 1. Live Content Preview in Studio

The Studio Composer now includes a **real-time content preview** that shows exactly how content will appear to fans before publishing.

#### Key Features:
- **Real-time Updates**: Preview updates as you type in the form fields
- **Device-Specific Views**: Toggle between desktop, tablet, and mobile previews
- **Dual View Modes**: Switch between Feed view and Store view
- **Accurate Rendering**: Shows exactly what fans will see including:
  - Title, description, and mood
  - Media (video, audio, images)
  - Pricing and access levels
  - Poll options (for poll posts)
  - Locked/unlocked states

#### Location:
- **File**: `src/components/creator/ContentPreview.tsx`
- **Used in**: `src/app/creator/studio/StudioComposer.tsx`

#### How It Works:
1. Creator fills out the content form
2. Preview component receives form state via props
3. Preview renders in real-time as form changes
4. Device selector allows testing responsive layouts
5. View mode toggle shows feed vs store presentation

### 2. Demo Mode System

Demo Mode provides **multiple realistic creator instances** with full content flows, eliminating the need for placeholders or mock data.

#### Key Features:
- **5 Demo Creators**: Each with unique profiles, content, and pricing
- **Real Data Flow**: All content follows the same data flow as production
- **Full Platform Experience**: Feed posts, vault items, polls, and more
- **No Placeholders**: Every piece of content is real and functional

#### Demo Creators:
1. **Goddess Annalesse** - Luxury lifestyle & exclusive content
2. **Starlight Dreams** - Cosmic vibes and celestial content
3. **Lavender Luxe** - Soft aesthetics, premium content
4. **Glory Reign** - Empowerment through content
5. **Bossy Babe** - Boss moves only, exclusive BTS

#### Location:
- **Core Logic**: `src/lib/demo-mode.ts`
- **Dashboard**: `src/app/demo/page.tsx`
- **Creator Feeds**: `src/app/demo/[creatorId]/feed/page.tsx`
- **Creator Stores**: `src/app/demo/[creatorId]/store/page.tsx`

#### How to Access:
1. Navigate to Creator Dashboard (`/creator`)
2. Click "Demo Mode" in Quick Actions
3. Explore different creator instances
4. View their feeds and stores

### 3. Real Data Flow Architecture

All content published in the Creator Platform now follows a **real, traceable data flow** to the FanFront.

#### Publishing Flow:
```
Creator uploads media → Cloudreve Storage
     ↓
Creator selects file → Share URL generated
     ↓
Creator fills metadata → Form state tracked
     ↓
Creator previews → ContentPreview component
     ↓
Creator publishes → Server action (creatorStudioPublish)
     ↓
Store updated → writeStore() to JSON
     ↓
Pages revalidated → revalidatePath()
     ↓
Fans see content → readStore() on next load
```

#### Data Storage:
- **Primary Store**: File-based JSON (`os.tmpdir()/xana-store-v4.json`)
- **Structure**:
  ```typescript
  {
    feedPosts: StoredPost[],
    vaultItems: StoredVaultItem[],
    entrySettings: EntryPageSettings
  }
  ```
- **Operations**: `readStore()`, `writeStore()`
- **Location**: `src/lib/store.ts`

#### Content Visibility:
- **Subscription Content**: All subscribers see it
- **PPV Content**: Only if unlocked (in `session.ownedContent`)
- **One-time Purchases**: Only if purchased
- **Scheduled Content**: Hidden until `scheduledFor` date
- **Vault-only Content**: Never shown to fans

### 4. UI/UX Improvements

#### Studio Composer:
- ✅ Live preview with device toggles
- ✅ Real-time form state tracking
- ✅ Controlled inputs for all form fields
- ✅ Automatic price updates based on content type
- ✅ Poll options preview
- ✅ Media preview with FuturisticPlayer

#### Demo Mode:
- ✅ Platform statistics dashboard
- ✅ Creator instance cards with stats
- ✅ Content preview grids
- ✅ Responsive layouts
- ✅ Smooth transitions and hover effects

#### Creator Dashboard:
- ✅ Demo Mode quick action added
- ✅ Purple accent for demo features
- ✅ Clear visual distinction from production

## Technical Implementation

### ContentPreview Component

```typescript
<ContentPreview
  title={formTitle}
  description={formDescription}
  mood={formMood}
  access={effectiveAccess}
  priceCents={formPrice > 0 ? Math.round(formPrice * 100) : undefined}
  mediaUrl={selectedShareUrl}
  thumbnailUrl={selectedAsset?.thumbnailUrl}
  mediaType={selectedAsset ? selectedMediaType : "text"}
  contentKind={contentKind}
  pollOptions={pollOptions}
/>
```

### Demo Mode Functions

```typescript
// Get all demo creators
const creators = DEMO_CREATORS;

// Get specific creator
const creator = getDemoCreator(creatorId);

// Generate demo content
const feedPosts = generateDemoFeedPosts(creatorId);
const vaultItems = generateDemoVaultItems(creatorId);

// Check if demo mode is enabled
const isDemo = isDemoMode();
```

### Form State Management

```typescript
// Studio Composer now tracks form state
const [formTitle, setFormTitle] = useState("");
const [formDescription, setFormDescription] = useState("");
const [formMood, setFormMood] = useState<MoodTag>("Personal");
const [formPrice, setFormPrice] = useState(0);
const [formPollOptions, setFormPollOptions] = useState("");

// All inputs are controlled
<input 
  value={formTitle}
  onChange={(e) => setFormTitle(e.target.value)}
/>
```

## Benefits

### For Creators:
1. **See Before Publishing**: Preview exactly how content will appear
2. **Test Responsiveness**: Check mobile, tablet, and desktop views
3. **Reduce Errors**: Catch issues before publishing
4. **Faster Workflow**: No need to publish and check separately

### For Platform Demos:
1. **No Placeholders**: All content is real and functional
2. **Multiple Instances**: Show variety of creator types
3. **Full Feature Set**: Demonstrate all platform capabilities
4. **Professional Presentation**: Polished, production-ready demos

### For Development:
1. **Real Data Flow**: Test actual data paths
2. **Type Safety**: Full TypeScript support
3. **Maintainable**: Centralized demo data
4. **Extensible**: Easy to add more demo creators

## Future Enhancements

### Planned Features:
- [ ] Save draft previews
- [ ] Share preview links with team
- [ ] A/B testing different content presentations
- [ ] Analytics preview (estimated engagement)
- [ ] Accessibility preview mode
- [ ] SEO preview

### Demo Mode Enhancements:
- [ ] User-selectable demo mode toggle
- [ ] Demo mode analytics dashboard
- [ ] Export demo data for testing
- [ ] Custom demo creator builder
- [ ] Demo mode API for external integrations

## Files Modified/Created

### New Files:
- `src/lib/demo-mode.ts` - Demo mode core logic
- `src/components/creator/ContentPreview.tsx` - Live preview component
- `src/app/demo/page.tsx` - Demo mode dashboard
- `src/app/demo/[creatorId]/feed/page.tsx` - Demo creator feed
- `src/app/demo/[creatorId]/store/page.tsx` - Demo creator store
- `CONTENT_PREVIEW_AND_DEMO_MODE.md` - This documentation

### Modified Files:
- `src/app/creator/studio/StudioComposer.tsx` - Added live preview
- `src/app/creator/page.tsx` - Added demo mode link

## Testing

### Test Content Preview:
1. Navigate to `/creator/studio`
2. Fill out the content form
3. Observe real-time preview updates
4. Toggle device views (desktop/tablet/mobile)
5. Switch between feed and store views
6. Test with different content types (feed, store, poll, etc.)

### Test Demo Mode:
1. Navigate to `/demo`
2. Explore different creator instances
3. Click "View Feed" on any creator
4. Click "View Store" on any creator
5. Verify all content displays correctly
6. Check responsive layouts on different devices

### Test Data Flow:
1. Publish content from Studio
2. Verify it appears in FanFront (`/app`)
3. Check store items appear in `/app/store`
4. Verify scheduled content is hidden
5. Test vault-only content doesn't appear to fans

## Conclusion

The Content Preview and Demo Mode features provide a **professional, production-ready** experience for both creators and platform demonstrations. All placeholder data has been eliminated, and every action in the Creator Platform results in real, traceable updates to the FanFront.

The system is fully typed, maintainable, and extensible for future enhancements.
