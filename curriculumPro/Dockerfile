FROM ghcr.io/puppeteer/puppeteer:21.6.1

# Mudar para root temporariamente
USER root

# Instalar TeXLive (LaTeX) e dependências (COMO ROOT)
# Remove listas do Chrome que causam erro de assinatura
RUN rm -f /etc/apt/sources.list.d/google-chrome.list /etc/apt/sources.list.d/google.list \
    && apt-get update && apt-get install -y \
    texlive-latex-base \
    texlive-latex-extra \
    texlive-fonts-recommended \
    texlive-lang-portuguese \
    && rm -rf /var/lib/apt/lists/*

# Criar diretório e dar permissões
WORKDIR /usr/src/app
RUN chown -R pptruser:pptruser /usr/src/app

# Voltar para usuário pptruser
USER pptruser

# Copiar package files
COPY --chown=pptruser:pptruser package*.json ./

# Instalar dependências do Node.js
RUN npm ci --omit=dev


# Copiar código
COPY --chown=pptruser:pptruser . .

# Configurar porta
ENV PORT=8080
EXPOSE 8080

# Comando de início
CMD ["node", "index.js"]
