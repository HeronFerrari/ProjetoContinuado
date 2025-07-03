const jwt = require('jsonwebtoken');
const JWT_SECRET = 'sEnHaSeCrEtA'; // Substitua pela sua chave secreta real

module.exports = {
    logRegister (req, res, next) {
    console.log(`[${new Date().toLocaleString()}] ${req.method} ${req.url}`);
    next ();
},
sessionControl (req, res, next) {
    const publicRoutes = [
      '/login',
      '/',
      '/usuarioCreate', // Adicionamos a base da rota aqui
      '/recuperarSenha'
    ];

    // Verifica se o usuário está logado OU se a rota está na lista de exceções
    if ((req.session && req.session.usuario) || publicRoutes.includes(req.path)) {
      // Se estiver logado, adiciona os dados do usuário para serem usados nas views
      if (req.session.usuario) {
        res.locals.usuario = req.session.usuario;
        res.locals.logado = true;
      }
      return next(); // Deixa a requisição passar
    }
    
    // Se não estiver logado e a rota não for pública, redireciona para o login
    return res.redirect('/login');
  },
  // Middleware para verificar o token JWT
  verificarToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Pega o token do header "Bearer <token>"

    if (!token) {
      return res.sendStatus(401); // Não autorizado (sem token)
    }

    jwt.verify(token, JWT_SECRET, (err, usuario) => {
      if (err) {
        return res.sendStatus(403); // Proibido (token inválido ou expirado)
      }
      req.usuarioToken = usuario; // Adiciona os dados do usuário do token à requisição
      next(); // Passa para a próxima etapa (a rota da API)
    });
  }

};
