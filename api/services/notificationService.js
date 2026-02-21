// /media/gustavo/A25E432D5E42F995/Projetos/myplants/api/services/notificationService.js
const cron = require("node-cron");
const nodemailer = require("nodemailer");
const Plant = require("../models/Plant");

// Configuração do Transporter (Use variáveis de ambiente em produção)
// Para testes rápidos, você pode usar o Ethereal Email ou seu próprio Gmail (com App Password)
const transporter = nodemailer.createTransport({
  service: "gmail", // Ou outro provedor SMTP
  auth: {
    user: process.env.EMAIL_USER, // Defina no .env
    pass: process.env.EMAIL_PASS?.replace(/\s+/g, ""), // Remove espaços da senha (ex: blocos 4x4)
  },
});

const checkPlantsAndNotify = async () => {
  console.log("⏰ Verificando plantas que precisam de rega...");

  try {
    const plants = await Plant.find({});
    const now = new Date();

    for (const plant of plants) {
      if (!plant.ultimaRega || !plant.userEmail) continue;

      // Calcula a próxima rega
      const nextWatering = new Date(plant.ultimaRega);
      nextWatering.setDate(nextWatering.getDate() + plant.intervaloRega);

      // Se a data atual for maior que a data da próxima rega E ainda não notificamos
      if (now >= nextWatering && !plant.notificationSent) {
        console.log(`💧 Planta ${plant.nome} precisa de rega! Enviando email...`);

        await sendReminderEmail(plant);

        // Marca como notificado para não enviar emails duplicados
        plant.notificationSent = true;
        await plant.save();
      }
    }
  } catch (error) {
    console.error("Erro no serviço de notificação:", error);
  }
};

const sendReminderEmail = async (plant) => {
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

module.exports = { startScheduler };