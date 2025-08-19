# Testes API Estratégias CRM Kapexia

> Substitua TOKEN pelo token JWT obtido no login e ajuste os IDs conforme necessário.

## 1. Autenticação
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@teste.com","password":"SENHA"}'
```

---

## 2. Funis (funnels)
```bash
# Criar funil
curl -X POST http://localhost:3001/api/funnels \
  -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" \
  -d '{"name":"Funil Vendas","description":"Funil principal"}'

# Listar funis
tcurl -X GET http://localhost:3001/api/funnels \
  -H "Authorization: Bearer TOKEN"

# Buscar funil por ID
curl -X GET http://localhost:3001/api/funnels/1 \
  -H "Authorization: Bearer TOKEN"

# Atualizar funil
curl -X PUT http://localhost:3001/api/funnels/1 \
  -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" \
  -d '{"name":"Funil Atualizado"}'

# Excluir funil
curl -X DELETE http://localhost:3001/api/funnels/1 \
  -H "Authorization: Bearer TOKEN"
```

---

## 3. Estágios do Funil (funnel_stages)
```bash
curl -X POST http://localhost:3001/api/funnels/1/stages \
  -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" \
  -d '{"name":"Prospecção","sort_order":1}'

curl -X GET http://localhost:3001/api/funnels/1/stages \
  -H "Authorization: Bearer TOKEN"
```

---

## 4. Cards do Funil (funnel_cards)
```bash
curl -X POST http://localhost:3001/api/funnels/1/cards \
  -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" \
  -d '{"contact_id":1,"title":"Oportunidade X"}'

curl -X GET http://localhost:3001/api/funnels/1/cards \
  -H "Authorization: Bearer TOKEN"
```

---

## 5. Produtos/Serviços (products_services)
```bash
curl -X POST http://localhost:3001/api/products-services \
  -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" \
  -d '{"name":"Produto Teste","type":"product","base_price":100.00}'

curl -X GET http://localhost:3001/api/products-services \
  -H "Authorization: Bearer TOKEN"
```

---

## 6. Itens do Card (funnel_card_items)
```bash
curl -X POST http://localhost:3001/api/funnels/1/cards/1/items \
  -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" \
  -d '{"product_service_id":1,"quantity":2,"unit_price":100.00,"total_amount":200.00}'

curl -X GET http://localhost:3001/api/funnels/1/cards/1/items \
  -H "Authorization: Bearer TOKEN"
```

---

## 7. Tarefas (tasks)
```bash
curl -X POST http://localhost:3001/api/tasks \
  -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" \
  -d '{"title":"Ligar para cliente","task_type":"call","assigned_to_user_id":2}'

curl -X GET http://localhost:3001/api/tasks \
  -H "Authorization: Bearer TOKEN"
```

---

## 8. Compartilhamento de Tarefas (task_shares)
```bash
curl -X POST http://localhost:3001/api/tasks/1/shares \
  -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" \
  -d '{"shared_with_user_id":2,"can_edit":true}'

curl -X GET http://localhost:3001/api/tasks/1/shares \
  -H "Authorization: Bearer TOKEN"
```

---

## 9. Comentários em Tarefas (task_comments)
```bash
curl -X POST http://localhost:3001/api/tasks/1/comments \
  -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" \
  -d '{"comment":"Comentário de teste"}'

curl -X GET http://localhost:3001/api/tasks/1/comments \
  -H "Authorization: Bearer TOKEN"
```

---

## 10. Permissões de Funil (user_funnel_permissions)
```bash
curl -X POST http://localhost:3001/api/funnels/1/permissions \
  -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" \
  -d '{"user_id":2,"can_view":true,"can_edit":true}'

curl -X GET http://localhost:3001/api/funnels/1/permissions \
  -H "Authorization: Bearer TOKEN"
```

---

## 11. Logs de Auditoria (audit_log)
```bash
curl -X GET http://localhost:3001/api/audit-logs \
  -H "Authorization: Bearer TOKEN"
```

---

## 12. Configurações de Funil por Cliente (client_funnel_settings)
```bash
curl -X POST http://localhost:3001/api/client-funnel-settings \
  -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" \
  -d '{"funnel_id":1,"settings_json":"{\"exemplo\":true}"}'

curl -X GET http://localhost:3001/api/client-funnel-settings \
  -H "Authorization: Bearer TOKEN"
```

---

## 13. Templates de Tarefas por Estágio (stage_task_templates)
```bash
curl -X POST http://localhost:3001/api/funnels/1/stages/1/task-templates \
  -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" \
  -d '{"title":"Tarefa Padrão","task_type":"call"}'

curl -X GET http://localhost:3001/api/funnels/1/stages/1/task-templates \
  -H "Authorization: Bearer TOKEN"
```

---

> Repita o padrão para outras entidades (tags, arquivos, comentários em cards, automações, webhooks, etc.) conforme necessário. 