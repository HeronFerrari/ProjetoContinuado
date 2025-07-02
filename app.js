const express = require ('express');
const session = require ('express-session');
const handlebars = require ('express-handlebars');
const routes = require ('./routers/route');
const apiRoutes = require ('./routers/api');
var cookieParser = require ('cookie-parser');
const app = express ();
const middlewares = require ('./Middlewares/middlewares');
const swaggerUi = require ('swagger-ui-express');

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'API da Biblioteca',
    version: '1.0.0',
    description: 'Documentação da API completa para o sistema de biblioteca.',
  },
  servers: [{ url: 'http://localhost:8081' }],
  tags: [
    { name: 'Autenticação', description: 'Rotas para obter token de acesso' },
    { name: 'Autores', description: 'API para gerenciamento de autores' },
  ],
  paths: {
    '/api/login': {
      post: {
        tags: ['Autenticação'],
        summary: 'Autentica um usuário e retorna um token JWT',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { login: { type: 'string' }, senha: { type: 'string' } } } } },
        },
        responses: {
          '200': { description: 'Login bem-sucedido, token retornado.' },
          '401': { description: 'Credenciais inválidas.' }
        }
      }
    },
    '/api/autores': {
      get: {
        tags: ['Autores'],
        summary: 'Retorna a lista de todos os autores',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Lista de autores.', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Autor' } } } } }
        }
      },
      post: {
        tags: ['Autores'],
        summary: 'Cria um novo autor',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { nome: { type: 'string' } }, required: ['nome'] } } }
        },
        responses: { '201': { description: 'Autor criado com sucesso.' }, '403': { description: 'Acesso negado.' } }
      }
    },
    '/api/autores/{id}': {
      get: {
        tags: ['Autores'],
        summary: 'Retorna um autor pelo seu ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          '200': { description: 'Dados do autor.', content: { 'application/json': { schema: { $ref: '#/components/schemas/Autor' } } } },
          '404': { description: 'Autor não encontrado.' }
        }
      },
      put: {
        tags: ['Autores'],
        summary: 'Atualiza um autor (substituição completa)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { nome: { type: 'string' } } } } } },
        responses: { '200': { description: 'Autor atualizado.' }, '404': { description: 'Autor não encontrado.' } }
      },
      delete: {
        tags: ['Autores'],
        summary: 'Deleta um autor',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { '204': { description: 'Autor deletado com sucesso.' }, '404': { description: 'Autor não encontrado.' } }
      }
    }
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
    },
    schemas: {
      Autor: {
        type: 'object',
        properties: {
          id_autor: { type: 'integer' },
          nome: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  }
};

// Usa o objeto JavaScript diretamente, sem precisar do swagger-jsdoc
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


app.use (express.static (__dirname + '/public'));
app.use (cookieParser());

app.use(session({
    secret: 'otnemucod',
    cookie: {maxAge:30*60*1000},
    resave: false,
    saveUninitialized: false,
}));

app.use (middlewares.logRegister);

app.engine ('handlebars', handlebars.engine ({ 
    defaultLayout: 'main',
    helpers: {
        formatarData: function (date) {
            return new Date(date).toLocaleDateString('pt-BR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
            });
        },
        toUpperCase: function (text) {
            return (text || '').toUpperCase();
        },
        ifCond: function (v1, v2, options) {
            return (v1 == v2) ? options.fn(this) : options.inverse(this);
        },
        json: function(context) {
            return JSON.stringify(context, null, 2);
        },
        and: function (a, b) {
        return a && b;
        },
        eq: (a, b) => a === b,
        or: function (...args) {
        // O último argumento que o Handlebars passa para um block helper é sempre o objeto 'options'.
        const options = args.pop(); 
        // Agora 'args' contém apenas as condições que você passou (os resultados dos seus 'eq').
        for (const arg of args) {
        // Se qualquer uma das condições for 'true'...
        if (arg) {
        // Renderize o que está dentro do bloco {{#or}}. É para isso que serve options.fn(this).
        return options.fn(this); 
        }
        }
        // Se nenhuma condição for 'true', renderize o que estaria num bloco {{else}}, se houver.
        return options.inverse(this);
        },
        not: function(value) {
            return !value;
        },
        // Em app.js, dentro de helpers:

        any: function (...args) {
          // Remove o último argumento, que é sempre o objeto de options.
          args.pop();
          // O loop vai iterar apenas sobre os valores que nos interessam (true/false).
          for (const arg of args) {
            if (arg) {
              return true; // Encontrou um verdadeiro, retorna true.
            }
          }
          // Se o loop terminar, nenhum era verdadeiro, retorna false.
          return false;
        },
        ne: function(a, b,) {
            return Number(a) != Number(b);
        },
        isSelected: function (id_autor, autores) {
            if (!autores || !Array.isArray(autores)) {
                return '';
            }
            return autores.some(autor => autor.id_autor === id_autor) ? 'selected' : '';
        },
    }
}));

app.set ('view engine','handlebars');
app.set('views', __dirname + '/views');

app.use (express.json ());
app.use (express.urlencoded ({ extended: true }));

app.use('/api', apiRoutes); 
app.use('/', middlewares.sessionControl, routes);

app.listen (8081, function () {
console.log ("Servidor no http://localhost:8081")
});