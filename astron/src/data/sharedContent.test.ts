import { describe, expect, it, vi } from 'vitest';
import { sharedLoader } from './sharedContent';

describe('Content reused during a visit', () => {
  it('shares concurrent requests and later navigation without loading again', async () => {
    const content = Object.freeze({ title: 'An atlas' });
    const read = vi.fn(async () => content);
    const load = sharedLoader(read);
    expect(await Promise.all([load(), load()])).toEqual([content, content]);
    expect(await load()).toBe(content);
    expect(read).toHaveBeenCalledOnce();
  });
  it('allows a later navigation to retry a failed request', async () => {
    const read = vi.fn().mockRejectedValueOnce(new Error('Offline before first visit')).mockResolvedValueOnce('ready');
    const load = sharedLoader(read);
    await expect(load()).rejects.toThrow('Offline');
    expect(await load()).toBe('ready');
    expect(read).toHaveBeenCalledTimes(2);
  });
});
