import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  cn,
  UI_VERSION,
  Button,
  Card,
  Dialog,
  Input,
  Textarea,
  Tabs,
  Switch,
  ScrollArea,
  RecordingIndicator,
} from './index.js';

describe('UI Package (@promptvox/ui)', () => {
  it('exports UI_VERSION and cn utility correctly', () => {
    assert.strictEqual(UI_VERSION, '0.1.0');
    const combinedClass = cn('px-2 py-1', 'bg-blue-500', { 'text-white': true });
    assert.strictEqual(combinedClass, 'px-2 py-1 bg-blue-500 text-white');
  });

  it('exports all specified shadcn components and RecordingIndicator', () => {
    assert.ok(Button, 'Button should be exported');
    assert.ok(Card, 'Card should be exported');
    assert.ok(Dialog, 'Dialog should be exported');
    assert.ok(Input, 'Input should be exported');
    assert.ok(Textarea, 'Textarea should be exported');
    assert.ok(Tabs, 'Tabs should be exported');
    assert.ok(Switch, 'Switch should be exported');
    assert.ok(ScrollArea, 'ScrollArea should be exported');
    assert.ok(RecordingIndicator, 'RecordingIndicator should be exported');
  });
});
