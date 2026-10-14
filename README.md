# Portfólio de Gabriel Fonseca

Meu espaço para apresentar os projetos que construo e explicar como eles podem ajudar na rotina de um negócio. O site reúne serviços, trabalhos selecionados e contato em uma navegação simples, com foco em quem quer conhecer meu trabalho antes de iniciar uma conversa.

[Ver projeto](https://gabrielseca.is-a.dev/)

## O que você encontra

- Apresentação de serviços de automação, agendamento e desenvolvimento web.
- Catálogo de projetos alimentado por um arquivo JSON.
- Layout responsivo com navegação por seções.
- Links de contato e metadados de compartilhamento.

## Tecnologias

HTML, CSS e JavaScript. Os projetos são organizados em `projects.json` e carregados pela interface.

## Executar localmente

```bash
npm install
npm run dev
```

O servidor local usa a porta `8080`.

## Estrutura

- `index.html`: conteúdo e seções da página.
- `index.css`: estilos e adaptação de layout.
- `app.js`: comportamento da interface.
- `projects.json`: catálogo de trabalhos.
- `assets/`: imagens do site.
