const express = require("express");
const puppeteer = require("puppeteer");
const { Storage } = require("@google-cloud/storage");
const { MercadoPagoConfig, Preference, Payment } = require("mercadopago");
const { Firestore } = require("@google-cloud/firestore");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const { generateLatex } = require("./latexGenerator");

const app = express();
const storage = new Storage();
const firestore = new Firestore();

const BUCKET_NAME = process.env.BUCKET_NAME || "curriculum-pdf-storage-478722";
const PORT = process.env.PORT || 8080;

// ✅ Configurar Mercado Pago
const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
const mercadoPago = MP_ACCESS_TOKEN
  ? new MercadoPagoConfig({ accessToken: MP_ACCESS_TOKEN })
  : null;

// Middleware
app.use(express.json({ limit: "50mb" }));

// CORS
app.use((req, res, next) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.status(204).send("");
  }
  next();
});

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok", mensagem: "API de Currículos PDF" });
});

// ✅ FUNÇÃO: Verificar se usuário é premium
const isPremiumUser = async (email) => {
  try {
    const userDoc = await firestore.collection("users").doc(email).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      return userData.premium === true;
    }
    return false;
  } catch (erro) {
    console.log("⚠️ Erro ao verificar premium (Firestore):", erro);
    return false;
  }
};

// ✅ ENDPOINT: Criar pagamento (PIX + Cartão)
app.post("/criar-pagamento", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ erro: "Email é obrigatório" });
    }

    if (!mercadoPago) {
      return res.status(500).json({ erro: "Mercado Pago não configurado" });
    }

    const jaPremium = await isPremiumUser(email);
    if (jaPremium) {
      return res.json({
        erro: "Você já é usuário premium!",
        premium: true,
      });
    }

    const preference = new Preference(mercadoPago);
    const result = await preference.create({
      body: {
        items: [
          {
            title: "Acesso Premium Vitalício - CurriculumPro",
            description: "Gere currículos profissionais sem marca d'água",
            quantity: 1,
            unit_price: 29.9,
            currency_id: "BRL",
          },
        ],
        payer: { email },
        payment_methods: {
          excluded_payment_types: [],
          installments: 1,
        },
        back_urls: {
          success: `${req.headers.origin || "https://curriculumpro.com.br"
            }?status=success&email=${encodeURIComponent(email)}`,
          failure: `${req.headers.origin || "https://curriculumpro.com.br"
            }?status=failure`,
          pending: `${req.headers.origin || "https://curriculumpro.com.br"
            }?status=pending`,
        },
        auto_return: "approved",
        notification_url:
          "https://curriculum-pdf-781855708546-781855708546.us-central1.run.app/webhook/mercadopago",
        statement_descriptor: "CurriculumPro",
        metadata: {
          user_email: email,
        },
      },
    });

    console.log("✅ Pagamento criado:", result.id);
    res.json({
      sucesso: true,
      checkoutUrl: result.init_point,
      preferenceId: result.id,
    });
  } catch (erro) {
    console.error("❌ Erro ao criar pagamento:", erro);
    res.status(500).json({ erro: erro.message });
  }
});

// ✅ WEBHOOK: Notificação de pagamento
app.post("/webhook/mercadopago", async (req, res) => {
  try {
    console.log("📥 Webhook recebido:", JSON.stringify(req.body));
    const { type, data } = req.body;

    if (type === "payment") {
      const paymentId = data.id;
      const payment = new Payment(mercadoPago);
      const paymentInfo = await payment.get({ id: paymentId });

      console.log("💳 Status:", paymentInfo.status);
      console.log("💰 Valor:", paymentInfo.transaction_amount);

      if (paymentInfo.status === "approved") {
        const email =
          paymentInfo.metadata?.user_email || paymentInfo.payer?.email;

        if (email) {
          await firestore.collection("users").doc(email).set(
            {
              email,
              premium: true,
              paymentId,
              paymentMethod: paymentInfo.payment_method_id,
              purchaseDate: new Date().toISOString(),
              amount: paymentInfo.transaction_amount,
            },
            { merge: true }
          );
          console.log(`✅ ${email} agora é PREMIUM!`);
        }
      }
    }

    res.status(200).send("OK");
  } catch (erro) {
    console.error("❌ Erro no webhook:", erro);
    res.status(200).send("OK");
  }
});

// ✅ ENDPOINT: Verificar status premium
app.get("/status-premium/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const isPremium = await isPremiumUser(email);
    res.json({ email, premium: isPremium });
  } catch (erro) {
    console.error("❌ Erro:", erro);
    res.status(500).json({ erro: erro.message });
  }
});

