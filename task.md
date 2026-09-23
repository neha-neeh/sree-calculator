# Implementation Task Plan: Smart Calculator

Based on `prd.md` v1.0 (Smart Calculator PRD)

---

## Technical Overview & Project Structure

To maintain clean separation of concerns and ensure maintainability (PRD Section 5), the project will follow a modular architecture:

```
/
├── index.html              # Core HTML structure & ARIA live regions
├── css/
│   └── styles.css          # Design system, CSS tokens (Light/Dark), responsive layout
├── js/
│   ├── engine.js           # Decoupled calculation engine (Parser/Evaluator/Validator)
│   ├── memory.js           # Memory state management (MC, MR, M+, M-)
│   ├── history.js          # History logging & localStorage persistence
│   ├── ui.js               # Display renderer, button bindings, theme toggle
│   ├── keyboard.js         # Keyboard event listener & shortcuts mapping
│   └── app.js              # Application bootstrapper & controller
├── tests/
│   └── engine.test.js      # Unit tests for calculation engine & edge cases
└── task.md                 # Implementation task plan
```

---

## Phase 1: Environment Setup, Architecture & Design Tokens

- [x] **Task 1.1: File Structure & HTML Skeleton**
  - Create standard directory layout (`css/`, `js/`, `tests/`).
  - Set up `index.html` with proper semantic HTML5 container tags (`<main>`, `<section>`, `<header>`, `<footer>`).
  - Add viewport meta tag for mobile responsiveness and baseline accessibility attributes (`lang="en"`).

- [x] **Task 1.2: Design Tokens & CSS Theme System (`css/styles.css`)**
  - Define CSS custom properties (variables) for Light and Dark modes:
    - Backgrounds, surface/card colors, text primary/secondary.
    - Neutral button states, operator accent colors, function colors, high-emphasis equals button color.
  - Implement system theme preference detection (`prefers-color-scheme`) and manual `.dark-theme` / `.light-theme` class overrides.
  - Ensure minimum contrast ratio ≥ 4.5:1 across both themes for all text elements.

- [x] **Task 1.3: Responsive Layout Frame**
  - Mobile-first responsive layout (centered calculator container, fluid scaling up to desktop/tablet).
  - Define 44x44px minimum touch targets for all interactive buttons.
  - Set up CSS Grid / Flexbox for the display area, indicator row, and button grid.

---

## Phase 2: Decoupled Calculation Engine (`js/engine.js`)

- [x] **Task 2.1: Mathematical Expression Parser & Evaluator**
  - Implement expression tokenizer supporting digits, decimal points, core operators (`+`, `-`, `*`, `/`), advanced operators (`%`, `√`, `^`), and parentheses `()`.
  - Implement operator precedence (parentheses > exponent `^` > multiply/divide/percent > add/subtract).
  - Implement sequential execution fallback for standard chained entries without parentheses.

- [x] **Task 2.2: Math Functionality Implementation**
  - Percent calculation (e.g., `50 * 10%` = `5`, `50 + 10%` = `55` or `10%` as `0.1` standalone).
  - Square Root (`√x` or `√(expr)`).
  - Power / Exponent (`x^y`).
  - Double-precision numeric rounding to prevent binary floating-point representation bugs (e.g., `0.1 + 0.2` = `0.3`).

- [x] **Task 2.3: Precision & Error Detection**
  - Detect division by zero → Return explicit error type `ERR_DIV_ZERO`.
  - Detect square root of negative numbers → Return explicit error type `ERR_NEG_SQRT`.
  - Detect malformed/unmatched expressions → Return `ERR_INVALID_SYNTAX`.
  - Detect numeric overflow (exceeding engine/display limits) → Return `ERR_OVERFLOW` or scientific notation formatting.

- [x] **Task 2.4: Unit Testing Framework & Engine Test Suite (`tests/engine.test.js`)**
  - Write test cases for:
    - Standard operations: addition, subtraction, multiplication, division.
    - Precedence: `2 + 3 * 4` = `14`, `(2 + 3) * 4` = `20`.
    - Advanced ops: `√16` = `4`, `2^3` = `8`, `50%` = `0.5`.
    - Edge cases & errors: `5 / 0`, `√(-9)`, `1.2.3`, `(5 + 2`.

---

## Phase 3: UI Component Layout & Theme Controller

- [x] **Task 3.1: Display Component (`js/ui.js`)**
  - Dual-line display: Top row for previous expression/secondary info, bottom row for main result.
  - Dynamic font scaling: Automatically reduce font size for long numbers/expressions to fit without truncation or clipping.
  - Decimal separator localization wrapper (abstracted for future locale expansion).

