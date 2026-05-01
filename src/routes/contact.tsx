import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Instagram } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & Custom Orders — SHAKEN" },
      { name: "description", content: "Commission a bespoke bikini inspired by your favourite cocktail. We respond within 48 hours." },
      { property: "og:title", content: "Contact & Custom Orders — SHAKEN" },
      { property: "og:description", content: "Commission a bespoke cocktail-inspired bikini." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [sent, setSent] = useState(false);
  return (
    <div className="bg-olive text-cream">
      <section className="max-w-[1500px] mx-auto px-6 lg:px-12 pt-20 lg:pt-32 text-center">
        <p className="text-[11px] uppercase tracking-luxe text-coral mb-6">Get in touch</p>
        <h1 className="font-serif text-[clamp(3rem,8vw,6.5rem)] leading-[0.95] text-balance max-w-4xl mx-auto">
          Let's <em className="italic">mix</em> something.
        </h1>
        <p className="mt-8 font-serif italic text-2xl text-cream/75 max-w-2xl mx-auto">
          We respond within 48 hours — usually somewhere between the first sip and the last.
        </p>
      </section>

      <section className="max-w-[1100px] mx-auto px-6 lg:px-12 mt-20 lg:mt-28 grid lg:grid-cols-5 gap-12 lg:gap-16">
        <form
          onSubmit={(e) => { e.preventDefault(); setSent(true); }}
          className="lg:col-span-3 space-y-6"
        >
          <Field label="Name"><input required maxLength={80} className="input" /></Field>
          <Field label="Email"><input required type="email" maxLength={120} className="input" /></Field>
          <Field label="Enquiry">
            <select className="input">
              <option className="text-espresso">General</option>
              <option className="text-espresso">Custom Order</option>
              <option className="text-espresso">Wholesale</option>
              <option className="text-espresso">Collaboration</option>
            </select>
          </Field>
          <Field label="Message">
            <textarea required maxLength={1500} rows={6} className="input resize-none" />
          </Field>
          <button className="inline-flex items-center justify-center px-8 py-3.5 bg-cream text-espresso text-xs uppercase tracking-luxe font-medium hover:bg-gold transition-colors">{sent ? "Sent — Cheers ✦" : "Send Message"}</button>
        </form>

        <aside className="lg:col-span-2 space-y-10">
          <div>
            <p className="text-[11px] uppercase tracking-luxe text-coral mb-4">Custom Orders</p>
            <h3 className="font-serif text-3xl mb-4">Your cocktail, your cut.</h3>
            <p className="text-cream/75 leading-relaxed">
              Have a favourite drink that isn't on the menu? We'll design a bespoke bikini around it — your colour story, your silhouette, your sizing. Tell us what you'd order, and we'll pour it.
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-luxe text-coral mb-4">Find us</p>
            <p className="font-serif italic text-xl">Cape Town, South Africa</p>
            <p className="text-sm text-cream/60 mt-2">hello@shakenswim.co.za</p>
            <div className="flex gap-4 mt-5">
              <a href="#" className="h-10 w-10 rounded-full border border-cream/30 flex items-center justify-center hover:bg-cream hover:text-espresso transition"><Instagram className="h-4 w-4" /></a>
            </div>
          </div>
        </aside>
      </section>

      <div className="h-32" />

      <style>{`
        .input {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1px solid color-mix(in oklab, var(--cream) 35%, transparent);
          padding: 12px 0;
          font-size: 15px;
          font-family: var(--font-sans);
          color: var(--cream);
          outline: none;
          transition: border-color .3s;
        }
        .input:focus { border-color: var(--cream); }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-luxe text-cream/60">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
