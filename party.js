module.exports = function(){
    var express = require('express');
    var router = express.Router();

    function getPlayerPokemon(res, mysql, context, id) {
        return new Promise(function (resolve, reject) {
            var insert = [id];
            var query = `SELECT
            p.pokemon_count,
            pk.pokemon_id, 
            pk.pokemon_name, 
            pk.hp, 
            pk.attack, 
            pk.defense, 
            pk.spec_atk,
            pk.spec_def,
            pk.speed,
            t1.type_name as type1_name,
            t2.type_name as type2_name
            FROM
            players p
            JOIN player_pokemon pp on pp.player_id = p.player_id
            JOIN pokemon pk on pk.pokemon_id = pp.pokemon_id
            JOIN types t1 on t1.type_id = pk.type_1
            LEFT JOIN types t2 on t2.type_id = pk.type_2
            WHERE
            p.player_id = ?
            ORDER by pokemon_id asc`;
            mysql.pool.query(query, insert, function(error, results, fields){
                if(error){
                    reject();
                } else { 
                    context.playersPokemon = results;
                    context.pokemonCount = results[0].pokemon_count;
                    resolve();
                }
            });
        });
    }

    function getPokemon(res, mysql, context) {
        return new Promise(function (resolve, reject) {
            var query = `SELECT DISTINCT
            pk.pokemon_id,
            pk.pokemon_name, 
            pk.hp, 
            pk.attack, 
            pk.defense, 
            pk.spec_atk,
            pk.spec_def,
            pk.speed,
            t1.type_name as type1_name,
            t2.type_name as type2_name
            FROM
            pokemon pk
            JOIN types t1 on t1.type_id = pk.type_1
            LEFT JOIN types t2 on t2.type_id = pk.type_2
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
            var query = `SELECT move_id, move_name FROM moves ORDER BY move_name asc`;
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

    function addPlayerPokemon(mysql, insert) {
        return new Promise(function (resolve, reject) {
            var query = `INSERT INTO player_pokemon (pokemon_id, player_id) VALUES (?, ?)`;
            mysql.pool.query(query, insert, function(error, results, fields){
                if(error){
                    reject();
                } else {
                    resolve();
                }
            });
        });
    }

    function removePlayerPokemon(mysql, insert) {
        return new Promise(function (resolve, reject) {
            var query = `DELETE FROM player_pokemon WHERE pokemon_id = ? AND player_id = ? LIMIT 1`;
            mysql.pool.query(query, insert, function(error, results, fields){
                if(error){
                    reject();
                } else {
                    resolve();
                }
            });
        });
    }

    function adjustPokemonCount(mysql, insert){
        return new Promise(function (resolve, reject) {
            var query = `UPDATE players SET pokemon_count = pokemon_count + ? WHERE player_id = ?;`;
            mysql.pool.query(query, insert, function(error, results, fields){
                if(error){
                    reject();
                } else {
                    resolve();
                }
            });
        });
    }

    function getPokemonSearch(res, mysql, context, insertTM, insertS) {
        return new Promise(function (resolve, reject) {
            var query = `SELECT DISTINCT
            pk.pokemon_id,
            pk.pokemon_name, 
            pk.hp, 
            pk.attack, 
            pk.defense, 
            pk.spec_atk,
            pk.spec_def,
            pk.speed,
            t1.type_name as type1_name,
            t2.type_name as type2_name
            FROM
            pokemon pk
            JOIN types t1 on t1.type_id = pk.type_1
            LEFT JOIN types t2 on t2.type_id = pk.type_2
            JOIN pokemon_moves pm on pm.pokemon_id = pk.pokemon_id
            JOIN type_strengths ts1 on t1.type_id = ts1.type_id
            LEFT JOIN type_strengths ts2 on t2.type_id = ts2.type_id
            JOIN type_weaknesses tw1 on t1.type_id = tw1.type_id
            LEFT JOIN type_weaknesses tw2 on t2.type_id = tw2.type_id
            WHERE
            ${insertTM[0]}
            AND ${insertTM[1]}
            AND ${insertTM[2]}
            AND ${insertTM[3]}
            AND pk.hp >= ?
            AND pk.attack >= ?
            AND pk.defense >= ?
            AND pk.spec_atk >= ?
            AND pk.spec_def >= ?
            AND pk.speed >= ? 
            ORDER BY pk.pokemon_id`;
            mysql.pool.query(query, insertS, function(error, results, fields){
                if(error){
                    console.log(error);
                    reject();
                } else {
                    context.pokemon = results;
                    resolve();
                }
            });
        });
    }

    router.post('/', function(req, res){
        req.session.player_id = req.body.player_id;
        var context = {};
        var mysql = req.app.get('mysql');
        context.jsscripts = ['checkCount.js'];
        getPlayerPokemon(res, mysql, context, req.session.player_id)
            .then(() => getPokemon(res, mysql, context))
            .then(() => getMoves(res, mysql, context))
            .then(() => getTypes(res, mysql, context))
            .then(() => res.render('party', context))
            .catch(() => console.log('Error pulling data'));
    });

    router.get('/', function(req, res){
        var context = {};
        var mysql = req.app.get('mysql');
        context.jsscripts = ['checkCount.js'];
        getPlayerPokemon(res, mysql, context, req.session.player_id)
            .then(() => getPokemon(res, mysql, context))
            .then(() => getMoves(res, mysql, context))
            .then(() => getTypes(res, mysql, context))
            .then(() => res.render('party', context))
            .catch(() => console.log('Error pulling data'));
    });

    //*********TO-DO: Prevent players from adding more than 6 pokemon
    router.post('/addPokemon', function(req, res){
        var context = {};
        var mysql = req.app.get('mysql');
        context.jsscripts = ['checkCount.js'];
        addPlayerPokemon(mysql, [req.body.pokemon_id, req.session.player_id])
            .then(() => adjustPokemonCount(mysql, [1, req.session.player_id]))
            .then(() => getPlayerPokemon(res, mysql, context, req.session.player_id))
            .then(() => getPokemon(res, mysql, context))
            .then(() => getMoves(res, mysql, context))
            .then(() => getTypes(res, mysql, context))
            .then(() => res.render('party', context))
            .catch(() => console.log('Error pulling data'));
    });

    router.post('/removePokemon', function(req, res){
        var context = {};
        var mysql = req.app.get('mysql');
        context.jsscripts = ['checkCount.js'];
        removePlayerPokemon(mysql, [req.body.pokemon_id, req.session.player_id])
            .then(() => adjustPokemonCount(mysql, [-1, req.session.player_id]))
            .then(() => getPlayerPokemon(res, mysql, context, req.session.player_id))
            .then(() => getPokemon(res, mysql, context))
            .then(() => getMoves(res, mysql, context))
            .then(() => getTypes(res, mysql, context))
            .then(() => res.render('party', context))
            .catch(() => console.log('Error pulling data'));
    });

    
    //******TO-DO: find better way to prevent SQL injection and build query*******
    router.post('/searchPokemon', function(req, res){
        var context = {};
        var mysql = req.app.get('mysql');
        context.jsscripts = ['checkCount.js'];
        //used < 1000000000 to prevent SQL Injection
        if(req.body.type < 1000000000 && req.body.type != -1){
            req.body.type = `(pk.type_1 = ${req.body.type} OR pk.type_2 = ${req.body.type})`;
        } else {
            req.body.type = `(pk.type_1 IS NOT NULL OR (pk.type_2 IS NULL OR pk.type_2 IS NOT NULL))`;
        }
        if(req.body.strength < 1000000000 && req.body.strength != -1){
            req.body.strength = `(ts1.strength_id = ${req.body.strength} OR ts2.strength_id = ${req.body.strength})`;
        } else {
            req.body.strength = `(ts1.strength_id IS NOT NULL OR (ts2.strength_id IS NULL OR ts2.strength_id IS NOT NULL))`;
        }
        if(req.body.weakness < 1000000000 && req.body.weakness != -1) {
            req.body.weakness = `(tw1.weakness_id = ${req.body.weakness} OR tw2.weakness_id = ${req.body.weakness})`;
        } else {
            req.body.weakness = `(tw1.weakness_id IS NOT NULL OR (tw2.weakness_id IS NULL OR tw2.weakness_id IS NOT NULL))`;
        }
        if(req.body.move < 1000000000 && req.body.move != -1) {
            req.body.move = `pm.move_id = ${req.body.move}`;
        } else {
            req.body.move = `(pm.move_id IS NOT NULL)`;
        }
        var insertTypesMoves = [req.body.type, 
                      req.body.strength, 
                      req.body.weakness, 
                      req.body.move];
        var insertStats = [req.body.minHP || 0,
                      req.body.minAttack || 0,
                      req.body.minDefense || 0,
                      req.body.minSpecAtk || 0,
                      req.body.minSpecDef || 0,
                      req.body.minspeed || 0];
        getPlayerPokemon(res, mysql, context, req.session.player_id)
            .then(() => getPokemonSearch(res, mysql, context, insertTypesMoves, insertStats))
            .then(() => getMoves(res, mysql, context))
            .then(() => getTypes(res, mysql, context))
            .then(() => res.render('party', context))
            .catch(() => console.log('Error pulling Search Data'));
    });

    return router;
}();