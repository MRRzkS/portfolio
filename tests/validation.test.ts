import { test } from 'node:test';
import assert from 'node:assert/strict';
import { projectSchema, techSchema } from '../src/lib/validation.ts';

/** A minimal valid project: required fields present, every optional blank. */
function baseProject(overrides: Record<string, unknown> = {}) {
  return {
    slug: 'kyklos',
    title: 'Kyklos',
    subtitle: 'A short, one-sentence subtitle.',
    kind: '',
    situation: 'The problem context.',
    task: 'What I did.',
    action: ['Step one', 'Step two'],
    metrics: [],
    limitation: '',
    testimonial: '',
    testimonial_author: '',
    repo_url: '',
    live_url: '',
    cover_image_url: '',
    sort_order: 0,
    is_published: true,
    ...overrides,
  };
}

test('a project with every optional field empty still parses', () => {
  const result = projectSchema.safeParse(baseProject());
  assert.equal(result.success, true);
});

test('editing an existing project with blank links normalises them to null', () => {
  const result = projectSchema.safeParse(baseProject());
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.repo_url, null);
    assert.equal(result.data.live_url, null);
    assert.equal(result.data.cover_image_url, null);
    assert.equal(result.data.kind, null);
    assert.equal(result.data.limitation, null);
  }
});

test('a bare domain link is accepted and normalised to https', () => {
  const result = projectSchema.safeParse(
    baseProject({ repo_url: 'github.com/MRRzkS/portfolio' }),
  );
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.repo_url, 'https://github.com/MRRzkS/portfolio');
  }
});

test('an already-qualified url is kept as typed', () => {
  const result = projectSchema.safeParse(
    baseProject({ live_url: 'https://kyklos.example.app' }),
  );
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.live_url, 'https://kyklos.example.app');
  }
});

test('a slug with uppercase letters is rejected', () => {
  const result = projectSchema.safeParse(baseProject({ slug: 'Kyklos' }));
  assert.equal(result.success, false);
});

test('a metric with an empty value is rejected', () => {
  const result = projectSchema.safeParse(
    baseProject({ metrics: [{ label: 'Test cases', value: '' }] }),
  );
  assert.equal(result.success, false);
});

test('a technology with a bare-domain icon url is normalised to https', () => {
  const result = techSchema.safeParse({
    name: 'Python',
    category: 'backend',
    sort_order: 50,
    is_published: true,
    icon_url: 'cdn.example.com/python.svg',
  });
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.icon_url, 'https://cdn.example.com/python.svg');
  }
});
