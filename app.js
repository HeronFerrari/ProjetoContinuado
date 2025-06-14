const routes = require ('./routers/route');
const handlebars = require ('express-handlebars');
const express = require ('express');
const app = express ();

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