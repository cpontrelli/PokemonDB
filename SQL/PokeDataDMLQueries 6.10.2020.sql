-- INDEX.HTML QUERIES

-- Displays players on index page. Accepts search term from user
SELECT player_name, pokemon_count
FROM players
WHERE LOWER(player_name) LIKE '%:nameInput%;

-- Creates new player
INSERT INTO players (player_name, pokemon_count)
VALUES (:usernameEntered, 0);

-- Updates player name
UPDATE players SET player_name = :usernameEntered 
WHERE player_id = :userSelected;

-- Deletes Player
DELETE FROM players WHERE player_id = :idSelected



-- PARTY.HTML QUERIES

-- Selects the pokemon in the player's party
SELECT 
pk.pokemon_name, 
pk.hp, 
pk.attack, 
pk.defense, 
pk.spec_atk,
pk.spec_def,
pk.speed,
t1.type_name,
t2.type_name
FROM
players p
JOIN player_pokemon pp on pp.player_id = p.player_id
JOIN pokemon pk on pk.pokemon_id = pp.pokemon_id
JOIN types t1 on t1.type_id = pk.type_1
LEFT JOIN types t2 on t2.type_id = pk.type_2
WHERE
p.player_id = :idSelected;

-- Adds pokemon to the player's party
INSERT INTO player_pokemon (pokemon_id, player_id) 
VALUES (:pokemonSelected, :playerSelected);

-- Deletes pokemon from the player's party
DELETE FROM player_pokemon 
WHERE pokemon_id = :pokemonSelected AND player_id = :playerSelected;

--Updates pokemon count when pokemon are added or removed from party
UPDATE players SET pokemon_count = pokemon_count + :(1 or -1) WHERE player_id = :playerSelected

-- Displays a list of all pokemon. Filters can be applied with user input
SELECT DISTINCT
pk.pokemon_name, 
pk.hp, 
pk.attack, 
pk.defense, 
pk.spec_atk,
pk.spec_def,
pk.speed,
t1.type_name,
t2.type_name
FROM
pokemon pk
JOIN types t1 on t1.type_id = pk.type_1
LEFT JOIN types t2 on t2.type_id = pk.type_2
JOIN pokemon_moves pm on pm.pokemon_id = pk.pokemon_id
JOIN type_strengths ts1 on pk.type_1 = ts1.type_id
LEFT JOIN type_strengths ts2 on pk.type_2 = ts2.type_id
JOIN type_weaknesses tw1 on pk.type_1 = tw1.type_id
LEFT JOIN type_weaknesses tw2 on pk.type_2 = tw2.type_id
WHERE
(pk.type_1 = :typeSelected OR pk.type_2 = :typeSelected)
AND (ts1.strength_id = :typeSelected OR ts2.strength_id = :typeSelected)
AND (tw1.weakness_id = :typeSelected OR tw2.weakness_id = :typeSelected)
AND pm.move_id = :moveSelected
AND pk.hp >= :minEntered
AND pk.attack >= :minEntered
AND pk.defense >= :minEntered
AND pk.spec_atk >= :minEntered
AND pk.spec_def >= :minEntered
AND pk.speed >= :minEntered;



-- NEW_POKEMON.HTML QUERIES

-- Inserts new pokemon into the pokemon table
INSERT INTO pokemon (pokemon_name, hp, attack, defense, spec_atk, spec_def, speed, type_1, type_2)
VALUES (:nameEntered, :hpEntered, :attackEntered, :defenseEntered, :spec_atkEntered, :specialDefEntered, :speedEntered, type_1Entered, type_2Entered);

-- Adds the selected moves to the pokemon that was created
INSERT INTO pokemon_moves (pokemon_id, move_id)
VALUES ((SELECT pokemon_id FROM pokemon WHERE pokemon_name = :nameEntered), :moveSelected);

-- Displays all moves available. Can be filtered with criteria from the user
SELECT m.move_name, t.type_name, m.power, m.accuracy, m.pp
FROM moves m JOIN types t on t.type_id = m.type_id
WHERE
t.type_id = :type_idEntered
AND m.power >= :powerEntered
AND m.accuracy >= :accuracyEntered
AND m.pp >= :ppEntered



-- NEW_MOVE.HTML QUERIES

--Inserts new moves into the moves table
INSERT INTO moves (move_name, type_id, power, pp, accuracy)
VALUES (:nameEntered, :typeDropDown, :powerEntered, :ppEntered, :accuracyEntered)

--Displays all moves available. Can be filtered with criteria from user
SELECT m.move_name, t.type_name, m.power, m.accuracy, m.pp
FROM moves m JOIN types t on t.type_id = m.type_id
WHERE
t.type_id = :type_idEntered
AND m.power >= :powerEntered
AND m.accuracy >= :accuracyEntered
AND m.pp >= :ppEntered



-- NEW_TYPE.HTML QUERIES

--Inserts new type into the types table
INSERT INTO types(type_name)
VALUES (:nameEntered)

--Update Type Strength and Weakness
INSERT INTO type_strengths(type_id, type_strength_id)
VALUES (:nameEnteredConvertedToType_id, :typeStrengthsFromDropDown)

INSERT INTO type_weaknesses(type_id, type_weaknesses_id)
VALUES (:nameEnteredConvertedToType_id, :typeWeaknessesFromDropDown)

--Displays strengths and weaknesses for each type
SELECT DISTINCT types.type_name, types.type_id, GROUP_CONCAT(DISTINCT strongAgainst) AS strength, GROUP_CONCAT(DISTINCT weakAgainst) AS weakness 
FROM types
LEFT JOIN  (SELECT type_strengths.type_id, type_name AS strongAgainst FROM type_strengths
JOIN types
ON types.type_id = type_strengths.strength_id) AS strength
ON types.type_id = strength.type_id
LEFT JOIN (SELECT type_weaknesses.type_id, type_name AS weakAgainst FROM type_weaknesses
JOIN types
ON types.type_id = type_weaknesses.weakness_id) AS weakness
ON types.type_id = weakness.type_id
GROUP BY types.type_id;



--EDIT_POKEMON_MOVES.HTML

--Display's selected pokemon's moves
SELECT
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
p.pokemon_id = :pokemonSelected
ORDER BY m.move_name asc

--Insert pokemon_move
INSERT INTO pokemon_moves (pokemon_id, move_id) VALUES (:pokemonSelected, :moveSelected)

--Delete pokemon_move
DELETE FROM pokemon_moves WHERE pokemon_id = :pokemonSelected and move_id = :moveSelected


