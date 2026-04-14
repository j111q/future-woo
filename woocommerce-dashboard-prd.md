# WooCommerce Dashboard Redesign — Project Spec

## Overview

This project modernizes the WordPress Dashboard experience for WooCommerce stores. The goals are:

- Migrate all widgets from the **My Home** page into the main WordPress Dashboard
- Delete the **My Home** page entirely
- Remove the legacy WooCommerce widget from the main Dashboard
- Introduce five new widgets: **Store Setup**, **What's Next**, **Inbox**, **Stats**, and **Store Management**
- Add a **floating state switcher** (FAB) for development/QA purposes

---

## General Design Guidelines

- **Icons:** Always use icons from the Gutenberg icon set. Reference: [https://developer.wordpress.org/block-editor/reference-guides/packages/packages-icons/](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-icons/)

---

## 1. Widget: Store Setup

### Purpose
Replaces the existing "My Home" onboarding experience. Guides new store owners through initial setup tasks.

### Data Source
- Pulls all tasks from the existing **My Home** widget
- Each task retains its original CTA (call-to-action) from My Home

### Task Behavior
- All tasks are **collapsible** (accordion-style)
- The **next incomplete task** is expanded by default on page load
- Completed tasks remain expandable (users can re-open them)
- When a task is open, a **relevant illustration** is displayed on the right side of the task panel

### Header
- Widget title: **"Store Setup"**
- Display a **task completion counter** next to the header (e.g., `Store Setup (3/7)`)

### UI Details
- Do **not** show a divider line after the last task
- **Incomplete task icon:** Circle ("○") icon
- **Completed task icon:** Green checkmark (✓)
- **Completed task text:** Rendered in a lighter shade of grey
- **Half-complete task icon:** Gutenberg "Drafts" icon
- **Half-complete task badge:** Display a **"Test account"** badge on the task row — used for the **Set up payments** task when a test/sandbox account has been configured but live payments are not yet active

### Completion State
When all tasks are marked complete:
1. Replace the Store Setup widget with the **What's Next** widget
2. On the user's first return to the Dashboard after completion, display a **celebratory notice** at the top of the Dashboard (standard WordPress notice component)

### Guardrails
- If a user attempts to remove the Store Setup widget via Dashboard screen options, display a **warning modal** using the standard WordPress modal component, explaining that the widget cannot be removed until setup is complete (or equivalent messaging)

---

## 2. Widget: What's Next

### Purpose
Appears after the Store Setup widget is completed. Surfaces recommended next steps to grow and manage the store.

### Behavior
- Same collapsible accordion behavior as Store Setup
- **No task counter** is shown next to the widget header
- When a task is open, it shows:
  - A **primary CTA button**
  - A **tertiary "Dismiss" button** to dismiss that individual task

### Header Controls
- Add an **ellipsis menu (⋯)** to the left of the existing move-up/move-down arrows
- The ellipsis menu contains a single option: **"Dismiss all"**

### Dismiss All State
When all tasks are dismissed (via individual dismissals or "Dismiss all"):
- Replace task list with an **empty state**
- Empty state includes:
  - Space for an **illustration**
  - A single line of **descriptive text**

---

## 3. Widget: Inbox

### Purpose
Displays messages, notifications, or announcements relevant to the store (e.g., from WooCommerce or extensions).

### Display
- Shows **3 messages** at a time by default
- A **"Show more"** option opens a **side panel** displaying the full message list

### Message Structure
Each message contains:
| Field | Details |
|---|---|
| Title | Short message heading |
| Message body | The notification content |
| CTAs | Optional — one or more action buttons (context-dependent) |
| Delete | An option to remove the individual message |

### Long Message Handling
- If a message body exceeds **4 lines of text**, truncate it and append a **"Read more"** link
- Clicking "Read more" opens the **side panel** with the full message content

---

## 4. Widget: Stats

### Purpose
Provides a quick at-a-glance overview of store performance directly from the Dashboard. Mirrors the stats summary present in the existing My Home page.

### Header
- Widget title: **"Stats overview"**
- Add a **settings icon** to the left of the move-up/move-down arrows
- Clicking the settings icon opens a panel where users can **toggle individual metrics on or off**

### Time Period Tabs
Three tabs displayed below the header, switching all metrics simultaneously:

| Tab | Period |
|---|---|
| Today | Current calendar day |
| Week to date | Monday through current day |
| Month to date | 1st of month through current day |

### Metrics
Each metric displays:
- The **current value** for the selected period
- A **delta indicator** showing change vs. the previous equivalent period (e.g., previous day, previous week-to-date)
- On **hover**, a tooltip showing the **previous period's value** for context

### Default Metrics (visible by default)
| Metric | Notes |
|---|---|
| Total sales | Gross revenue including taxes and shipping |
| Net sales | Revenue after refunds and discounts |
| Orders | Number of orders placed |
| Visitors | Unique visitors to the store |

### Additional Metrics (hidden by default, toggleable via settings)
| Metric | Notes |
|---|---|
| Products sold | Total number of individual product units sold |
| Views | Total page views across the store |

### Footer
- A **"View detailed stats"** link at the bottom of the widget
- Links to the **Analytics** section of WooCommerce

---

## 5. Widget: Store Management

### Purpose
A simple navigation widget providing quick links to key store management areas. Mirrors the existing Store Management widget in My Home.

### Structure
Links are grouped under two section headings, each with an icon and label.

**Marketing & Merchandising**

| Icon | Label | Destination | Notes |
|---|---|---|---|
| Megaphone | Marketing | WooCommerce > Marketing | |
| Box | Add products | WooCommerce > Add Product | |
| Pencil | Personalize my store | Appearance / Theme customizer | |
| House | View my store | Store front URL | Opens in a new tab; shows an external link icon on the right |

**Settings**

| Icon | Label | Destination |
|---|---|---|
| Pen | Store details | WooCommerce > Settings > General |
| Credit card | Payments | WooCommerce > Settings > Payments |
| Percent | Tax | WooCommerce > Settings > Tax |
| Truck | Shipping | WooCommerce > Settings > Shipping |

### UI Details
- Section headings are rendered in small uppercase grey text
- Each row is an inline link with an icon on the left and a label
- "View my store" includes an **external link icon** on the right side of the row
- No CTAs or interactive states beyond standard link behavior

---

## 6. Development Tool: State Switcher (FAB)

### Purpose
A floating action button (FAB) for development and QA purposes, allowing quick switching between widget states without manual data manipulation.

### Trigger
- A **floating action button** fixed to the **bottom-right corner** of the screen
- Label: **"States"**

### Behavior
- Clicking the FAB opens an **overlay menu** listing available states
- Clicking any state option:
  1. Closes the overlay menu
  2. Applies the selected state to the Dashboard widgets

### Available States

| # | State Label | Description |
|---|---|---|
| 1 | **New store** | Fresh install; Store Setup widget visible with all tasks incomplete |
| 2 | **Store setup complete** | All Store Setup tasks done; What's Next widget visible |
| 3 | **What's Next complete** | All What's Next tasks dismissed; empty state visible |
| 4 | **Active store** | Simulates a store with real data; Stats widget populated |

---

## Out of Scope

- The **My Home** page is to be **deleted** in full — no redirect or archive
- The **legacy WooCommerce Dashboard widget** (the original overview widget in the main Dashboard) is to be **removed** entirely
