import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { CONSENT_KEY, NOTICE, NOTICE_VERSION, PIXEL_ID, mayTrack, needsConsent, readConsent, type ConsentRecord } from "@/lib/advertising-consent";

type Pixel = {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  push: Pixel;
  loaded: boolean;
  version: string;
};
declare global { interface Window { fbq?: Pixel; _fbq?: Pixel; } }

export function AdvertisingPrivacy() {
  const [region, setRegion] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [storageError, setStorageError] = useState(false);

  useEffect(() => {
    let active = true;
    let viewed = false;
    let initialized = false;
    let currentRegion = "XX";
    const sync = () => {
      const choice = readConsent();
      const allowed = mayTrack(currentRegion, choice);
      if (!allowed) { window.fbq?.("consent", "revoke"); return; }
      if (!window.fbq) {
        const pixel = function (...args: unknown[]) {
          if (pixel.callMethod) pixel.callMethod.apply(pixel, args);
          else pixel.queue.push(args);
        } as Pixel;
        pixel.queue = []; pixel.push = pixel; pixel.loaded = true; pixel.version = "2.0";
        window.fbq = pixel; window._fbq = pixel;
        const script = document.createElement("script");
        script.async = true; script.src = "https://connect.facebook.net/en_US/fbevents.js";
        document.head.appendChild(script);
      }
      window.fbq("consent", "grant");
      if (!initialized) { window.fbq("init", PIXEL_ID); initialized = true; }
      if (!viewed) { window.fbq("track", "PageView"); viewed = true; }
    };
    const changed = () => sync();
    const storage = (event: StorageEvent) => { if (event.key === CONSENT_KEY || event.key === null) sync(); };
    window.addEventListener("advertising-choice", changed);
    window.addEventListener("storage", storage);
    void (async () => {
      try {
        const response = await fetch("/cdn-cgi/trace", { signal: AbortSignal.timeout(2000) });
        if (response.ok) currentRegion = (await response.text()).match(/^loc=([A-Z]{2})$/m)?.[1] || "XX";
      } catch { currentRegion = "XX"; }
      if (!active) return;
      setRegion(currentRegion);
      setOpen(needsConsent(currentRegion) && !readConsent());
      sync();
    })();
    return () => { active = false; window.removeEventListener("advertising-choice", changed); window.removeEventListener("storage", storage); };
  }, []);

  const choose = (advertising: boolean) => {
    const previous = readConsent();
    const at = new Date().toISOString();
    const record: ConsentRecord = {
      visitorId: previous?.visitorId || crypto.randomUUID(), advertising, region: region || "XX",
      version: NOTICE_VERSION, notice: NOTICE, updatedAt: at,
      history: [...(previous?.history || []), { advertising, at, region: region || "XX", version: NOTICE_VERSION, notice: NOTICE }],
    };
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(record));
      window.dispatchEvent(new Event("advertising-choice"));
      setStorageError(false); setOpen(false);
    } catch { window.fbq?.("consent", "revoke"); setStorageError(true); }
  };

  return <>
    <footer className="mx-auto flex max-w-xl flex-wrap justify-center gap-2 px-4 py-6 text-sm">
      <Link to="/privacidade" className="self-center text-primary underline">Privacidade</Link>
      <Button variant="link" onClick={() => setOpen(true)}>Definições de cookies</Button>
    </footer>
    {open && <section role="dialog" aria-modal="false" aria-labelledby="privacy-title" className="fixed inset-x-3 bottom-3 z-50 mx-auto max-h-[80dvh] max-w-xl overflow-auto rounded-lg border bg-card p-5 shadow-lg">
      <h2 id="privacy-title" className="font-display text-lg font-bold">A sua privacidade</h2>
      <p className="mt-2 text-sm text-muted-foreground">{NOTICE}</p>
      <Link to="/privacidade" className="mt-2 inline-block text-sm text-primary underline">Política de privacidade</Link>
      {storageError && <p role="alert" className="mt-2 text-sm text-destructive">Não foi possível guardar a escolha. A medição permanece bloqueada.</p>}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Button variant="outline" onClick={() => choose(false)}>Recusar</Button>
        <Button variant="outline" onClick={() => choose(true)}>Aceitar</Button>
      </div>
    </section>}
  </>;
}