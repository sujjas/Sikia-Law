"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const FIELD_STYLE: React.CSSProperties = {
  width: "100%",
  padding: "11px 13px",
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--line)",
  background: "var(--surface)",
  color: "var(--text)",
  fontSize: "0.95rem",
  outline: "none",
};

export function AuthField({
  id,
  label,
  type = "text",
  placeholder,
  autoComplete,
}: {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (show ? "text" : "password") : type;
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="font-sans font-medium text-[0.85rem] text-[color:var(--text-2)]"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={inputType}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="auth-input"
          style={{
            ...FIELD_STYLE,
            paddingRight: isPassword ? 42 : 13,
          }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute top-1/2 right-2.5 -translate-y-1/2 flex items-center justify-center cursor-pointer"
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: "transparent",
              border: 0,
              color: "var(--text-3)",
            }}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  );
}

export function AuthSelect({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="font-sans font-medium text-[0.85rem] text-[color:var(--text-2)]"
      >
        {label}
      </label>
      <select id={id} name={id} className="auth-input" style={FIELD_STYLE}>
        {children}
      </select>
    </div>
  );
}

export function AuthSubmit({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="submit"
      className="w-full font-sans font-semibold cursor-pointer transition-opacity hover:opacity-90"
      style={{
        marginTop: 4,
        padding: "12px 16px",
        borderRadius: "var(--radius-md)",
        background: "var(--orange)",
        color: "#fff",
        border: 0,
        fontSize: "0.96rem",
      }}
    >
      {children}
    </button>
  );
}

export function AuthSwitch({
  prompt,
  linkLabel,
  href,
}: {
  prompt: string;
  linkLabel: string;
  href: string;
}) {
  return (
    <p className="text-center text-[0.9rem] text-[color:var(--text-2)] mt-6">
      {prompt}{" "}
      <Link
        href={href}
        className="font-medium no-underline"
        style={{ color: "var(--orange-dark)" }}
      >
        {linkLabel}
      </Link>
    </p>
  );
}
