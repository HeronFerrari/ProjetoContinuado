const express = require ('express');
const session = require ('express-session');
const handlebars = require ('express-handlebars');
const routes = require ('./routers/route');

var cookieParser = require ('cookie-parser');
const app = express ();
const middlewares = require ('./middlewares/middlewares');

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
        formatDate: function (date) {
            return new Date(date).toLocaleDateString('pt-BR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
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
        eq: (a, b) => a == b,
        or: function(a, b, options) {
            return (a || b) ? options.fn(this) : options.inverse(this);
        }
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