import React, { useState, useRef, useEffect, useCallback } from "react";
import { postEducationalChat } from "../api/chat";

export default function EducationalChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fabRef = useRef(null);
  const inputRef = useRef(null);
  const panelId = "edu-chat-panel";
  const titleId = "edu-chat-title";

  const close = useCallback(() => {
    setOpen(false);
    setError(null);
    requestAnimationFrame(() => {
      fabRef.current?.focus();
    });
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [open, close]);

  async function handleSend(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setError(null);
    const userMsg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    try {
      const { reply } = await postEducationalChat({ message: text, history });
      setMessages((prev) => [...prev, { role: "assistant", content: reply || "" }]);
    } catch (err) {
      setError(err.message || "Something went wrong.");
      setMessages((prev) => prev.slice(0, -1));
    }
    setLoading(false);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  return (
    <div className="edu-chat">
      {open && (
        <div
          className="edu-chat__panel"
          id={panelId}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <div className="edu-chat__header">
            <h2 id={titleId} className="edu-chat__title">
              Education assistant
            </h2>
            <button
              type="button"
              className="edu-chat__close"
              onClick={close}
              aria-label="Close chat"
            >
              ×
            </button>
          </div>
          <p className="edu-chat__subtitle">
            Ask about teaching, learning, and classroom practice. Other topics are not supported.
          </p>
          <div className="edu-chat__messages" role="log" aria-live="polite" aria-relevant="additions">
            {messages.length === 0 && !loading && (
              <p className="edu-chat__empty">Try: “How can I check for understanding with ELL students?”</p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`edu-chat__bubble edu-chat__bubble--${m.role === "user" ? "user" : "assistant"}`}
              >
                {m.content}
              </div>
            ))}
            {loading && <div className="edu-chat__bubble edu-chat__bubble--assistant edu-chat__typing">Thinking…</div>}
          </div>
          {error && <p className="edu-chat__error">{error}</p>}
          <form className="edu-chat__form" onSubmit={handleSend}>
            <label htmlFor="edu-chat-input" className="visually-hidden">
              Your question
            </label>
            <input
              id="edu-chat-input"
              ref={inputRef}
              className="edu-chat__input auth-input"
              placeholder="Type an education-related question…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              autoComplete="off"
            />
            <button type="submit" className="btn btn--resume edu-chat__send" disabled={loading || !input.trim()}>
              Send
            </button>
          </form>
        </div>
      )}

      <button
        ref={fabRef}
        type="button"
        className="edu-chat__fab"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close education assistant" : "Open education assistant chat"}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
      >
        <span className="edu-chat__fab-icon" aria-hidden>
          {open ? "✕" : "💬"}
        </span>
        <span className="edu-chat__fab-label">{open ? "Close" : "Chat Bot"}</span>
      </button>
    </div>
  );
}
