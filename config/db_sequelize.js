const Sequelize = require ('sequelize');
const sequelize = new Sequelize ('web2_db', 'postgres', '1234',
{ host: 'localhost', port:5433, dialect: 'postgres'});
var db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.Usuario = require ( '../models/relational/usuario.js')
(sequelize, Sequelize);

db.Categoria = require('../models/relational/categoria')(sequelize, Sequelize);
db.Livro = require('../models/relational/livro')(sequelize, Sequelize);
db.Autor = require('../models/relational/autor')(sequelize, Sequelize);
db.LivroAutor = require('../models/relational/livroAutor')(sequelize, Sequelize);
db.Emprestimo = require('../models/relational/emprestimo')(sequelize, Sequelize);
db.Reserva = require('../models/relational/reserva')(sequelize, Sequelize);

// Categoria 1:N Livro
db.Categoria.hasMany(db.Livro, { foreignKey: 'id_categoria', onDelete: 'SET NULL' });
db.Livro.belongsTo(db.Categoria, { foreignKey: 'id_categoria', as: 'Categoria' });

// Livro N:N Autor (via LivroAutor)
db.Livro.belongsToMany(db.Autor, { through: db.LivroAutor, as: 'Autores', foreignKey: 'id_livro', otherKey: 'id_autor'  });
db.Autor.belongsToMany(db.Livro, { through: db.LivroAutor, as: 'Livros', foreignKey: 'id_autor', otherKey: 'id_livro' });

// Usuario 1:N Emprestimo
db.Usuario.hasMany(db.Emprestimo, { foreignKey: 'id_usuario' });
db.Emprestimo.belongsTo(db.Usuario, { foreignKey: 'id_usuario' });

// Livro 1:N Emprestimo
db.Livro.hasMany(db.Emprestimo, { foreignKey: 'id_livro', as: 'Emprestimos' });
db.Emprestimo.belongsTo(db.Livro, { foreignKey: 'id_livro' });

// Usuario 1:N Reserva
db.Usuario.hasMany(db.Reserva, { foreignKey: 'id_usuario' });
db.Reserva.belongsTo(db.Usuario, { foreignKey: 'id_usuario', as: 'usuario' });

// Livro 1:N Reserva
db.Livro.hasMany(db.Reserva, { foreignKey: 'id_livro' });
db.Reserva.belongsTo(db.Livro, { foreignKey: 'id_livro', as: 'Livro' });

db.sequelize.sync({alter: true}).then(async() => {
  console.log('Tabelas sincronizadas');
  try {
    // 1. Primeiro, apenas procure pelo usuário admin
    const adminExiste = await db.Usuario.findOne({
      where: { login: 'admin' }
    });

    // 2. Se ele NÃO existir (null), então crie-o.
    if (!adminExiste) {
      await db.Usuario.create({
        nome: 'Admin',
        sobrenome: 'do Sistema',
        email: 'admin@admin.com', // Garanta que este e-mail seja único
        login: 'admin',
        senha: 'admin123',
        tipo: 'ADMIN',
        idade: 99,
        sexo: 'Outro',
        cidade: 'Sistema',
        estado: 'PR',
        nacionalidade: 'Brasileiro'
      });
      console.log('>>> Usuário "admin" padrão criado com sucesso!');
    } else {
      console.log('>>> Usuário "admin" padrão já existe. Nenhuma ação necessária.');
    }
  } catch (error) {
  console.error('Erro no script de seeding do admin:', error);
} 
}).catch((err) => {
  console.error('Erro ao sincronizar tabelas:', err);
});
 module.exports = db;