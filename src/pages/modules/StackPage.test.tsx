import type { ComponentType } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import * as StackPageModule from './StackPage';

describe('StackPage full-stack top pointer', () => {
  it('renders a horizontal top pointer that points to null above the sequential stack', () => {
    const OverflowPointer = (
      StackPageModule as {
        SequentialOverflowPointer?: ComponentType<{ topLabel: string; nullLabel: string }>;
      }
    ).SequentialOverflowPointer;

    expect(OverflowPointer).toBeDefined();
    if (!OverflowPointer) {
      return;
    }

    const html = renderToStaticMarkup(<OverflowPointer topLabel="top" nullLabel="null" />);
    const nullIndex = html.indexOf('>null<');
    const arrowIndex = html.indexOf('←');
    const topIndex = html.lastIndexOf('>top<');

    expect(html).toContain('stack-top-pointer-overflow-cell');
    expect(html).not.toContain('↑');
    expect(nullIndex).toBeGreaterThanOrEqual(0);
    expect(arrowIndex).toBeGreaterThan(nullIndex);
    expect(topIndex).toBeGreaterThan(arrowIndex);
  });
});
