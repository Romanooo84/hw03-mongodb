
const { fetchContacts, fetchContact } = require('../services/services.js')
const { v4: uuidv4 } = require('uuid');
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
      res.json(data)
    /*const items = JSON.parse(data)
    const item = items.find(user => user.id===contactId)
    if (!item) {
      res
        .status(404)
        .json('Not found')
    } else {
      res
        .status(200)
        .send(`id: ${item.id} \t name: ${item.name} \t email: ${item.email} \t phone: ${item.phone}`)
    }*/
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
      "id": uuidv4(),
            "name": name,
            "email": email,
            "phone": phone
    }
    try {
    const data = await fs.readFile('./contacts.json', 'utf8');
    const items = JSON.parse(data)
    items.push(user)
    await fs.writeFile('./contacts.json', JSON.stringify(items, null, 2), 'utf8');
    res.status(201)
    .json(`contact id = ${user.id} was created`)
     } catch (err) {
        console.error(err);
        next(err);
    }
}

const deleteContact = async (req, res, next) => {
   const contactId = req.params.contactId;
  try {
    const data = await fs.readFile('./contacts.json', 'utf8');
    const contactsData = JSON.parse(data)
    const item = contactsData.find(find => find.id === contactId)
    if (!item) {
      res
        .status(404)
        .json("contact not found")
      return
    }
    const updatedContacts = contactsData.filter(found => found.id !== contactId)
    await fs.writeFile('./contacts.json', JSON.stringify(updatedContacts, null, 2), 'utf8');
    console.log(updatedContacts)
    res
      .status(200)
    .json(`contact id = ${contactId} was deleted`)
  } catch (err) {
    console.error(err);
    next(err);
  }

}

const putContact = async (req, res, next) => {
  const { contactId } = req.params
  const { name, email, phone } = req.body
  const { error } = putSchema.validate({ name, email, phone });
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const data = await fs.readFile('./contacts.json', 'utf8');
    const items = JSON.parse(data)
    const item = items.find(contact => contact.id == contactId)
    const index = items.findIndex(contact=>contact.id == contactId)

    if (item) {
       contact = {
        "id": contactId,
         "name": name || item.name,
          "email": email || item.email,
          "phone": phone || item.phone
      }
      items[index]=contact
    }
    await fs.writeFile('./contacts.json', JSON.stringify(items, null, 2), 'utf8');
    res.status(201)
    .json(`contact id = ${contactId} was updated`)
  } catch (err) {
    console.error(err);
    next(err);
  }
  
}

module.exports = {
    getAllContacts, 
    getContact,
    postContact, 
    deleteContact,
    putContact
}