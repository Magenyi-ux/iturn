# ATELIER AI: Technical & Functional Audit Report
**Date:** May 22, 2025
**Status:** Comprehensive Feature Save (Pre-Merge Audit)

---

## 1. Project Overview
Atelier AI is a professional, high-fidelity digital tailoring suite. It combines AI-powered body measurement prediction, generative fashion design, and a comprehensive workshop management system into a single, unified interface. The app is built with a "Modern Luxury" aesthetic, focusing on minimalism, premium typography (Playfair Display/Inter), and a stone-based color palette.

---

## 2. Technical Architecture
### Core Stack
- **Frontend:** React (TypeScript) + Vite
- **Styling:** Tailwind CSS (Utility-first, responsive)
- **State Management:** Centralized `AppState` in `App.tsx` using React `useState`.
- **Database/Auth:**
  - **Supabase:** Primary cloud backend for auth and state persistence.
  - **LocalStorage:** Fallback guest mode for local-only data storage.
- **AI Engine:** Google Gemini (Generative AI) via `@google/genai` SDK.
  - **Models used:** `gemini-1.5-flash` (Speed/Multi-modal), `gemini-1.5-pro` (High-fidelity generation).

### Persistence Strategy
State is automatically synchronized to the backend/local storage whenever the `state` object changes.
- **Table:** `user_state`
- **Schema:** `id (UUID)`, `state (JSONB)`

---

## 3. Feature Inventory & Logic Maps

### A. Client Management
- **Client Vault (`ClientVault.tsx`):**
  - **Logic:** Displays a grid of client profiles. Allows selecting a client to view their historical timeline.
  - **Features:** Summary of stature (height), waistline, and commission count.
- **Aesthetic Evolution (`StyleTimeline.tsx`):**
  - **Logic:** A vertical chronological list of every order and style concept associated with a specific client.
  - **Features:** High-resolution design previews and tag-based style tracking.

### B. Biometric Intake (The "New Fitting" Flow)
- **Anatomic Capture (`PhotoUpload.tsx`):**
  - **Logic:** Requires three specific photos: Front Silhouette, Side Profile, and Dorsal View.
  - **Integration:** Uses a native file picker; supports multi-step verification before initializing analysis.
- **Manual Measurement Entry (`MeasurementForm.tsx`):**
  - **Logic:** Provides manual overrides for AI-predicted measurements.
  - **Conversion:** Real-time unit toggle between Metric (cm) and Imperial (in).
  - **AI Direction:** Allows users to input "Inspiration Notes" to guide the subsequent design generation.

### C. Creative Engine
- **Inspiration Hub (`InspirationHub.tsx`):**
  - **Logic:** AI-powered market research tool. Uses Gemini to search trends and generate mood boards.
  - **Features:** Masonry-style mood gallery, "Aesthetic Synthesis" summaries, and bookmarking to the studio archive.
- **Design Collection (`StyleCatalog.tsx`):**
  - **Logic:** Displays 30 AI-curated visionary designs.
  - **Interactive 360:** Uses "Design DNA" profiling to generate and stabilize multi-view visualizations (Front, Quarter, Side, Back).
  - **Features:** Perspective rotation (drag to rotate), technical instruction expansion, and one-click commission to the workroom.
- **Iterative Sketchpad (`Sketchpad.tsx`):**
  - **Logic:** A design refinement suite where users can draw directly over AI images and provide text directives for iterative updates.
  - **Iteration Tracking:** Keeps history of refinement stages.

### D. Production Pipeline
- **Studio Workroom (`Workroom.tsx`):**
  - **Logic:** A Kanban-style pipeline tracking orders through five stages: `Design`, `Cutting`, `Basting`, `Finishing`, `Delivered`.
  - **Mobile UX:** Snap-scrolling columns for easy mobile navigation.
- **Blueprint Room (`BlueprintRoom.tsx`):**
  - **Logic:** Converts style concepts and client biometrics into detailed technical patterns.
  - **Output:** AI-generated cutting coordinates, seam allowances, and assembly guides.
- **Pricing & Quoting (`PricingModal.tsx`):**
  - **Logic:** Multi-factor cost calculation including labor, materials from inventory, and custom line items.

### E. Operations & Admin
- **Database Management (`AdminDashboard.tsx`):**
  - **Logic:** Inventory tracking for materials/tools.
  - **Camera Integration:** Built-in camera capture to photograph physical fabric swatches/hardware for the digital database.
- **Atelier Analytics (`Analytics.tsx`):**
  - **Logic:** Aggregates order data to report on Total Yield (Revenue), Workroom Load, and Efficiency.
  - **Visualization:** Category distribution bars for studio specialization analysis.

### F. User Services
- **Executive Profile (`Profile.tsx`):**
  - **Logic:** Central hub for user ID, email, and holistic activity statistics.
- **Storage Paywall (Error x402):**
  - **Constraint:** Cloud storage is limited to 1GB by default.
  - **Logic:** Triggers a specific paywall modal priced at 200 NGN / 1GB expansion.
  - **Status:** Currently in Sandbox mode (directed to no-op).

---

## 4. UI/UX Specifications
- **Design Language:** Modern Luxury / Digital Atelier.
- **Navigation Architecture:**
  - **Desktop:** Left-aligned executive sidebar with active state translations.
  - **Mobile:** Fixed top branding header + Bottom navigation dock for core operations.
- **Responsive Patterns:**
  - Standardized `rounded-[3rem]` and `rounded-[4rem]` containers.
  - Grid transitions: 1 col (mobile) -> 2 col (tablet) -> 3+ col (desktop).
  - Light mode background (`#faf9f6`) with high-contrast stone typography.

---

## 5. File Structure Map
```text
/
├── App.tsx             # Root state and navigation
├── types.ts            # Global interface definitions
├── components/         # Modular UI features (16 components)
├── services/           # External integrations
│   ├── gemini.ts       # AI prompt engineering & SDK calls
│   ├── db.ts           # State persistence (Supabase/Local)
│   └── supabase.ts     # Client initialization
└── globals.d.ts        # Global type augmentations
```
