const authService = require("../services/authService");

const authController = {
  async login(req, res) {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    try {
      const result = await authService.login(username, password);
      if (!result.success) {
        return res.status(401).json({ message: result.message });
      }
      // In a real app, you might want to set the token in an HttpOnly cookie
      return res.json({ token: result.token, user: result.user });
    } catch (error) {
      console.error("Error in login controller:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  async registerAdmin(req, res) {
    // This is a protected route or for initial setup only.
    // Ensure proper authorization checks if exposed publicly.
    const { username, password, email } = req.body;
    if (!username || !password || !email) {
      return res.status(400).json({ message: "Username, password, and email are required for admin registration" });
    }

    try {
      const result = await authService.registerAdmin(username, password, email);
      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }
      return res.status(201).json({ message: "Admin user registered successfully", user: result.user });
    } catch (error) {
      console.error("Error in registerAdmin controller:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  // Example of a protected route controller
  async getProfile(req, res) {
    // req.user should be populated by authentication middleware (e.g., verifyToken)
    if (!req.user) {
        return res.status(401).json({ message: "Not authorized, user data not found in token" });
    }
    res.json({ message: "Profile data", user: req.user });
  },

  async getMe(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false, 
          message: "Usuário não autenticado" 
        });
      }

      // Buscar informações do cliente se user tem client_id
      let clientData = null;
      if (req.user.client_id) {
        const { pool } = require('../config/db');
        const [clientRows] = await pool.execute(
          'SELECT id, name FROM clients WHERE id = ?',
          [req.user.client_id]
        );
        
        if (clientRows.length > 0) {
          clientData = clientRows[0];
        }
      }

      res.json({
        success: true,
        user: {
          id: req.user.id,
          username: req.user.username,
          email: req.user.email,
          client_id: req.user.client_id,
          client: clientData
        }
      });
    } catch (error) {
      console.error('Erro ao buscar informações do usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
};

module.exports = authController;

