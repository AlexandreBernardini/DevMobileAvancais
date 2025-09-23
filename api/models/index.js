// Modèles de base
const Character = require("./Character");
const Set = require("./Set");
const User = require("./User");
const UserCard = require("./UserCard");
const Deck = require("./Deck");

// Modèles de jeu
const Game = require("./Game");
const Tournament = require("./Tournament");

// Modèles d'économie
const Trade = require("./Trade");
const BoosterPack = require("./BoosterPack");

module.exports = {
    // Modèles de base
    Character,
    Set,
    User,
    UserCard,
    Deck,

    // Modèles de jeu
    Game,
    Tournament,

    // Modèles d'économie
    Trade,
    BoosterPack,
};
