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
  }
};
