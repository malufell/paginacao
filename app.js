const express = require('express');
const app = express();
const port = 3000;
const Cards = require('../paginacao-com-JS-sequelize/controller/cards-controller.js');


const path = require('path')

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//configuração da rota
app.get('/', Cards.buscaTodosCards);

app.listen(3000, () => console.log(`servidor rodando na porta ${port}`));