// ✅ ENDPOINT: Gerar PDF com Puppeteer (HTML → PDF)
app.post("/gerarPDF", async (req, res) => {
  try {
    console.log("📥 Requisição recebida");
    const { html, modelo, email } = req.body;

    if (!html || !email) {
      return res.status(400).json({ erro: "HTML e email são obrigatórios" });
    }

    console.log("🚀 Iniciando Puppeteer...");
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    // ✅ MUDANÇA 3: No Backend (index.js) - CSS Global
    const printCSS = `
<style>
  @page {
    size: A4;
    margin: 0;
    padding: 0;
  }

  @media print {
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }

    html, body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      max-width: 100% !important;
      height: 100% !important;
      overflow: hidden !important;
    }

    #resume-preview-container {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      max-width: 100% !important;
      height: 100% !important;
      overflow: hidden !important;
      position: static !important;
    }

    body {
      background: white !important;
      overflow: visible !important;
    }
  }
</style>
    `;

    let finalHtml = html;

    if (finalHtml.includes("</head>")) {
      finalHtml = finalHtml.replace("</head>", `${printCSS}</head>`);
    } else {
      finalHtml = `${printCSS}${finalHtml}`;
    }

    await page.setContent(finalHtml, { waitUntil: "networkidle0" });

    // ✅ MUDANÇA 2: No Backend (index.js) - Viewport maior para full-bleed
    // A4 em 96 DPI = 794x1123, mas precisamos de espaço extra para full-bleed
    await page.setViewport({ width: 850, height: 1200, deviceScaleFactor: 1 });

    console.log("📄 Gerando PDF...");

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "5mm", right: "5mm", bottom: "5mm", left: "5mm" },
      scale: 1.0,
      preferCSSPageSize: true,
    });

    await browser.close();

    // Upload para GCS
    const fileName = `curriculo_${Date.now()}.pdf`;
    const file = storage.bucket(BUCKET_NAME).file(fileName);

    await file.save(pdf, {
      metadata: {
        contentType: "application/pdf",
        contentDisposition: `attachment; filename="${fileName}"`,
      },
      public: true,
    });

    const publicUrl = `https://storage.googleapis.com/${BUCKET_NAME}/${fileName}`;
    console.log("✅ PDF gerado:", publicUrl);

    res.json({ sucesso: true, url: publicUrl });
  } catch (erro) {
    console.error("❌ Erro ao gerar PDF:", erro);
    res.status(500).json({ erro: erro.message });
  }
});

// ✅ ENDPOINT: Gerar PDF via LaTeX (USANDO latexGenerator_FINAL.js)
app.post("/gerarPDFLatex", async (req, res) => {
  try {
    console.log("📥 Requisição LaTeX recebida");
    const data = req.body;

    if (!data.email) {
      return res.status(400).json({ erro: "Email é obrigatório" });
    }

    // 1. Gerar código LaTeX com latexGenerator_FINAL
    const latexCode = generateLatex(data);
    const timestamp = Date.now();
    const workDir = path.join(__dirname, "temp");

    // Garantir que diretório temp existe
    if (!fs.existsSync(workDir)) {
      fs.mkdirSync(workDir, { recursive: true });
    }

    const texFileName = `curriculo_${timestamp}.tex`;
    const texFilePath = path.join(workDir, texFileName);
    const pdfFileName = `curriculo_${timestamp}.pdf`;
    const pdfFilePath = path.join(workDir, pdfFileName);

    // 2. Salvar arquivo .tex
    fs.writeFileSync(texFilePath, latexCode, "utf8");

    // 3. Compilar com pdflatex (duas vezes para garantir)
    const command = `pdflatex -interaction=nonstopmode -output-directory="${workDir}" "${texFilePath}"`;
    console.log("⚙️ Compilando LaTeX (passe 1)...");

    await new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error && !fs.existsSync(pdfFilePath)) {
          console.error("❌ Erro na compilação LaTeX:", stdout);
          reject(new Error("Falha na compilação do LaTeX"));
          return;
        }
        resolve(stdout);
      });
    });

    // Segunda compilação para referências
    console.log("⚙️ Compilando LaTeX (passe 2)...");
    await new Promise((resolve) => {
      exec(command, (error, stdout) => {
        resolve(stdout);
      });
    });

    // Verificar se PDF foi gerado
    if (!fs.existsSync(pdfFilePath)) {
      throw new Error("PDF não foi gerado pela compilação LaTeX");
    }

    // 4. Upload para Google Cloud Storage
    console.log("☁️ Fazendo upload do PDF...");
    const bucketFile = storage.bucket(BUCKET_NAME).file(pdfFileName);

    const pdfBuffer = fs.readFileSync(pdfFilePath);
    await bucketFile.save(pdfBuffer, {
      metadata: {
        contentType: "application/pdf",
        contentDisposition: `attachment; filename="${pdfFileName}"`,
      },
      public: true,
    });

    const publicUrl = `https://storage.googleapis.com/${BUCKET_NAME}/${pdfFileName}`;
    console.log("✅ PDF LaTeX gerado:", publicUrl);

    // 5. Limpeza de arquivos temporários
    setTimeout(() => {
      try {
        const filesToDelete = [
          texFilePath,
          pdfFilePath,
          path.join(workDir, `curriculo_${timestamp}.log`),
          path.join(workDir, `curriculo_${timestamp}.aux`),
          path.join(workDir, `curriculo_${timestamp}.out`),
        ];

        filesToDelete.forEach((file) => {
          if (fs.existsSync(file)) {
            fs.unlinkSync(file);
          }
        });
        console.log("🧹 Arquivos temporários deletados");
      } catch (err) {
        console.warn("⚠️ Erro ao deletar temporários:", err.message);
      }
    }, 5000);

    res.json({ sucesso: true, url: publicUrl });
  } catch (erro) {
    console.error("❌ Erro ao gerar PDF LaTeX:", erro);
    res.status(500).json({ erro: erro.message });
  }
});

// Health check com informações
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "CurriculumPro API",
    version: "2.0",
    endpoints: ["/gerarPDF", "/gerarPDFLatex", "/criar-pagamento", "/status-premium/:email"],
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📍 Endpoints disponíveis:`);
  console.log(`   - POST /gerarPDF (Puppeteer - HTML → PDF)`);
  console.log(`   - POST /gerarPDFLatex (LaTeX - Profissional)`);
  console.log(`   - POST /criar-pagamento (Mercado Pago)`);
  console.log(`   - GET /status-premium/:email (Verificar Premium)`);
});

module.exports = app;
