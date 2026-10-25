import React from "react";
import GoldDivider from "@/components/GoldDivider";

const SUBSTACK_EMBED_SRC = "https://laurelcrownsabove.substack.com/embed";

/**
 * Newsletter signup panel wrapping the Substack embed for laurelcrownsabove.substack.com.
 * Deep twilight panel, cream text, gold accent, serif heading.
 * The embed is a cross-origin iframe, so it is rendered through the invert filter on
 * .archive-signup-frame (see index.css) to sit on the dark field instead of Substack's white card.
 */
const NewsletterSignup = ({ className = "" }: { className?: string }) => (
  <div className={`text-center ${className}`}>
    <div
      className="mx-auto px-3 pt-9 pb-7 sm:px-5"
      style={{
        maxWidth: "560px",
        background: "hsl(var(--stone-deep))",
        border: "1px solid hsl(var(--candlelight) / 0.32)",
        boxShadow:
          "0 0 34px hsl(var(--candlelight) / 0.07), inset 0 0 70px hsl(250 20% 6% / 0.55)",
      }}
    >
      <p
        className="font-display text-lg sm:text-xl tracking-[0.2em] uppercase"
        style={{ color: "hsl(var(--candlelight))", fontWeight: 400 }}
      >
        <span className="mx-2 sm:mx-3 align-middle" style={{ letterSpacing: "0", fontSize: "0.6em", opacity: 0.75 }}>
          ◆
        </span>
        Receive the Archive
        <span className="mx-2 sm:mx-3 align-middle" style={{ letterSpacing: "0", fontSize: "0.6em", opacity: 0.75 }}>
          ◆
        </span>
      </p>

      <p
        className="mt-3 font-narrative text-[0.9375rem] leading-[1.8] mx-auto"
        style={{ color: "hsl(var(--vellum) / 0.78)", maxWidth: "44ch" }}
      >
        New fragments, chapters and sealed records from Elysii, sent by the Sanctorium.
      </p>

      <GoldDivider className="max-w-[150px] mx-auto my-5" />

      <div
        style={{
          maxWidth: "480px",
          margin: "0 auto",
          border: "1px solid hsl(var(--candlelight) / 0.22)",
          background: "hsl(var(--background))",
        }}
      >
        <iframe
          className="archive-signup-frame"
          src={SUBSTACK_EMBED_SRC}
          title="Subscribe to the Laurel Crowns Above newsletter on Substack"
          width="100%"
          frameBorder="0"
          scrolling="no"
          loading="lazy"
        />
      </div>
    </div>
  </div>
);

export default NewsletterSignup;
