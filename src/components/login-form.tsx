"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function sendCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: false },
    });

    if (error) {
      setIsError(true);
      setMessage(error.message);
    } else {
      setStep("code");
      setMessage(`We sent an eight-digit sign-in code to ${email.trim()}.`);
    }

    setLoading(false);
  }

  async function verifyCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);

    const supabase = createClient();
    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: "email",
    });

    if (error) {
      setIsError(true);
      setMessage(error.message);
      setLoading(false);
      return;
    }

    const destination = data.user?.app_metadata?.role === "admin" ? "/admin" : "/dashboard";
    window.location.assign(destination);
  }

  if (step === "code") {
    return (
      <form className="login-form" data-clarity-mask="true" onSubmit={verifyCode}>
        <label>
          Eight-digit email code
          <input
            type="text"
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 8))}
            required
            minLength={8}
            maxLength={8}
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{8}"
            placeholder="12345678"
            autoFocus
          />
        </label>
        <button className="button gold" disabled={loading || code.length !== 8}>
          {loading ? "Signing in…" : "Sign in securely"}
        </button>
        {message && <p role={isError ? "alert" : "status"}>{message}</p>}
        <button
          className="text-link"
          type="button"
          onClick={() => {
            setStep("email");
            setCode("");
            setMessage("");
            setIsError(false);
          }}
        >
          Use a different email ↗
        </button>
      </form>
    );
  }

  return (
    <form className="login-form" data-clarity-mask="true" onSubmit={sendCode}>
      <label>
        Email address
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoComplete="email"
          placeholder="you@example.com"
        />
      </label>
      <button className="button gold" disabled={loading}>
        {loading ? "Sending…" : "Email me a sign-in code"}
      </button>
      {message && <p role={isError ? "alert" : "status"}>{message}</p>}
    </form>
  );
}
