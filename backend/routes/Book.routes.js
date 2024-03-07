/* Import des modules necessaires */
const express = require("express");
const router = express.Router();

const BookCtrl = require("../controllers/book.controller");

const GuardAuth = require("../middleware/GuardAuth");
const GuardMulter = require("../middleware/GuardMulter");

router.get('/', BookCtrl.getAllBooks);
router.get('/bestrating', BookCtrl.getBestBooks);
router.get('/:id', BookCtrl.getBookById);
router.post('/', GuardAuth, GuardMulter, BookCtrl.createNewBook);
router.post('/:id/rating', GuardAuth, BookCtrl.addNewGrade);
router.put('/:id', GuardAuth, GuardMulter, BookCtrl.updateBook);
router.delete('/:id', GuardAuth, BookCtrl.deleteBook);


module.exports = router;



