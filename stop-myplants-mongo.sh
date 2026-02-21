#!/bin/bash

# Define o diretório alvo
DIR_PROJETO="/root/projetos/myplants"

echo "--- Parando MongoDB ---"

# 1. Entrar no diretório
if [ -d "$DIR_PROJETO" ]; then
    cd "$DIR_PROJETO"
else
    echo "Erro: Diretório $DIR_PROJETO não encontrado."
    exit 1
fi

# 2. Derrubar o serviço do MongoDB (mantendo os dados no volume)
docker compose -f docker-compose-mongo.yml down
echo "MongoDB parado com sucesso."