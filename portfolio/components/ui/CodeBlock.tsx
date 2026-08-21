import { codeToHtml } from 'shiki';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

export async function CodeBlock({ code, language = 'typescript', className }: CodeBlockProps) {
  // Use a light theme to contrast with the warm-gray background
  const html = await codeToHtml(code, {
    lang: language,
    theme: 'vitesse-light', 
  });

  return (
    <div 
      className={cn(
        'bg-[#EFF2EE] border border-warm-gray-200 overflow-x-auto',
        'p-[18px] sm:px-[20px]',
        className
      )}
    >
      <div 
        className="font-mono text-[12.5px] leading-[1.7]"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
