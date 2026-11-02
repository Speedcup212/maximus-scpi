import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// A lightweight hook harness exercises the real modal callbacks in the Node test
// environment (the project does not depend on jsdom/testing-library).
const hooks = vi.hoisted(() => ({
  index: 0,
  states: [] as unknown[],
  refs: [] as Array<{ current: unknown }>,
  effects: [] as Array<{ deps?: readonly unknown[]; cleanup?: () => void } | undefined>,
}));

vi.mock('react', async importOriginal => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    useState(initial: unknown) {
      const index = hooks.index++;
      if (!(index in hooks.states)) {
        hooks.states[index] = typeof initial === 'function'
          ? (initial as () => unknown)() : initial;
      }
      return [hooks.states[index], (next: unknown) => {
        hooks.states[index] = typeof next === 'function'
          ? (next as (previous: unknown) => unknown)(hooks.states[index]) : next;
      }];
    },
    useRef(initial: unknown) {
      const index = hooks.index++;
      if (!hooks.refs[index]) hooks.refs[index] = { current: initial };
      return hooks.refs[index];
    },
    useMemo(factory: () => unknown) {
      hooks.index++;
      return factory();
    },
    useEffect(effect: () => void | (() => void), deps?: readonly unknown[]) {
      const index = hooks.index++;
      const previous = hooks.effects[index];
      const changed = !previous || !deps || !previous.deps ||
        deps.length !== previous.deps.length ||
        deps.some((value, i) => !Object.is(value, previous.deps?.[i]));
      if (!changed) return;
      previous?.cleanup?.();
      const cleanup = effect();
      hooks.effects[index] = {
        deps, cleanup: typeof cleanup === 'function' ? cleanup : undefined,
      };
    },
  };
});

vi.mock('../utils/leadSubmitter', () => ({ submitLead: vi.fn() }));
vi.mock('../utils/funnelAnalytics', () => ({ trackFunnelEvent: vi.fn() }));
vi.mock('../utils/calendlyPopup', () => ({ openCalendlyPopup: vi.fn() }));

type Node = { type: unknown; props: Record<string, any> };
function findNode(root: unknown, type: string): Node | null {
  if (Array.isArray(root)) {
    for (const item of root) {
      const found = findNode(item, type);
      if (found) return found;
    }
    return null;
  }
  if (!root || typeof root !== 'object') return null;
  const element = root as Node;
  if (element.type === type) return element;
  return findNode(element.props?.children, type);
}

