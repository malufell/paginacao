## Paginação em tabela many-to-many (sequelize)

Utilizando nodeJS, sequelize, postgres, EJS e bootstrap! 

Quando implementei a paginação [no meu projeto](https://github.com/malufell/meu-caderno-de-receitas) precisei investir um tempo além do esperado para resolver algumas questões que surgiram no caminho. Por isso criei este respositório com um exemplo de paginação em tabelas com relacionamento many-to-many e compartilho meus registros sobre o assunto.

**Conteúdo:**
- [Começando pelo resultado final](#começando-pelo-resultado-final)
- [Como rodar a aplicação](#como-rodar-a-aplicação)
- [Tutorial:](#tutorial)
    - [Implementar a base da aplicação](#implementar-a-base-da-aplicação)
    - [Entendendo a lógica por trás da paginação :nerd_face:](#entendendo-a-lógica-por-trás-da-paginação-nerd_face)
    - [Uso do limit no método de busca em tabela many-to-many](#uso-do-limit-no-método-de-busca-em-tabela-many-to-many)
    - [Implementando o relacionamento super many-to-many](#implementando-o-relacionamento-super-many-to-many)
    - [Implementando a view](#implementando-a-view)
    - [Implementando o método de busca com limit](#implementando-o-método-de-busca-com-limit)

## Começando pelo resultado final

![Untitled_ Jan 21, 2021 11_45 AM](https://user-images.githubusercontent.com/62160705/105366624-4dbc8580-5bde-11eb-98ca-f7ac30b8be5f.gif)

## Como rodar a aplicação

1. No terminal, clonar o projeto: `git clone https://github.com/malufell/paginacao.git`

2. Entrar na pasta do projeto: `cd paginacao`

3. Instalar as dependências: `npm install`

4. Configurar o postgres: 

No arquivo `config.json` da pasta "config" é necessário atualizar as informações abaixo conforme o postgres instalado no seu PC:

```javascript
{
  "development": {
    "username": "postgres",
    "password": "admin",
    "database": "tutorial",
    "host": "127.0.0.1",
    "dialect": "postgres"
  }
}
```

5. Rodar a migração do Sequelize para criar a tabela no banco de dados: `npx sequelize-cli db:migrate`

6. Atualizar os seeds para incluir registros de teste na tabela: `npx sequelize-cli db:seed:all`

7. Rodar a aplicação: `npm start`

---
## Tutorial

### Implementar a base da aplicação

Já documentei em outros textos qual a base necessária para implementar uma aplicação com nodeJS, utilizando o sequelize e EJS (e eu consulto esses registros sempre que preciso iniciar um novo projeto :blush:)

Por isso, abaixo vou listar de forma objetiva como implementar a base, mas incluí nos tópicos os links onde comentei cada etapa com mais detalhes!

1- [inicializar o servidor com Express:](https://github.com/malufell/meu-caderno-de-receitas/wiki/3.-Primeiros-passos-com-EJS#instalar-o-express-e-inicializar-o-servidor)
  - inicializar o projeto com node: `npm init -y`
  - instalar o express: `npm install express`
  - configurar o servidor:
```javascript  
    const express = require('express');
    const app = express();
    const port = 3000;

    //configuração da rota
    app.get('/', function(req, res) {
        res.send("iniciando servidor com Express")
    });

    app.listen(3000, () => console.log(`servidor rodando na porta ${port}`));
``` 

2- [instalar o sequelize](https://github.com/malufell/meu-caderno-de-receitas/wiki/4.-Sequelize-com-PostgreSQL#sobre-orms-e-a-instala%C3%A7%C3%A3o-do-sequelize)
  - instalar: `npm install sequelize sequelize-cli`
  - inicializar projeto: `npx sequelize-cli init`
  - configurar o arquivo `.sequelizerc` (se necessário)
  
3- [instalar o postgres](https://github.com/malufell/meu-caderno-de-receitas/wiki/4.-Sequelize-com-PostgreSQL#como-conectar-o-banco-de-dados-postgresql-com-o-sequelize):
  - instalar: `npm install pg`
  - configurar os dados do banco: pasta "config", arquivo `config.json`:
```javascript 
  "development": {
    "username": "postgres",
    "password": "admin",
    "database": "tutorial",
    "host": "127.0.0.1",
    "dialect": "postgres"
  },
```

4- [criar as tabelas (modelos)](https://github.com/malufell/meu-caderno-de-receitas/wiki/4.-Sequelize-com-PostgreSQL#como-criar-uma-tabela-no-banco-de-dados-via-sequelize) - terei duas tabelas, "Cards" e "Categorias"
  - criar modelo para os cards: `npx sequelize-cli model:create --name Cards --attributes nome:string,descricao:string`
  - criar modelo para as categorias: `npx sequelize-cli model:create --name Categorias --attributes nome:string`
  - rodar migrações: `npx sequelize-cli db:migrate`
  - (obs.: sobre os relacionamentos e a tabela de junção comentarei detalhadamente mais abaixo)
  
5- [popular as tabelas com dados fictícios para teste (seeds)](https://github.com/malufell/meu-caderno-de-receitas/wiki/4.-Sequelize-com-PostgreSQL#como-incluir-registros-na-tabela-via-sequelize---seeds)
  - criar seeds para os cards:`npx sequelize-cli seed:generate --name demo-cards`
  - criar seeds para as categorias:`npx sequelize-cli seed:generate --name demo-categorias`
  - incluir os dados manualmente nos arquivos de seeds: estão na pasta "seeders"
  - rodar os seeds: `npx sequelize-cli db:seed:all`
  
6- [configurar a view com EJS](https://github.com/malufell/meu-caderno-de-receitas/wiki/3.-Primeiros-passos-com-EJS#instalar-o-ejs-e-configura%C3%A7%C3%A3o-b%C3%A1sica-da-view)
  - instalar EJS: `npm install ejs`
  - criar uma pasta chamada "views" e dentro um arquivo `index.js`
  - configurar EJS: no arquivo `app.js`
```javascript  
  const path = require('path')
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));
```
  - configurar na rota a exibição da view "index":
  ```javascript
  app.get('/', function(req, res) {
    res.render('index')
  });
```

Dalee, com estes 6 passos já temos um banco de dados pronto e a view com EJS pronta para receber informações!

A partir dessa base, vêm as novidades que vou escrever aqui!

---

### Entendendo a lógica por trás da paginação :nerd_face:

Para implementar a navegação por páginas são necessárias algumas informações:

- `limit`: quantidade de itens que deve aparecer em cada página;
- `offset`: quantos itens o método de busca deve "pular" para exibir, sem repetição, os itens na página (exemplos logo abaixo);
- qual a página atual em que o usuário se encontra (informação recebida através de `req.query`);
- qual a quantidade total de páginas deve existir (calculada assim: quantidade total de registros na tabela dividida pelo limite de itens por página)

Exemplos de offset, considerando um limite de 4 itens por página:
1. estou na 1ª página, os 4 primeiros itens (1,2,3,4) devem aparecer, portanto não "pula" a exibição de nenhum item, logo, o `offset` é zero;
2. estou na 2ª página, os 4 itens **seguintes** (5,6,7,8) devem aparecer, portanto o `offset` é 4, para pular e não exibir os primeiros 4 itens;
3. estou na 3ª página, os 4 itens **seguintes** aos da última página (9,10,11,12) devem aparecer, portanto o `offset` é 8, já que os 8 primeiros itens já foram exibidos nas páginas anteriores e agora devem ser "pulados"... E assim segue! 

Então o método de busca precisa receber essas informações para saber quais itens devem ser exibidos no momento. O sequelize possui estes atributos para implementação no método, como pode ser lido [aqui](https://sequelize.org/master/manual/model-querying-basics.html#limits-and-pagination)!

---

### Uso do limit no método de busca em tabela many-to-many

Antes de partir para o método, vou compartilhar um problema que me tomou bastante tempo para ser resolvido!

Inicialmente eu havia configurado o relacionamento many-to-many entre as tabelas exatamente como [registrei aqui nesse texto](https://github.com/malufell/meu-caderno-de-receitas/wiki/c.-Tabelas-com-relacionamentos-many-to-many-e-one-to-many), e tudo funcionou normalmente! Todos os métodos estavam ok: `create`, `update`, `findOne`, `findAll`... 

O problema apareceu quando fui implementar a paginação e inclui o `limit` no método `findAll`, aí deu o maior problema! A exibição das informações ficou completamente errada - e quando eu tirava o `limit` tudo voltava a funcionar.

:warning: essa era a configuração do método que funcionava normalmente sem o `limit`:

```javascript
const receitas = await database.Receitas.findAll({ 
    attributes: ['id', 'nome', 'imagem', 'imagemReceita'],
    include: [{ 
        model: database.Categorias,
        as: 'categorias', 
        through: { attributes: [] }, 
    }], 
    where: whereCondicoes, 
    order: ordenacao,
});
```

Então pesquisei muito, encontrei várias perguntas iguais a minha, muitas sem resposta, até encontrar essa luz no fim do tunel: [query-with-many-to-many-relationship-using-where-and-limit](https://stackoverflow.com/questions/63929662/sequelize-query-with-many-to-many-relationship-using-where-and-limit).

:bulb: descobri que a solução seria: criar um model para minha tabela de junção e configurar um relacionamento diferente, o [**Super Many-to-Many.**](https://sequelize.org/master/manual/advanced-many-to-many.html#the-best-of-both-worlds--the-super-many-to-many-relationship). 

Como consta na documentação, *um relacionamento "Muitos para Muitos" não é muito diferente de dois relacionamentos "Um para Muitos". As tabelas no banco de dados têm a mesma aparência*.

Então, ao criar o model para tabela de junção e implementar o relacionamento "super many-to-many", eu poderia utilizar a tabela de junção no `include` do método de busca, já que o relacionamento com essa tabela é de "um-para-muitos". 

:runner: assim estaria fugindo desse bug doido que acontece quando tento incluir o limit no relacionamento many-to-many (no fundo não sei se é bug ou um comportamento esperado que eu ainda não entendi!). 

- assim ficou o método com as alterações acima citadas:

```javascript
const receitas = await database.Receitas.findAll({ 
    attributes: ['id', 'nome', 'imagem', 'imagemReceita', 'createdAt', 'updatedAt'],
    include: [{ 
        model: database.ReceitasCategorias, 
        as: 'ReceitasCategorias',
        attributes: ['categoriaId'],
        where: whereCategoria
    }], 
    where: whereCondicoes, 
    order: ordenacao,
    limit: limite,
    offset: offset,
});
```

Nos próximos tópicos compartilho o registro de como implementei a paginação de exemplo deste repositório.

--- 

### Implementando o relacionamento super many-to-many

A tabela "Cards" tem um relacionamento de "muitos-para-muitos" com a tabela "Categorias", portanto, uma Categoria pode ter muitos Cards e um Card pode ter muitas Categorias. 
Tanto "Cards" quanto "Categorias" terão um relacionamento "um-para-muitos" com a tabela de junção "CardsCategorias".

Configurando estes dois relacionamentos para cada tabela, temos a associação [super many-to-many](https://sequelize.org/master/manual/advanced-many-to-many.html#the-best-of-both-worlds--the-super-many-to-many-relationship).

- Model da tabela "Cards":

```javascript
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Cards extends Model {

    static associate(models) {

      //super muitos para muitos
      Cards.belongsToMany(models.Categorias, { 
        as: 'NomeCategorias', 
        through:'CardsCategorias',
        foreignKey: 'cardId'
      });

      Cards.hasMany(models.CardsCategorias, {
        as: 'cardsCategorias',
        foreignKey: 'cardId'

      });
    };
  };
  Cards.init({
    nome: DataTypes.STRING,
    descricao: DataTypes.STRING,
    categorias: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Cards',
  });
  return Cards;
};
```

- Model da tabela "Categorias":

```javascript
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Categorias extends Model {

    static associate(models) {

         //super muitos para muitos
         Categorias.belongsToMany(models.Cards, { 
          as: 'cards', 
          through: 'CardsCategorias', 
          foreignKey: 'categoriaId'
        });
  
        Categorias.hasMany(models.CardsCategorias, {
          as:'categoriasCards',
          foreignKey: 'categoriaId'
        });
      }
  };
  Categorias.init({
    nome: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Categorias',
  });
  return Categorias;
};
```

- Model da tabela de junção "CardsCategorias":

```javascript
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CardsCategorias extends Model {

    static associate(models) {

        //super muitos para muitos
        CardsCategorias.belongsTo(models.Categorias, {
            as:'Categorias',
            foreignKey: 'id'
        });

        CardsCategorias.belongsTo(models.Cards, {
            as: 'Cards',
            foreignKey: 'id'
        });
    };
}; CardsCategorias.init({
      id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
      },
      cardId: {
        type: DataTypes.INTEGER,
      },
      categoriaId: { 
      type: DataTypes.INTEGER,
      allowNull: true
      },
     }, {
      sequelize,
      modelName: 'CardsCategorias',
  });

    return CardsCategorias;
};
```

Assuntos relacionados:

[Como criar relacionamentos entre tabelas - Sequelize (many-to-many e one-to-many)](https://github.com/malufell/meu-caderno-de-receitas/wiki/c.-Tabelas-com-relacionamentos-many-to-many-e-one-to-many)

---

### Implementando a view

Para simplificar, estilizei a view com bootstrap!

Fiz uso de dois componentes:
- Os [cards](https://getbootstrap.com/docs/4.5/components/card/) para exibir algumas informações na tela;

- A [paginação](https://getbootstrap.com/docs/4.5/components/pagination/): *um grande bloco de links conectados para nossa paginação, tornando os links difíceis de perder e facilmente escalonáveis tudo isso enquanto fornece grandes áreas de acesso. A paginação é construída com elementos de lista HTML para que os leitores de tela possam anunciar o número de links disponíveis.*

Obs.: no final do arquivo incluí um dropdown, como gambiarra mesmo, para incluir uma seleção de valor para o limit e assim deixar mais interativo.

```EJS
<!DOCTYPE html>
<html lang="pt-br">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Exemplo paginação</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/css/bootstrap.min.css"
            integrity="sha384-TX8t27EcRE3e/ihU7zmQxVncDAy5uIKz4rEkgIXeMed4M0jlfIDPvg6uqKI2xXr2" 
              crossorigin="anonymous">
    </head>
    <body>
        <!-- CARDS -->
        <div class="row row-cols-md-2 row-cols-lg-3 mt-5 mr-5 ml-5 d-flex justify-content-center">
            <% cards.forEach(function(card) { %>
                <div class="card text-white bg-secondary  mb-3 m-3" style="max-width: 18rem;">
                    <div class="card-body">
                    <h5 class="card-title"><%= card.nome %></h5>
                    <p class="card-text"><%= card.descricao %></p>
                    </div>
                </div>
                <% }) %>
            </div>

        <!-- MOSTRA VALOR DO OFFSET -->
        <p class="mt-5 d-flex justify-content-center">
          <strong>
            Com o limit igual a <%= limit %>, na página <%= paginaAtual %> o offset é <%= offset %>!
          </strong> 
        </p>
    
        <!-- PAGINAÇÃO -->
        <nav aria-label="Page navigation ">
            <ul class="pagination justify-content-center mt-5">
                <li class="page-item">
                    <% if(totalPaginas > 1) { %>      
                    <a class="page-link" href="/?paginaAtual=<%=paginaAnterior%>&limit=<%=limit%>" tabindex="-1" 
                      aria-disabled="true">Anterior</a>
                </li>
                <% for (let i=1; i < (totalPaginas + 1); i++) { %>
                    <li class="page-item <%=(paginaAtual == i) ? "active" : "" %>">
                        <a class="page-link " href="/?paginaAtual=<%=i%>&limit=<%=limit%>"><%=i%></a>
                    </li>
                <% } %>
                    <a class="page-link" href="/?paginaAtual=<%=proximaPagina%>&limit=<%=limit%>">Próxima</a>
                <% } %>  
                </li>
            </ul>
        </nav>  

        <!-- SELEÇÃO DE VALOR PARA O LIMITE DE ITENS POR PÁGINA -->
        <!-- atenção: usar dropdown aqui foi uma gambi (o foco era a paginação) -->
        <div class="d-flex justify-content-center mt-5">
            <ul class="nav nav-tabs">
                <li class="nav-item dropdown">
                  <a class="nav-link dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" 
                    aria-expanded="false">Selecione um valor para o limit:</a>
                  <div class="dropdown-menu">
                      <% for(let i=1; i<=8; i++) { %>
                        <% paginaAtual = 1 %>
                        <a class="dropdown-item" href="/?paginaAtual=<%=paginaAtual%>&limit=<%=i%>"><%=i%></a>
                      <% } %>  
                  </div>
                </li>
              </ul>
        </div>

    <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"
        integrity="sha384-DfXdz2htPH0lsSSs5nCTpuj/zy4C+OGpamoFVy38MVBnE+IbbVYUew+OrCXaRkfj"
         crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.1/dist/umd/popper.min.js"
        integrity="sha384-9/reFTGAW83EW2RDu2S0VKaIzap3H66lZH81PoYlFhbGU+6BZp6G7niu735Sk7lN"
        crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/js/bootstrap.min.js"
        integrity="sha384-w1Q4orYjBQndcko6MimVbzY0tgp4pWB4lZ7lr30WKz0vr/aWKhXdBNmNb5D92v7s"
        crossorigin="anonymous"></script>

    </body>
</html>
```

Assuntos relacionados:

[Como exibir na view os dados de um array declarado em outro arquivo](https://github.com/malufell/meu-caderno-de-receitas/wiki/3.-Primeiros-passos-com-EJS#como-exibir-na-view-os-dados-de-um-array-declarado-em-outro-arquivo)

---
### Implementando o método de busca com limit

Fiz uso do método `findAndCountAll`, já que além da busca é necessário saber a quantidade total de registros existentes.

- método completo:        
```javascript
const database = require('../models');

class Cards {

    static async buscaTodosCards(req, resp) {
        // paginação
        const paginaAtual = req.query.paginaAtual ? req.query.paginaAtual : 1;
        const limite = req.query.limit ? req.query.limit : 3;
        const offset = paginaAtual == 1 ? 0 : (Number(paginaAtual) - 1) * limite; 
        
        try {

            // busca e conta todos os cards
            const cards = await database.Cards.findAndCountAll({ 
                attributes: ['id', 'nome', 'descricao', 'createdAt', 'updatedAt'],
                include: [{ 
                    model: database.CardsCategorias, 
                    as: 'cardsCategorias',
                    attributes: ['categoriaId'],
                }], 
                limit: limite,
                offset: offset,
                order: [[ 'nome', 'ASC' ]]
            });
            
            const totalPaginas = Math.ceil(cards.count / limite);

            return resp.render('index', { 
                cards: cards.rows,
                paginaAtual: paginaAtual,
                paginaAnterior: (paginaAtual == 1) ? paginaAtual : (Number(paginaAtual) - 1),
                proximaPagina: (paginaAtual == totalPaginas) ? paginaAtual : (Number(paginaAtual) + 1),
                totalPaginas: totalPaginas,
                limit: limite,
                offset: offset
            });

        } catch (error) {
            return resp.status(500).json(error.message);
        }
    };
}

module.exports = Cards;
```

No método, temos as variáveis utilizadas no cálculo da paginação:

```javascript
const paginaAtual = req.query.paginaAtual ? req.query.paginaAtual : 1;
const limite = req.query.limit ? req.query.limit : 3;
const offset = paginaAtual == 1 ? 0 : (Number(paginaAtual) - 1) * limite; 
const totalPaginas = Math.ceil(cards.count / limite);
```

A `totalPaginas` está depois do método de busca (que guarda as informações na variável `cards`) pois para o cálculo é necessário utilizar o atributo `count`.

Também estou passando para a view as variáveis `paginaAnterior` e `proximaPagina`, que são utilizadas nos extremos da paginação. Incluí uma condição para que o valor de `paginaAnterior` não pudesse ficar negativo, e outra condição para que a `proximaPagina` não pudesse ficar com um valor superior ao total de páginas existentes.

Assuntos relacionados:

[Criando um método de busca no controller](https://github.com/malufell/meu-caderno-de-receitas/wiki/5.-EJS-e-Sequelize-juntos,-no-padr%C3%A3o-MVC!#criando-um-m%C3%A9todo-de-busca-no-controller)

---

Este é o resultado:

![Untitled_ Jan 21, 2021 11_45 AM](https://user-images.githubusercontent.com/62160705/105366624-4dbc8580-5bde-11eb-98ca-f7ac30b8be5f.gif)


![gif](https://media.giphy.com/media/l2JJwZrryo94jvRSw/giphy.gif)




