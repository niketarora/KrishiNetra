# KrishiNetra Marketplace --- UI & Implementation Plan

## 1. Objective

Add a **Marketplace** to the existing KrishiNetra website where farmers
can:

-   Check current crop/mandi prices.
-   Compare market prices and KrishiNetra reference-price ranges.
-   Explore crops they want to sell.
-   Eventually publish crop listings for buyers.
-   Buy agricultural raw materials and farm inputs such as seeds,
    fertilizers, irrigation supplies, tools and equipment.

The Marketplace must feel like a native KrishiNetra feature, **not a
generic e-commerce website**.

Core concept:

> **KrishiNetra connects field intelligence, farmer advisory and market
> decisions in one platform.**

------------------------------------------------------------------------

## 2. Website / Existing Design Basis

Requested website:

**https://krishi-netra-ten.vercel.app/**

The deployed URL was checked before preparing this specification. Its
raw page currently requires JavaScript to render the application, so the
complete rendered DOM cannot be inspected directly from the web crawler.
Therefore, the Marketplace design follows the established KrishiNetra
visual system and project context rather than inventing a separate
design language.

Preserve the existing:

-   Dark navy background.
-   Emerald-green primary accent.
-   Rounded dashboard cards.
-   Clean, professional agricultural-tech appearance.
-   GIS/satellite visual identity.
-   Minimal and farmer-friendly information hierarchy.
-   Existing navigation, spacing, typography and component conventions
    wherever already present.

------------------------------------------------------------------------

# 3. Navigation --- Required Change

Add **Marketplace immediately beside the existing GIS Map option** in
the main navigation.

Recommended:

``` text
Dashboard   Fields   GIS Map   [ Marketplace ]   Analytics
```

If the current navbar has a different order, preserve it and insert
Marketplace directly beside GIS Map.

### Marketplace Button

The Marketplace button must be visually prominent.

Use a **solid KrishiNetra emerald**:

``` text
background: #34D399
text:       #0C1324
```

Hover:

``` text
background: #5AF0B3
```

Use the same border radius and typography system as the existing navbar.

Do **not** use:

-   gradients,
-   blue,
-   orange,
-   red,
-   glass-only styling,
-   unrelated e-commerce colors.

Suggested icon: `ShoppingBag` or `Store`, using the icon library already
present in the project.

------------------------------------------------------------------------

# 4. Visual Design System

Use the existing KrishiNetra palette.

``` text
Base / Background       #0C1324
Surface                 #191F31
Surface High            #23293C
Primary Emerald         #34D399
Bright Emerald          #5AF0B3
Main Text               #DCE1FB
Secondary Text          #BBCAC0
Outline                 #85948B
Border                  #1E293B
```

Use the exact project design tokens if they already exist instead of
duplicating values.

### Typography

**Sora** - Marketplace title - Major headings - Important price values

**Inter** - Body - Buttons - Filters - Product descriptions - Navigation

**JetBrains Mono** - Market timestamps - Data labels -
Technical/freshness indicators

------------------------------------------------------------------------

# 5. Marketplace Page Structure

``` text
Marketplace
│
├── Hero / Header
├── Market Price Snapshot
├── Sell Crops / Buy Farm Inputs toggle
├── Search
├── Filters
├── Crop Market Cards
├── Mandi Comparison
├── Price Trend
├── Farm Input Categories
└── Product Cards
```

The first version should prioritize **market intelligence** rather than
looking like a shopping portal.

------------------------------------------------------------------------

# 6. Marketplace Hero

Suggested:

``` text
Marketplace

Sell smarter. Buy better.

Check crop prices, compare market conditions,
and find agricultural inputs in one place.
```

Keep it compact. Do not create a huge marketing banner.

Optional subtle background elements:

-   satellite/grid pattern,
-   field contour lines,
-   agricultural texture,
-   small market-data visualization.

Avoid large generic stock photos.

------------------------------------------------------------------------

# 7. Main Marketplace Modes

Use two primary tabs:

