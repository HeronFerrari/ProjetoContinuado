# Biblioteca Digital - Projeto Web2

## Descrição
Sistema web para gerenciamento de uma biblioteca digital, com perfis de bibliotecários e leitores, cadastro de livros, autores, categorias, empréstimos, reservas e comentários sobre livros.

---

## Tecnologias Utilizadas
- Node.js
- Express
- Sequelize (PostgreSQL)
- Mongoose (MongoDB)
- Handlebars (views)

---

## Como rodar o projeto

1. **Clone ou extraia o projeto**
2. **Instale as dependências**
   ```
   npm install
   ```
3. **Configure os bancos de dados**
   - **PostgreSQL:**  
     - Crie o banco `web2_db`  
     - Ajuste usuário/senha/porta em `config/db_sequelize.js` se necessário
   - **MongoDB:**  
     - Use MongoDB local ou Atlas  
     - Ajuste a string de conexão em `config/db_mongoose.js` se necessário

4. **Inicie o servidor**
   ```
   node app.js
   ```
   O servidor rodará em [http://localhost:8081](http://localhost:8081)

---

## Observações importantes

- **Usuários e livros** ficam no banco relacional (PostgreSQL).
- **Comentários** ficam no banco NoSQL (MongoDB), mas referenciam os IDs de usuário e livro do relacional.
- O relacionamento entre comentários, usuários e livros é feito via campos `id_usuario` e `id_livro` no documento do comentário.
- O diagrama relacional não inclui a tabela de comentários, pois ela está apenas no MongoDB.

---

## Usuários de teste

- Você pode cadastrar usuários pelo formulário de cadastro.
- Para login, use os dados cadastrados.

---

## Estrutura de pastas

- `models/relational/` — Models Sequelize (PostgreSQL)
- `models/noSql/` — Models Mongoose (MongoDB)
- `controllers/` — Lógica das rotas
- `routes/` ou `routers/` — Definição das rotas
- `views/` — Templates Handlebars

---

## Dúvidas

Qualquer dúvida, entre em contato pelo e-mail institucional.# P r o j e t o   c o n t i n u a d o  
 