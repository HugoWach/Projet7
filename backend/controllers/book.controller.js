const Book = require("../models/book.model");

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

exports.createNewBook = async (req, res, next) => {
    const BookObject = JSON.parse(req.body.book);

    const nextYear = new Date().getFullYear() + 1;

    if (BookObject.title.length >= 100 || BookObject.author.length >= 50 || BookObject.genre.length >= 50) {
        return res.status(400).json({ message: "Merci de raccourcir le texte car il est trop long" })
    }
    if (BookObject.year > nextYear) {
        return res.status(400).json({ message: "Merci de renseigner une date de publication valide" });
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