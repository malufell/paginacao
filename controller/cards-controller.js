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