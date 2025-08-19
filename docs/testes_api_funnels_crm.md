# Testes de API - Módulo de Funis (CRM Kapexia)

> Substitua `SEU_TOKEN_AQUI`, `ID_DO_FUNIL`, `ID_DO_CARD`, etc. pelos valores reais do seu ambiente.

## Autenticação

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"seu@email.com","password":"suasenha"}'
```

O retorno será um token JWT. Use esse token nos próximos testes:

```bash
-H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

## Funis (funnels)

### Criar funil
```bash
curl -X POST http://localhost:3001/api/funnels \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{"name":"Funil Teste","description":"Descrição do funil"}'
```

### Listar funis
```bash
curl -X GET http://localhost:3001/api/funnels \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### Buscar funil por ID
```bash
curl -X GET http://localhost:3001/api/funnels/ID_DO_FUNIL \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### Atualizar funil
```bash
curl -X PUT http://localhost:3001/api/funnels/ID_DO_FUNIL \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{"name":"Funil Atualizado","description":"Nova descrição"}'
```

### Deletar funil (soft delete)
```bash
curl -X DELETE http://localhost:3001/api/funnels/ID_DO_FUNIL \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

## Estágios do Funil

### Criar estágio
```bash
curl -X POST http://localhost:3001/api/funnels/ID_DO_FUNIL/stages \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{"name":"Novo Estágio","description":"Desc","color":"#e7e7f3"}'
```

### Listar estágios
```bash
curl -X GET http://localhost:3001/api/funnels/ID_DO_FUNIL/stages \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### Buscar estágio por ID
```bash
curl -X GET http://localhost:3001/api/funnels/ID_DO_FUNIL/stages/ID_DO_STAGE \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### Atualizar estágio
```bash
curl -X PUT http://localhost:3001/api/funnels/ID_DO_FUNIL/stages/ID_DO_STAGE \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{"name":"Estágio Atualizado","description":"Nova desc"}'
```

### Deletar estágio (soft delete)
```bash
curl -X DELETE http://localhost:3001/api/funnels/ID_DO_FUNIL/stages/ID_DO_STAGE \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

## Cards do Funil

### Criar card
```bash
curl -X POST http://localhost:3001/api/funnels/ID_DO_FUNIL/cards \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{"stage_id":1,"contact_id":1,"title":"Oportunidade X","description":"Detalhes","value":1000,"probability":50,"status":"open","created_by_user_id":1,"responsible_user_id":1}'
```

### Listar cards
```bash
curl -X GET http://localhost:3001/api/funnels/ID_DO_FUNIL/cards \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### Buscar card por ID
```bash
curl -X GET http://localhost:3001/api/funnels/ID_DO_FUNIL/cards/ID_DO_CARD \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### Atualizar card
```bash
curl -X PUT http://localhost:3001/api/funnels/ID_DO_FUNIL/cards/ID_DO_CARD \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{"title":"Oportunidade Atualizada","description":"Nova descrição"}'
```

### Deletar card (soft delete)
```bash
curl -X DELETE http://localhost:3001/api/funnels/ID_DO_FUNIL/cards/ID_DO_CARD \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

## Movimentações dos Cards

### Criar movimentação
```bash
curl -X POST http://localhost:3001/api/funnels/ID_DO_FUNIL/cards/ID_DO_CARD/movements \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{"from_stage_id":1,"to_stage_id":2,"moved_by_user_id":1,"notes":"Movido para próximo estágio"}'
```

### Listar movimentações
```bash
curl -X GET http://localhost:3001/api/funnels/ID_DO_FUNIL/cards/ID_DO_CARD/movements \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### Buscar movimentação por ID
```bash
curl -X GET http://localhost:3001/api/funnels/ID_DO_FUNIL/cards/ID_DO_CARD/movements/ID_DA_MOVIMENTACAO \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### Atualizar movimentação
```bash
curl -X PUT http://localhost:3001/api/funnels/ID_DO_FUNIL/cards/ID_DO_CARD/movements/ID_DA_MOVIMENTACAO \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{"notes":"Nova anotação"}'
```

### Deletar movimentação
```bash
curl -X DELETE http://localhost:3001/api/funnels/ID_DO_FUNIL/cards/ID_DO_CARD/movements/ID_DA_MOVIMENTACAO \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

## Histórico dos Cards

### Criar histórico
```bash
curl -X POST http://localhost:3001/api/funnels/ID_DO_FUNIL/cards/ID_DO_CARD/history \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{"event_type":"note","description":"Primeira anotação","created_by_user_id":1}'
```

### Listar histórico
```bash
curl -X GET http://localhost:3001/api/funnels/ID_DO_FUNIL/cards/ID_DO_CARD/history \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### Buscar histórico por ID
```bash
curl -X GET http://localhost:3001/api/funnels/ID_DO_FUNIL/cards/ID_DO_CARD/history/ID_DO_HISTORICO \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### Atualizar histórico
```bash
curl -X PUT http://localhost:3001/api/funnels/ID_DO_FUNIL/cards/ID_DO_CARD/history/ID_DO_HISTORICO \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{"description":"Histórico atualizado"}'
```

### Deletar histórico
```bash
curl -X DELETE http://localhost:3001/api/funnels/ID_DO_FUNIL/cards/ID_DO_CARD/history/ID_DO_HISTORICO \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
``` 