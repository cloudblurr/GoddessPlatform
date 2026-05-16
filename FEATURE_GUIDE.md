# Feature Guide: Content Preview & Demo Mode

## 🎯 Quick Start Guide

### For Creators: Using Content Preview

#### Step 1: Navigate to Studio
```
/creator → Click "Create Post" → Opens Studio Composer
```

#### Step 2: Fill Out Content Form
- **Content Type**: Choose from Feed Post, Store Item, Unlockable, Poll, Announcement, or Livestream
- **Delivery Target**: FanFront (subscriber-facing) or Vault Only (stored/scheduled)
- **Title**: Your content title
- **Mood**: Exclusive, BTS, Personal, PPV, Drop, or Live
- **Description**: Content description
- **Access**: Subscription, PPV, or One-time
- **Price**: Set price (auto-updates based on content type)
- **Schedule**: Optional datetime for future release
- **Poll Options**: For poll posts (one per line)

#### Step 3: Watch Live Preview
As you type, the preview updates in real-time showing:
- ✅ Exact title and description
- ✅ Mood tag and pricing
- ✅ Media preview (if attached)
- ✅ Poll options (if poll type)
- ✅ Access level indicator

#### Step 4: Toggle Device Views
Click device icons to see how content appears on:
- 🖥️ **Desktop**: Full-width layout
- 📱 **Tablet**: Medium-width layout
- 📱 **Mobile**: Compact layout

#### Step 5: Switch View Modes
Toggle between:
- **Feed View**: How it appears in subscriber timeline
- **Store View**: How it appears in vault/store

#### Step 6: Publish
When satisfied with preview, click "Publish from Studio"

---

## 🎭 For Demos: Using Demo Mode

### Step 1: Access Demo Mode
```
/creator → Click "Demo Mode" in Quick Actions
```

### Step 2: Explore Platform Dashboard
View platform-wide statistics:
- **Total Subscribers**: Across all demo creators
- **Total Posts**: All published content
- **Active Creators**: Number of demo instances
- **Real Data Flow**: 100% authentic data

### Step 3: Browse Creator Instances
5 unique creators to explore:

#### 1. Goddess Annalesse
- **Style**: Luxury lifestyle & exclusive content
- **Price**: $19.99/month
- **Subscribers**: 12,847
- **Posts**: 342

#### 2. Starlight Dreams
- **Style**: Cosmic vibes and celestial content
- **Price**: $14.99/month
- **Subscribers**: 8,234
- **Posts**: 189

#### 3. Lavender Luxe
- **Style**: Soft aesthetics, premium content
- **Price**: $24.99/month
- **Subscribers**: 15,632
- **Posts**: 456

#### 4. Glory Reign
- **Style**: Empowerment through content
- **Price**: $17.99/month
- **Subscribers**: 9,876
- **Posts**: 278

#### 5. Bossy Babe
- **Style**: Boss moves only, exclusive BTS
- **Price**: $21.99/month
- **Subscribers**: 11,234
- **Posts**: 312

### Step 4: View Creator Feed
Click "View Feed" on any creator to see:
- ✅ Profile header with avatar and banner
- ✅ Bio and subscriber count
- ✅ Feed posts with media
- ✅ Polls with interactive options
- ✅ PPV content with pricing
- ✅ Engagement metrics (likes, comments)

### Step 5: View Creator Store
Click "View Store" on any creator to see:
- ✅ Premium content grid
- ✅ Vault items with previews
- ✅ Pricing and unlock buttons
- ✅ View and purchase stats
- ✅ Content type indicators

---

## 📊 Content Types Explained

### Feed Post
- **Purpose**: Standard subscriber timeline content
- **Access**: Subscription (included) or PPV
- **Delivery**: FanFront
- **Example**: "Morning Routine Reveal"

### Store Item
- **Purpose**: One-time purchasable drop
- **Access**: One-time purchase
- **Delivery**: FanFront or Vault-only
- **Example**: "Platinum Collection Vol. 1"

### Unlockable Post
- **Purpose**: PPV gated vault content
- **Access**: Pay-per-view
- **Delivery**: FanFront or Vault-only
- **Example**: "Midnight Secrets"

### Poll
- **Purpose**: Interactive voting post
- **Access**: Subscription only
- **Delivery**: FanFront
- **Example**: "Weekend Plans Poll"

### Announcement
- **Purpose**: Pinned-style update
- **Access**: Subscription only
- **Delivery**: FanFront
- **Example**: "New Content Schedule"

### Livestream
- **Purpose**: Live room entry + replay card
- **Access**: Subscription only
- **Delivery**: FanFront
- **Example**: "Q&A Session Tonight"

---

## 🔄 Data Flow Visualization

