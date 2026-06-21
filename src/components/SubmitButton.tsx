"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  pendingText?: string;
}

export function SubmitButton({ children, pendingText, className, ...props }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      {...props}
      disabled={pending || props.disabled}
      className={`flex items-center justify-center transition-all ${className} ${pending ? "opacity-70 cursor-not-allowed" : ""}`}
    >
      {pending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {pending && pendingText ? pendingText : children}
    </button>
  );
}
