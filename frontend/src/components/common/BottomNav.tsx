
import { Info, List, Map } from 'lucide-react';
import clsx from 'clsx';
import type { ActiveTab } from './Header';

interface BottomNavProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
}

export function BottomNav({
                            activeTab,
                            onChangeTab,
                          }: BottomNavProps) {
  const items: {
    id: ActiveTab;
    label: string;
    icon: typeof Map;
  }[] = [
    { id: 'mapa', label: 'Mapa', icon: Map },
    { id: 'lista', label: 'Lista', icon: List },
    { id: 'sobre', label: 'Sobre', icon: Info },
  ];

  return (
      <nav
          aria-label="Navegação inferior"
          className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/90 bg-white/95 backdrop-blur-md lg:hidden"
      >
        <div className="mx-auto grid h-16 max-w-md grid-cols-3">
          {items.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;

            return (
                <button
                    key={item.id}
                    type="button"
                    aria-current={active ? 'page' : undefined}
                    data-testid={`bottom-nav-${item.id}`}
                    onClick={() => onChangeTab(item.id)}
                    className={clsx(
                        'flex flex-col items-center justify-center gap-1 text-xs font-medium transition focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue-600',
                        active
                            ? 'text-[#0B46A0]'
                            : 'text-slate-500 hover:text-slate-800'
                    )}
                >
                  <div
                      className={clsx(
                          'flex h-7 w-12 items-center justify-center rounded-full transition-colors',
                          active
                              ? 'bg-blue-50 text-[#0B46A0]'
                              : 'bg-transparent'
                      )}
                  >
                    <Icon
                        className="h-4.5 w-4.5"
                        aria-hidden="true"
                    />
                  </div>

                  <span
                      className={clsx(
                          active
                              ? 'font-semibold'
                              : 'font-medium'
                      )}
                  >
                {item.label}
              </span>
                </button>
            );
          })}
        </div>
      </nav>
  );
}
