import { Check, X } from 'lucide-react';
import { getPasswordChecks } from '../lib/authDemo';

interface PasswordChecklistProps {
  password: string;
}

export function PasswordChecklist({ password }: PasswordChecklistProps) {
  const checks = getPasswordChecks(password);
  const passedCount = checks.filter((check) => check.passed).length;

  return (
    <div className="rounded-2xl border border-line bg-canvas/70 p-4">
      <p className="text-xs font-semibold text-ink">
        ผ่าน {passedCount} จาก {checks.length} เงื่อนไข
      </p>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2" aria-label="เงื่อนไขรหัสผ่าน">
        {checks.map((check) => (
          <li key={check.label} className="flex items-center gap-2 text-xs text-muted">
            {check.passed ? (
              <Check aria-hidden="true" className="h-4 w-4 shrink-0 text-brand" />
            ) : (
              <X aria-hidden="true" className="h-4 w-4 shrink-0 text-coral" />
            )}
            <span>{check.label}</span>
            <span className="sr-only">{check.passed ? 'ผ่านแล้ว' : 'ยังไม่ผ่าน'}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
