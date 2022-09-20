const mongoose = require('mongoose');
//s'assurer que deux utilisateurs ne puissent pas utiliser la même adresse e-mail
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true}
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);