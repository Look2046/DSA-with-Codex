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

describe('StackPage linked-stack preview connector', () => {
  it('renders a visual arrow without the old s.next -> top text label', () => {
    const LinkPreview = (
      StackPageModule as {
        LinkedStackLinkPreview?: ComponentType<{ path: string }>;
      }
    ).LinkedStackLinkPreview;

    expect(LinkPreview).toBeDefined();
    if (!LinkPreview) {
      return;
    }

    const html = renderToStaticMarkup(<LinkPreview path="M 10 20 C 10 40, 60 50, 60 70" />);
    expect(html).toContain('linked-stack-link-preview');
    expect(html).toContain('linked-stack-link-preview-path');
    expect(html).toContain('linked-stack-link-preview-arrowhead');
    expect(html).not.toContain('s.next');
    expect(html).not.toContain('top');
  });

  it('builds a curved path from the floating node side midpoint to the old top node side midpoint', () => {
    const buildPath = (
      StackPageModule as {
        buildLinkedStackConnectorPath?: (start: { x: number; y: number }, end: { x: number; y: number }) => string;
      }
    ).buildLinkedStackConnectorPath;

    expect(buildPath).toBeDefined();
    if (!buildPath) {
      return;
    }

    const path = buildPath({ x: 120, y: 80 }, { x: 40, y: 20 });
    expect(path).toContain('M 120 80');
    expect(path).toContain('C');
    expect(path.endsWith('40 20')).toBe(true);
  });

  it('anchors the preview from the left side of s to the right side of the old top node', () => {
    const getPoints = (
      StackPageModule as {
        getLinkedStackPreviewConnectorPoints?: (
          sceneRect: { left: number; top: number },
          floatingRect: { left: number; top: number; right: number; height: number },
          targetRect: { top: number; right: number; height: number },
          zoom?: number,
        ) => { start: { x: number; y: number }; end: { x: number; y: number } };
      }
    ).getLinkedStackPreviewConnectorPoints;

    expect(getPoints).toBeDefined();
    if (!getPoints) {
      return;
    }

    const points = getPoints(
      { left: 100, top: 40 },
      { left: 500, right: 580, top: 180, height: 48 },
      { right: 310, top: 150, height: 48 },
    );

    expect(points.start.x).toBe(390);
    expect(points.start.y).toBe(164);
    expect(points.end.x).toBe(220);
    expect(points.end.y).toBe(134);
    expect(points.start.x).toBeGreaterThan(points.end.x);
  });
});
