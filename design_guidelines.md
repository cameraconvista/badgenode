# BadgeNode PWA - Design Guidelines

## Design Approach: Custom Branded PWA

**Selected Approach**: Purpose-built time tracking interface with strong brand identity
**Justification**: Utility-focused PWA requiring distinctive branding, optimized for mobile-first interaction with numeric keypad as primary interface

## Core Design Elements

### A. Color Palette

**Primary Colors**:

- Violet Primary: `#510357` (270 97% 19%)
- Pink Accent: `#e774f0` (294 80% 70%)
- White Base: `#ffffff` (0 0% 100%)

**State Colors**:

- Entry (Entrata): `#1f8f40` (140 64% 34%) - Green
- Exit (Uscita): `#c8332b` (4 65% 48%) - Red
- Extra: `#fbbf24` (43 96% 56%) - Yellow

**Theme Implementation**:

- **Dark Mode** (default): Deep violet backgrounds with light text, pink accents for interactive elements
- **Light Mode**: White backgrounds with violet text, maintains pink accent system

### B. Typography

**Font Stack**: System fonts for optimal PWA performance

- Headers: `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
- Weight: 600-700 for headers, 400-500 for body
- Logo "BADGENODE": Bold, uppercase, prominent positioning
- PIN Display: Monospace or tabular nums for alignment
- Keypad: Large, clear numerals (text-2xl to text-4xl)

### C. Layout System

**Tailwind Spacing Units**: Use consistent spacing of 2, 4, 6, 8, 12, 16, 20 units

- Card padding: `p-6` to `p-8`
- Component spacing: `space-y-4` to `space-y-6`
- Keypad button gaps: `gap-3` to `gap-4`

**Container Strategy**:

- Mobile-first with max-width constraints
- Centered card layout with `max-w-md mx-auto`
- Full-height layout utilizing `min-h-screen`

### D. Component Library

**1. Header Component**:

- Logo/brand "BADGENODE" with violet background
- Minimal height, fixed positioning if needed
- Settings gear icon (⚙️) aligned to right

**2. PIN Display**:

- Disabled input field with placeholder "PIN"
- High contrast border in brand violet
- Centered, large text for visibility
- Subtle shadow or inset effect

**3. Numeric Keypad** (Primary Interface):

- 3x4 grid layout (1-9, C, 0, ⚙️)
- Large touch targets (minimum 64px)
- Clear visual feedback on press (scale/color shift)
- Pink accent on active/hover states
- Rounded corners matching brand style
- Clear (C) button in distinct position
- Settings gear (⚙️) icon button

**4. Date/Time Display**:

- Live updating (1-second intervals)
- Italian format: "gg/mm/aaaa HH:MM:SS"
- Positioned at bottom of main card
- Subtle, non-distracting presentation

**5. Feedback Banner**:

- Top-positioned notification strip
- Green background for success (entry confirmation)
- Red background for errors (exit confirmation)
- White text with icon indicators
- Slide-in animation from top
- Auto-dismiss or manual close

**6. Action Buttons** (Future):

- ENTRATA: Green (#1f8f40) with white text
- USCITA: Red (#c8332b) with white text
- Full-width or side-by-side layout
- Prominent, primary button styling

### E. PWA-Specific Design Considerations

**Splash Screen**:

- Violet background (#510357)
- BadgeNode logo centered
- Minimal, fast-loading design

**App Icon**:

- Purple background with white/pink BadgeNode symbol
- Clear visibility at all sizes (192px, 512px)
- Rounded square with safe zone padding

**Standalone Display**:

- No browser chrome considerations
- Full viewport utilization
- Native app-like status bar integration

**Offline State**:

- Graceful degradation messaging
- Maintain UI accessibility
- Visual indicator of connection status

### F. Interaction Design

**Touch Interactions**:

- Minimum 44x44px touch targets
- Visual press states with scale transform
- Haptic feedback consideration (vibration API)
- Prevent accidental double-taps with debouncing

**Visual Feedback**:

- Immediate response to keypad presses
- Color shifts on active states (pink accent glow)
- Smooth transitions (150-200ms duration)
- Success/error states clearly differentiated

**Accessibility**:

- High contrast ratios (WCAG AA minimum)
- Focus indicators for keyboard navigation
- ARIA labels for icon-only buttons
- Screen reader announcements for PIN entry

### G. Visual Style

**Cards & Containers**:

- Soft shadows for depth (`shadow-lg` to `shadow-xl`)
- Rounded corners (`rounded-2xl` for main card)
- Background blur effects for modals if needed

**Border Treatment**:

- 2px borders for inputs and primary elements
- 1px borders for secondary elements
- Violet borders with pink accents on focus

**Spacing Philosophy**:

- Generous whitespace around primary keypad
- Compact header to maximize keypad area
- Balanced vertical rhythm

## Mobile-First Considerations

- **Portrait Orientation**: Primary design target
- **Safe Areas**: Account for notches and home indicators
- **One-Handed Use**: Keypad positioned for thumb reach
- **Viewport**: Optimize for 375px-428px width range
- **Performance**: Minimal animations, optimized for lower-end devices

## Images

**No hero images required** - this is a utility interface focused on keypad interaction. The design prioritizes functional clarity over decorative imagery.

**Future Consideration**: Company logo or branding element in header only.
