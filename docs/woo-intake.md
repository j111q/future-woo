# Woo Intake Automation

Future Woo is a prototype, so this automation is intentionally more aggressive
than a production sync bot. Its job is to notice design-relevant WooCommerce
work, force-enable allowlisted experimental features, and merge its own updates
when the prototype still builds.

## What It Does

- Scans recent merged PRs in `woocommerce/woocommerce`.
- Scores PRs using design-facing labels, paths, keywords, authors, and tracked
  PR numbers.
- Writes a designer-readable report to `sync/woo-intake/latest-report.md`.
- Force-enables feature flags listed in `config/woo-intake.json`.
- Applies surface ownership policies so super-future prototype areas are not
  overwritten by ordinary Woo updates.
- Opens a PR with the report and any generated changes.
- Self-merges that PR when the intake tests, build, and PHP syntax checks pass.
- Leaves a draft PR when the verification gate fails or the surface policy says
  a designer should review first.

## Changing What It Watches

Edit `config/woo-intake.json`.

- Add paths for new Woo surfaces designers care about.
- Add keywords for experimental work that may not have consistent labels yet.
- Add designer GitHub handles under `designSignals.authors`.
- Add feature flags under `featureFlags` when Future Woo should always turn an
  experiment on.
- Add patch adapters under `patchAdapters` when a Woo feature needs a
  surface-specific translation into Future Woo.
- Add surface policies under `surfacePolicies` when a Future Woo area needs its
  own intake rule.

## Surface Ownership Policies

Surface policies decide what happens after the bot notices a Woo PR. They answer
the question: “Should this change flow into the prototype automatically, pause
for review, or just stay visible in the report?”

Each policy has:

- `id`: stable machine name.
- `label`: designer-readable surface name.
- `mode`: `vision-owned`, `hybrid`, or `mirror-owned`.
- `owner`: who should make the call when the bot pauses.
- `matches`: paths, keywords, authors, labels, or PR numbers that identify
  relevant Woo work.
- `intake`: actions by intent, such as `bugfix`, `feature-flag`,
  `vision-change`, or `default`.
- `reviewPath`: where a designer should check the result in Studio.
- `notes`: plain-English context for the report.

The current actions are:

- `self-merge`: if verification passes, the Action may merge the PR.
- `draft-pr`: the Action opens a draft PR and does not self-merge.
- `report-only`: the Action keeps the Woo PR visible in the report but does not
  treat it as something to auto-apply.
- `hold`: same review posture as `draft-pr`, used for risky or unclear areas.

The current modes mean:

- `vision-owned`: Future Woo has a stronger prototype vision than Woo core does
  right now. Bugfixes are usually report-only, and mid-term feature flags pause
  as draft PRs.
- `hybrid`: Woo and Future Woo are both actively shaping the surface. Bugfixes
  can flow through, but feature flags and new UI direction pause for review.
- `mirror-owned`: Future Woo is mostly mirroring Woo core. Low-risk changes can
  self-merge when checks pass.

So for the Analytics example:

- A Woo Analytics bugfix becomes `report-only`. You see it, but the bot does not
  flatten the shiny prototype.
- A mid-term Analytics feature flag becomes `draft-pr`. It is interesting, but
  needs a design call.
- A Future Woo vision change can be allowed to `self-merge` if it comes through
  a trusted adapter later.

## Patch Adapters

A patch adapter is a recipe for one design surface. It does not say “merge
Woo.” It says “when a Woo PR looks like this, treat it as input for this Future
Woo area.”

Each adapter has:

- `id`: stable machine name.
- `label`: designer-readable name in the report.
- `status`: `planned`, `applied`, or `hold`.
- `matches`: paths, keywords, authors, labels, or PR numbers that identify
  relevant Woo work.
- `localTarget`: where the translated prototype should live.
- `reviewPath`: where a designer should check the result in Studio.
- `notes`: plain-English implementation notes.

The first configured adapter is `products-dataviews-table`. It watches for Woo
PRs touching the products client, product-list/DataViews language, or tracked
designer work, and points the bot at `client/dataviews-tables/products-list`.

Adapter statuses:

- `planned`: the bot can recognize the PR and report the target, but does not
  rewrite files yet.
- `applied`: the adapter has a transform/copy step and can update Future Woo
  files automatically.
- `hold`: the adapter matched something risky and should leave a draft PR.

## Reviewing a Bot PR

Read the report first. The useful sections are:

- **Auto-merge gate**: `merge` means the bot may merge itself. `hold` means it
  created a draft PR for help.
- **Feature flags Future Woo will force-enable**: experiments that should show
  up when the installed Woo build contains the code.
- **Surface ownership policy**: the place to see whether a Woo change was
  allowed to self-merge, paused as a draft, or reported only.
- **Patch adapters**: surface-specific recipes that matched the Woo PRs.
- **Woo candidates**: PRs that matched the design signals.
- **Designer review paths**: the places to spot-check in Studio.

## Manual Run

```bash
npm run sync:woo
npm run test:woo-intake
npm run build
```

To scan from a specific date:

```bash
node scripts/woo-intake.mjs discover --since 2026-06-01
```
