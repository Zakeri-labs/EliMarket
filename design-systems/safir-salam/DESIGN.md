# Safir Al-Salam: corrected design system

Based on https://safir-salam.vercel.app/ (office panel), audited 2026-11-05 in the logged-in browser.

**This file is the specification. Implement what it says, not what the live site does.** Part 1 is what to build. Part 2 records the site's defects so they are not repeated. Part 3 records what the system contains and how far the audit went.

Sources: colour, radius and shadow tokens come from the live stylesheet. Tailwind classes and values in Part 1 are our specification, and where Part 2 lists a site value they replace it; *proposed* marks new tokens and specs with no site equivalent. Hover values come from class names and were not observed interactively.

Applies to projects that adopt this style. RTL and LTR are both required, although the site was seen only in RTL.

# Part 1: Build this

## Character

Pale blue-grey page, white floating cards, dark navy floating sidebar, pill-shaped controls, one magenta accent. Minimal: few elements, generous space, no decoration on working surfaces.

## Colour tokens

HSL channels, used as `hsl(var(--token))`.

| Token | Light | Hex (light) | Dark |
|---|---|---|---|
| `--background` | `207 43% 96%` | `#F0F5F9` | `213 47% 15%` |
| `--foreground` | `216 45% 12%` | `#111C2C` | `210 31% 94%` |
| `--card` | `0 0% 100%` | `#FFFFFF` | `216 45% 12%` |
| `--popover` | `0 0% 100%` | `#FFFFFF` | `216 45% 13%` |
| `--primary`, `--ring` | `292 52% 38%` | `#862F93` | `262 72% 62%` |
| `--primary-foreground` | `0 0% 100%` | `#FFFFFF` | `0 0% 100%` |
| `--secondary`, `--muted` | `210 45% 96%` | `#F0F5F9` | `216 36% 18%` |
| `--secondary-foreground` | `216 45% 16%` | `#16253B` | `210 31% 90%` |
| `--muted-foreground` | `218 19% 44%` | `#5B6B86` | `216 22% 62%` |
| `--accent` | `292 50% 96%` | `#F9F0FA` | `262 38% 22%` |
| `--accent-foreground` | `292 52% 32%` | `#71277C` | `262 90% 84%` |
| `--destructive` | `358 75% 48%` | `#D61F25` | `358 70% 52%` *proposed* |
| `--destructive-foreground` | `0 0% 100%` | `#FFFFFF` | `0 0% 100%` |
| `--success` | `152 60% 36%` | `#25935F` | `152 50% 50%` |
| `--warning` | `35 92% 45%` | `#DC8409` | `35 90% 60%` |
| `--info` | `212 70% 46%` | `#2370C7` | `212 75% 64%` |
| `--border` | `210 21% 92%` | `#E6EBEF` | `219 25% 24%` |
| `--input` *proposed* | `216 13% 55%` | | `217 16% 48%` |
| `--success-ink` *proposed* | `152 60% 28%` | | use `--success` |
| `--warning-ink` *proposed* | `35 92% 28%` | | use `--warning` |
| `--info-ink` *proposed* | `212 70% 40%` | | use `--info` |
| `--destructive-ink` *proposed* | `358 75% 42%` | | `358 80% 70%` |
| `--status-foreground` *proposed* | `0 0% 100%` | | `216 45% 12%` |

Sidebar:

| Token | Light | Dark |
|---|---|---|
| `--sidebar-background` | `228 42% 12%` | `216 45% 12%` |
| `--sidebar-foreground` | `226 22% 78%` | `214 25% 80%` |
| `--sidebar-muted` | `226 16% 60%` | `216 22% 62%` |
| `--sidebar-border` | `228 34% 19%` | `219 25% 22%` |
| `--sidebar-accent` | `272 38% 24%` | `262 38% 22%` |
| `--sidebar-primary`, `--sidebar-ring` | `296 50% 46%` | `262 72% 62%` |

