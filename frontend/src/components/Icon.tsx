import type { ReactNode } from 'react';

const PATHS: Record<string, ReactNode> = {
  copy: (<><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h9" /></>),
  calendar: (<><rect x="3.5" y="5" width="17" height="15" rx="2" /><path d="M3.5 10h17M8 3v4M16 3v4" /></>),
  trash: (<><path d="M4 7h16M10 11v6M14 11v6" /><path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" /></>),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  external: (<><path d="M14 4h6v6M20 4l-9 9" /><path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" /></>),
  logout: (<><path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" /><path d="M16 8l4 4-4 4M20 12H9" /></>),
  refresh: (<><path d="M20 11a8 8 0 0 0-14.5-4.2L4 9" /><path d="M4 4v5h5M4 13a8 8 0 0 0 14.5 4.2L20 15" /><path d="M20 20v-5h-5" /></>),
  alert: (<><path d="M12 4l9.5 16h-19L12 4z" /><path d="M12 10v4.5M12 17.5v.01" /></>),
  link: (<><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></>),
  inbox: (<><path d="M3.5 13l2.7-7.2A2 2 0 0 1 8 4.5h8a2 2 0 0 1 1.8 1.3L20.5 13" /><path d="M3.5 13v5a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-5h-5l-1.5 2h-4L8.5 13h-5z" /></>),
  clock: (<><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>),
};

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 16 }: { name: IconName; size?: number }) {
  return (
    <svg
      aria-hidden="true" focusable="false" width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
    >
      {PATHS[name]}
    </svg>
  );
}
