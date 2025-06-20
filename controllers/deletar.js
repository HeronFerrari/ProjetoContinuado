const db = require('../config/db_sequelize');

(async () => {
  await db.sequelize.query('TRUNCATE "LivroAutors", "Livros" RESTART IDENTITY CASCADE;');
  console.log('Todas as tabelas de livros e associações foram truncadas!');
  process.exit();
})();