Charts (light, then dark): `--chart-1` `292 52% 42%`, `262 75% 64%`; `--chart-2` `224 64% 33%`, `220 10% 80%`; `--chart-3` `216 8% 50%` *proposed*, `216 8% 50%`; `--chart-4` `35 92% 38%` *proposed*, `35 90% 58%`; `--chart-5` `152 55% 40%`, `152 50% 50%`. Give every series a label or tooltip as well.

Shape tokens: `--card-radius: 18px`, `--card-shadow: 0 2px 6px rgba(37,83,185,.08), 0 0 1px rgba(17,28,45,.08)`, `--card-shadow-hover: 0 12px 30px -2px rgba(58,75,122,.14)`. Dark: `0 0 2px rgba(145,158,171,.2), 0 12px 24px -4px rgba(0,0,0,.18)` and `0 0 2px rgba(145,158,171,.25), 0 16px 32px -6px rgba(0,0,0,.35)`.

### Tailwind 4 wiring

```css
@custom-variant dark (&:where(.dark, .dark *));
@theme inline {
  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));
  --color-card: hsl(var(--card));
  --color-popover: hsl(var(--popover));
  --color-primary: hsl(var(--primary));
  --color-primary-foreground: hsl(var(--primary-foreground));
  --color-secondary: hsl(var(--secondary));
  --color-secondary-foreground: hsl(var(--secondary-foreground));
  --color-muted: hsl(var(--muted));
  --color-muted-foreground: hsl(var(--muted-foreground));
  --color-accent: hsl(var(--accent));
  --color-accent-foreground: hsl(var(--accent-foreground));
  --color-destructive: hsl(var(--destructive));
  --color-destructive-foreground: hsl(var(--destructive-foreground));
  --color-status-foreground: hsl(var(--status-foreground));
  --color-success: hsl(var(--success));
  --color-warning: hsl(var(--warning));
  --color-info: hsl(var(--info));
  --color-success-ink: hsl(var(--success-ink));
  --color-warning-ink: hsl(var(--warning-ink));
  --color-info-ink: hsl(var(--info-ink));
  --color-destructive-ink: hsl(var(--destructive-ink));
  --color-border: hsl(var(--border));
  --color-input: hsl(var(--input));
  --color-ring: hsl(var(--ring));
  --color-sidebar: hsl(var(--sidebar-background));
  --color-sidebar-foreground: hsl(var(--sidebar-foreground));
  --color-sidebar-muted: hsl(var(--sidebar-muted));
  --color-sidebar-border: hsl(var(--sidebar-border));
  --color-sidebar-accent: hsl(var(--sidebar-accent));
  --color-sidebar-primary: hsl(var(--sidebar-primary));
  --color-sidebar-ring: hsl(var(--sidebar-ring));
  --color-chart-1: hsl(var(--chart-1));
  --color-chart-2: hsl(var(--chart-2));
  --color-chart-3: hsl(var(--chart-3));
  --color-chart-4: hsl(var(--chart-4));
  --color-chart-5: hsl(var(--chart-5));
  --font-sans: Vazirmatn, "IBM Plex Sans Arabic", Inter, system-ui, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  --radius-card: var(--card-radius);
  --shadow-card: var(--card-shadow);
  --shadow-card-hover: var(--card-shadow-hover);
}
```

Tailwind 4's bare `border` is `currentColor`, so always name the colour: `border-border` or `border-input`.

## Typography

