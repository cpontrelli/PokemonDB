module.exports = function(){
    var express = require('express');
    var router = express.Router();

    function getTypes(res, mysql, context) {
        return new Promise(function (resolve, reject) {
            var query = `SELECT DISTINCT types.type_name, types.type_id, GROUP_CONCAT(DISTINCT strongAgainst) AS strength, GROUP_CONCAT(DISTINCT weakAgainst) AS weakness 
                        FROM types
                        LEFT JOIN  (SELECT type_strengths.type_id, type_name AS strongAgainst FROM type_strengths
                            JOIN types
                            ON types.type_id = type_strengths.strength_id) AS strength
                        ON types.type_id = strength.type_id
                        LEFT JOIN (SELECT type_weaknesses.type_id, type_name AS weakAgainst FROM type_weaknesses
                            JOIN types
                            ON types.type_id = type_weaknesses.weakness_id) AS weakness
                        ON types.type_id = weakness.type_id
                        GROUP BY types.type_id; `;
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

    function insertType(res, mysql, context, insert) {
        return new Promise(function (resolve, reject) {
            var query = `INSERT INTO types (type_name) VALUES (?)`;
            mysql.pool.query(query, insert, function(error, results, fields){
                if(error){
                    reject();
                } else {
                    resolve();
                }
            });
        });
    }

    function insertTypeStrength(res, mysql, context, insert) {
        return new Promise(function (resolve, reject) {
            var query = `INSERT INTO type_strengths (type_id, strength_id) VALUES (?, ?)`;
            mysql.pool.query(query, insert, function(error, results, fields){
                if(error){
                    reject();
                } else {
                    resolve();
                }
            });
        });
    }

    function insertTypeWeakness(res, mysql, context, insert) {
        return new Promise(function (resolve, reject) {
            var query = `INSERT INTO type_weaknesses (type_id, weakness_id) VALUES (?, ?)`;
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
       context.jsscripts = ['checkTypes.js'];
       getTypes(res, mysql, context)
            .then(() => res.render('addTypes', context))
            .catch(() => console.log('Error pulling types'));
    });

    router.post('/addType', function(req, res) {
        var context = {};
        var mysql = req.app.get('mysql');
        context.jsscripts = ['checkTypes.js'];
        insertType(res, mysql, context, [req.body.newType.toLowerCase()])
             .then(() => getTypes(res, mysql, context))
             .then(() => res.render('addTypes', context))
             .catch(() => console.log('Error pulling types'));
     });

     router.post('/addTypeStrength', function(req, res) {
        var context = {};
        var mysql = req.app.get('mysql');
        context.jsscripts = ['checkTypes.js'];
        insertTypeStrength(res, mysql, context, [req.body.typeForStrength, req.body.typeStrength])
             .then(() => getTypes(res, mysql, context))
             .then(() => res.render('addTypes', context))
             .catch(() => console.log('Error pulling types'));
     });

     router.post('/addTypeWeakness', function(req, res) {
        var context = {};
        var mysql = req.app.get('mysql');
        context.jsscripts = ['checkTypes.js'];
        insertTypeWeakness(res, mysql, context, [req.body.typeForWeakness, req.body.typeWeakness])
             .then(() => getTypes(res, mysql, context))
             .then(() => res.render('addTypes', context))
             .catch(() => console.log('Error pulling types'));
     });

    return router;
}();