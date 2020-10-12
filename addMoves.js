module.exports = function(){
    var express = require('express');
    var router = express.Router();

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

    function insertMove(res, mysql, insert) {
        return new Promise(function (resolve, reject) {
            var query = `INSERT INTO moves (move_name, type_id, power, accuracy, pp) VALUES (?, ?, ?, ?, ?)`;
            mysql.pool.query(query, insert, function(error, results, fields){
                if(error){
                    reject();
                } else {
                    resolve();
                }
            });
        });
    }

    router.get('/', function(req, res) {
       var context = {};
       var mysql = req.app.get('mysql');
       context.jsscripts = ['checkMoves.js'];
       getMoves(res, mysql, context)
            .then(() => getTypes(res, mysql, context))
            .then(() => res.render('addMoves', context))
            .catch(() => console.log('Error pulling moves'));
    });

    router.post('/searchMoves', function(req, res){
        var context = {};
        var mysql = req.app.get('mysql');
        context.jsscripts = ['checkMoves.js'];
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
        getMovesSearch(res, mysql, context, query, insert)
            .then(() => getTypes(res, mysql, context))
            .then(() => res.render('addMoves', context))
            .catch(() => console.log('Error pulling moves'));
    });

    router.post('/addMove', function(req, res) {
        var context = {};
        var mysql = req.app.get('mysql');
        context.jsscripts = ['checkMoves.js'];
        insert = [req.body.name.toLowerCase(),
                  req.body.typeSelected, 
                  req.body.powerSelected || null,
                  req.body.accuracySelected || null, 
                  req.body.ppSelected];
        insertMove(res, mysql, insert)
             .then(() => getMoves(res, mysql, context))
             .then(() => getTypes(res, mysql, context))
             .then(() => res.render('addMoves', context))
             .catch(() => console.log('Error inserting move'));
     });

    return router;
}();