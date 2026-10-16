import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import bannerAsset from "@/assets/subway-cash.jpeg.asset.json";
import iconAsset from "@/assets/icon.png.asset.json";
import bumpAsset from "@/assets/3x.png.asset.json";

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

const PRODUCT_PRICE = 9900;
const BUMP_PRICE = 4900;
const ENTITY = "00123";
const TIMER_SECONDS = 15 * 60;

const kz = (v: number) =>
  v.toLocaleString("pt-AO", { minimumFractionDigits: 2 }) + " Kz";

type Step = "form" | "reference" | "paid" | "expired";

function Checkout() {
  const [step, setStep] = useState<Step>("form");
  const [bump, setBump] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [reference, setReference] = useState("");
  const [left, setLeft] = useState(TIMER_SECONDS);
  const [copied, setCopied] = useState("");

  const total = PRODUCT_PRICE + (bump ? BUMP_PRICE : 0);
  const valid = form.name.trim().length > 2 && /\S+@\S+\.\S+/.test(form.email) && form.phone.replace(/\D/g, "").length >= 9;

  // 15-min countdown
  useEffect(() => {
    if (step !== "reference") return;
    const deadline = Date.now() + TIMER_SECONDS * 1000;
    const t = setInterval(() => {
      const s = Math.max(0, Math.round((deadline - Date.now()) / 1000));
      setLeft(s);
      if (s === 0) setStep("expired");
    }, 1000);
    return () => clearInterval(t);
  }, [step, reference]);

  // Payment confirmation polling (replace checkPayment with your gateway call)
  useEffect(() => {
    if (step !== "reference") return;
    const t = setInterval(async () => {
      if (await checkPayment(reference)) setStep("paid");
    }, 5000);
    return () => clearInterval(t);
  }, [step, reference]);

  const generate = () => {
    const ref = String(Math.floor(100000000 + Math.random() * 900000000));
    localStorage.removeItem(`paid:${ref}`);
    setReference(ref);
    setLeft(TIMER_SECONDS);
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

            <button
              type="button"
              onClick={() => setBump(!bump)}
              className={`flex w-full items-center gap-4 rounded-2xl border-2 border-dashed p-4 text-left transition ${bump ? "border-gold bg-gold-surface text-gold" : "border-primary bg-card"}`}
            >
              <img src={bumpAsset.url} alt="3X" className="h-20 w-20 rounded-lg" />
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-wider">Oferta única</p>
                <p className="font-display font-extrabold">3X — Acelere a sua evolução</p>
                <p className="text-sm opacity-80">Adicione por apenas {kz(BUMP_PRICE)}</p>
              </div>
              <span className={`flex h-6 w-6 items-center justify-center rounded border-2 ${bump ? "border-gold bg-gold text-gold-surface" : "border-primary"}`}>
                {bump && "✓"}
              </span>
            </button>

            <section className="rounded-2xl border bg-card p-5 shadow-sm">
              <div className="flex justify-between text-sm"><span>Subway Cash</span><span>{kz(PRODUCT_PRICE)}</span></div>
              {bump && <div className="mt-1 flex justify-between text-sm"><span>3X</span><span>{kz(BUMP_PRICE)}</span></div>}
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
              <p className="mt-2 text-center text-xs text-muted-foreground">Pague no Multicaixa Express, ATM ou Internet Banking</p>
            </section>
          </>
        )}

        {step === "reference" && (
          <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
            <div className="bg-primary p-4 text-center text-primary-foreground">
              <p className="text-xs font-bold uppercase tracking-widest">Pagamento por referência</p>
              <p className="mt-1 font-display text-4xl font-extrabold tabular-nums">{mmss}</p>
              <p className="text-xs opacity-90">Tempo restante para pagar</p>
            </div>
            <div className="divide-y text-center">
              {[
                ["Entidade", ENTITY],
                ["Referência", reference.replace(/(\d{3})(?=\d)/g, "$1 ")],
                ["Valor", kz(total)],
              ].map(([l, v]) => (
                <button key={l} onClick={() => copy(l, v.replace(/ /g, ""))} className="block w-full py-4 hover:bg-muted">
                  <p className="font-display text-2xl font-extrabold">{v}</p>
                  <p className="text-xs font-bold uppercase text-primary">{copied === l ? "Copiado!" : `${l} · toque para copiar`}</p>
                </button>
              ))}
            </div>
            <div className="flex items-center justify-center gap-2 bg-muted p-4 text-sm text-muted-foreground">
              <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
              A aguardar confirmação do pagamento...
            </div>
            {import.meta.env.DEV && (
              <button
                onClick={() => localStorage.setItem(`paid:${reference}`, "1")}
                className="w-full border-t py-2 text-xs text-muted-foreground hover:bg-muted"
              >
                (teste) Simular pagamento recebido
              </button>
            )}
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
            <h2 className="font-display text-2xl font-extrabold">Referência expirada</h2>
            <p className="mt-2 text-muted-foreground">O tempo de 15 minutos terminou.</p>
            <button onClick={generate} className="mt-4 rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground">
              Gerar nova referência
            </button>
          </section>
        )}
      </div>
    </main>
  );
}

// TODO: substituir por chamada real ao gateway (ex: ProxyPay / EMIS) quando houver credenciais.
async function checkPayment(reference: string): Promise<boolean> {
  return localStorage.getItem(`paid:${reference}`) === "1";
}
