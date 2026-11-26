import { Check, Copy } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface CopyButtonProps {
  text: string;
}

function fallbackCopy(text: string) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();

  try {
    if (!document.execCommand('copy')) {
      throw new Error('Copy command was rejected');
    }
  } finally {
    textarea.remove();
  }
}

export function CopyButton({ text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    setCopied(false);
    setFailed(false);
    return () => clearTimeout(timer.current);
  }, [text]);

  async function handleCopy() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        fallbackCopy(text);
      }
      setCopied(true);
      setFailed(false);
    } catch {
      try {
        fallbackCopy(text);
        setCopied(true);
        setFailed(false);
      } catch {
        setCopied(false);
        setFailed(true);
      }
    }

    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setCopied(false);
      setFailed(false);
    }, 2400);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/20"
    >
      {copied ? <Check aria-hidden="true" className="h-4 w-4" /> : <Copy aria-hidden="true" className="h-4 w-4" />}
      <span aria-live="polite">{copied ? 'คัดลอกแล้ว' : failed ? 'คัดลอกไม่สำเร็จ' : 'คัดลอกโค้ด'}</span>
    </button>
  );
}
