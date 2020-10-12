var pokemonMoves = [];

function searchMoves() {
    const type = document.getElementById('type').value;
    const power = document.getElementById('power').value;
    const accuracy = document.getElementById('accuracy').value;
    const pp = document.getElementById('pp').value;

    document.getElementById('searchForm').reset();
    document.getElementById('type').value = -1;

    getMoves({type, power, accuracy, pp}).then((context) => {
        var movesText = document.getElementById('movesTemplate').innerHTML;
        var movesTemplate = Handlebars.compile(movesText);
        document.getElementById('moves').innerHTML = movesTemplate(context);

    });
}

function getMoves(params) {
    return new Promise(function(res, rej) {
        const req = new XMLHttpRequest();
        req.open('POST', '/addPokemon/searchMoves', true);
        req.setRequestHeader('Content-Type', 'application/json');
        req.send(JSON.stringify(params));
        req.onload = function(){
            if(req.status >= 200 && req.status < 400) {
                res(JSON.parse(req.responseText));
            } else {
                rej();
            }
        }
    });
}

function addMove(move_id, move_name, type_name, power, accuracy, pp) {
    pokemonMoves.push({move_id, move_name, type_name, power, accuracy, pp});
    displayPokemonMoves();
}

function deleteMove(idx) {
    pokemonMoves.splice(idx, 1);
    displayPokemonMoves();
}

function displayPokemonMoves() {
    var movesText = document.getElementById('pokemonMovesTemplate').innerHTML;
    var movesTemplate = Handlebars.compile(movesText);
    document.getElementById('pokemonMoves').innerHTML = movesTemplate({pokemonMoves});
}

function createPokemon() {
    const name = document.getElementById('name').value;
    const hp = document.getElementById('hp').value;
    const attack = document.getElementById('attack').value;
    const defense = document.getElementById('defense').value;
    const spec_atk = document.getElementById('specAtk').value;
    const spec_def = document.getElementById('specDef').value;
    const speed = document.getElementById('speed').value;
    const type_1 = document.getElementById('type1').value;
    const type_2 = document.getElementById('type2').value;

    if(!name || !hp || !attack || !defense || !spec_atk || !spec_def || !speed || type_1 == -1){
        alert("Name, HP, Attack, Defense, Special Attack, Special Defense, Speed and Type 1 must not be null.");
        return;
    }
    
    addPokemon({name, hp, attack, defense, spec_atk, spec_def, speed, type_1, type_2, pokemonMoves}).then(() => {
        pokemonMoves = [];
        displayPokemonMoves();
        document.getElementById('createForm').reset();
        document.getElementById('type1').value = -1;
        document.getElementById('type2').value = -1;
        alert(`Added ${name}!`);
    }).catch(() => {
        alert("Error creating pokemon. Pokemon names must be unique.");
    });
}

function addPokemon(params) {
    return new Promise(function(res, rej) {
        const req = new XMLHttpRequest();
        req.open('POST', '/addPokemon/addPokemon', true);
        req.setRequestHeader('Content-Type', 'application/json');
        req.send(JSON.stringify(params));
        req.onload = function(){
            if(req.status >= 200 && req.status < 400) {
                res();
            } else {
                rej();
            }
        }
    });
}

