import { useEffect, useRef, useState } from 'react';

type Listener = (visible: boolean) => void;
const listeners = new Map<Element, Listener>();
const visible = new Set<Element>();
let observer: IntersectionObserver | undefined;

function updateVisibility() {
  for (const [element, notify] of listeners) notify(visible.has(element) && !document.hidden);
}

export function observeVisibleMotion(element: Element, notify: Listener) {
  if (typeof IntersectionObserver === 'undefined') {
    const update = () => notify(!document.hidden);
    update();
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }
  if (!observer) {
    observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target); else visible.delete(entry.target);
      }
      updateVisibility();
    });
    document.addEventListener('visibilitychange', updateVisibility);
  }
  listeners.set(element, notify);
  observer.observe(element);
  notify(false);
  return () => {
    observer?.unobserve(element);
    listeners.delete(element);
    visible.delete(element);
    if (!listeners.size) {
      observer?.disconnect(); observer = undefined;
      document.removeEventListener('visibilitychange', updateVisibility);
    }
  };
}

export function useVisibleMotion<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [active, setActive] = useState(false);
  useEffect(() => ref.current ? observeVisibleMotion(ref.current, setActive) : undefined, []);
  return { ref, active };
}
