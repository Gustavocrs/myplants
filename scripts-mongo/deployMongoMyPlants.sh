#!/bin/bash

# Define o diretório alvo
DIR_PROJETO="/root/projetos/myplants"

echo "--- Iniciando Deploy MongoDB ---"

# 1. Entrar no diretório
if [ -d "$DIR_PROJETO" ]; then
    cd "$DIR_PROJETO"
    echo "Acessando diretório: $(pwd)"
else
    echo "Erro: Diretório $DIR_PROJETO não encontrado."
    exit 1
fi

# 2. Subir o MongoDB (e criar a rede se não existir)
echo "Subindo container do MongoDB..."
docker compose -f docker-compose-mongo.yml up -d

echo "--- Status do MongoDB ---"
docker compose -f docker-compose-mongo.yml ps