module.exports = {
    logRegister (req, res, next) {
    console.log(`[${new Date().toLocaleString()}] ${req.method} ${req.url}`);
    next ();
},
sessionControl (req, res, next) {
    if (req.session && req.session.usuario != undefined) next();
    else if ((req.url == '/') && (req.method == 'GET')) next();
    else if ((req.url == '/login') && (req.method == 'GET')) next(); // Permite acessar a tela de login
    else if ((req.url == '/login') && (req.method == 'POST')) next();
    else if ((req.url).split ('/') [1] == 'recuperarSenha') next();
    else res.redirect ('/');

 }
};
