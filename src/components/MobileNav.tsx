import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { NavItem } from '../data/navigation';
import { WHATSAPP_ICON_PATH } from './icons/whatsapp-path';

interface Props {
  navigation: NavItem[];
  whatsappHref: string;
  schedulingUrl: string;
}

export default function MobileNav({ navigation, whatsappHref, schedulingUrl }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  // Need to wait for client mount before using portals
  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  const panel = (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-[9998] bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Slide-out panel */}
      <div
        className={`fixed inset-y-0 left-0 z-[9999] w-full max-w-sm transform bg-white shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
          <img src="/images/site/logo-bendov.png" alt="Bendov Clínica Estética" className="h-7 w-auto" />
          <button
            onClick={() => setIsOpen(false)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-800"
            aria-label="Cerrar menú"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex h-[calc(100%-65px)] flex-col overflow-y-auto px-6 pb-6 pt-4">
          <nav className="flex-1">
            <ul className="space-y-1">
              {navigation.map((item) => (
                <li key={item.label}>
                  {item.children ? (
                    <div>
                      <button
                        onClick={() => toggleExpanded(item.label)}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-base font-medium text-neutral-800 transition-colors hover:bg-neutral-50"
                      >
                        {item.label}
                        <svg
                          className={`h-4 w-4 text-neutral-400 transition-transform duration-200 ${
                            expandedItems.has(item.label) ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      </button>
                      <div
                        className={`overflow-hidden transition-all duration-200 ${
                          expandedItems.has(item.label) ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                        }`}
                      >
                        <ul className="ml-4 space-y-0.5 border-l-2 border-neutral-100 py-1">
                          {item.children.map((child) =>
                            child.children ? (
                              /* Level 2: sub-accordion (e.g. pillar with procedures) */
                              <li key={child.label}>
                                <button
                                  onClick={() => toggleExpanded(child.label)}
                                  className="flex w-full items-center justify-between rounded-lg px-4 py-2 text-left text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
                                >
                                  {child.label}
                                  <svg
                                    className={`h-3.5 w-3.5 text-neutral-400 transition-transform duration-200 ${
                                      expandedItems.has(child.label) ? 'rotate-180' : ''
                                    }`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                  </svg>
                                </button>
                                <div
                                  className={`overflow-hidden transition-all duration-200 ${
                                    expandedItems.has(child.label) ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'
                                  }`}
                                >
                                  <ul className="ml-4 space-y-0.5 border-l-2 border-neutral-100 py-1">
                                    {child.children.map((grandchild) => (
                                      <li key={grandchild.label}>
                                        <a
                                          href={grandchild.href}
                                          className={`block rounded-lg px-4 py-1.5 text-sm transition-colors hover:bg-neutral-50 hover:text-primary-700 ${
                                            grandchild.label.startsWith('Ver todos')
                                              ? 'font-semibold text-primary-600'
                                              : 'text-neutral-600'
                                          }`}
                                          onClick={() => setIsOpen(false)}
                                        >
                                          {grandchild.label}
                                        </a>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </li>
                            ) : (
                              /* Level 2: simple link (e.g. pillar without sub-procedures) */
                              <li key={child.label}>
                                <a
                                  href={child.href}
                                  className="block rounded-lg px-4 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-primary-700"
                                  onClick={() => setIsOpen(false)}
                                >
                                  {child.label}
                                </a>
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <a
                      href={item.href}
                      className="block rounded-lg px-3 py-3 text-base font-medium text-neutral-800 transition-colors hover:bg-neutral-50"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* CTAs */}
          <div className="mt-6 flex flex-col gap-3 border-t border-neutral-100 pt-6">
            <a
              href={schedulingUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-gtm="cta-scheduling"
              data-gtm-location="mobile-nav"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-primary-600 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-primary-700"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              Agenda tu Evaluación
            </a>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              data-gtm="cta-whatsapp"
              data-gtm-location="mobile-nav"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25d366] px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-[#20bd5a]"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d={WHATSAPP_ICON_PATH} />
              </svg>
              Escríbenos por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Hamburger button — stays in the header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative z-[10000] flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-neutral-100"
        aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={isOpen}
      >
        <div className="flex w-5 flex-col gap-1">
          <span
            className={`block h-0.5 rounded-full bg-neutral-800 transition-all duration-300 ${
              isOpen ? 'translate-y-1.5 rotate-45' : ''
            }`}
          />
          <span
            className={`block h-0.5 rounded-full bg-neutral-800 transition-all duration-300 ${
              isOpen ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`block h-0.5 rounded-full bg-neutral-800 transition-all duration-300 ${
              isOpen ? '-translate-y-1.5 -rotate-45' : ''
            }`}
          />
        </div>
      </button>

      {/* Portal: render overlay + panel at document.body root */}
      {mounted && createPortal(panel, document.body)}
    </>
  );
}
