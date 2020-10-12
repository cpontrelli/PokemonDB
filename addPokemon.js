module.exports = function(){
    var express = require('express');
    var router = express.Router();

    function getMoves(res, mysql, context) {
        return new Promise(function (resolve, reject) {
            var query = `SELECT m.move_id, m.move_name, t.type_name, m.power, m.accuracy, m.pp FROM moves m JOIN types t on t.type_id = m.type_id ORDER BY move_name asc`
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

    function getTypes(res, mysql, context) {
        return new Promise(function (resolve, reject) {
            var query = `SELECT type_id, type_name FROM types ORDER BY type_name asc`
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

    function insertPokemon(mysql, insert) {
        return new Promise(function (resolve, reject) {
            var query = `INSERT INTO pokemon (pokemon_name, hp, attack, defense, spec_atk, spec_def, speed, type_1, type_2)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`;
            mysql.pool.query(query, insert, function(error, results, fields){
                if(error){
                    reject();
                } else {
                    resolve(results.insertId);
                }
            });
        });
    }

    function insertPokemonMoves(mysql, insertM, pokemon_id) {
        return new Promise(function (resolve, reject) {
            var query = `INSERT INTO pokemon_moves (pokemon_id, move_id) VALUES `;
            insertM.forEach(element => {
                query = query.concat(`(${pokemon_id}, ?),`);
            });
            if(insertM.length > 0) {
                mysql.pool.query(query.slice(0, -1), insertM, function(error, results, fields){
                    if(error){
                        console.log(error);
                        reject();
                    } else {
                        resolve();
                    }
                });
            } else {
                resolve();
            }
            
        });
    }

    router.get('/', function(req, res){
        var context = {};
        var mysql = req.app.get('mysql');
        context.jsscripts = ['setMoves.js'];
        getTypes(res, mysql, context)
            .then(() => getMoves(res, mysql, context))
            .then(() => res.render('addPokemon', context))
            .catch(() => console.log('Error pulling moves or types'));
    });

    router.post('/searchMoves', function(req, res){
        var context = {};
        var mysql = req.app.get('mysql');
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
        query = query.concat(' ORDER BY m.move_name asc')
        getMovesSearch(res, mysql, context, query, insert)
            .then(() => {
                res.status(200);
                res.send(JSON.stringify(context));
            })
            .catch(() => {
                res.status(400);
                res.send();
                console.log('Error pulling moves or types');
            });
    });

    router.post('/addPokemon', function(req, res){
        var context = {};
        var mysql = req.app.get('mysql');
        insertM = []
        if(req.body.type_2 == -1) {
            req.body.type_2 = null;
        }
        insert = [req.body.name.toLowerCase(), 
                  req.body.hp, 
                  req.body.attack, 
                  req.body.defense, 
                  req.body.spec_atk, 
                  req.body.spec_def, 
                  req.body.speed, 
                  req.body.type_1, 
                  req.body.type_2];
        req.body.pokemonMoves.forEach(move => {
            insertM.push(move.move_id);
        });
        insertPokemon(mysql, insert)
            .then((pokemon_id) => insertPokemonMoves(mysql, insertM, pokemon_id))
            .then(() => {
                res.status(200);
                res.send(JSON.stringify(context));
            })
            .catch(() => {
                res.status(400);
                res.send();
            });
    });

    return router;
}();