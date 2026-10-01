"use client";

import { AnimatePresence, motion } from "motion/react";
import { type ReactNode, useId, useState } from "react";

type DisclosureProps = {
  title: string;
  meta: string;
  children: ReactNode;
  defaultOpen?: boolean;
};

export function Disclosure({ title, meta, children, defaultOpen = false }: DisclosureProps) {
  const [open, setOpen] = useState(defaultOpen);
  const contentId = useId();

  return (
    <section className="disclosure" data-open={open}>
      <button
        className="disclosure-trigger"
        type="button"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => setOpen((value) => !value)}
      >
        <span><b>{title}</b><small>{meta}</small></span>
        <i aria-hidden="true"><svg viewBox="0 0 20 20"><path d="m6 8 4 4 4-4" /></svg></i>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={contentId}
            className="disclosure-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ height: { duration: .34, ease: [0.22, 1, 0.36, 1] }, opacity: { duration: .2 } }}
          >
            <div>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
