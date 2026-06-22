"use client";

import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthField, AuthSubmit, AuthSwitch } from "@/components/auth/AuthForm";

export default function LoginPage() {
  const router = useRouter();
  return (
    <AuthShell>
      <header className="mb-7">
        <h1 className="font-serif font-semibold tracking-tight text-[1.9rem] text-[color:var(--text)]">
          Welcome back.
        </h1>
        <p className="mt-2 text-[color:var(--text-2)] text-[0.95rem]">
          Pick up where you left off.
        </p>
      </header>

      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          router.push("/");
        }}
      >
        <AuthField
          id="email"
          label="Email"
          type="email"
          placeholder="you@uni.ac.ug"
          autoComplete="email"
        />
        <AuthField
          id="password"
          label="Password"
          type="password"
          placeholder="Your password"
          autoComplete="current-password"
        />
        <AuthSubmit>Log in</AuthSubmit>
      </form>

      <AuthSwitch
        prompt="New to Sikia Law?"
        linkLabel="Create an account"
        href="/signup"
      />
    </AuthShell>
  );
}
