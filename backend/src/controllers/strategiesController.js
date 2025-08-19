const db = require("../config/db")

class AutomationController {
  // Buscar todas as estratégias do cliente
  async getStrategies(req, res) {
    try {
      const clientId = req.user.client_id

      const [strategies] = await db.execute(
        `
        SELECT s.*, 
               COUNT(sn.id) as total_nodes,
               u.name as created_by_name,
               (SELECT COUNT(*) FROM strategy_executions se WHERE se.strategy_id = s.id) as total_executions
        FROM strategies s
        LEFT JOIN strategy_nodes sn ON s.id = sn.strategy_id
        LEFT JOIN users u ON s.user_id = u.id
        WHERE s.client_id = ?
        GROUP BY s.id
        ORDER BY s.updated_at DESC
      `,
        [clientId],
      )

      // Parse JSON fields
      const formattedStrategies = strategies.map((strategy) => ({
        ...strategy,
        timeline_days: JSON.parse(strategy.timeline_days),
        dias_uteis: Boolean(strategy.dias_uteis),
        is_active: Boolean(strategy.is_active),
      }))

      res.json({ strategies: formattedStrategies })
    } catch (error) {
      console.error("Erro ao buscar estratégias:", error)
      res.status(500).json({ error: error.message })
    }
  }

  // Buscar estratégia específica com nós
  async getStrategy(req, res) {
    try {
      const clientId = req.user.client_id
      const strategyId = req.params.id

      // Buscar estratégia
      const [strategies] = await db.execute(
        `
        SELECT s.*, u.name as created_by_name
        FROM strategies s
        LEFT JOIN users u ON s.user_id = u.id
        WHERE s.id = ? AND s.client_id = ?
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
      strategy.timeline_days = JSON.parse(strategy.timeline_days)
      strategy.dias_uteis = Boolean(strategy.dias_uteis)
      strategy.is_active = Boolean(strategy.is_active)

      // Separar nós por tipo (workflow vs timeline)
      strategy.workflowNodes = []
      strategy.timelineNodes = []

      nodes.forEach((node) => {
        const formattedNode = {
          id: node.node_id,
          type: node.type,
          title: node.title,
          day: node.day,
          position: {
            x: Number.parseFloat(node.position_x),
            y: Number.parseFloat(node.position_y),
          },
          config: node.config ? JSON.parse(node.config) : {},
        }

        if (node.day === -999) {
          strategy.workflowNodes.push(formattedNode)
        } else {
          strategy.timelineNodes.push(formattedNode)
        }
      })

      res.json({ strategy })
    } catch (error) {
      console.error("Erro ao buscar estratégia:", error)
      res.status(500).json({ error: error.message })
    }
  }

  // Buscar logs de execução
  async getExecutionLogs(req, res) {
    try {
      const clientId = req.user.client_id
      const strategyId = req.params.id
      const { limit = 50, offset = 0 } = req.query

      const [logs] = await db.execute(
        `
        SELECT sel.*, se.execution_type, se.started_at as execution_started
        FROM strategy_execution_logs sel
        JOIN strategy_executions se ON sel.execution_id = se.id
        WHERE sel.strategy_id = ? AND sel.client_id = ?
        ORDER BY sel.created_at DESC
        LIMIT ? OFFSET ?
      `,
        [strategyId, clientId, Number.parseInt(limit), Number.parseInt(offset)],
      )

      // Parse JSON fields
      const formattedLogs = logs.map((log) => ({
        ...log,
        details: log.details ? JSON.parse(log.details) : null,
        webhook_response: log.webhook_response ? JSON.parse(log.webhook_response) : null,
      }))

      res.json({ logs: formattedLogs })
    } catch (error) {
      console.error("Erro ao buscar logs:", error)
      res.status(500).json({ error: error.message })
    }
  }
}

module.exports = new AutomationController()
