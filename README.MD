# 🎓 CurriculumPro Studio & Sistema de Keys

Um construtor de currículos interativo, premium e de alta performance desenvolvido em React, TypeScript e TailwindCSS. O projeto conta com paginação inteligente A4, múltiplos templates modernos e um sistema seguro de validação de downloads integrado em tempo real com o Firebase.

---

## ✨ Recursos Principais

- **Visualização WYSIWYG em Tempo Real:** Escala otimizada de visualização sem quebras de layout.
- **Paginação Inteligente A4:** Script que monitora quebras de página e aplica margens de 70px perfeitamente simétricas nos blocos.
- **Modelos Customizados:** Variados designs prontos (Tech, Executivo, Minimalista, Criativo).
- **Controle de Cores Fluido:** Seletores de cor de fundo e destaque debouceados e de alta performance.
- **Sistema de Downloads com Firebase:** Downloads premium protegidos por chaves de acesso de uso único.

---

## 🔑 Sistema de Validação e Chave Mestra (Admin)

Para baixar a versão final em PDF de alta qualidade, o sistema requer uma Key de validação.

### Como acessar o Painel Admin para gerar chaves:
1. No editor de currículo, clique no botão **Baixar PDF**.
2. Na tela de pré-visualização, clique em **Confirmar Download**.
3. No campo que solicita a Key de Acesso, insira a **Chave Universal Mestra (Master Key)**:
   ```text
   master-key
   ```
4. O **Painel Admin** será exibido, permitindo que você:
   - Gere novas chaves únicas aleatórias (que são salvas no Firebase como `active`).
   - Monitore a lista de chaves criadas e o status de cada uma delas (`Ativa` ou `Usada`).
   - Efetue o download do PDF livremente clicando em **Fazer Download como Admin**.

---

## 🚀 Como Executar Localmente

### Pré-requisitos
Certifique-se de ter o **Node.js** instalado em sua máquina.

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

3. **Acesse no Navegador:**
   O terminal exibirá o endereço local configurado pelo Vite (normalmente `http://localhost:3000` ou `3001`).