Stack: `Vazirmatn, "IBM Plex Sans Arabic", Inter, system-ui, sans-serif`. Mono: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`. Cinzel is for the logo wordmark only.

Only these sizes: 12, 14, 16, 18, 24, 30px.

| Role | Class | Weight |
|---|---|---|
| Page title | `text-2xl md:text-3xl` | 700 |
| KPI value | `text-2xl` | 600 |
| Dialog title | `text-lg` | 600 |
| Card title | `text-base` | 600 |
| Body, buttons, table cells | `text-sm` | 400; buttons 500 |
| Secondary, table header, sidebar label, pagination | `text-xs` | 400; others 600 |
| Form input | `text-base md:text-sm` | 400 |

Inputs are 16px on mobile to stop iOS Safari zooming on focus. Use letter-spacing and uppercase only on Latin text (`ltr:tracking-*`, `ltr:uppercase`), because they break Arabic-script joining.

## Accessibility

- Text meets 4.5:1. Field borders, focus indicators and chart marks meet 3:1.
- Status text uses `--*-ink`. Solid status fills use `bg-*-ink text-status-foreground`. Status is never colour alone.
- Focus: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background` on every interactive element, text inputs included. Inside cards and dialogs use `focus-visible:ring-offset-card`. In the sidebar use `focus-visible:ring-sidebar-ring focus-visible:ring-offset-sidebar`.
- Icon-only buttons have `aria-label`. Dialogs trap focus and return it on close.
- Touch targets are at least 44px below `md`, and at least 32px on desktop.

## RTL and LTR

Use logical utilities only: `ps-*`, `pe-*`, `ms-*`, `me-*`, `text-start`, `text-end`, `border-s`, `border-e`, `rounded-s-*`, `rounded-e-*`, `start-*`, `end-*`. Never use `pl`, `pr`, `ml`, `mr`, `left-*`, `right-*`, `text-left` or `text-right`. Mirror directional icons with `rtl:-scale-x-100`. Numbers, phone numbers and flight codes use `dir="ltr"` inside `<bdi>`.

## Components

**Control heights.** All buttons, inputs and selects are `h-11 md:h-10`, in pages and dialogs alike, except pagination, segmented control options and sidebar items, which define their own sizes. Icon buttons are `size-11 md:size-10`.

**Primary button.** `rounded-full px-5 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90`. One style everywhere, with no glow or `shine`.

**Secondary button.** Pill, `px-4 text-sm font-medium bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground`. Use on cards only; directly on the page background use Outline.

**Outline button.** Pill, `px-5 text-sm font-medium border border-input bg-card`.

**Ghost and icon buttons.** `rounded-full text-muted-foreground hover:bg-accent hover:text-accent-foreground`.

**Destructive button.** Pill, `px-5 text-sm font-medium bg-destructive-ink text-status-foreground hover:bg-destructive-ink/90`. Irreversible actions require a confirmation dialog.

**Card.** `rounded-card bg-card shadow-card`. No nested cards.

**KPI card.** Card with a 12px label, a 24px / 600 value, an optional 12px delta with icon, and at most one tinted icon tile.

**Status chip.** Pill, `bg-success/10 ring-1 ring-inset ring-success/25 text-success-ink`, icon plus text. Same pattern for each status. Neutral: `bg-muted ring-1 ring-inset ring-border text-muted-foreground`.

**App header.** Floating card, 70px high, `rounded-card shadow-card px-3 md:px-4`.

**Sidebar.** Floating, 264px, `bg-sidebar text-sidebar-foreground rounded-card`. Shown from `lg`; below `lg` it is a drawer from the inline-start edge. Items: `h-11 lg:h-8` pill, `px-3.5 text-sm font-medium hover:bg-sidebar-accent`. Active: `bg-sidebar-accent text-white font-semibold` with `aria-current="page"`. Group labels: `text-xs font-semibold text-sidebar-muted`.

**Form field.** `<label class="block space-y-1.5">` wrapping the control. Input: `h-11 md:h-10 w-full rounded-xl border border-input bg-card px-3 text-base md:text-sm outline-hidden focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card`. Forms: `grid gap-4 md:grid-cols-2`. Errors sit under the field in `--destructive-ink` with an icon, `aria-invalid` and `aria-describedby`.

**Search.** A real search input uses the Form field style in a pill: `h-11 md:h-10 rounded-full`. The global search trigger is a button and keeps `border-border`.

