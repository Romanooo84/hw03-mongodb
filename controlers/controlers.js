
const { fetchContacts, fetchContact, fetchCreateContact, deleteContactById, updateContact} = require('../services/services.js')
const Joi = require('joi');
const { Users } = require('../models/models.js')
require('dotenv').config()
const jwt = require('jsonwebtoken')

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

const signup = async (req, res, next) => {
  const { email, password } = req.body;

    try {
        const user = await Users.findOne({ email }).lean();

        if (user) {
            return res.status(409).json({ message: 'This email already exists' });
        }

        // dorobić walidację
        const newUser = new Users({ email });
        await newUser.setPassword(password);
        await newUser.save();

        return res.status(201).json({ message: 'Created' });
    } catch (e) {
        next(e);
    }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await Users.findOne({ email })
  console.log(user)
  
  if (!user){
    return res.status(401)
               .json({message: "User not found"})
  }

  const isPasswordCorrect = await user.validatePassword(password)
  console.log(isPasswordCorrect); // Wyświetlenie wyniku sprawdzenia poprawności hasła

const pass = await console.log(password)


  if (isPasswordCorrect) {
      const payload = {
        id: user._id,
        
    }
    const token = jwt.sign(
      payload,
      process.env.SECRET,
      {expiresIn: '12h'}
    )
    return res.json({token})
  } else {
    return res.status(401)
              .json({message: "Wrong password"})
  }
  
}


module.exports = {
    getAllContacts, 
    getContact,
    postContact, 
    deleteContact,
    putContact,
    putFavourite, 
    signup,
    login
}