``` text
[ Sell Crops ]     [ Buy Farm Inputs ]
```

Default to:

**Sell Crops**

because crop-price intelligence is central to the KrishiNetra project.

Active tab:

``` text
emerald background / border
```

Inactive tab:

``` text
dark surface + subtle border
```

------------------------------------------------------------------------

# 8. Sell Crops

The Sell section should answer:

> **What can I sell and what price should I expect?**

Include:

-   Crop search.
-   Crop category.
-   Current mandi price.
-   Minimum / maximum price.
-   Modal price.
-   KrishiNetra reference range.
-   Price trend.
-   Nearby mandis.
-   Data freshness.
-   Optional farmer-specific reference.

------------------------------------------------------------------------

# 9. Market Snapshot

Show a compact row of price cards:

``` text
Market Snapshot

┌────────────┐ ┌────────────┐ ┌────────────┐
│ Wheat      │ │ Rice       │ │ Onion      │
│ ₹2,580/q   │ │ ₹2,340/q   │ │ ₹1,920/q   │
│ ↑ 4.2%     │ │ → 0.8%     │ │ ↓ 2.1%     │
└────────────┘ └────────────┘ └────────────┘
```

Actual prices must come from the real market-data backend.

**Never hard-code fake live prices.**

------------------------------------------------------------------------

# 10. Price Terminology

Clearly distinguish:

### Current Mandi Price

Price reported by the selected mandi/data source.

### Market Reference

KrishiNetra's estimated/reference range.

### Farmer Offer

Actual price offered by a buyer/trader.

Never label the KrishiNetra estimate:

-   Correct Price
-   Guaranteed Price
-   Government Price

Use:

-   Market Reference
-   Estimated Reference
-   KrishiNetra Price Checkpoint

------------------------------------------------------------------------

# 11. Crop Price Card

Example:

``` text
┌──────────────────────────────────┐
│ 🌾 Wheat                         │
│                                  │
│ Current Mandi                    │
│ ₹2,490 / quintal                 │
│                                  │
│ KrishiNetra Reference            │
│ ₹2,580 – ₹2,720                  │
│                                  │
│ ↑ Market trend +4.2%             │
│                                  │
│ [ View Market ] [ Sell Crop ]    │
└──────────────────────────────────┘
```

The reference range must be clearly distinguished from the
official/current mandi price.

------------------------------------------------------------------------

# 12. Search

Sell mode:

``` text
Search crop or mandi...
```

Buy mode:

``` text
Search seeds, fertilizers, tools...
```

A unified search can later support:

-   crops,
-   mandis,
-   products,
-   categories.

Use debounced search and server-side filtering where appropriate.

------------------------------------------------------------------------

# 13. Filters

Desktop:

``` text
[ Crop ▼ ] [ State ▼ ] [ District ▼ ] [ Mandi ▼ ] [ Date ▼ ]
```

Mobile:

``` text
[ Filters ]
```

Open a bottom sheet containing:

-   Crop
-   State
-   District
-   Mandi
-   Price range
-   Date
-   Trend

Use the project's existing filter component style.

------------------------------------------------------------------------

# 14. Mandi Comparison

Provide:

``` text
Nearby Mandis

Mandi             Modal Price
───────────────────────────────
Mandi A            ₹2,580
Mandi B            ₹2,520
Mandi C            ₹2,470
Mandi D            ₹2,610
```

Optional:

-   distance,
-   arrivals,
-   price trend.

This is intended to help farmers understand available market
opportunities.

------------------------------------------------------------------------

# 15. Price Trend

Use a compact line chart consistent with the existing chart library.

``` text
₹
│             ╭───╮
│       ╭─────╯   ╰──
│  ╭────╯
│──╯
└────────────────────
  7D   30D   90D
```

Do not introduce a new chart library if one already exists in the
website.

------------------------------------------------------------------------

# 16. Data Freshness

Every market price should display its update time.

Examples:

``` text
Updated 18 min ago
```

or:

``` text
Market data: 13 Aug 2026, 4:20 PM
```

