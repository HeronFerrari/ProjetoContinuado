const Sequelize = require ('sequelize');
const sequelize = new Sequelize ('web2_db', 'postgres', '1234',
{ host: 'localhost', port:5433, dialect: 'postgres'});
var db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.Usuario = require ( '../models/relational/usuario.js')
(sequelize, Sequelize);

db.sequelize.sync().then(() => {
  console.log('Tabelas sincronizadas');
}).catch((err) => {
  console.log('Erro ao sincronizar tabelas:', err);
});

db.Categoria = require('../models/relational/categoria')(sequelize, Sequelize);
db.Livro = require('../models/relational/livro')(sequelize, Sequelize);
db.Autor = require('../models/relational/autor')(sequelize, Sequelize);
db.LivroAutor = require('../models/relational/livroAutor')(sequelize, Sequelize);
db.Emprestimo = require('../models/relational/emprestimo')(sequelize, Sequelize);
db.Reserva = require('../models/relational/reserva')(sequelize, Sequelize);

// Categoria 1:N Livro
db.Categoria.hasMany(db.Livro, { foreignKey: 'id_categoria', onDelete: 'NO ACTION' });
db.Livro.belongsTo(db.Categoria, { foreignKey: 'id_categoria', as: 'Categoria' });

// Livro N:N Autor (via LivroAutor)
db.Livro.belongsToMany(db.Autor, { through: db.LivroAutor, foreignKey: 'id_livro' });
db.Autor.belongsToMany(db.Livro, { through: db.LivroAutor, foreignKey: 'id_autor' });

// Usuario 1:N Emprestimo
db.Usuario.hasMany(db.Emprestimo, { foreignKey: 'id_usuario' });
db.Emprestimo.belongsTo(db.Usuario, { foreignKey: 'id_usuario' });

// Livro 1:N Emprestimo
db.Livro.hasMany(db.Emprestimo, { foreignKey: 'id_livro' });
db.Emprestimo.belongsTo(db.Livro, { foreignKey: 'id_livro' });

// Usuario 1:N Reserva
db.Usuario.hasMany(db.Reserva, { foreignKey: 'id_usuario' });
db.Reserva.belongsTo(db.Usuario, { foreignKey: 'id_usuario' });

// Livro 1:N Reserva
db.Livro.hasMany(db.Reserva, { foreignKey: 'id_livro' });
db.Reserva.belongsTo(db.Livro, { foreignKey: 'id_livro' });

 module.exports = db;