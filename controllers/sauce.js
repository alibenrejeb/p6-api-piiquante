const Sauce = require('../models/sauce');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    delete sauceObject.userId;
    const sauce = new Sauce({
        ...sauceObject,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: [],
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    console.log(sauce);
    sauce.save()
    .then(() => { res.status(201).json({ message: 'Sauce enregistré !' })})
    .catch(error => { 
        console.error(error);
        res.status(500).json( { error: error.message })
    });
};

exports.updateSauce = (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  
    delete sauceObject._userId;
    Sauce.findOne({_id: req.params.id})
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message : 'Not authorized'});
            } else {
                Sauce.updateOne({ _id: req.params.id}, { ...sauceObject, _id: req.params.id})
                .then(() => res.status(200).json({ message : 'Sauce modifié!' }))
                .catch(error => res.status(500).json({ error: error.message }));
            }
        })
        .catch((error) => {
            console.error(error);
            res.status(404).json({ error: error.message });
        });
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id})
    .then(sauce => {
        if (sauce.userId != req.auth.userId) {
            res.status(401).json({message: 'Not authorized'});
        } else {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({_id: req.params.id})
                    .then(() => { res.status(200).json({ message: 'Sauce supprimé !' })})
                    .catch(error => {
                        console.error(error);
                        res.status(500).json({ error: error.message })
                    });
            });
        }
    })
    .catch((error) => {
        console.error(error);
        res.status(500).json({ error: error.message });
    }); 
};

exports.getSauce = (req, res, next) => {
    Sauce.findOne ({ _id: req.params.id })
    .then(sauce => res.status(200).json(sauce))
    .catch(error => {
        console.error(error);
        res.status(404).json({ error: error.message });
    });
};

exports.getAllSauce = (req, res, next) => {
    Sauce.find()
    .then(sauces => res.status(200).json(sauces))
    .catch(error => {
        console.error(error);
        res.status(500).json({ error: error.message })
    });
};

exports.likeSauce = (req, res, next) => {
    const { userId, like } = req.body;
    Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
        let updateQuery = (like === 1) ? {
            $push: {
                usersLiked: userId
            },
            $inc: {
                likes: 1
            }
        } : (like === -1) ? {
            $push: {
                usersDisliked: userId
            },
            $inc: {
                dislikes: 1
            }
        } : (sauce.usersLiked.includes(userId)) ? {
            $pull: {
                usersLiked: userId
            },
            $inc: {
                likes: -1
            }
        } : {
            $pull: {
                usersDisliked: userId
            },
            $inc: {
                dislikes: -1
            }
        };

        Sauce.updateOne({ _id: req.params.id}, updateQuery)
        .then(() => res.status(200).json({ message : 'Sauce modifié!' }))
        .catch(error => {
            console.error(error);
            res.status(500).json({ error: error.message })
        });
    })
    .catch((error) => {
        console.error(error);
        res.status(500).json({ error: error.message });
    });
};