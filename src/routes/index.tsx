import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import bannerAsset from "@/assets/subway-cash.jpeg.asset.json";
import iconAsset from "@/assets/icon.png.asset.json";
import bumpAsset from "@/assets/3x.png.asset.json";
import cardlessAsset from "@/assets/levantamento.jpeg.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Checkout Subway Cash — Pagamento por Referência" },
      { name: "description", content: "Compre o Subway Cash e pague por referência no Multicaixa Express ou ATM." },
      { property: "og:title", content: "Checkout Subway Cash" },
      { property: "og:description", content: "Pague por referência em 15 minutos e receba o acesso na hora." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Checkout,
});

const PRODUCT_PRICE = 5000;
const BUMPS = [
  { id: "3x", img: bumpAsset.url, title: "3X — Acelere a sua evolução", price: 2450 },
  { id: "cardless", img: cardlessAsset.url, title: "Levantamento sem cartão — guia completo", price: 2550 },
];
const ENTITY = "10116";
const PAYMENT_REFERENCE = "928581499";
const WHATSAPP_NUMBER = "244928581499";
const TIMER_SECONDS = 15 * 60;

const DEMO_BUYERS = [
  "Mateus António", "Ana Domingos", "Paulo Manuel", "Carla Joaquim",
  "José Miguel", "Marta Francisco", "Daniel Sebastião", "Sandra Afonso",
  "Edson Miguel", "Teresa Paulo", "Nelson André", "Isabel Manuel",
];
type DemoActivity = { name: string; amount: number };

const kz = (v: number) =>
  v.toLocaleString("pt-AO", { minimumFractionDigits: 2 }) + " Kz";

