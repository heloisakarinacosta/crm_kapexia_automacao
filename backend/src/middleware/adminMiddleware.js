const adminMiddleware = (req, res, next) => {
  try {
    // Por enquanto, assumimos que todos os usuários autenticados são administradores
    // Em uma implementação futura, podemos adicionar um campo 'role' na tabela administrators
    // e verificar se o usuário tem privilégios de administrador
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    // TODO: Implementar verificação de role quando necessário
    // if (req.user.role !== 'admin') {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Acesso negado. Privilégios de administrador requeridos.'
    //   });
    // }

    next();
  } catch (error) {
    console.error('Erro na verificação de privilégios:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

module.exports = adminMiddleware;