**Custom Dropdown.** Trigger `role="combobox"`, styled as the input, with `aria-expanded` and `aria-controls`. Full keyboard support. No native `<select>`.

**Date Picker** *proposed; not measured*. Trigger matches the Dropdown, with a popover calendar, arrow-key navigation and Esc to close. RTL/LTR aware. Bottom sheet below `md`. No native date input.

**Dialog.** Centred, `grid gap-4 w-[calc(100%-2rem)] max-w-lg max-h-[90dvh] overflow-y-auto rounded-card bg-card p-4 md:p-6`, shadow `0 24px 48px -12px rgba(17,28,45,.28)`, overlay `bg-black/50`, close button `size-11 md:size-10`. Below `md`, the form is one column and the footer is sticky with full-width buttons.

**Pagination.** Track `bg-secondary rounded-full p-1`. Buttons `min-h-11 min-w-11 md:min-h-8 md:min-w-8 rounded-full px-2.5 text-xs font-semibold`. Active: `bg-card text-accent-foreground shadow-sm` with `aria-current="page"`.

**Checkbox.** 20px box, `rounded-md border border-input`, checked `bg-primary text-primary-foreground`, with a hit area of 44px below `md` and 32px from `md`.

**Segmented control.** For view and period switches. Track `bg-secondary rounded-full p-1`, options `min-h-11 md:min-h-8 rounded-full px-3 text-sm font-medium`, active `bg-card text-accent-foreground shadow-sm` with `aria-pressed="true"`.

**Toast.** `rounded-card bg-popover shadow-card p-4 text-sm` with a status icon, bottom inline-end from `md`, full width below `md`. `role="status"` for success, `role="alert"` for errors. Auto-dismiss after 5s; errors stay until closed.

**Chat.** Bubble `max-w-[75%] px-3.5 py-2.5 text-sm break-words shadow-sm`, with `dir="auto"` on the text. Sent: `self-end rounded-2xl rounded-ee-md bg-primary text-primary-foreground`. Received: `self-start rounded-2xl rounded-es-md bg-card text-foreground`. Reply input follows Search.

**Charts.** Colours from `--chart-1` to `--chart-5`. Hover or tap shows an animated tooltip and highlight, with value tween, line draw and bar grow. Axis labels stay readable at 375px.

**Icons.** Solar icon set, one style, 18px in controls.

## Data table and card view

This is one shared component. No page builds its own, so no page can skip the card view.

- **Never scroll sideways, at any width.**
- Render both views from one column config. Each column declares a `minWidth`. A ResizeObserver shows the table only when the container is at least the sum of visible column `minWidth` values; otherwise it shows cards. Render cards on the server and before measurement. Below `md`, always show cards. Horizontal scrolling on a table or any of its ancestors is forbidden: no `overflow-x-auto`, `overflow-x-scroll`, `overflow-auto` or `overflow-scroll`, and no fixed or minimum table width. The table is `w-full table-fixed`. Cells wrap with `break-words`, and `whitespace-nowrap` is forbidden in cells.
- Table header: `bg-secondary/80 px-4 py-3.5 text-start text-xs font-semibold text-muted-foreground first:ps-6 last:pe-6`.
- Table cell: `px-4 py-3.5 align-middle first:ps-6 last:pe-6`. Row: `border-t border-border transition-colors`.
- Rows open through a real link or button in the title cell, because a clickable `<tr>` is not keyboard reachable.

Card view:

- `<ul>` of `rounded-card bg-card shadow-card p-4` cards, with a 12px gap.
- Title: the row's identifying field, `text-sm font-semibold`, with the status chip on the end side.
- Remaining fields: `<dl>` label/value rows, label `text-xs text-muted-foreground`, value `text-sm`.
- Actions: footer row, 44px targets.
- Sorting: custom Dropdown above the list, since cards have no headers.
- Bulk selection: checkbox with a 44px hit area on each card, a select-all control, and a sticky action bar.
- Column visibility: table view only.

