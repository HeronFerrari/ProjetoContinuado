const express = require('express');
const apiRoute = express.Router();
const middlewares = require('../Middlewares/middlewares'); 
const apiControllerAutor = require('../controllers/apiControllerAutor');
const controllerUsuario = require('../controllers/controllerUsuario');

/** * @swagger
 * /api/login:
 * post:
 * summary: Realiza o login do usuário e retorna um token JWT
 * tags: [Autenticação]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * login:
 * type: string
 * description: Nome de usuário para login
 * example: usuario123
 * senha:
 * type: string
 * description: Senha do usuário
 * example: senhaSegura123
 * responses:
 * '200':
 * description: Login bem-sucedido, retorna o token JWT.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * token:
 * type: string
 * description: Token JWT gerado para o usuário autenticado
 * example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
 * '401':
 * description: Credenciais inválidas, usuário não encontrado ou senha incorreta.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * error:
 * type: string
 * description: Mensagem de erro indicando que as credenciais são inválidas
 * example: Credenciais inválidas
 * security:
 * - bearerAuth: []
 * responses:
 * '500':
 * description: Erro interno do servidor ao processar o login.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * error:
 * type: string
 * description: Mensagem de erro indicando que ocorreu um erro interno
 * example: Erro interno no servidor.
 * */
apiRoute.post('/login', controllerUsuario.apiLogin);


/**
 * @swagger
 * /api/autores:
 * get:
 * summary: Retorna a lista de todos os autores
 * tags: [Autores]
 * security:
 * - bearerAuth: []
 * responses:
 * '200':
 * description: Lista de autores.
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * $ref: '#/components/schemas/Autor'
 */
apiRoute.get('/autores', middlewares.verificarToken, apiControllerAutor.getAll);


/**
 * @swagger
 * /api/autores/{id}:
 * get:
 * summary: Retorna um autor pelo seu ID
 * tags: [Autores]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * schema:
 * type: integer
 * required: true
 * description: ID do autor
 * responses:
 * '200':
 * description: Dados do autor.
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Autor'
 * '404':
 * description: Autor não encontrado.
 */
apiRoute.get('/autores/:id', middlewares.verificarToken, apiControllerAutor.getById);

/**
 * @swagger
 * /api/autores:
 * post:
 * summary: Cria um novo autor
 * tags: [Autores]
 * security:
 * - bearerAuth: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - nome
 * properties:
 * nome:
 * type: string
 * responses:
 * '201':
 * description: Autor criado com sucesso.
 * '403':
 * description: Acesso negado.
 */
apiRoute.post('/autores', middlewares.verificarToken, apiControllerAutor.create);

/**
 * @swagger
 * /api/autores/{id}:
 * put:
 * summary: Atualiza um autor (substituição completa)
 * tags: [Autores]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: integer
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * nome:
 * type: string
 * responses:
 * '200':
 * description: Autor atualizado.
 * '404':
 * description: Autor não encontrado.
 */
apiRoute.put('/autores/:id', middlewares.verificarToken, apiControllerAutor.update);

/**
 * @swagger
 * /api/autores/{id}:
 * patch:
 * summary: Atualiza um autor parcialmente
 * tags: [Autores]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: integer
 * requestBody:
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * nome:
 * type: string
 * responses:
 * '200':
 * description: Autor atualizado.
 * '404':
 * description: Autor não encontrado.
 */
apiRoute.patch('/autores/:id', middlewares.verificarToken, apiControllerAutor.update);

/**
 * @swagger
 * /api/autores/{id}:
 * delete:
 * summary: Deleta um autor
 * tags: [Autores]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: integer
 * responses:
 * '204':
 * description: Autor deletado com sucesso (sem conteúdo).
 * '404':
 * description: Autor não encontrado.
 */
apiRoute.delete('/autores/:id', middlewares.verificarToken, apiControllerAutor.delete);

/**
 * @swagger
 * /api/autores/{id}/livros:
 * get:
 * summary: Retorna a lista de livros de um autor específico
 * tags: [Autores]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: integer
 * description: ID do autor
 * responses:
 * '200':
 * description: Lista de livros do autor.
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * $ref: '#/components/schemas/Livro'
 * '404':
 * description: Autor não encontrado.
 */
apiRoute.get('/autores/:id/livros', middlewares.verificarToken, apiControllerAutor.getBooksByAuthor);


module.exports = apiRoute;