describe('RdvModal — Calendly popup lifecycle', () => {
  let Modal: typeof import('../components/RdvModal').default;
  let submitLead: typeof import('../utils/leadSubmitter').submitLead;
  let openCalendlyPopup: typeof import('../utils/calendlyPopup').openCalendlyPopup;
  let trackFunnelEvent: typeof import('../utils/funnelAnalytics').trackFunnelEvent;
  let onClose: ReturnType<typeof vi.fn>;
  let isOpen: boolean;
  let overlayVisible: boolean;
  let callbacks: Array<() => void>;
  let messages: Set<(event: MessageEvent) => void>;
  let observers: Array<{
    notify: MutationCallback;
    observe: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
  }>;

  function render() {
    hooks.index = 0;
    return Modal({ isOpen, onClose });
  }

  async function chooseCalendly() {
    const form = findNode(render(), 'form');
    expect(form).not.toBeNull();
    await form!.props.onSubmit({
      preventDefault: vi.fn(),
      nativeEvent: { submitter: { value: 'calendly' } },
    });
    return render();
  }

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    hooks.index = 0;
    hooks.states.length = 0;
    hooks.refs.length = 0;
    hooks.effects.length = 0;
    isOpen = true;
    overlayVisible = false;
    callbacks = [];
    messages = new Set();
    observers = [];
    onClose = vi.fn();

    const storage = new Map<string, string>();
    vi.stubGlobal('sessionStorage', {
      getItem: vi.fn((key: string) => storage.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => storage.set(key, value)),
      removeItem: vi.fn((key: string) => storage.delete(key)),
    });
    vi.stubGlobal('window', {
      location: {
        pathname: '/contact',
        search: '',
        href: 'https://maximusscpi.com/contact',
      },
      addEventListener: vi.fn((name: string, handler: (event: MessageEvent) => void) => {
        if (name === 'message') messages.add(handler);
      }),
      removeEventListener: vi.fn((name: string, handler: (event: MessageEvent) => void) => {
        if (name === 'message') messages.delete(handler);
      }),
      setTimeout: vi.fn((callback: () => void) => {
        callbacks.push(callback);
        return callbacks.length;
      }),
    });
    vi.stubGlobal('document', {
      body: {},
      querySelector: vi.fn((selector: string) =>
        selector === '.calendly-overlay' && overlayVisible ? {} : null),
    });

    class TestMutationObserver {
      notify: MutationCallback;
      observe = vi.fn();
      disconnect = vi.fn();
      constructor(callback: MutationCallback) {
        this.notify = callback;
        observers.push(this);
      }
    }
    vi.stubGlobal('MutationObserver', TestMutationObserver);

    ({ default: Modal } = await import('../components/RdvModal'));
    ({ submitLead } = await import('../utils/leadSubmitter'));
    ({ openCalendlyPopup } = await import('../utils/calendlyPopup'));
    ({ trackFunnelEvent } = await import('../utils/funnelAnalytics'));
    vi.mocked(submitLead).mockResolvedValue({ ok: true, request_id: 'lead-1' });
    vi.mocked(openCalendlyPopup).mockImplementation(async () => {
      overlayVisible = true;
    });
  });

  afterEach(() => {
    for (const effect of hooks.effects) effect?.cleanup?.();
    vi.unstubAllGlobals();
  });

  it('hides its form but stays mounted and listening, without onClose', async () => {
    const hidden = await chooseCalendly();
    expect(hidden).toBeNull();
    expect(openCalendlyPopup).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
    expect(messages.size).toBe(1);
    expect(observers).toHaveLength(1);
    expect(observers[0].observe).toHaveBeenCalledWith(document.body, {
      childList: true, subtree: true,
    });
  });

  it('records one booking and redirects after calendly.event_scheduled while hidden', async () => {
    expect(await chooseCalendly()).toBeNull();
    for (const handler of messages) {
      handler({ origin: 'https://calendly.com', data: { event: 'calendly.event_scheduled' } } as MessageEvent);
      handler({ origin: 'https://calendly.com', data: { event: 'calendly.event_scheduled' } } as MessageEvent);
    }
    const bookings = vi.mocked(trackFunnelEvent).mock.calls.filter(
      ([name]) => name === 'calendly_booking_completed',
    );
    expect(bookings).toHaveLength(1);
    expect(bookings[0][1]).toMatchObject({ lead_request_id: 'lead-1', action: 'calendly' });
    expect(callbacks).toHaveLength(1);
    overlayVisible = false;
    observers[0].notify([], {} as MutationObserver);
    expect(onClose).not.toHaveBeenCalled();
    callbacks[0]();
    expect(window.location.href).toBe('/merci-landing-page.html?source=calendly');
  });

  it('closes exactly once without booking and can reopen the form', async () => {
    expect(await chooseCalendly()).toBeNull();
    overlayVisible = false;
    observers[0].notify([], {} as MutationObserver);
    observers[0].notify([], {} as MutationObserver);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(observers[0].disconnect).toHaveBeenCalled();
    isOpen = false;
    expect(render()).toBeNull();
    isOpen = true;
    expect(findNode(render(), 'form')).not.toBeNull();
  });

  it('preserves location.href fallback when Calendly fails to open', async () => {
    vi.mocked(openCalendlyPopup).mockRejectedValueOnce(new Error('Widget unavailable'));
    const form = await chooseCalendly();
    expect(findNode(form, 'form')).not.toBeNull();
    expect(window.location.href).toContain('https://calendly.com/');
    expect(onClose).not.toHaveBeenCalled();
    expect(observers).toHaveLength(0);
  });
});
