import { CircleCheckBig, Info, TriangleAlert } from 'lucide-react';
import type { LessonCallout } from '../types/course';

const toneStyles = {
  info: { label: 'ข้อมูล', className: 'border-brand/20 bg-soft-brand text-brand', Icon: Info },
  warning: { label: 'คำเตือน', className: 'border-coral/25 bg-soft-coral text-coral', Icon: TriangleAlert },
  success: { label: 'สำเร็จ', className: 'border-success-border bg-soft-success text-success', Icon: CircleCheckBig },
} as const;

export function Callout({ tone, title, text }: LessonCallout) {
  const { label, className, Icon } = toneStyles[tone];

  return (
    <aside className={`rounded-xl border p-4 ${className}`}>
      <p className="flex items-center gap-2 text-xs font-semibold">
        <Icon aria-hidden="true" className="h-4 w-4" />
        {label}
      </p>
      <h4 className="mt-2 text-sm font-semibold text-ink">{title}</h4>
      <p className="mt-1 text-sm leading-7 text-ink">{text}</p>
    </aside>
  );
}
