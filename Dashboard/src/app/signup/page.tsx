"use client";

import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import {
  AuthField,
  AuthSelect,
  AuthSubmit,
  AuthSwitch,
} from "@/components/auth/AuthForm";

export default function SignupPage() {
  const router = useRouter();
  return (
    <AuthShell>
      <header className="mb-7">
        <h1 className="font-serif font-semibold tracking-tight text-[1.9rem] text-[color:var(--text)]">
          Join in thirty seconds.
        </h1>
        <p className="mt-2 text-[color:var(--text-2)] text-[0.95rem]">
          Create your account and start studying.
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
          id="name"
          label="Full name"
          placeholder="e.g. Amelia Mutebi"
          autoComplete="name"
        />
        <AuthField
          id="email"
          label="University email"
          type="email"
          placeholder="you@uni.ac.ug"
          autoComplete="email"
        />
        <div className="grid grid-cols-2 gap-4">
          <AuthSelect id="year" label="Year of study">
            <option value="">Pick a year</option>
            <option>Year 1</option>
            <option>Year 2</option>
            <option>Year 3</option>
            <option>Year 4</option>
          </AuthSelect>
          <AuthSelect id="university" label="University">
            <option value="">Pick one</option>
            <option>Makerere University</option>
            <option>Uganda Christian University</option>
            <option>Nkumba University</option>
            <option>Other</option>
          </AuthSelect>
        </div>
        <AuthField
          id="password"
          label="Password"
          type="password"
          placeholder="Minimum 8 characters"
          autoComplete="new-password"
        />
        <AuthSubmit>Create account</AuthSubmit>
      </form>

      <AuthSwitch
        prompt="Already have an account?"
        linkLabel="Log in"
        href="/login"
      />
    </AuthShell>
  );
}
