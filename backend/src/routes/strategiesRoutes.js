const express = require("express")
const router = express.Router()
const authMiddleware = require("../middleware/authMiddleware")
const db = require("../config/db")

// GET /api/strategies - Listar estratégias do cliente
router.get("/", authMiddleware, async (req, res) => {
  try {
    const clientId = req.user.client_id

    const [strategies] = await db.execute(
      `
      SELECT s.*, 
             COUNT(sn.id) as total_nodes,
             u.name as created_by_name
      FROM strategies s
      LEFT JOIN strategy_nodes sn ON s.id = sn.strategy_id
      LEFT JOIN users u ON s.user_id = u.id
      WHERE s.client_id = ?
      GROUP BY s.id
      ORDER BY s.updated_at DESC
    `,
      [clientId],
    )

    res.json({ strategies })
  } catch (error) {
    console.error("Erro ao buscar estratégias:", error)
    res.status(500).json({ error: error.message })
  }
})

// GET /api/strategies/:id - Buscar estratégia específica com nós
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const clientId = req.user.client_id
    const strategyId = req.params.id

    // Buscar estratégia
    const [strategies] = await db.execute(
      `
      SELECT * FROM strategies 
      WHERE id = ? AND client_id = ?
    `,
      [strategyId, clientId],
    )

    if (strategies.length === 0) {
      return res.status(404).json({ error: "Estratégia não encontrada" })
    }

    // Buscar nós da estratégia
    const [nodes] = await db.execute(
      `
      SELECT * FROM strategy_nodes 
      WHERE strategy_id = ? AND client_id = ?
      ORDER BY day ASC, position_y ASC
    `,
      [strategyId, clientId],
    )

    const strategy = strategies[0]
    strategy.nodes = nodes.map((node) => ({
      id: node.node_id,
      type: node.type,
      title: node.title,
      day: node.day,
      position: { x: Number.parseFloat(node.position_x), y: Number.parseFloat(node.position_y) },
      config: node.config ? JSON.parse(node.config) : {},
    }))

    res.json({ strategy })
  } catch (error) {
    console.error("Erro ao buscar estratégia:", error)
    res.status(500).json({ error: error.message })
  }
})

