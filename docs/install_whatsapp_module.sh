#!/bin/bash

# Script de Instalação Completa do Módulo WhatsApp
# CRM Kapexia - Versão MVP2
# Data: $(date)

echo "🚀 Iniciando instalação do Módulo WhatsApp..."

# 1. BACKUP DE SEGURANÇA
echo "📋 Fazendo backup de segurança..."
mysqldump -u root -p crm_kapexia > backup_pre_whatsapp_$(date +%Y%m%d_%H%M%S).sql
cp -r /home/projetos/crm_kapexia /home/projetos/crm_kapexia_backup_$(date +%Y%m%d_%H%M%S)

# 2. ATUALIZAR CÓDIGO
echo "📥 Atualizando código..."
cd /home/projetos/crm_kapexia
git fetch origin
git checkout mvp2-dev
git pull origin mvp2-dev

# 3. INSTALAR DEPENDÊNCIAS
echo "📦 Instalando dependências..."
cd backend
npm install axios multer

cd ../frontend
npm install
npm run build

# 4. CRIAR TABELAS DO BANCO
echo "🗄️ Criando tabelas do WhatsApp..."
mysql -u root -p crm_kapexia < backend/src/db/whatsapp_schema.sql

# 5. REINICIAR SERVIÇOS
echo "🔄 Reiniciando serviços..."
pm2 restart crm_kapexia_backend
pm2 restart crm_kapexia_frontend

# 6. VERIFICAR STATUS
echo "✅ Verificando status..."
pm2 status

echo "🎉 Instalação do Módulo WhatsApp concluída!"
echo ""
echo "📱 Acesse: https://seudominio.com/admin/whatsapp"
echo "⚙️ Configurações: https://seudominio.com/admin/settings/whatsapp"
echo ""
echo "📋 APIs disponíveis:"
echo "   - GET /api/whatsapp/instances"
echo "   - POST /api/whatsapp/instances"
echo "   - GET /api/whatsapp/chats"
echo "   - POST /api/whatsapp/messages"
echo "   - E mais 40+ endpoints..."

