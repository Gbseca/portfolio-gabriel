# Gabriel Fonseca — portfólio

Site estático em HTML, CSS e JavaScript. Produção: https://gabrielseca.is-a.dev/

## Desenvolvimento

`npm ci` instala apenas as dependências de testes. `npm run dev` inicia um servidor na porta 8080. Também é possível usar `python -m http.server 8080`. Abra por HTTP; `file://` não carrega o JSON de projetos.

`npm test` verifica menu, diálogos, galeria, WhatsApp e fluxos locais das amostras. Os arquivos de produção não dependem do npm.

## Estrutura

- `index.html`, `index.css`, `portfolio.css`, `app.js`: apresentação, projetos e contato.
- `gallery.js`: abertura e fechamento das prévias em diálogo nativo.
- `previews/preview.js`, `preview.css`: seis experiências, guia e estados temporários.
- `previews/envelope.js`, `envelope.css`: abertura adaptada do convite safari fornecido pelo proprietário.
- `projects.json`: catálogo. Use `demoUrl` apenas para uma aplicação navegável, não para um repositório. Use `githubUrl` para o repositório exato ou `null` quando não público.

## Privacidade das amostras

Os arquivos originais não foram modificados. As cópias incluem somente elementos visuais selecionados, sem convidados, nomes pessoais, endereço, data real, telefone de evento, Pix, configurações de banco ou backend dos convites. Não há persistência nos formulários de amostra. O iframe usa `sandbox="allow-scripts"` e a CSP bloqueia conexão de rede e envio de formulários. Fechar ou reiniciar descarta todas as escolhas.

Os botões do portfólio para WhatsApp são reais e usam o telefone público do proprietário. A mensagem pode ser revisada pelo visitante antes do envio. Botões de contato dentro das amostras apenas demonstram a interação.

## Publicação

O GitHub Pages publica a raiz da branch **main**, com `.nojekyll` e `CNAME`. O domínio e o HTTPS são mantidos. A branch `master` é histórica e não é a origem do site. Faça uma atualização normal de `main`, sem force-push, aguarde a execução `pages build and deployment` e confira o domínio. Não envie `node_modules`, pastas de QA ou dados dos projetos originais.

## Créditos visuais

- Convite safari e casa nova: adaptações dos arquivos fornecidos pelo proprietário; imagens de personagens permanecem pertencentes aos respectivos titulares. A amostra não implica afiliação com a Disney.
- Advocacia: composição adaptada do PDF fornecido, com interação local e sem credenciais profissionais ou depoimentos inventados.
- Fachada: [Wes Fischer / Unsplash](https://unsplash.com/photos/g39p1kDjvSY).
- Interior: [Lui Peng / Unsplash](https://unsplash.com/photos/8NxTrV6i4WQ).
- Fotografias de arquitetura são referências visuais dos layouts, não obras arquitetônicas atribuídas ao desenvolvedor.
