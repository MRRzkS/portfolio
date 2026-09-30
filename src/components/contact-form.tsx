"use client";
import { useState, type FormEvent } from "react";
import { ArrowUpRight, Check, Info, Copy } from "lucide-react";
import { profile } from "@/lib/content";
export function ContactForm() {
  const [values, setValues] = useState({ name: "", email: "", message: "" });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [draftOpened, setDraftOpened] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const errors = {
    name:
      values.name.trim().length < 2
        ? "Please enter at least two characters."
        : "",
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)
      ? ""
      : "Please enter a valid email address.",
    message:
      values.message.trim().length < 20
        ? "Use at least 20 characters."
        : "",
  };
  const valid = Object.values(errors).every((error) => !error);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched({ name: true, email: true, message: true });
    if (!valid) return;
    const subject = encodeURIComponent(
      `Portfolio inquiry from ${values.name.trim()}`,
    );
    const body = encodeURIComponent(
      `${values.message.trim()}\n\nFrom: ${values.name.trim()}\nReply to: ${values.email.trim()}`,
    );
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
    setDraftOpened(true);
  }
  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopyStatus("Email copied");
    } catch {
      setCopyStatus(`Copy manually: ${profile.email}`);
    }
  }
  return (
    <div className="contact-form-wrapper">
      <div className="form-heading">
        <h2>Start a conversation.</h2>
        <span className="eyebrow">A FEW WORDS WILL DO</span>
      </div>
      <form noValidate onSubmit={submit}>
        {(["name", "email", "message"] as const).map((field) => {
          const hasError = touched[field] && errors[field];
          const good = values[field] && !errors[field];
          return (
            <div className="form-field" key={field}>
              <label htmlFor={field}>
                {field === "name"
                  ? "Your name"
                  : field === "email"
                    ? "Email address"
                    : "What are you thinking?"}
              </label>
              <div className="input-wrap">
                {field === "message" ? (
                  <textarea
                    id={field}
                    name={field}
                    rows={5}
                    maxLength={3000}
                    placeholder="Tell me about a role, a project, or your idea."
                    value={values[field]}
                    required
                    aria-invalid={Boolean(hasError)}
                    aria-describedby={`${field}-status`}
                    onChange={(event) => {
                      setValues({ ...values, [field]: event.target.value });
                      setDraftOpened(false);
                    }}
                    onBlur={() => setTouched({ ...touched, [field]: true })}
                  />
                ) : (
                  <input
                    id={field}
                    name={field}
                    type={field === "email" ? "email" : "text"}
                    autoComplete={field}
                    maxLength={field === "name" ? 100 : 254}
                    placeholder={
                      field === "name"
                        ? "What is your name?"
                        : "you@example.com"
                    }
                    value={values[field]}
                    required
                    aria-invalid={Boolean(hasError)}
                    aria-describedby={`${field}-status`}
                    onChange={(event) => {
                      setValues({ ...values, [field]: event.target.value });
                      setDraftOpened(false);
                    }}
                    onBlur={() => setTouched({ ...touched, [field]: true })}
                  />
                )}{" "}
                {good ? <Check size={16} className="input-check" /> : null}
              </div>
              <p
                id={`${field}-status`}
                className={`field-status ${hasError ? "field-error" : ""}`}
                aria-live="polite"
              >
                {hasError ||
                  (field === "message"
                    ? `${values.message.length} / 3,000 characters`
                    : " ")}
              </p>
            </div>
          );
        })}
        <button type="submit" className="action-link primary form-submit">
          Open email draft <ArrowUpRight size={16} />
        </button>
        <details className="form-help help-panel">
          <summary><Info size={16} /> How sending works</summary>
          <p>This opens a draft in your email app. You can review the message and send it from there.</p>
        </details>
        {draftOpened ? (
          <div className="draft-status" role="status">
            Your email app was requested. If it didn’t open, email me directly
            at <a href={`mailto:${profile.email}`}>{profile.email}</a>.
          </div>
        ) : null}
      </form>
      <div className="copy-email">
        <span>Prefer a direct email?</span>
        <button onClick={copyEmail}>
          {profile.email} <Copy size={14} />
        </button>
        <span aria-live="polite">{copyStatus}</span>
      </div>
    </div>
  );
}
