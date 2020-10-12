module.exports = function(){
    var express = require('express');
    var router = express.Router();
    
    function getPokemon(res, mysql, context) {
        return new Promise(function (resolve, reject) {
            var query = `SELECT
                         pk.pokemon_id,
                         pk.pokemon_name
                         FROM
                         pokemon pk
                         ORDER BY pokemon_id asc`;
            mysql.pool.query(query, function(error, results, fields){
                if(error){
                    reject();
                } else {
                    context.pokemon = results;
                    resolve();
                }
            });
        });
    }

    function getMoves(res, mysql, context) {
        return new Promise(function (resolve, reject) {
            var query = `SELECT m.move_id, m.move_name, t.type_name, m.power, m.accuracy, m.pp
                         FROM moves m JOIN types t on t.type_id = m.type_id
                         ORDER BY move_name asc`;
            mysql.pool.query(query, function(error, results, fields){
                if(error){
                    reject();
                } else {
                    context.moves = results;
                     resolve();
                }
                
            });
        });
    }

    function getTypes(res, mysql, context) {
        return new Promise(function (resolve, reject) {
            var query = `SELECT type_id, type_name FROM types ORDER BY type_name asc`;
            mysql.pool.query(query, function(error, results, fields){
                if(error){
                    reject();
                } else {
                    context.types = results;
                    resolve();
                }
            });
        });
    }

    function getSelectedPokemon(res, mysql, context, insert) {
        return new Promise(function (resolve, reject) {
            var query = `SELECT
                         p.pokemon_id,
                         p.pokemon_name
                         FROM
                         pokemon p
                         WHERE
                         p.pokemon_id = ?`;
            mysql.pool.query(query, insert, function(error, results, fields){
                if(error){
                    reject();
                } else {
                    context.pokemonName = results[0].pokemon_name;
                    context.pokemonId = results[0].pokemon_id;
                    resolve();
                }
            });
        });
    }

    function getSelectedPokemonMoves(res, mysql, context, insert) {
        return new Promise(function (resolve, reject) {
            var query = `SELECT
                         p.pokemon_id,
                         p.pokemon_name,
                         m.move_id,
                         m.move_name,
                         t.type_name,
                         m.power,
                         m.accuracy,
                         m.pp
                         FROM
                         pokemon p 
                         JOIN pokemon_moves pm on pm.pokemon_id = p.pokemon_id
                         LEFT JOIN moves m on m.move_id = pm.move_id
                         LEFT JOIN types t on t.type_id = m.type_id
                         WHERE
                         p.pokemon_id = ?
                         ORDER BY m.move_name asc`;
            mysql.pool.query(query, insert, function(error, results, fields){
                if(error){
                    reject();
                } else {
                    context.pokemonMoves = results;
                    resolve();
                }
            });
        });
    }

    function insertPokemonMove(res, mysql, context, insert) {
        return new Promise(function (resolve, reject) {
            var query = `INSERT INTO pokemon_moves (pokemon_id, move_id) VALUES (?, ?)`;
            mysql.pool.query(query, insert, function(error, results, fields){
                if(error){
                    reject();
                } else {
                    resolve();
                }
            });
        });
    }

    function deletePokemonMove(res, mysql, context, insert) {
        return new Promise(function (resolve, reject) {
            var query = `DELETE FROM pokemon_moves WHERE pokemon_id = ? and move_id = ?`;
            mysql.pool.query(query, insert, function(error, results, fields){
                if(error){
                    reject();
                } else {
                    resolve();
                }
            });
        });
    }

    function getMovesSearch(res, mysql, context, query, insert) {
        return new Promise(function (resolve, reject) {
            mysql.pool.query(query, insert, function(error, results, fields){
                if(error){
                    reject();
                } else {
                    context.moves = results;
                    resolve();
                }
            });
        });
    }

    router.get('/', function(req, res){
        var context = {};
        var mysql = req.app.get('mysql');
        context.jsscripts = ['checkPokemonId.js'];
        getPokemon(res, mysql, context)
            .then(() => getMoves(res, mysql, context))
            .then(() => getTypes(res, mysql, context))
            .then(() => res.render('editPokemonMoves', context))
            .catch(() => console.log('Error pulling data'));
    });

    router.post('/selectPokemon', function(req, res){
        var context = {};
        var mysql = req.app.get('mysql');
        context.jsscripts = ['checkPokemonId.js'];
        getPokemon(res, mysql, context)
            .then(() => getMoves(res, mysql, context))
            .then(() => getTypes(res, mysql, context))
            .then(() => getSelectedPokemon(res, mysql, context, [req.body.pokemon_id]))
            .then(() => getSelectedPokemonMoves(res, mysql, context, [req.body.pokemon_id]))
            .then(() => res.render('editPokemonMoves', context))
            .catch(() => console.log('Error pulling data'));
    });

    router.post('/addMove', function(req, res){
        var context = {};
        var mysql = req.app.get('mysql');
        context.jsscripts = ['checkPokemonId.js'];
        getPokemon(res, mysql, context)
            .then(() => getMoves(res, mysql, context))
            .then(() => getTypes(res, mysql, context))
            .then(() => insertPokemonMove(res, mysql, context, [req.body.pokemon_id, req.body.move_id]))
            .then(() => getSelectedPokemon(res, mysql, context, [req.body.pokemon_id]))
            .then(() => getSelectedPokemonMoves(res, mysql, context, [req.body.pokemon_id]))
            .then(() => res.render('editPokemonMoves', context))
            .catch(() => console.log('Error pulling data'));
    });

    router.post('/deleteMove', function(req, res){
        var context = {};
        var mysql = req.app.get('mysql');
        context.jsscripts = ['checkPokemonId.js'];
        getPokemon(res, mysql, context)
            .then(() => getMoves(res, mysql, context))
            .then(() => getTypes(res, mysql, context))
            .then(() => deletePokemonMove(res, mysql, context, [req.body.pokemon_id, req.body.move_id]))
            .then(() => getSelectedPokemon(res, mysql, context, [req.body.pokemon_id]))
            .then(() => getSelectedPokemonMoves(res, mysql, context, [req.body.pokemon_id]))
            .then(() => res.render('editPokemonMoves', context))
            .catch(() => console.log('Error pulling data'));
    });

    router.post('/searchMoves', function(req, res){
        var context = {};
        var mysql = req.app.get('mysql');
        context.jsscripts = ['checkPokemonId.js'];
        var query = `SELECT m.move_id, m.move_name, t.type_name, m.power, m.accuracy, m.pp 
                    FROM moves m JOIN types t on t.type_id = m.type_id`;
        var insert = [];
        var count = 0;
        if(req.body.type != -1 || req.body.power || req.body.accuracy || req.body.pp) {
            query = query.concat(' WHERE ')
        }
        if(req.body.type != -1) {
            query = query.concat('m.type_id = ?');
            insert.push(req.body.type);
            count++;
        }
        if(req.body.power){
            if(count != 0){
                query = query.concat(' and ');
            }
            query = query.concat('m.power >= ?');
            insert.push(req.body.power);
            count++;
        }
        if(req.body.accuracy){
            if(count != 0){
                query = query.concat(' and ');
            }
            query = query.concat('m.accuracy >= ?');
            insert.push(req.body.accuracy);
            count++;
        }
        if(req.body.pp){
            if(count != 0){
                query = query.concat(' and ');
            }
            query = query.concat('m.pp >= ?');
            insert.push(req.body.pp);
            count++;
        }
        query = query.concat(' ORDER BY m.move_name asc');
        getPokemon(res, mysql, context)
            .then(() => getMovesSearch(res, mysql, context, query, insert))
            .then(() => getTypes(res, mysql, context))
            .then(() => getSelectedPokemon(res, mysql, context, [req.body.pokemon_id]))
            .then(() => getSelectedPokemonMoves(res, mysql, context, [req.body.pokemon_id]))
            .then(() => res.render('editPokemonMoves', context))
            .catch(() => console.log('Error pulling data'));
    });

    return router;
}();