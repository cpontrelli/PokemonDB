module.exports = function(){
    var express = require('express');
    var router = express.Router();

    function getPlayers(res, mysql, context) {
        return new Promise(function (resolve, reject) {
            mysql.pool.query("SELECT player_id, player_name, pokemon_count FROM players", function(error, results, fields){
                if(error){
                    reject();
                } else {
                    context.players = results;
                    resolve();
                }
            });
        });
    }

    function deletePlayer(mysql, id) {
        return new Promise(function (resolve, reject) {
            var query = `DELETE FROM players WHERE player_id = ?`;
            mysql.pool.query(query, [id], function(error, results, fields){
                if(error){
                    reject();
                } else {
                    resolve();
                }
            });
        });
    }

    function getPlayersSearch(res, mysql, context, name) {
        return new Promise(function (resolve, reject) {
            var insert = ["%" + name.toLowerCase() + "%"];
            var query = "SELECT player_id, player_name, pokemon_count FROM players WHERE LOWER(player_name) LIKE ?";
            mysql.pool.query(query, insert, function(error, results, fields){
                if(error){
                    reject();
                } else {
                    context.players = results;
                    resolve();
                }
            });
        });
    }

    function addPlayer(res, mysql, context, name) {
        return new Promise(function (resolve, reject) {
            var insert = [name, 0];
            var query = "INSERT INTO players (player_name, pokemon_count) VALUES (?, ?)";
            mysql.pool.query(query, insert, function(error, results, fields){
                if(error){
                    reject();
                } else {
                    resolve();
                }
                
            });
        });
    }

    function updatePlayer(res, mysql, insert) {
        return new Promise(function (resolve, reject) {
            var query = "UPDATE players SET player_name = ? WHERE player_id = ?";
            mysql.pool.query(query, insert, function(error, results, fields){
                if(error){
                    reject();
                } else {
                    resolve();
                }
                
            });
        });
    }

    router.get('/', function(req, res){
        var context = {};
        var mysql = req.app.get('mysql');
        context.layout = 'home';
        context.jsscripts = ['usernames.js'];
        getPlayers(res, mysql, context)
            .then(() => res.render('index', context))
            .catch(() => console.log('Error pulling players'));
    });

    router.post('/searchPlayer', function(req, res){
        var context = {};
        var mysql = req.app.get('mysql');
        context.layout = 'home';
        context.jsscripts = ['usernames.js'];
        getPlayersSearch(res, mysql, context, req.body.username)
            .then(() => res.render('index', context))
            .catch(() => console.log('Error pulling player search'));
    });

    router.post('/addPlayer', function(req, res){
        var context = {};
        var mysql = req.app.get('mysql');
        context.layout = 'home';
        context.jsscripts = ['usernames.js'];
        addPlayer(res, mysql, context, req.body.newUser)
            .then(() => getPlayers(res, mysql, context))
            .then(() => res.render('index', context))
            .catch(() => console.log('Error adding player'));
    });

    router.post('/deletePlayer', function(req, res){
        var context = {};
        var mysql = req.app.get('mysql');
        context.layout = 'home';
        context.jsscripts = ['usernames.js'];
        deletePlayer(mysql, req.body.player_id)
            .then(() => getPlayers(res, mysql, context))
            .then(() => res.render('index', context))
            .catch(() => console.log('Error deleting player'));
    });

    router.post('/updatePlayer', function(req, res){
        var context = {};
        var mysql = req.app.get('mysql');
        context.layout = 'home';
        context.jsscripts = ['usernames.js'];
        updatePlayer(res, mysql, [req.body.player_name, req.body.player_id])
            .then(() => getPlayers(res, mysql, context))
            .then(() => res.render('index', context))
            .catch(() => console.log('Error updating player'));
    });

    return router;
}();