- [x] **Task 3.2: Button Grid & Key Categorization**
  - Construct button grid with distinct visual categories:
    - **Numbers**: Neutral background.
    - **Operators** (`+`, `-`, `*`, `/`, `^`, `%`, `√`, `()`): Accent color.
    - **Utility/Clear** (`C`, `AC`, `⌫`): Secondary emphasis.
    - **Memory Keys** (`MC`, `MR`, `M+`, `M-`): Utility group.
    - **Equals** (`=`): High-contrast CTA accent color.
  - Hover, active/pressed, focus, and disabled styling with smooth transitions.

- [x] **Task 3.3: Theme Switcher Component**
  - Implement theme toggle button (Sun/Moon icon).
  - Integrate `localStorage` persistence for theme choice (`theme: 'dark' | 'light' | 'system'`).
  - Auto-apply theme on application initialization.

---

## Phase 4: State Management, Memory Functions & Key Mappings

- [x] **Task 4.1: Calculator State Machine (`js/app.js`)**
  - Maintain active input buffer, result state, current expression tree, and error state.
  - Input validation: ignore multiple decimal points in a single numeric token, ignore operators on empty buffer (no-op).
  - Rapid repeated `=` execution: repeat last operation with last operand.

- [x] **Task 4.2: Memory Subsystem (`js/memory.js`)**
  - Store single memory value (defaults to `0`).
  - **MC**: Clear memory to `0`.
  - **MR**: Recall memory value into active expression.
  - **M+**: Add current result to memory.
  - **M-**: Subtract current result from memory.
  - Toggle persistent visual `"M"` indicator in status row whenever memory != `0`.
  - Disable or gray out `MR` / `MC` when memory is empty/zero.

- [x] **Task 4.3: Keyboard Event Handling (`js/keyboard.js`)**
  - Map desktop keyboard events to calculator actions:
    - Digits `0–9`, decimal `.`
    - Operators `+`, `-`, `*`, `/`, `^`, `%`
    - Parentheses `(`, `)`
    - `Enter` / `=` → Compute result
    - `Backspace` → Delete last digit
    - `Escape` → All Clear (`AC`)
  - Ensure unsupported keys pass through silently without error.
  - Trigger visual button active states on keyboard keydown for tactile feedback.

---

## Phase 5: Calculation History & Local Storage

- [x] **Task 5.1: History Data Module (`js/history.js`)**
  - Structure history record objects: `{ id, expression, result, timestamp }`.
  - Save calculation entry automatically upon successful evaluation.
  - Cap stored history entries (e.g., max 100 entries) with FIFO eviction.
  - Persist history to `localStorage` under `smart_calc_history`.

- [x] **Task 5.2: History Drawer UI Component**
  - Build slide-over / expandable drawer panel for History without leaving calculator screen.
  - Render list of completed calculations with scrollable performance optimization.
  - Tap/click any history entry to re-insert its result into current expression input buffer.
  - Provide "Clear History" button (with confirmation prompt or immediate action) and individual item removal.

---

## Phase 6: Edge Cases, Accessibility (WCAG 2.1 AA) & Polish

- [x] **Task 6.1: Comprehensive Error Recovery (PRD Section 8)**
  - Implement user-friendly inline messages for error states:
    - "Error: Cannot divide by zero"
    - "Error: Invalid input for √"
    - "Invalid expression"
    - "Overflow"
  - Ensure error states freeze chaining until cleared (`C` or `AC`), but allow immediate digit entry to reset state.

- [x] **Task 6.2: Screen Reader & ARIA Implementation (PRD Section 9)**
  - Add descriptive `aria-label` to all buttons (e.g., `aria-label="Add"`, `aria-label="Memory Recall"`).
  - Implement hidden `aria-live="polite"` region to announce evaluation results automatically upon pressing `=`.
  - Ensure logical keyboard focus tab order across display, memory row, button grid, theme toggle, and history drawer.

- [x] **Task 6.3: Responsive & Animation Polish**
  - Validate layout on mobile (320px–480px), tablet (768px), and desktop (>1024px) viewports.
  - Ensure smooth button micro-animations without dropped frames or UI jank.
  - Test app background/resume cycle to ensure state and memory restoration.

---

## Phase 7: Verification & Acceptance Testing

- [x] **Task 7.1: Automated Engine Tests Execution**
  - Run all engine unit tests and ensure 100% pass rate for math operations & edge cases.

- [x] **Task 7.2: PRD Acceptance Criteria Audit (PRD Section 13)**
  - [x] Math accuracy across standard and edge-case inputs.
  - [x] Memory functions (MC, MR, M+, M-) state and "M" indicator.
  - [x] History drawer logging, entry insertion, and persistence.
  - [x] Light/Dark mode toggling and persistence.
  - [x] Keyboard vs On-screen input parity.
  - [x] Error scenarios recovery without app crashes.
  - [x] Performance target verification (< 100ms evaluation time).
  - [x] Screen reader & keyboard accessibility audit (contrast ≥ 4.5:1, ARIA live region).
