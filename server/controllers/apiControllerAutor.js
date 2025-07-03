const db = require('../config/db_sequelize');

module.exports = {
  // GET /api/autores
  // controllers/apiControllerAutor.js
async getAll(req, res) {
  try {
    const autores = await db.Autor.findAll({ order: [['nome', 'ASC']] });
    
    // Adiciona o link de "self" para cada autor na lista
    const autoresComLinks = autores.map(autor => {
      const autorJSON = autor.toJSON();
      autorJSON.links = [{ rel: "self", method: "GET", href: `/api/autores/${autor.id_autor}` }];
      return autorJSON;
    });

    res.json(autoresComLinks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
},

  // GET /api/autores/:id
  async getById(req, res) {
  try {
    const autor = await db.Autor.findByPk(req.params.id);
    if (autor) {
      // --- INÍCIO DA MELHORIA HATEOAS ---
      const autorJSON = autor.toJSON();
      autorJSON._links = [
        { rel: "self", method: "GET", href: `/api/autores/${autor.id_autor}` },
        { rel: "update", method: "PUT", href: `/api/autores/${autor.id_autor}` },
        { rel: "patch", method: "PATCH", href: `/api/autores/${autor.id_autor}` },
        { rel: "delete", method: "DELETE", href: `/api/autores/${autor.id_autor}` },
        { rel: "books", method: "GET", href: `/api/autores/${autor.id_autor}/livros` } // Link para a rota aninhada!
      ];
      res.json(autorJSON);
    } else {
      res.status(404).json({ error: 'Autor não encontrado' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
},


  async getBooksByAuthor(req, res) {
    try {
      const autor = await db.Autor.findByPk(req.params.id, {
        // Usamos o 'include' do Sequelize para trazer os livros associados
        include: { model: db.Livro, as: 'Livros' } 
      });

      if (autor) {
        res.json(autor.Livros); // Retorna apenas a lista de livros do autor
      } else {
        res.status(404).json({ error: 'Autor não encontrado' });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
},

  // POST /api/autores
  async create(req, res) {
    // REGRA: Apenas admins podem criar
    if (req.usuarioToken.tipo !== 'ADMIN') {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    try {
      const novoAutor = await db.Autor.create({ nome: req.body.nome });
      res.status(201).json(novoAutor);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  // PUT /api/autores/:id
  async update(req, res) {
    if (req.usuarioToken.tipo !== 'ADMIN') {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    try {
      const [updated] = await db.Autor.update({ nome: req.body.nome }, {
        where: { id_autor: req.params.id }
      });
      if (updated) {
        const autorAtualizado = await db.Autor.findByPk(req.params.id);
        res.status(200).json(autorAtualizado);
      } else {
        res.status(404).json({ error: 'Autor não encontrado' });
      }
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  // DELETE /api/autores/:id
  async delete(req, res) {
    if (req.usuarioToken.tipo !== 'ADMIN') {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    try {
      const deleted = await db.Autor.destroy({
        where: { id_autor: req.params.id }
      });
      if (deleted) {
        res.status(204).send(); // 204 No Content
      } else {
        res.status(404).json({ error: 'Autor não encontrado' });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};