For stale information:

``` text
Last updated 2 days ago
```

Never present historical/cached information as live.

------------------------------------------------------------------------

# 17. Farmer Crop Selling Flow

When the farmer selects:

``` text
Sell Crop
```

open a form:

``` text
1. Select crop
2. Quantity
3. Quality / grade
4. Location
5. Market reference
6. Asking price
7. Publish listing
```

Example:

``` text
Wheat
Quantity: 25 quintal
Quality: Grade A
Location: Jaipur

Market Reference
₹2,580 – ₹2,720 / q

Your Asking Price
₹2,680 / q

[ Publish Listing ]
```

Only implement real publishing if the backend supports it.

------------------------------------------------------------------------

# 18. Buy Farm Inputs

Categories can include:

``` text
🌱 Seeds
🧪 Fertilizers
🌿 Crop Protection
💧 Irrigation
🔧 Tools
🚜 Equipment
```

Only make categories active when real catalog data exists.

------------------------------------------------------------------------

# 19. Product Cards

Example:

``` text
┌──────────────────────────────┐
│       [Product Image]        │
│                              │
│ Example Seed                 │
│ 1 kg                         │
│                              │
│ ₹480                         │
│ ★ 4.6                        │
│                              │
│ [ Add to Cart ]              │
└──────────────────────────────┘
```

Use real product data when connected.

Do not invent availability, seller verification or reviews.

------------------------------------------------------------------------

# 20. Product Detail

Product detail should contain:

-   image,
-   name,
-   seller/brand,
-   price,
-   pack size,
-   availability,
-   delivery area,
-   description,
-   usage information,
-   seller information.

Primary:

``` text
[ Add to Cart ]
```

Secondary:

``` text
[ Buy Now ]
```

Payment/order functionality should only be enabled after the actual
transaction backend exists.

------------------------------------------------------------------------

# 21. Cart

Conceptual:

``` text
Cart

Seeds × 2             ₹800
Fertilizer × 1        ₹650

Subtotal             ₹1,450
Delivery                 ₹80
────────────────────────────
Total                ₹1,530

[ Proceed ]
```

Do not create fake checkout behavior.

------------------------------------------------------------------------

# 22. Desktop Layout

Recommended:

``` text
┌───────────────────────────────────────────────────────┐
│ Marketplace                                           │
│ Sell smarter. Buy better.                            │
│                                                       │
│ [ Sell Crops ] [ Buy Farm Inputs ]                   │
│                                                       │
│ [ Search crop / product / mandi... ]                 │
│                                                       │
│ Market Snapshot                                      │
│ [ Wheat ] [ Rice ] [ Onion ] [ Tomato ]              │
│                                                       │
│ Nearby Markets                                       │
│ [ Mandi table / cards ]                              │
│                                                       │
│ Popular Crops / Products                             │
│ [ Card ] [ Card ] [ Card ] [ Card ]                  │
└───────────────────────────────────────────────────────┘
```

------------------------------------------------------------------------

# 23. Mobile Layout

Use:

-   full-width cards,
-   horizontal category scrolling,
-   sticky search,
-   bottom-sheet filters,
-   two-column product cards where appropriate.

Do not force large desktop tables onto mobile.

Example:

``` text
┌──────────────────────┐
│ Marketplace       ☰  │
│                      │
│ Sell smarter...      │
│                      │
│ [ Sell ] [ Buy ]     │
│                      │
│ [ Search... ]        │
│                      │
│ Market Snapshot      │
│ [Wheat] [Rice] →     │
│                      │
│ [ Filters ]          │
│                      │
│ [ Product ] [Product]│
└──────────────────────┘
```

------------------------------------------------------------------------

# 24. Card Styling

Use the existing KrishiNetra card style:

``` text
background: #191F31
border: 1px solid #1E293B
border-radius: 16px–24px
```

Hover:

-   subtle emerald border,
-   slight upward movement,
-   no excessive shadow.

The Marketplace must remain visually consistent with the GIS/field
dashboard.

------------------------------------------------------------------------

