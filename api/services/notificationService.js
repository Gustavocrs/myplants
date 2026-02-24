// /media/gustavo/A25E432D5E42F995/Projetos/myplants/api/services/notificationService.js
const cron = require("node-cron");
const nodemailer = require("nodemailer");
const Plant = require("../models/Plant");
const Settings = require("../models/Settings");
const {decrypt} = require("../utils/crypto");

// Cache simples de transporters para não recriar a cada loop (opcional)
const transporters = {};

const checkPlantsAndNotify = async () => {
  console.log("⏰ Verificando plantas que precisam de rega...");

  try {
    // Busca todas as plantas que precisam de rega e ainda não foram notificadas
    // Otimização: Filtra no banco em vez de trazer tudo
    const plants = await Plant.find({notificationSent: false});
    const now = new Date();

    // Agrupa plantas por usuário para enviar em lote ou configurar SMTP
    const plantsByUser = {};

    for (const plant of plants) {
      if (!plant.ultimaRega || !plant.userEmail) continue;

      // Calcula a próxima rega
      const nextWatering = new Date(plant.ultimaRega);
      nextWatering.setDate(nextWatering.getDate() + plant.intervaloRega);

      if (now >= nextWatering) {
        if (!plantsByUser[plant.userId]) {
          plantsByUser[plant.userId] = [];
        }
        plantsByUser[plant.userId].push(plant);
      }
    }

    // Processa cada usuário
    for (const userId in plantsByUser) {
      const userPlants = plantsByUser[userId];
      const transporter = await getTransporterForUser(userId);

      for (const plant of userPlants) {
        console.log(
          `💧 Planta ${plant.nome} precisa de rega! Enviando email...`,
        );
        await sendReminderEmail(plant, transporter);
        plant.notificationSent = true;
        await plant.save();
      }
    }
  } catch (error) {
    console.error("Erro no serviço de notificação:", error);
  }
};

const getTransporterForUser = async (userId) => {
  // Verifica se o usuário tem configurações de SMTP personalizadas
  const settings = await Settings.findOne({userId});

  if (settings && settings.smtp && settings.smtp.user && settings.smtp.pass) {
    console.log(`📧 Usando SMTP personalizado para usuário ${userId}`);
    return nodemailer.createTransport({
      host: settings.smtp.host,
      port: settings.smtp.port,
      secure: settings.smtp.secure,
      auth: {
        user: settings.smtp.user,
        pass: decrypt(settings.smtp.pass),
      },
    });
  }

  // Fallback para o SMTP do sistema
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS?.replace(/\s+/g, ""),
    },
  });
};

const sendReminderEmail = async (plant, transporter) => {
  const confirmLink = `${process.env.API_URL || "http://localhost:3001/api"}/plants/${plant._id}/water`;

  const mailOptions = {
    from: '"MyPlants 🌱" <noreply@myplants.com>',
    to: plant.userEmail,
    subject: `Hora de regar sua ${plant.nome}! 💧`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Olá!</h2>
        <p>Sua planta <strong>${plant.nome}</strong> está com sede.</p>
        <p>O intervalo de rega dela é de ${plant.intervaloRega} dias.</p>
        <br/>
        <p>Já regou? Clique no botão abaixo para registrar e reiniciar a contagem:</p>
        <a href="${confirmLink}" style="background-color: #16a34a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          ✅ Confirmar Rega
        </a>
        <br/><br/>
        <p>Cuide bem dela! 🌱</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Email enviado para ${plant.userEmail}`);
  } catch (error) {
    console.error(`❌ Erro ao enviar email para ${plant.userEmail}:`, error);
  }
};

// Inicia o Cron Job
const startScheduler = () => {
  // Roda a cada hora: "0 * * * *"
  // Para testes, pode usar a cada minuto: "* * * * *"
  cron.schedule("0 * * * *", () => {
    checkPlantsAndNotify();
  });
  console.log("📅 Serviço de agendamento de rega iniciado.");
};

module.exports = {startScheduler};
