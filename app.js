const express = require ('express');
const session = require ('express-session');
const handlebars = require ('express-handlebars');
const routes = require ('./routers/route');

var cookieParser = require ('cookie-parser');
const app = express ();
const middlewares = require ('./middlewares/middlewares');

app.use (express.static (__dirname + '/public'));
app.use (cookieParser());

app.use(session({
    secret: 'otnemucod',
    cookie: {maxAge:30*60*1000},
    resave: false,
    saveUninitialized: false,
}));

app.use (middlewares.logRegister,middlewares.sessionControl);

app.engine ('handlebars', handlebars.engine ({ 
    defaultLayout: 'main',
    helpers: {
        formatarData: function (date) {
            return new Date(date).toLocaleDateString('pt-BR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
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

app.use (routes);

app.listen (8081, function () {
console.log ("Servidor no http://localhost:8081")
});