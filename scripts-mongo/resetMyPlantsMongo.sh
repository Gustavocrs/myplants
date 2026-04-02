#!/bin/bash

# Define o diretório alvo
DIR_PROJETO="/root/projetos/myplants"

echo "--- ⚠️  ATENÇÃO: RESET DO BANCO DE DADOS ⚠️  ---"
echo "Isso apagará PERMANENTEMENTE todas as plantas e usuários cadastrados."
read -p "Tem certeza que deseja continuar? (s/N): " confirm

if [[ "$confirm" != "s" && "$confirm" != "S" ]]; then
    echo "Operação cancelada."
    exit 0
fi

# 1. Entrar no diretório
if [ -d "$DIR_PROJETO" ]; then
    cd "$DIR_PROJETO"
else
    echo "Erro: Diretório $DIR_PROJETO não encontrado."
    exit 1
fi

# 2. Derrubar o Mongo e remover volumes (-v)
echo "Apagando banco de dados..."
docker compose -f docker-compose-mongo.yml down -v

# 3. Subir novamente limpo
./deploy-myplants-mongo.sh