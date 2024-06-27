const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const Joi = require('joi');
const { getAllContacts, getContact, postContact, deleteContact, putContact} = require ('../../controlers/controlers.js')


router.get('/', getAllContacts)

router.get('/:contactId', getContact )


router.post('/', postContact)

router.delete('/:contactId', deleteContact)

router.put('/:contactId', putContact)

module.exports = router
