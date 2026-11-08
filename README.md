# Radar Afiliado — Espião Shopee

Painel responsivo para analisar produtos encontrados na Shopee, preparar roteiros orgânicos para TikTok/Reels e usar links gerados **na sua própria conta de afiliado**.

## Abrir agora

Abra `index.html` no navegador. Não precisa instalar nada. A versão inicial mostra **12 produtos de uma amostra pública coletada em 08/11/2026**, com fonte indicada. Estes números não são vendas feitas por afiliados nem vendas nacionais totais.

Você pode filtrar, ordenar, exportar CSV, criar roteiros, copiar legendas e guardar seus próprios links de afiliado por produto no navegador (localStorage). Os links salvos não são sincronizados entre dispositivos.

## Ligar a atualização automática toda segunda-feira

A automação usa **somente a Open API oficial de Afiliados da Shopee**, e nunca faz extração automatizada de páginas da loja. É necessário que a Shopee autorize o acesso à sua API.

1. Crie uma conta gratuita no [GitHub](https://github.com) e um repositório **público** para este projeto. Não publique credenciais ou relatórios privados.
2. Envie **todos** os arquivos desta pasta para a raiz do repositório, inclusive `.github/workflows/atualizar-radar.yml` e `data/products.json`. Faça upload da pasta `.github` preservando o caminho; se seu navegador não permitir pastas ocultas, use Git ou um editor para recriar o caminho.
3. Entre no [Portal de Afiliados Shopee](https://affiliate.shopee.com.br/) e localize/solicite a **Open API**. A API exige credenciais `App ID` e `App Secret` e pode depender de habilitação da conta.
4. No GitHub, acesse **Settings → Secrets and variables → Actions → New repository secret**. Adicione `SHOPEE_APP_ID` e `SHOPEE_APP_SECRET` com os respectivos valores. **Nunca** cole esses valores no HTML, nos arquivos, em Issues ou neste chat.
5. Em **Settings → Actions → General → Workflow permissions**, selecione **Read and write permissions**, se essa opção for necessária para permitir os commits automáticos.
6. Em **Settings → Pages → Build and deployment**, selecione **Deploy from a branch**, branch `main`, pasta `/ (root)`. Confirme a URL do site.
7. Em **Actions → Atualizar radar Shopee semanalmente → Run workflow**, rode um teste. Confirme que o arquivo `data.js` foi atualizado, que o status no site mudou para “API autorizada” e que apareceram produtos. Erros podem indicar ausência de permissão, limite ou mudança na API.

Agendamento: **segunda-feira, 09h de Brasília (UTC-3), a partir de 09/11/2026**. A plataforma GitHub Actions pode atrasar ou pausar execuções; não há garantia de minuto exato. O site hospedado recebe os novos dados depois do commit e da publicação do GitHub Pages. Para atualizar em outro dia, use `Run workflow`.

### O que é medido?

- O ranking mostra o maior valor do campo `sales` **dentro da amostra coletada** (até 200 anúncios). Não é o ranking geral da Shopee, nem confirma vendas feitas por afiliados.
- Os anúncios são encontrados por 16 pesquisas de nichos em `atualizar.py`, até duas páginas por termo, deduplicados por `itemId`.
- O campo de comissão vem da API e **pode mudar**; o recebimento efetivo depende da validação da Shopee.
- O “potencial editorial” é uma heurística do painel, **não** uma previsão de conversão.
- Se falhar a consulta, a automação **não sobrescreve** os dados anteriores com resultados vazios.
- O painel permite armazenar seu próprio link do produto no navegador, ou usar `offerLink` retornado pela API quando disponível.

### Fontes e documentação

- [Shopee: Como encontrar produtos em alta](https://help.shopee.com.br/portal/10/article/163263-Como-encontrar-produtos-em-alta)
- [Shopee: Como acompanhar desempenho](https://help.shopee.com.br/portal/10/article/125158-Como-acompanhar-a-minha-performance-e-faturamento-como-afiliado)
- [Shopee: como gerar links de afiliado](https://help.shopee.com.br/portal/10/article/128461-Como-gerar-links-de-produtos-ou-lojas)
- [API Explorer da Shopee](https://open-api.affiliate.shopee.com.br/)
- [Referência comunitária da API (não oficial)](https://www.affiliateshopee.com.br/documentacao)
- [Amostra pública inicial](https://descontinho.app/vendidos)

### Privacidade e custos

Este projeto não faz login, não publica posts nem compra produtos. O código do site é estático. O histórico público não deve incluir suas conversões pessoais. Dependendo dos limites e das políticas do GitHub/da Shopee, pode haver restrições de execução. Não há integração com TikTok ou WhatsApp para publicar automaticamente.