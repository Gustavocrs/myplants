#!/bin/bash

BASE_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_FILE="$BASE_DIR/config/projects.conf"

clear

echo "===================================="
echo "        SYSTECH DEPLOY CLI"
echo "===================================="
echo ""

mapfile -t PROJECTS < "$PROJECT_FILE"

i=1
for p in "${PROJECTS[@]}"
do
    NAME=$(echo $p | cut -d '|' -f1)
    echo "$i - $NAME"
    ((i++))
done

echo ""
read -p "Selecione o projeto: " choice

PROJECT=${PROJECTS[$((choice-1))]}

NAME=$(echo $PROJECT | cut -d '|' -f1)
DIR=$(echo $PROJECT | cut -d '|' -f2)
SERVICE=$(echo $PROJECT | cut -d '|' -f3)
BRANCH=$(echo $PROJECT | cut -d '|' -f4)
REMOTE=$(echo $PROJECT | cut -d '|' -f5)

while true
do

clear

echo "===================================="
echo "Projeto: $NAME"
echo "Diretório: $DIR"
echo "Serviço: $SERVICE"
echo "===================================="
echo ""
echo "1 Deploy completo"
echo "2 Atualizar código + restart"
echo "3 Atualizar Next/React"
echo "4 Atualizar dependências"
echo "5 Logs"
echo "6 Healthcheck"
echo "0 Voltar"
echo ""

read -p "Escolha: " opt

case $opt in

1)
bash "$BASE_DIR/lib/deploy-full.sh" "$DIR" "$SERVICE" "$BRANCH" "$REMOTE"
read -p "ENTER..."
;;

2)
bash "$BASE_DIR/lib/deploy-restart.sh" "$DIR" "$SERVICE" "$BRANCH" "$REMOTE"
read -p "ENTER..."
;;

3)
bash "$BASE_DIR/lib/update-next.sh" "$DIR" "$BRANCH" "$REMOTE"
read -p "ENTER..."
;;

4)
bash "$BASE_DIR/lib/update-deps.sh" "$DIR" "$BRANCH" "$REMOTE"
read -p "ENTER..."
;;

5)
bash "$BASE_DIR/lib/logs.sh" "$DIR" "$SERVICE"
;;

6)
bash "$BASE_DIR/lib/healthcheck.sh" "$DIR"
read -p "ENTER..."
;;

0)
break
;;

*)
echo "Opção inválida"
sleep 2
;;

esac

done