type Step = "form" | "reference" | "paid" | "expired";

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
  const [deadline, setDeadline] = useState(() => Date.now() + TIMER_SECONDS * 1000);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [reference, setReference] = useState("");
  const [left, setLeft] = useState(TIMER_SECONDS);
  const [copied, setCopied] = useState("");
  const [demoActivity, setDemoActivity] = useState<DemoActivity | null>(null);

  // Notificações ilustrativas: identificadas claramente como demonstração.
  useEffect(() => {
    const showDemoActivity = () => {
      const name = DEMO_BUYERS[Math.floor(Math.random() * DEMO_BUYERS.length)];
      const amount = (115000 + Math.floor(Math.random() * 20) * 5000);
      setDemoActivity({ name, amount });
      window.setTimeout(() => setDemoActivity(null), 6500);
    };
    const first = window.setTimeout(showDemoActivity, 5000);
    const interval = window.setInterval(showDemoActivity, 15000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(interval);
    };
  }, []);

  const chosen = BUMPS.filter((b) => bumps.includes(b.id));
  const total = PRODUCT_PRICE + chosen.reduce((a, b) => a + b.price, 0);
  const valid = form.name.trim().length > 2 && /\S+@\S+\.\S+/.test(form.email) && form.phone.replace(/\D/g, "").length >= 9;

  // 15-min countdown
  useEffect(() => {
    if (step === "paid" || step === "expired") return;
    const t = setInterval(() => {
      const s = Math.max(0, Math.round((deadline - Date.now()) / 1000));
      setLeft(s);
      if (s === 0) setStep("expired");
    }, 1000);
    return () => clearInterval(t);
  }, [step, deadline]);

  const generate = () => {
    (window as any).fbq?.("track", "InitiateCheckout", { value: total, currency: "AOA" });
    setReference(PAYMENT_REFERENCE);
    if (step === "expired") {
      setDeadline(Date.now() + TIMER_SECONDS * 1000);
      setLeft(TIMER_SECONDS);
    }
    setStep("reference");
  };

  const copy = (label: string, v: string) => {
    navigator.clipboard.writeText(v);
    setCopied(label);
    setTimeout(() => setCopied(""), 1500);
  };

  const mmss = useMemo(
    () => `${String(Math.floor(left / 60)).padStart(2, "0")}:${String(left % 60).padStart(2, "0")}`,
    [left],
  );

  return (
    <main className="min-h-screen pb-16">
      {(step === "form" || step === "reference") && (
        <div className="sticky top-0 z-10 bg-primary py-2 text-center text-sm font-bold text-primary-foreground">
          ⏱ {step === "form" ? "Oferta reservada por" : "Pague a referência em"} <span className="font-display tabular-nums">{mmss}</span>
        </div>
      )}
      {demoActivity && (step === "form" || step === "reference") && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed bottom-4 left-4 z-20 w-[calc(100%-2rem)] max-w-sm animate-in slide-in-from-bottom-3 rounded-xl border bg-card p-4 shadow-xl"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success/10 text-xl">↗</div>
            <div className="min-w-0 flex-1">
              <p className="font-bold">{demoActivity.name}</p>
              <p className="text-sm text-muted-foreground">Exemplo de levantamento</p>
              <p className="font-display text-lg font-extrabold text-primary">
                {kz(demoActivity.amount)}
              </p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Demonstração · não é uma transação real
              </p>
            </div>
          </div>
        </aside>
      )}
      <img src={bannerAsset.url} alt="Subway Cash" className="mx-auto w-full max-w-xl object-contain" />

      <div className="mx-auto -mt-4 max-w-xl space-y-4 px-4">
        <section className="flex items-center gap-4 rounded-2xl border bg-card p-4 shadow-sm">
          <img src={iconAsset.url} alt="" className="h-16 w-16 rounded-xl" />
          <div className="flex-1">
            <h1 className="font-display text-xl font-extrabold">Subway Cash</h1>
            <p className="text-sm text-muted-foreground">Acesso imediato após confirmação</p>
          </div>
          <p className="font-display text-lg font-extrabold text-primary">{kz(PRODUCT_PRICE)}</p>
        </section>

        {step === "form" && (
          <>
            <section className="space-y-3 rounded-2xl border bg-card p-5 shadow-sm">
              <h2 className="font-display text-lg font-bold">Os seus dados</h2>
              {([
                ["name", "Nome completo", "text"],
                ["email", "E-mail", "email"],
                ["phone", "Telefone (9XX XXX XXX)", "tel"],
              ] as const).map(([k, label, type]) => (
                <label key={k} className="block">
                  <span className="text-sm font-semibold">{label}</span>
                  <input
                    type={type}
                    value={form[k]}
                    onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
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
                  className={`flex w-full items-center gap-4 rounded-2xl border-2 border-dashed p-4 text-left transition ${on ? "border-gold bg-gold-surface text-gold" : "border-primary bg-card"}`}
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

            <section className="rounded-2xl border bg-card p-5 shadow-sm">
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
                Gerar referência de pagamento
              </button>
              <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-success/10 py-2 text-sm font-bold text-success">
                🔒 Compra 100% segura · Dados protegidos
              </div>
              <p className="mt-2 text-center text-xs text-muted-foreground">Pague no Multicaixa Express, ATM ou Internet Banking</p>
            </section>
          </>
        )}

        {step === "reference" && (
          <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
            <div className="bg-primary p-4 text-center text-primary-foreground">
              <p className="text-xs font-bold uppercase tracking-widest">Pagamento por referência</p>
              <p className="mt-1 font-display text-4xl font-extrabold tabular-nums">{mmss}</p>
              <p className="text-xs opacity-90">Tempo restante desta sessão</p>
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
              A aguardar confirmação manual do pagamento.
            </div>
            <div className="space-y-3 p-4">
              <p className="text-sm text-muted-foreground">Depois de pagar, envia o comprovativo ao suporte pelo WhatsApp. Anexa a imagem directamente na conversa antes de enviar a mensagem.</p>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Olá! Fiz o pagamento do Subway Cash. Nome: ${form.name}. E-mail: ${form.email}. Telefone: ${form.phone}. Valor pago: ${kz(total)}. Entidade: ${ENTITY}. Referência: ${PAYMENT_REFERENCE}. Vou anexar o comprovativo nesta conversa.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center rounded-xl bg-[#25D366] px-4 py-4 text-center font-display font-extrabold text-white shadow-lg transition hover:brightness-95"
              >
                Enviar comprovativo pelo WhatsApp
              </a>
            </div>
          </section>
        )}

        {step === "paid" && (
          <section className="rounded-2xl border bg-card p-8 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success text-4xl text-success-foreground">✓</div>
            <h2 className="mt-4 font-display text-2xl font-extrabold">Pagamento confirmado!</h2>
            <p className="mt-2 text-muted-foreground">
              Obrigado, {form.name.split(" ")[0]}. Enviámos o acesso para <b>{form.email}</b>.
            </p>
          </section>
        )}

        {step === "expired" && (
          <section className="rounded-2xl border bg-card p-8 text-center shadow-sm">
            <h2 className="font-display text-2xl font-extrabold">Sessão terminada</h2>
            <p className="mt-2 text-muted-foreground">O tempo de 15 minutos terminou. A tua referência fixa pode continuar válida; podes voltar à página de pagamento para consultar os dados e contactar o suporte.</p>
            <button onClick={generate} className="mt-4 rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground">
              Voltar ao pagamento
            </button>
          </section>
        )}
      </div>
    </main>
  );
}

