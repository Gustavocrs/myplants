#!/bin/bash

# Define o diretório alvo
DIR_PROJETO="/root/projetos/myplants"
BRANCH="dev"

echo "--- Iniciando Deploy Backend Profissional ---"

# 1. Entrar no diretório
if [ -d "$DIR_PROJETO" ]; then
    cd "$DIR_PROJETO"
    echo "Acessando diretório: $(pwd)"
else
    echo "Erro: Diretório $DIR_PROJETO não encontrado."
    exit 1
fi

# 2. Limpar estado local e sincronizar com o repositório remoto
# echo "Sincronizando com a branch $BRANCH remota..."
# git fetch origin
# git checkout $BRANCH
# git reset --hard origin/$BRANCH
# git clean -fd
echo "⚠️  Usando versão local dos arquivos (Git sync desativado)"

# 3. Limpeza de containers parados e imagens antigas (dangling) ANTES do build
echo "Limpando resíduos antigos..."
docker container prune -f
docker image prune -f

# 4. Derrubar APENAS a API e limpar volumes de cache (node_modules, etc)
echo "Reiniciando API e limpando caches..."
docker compose down -v

# 5. Rodar docker compose up da API com build limpo
echo "Construindo e atualizando a API..."
docker compose build --no-cache
docker compose up -d

# 7. Exibir os logs iniciais
echo "Aguardando 5 segundos para a inicialização do Node.js..."
sleep 5
echo "--- Logs Recentes ---"
docker compose logs --tail=20 api

echo "--- Status dos Containers ---"
docker compose ps

echo "--- Deploy Concluído ---"