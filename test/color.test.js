import { test, expect } from 'bun:test';
import { calculateContrast, parseColor, relativeLuminance } from '../src/utils/color.js';

test('parseColor - RGB format', () => {
  const result = parseColor('rgb(255, 0, 0)');
  expect(result).toEqual({ r: 255, g: 0, b: 0 });
});

test('parseColor - RGBA format', () => {
  const result = parseColor('rgba(0, 255, 0, 0.5)');
  expect(result).toEqual({ r: 0, g: 255, b: 0 });
});

test('parseColor - Hex format', () => {
  const result = parseColor('#0000ff');
  expect(result).toEqual({ r: 0, g: 0, b: 255 });
});

test('parseColor - Short hex format', () => {
  const result = parseColor('#f0f');
  expect(result).toEqual({ r: 255, g: 0, b: 255 });
});

test('relativeLuminance - White', () => {
  const white = relativeLuminance({ r: 255, g: 255, b: 255 });
  expect(white).toBeCloseTo(1, 2);
});

test('relativeLuminance - Black', () => {
  const black = relativeLuminance({ r: 0, g: 0, b: 0 });
  expect(black).toBe(0);
});

test('calculateContrast - Black on White', () => {
  const contrast = calculateContrast('#000000', '#ffffff');
  expect(contrast).toBeCloseTo(21, 1);
});

test('calculateContrast - White on Black', () => {
  const contrast = calculateContrast('#ffffff', '#000000');
  expect(contrast).toBeCloseTo(21, 1);
});

test('calculateContrast - Gray on White', () => {
  const contrast = calculateContrast('rgb(128, 128, 128)', 'rgb(255, 255, 255)');
  expect(contrast).toBeGreaterThan(3);
  expect(contrast).toBeLessThan(5);
});

test('calculateContrast - Same colors', () => {
  const contrast = calculateContrast('#ff0000', '#ff0000');
  expect(contrast).toBeCloseTo(1, 1);
});
