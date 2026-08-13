-- =====================================================================
-- Portfolio content
-- =====================================================================
--
-- Run after schema.sql. Re-runnable: every insert resolves a conflict on its
-- natural key, so a second run updates rather than duplicates.
--
-- Once the dashboard is in use this file becomes a starting point rather than
-- the source of truth. Re-running it will overwrite dashboard edits to these
-- four projects, so treat it as a reset rather than a routine step.

-- =====================================================================
-- Tech stack
-- =====================================================================

insert into tech_stack (name, category, sort_order) values
  ('Node.js',        'backend',        10),
  ('Express',        'backend',        20),
  ('PHP',            'backend',        30),
  ('Laravel',        'backend',        40),
  ('JavaScript',     'frontend',       5),
  ('Next.js',        'frontend',       10),
  ('React',          'frontend',       20),
  ('TypeScript',     'frontend',       30),
  ('Tailwind CSS',   'frontend',       40),
  ('PostgreSQL',     'database',       10),
  ('MySQL',          'database',       20),
  ('Redis',          'database',       30),
  ('Supabase',       'database',       40),
  ('BullMQ',         'infrastructure', 10),
  ('PWA',            'infrastructure', 20),
  ('Vercel',         'infrastructure', 30),
  ('Jest',           'tooling',        10),
  ('Git',            'tooling',        20)
on conflict (name) do update
  set category = excluded.category,
      sort_order = excluded.sort_order;

-- =====================================================================
-- Projects
-- =====================================================================

insert into projects (
  slug, title, subtitle, kind, situation, task, action, metrics, limitation,
  repo_url, live_url, sort_order, is_published
) values

-- ---------------------------------------------------------------------
(
  'e-wallet-rest-api',
  'E-Wallet REST API',
  'A digital wallet API where a transfer survives the worker dying halfway through it.',
  'Backend · Self-directed',

  'A wallet transfer looks like one action to the person sending it. Underneath it is at least two writes to two different accounts, and the process can die between them. The common implementation performs both writes inside the request handler and quietly assumes nothing goes wrong.

I built this as a self-directed study of the version that assumes something will. The design question was narrow and specific: where does the money live while it is in motion, and what happens to it when the machine handling it stops?',

  'Sole developer. I designed the schema, the API contract, the settlement model, the failure policy, and the test suite.',

  array[
    'Split every transfer into two phases. The sender is debited synchronously inside a database transaction holding a row lock, and the transfer is recorded as pending, so the balance the caller sees is immediately truthful and the money in motion has exactly one home.',
    'Queued the recipient credit as a background job keyed by the transfer id, which makes enqueueing idempotent. A retried HTTP request cannot create a second settlement job for the same transfer.',
    'Made settlement itself idempotent. A job replayed after a crash finds the transfer no longer pending, returns, and credits nobody twice.',
    'Gave failure a defined ending. Three attempts with exponential backoff, after which the sender is refunded inside a transaction and the transfer is marked failed with a stored reason. No transfer is left suspended.',
    'Chose Redis and BullMQ over a full message broker. The problem needs durable jobs, retries, and visible failures. It does not need routing topologies, and importing them would have been weight without benefit.',
    'Closed the boundary before the logic runs. Schema validation on every route, security headers, per-route rate limiting, hashed PINs, and access plus refresh tokens. A wrong PIN and an unknown phone number return the identical message, so the login endpoint cannot be used to enumerate registered users.'
  ],

  '[
    {"label": "Test cases",          "value": "26 passing"},
    {"label": "Money path coverage", "value": "89.9%"},
    {"label": "Endpoints",           "value": "10"},
    {"label": "Retry policy",        "value": "3, then refund"}
  ]'::jsonb,

  'The suite runs against SQLite, which has no row-level locking, so the concurrency path is not covered by a test. Running it against Postgres would close that gap.',

  'https://github.com/MRRzkS/E-Wallet-REST-API',
  null,
  10,
  true
),

