const db = require('../config/db_sequelize'); // ajuste o caminho se necessário

(async () => {
  const usuario = await db.Usuario.findOne({
    where: { login: 'heron' } // troque pelo login que você quer consultar
  });

  if (usuario) {
    console.log(usuario.toJSON());
  } else {
    console.log('Usuário não encontrado');
  }
  process.exit(); // encerra o script após a consulta
})();