Every table has search, useful filters, pagination and a no-results state, shared by both views. Every list and board has search, useful filters and a no-results state.

## Boards and calendar on mobile

Below `md`, boards render as stacked lists grouped by status, with collapsible groups and counts. Each item has a status Dropdown, since drag does not work there. The calendar renders as an agenda list that shows today even when it is empty, with an add action.

## States

Every data view defines these:

- **Loading:** skeleton matching the final layout, with no spinner on a blank page.
- **Empty:** one line of text plus the primary action.
- **No results:** names the query, with a clear-filters button.
- **Error:** cause plus retry, keeping loaded data on screen.
- **Success:** toast.
- **Disabled:** `opacity-50 cursor-not-allowed`, with the reason as visible helper text.

## Motion *proposed*

- Colour changes: `transition-colors`, 150ms. Enter and exit: 200-300ms. Animate transform and opacity only, except SVG line draw, which animates `stroke-dashoffset`.
- Framer Motion (`motion/react`, in client components; install `motion`): hover, tap, enter and exit, scroll-triggered fades, staggered lists. Example: `initial={{opacity:0,y:12}}`, `whileInView={{opacity:1,y:0}}`, `viewport={{once:true}}`, 0.3s, stagger 0.05s.
- GSAP with ScrollTrigger and `useGSAP` (`gsap`, `@gsap/react`, in client components; call `gsap.registerPlugin(ScrollTrigger, useGSAP)`): timelines, pinning, scrubbing, SVG line draw.
- Never animate the same element and property with both.
- Respect `prefers-reduced-motion`: `<MotionConfig reducedMotion="user">` and `gsap.matchMedia()`.
- No looping decoration on working surfaces.

## Layout

Tailwind breakpoints: 640, 768, 1024, 1280, 1536px. Spacing is the 4px scale. Standard page order: title and main action, KPI cards, filters and search, then the list.

# Part 2: Do not copy from the live site

| # | Live site (measured) | Fixed by |
|---|---|---|
| 1 | Tables scroll sideways. At 375px, in a 341px container: `/balances` 1171px, `/flights` 1104px, `/customers` 932px, `/hotels` 861px, `/exchange` 560px, `/dashboard` 532px, `/leads` list view 812px. At 768px, in a 407px container: `/balances` 1171px, `/flights` 1104px, `/customers` 932px. At 1440px, `/balances` is 1171px while the `/customers` table beside the same layout is 1079px. | Data table and card view |
| 2 | The `/dashboard` country table has no search or pagination; the `/follow-ups` list has no search | Data table and card view |
| 3 | At 375px, boards and the calendar scroll sideways: `/leads` 1519px, `/visa` 1000px, `/calendar` 700px | Boards and calendar on mobile |
| 4 | Pagination buttons 24px, dialog close button 15px, sidebar items 32px and controls 40px on mobile | Accessibility, Control heights |
| 5 | Control heights differ (38px in dialogs, 40px elsewhere), and primary is sometimes solid and sometimes a gradient with glow | Control heights, Primary button |
| 6 | Input and select borders differ; `--input` is 1.3:1 on white | `--input`, Form field |
| 7 | Off-scale sizes: 10, 11, 11.5, 13, 13.5, 15, 17, 26px | Typography |
| 8 | White on `--success` 3.9:1, on `--warning` 2.9:1, with status text in the same colours | `--*-ink` tokens |
| 9 | Table headers use uppercase and letter-spacing on Persian text | Typography |
| 10 | Overlay `bg-black/80`; decorative blurred blobs, `shine`, `--omani-tile`, looping keyframes | Character, Dialog, Motion |
| 11 | Clickable `<tr>` rows | Data table and card view |
| 12 | Native `<input type="date">` in the add-task, new-flight, new-visa and add-tour dialogs | Date Picker |
| 13 | Six switchable accents, some failing with white text (cyan 2.8:1, orange 3.4:1, blue 4.0:1). Not specified here | Not adopted |

