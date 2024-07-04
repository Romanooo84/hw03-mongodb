const express = require('express');
const router = express.Router();
const { getAllContacts, getContact, postContact, deleteContact, putContact, putFavourite, } = require ('../../controlers/controlers.js')



router.get('/', getAllContacts)

router.get('/:contactId', getContact )

router.post('/', postContact)

router.delete('/:contactId', deleteContact)

router.put('/:contactId', putContact)

router.put('/:contactId/favorite', putFavourite)

module.exports = router
