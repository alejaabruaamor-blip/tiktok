import { useEffect, useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { mirrorHead } from '@/components/MirrorPage';
import { AD_CHOICE_KEY, stopAdvertising } from '@/lib/ad-tracking';
export const Route = createFileRoute('/privacidade')({ head: mirrorHead('Privacidade e publicidade | TikTok Shop', 'Dados de pedidos, publicidade no TikTok e suas opções de privacidade.'), component: Privacy });
function Privacy() {
  const [disabled, setDisabled] = useState(false);
  useEffect(() => { try { setDisabled(JSON.parse(localStorage.getItem(AD_CHOICE_KEY) ?? 'null')?.advertising === false); } catch { setDisabled(true); } }, []);
  return <main className="mx-auto max-w-2xl space-y-6 bg-background px-6 py-10 text-foreground">
    <Link to="/" className="text-sm underline">Voltar à loja</Link>
    <h1 className="text-2xl font-bold">Privacidade e publicidade</h1>
    <section className="space-y-3"><h2 className="text-lg font-semibold">Pedidos e pagamentos</h2><p>Os dados informados no pedido são usados para entrega e cobrança via BravoPay. O endereço é reutilizado nos itens adicionais. Dados de contato e entrega e o resumo do pedido são guardados neste navegador para manter o seu pedido entre as páginas.</p></section>
    <section className="space-y-3"><h2 className="text-lg font-semibold">Medição de anúncios do TikTok</h2><p>Onde permitido, usamos o Pixel do TikTok para medir visitas, visualizações de produtos, início de checkout e pagamentos aprovados, com valores e moeda. O TikTok pode usar esses eventos para atribuição, medição e otimização de publicidade.</p><p>Os dados incluem página visitada, parâmetros da campanha (UTM), identificador de clique do TikTok, identificação técnica do evento, informações do navegador, IP e cookies de publicidade. Não enviamos nome, e-mail, CPF, telefone ou endereço ao pixel, nem usamos correspondência avançada de clientes.</p><p>Não carregamos o pixel em regiões que exigem consentimento, incluindo Brasil, Canadá, Espaço Econômico Europeu, Reino Unido e Suíça, ou quando não conseguimos identificar a região. Também respeitamos recusa registrada, Global Privacy Control e Do Not Track.</p></section>
    <section className="space-y-3"><h2 className="text-lg font-semibold">Sua escolha</h2><p>Você pode desativar a publicidade neste navegador. A recusa é registrada com a data e a versão desta explicação e aplicada imediatamente às demais abas. Eventos bloqueados não são enviados depois. Isso não afeta o Pix nem seu pedido.</p><Button disabled={disabled} onClick={() => { stopAdvertising(); setDisabled(true); }}>{disabled ? 'Publicidade desativada neste navegador' : 'Desativar rastreamento de publicidade'}</Button><p>Essa escolha permanece neste navegador; em outro dispositivo, visite esta página novamente. O bloqueio não remove eventos já recebidos pelo TikTok.</p></section>
    <a className="text-sm underline" href="https://www.tiktok.com/legal/page/row/privacy-policy/pt" rel="noreferrer" target="_blank">Política de Privacidade do TikTok</a>
  </main>;
}
