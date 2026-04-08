require("dotenv").config();
const saRaw = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!saRaw) {
    console.log("❌ Variável FIREBASE_SERVICE_ACCOUNT não encontrada.");
    process.exit(1);
}

console.log("📊 Diagnóstico da Variável:");
console.log(`- Tamanho total: ${saRaw.length} caracteres`);
console.log(`- Começa com: [${saRaw.substring(0, 10)}...]`);
console.log(`- Termina com: [...${saRaw.substring(saRaw.length - 10)}]`);

try {
    let cleaned = saRaw.trim();
    if (cleaned.startsWith("'") && cleaned.endsWith("'")) {
        console.log("📝 Removendo aspas simples externas...");
        cleaned = cleaned.slice(1, -1);
    }
    
    JSON.parse(cleaned);
    console.log("✅ JSON.parse funcionou com a string limpa!");
} catch (e) {
    console.log("❌ Erro no JSON.parse:");
    console.log(`- Mensagem: ${e.message}`);
    
    // Tenta encontrar onde está o caractere extra após o JSON
    try {
        // Se o erro for "after JSON", vamos tentar ver o que tem depois do fechamento de chaves
        const lastBrace = saRaw.lastIndexOf('}');
        if (lastBrace !== -1 && lastBrace < saRaw.length - 1) {
            console.log(`- Caracteres após o último '}': [${saRaw.substring(lastBrace + 1)}]`);
        }
    } catch (err) {}
}