-- ---------------------------------------------------------------------
(
  'kyklos',
  'Kyklos',
  'Replacing a paper purchasing and sales cycle with a permissioned system and a real payment gateway.',
  'Backend · Bootcamp',

  'The case study company ran its purchasing and sales cycle on physical forms. Paper does two things badly at once. It keeps no record of who approved what, and it separates duties only as well as people remember to. A purchasing clerk and a sales clerk touch the same forms because the forms cannot tell them apart.

The system had to move that cycle into software while making the separation explicit rather than customary.',

  'Bootcamp assignment at Maxy Academy, built individually. I designed the schema, the access model, the order and payment flows, and the gateway integration.',

  array[
    'Modelled the access map as roles composed of named permissions rather than as fixed role checks, then declared the required permission on every route, so the entire access surface can be audited by reading one file.',
    'Separated viewing from changing as distinct permissions, because most roles in this domain need the first without the second. Purchasing sees items but does not edit them; sales owns customers and payments but never touches vendors.',
    'Applied the identical permissions to the token-authenticated API that the session-authenticated pages use, so a role cannot reach through the API what the interface refuses it. This is the mistake the design most needed to avoid.',
    'Integrated a payment gateway across three channels: hosted invoice, closed single-use virtual account, and e-wallet charge. Each channel payload and response shape is isolated in one gateway service, leaving the controllers to choose a channel and hand over validated input.',
    'Handled the fact that a virtual account never reports its own settlement, which makes the webhook the only path by which such a payment can be marked received. Verified the callback with a constant-time token comparison, and returned success on an unmatched reference so the gateway stops retrying a callback this system can never resolve.',
    'Extracted line pricing, discount, and tax arithmetic into a single support class shared by both order types, since purchase and sales lines price identically and duplicating the rule invites the two copies to drift.',
    'Archived records with a status flag instead of deleting them, because a document cycle that loses its own history is the problem the paper forms already had.'
  ],

  '[
    {"label": "Permissions",      "value": "18"},
    {"label": "Roles",            "value": "3"},
    {"label": "Payment channels", "value": "3"},
    {"label": "Database tables",  "value": "13"}
  ]'::jsonb,

  'It runs locally. A Laravel application needing a database is not a static deployment, and standing one up was outside what the assignment asked for.',

  'https://github.com/MRRzkS/kyklos-laravel',
  null,
  20,
  true
),

-- ---------------------------------------------------------------------
(
  'markdownpad',
  'MarkdownPad',
  'A markdown editor whose PDF export produces a real document, not a picture of one.',
  'Frontend · Self-directed',

  'Most browser-based markdown tools export a PDF by rasterizing the page. What comes out is an image of text: nothing selectable, nothing searchable, links dead, headings soft at any zoom above 100 percent.

The interesting constraint was that a browser already contains a typesetting engine capable of producing proper documents. It is the print engine, and it is usually ignored in favor of a screenshot.',

  'Sole developer. Built the editor, the live preview, and the export pipeline.',

  array[
    'Rendered the PDF through the browser own print engine rather than a canvas capture, which keeps the output as real text: selectable, searchable, and vector sharp at any zoom, with hyperlinks still clickable in the finished file.',
    'Made the on-screen paper preview and the printed sheet the same DOM node under the same stylesheet, so what the author sees matches what prints by construction rather than by two layout engines happening to agree.',
    'Governed pagination with CSS print rules instead of leaving it to chance: headings stay with the paragraph they introduce, code blocks and tables refuse to split across a page boundary, and orphan and widow limits keep single lines from stranding.',
    'Forced the printed sheet to an ink-friendly light palette regardless of the app theme, so a user working in dark mode does not print a black rectangle.',
    'Reused the same markdown pipeline for the live preview, the HTML export, and the PDF, which is what keeps three outputs from drifting into three slightly different documents.',
    'Exposed layout as a small set of named presets rather than raw numbers, mapping each to the CSS the print engine consumes in one place.'
  ],

  '[
    {"label": "Export formats",     "value": "3"},
    {"label": "Toolbar actions",    "value": "14"},
    {"label": "PDF layout presets", "value": "2 sizes, 3 margins, 3 scales"},
    {"label": "Languages highlighted", "value": "190+"}
  ]'::jsonb,

  'Output depends on the browser print implementation, so it can differ slightly between engines and cannot run server side. For a client-side editor that is the right trade; for a server-rendered report pipeline it would not be.',

  'https://github.com/MRRzkS/online-markdown-editor',
  null,
  30,
  true
),

