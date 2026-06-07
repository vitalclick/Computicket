'use client';

import { useEffect, useRef } from 'react';

/**
 * Modal accessibility plumbing:
 *  - Escape closes the dialog.
 *  - Tab cycles within the dialog (focus trap), so keyboard users
 *    don't escape into the page chrome behind a translucent backdrop.
 *  - Initial focus moves into the dialog when it opens.
 *  - On close, focus restores to whatever was focused before opening.
 *
 * Returns a ref to attach to the dialog container.
 */
export function useModalA11y(open: boolean, onClose: () => void) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!open) return;
    triggerRef.current = document.activeElement;

    // Move focus into the dialog. Prefer the first focusable element,
    // falling back to the container itself so keyboard users always
    // land somewhere predictable.
    requestAnimationFrame(() => {
      const root = containerRef.current;
      if (!root) return;
      const first = root.querySelector<HTMLElement>(focusableSelector);
      (first ?? root).focus();
    });

    function focusables(): HTMLElement[] {
      const root = containerRef.current;
      if (!root) return [];
      return Array.from(root.querySelectorAll<HTMLElement>(focusableSelector)).filter(
        (el) => !el.hasAttribute('disabled') && el.offsetParent !== null,
      );
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0]!;
      const last = items[items.length - 1]!;
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      const t = triggerRef.current;
      if (t instanceof HTMLElement) t.focus();
    };
  }, [open, onClose]);

  return containerRef;
}

const focusableSelector =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