```
┌─────────────────────────────────────────────────────────────┐
│                     CREATOR PLATFORM                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Upload Media   │
                    │  to Cloudreve   │
                    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Select File &  │
                    │ Generate Share  │
                    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Fill Metadata  │
                    │  & Preview      │
                    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │    Publish      │
                    │  (Server Action)│
                    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Update Store   │
                    │  (writeStore)   │
                    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   Revalidate    │
                    │     Pages       │
                    └─────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        FANFRONT                             │
│  - Feed (/app)                                              │
│  - Store (/app/store)                                       │
│  - Gallery (/app/gallery)                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 UI Components

### ContentPreview Component
```typescript
// Real-time preview with device toggles
<ContentPreview
  title="Morning Routine"
  description="Starting the day right..."
  mood="Personal"
  access="subscription"
  mediaUrl="https://..."
  mediaType="video"
  contentKind="feed"
/>
```

**Features**:
- Device selector (desktop/tablet/mobile)
- View mode toggle (feed/store)
- Real-time updates
- Accurate rendering
- Responsive container

### Demo Creator Card
```typescript
// Creator instance showcase
<CreatorCard
  name="Goddess Annalesse"
  handle="@goddessanna"
  avatar="/anna2.jpg"
  banner="/xanamain.jpg"
  subscriberCount={12847}
  postCount={342}
  monthlyPrice={19.99}
/>
```

**Features**:
- Profile header with stats
- Content preview grid
- Action buttons (View Feed, View Store)
- Hover effects
- Responsive layout

---

## 🔐 Access Control

### Subscription Content
- **Who Sees**: All active subscribers
- **Example**: Daily feed posts, polls, announcements
- **Price**: Included in subscription

### PPV Content
- **Who Sees**: Only users who unlocked it
- **Example**: Exclusive videos, special photo sets
- **Price**: One-time unlock fee

### One-time Purchase
- **Who Sees**: Only users who purchased it
- **Example**: Content bundles, premium collections
- **Price**: One-time purchase

### Scheduled Content
- **Who Sees**: Nobody until scheduled date
- **Example**: Future releases, timed drops
- **Price**: Varies

### Vault-only Content
- **Who Sees**: Nobody (creator storage only)
- **Example**: Drafts, archived content
- **Price**: N/A

---

## 📱 Responsive Design

### Desktop (1024px+)
- Full-width layouts
- Multi-column grids
- Expanded previews
- Side-by-side comparisons

### Tablet (768px - 1023px)
- Medium-width layouts
- 2-column grids
- Compact previews
- Stacked sections

### Mobile (< 768px)
- Single-column layouts
- Full-width cards
- Minimal previews
- Vertical stacking

---

## 🚀 Performance

### Optimizations
- ✅ Static generation where possible
- ✅ Dynamic rendering for user-specific content
- ✅ Image optimization with Next.js Image
- ✅ Lazy loading for media
- ✅ Efficient state management

### Build Stats
```
Route (app)                    Size
├ ○ /demo                      Static
├ ƒ /demo/[creatorId]/feed     Dynamic
├ ƒ /demo/[creatorId]/store    Dynamic
├ ƒ /creator/studio            Dynamic
└ ƒ /app                       Dynamic
```

---

## 🎯 Best Practices

### For Creators
1. **Preview Before Publishing**: Always check preview on all devices
2. **Use Descriptive Titles**: Clear, engaging titles perform better
3. **Set Appropriate Pricing**: Match value to content quality
4. **Schedule Strategically**: Time releases for maximum engagement
5. **Test Poll Options**: Ensure options are clear and distinct

### For Demos
1. **Show Variety**: Explore different creator types
2. **Highlight Features**: Point out unique platform capabilities
3. **Explain Data Flow**: Emphasize real, not mock data
4. **Test Responsiveness**: Show mobile and desktop views
5. **Demonstrate Publishing**: Walk through creator workflow

---

## 📚 Additional Resources

### Documentation
- `CONTENT_PREVIEW_AND_DEMO_MODE.md` - Full technical documentation
- `IMPLEMENTATION_SUMMARY.md` - Implementation details
- `FEATURE_GUIDE.md` - This guide

### Code References
- `src/components/creator/ContentPreview.tsx` - Preview component
- `src/lib/demo-mode.ts` - Demo mode logic
- `src/app/creator/studio/StudioComposer.tsx` - Studio with preview
- `src/app/demo/page.tsx` - Demo dashboard

---

## 🎉 Summary

### What's New
✅ **Live Content Preview** - See before you publish
✅ **Demo Mode** - 5 realistic creator instances
✅ **Real Data Flow** - No placeholders or mock data
✅ **Device Toggles** - Test responsive layouts
✅ **Professional UI** - Polished, production-ready

### What's Improved
✅ **Studio Composer** - Controlled inputs, real-time preview
✅ **Creator Dashboard** - Demo mode quick action
✅ **Type Safety** - Full TypeScript support
✅ **Documentation** - Comprehensive guides

### What's Next
🔮 **Save Drafts** - Preview and save for later
🔮 **Share Previews** - Send preview links to team
🔮 **A/B Testing** - Test different presentations
🔮 **Analytics Preview** - Estimated engagement
🔮 **Accessibility** - Preview with screen readers

---

**Ready to explore? Start with `/creator/studio` for content preview or `/demo` for demo mode!**
