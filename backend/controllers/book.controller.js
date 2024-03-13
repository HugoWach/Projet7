const Book = require("../models/book.model");
const fs = require('fs');

exports.getAllBooks = async (req, res, next) => {
    try {
        const books = await Book.find();
        return res.status(200).json(books);
    }
    catch (error) {
        return res.status(500).json(error);
    }
}

exports.getBookById = async (req, res, next) => {
    try {
        const book = await Book.findOne({ _id: req.params.id });
        return res.status(200).json(book);
    }
    catch (error) {
        return res.status(400).json(error);
    }
}

exports.getBestBooks = async (req, res, next) => {
    try {
        const bestBooks = await Book.find().sort({ averageRating: -1 }).limit(3);
        return res.status(200).json(bestBooks);
    }
    catch (error) {
        return res.status(404).json(error);
    }
}

exports.createNewBook = async (req, res, next) => {
    const BookObject = JSON.parse(req.body.book);
    console.log(req.file.size)

    const nextYear = new Date().getFullYear() + 1;

    if (BookObject.title.length >= 100 || BookObject.author.length >= 50 || BookObject.genre.length >= 50) {
        return res.status(400).json({ message: "Merci de raccourcir le texte car il est trop long" })
    }
    if (BookObject.year > nextYear) {
        return res.status(400).json({ message: "Merci de renseigner une date de publication valide" });
    }
    if (req.file.size > 5000000) {
        return res.status(400).json({ message: "Le poids de l'image est trop volumineux" });
    }

    try {
        const bookAdd = new Book({
            ...BookObject,
            userId: req.auth.userId,
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        });
        await bookAdd.save();
        return res.status(201).json({ message: 'Livre ajoute avec succes' });
    }
    catch (error) {
        return res.status(400).json(error);
    }
}

exports.updateBook = (req, res, next) => {

    const BookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
    delete BookObject._userId;
    Book.findOne({ _id: req.params.id })
        .then((book) => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message: 'Not authorized' });
            } else {

                if (req.file != undefined) {
                    let filenametodelete = book.imageUrl.split('images/')[1];
                    fs.unlink(`./images/${filenametodelete}`, (error) => {
                        if (error) {
                            console.log(error, filenametodelete)
                        } else {
                            Book.updateOne({ _id: req.params.id }, { ...BookObject, _id: req.params.id })
                                .then(() => res.status(200).json({ message: 'Objet modifié!' }))
                                .catch(error => res.status(401).json({ error }));
                        }
                    })
                } else {
                    Book.updateOne({ _id: req.params.id }, { ...BookObject, _id: req.params.id })
                        .then(() => res.status(200).json({ message: 'Objet modifié!' }))
                        .catch(error => res.status(401).json({ error }));

                }


            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

exports.deleteBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then(book => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message: 'Not authorized' });
            } else {
                const filename = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Book.deleteOne({ _id: req.params.id })
                        .then(() => { res.status(200).json({ message: 'Objet supprimé !' }) })
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch(error => {
            res.status(500).json({ error });
        });
};

const calcAverage = (book) => {
    const grades = book.ratings.map(ratings => ratings.grade);
    const result = grades.reduce((accumulator, currentValue) => accumulator + currentValue) / grades.length;
    return result.toFixed(1);
}

exports.addNewGrade = async (req, res, next) => {
    try {
        if (req.body.rating > 5 || req.body.rating < 0) {
            return res.status(400).json({ message: "La note n'est pas bonne" });
        }
        const bookRateToUpdate = await Book.findOne({ _id: req.params.id, "ratings.userId": { $nin: req.auth.userId } });

        if (bookRateToUpdate) {
            bookRateToUpdate.ratings.push({ userId: req.auth.userId, grade: req.body.rating });
            bookRateToUpdate.averageRating = calcAverage(bookRateToUpdate);
            await bookRateToUpdate.save();
            return res.status(201).json(bookRateToUpdate);
        } else {
            return res.status(403).json({ message: 'vote impossible' })
        }
    }
    catch (error) {
        return res.status(400).json(error);
    }
}