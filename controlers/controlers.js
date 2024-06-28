
const { fetchContacts, fetchContact, fetchCreateContact, deleteContactById, updateContact} = require('../services/services.js')
const Joi = require('joi');
const fs = require('fs').promises;

const postSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^[0-9]+$/, 'numbers').min(9).max(15).required()
});

const putSchema = Joi.object({
  name: Joi.string().min(3).max(30),
  email: Joi.string().email(),
  phone: Joi.string().pattern(/^[0-9]+$/, 'numbers').min(9).max(15)
});

const getAllContacts = async (req, res, next) => {
    const data = await fetchContacts()
    res
    .status(200)
    .json(data);
}

const getContact = async (req, res, next) => {
  const contactId = req.params.contactId;
    try {
        const data = await fetchContact(contactId)
        if (!data) {
            res.status(400)
                .json(`contact id = ${contactId} was not found`)
        }
        else {
            res.json(data)
            console.log(data)
        }
  } catch (err) {
    console.error(err);
    next(err);
  }}
  

const postContact = async (req, res, next) => {
    const { name, email, phone } = req.body
    
    const { error } = postSchema.validate({ name, email, phone });
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const user= {
            name,
            email,
            phone
    }
    try {
        const data = await fetchCreateContact(user);
        res.status(201)
        .json(`contact id = ${data._id} was created`)
     } catch (err) {
        console.error(err);
        next(err);
    }
}

const deleteContact = async (req, res, next) => {
   const contactId = req.params.contactId;
  try {
      const data = await deleteContactById(contactId);
      if (!data) {
        res.status(400)
        .json(`contact id = ${contactId} was not found`)  
      }
      else {
    res
      .status(200)
      .json(`contact id = ${contactId} was deleted`)
          }
  } catch (err) {
    console.error(err);
    next(err);
  }

}

const putContact = async (req, res, next) => {
  const { contactId } = req.params;
  const { name, email, phone } = req.body;
  const { error } = putSchema.validate({ name, email, phone });

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const fields = {
    name, 
    email,
    phone
  };

  try {
    const data = await updateContact(contactId, fields);

    if (data) {
      res.status(200).json({ message: `Contact id = ${contactId} was updated` });
    } else {
      res.status(404).json({ message: `Contact id = ${contactId} wasn't found` });
    }
  } catch (err) {
    console.error(err);
    next(err);
  }
};

const putFavourite = async (req, res, next) => {
  const { contactId } = req.params;
  const { favorite } = req.body;
  console.log(req.body)

  const fields = {
    favorite: true
  }
  try {
    const data = await updateContact(contactId, fields);

    if (data) {
      res.status(200).json({ message: `Contact id = ${contactId} was updated` });
    } else {
      res.status(404).json({ message: `Contact id = ${contactId} wasn't found` });
    }
  } catch (err) {
    console.error(err);
    next(err);
  }
};


module.exports = {
    getAllContacts, 
    getContact,
    postContact, 
    deleteContact,
    putContact,
    putFavourite
}