// POST /api/strategies - Criar nova estratégia
router.post("/", authMiddleware, async (req, res) => {
  const connection = await db.getConnection()

  try {
    await connection.beginTransaction()

    const clientId = req.user.client_id
    const userId = req.user.id
    const { name, description, dataInicial, diasUteis, timelineDays, workflowNodes, timelineNodes } = req.body

    // Inserir estratégia
    const [result] = await connection.execute(
      `
      INSERT INTO strategies (client_id, user_id, name, description, data_inicial, dias_uteis, timeline_days, total_events)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        clientId,
        userId,
        name,
        description,
        dataInicial,
        diasUteis ? 1 : 0,
        JSON.stringify(timelineDays),
        (workflowNodes?.length || 0) + (timelineNodes?.length || 0),
      ],
    )

    const strategyId = result.insertId

    // Inserir nós do workflow
    if (workflowNodes && workflowNodes.length > 0) {
      for (const node of workflowNodes) {
        await connection.execute(
          `
          INSERT INTO strategy_nodes (strategy_id, client_id, node_id, type, title, day, position_x, position_y, config)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
          [
            strategyId,
            clientId,
            node.id,
            node.type,
            node.title,
            node.day,
            node.position.x,
            node.position.y,
            JSON.stringify(node.config),
          ],
        )
      }
    }

    // Inserir nós da timeline
    if (timelineNodes && timelineNodes.length > 0) {
      for (const node of timelineNodes) {
        await connection.execute(
          `
          INSERT INTO strategy_nodes (strategy_id, client_id, node_id, type, title, day, position_x, position_y, config)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
          [
            strategyId,
            clientId,
            node.id,
            node.type,
            node.title,
            node.day,
            node.position.x,
            node.position.y,
            JSON.stringify(node.config),
          ],
        )
      }
    }

    await connection.commit()
    res.json({ success: true, strategyId })
  } catch (error) {
    await connection.rollback()
    console.error("Erro ao criar estratégia:", error)
    res.status(500).json({ error: error.message })
  } finally {
    connection.release()
  }
})

// PUT /api/strategies/:id - Atualizar estratégia
router.put("/:id", authMiddleware, async (req, res) => {
  const connection = await db.getConnection()

  try {
    await connection.beginTransaction()

    const clientId = req.user.client_id
    const strategyId = req.params.id
    const { name, description, dataInicial, diasUteis, timelineDays, workflowNodes, timelineNodes, isActive } = req.body

    // Atualizar estratégia
    await connection.execute(
      `
      UPDATE strategies 
      SET name = ?, description = ?, data_inicial = ?, dias_uteis = ?, 
          timeline_days = ?, total_events = ?, is_active = ?, updated_at = NOW()
      WHERE id = ? AND client_id = ?
    `,
      [
        name,
        description,
        dataInicial,
        diasUteis ? 1 : 0,
        JSON.stringify(timelineDays),
        (workflowNodes?.length || 0) + (timelineNodes?.length || 0),
        isActive ? 1 : 0,
        strategyId,
        clientId,
      ],
    )

    // Remover nós existentes
    await connection.execute(
      `
      DELETE FROM strategy_nodes WHERE strategy_id = ? AND client_id = ?
    `,
      [strategyId, clientId],
    )

    // Inserir nós atualizados
    const allNodes = [...(workflowNodes || []), ...(timelineNodes || [])]

    for (const node of allNodes) {
      await connection.execute(
        `
        INSERT INTO strategy_nodes (strategy_id, client_id, node_id, type, title, day, position_x, position_y, config)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          strategyId,
          clientId,
          node.id,
          node.type,
          node.title,
          node.day,
          node.position.x,
          node.position.y,
          JSON.stringify(node.config),
        ],
      )
    }

    await connection.commit()
    res.json({ success: true })
  } catch (error) {
    await connection.rollback()
    console.error("Erro ao atualizar estratégia:", error)
    res.status(500).json({ error: error.message })
  } finally {
    connection.release()
  }
})

// DELETE /api/strategies/:id - Deletar estratégia
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const clientId = req.user.client_id
    const strategyId = req.params.id

    await db.execute(
      `
      DELETE FROM strategies WHERE id = ? AND client_id = ?
    `,
      [strategyId, clientId],
    )

    res.json({ success: true })
  } catch (error) {
    console.error("Erro ao deletar estratégia:", error)
    res.status(500).json({ error: error.message })
  }
})

// POST /api/strategies/:id/execute - Executar estratégia
router.post("/:id/execute", authMiddleware, async (req, res) => {
  try {
    const clientId = req.user.client_id
    const userId = req.user.id
    const strategyId = req.params.id
    const { executionType, targetDay, targetNodeId } = req.body

    // Criar registro de execução
    const [result] = await db.execute(
      `
      INSERT INTO strategy_executions (strategy_id, client_id, user_id, execution_type, target_day, target_node_id, status)
      VALUES (?, ?, ?, ?, ?, ?, 'running')
    `,
      [strategyId, clientId, userId, executionType, targetDay, targetNodeId],
    )

    const executionId = result.insertId

    // Aqui você implementaria a lógica real de execução
    // Por enquanto, apenas simula sucesso
    setTimeout(async () => {
      await db.execute(
        `
        UPDATE strategy_executions 
        SET status = 'completed', completed_at = NOW()
        WHERE id = ?
      `,
        [executionId],
      )
    }, 2000)

    res.json({ success: true, executionId })
  } catch (error) {
    console.error("Erro ao executar estratégia:", error)
    res.status(500).json({ error: error.message })
  }
})

// GET /api/strategies/templates - Buscar templates
router.get("/templates/list", authMiddleware, async (req, res) => {
  try {
    const [templates] = await db.execute(`
      SELECT * FROM strategy_templates 
      WHERE is_public = 1 
      ORDER BY category, name
    `)

    res.json({ templates })
  } catch (error) {
    console.error("Erro ao buscar templates:", error)
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