-- ---------------------------------------------------------------------
(
  'hitter-protocol',
  'Hitter Protocol',
  'An offline-first progressive web app built with no framework, no build step, and no dependencies.',
  'Web platform · Self-directed',

  'A training app is used in the worst conditions a web app can face: phone in hand, screen dimming, network absent or unreliable, and the user unable to stop and troubleshoot. A page that needs a connection to open is a page that fails at the moment it is needed.

The engineering question was whether a browser application could behave like an installed one under those conditions, without a framework and without a build step.',

  'Sole developer. Built the routine engine, the timing system, the persistence layer, and the offline infrastructure.',

  array[
    'Wrote a service worker with two deliberately different caching strategies: application files precached at install for guaranteed offline availability, and remote fonts in a separate runtime cache that falls back to whatever is already stored. Navigation requests fall back to the cached shell, so the app opens with no network at all.',
    'Versioned the cache and deleted every non-current cache on activation, so a stale asset from a previous release cannot survive an update.',
    'Held the screen awake through the Screen Wake Lock API during a session, and re-acquired the lock when the app returned to the foreground, since a lock is silently dropped when the page is backgrounded.',
    'Synthesized every audio cue through the Web Audio API rather than shipping sound files, which keeps the offline payload small and gives precise control over cue timing.',
    'Built the session as a generated structure rather than a fixed list, so a single scaling parameter halves every repetition and interval throughout without a second code path to maintain.',
    'Persisted progress in local storage with plain-text export and re-import, so a reinstall does not erase the user history.',
    'Handled real phones rather than an idealized one: safe-area insets for notched displays, vibration where supported, and a reduced-motion query honored throughout.'
  ],

  '[
    {"label": "Runtime dependencies", "value": "0"},
    {"label": "Browser APIs",         "value": "5"},
    {"label": "Build step",           "value": "None"},
    {"label": "Offline capability",   "value": "Full, cold start"}
  ]'::jsonb,

  'State lives only on the device. Nothing syncs, so a second phone starts empty and the export file is the only way across.',

  'https://github.com/MRRzkS/fly-high',
  null,
  40,
  true
)

on conflict (slug) do update set
  title           = excluded.title,
  subtitle        = excluded.subtitle,
  kind            = excluded.kind,
  situation       = excluded.situation,
  task            = excluded.task,
  action          = excluded.action,
  metrics         = excluded.metrics,
  limitation      = excluded.limitation,
  repo_url        = excluded.repo_url,
  live_url        = excluded.live_url,
  sort_order      = excluded.sort_order,
  is_published    = excluded.is_published;

-- =====================================================================
-- Attachments
-- =====================================================================
--
-- Joined by natural key so this file never has to know a generated uuid.

insert into project_tech (project_id, tech_id)
select p.id, t.id
from projects p
join (values
  ('e-wallet-rest-api', 'Node.js'),
  ('e-wallet-rest-api', 'Express'),
  ('e-wallet-rest-api', 'PostgreSQL'),
  ('e-wallet-rest-api', 'Redis'),
  ('e-wallet-rest-api', 'BullMQ'),
  ('e-wallet-rest-api', 'Jest'),

  ('kyklos', 'PHP'),
  ('kyklos', 'Laravel'),
  ('kyklos', 'MySQL'),
  ('kyklos', 'Tailwind CSS'),

  ('markdownpad', 'Next.js'),
  ('markdownpad', 'React'),
  ('markdownpad', 'TypeScript'),
  ('markdownpad', 'Tailwind CSS'),
  ('markdownpad', 'Vercel'),

  ('hitter-protocol', 'JavaScript'),
  ('hitter-protocol', 'PWA'),
  ('hitter-protocol', 'Vercel')
) as pair (project_slug, tech_name) on pair.project_slug = p.slug
join tech_stack t on t.name = pair.tech_name
on conflict do nothing;
