import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacidade")({
  head: () => ({ meta: [
    { title: "Privacidade — Subway Cash" },
    { name: "description", content: "Informações sobre a medição de visitas e as escolhas de privacidade no Subway Cash." },
    { property: "og:title", content: "Privacidade — Subway Cash" },
    { property: "og:description", content: "Saiba que dados o Meta Pixel utiliza e como retirar a autorização." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Privacy,
});

function Privacy() {
  return <main className="mx-auto max-w-xl space-y-5 px-5 py-10">
    <Link to="/" className="text-primary underline">Voltar ao checkout</Link>
    <h1 className="font-display text-2xl font-bold">Privacidade</h1>
    <h2 className="font-display text-lg font-bold">Medição de visitas</h2>
    <p>Usamos o Meta Pixel da Meta Platforms para medir visitas provenientes de anúncios. Quando autorizado, recebe a página visitada, endereço IP, informações do navegador e dispositivo e identificadores de cookies, como _fbp e _fbc. A Meta pode relacionar estas informações com a atividade nos seus serviços para medição publicitária. Não ativámos correspondência de clientes nem eventos de compra; os campos de nome, e-mail e telefone não são enviados pelo pixel.</p>
    <h2 className="font-display text-lg font-bold">As suas escolhas</h2>
    <p>Nas regiões onde exigimos consentimento, o pixel fica bloqueado até aceitar. Se não conseguirmos determinar a região, também pedimos autorização. Nas restantes regiões, a medição está ativa, salvo recusa. Pode recusar ou retirar a autorização em Definições de cookies, no rodapé. A recusa interrompe novos envios; não apaga informações anteriormente recebidas pela Meta.</p>
    <p>Guardamos neste navegador um identificador aleatório do visitante, a região, as datas, as escolhas e a versão do aviso apresentado, incluindo aceitações anteriores e retiradas. Este registo permite aplicar e documentar a sua decisão; não é enviado à Meta. Apagar o armazenamento do navegador remove esse registo.</p>
    <p>Consulte também a <a className="text-primary underline" href="https://www.facebook.com/privacy/policy/" target="_blank" rel="noreferrer">Política de Privacidade da Meta</a>.</p>
  </main>;
}