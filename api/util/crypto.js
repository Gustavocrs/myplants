const crypto = require("crypto");

// Em produção, use uma chave segura no .env (ex: ENCRYPTION_KEY)
const secret = process.env.ENCRYPTION_KEY || "my-secret-key-default-123";
const algorithm = "aes-256-cbc";
const key = crypto.scryptSync(secret, "salt", 32);
const iv = Buffer.alloc(16, 0); // Simplificado para MVP. Ideal: gerar IV aleatório e salvar junto.

exports.encrypt = (text) => {
  if (!text) return text;
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
};

exports.decrypt = (text) => {
  if (!text) return text;
  try {
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(text, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (e) {
    return text; // Retorna original se falhar (retrocompatibilidade)
  }
};