Keep from the site: custom Dropdown, no page-level horizontal overflow, column visibility on desktop, board and list view switch, sortable table headers.

# Part 3: What the system contains

An office panel for an Omani travel agency, covering leads, customers, visas, flights, hotels and tours, balances, currency exchange, and WhatsApp-driven AI intake.

In the table, a blank cell means the page has no such element, and No means a list or table lacks it.

| Route | Purpose | Contents | Table | Search | Pagination |
|---|---|---|---|---|---|
| `/login` | Sign-in | Language switch, boarding-pass form, destination animation (logged-out screenshot only) | | | |
| `/` | Today | KPIs, overnight AI summary, call list, flights, new leads, tasks | | | |
| `/dashboard` | Agency reports | Period switch, export, 7 Recharts charts, funnel, team | Yes | No | No |
| `/calendar` | Calendar | Month and list views, event-type filters | | | |
| `/leads` | Leads | KPIs, board and list views, source filter | List view | Yes | Yes |
| `/chats` | Conversations | Channel filters, list, thread, reply | | Yes | |
| `/customers` | Customers | KPIs, segments, columns, bulk selection, add | Yes | Yes | Yes |
| `/customers/:id` | Customer file | Trips, passports and visas, payments, open items, notes | | | |
| `/visa` | Visa cases | KPIs, country filters, draggable status board | | Yes | |
| `/visa/:id` | Visa case | Checklist with reviewed marks, status actions | | | |
| `/flights` | Flights | KPIs, upcoming flights, requests | Yes | Yes | Yes |
| `/hotels` | Hotels and tours | KPIs, group tours, bookings | Yes | Yes | Yes |
| `/follow-ups` | Follow-ups | KPIs, reminders with done, WhatsApp and edit | | No | |
| `/tasks` | Tasks | KPIs, service filter, task list, team today | | Yes | |
| `/balances` | Balances | KPIs, service filter, sortable headers, add payment | Yes | Yes | Yes |
| `/visa-questions` | Visa questions | Region and country selection, questions, audio upload or recording | | | |
| `/import` | WhatsApp import | File picker, sample export, instructions | | | |
| `/exchange` | Currency exchange | Today's rates, new deal, deals | Yes | Yes | Yes |
| `/settings` | Settings | Team, WhatsApp, reminders, payments, services, language, data | | | |
| `/profile`, `/profile/:id` | Profile | Monthly output, open visa cases | | | |

Add dialogs opened at 375px, without saving:

| Dialog | Fields |
|---|---|
| New lead | Customer, name, phone, source, nationality, request, details, message |
| Add customer | Name, phone, nationality, language, source, tags, annual traveller |
| New visa case | Customer, country, purpose, dates, travellers, also needs, price, deposit, owner |
| New flight request | Customer, from, to, depart, return, flexible dates, passengers, price, flight number, status |
| Add tour | Name, description, seats, price from, start, photo |
| Add task | Task, assignee, due date, service, customer |
| Add payment | Customer and case, type, currency, amount |
| New exchange deal | Customer, name, then amounts |
| Add team member | Name, email, department, role, initial password |
| Add visa question | Question, answer buttons |

Dark mode, measured on `/dashboard` only: page `#142438`, cards and sidebar `#111C2C`, text `#EBF0F4`.

## Not audited

- `/invoice/:id`: no link to a real invoice was found, so it was not seen. It may contain a table.
- `/login`: only the logged-out screenshot was seen; the panel was not signed out.
- Hover, chart tooltips, and empty, loading and error states: none were exercised, because that would need changing data.
- LTR and the other languages. Dark mode outside `/dashboard`.
- Tablet: only three tables were measured at 768px.
- The hotel booking dialog: the attempt opened the add-tour form, so its fields were not seen. Row-level edit dialogs were not opened.
- Nothing was submitted, and every dialog was closed without saving.
