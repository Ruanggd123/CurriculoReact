# AI Resume Builder

Este é um construtor de currículos inteligente que permite aos usuários inserir suas informações profissionais e visualizar uma prévia em tempo real, com formatação profissional. O projeto utiliza a API do Google Gemini para gerar e aprimorar o conteúdo, oferecendo uma experiência de criação de currículo mais rápida e eficaz.

<!-- Você pode atualizar o link quando o novo projeto for publicado -->
<!-- Você pode acessá-lo online através deste link: [https://ruanggd123.github.io/AI_Resume_Builder](https://ruanggd123.github.io/AI_Resume_Builder) -->

### Funcionalidades

- **Assistência de IA (Google Gemini):**
  - **Gerador de Resumo:** Crie um resumo profissional impactante com base em suas experiências e habilidades.
  - **Aprimoramento de Descrição:** Melhore as descrições de suas experiências e projetos para torná-las mais profissionais.
  - **Sugestão de Habilidades:** Gere uma lista de habilidades relevantes com base no seu perfil.
- **Customização Visual Completa:**
  - **Modelos de Design:** Escolha entre quatro modelos de currículo pré-definidos (`Clássico`, `Moderno`, `Compacto` e `Executivo`).
  - **Aparência:** Altere a cor de fundo, a cor de destaque e os tamanhos de fonte para cada parte do currículo.
  - **Edição de Foto:** Faça upload, ajuste o zoom, a posição e o formato da sua foto de perfil (redonda ou quadrada).
- **Gerenciamento de Conteúdo:**
  - **Seções Dinâmicas:** Adicione, edite e reordene seções (Experiência, Formação, Projetos, etc.) com uma interface de arrastar e soltar.
  - **Controle de Histórico:** Desfaça e refaça alterações com facilidade (Ctrl+Z / Ctrl+Y).
  - **Salvamento Automático:** Suas alterações são salvas automaticamente no navegador.
- **Interface Moderna:**
  - **Pré-visualização em Tempo Real:** Veja as mudanças no seu currículo instantaneamente.
  - **Tema Claro e Escuro:** Alterne entre os temas para uma melhor experiência de visualização.
  - **Exportação para PDF:** Baixe seu currículo final em um arquivo PDF de alta qualidade, pronto para ser compartilhado.

### Estrutura do Projeto

O projeto é construído com React, TypeScript e Vite, utilizando TailwindCSS para a estilização.

- `index.html`: Ponto de entrada da aplicação.
- `App.tsx`: Componente principal que gerencia o estado geral e a lógica da aplicação.
- `components/`: Contém todos os componentes reutilizáveis da interface:
  - `ResumePreview.tsx`: Renderiza a pré-visualização do currículo com base nos dados e na configuração da UI.
  - `FormPanel.tsx`: Exibe os formulários para editar as informações do currículo e a aparência.
  - `LeftSidebar.tsx`: Barra lateral para navegação e gerenciamento das seções.
  - `PhotoEditorModal.tsx`: Modal para ajuste fino da foto de perfil.
- `hooks/`: Contém hooks customizados, como `useHistoryState.ts` para o controle de desfazer/refazer.
- `types.ts`: Definições de tipos TypeScript para garantir a consistência dos dados.

### Como Usar

1.  Abra a aplicação no seu navegador.
2.  Use a barra lateral esquerda para navegar entre as seções do currículo (Informações Pessoais, Experiência, etc.) e a aparência.
3.  O painel da direita será aberto para que você possa editar o conteúdo da seção selecionada.
4.  Utilize os botões de IA para gerar ou aprimorar textos.
5.  A pré-visualização no centro da tela será atualizada em tempo real.
6.  Quando estiver satisfeito, clique em "Baixar PDF" para exportar seu currículo.