# 25. Price Styling

Prices are the primary information.

Use:

``` text
Sora
font-weight: 700
```

Example:

``` text
₹2,580
/q
```

Supporting data should use smaller Inter text.

Use emerald for positive price trends.

Do not make every number bright green.

------------------------------------------------------------------------

# 26. Loading / Empty / Error States

### Loading

Use skeleton cards.

### No Market Data

``` text
Market data isn't available for this crop right now.

Try another crop or mandi.
```

### No Products

``` text
No farm inputs are available in this category yet.
```

### Error

``` text
Unable to load market prices.

[ Retry ]
```

Never show raw:

``` text
500 Internal Server Error
```

------------------------------------------------------------------------

# 27. GIS → Marketplace Integration

This is a high-value connection.

From the GIS/Field page:

``` text
Selected Field
      ↓
Detected Crop
      ↓
Expected Yield
      ↓
[ View Market Price ]
      ↓
Marketplace
```

The Marketplace should automatically preselect:

``` text
Crop = detected/selected crop
Location = field location
```

Example:

``` text
Your Field
Rice
Expected production: 8.2 tonnes

[ Check Rice Market Price → ]
```

------------------------------------------------------------------------

# 28. Marketplace → GIS Integration

From a crop market page:

``` text
Rice Market

[ See Your Rice Fields ]
```

This returns to GIS and filters the farmer's fields containing rice.

This creates a closed:

``` text
Field → Crop → Market → Decision
```

loop.

------------------------------------------------------------------------

# 29. Marketplace + Existing Price Engine

The Marketplace should eventually consume the existing KrishiNetra price
intelligence layer.

``` text
AGMARKNET / Official Market Data
            ↓
Current Mandi Price
            ↓
Historical Price
            ↓
Supply / Demand Signals
            ↓
KrishiNetra Price Engine
            ↓
Market Reference Range
            ↓
Marketplace
```

The Marketplace UI should **display** the price-engine output; it should
not independently calculate prices.

------------------------------------------------------------------------

# 30. Farmer-Specific Reference

If field intelligence is available:

``` text
Crop
Area
Health
Damage
Expected Yield
Location
```

the Marketplace can show:

``` text
Regional Market
₹2,300 – ₹2,450/q

Your Field Reference
₹2,380 – ₹2,510/q

Based on:
✓ Crop health
✓ Expected yield
✓ Location
✓ Market conditions
```

Only show this when the backend actually supports the calculation.

------------------------------------------------------------------------

# 31. Marketplace Dashboard Cards

Possible cards:

``` text
Market Today
3 crops trending up

Your Crops
2 registered crops

Nearby Markets
5 mandis

Your Listings
1 active listing

Cart
3 items
```

Only show real values.

------------------------------------------------------------------------

# 32. Marketplace + Voice AI

The existing voice assistant should eventually be able to query
Marketplace data.

Examples:

``` text
"Gehu ka aaj ka rate kya hai?"
```

→ Market-price tool

``` text
"Mere paas 20 quintal gehu hai, kya rate mil raha hai?"
```

→ Market-reference tool

``` text
"Beej chahiye."
```

→ Product search

``` text
"Drip irrigation ka saman dikhao."
```

→ Irrigation-input category

Flow:

``` text
Bhashini ASR
 ↓
LLM intent/tool selection
 ↓
Marketplace API
 ↓
Structured result
 ↓
LLM response
 ↓
Bhashini TTS
```

Use the same allowlisted tool architecture already planned for the Voice
AI.

------------------------------------------------------------------------

# 33. Suggested Frontend Routes

Adapt to the project's existing router:

``` text
/marketplace
/marketplace/sell
/marketplace/buy
/marketplace/crops/:cropId
/marketplace/products/:productId
/marketplace/cart
/marketplace/listings
```

------------------------------------------------------------------------

# 34. Suggested Backend APIs

Conceptual APIs:

``` text
GET  /api/market/crops
GET  /api/market/prices
GET  /api/market/mandis
GET  /api/market/trends

GET  /api/market/products
GET  /api/market/products/:id
GET  /api/market/categories

POST /api/market/listings
GET  /api/market/listings
GET  /api/market/listings/:id

GET  /api/market/cart
POST /api/market/cart
```

Use the project's existing API conventions if they differ.

Do not implement payment/order APIs until the actual marketplace
business workflow is defined.

------------------------------------------------------------------------

# 35. Data Sources

For crop prices:

``` text
AGMARKNET / official mandi data
```

Show source and freshness where appropriate:

``` text
Source: AGMARKNET
Updated: 13 Aug 2026
```

For products:

``` text
Supplier / Seller Catalog
```

Do not imply AGMARKNET provides product inventory.

------------------------------------------------------------------------

# 36. Core Data Models

### Crop Price

``` json
{
  "crop": "Wheat",
  "market": "Example Mandi",
  "location": "Example District",
  "min_price": 2400,
  "max_price": 2700,
  "modal_price": 2580,
  "unit": "quintal",
  "updated_at": "...",
  "source": "AGMARKNET"
}
```

### Product

``` json
{
  "id": "P001",
  "name": "Example Seed",
  "category": "Seeds",
  "seller": "Example Supplier",
  "price": 480,
  "unit": "1 kg",
  "availability": true
}
```

### Farmer Listing

``` json
{
  "id": "L001",
  "crop": "Wheat",
  "quantity": 25,
  "unit": "quintal",
  "quality": "Grade A",
  "asking_price": 2680,
  "status": "active"
}
```

Use only fields supported by the real backend.

------------------------------------------------------------------------

# 37. Business / Trust Rules

The Marketplace must never imply:

> KrishiNetra guarantees that the farmer will receive the displayed
> reference price.

Correct framing:

``` text
Market Data
+
KrishiNetra Estimation
=
Decision-support Reference
```

Final transaction price remains between buyer and seller.

Similarly, do not display:

-   fake seller ratings,
-   fake verification,
-   fake inventory,
-   fake product reviews,
-   fake market prices.

------------------------------------------------------------------------

# 38. Security

Protect:

-   farmer identity,
-   listings,
-   contact information,
-   cart,
-   orders,
-   transaction data.

Private farmer data must not be exposed through public APIs.

Authentication and authorization should follow the existing KrishiNetra
architecture.

------------------------------------------------------------------------

# 39. Performance

Use:

-   lazy-loaded product images,
-   pagination,
-   server-side filtering,
-   debounced search,
-   optimized images,
-   cached market data where appropriate.

Do not load the complete product catalog on initial page load.

------------------------------------------------------------------------

# 40. Animation

Keep motion subtle and consistent with the existing website:

``` text
Card hover:        150–200ms
Button hover:      ~150ms
Tab transition:    ~200ms
Bottom sheet:      250–300ms
```

Avoid excessive shopping-site animations.

------------------------------------------------------------------------

# 41. Accessibility

Implement:

-   keyboard navigation,
-   visible focus states,
-   accessible button labels,
-   readable contrast,
-   form labels,
-   touch-friendly controls,
-   screen-reader-friendly price information.

Use approximately 44px minimum interactive touch targets where
practical.

------------------------------------------------------------------------

# 42. MVP Implementation Scope

For the first version, **do not build a full Amazon-like marketplace**.

Implement:

### Navigation

``` text
[ Marketplace ]
```

### Marketplace

``` text
Marketplace
Sell smarter. Buy better.

[ Sell Crops ] [ Buy Farm Inputs ]

Search

Market Snapshot

Crop Cards

Nearby Mandi Prices
```

### Buy

``` text
Categories
Product Cards
```

### GIS Integration

``` text
GIS Map
 ↓
Selected Crop
 ↓
View Market Price
```

This is enough to demonstrate the feature strongly without creating fake
commerce functionality.

------------------------------------------------------------------------

# 43. Phase 2

Add:

-   farmer crop listings,
-   seller profiles,
-   product detail pages,
-   cart,
-   saved products,
-   price alerts,
-   nearby mandi comparison,
-   personalized price checkpoint.

------------------------------------------------------------------------

# 44. Phase 3

Only after the real business/backend workflow exists:

-   buyer marketplace,
-   orders,
-   payments,
-   delivery,
-   seller verification,
-   transaction tracking.

Do not build these as non-functional mock flows just for appearance.

------------------------------------------------------------------------

# 45. Dashboard Entry Point

Add a compact Market Watch card to the existing dashboard if space
allows:

``` text
Market Watch

Wheat
₹2,580/q
↑ 4.2%

Rice
₹2,340/q
→ 0.8%

[ Open Marketplace → ]
```

This gives farmers a second entry point without cluttering the navbar.

------------------------------------------------------------------------

# 46. Product Philosophy

The Marketplace should communicate:

``` text
DATA
 ↓
MARKET
 ↓
DECISION
```

not:

``` text
SHOPPING WEBSITE
```

The main purpose is to help the farmer make a better agricultural
decision.

------------------------------------------------------------------------

# 47. Final Navigation Specification

The requested navbar should visually become:

``` text
┌─────────────────────────────────────────────────────┐
│ KrishiNetra                                          │
│                                                     │
│ Dashboard   Fields   GIS Map   [ Marketplace ]      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

Marketplace:

``` text
background: #34D399
color: #0C1324
font-weight: 600
border-radius: existing navbar radius
```

Hover:

``` text
background: #5AF0B3
```

Active:

``` text
background: #34D399
subtle emerald glow
```

Use the exact existing navbar spacing rather than hard-coding a new
layout.

------------------------------------------------------------------------

# 48. Definition of Done --- UI

-   [ ] Marketplace added beside GIS Map.
-   [ ] Marketplace nav button uses solid KrishiNetra emerald.
-   [ ] Marketplace active state is obvious.
-   [ ] Marketplace uses the existing dark KrishiNetra theme.
-   [ ] Desktop layout is responsive.
-   [ ] Mobile layout is responsive.
-   [ ] Sell Crops tab exists.
-   [ ] Buy Farm Inputs tab exists.
-   [ ] Crop search exists.
-   [ ] Market filters exist.
-   [ ] Market price cards exist.
-   [ ] Mandi comparison exists.
-   [ ] Price trend exists.
-   [ ] Product categories exist.
-   [ ] Product cards exist.
-   [ ] Loading state exists.
-   [ ] Empty state exists.
-   [ ] Error state exists.
-   [ ] GIS → Marketplace CTA exists.
-   [ ] Marketplace → GIS connection is planned.
-   [ ] Voice integration points are defined.

------------------------------------------------------------------------

# 49. Definition of Done --- Data / Product

-   [ ] Market prices come from a real backend data source.
-   [ ] Price freshness is displayed.
-   [ ] Reference price is clearly labeled as an estimate.
-   [ ] No fake live prices.
-   [ ] Field context can preselect crop/location.
-   [ ] Product inventory comes from a real catalog when enabled.
-   [ ] Farmer listings are authenticated.
-   [ ] Private farmer information is protected.
-   [ ] Marketplace does not guarantee transaction prices.

------------------------------------------------------------------------

# 50. Final KrishiNetra Marketplace Concept

``` text
                FARMER
                   │
                   ▼
              REGISTER FIELD
                   │
                   ▼
             SATELLITE + GIS
                   │
                   ▼
         CROP / HEALTH / YIELD
                   │
                   ▼
              MARKETPLACE
             ↙           ↘
       SELL CROP       BUY INPUTS
           │                │
           ▼                ▼
     MARKET PRICE       FARM SUPPLIES
     REFERENCE
           │
           ▼
       BETTER FARMER
        DECISIONS
```

The final visual and product identity should be:

> **KrishiNetra + Market Intelligence**

rather than:

> **KrishiNetra + Generic E-commerce**

The Marketplace should extend the existing **field → intelligence →
decision** experience into the **field → market → selling/buying
decision** loop.
