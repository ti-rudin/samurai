#!/bin/bash

# Скрипт для установки npm зависимостей во всех проектах

echo "🚀 Начинаю установку npm зависимостей во всех проектах..."

# Список папок с проектами
PROJECTS=(
    "admin-front"
    "in-front"
    "main-front"
    "node-red"
    "strapi"
)

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

for project in "${PROJECTS[@]}"
do
    if [ -d "$project" ]; then
        echo -e "\n${YELLOW}📦 Устанавливаю зависимости для $project...${NC}"

        if [ -f "$project/package.json" ]; then
            cd "$project"
            npm install
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✅ Зависимости для $project установлены успешно${NC}"
            else
                echo -e "${RED}❌ Ошибка при установке зависимостей для $project${NC}"
            fi
            cd ..
        else
            echo -e "${RED}⚠️  package.json не найден в папке $project${NC}"
        fi
    else
        echo -e "${RED}⚠️  Папка $project не найдена${NC}"
    fi
done

echo -e "\n${GREEN}🎉 Установка зависимостей завершена!${NC}"
