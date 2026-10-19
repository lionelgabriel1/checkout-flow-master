import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Checkout Subway Cash — Pagamento por Referência" },
      { name: "description", content: "Compre o Subway Cash e pague por referência no Multicaixa Express ou ATM." },
      { property: "og:title", content: "Checkout Subway Cash" },
      { property: "og:description", content: "Pague por referência e receba o acesso após confirmação." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Checkout,
});

const PRODUCT_PRICE = 5000;
const BUMPS = [
  { id: "3x", img: "/images/3x%20mais.png", title: "3X — Acelere a sua evolução", price: 2450 },
  { id: "cardless", img: "/images/levantamento%20sem%20cartao.jpeg", title: "Levantamento sem cartão — guia completo", price: 2550 },
];
const ENTITY = "10116";
const PAYMENT_REFERENCE = "928581499";
const WHATSAPP_NUMBER = "244928581499";
const TIMER_SECONDS = 15 * 60;

const kz = (v: number) =>
  v.toLocaleString("pt-AO", { minimumFractionDigits: 2 }) + " Kz";

type Step = "form" | "reference" | "paid";

function Checkout() {
  useEffect(() => {
    const w = window as any;
    if (w.fbq) return;

    const fbq: any = function (...args: any[]) {
      if (fbq.callMethod) fbq.callMethod.apply(fbq, args);
      else fbq.queue.push(args);
    };
    w.fbq = fbq;
    if (!w._fbq) w._fbq = fbq;
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.queue = [];

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);

    fbq("init", "1117060627478676");
    fbq("track", "PageView");
  }, []);

  const [step, setStep] = useState<Step>("form");
  const [bumps, setBumps] = useState<string[]>([]);
  const [form, setForm] = useState({ name: "", phone: "" });
  const [left, setLeft] = useState(TIMER_SECONDS);
  const [copied, setCopied] = useState("");
  const chosen = BUMPS.filter((b) => bumps.includes(b.id));
  const total = PRODUCT_PRICE + chosen.reduce((a, b) => a + b.price, 0);
  const valid = form.name.trim().length > 2 && form.phone.replace(/\D/g, "").length >= 9;

  useEffect(() => {
    const timer = window.setInterval(() => setLeft((current) => Math.max(0, current - 1)), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const mmss = useMemo(() => `${String(Math.floor(left / 60)).padStart(2, "0")}:${String(left % 60).padStart(2, "0")}`, [left]);

  const generate = () => {
    (window as any).fbq?.("track", "InitiateCheckout", { value: total, currency: "AOA" });
    setStep("reference");
  };

  const copy = (label: string, v: string) => {
    navigator.clipboard.writeText(v);
    setCopied(label);
    setTimeout(() => setCopied(""), 1500);
  };

  return (
    <main className="min-h-screen bg-black pb-16 text-white">
      <div className="sticky top-0 z-20 bg-red-600 py-2 text-center text-sm font-extrabold text-white shadow-lg">⏱ OFERTA POR TEMPO LIMITADO · {mmss}</div>
      <img src="/images/1789096402237.jpeg" alt="Capa Subway Cash" className="mx-auto w-full max-w-xl object-contain" />

      <div className="mx-auto -mt-4 max-w-xl space-y-4 px-4">
        <section className="flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 shadow-sm">
          <img src="/foto_do_produto" alt="Produto Subway Cash" className="h-16 w-16 rounded-xl object-cover" />
          <div className="flex-1">
            <h1 className="font-display text-xl font-extrabold">Subway Cash</h1>
            <p className="text-sm text-muted-foreground">Acesso imediato após confirmação</p>
          </div>
          <p className="font-display text-lg font-extrabold text-primary">{kz(PRODUCT_PRICE)}</p>
        </section>

        {step === "form" && (
          <>
            <section className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-sm">
              <h2 className="font-display text-lg font-bold">Os seus dados</h2>
              {([
                ["name", "Nome completo", "text"],
                ["phone", "Telefone (9XX XXX XXX)", "tel"],
              ] as const).map(([k, label, type]) => (
                <label key={k} className="block">
                  <span className="text-sm font-semibold">{label}</span>
                  <input
                    type={type}
                    value={form[k]}
                    onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                    className="mt-1 w-full rounded-lg border bg-zinc-900 text-white px-3 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                  />
                </label>
              ))}
            </section>

            {BUMPS.map((bp) => {
              const on = bumps.includes(bp.id);
              return (
                <button
                  key={bp.id}
                  type="button"
                  onClick={() => setBumps(on ? bumps.filter((x) => x !== bp.id) : [...bumps, bp.id])}
                  className={`flex w-full items-center gap-4 rounded-2xl border-2 border-dashed p-4 text-left transition ${on ? "border-gold bg-gold-surface text-gold" : "border-primary bg-zinc-950"}`}
                >
                  <img src={bp.img} alt="" className="h-20 w-20 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="text-xs font-bold uppercase tracking-wider">Oferta única</p>
                    <p className="font-display font-extrabold">{bp.title}</p>
                    <p className="text-sm opacity-80">Adicione por apenas {kz(bp.price)}</p>
                  </div>
                  <span className={`flex h-6 w-6 items-center justify-center rounded border-2 ${on ? "border-gold bg-gold text-gold-surface" : "border-primary"}`}>
                    {on && "✓"}
                  </span>
                </button>
              );
            })}

            <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-sm">
              <div className="flex justify-between text-sm"><span>Subway Cash</span><span>{kz(PRODUCT_PRICE)}</span></div>
              {chosen.map((c) => <div key={c.id} className="mt-1 flex justify-between text-sm"><span>{c.title.split(" —")[0]}</span><span>{kz(c.price)}</span></div>)}
              <div className="mt-3 flex justify-between border-t pt-3 font-display text-lg font-extrabold">
                <span>Total</span><span className="text-primary">{kz(total)}</span>
              </div>
              <button
                disabled={!valid}
                onClick={generate}
                className="mt-4 w-full rounded-xl bg-primary py-4 font-display text-lg font-extrabold text-primary-foreground shadow-lg transition hover:brightness-110 disabled:opacity-40"
              >
                Liberar agora
              </button>
              <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-success/10 py-2 text-sm font-bold text-success">
                🔒 Compra 100% segura · Dados protegidos
              </div>
              <p className="mt-2 text-center text-xs text-muted-foreground">Pague no Multicaixa Express, ATM ou Internet Banking</p>
            </section>
          </>
        )}

        {step === "reference" && (
          <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-sm">
            <div className="bg-primary p-4 text-center text-primary-foreground">
              <p className="text-xs font-bold uppercase tracking-widest">Pagamento por referência</p>
            </div>
            <div className="divide-y text-center">
              {([
                ["Entidade", ENTITY],
                ["Referência", PAYMENT_REFERENCE.replace(/(\d{3})(?=\d)/g, "$1 ")],
                ["Valor", kz(total)],
              ] as [string, string][]).map(([l, v]) => (
                <button key={l} onClick={() => copy(l, v.replace(/ /g, ""))} className="block w-full py-4 hover:bg-muted">
                  <p className="font-display text-2xl font-extrabold">{v}</p>
                  <p className="text-xs font-bold uppercase text-primary">{copied === l ? "Copiado!" : `${l} · toque para copiar`}</p>
                </button>
              ))}
            </div>
            <div className="flex items-center justify-center gap-2 bg-muted p-4 text-sm text-muted-foreground">
              <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
              A aguardar confirmação do pagamento.
            </div>
            <div className="mx-4 mt-3 flex items-center justify-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-center text-sm font-bold text-emerald-400">
              <span aria-hidden="true">✓</span>
              Saque liberado após a confirmação do pagamento
            </div>
          </section>
        )}

        {step === "paid" && (
          <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success text-4xl text-success-foreground">✓</div>
            <h2 className="mt-4 font-display text-2xl font-extrabold">Pagamento confirmado!</h2>
            <p className="mt-2 text-muted-foreground">
              Obrigado, {form.name.split(" ")[0]}. O pagamento foi confirmado.
            </p>
          </section>
        )}

      </div>
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Suporte pelo WhatsApp"
        title="Suporte pelo WhatsApp"
        className="fixed bottom-5 left-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition hover:scale-105 hover:brightness-95"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-8 w-8 fill-current">
          <path d="M20.52 3.48A11.82 11.82 0 0 0 12.08 0C5.5 0 .15 5.35.15 11.93c0 2.1.55 4.15 1.6 5.96L0 24l6.27-1.64a11.9 11.9 0 0 0 5.8 1.48h.01C18.66 23.84 24 18.5 24 11.92c0-3.18-1.24-6.17-3.48-8.44ZM12.08 21.8a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.72.98.99-3.63-.24-.37a9.84 9.84 0 0 1-1.52-5.26c0-5.47 4.45-9.92 9.92-9.92a9.86 9.86 0 0 1 7.02 2.91 9.86 9.86 0 0 1 2.9 7.02c0 5.47-4.45 9.92-9.95 9.92Zm5.45-7.43c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.09 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35Z"/>
        </svg>
      </a>
    </main>
  );
}

