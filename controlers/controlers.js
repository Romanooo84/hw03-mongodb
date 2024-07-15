
const { fetchContacts, fetchContact, fetchCreateContact, deleteContactById, updateContact} = require('../services/services.js')
const Joi = require('joi');
const { Users, Contact } = require('../models/models.js')
require('dotenv').config()
const jwt = require('jsonwebtoken')
const passport = require('passport');

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

const signUpSchema = Joi.object({
  password: Joi.string().min(8).max(30).required(),
  email: Joi.string().email().required()
});

const getAllContacts = async (req, res, next) => {

  const accessToken = req.headers.authorization
  
  const splitToken = accessToken.split(' ')[1]

  jwt.verify(splitToken, process.env.SECRET, async (err, decodedToken) => {
    if (err) {
      return res.status(403)
        .json({ message: "Invalid token" })
    }

    const user = await Users.findOne({ _id: decodedToken.id })
    if (!user) {
      return res.status(400)
        .json({ message: "User not found" })
    }
    const id = decodedToken.id

    const data = await fetchContacts(id)
    res
    .status(200)
    .json(data);
    
  })
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
        }
  } catch (err) {
    console.error(err);
    next(err);
  }}
  

const postContact = async (req, res, next) => {

  const accessToken = req.headers.authorization
  
  if (!accessToken) {
    return res.status(401
      .json({ message: "Access token is required" })
    )
  }

  const splitToken = accessToken.split(' ')[1]

  jwt.verify(splitToken, process.env.SECRET, async (err, decodedToken) => {
    if (err) {
      return res.status(403)
        .json({ message: "Invalid token" })
    }

    const user = await Users.findOne({ _id: decodedToken.id })
    if (!user) {
      return res.status(400)
        .json({ message: "User not found" })
    }
    const id = decodedToken.id

    const { name, email, phone } = req.body
 
    const { error } = postSchema.validate({ name, email, phone });
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const contact= {
            name,
            email,
            phone,
            owner: id
  }
    console.log(contact)
    try {
        const data = await fetchCreateContact(contact);
        res.status(201)
        .json(`contact id = ${data._id} was created`)
     } catch (err) {
        next(err);
    }
  })
    
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
    next(err);
  }
};

const putFavourite = async (req, res, next) => {
  const { contactId } = req.params;
  const { favorite } = req.body;

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

  const { error } = signUpSchema.validate({email, password });
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    try {
        const user = await Users.findOne({ email }).lean();

        if (user) {
            return res.status(409).json({ message: 'This email already exists' });
        }

        const newUser = new Users({ email });
        await newUser.setPassword(password);
        await newUser.save();

      return res.status(201).json(
        {
          "user": {
            "email": email,
            "subscription": "starter"
            }
        });
    } catch (e) {
        next(e);
    }
};

const login = async (req, res, next) => {
  
  const { email, password } = req.body;
  const user = await Users.findOne({ email })
  
  const { error } = signUpSchema.validate({ email, password });
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
  
  if (!user){
    return res.status(401)
               .json({message: "User not found"})
  }

  const isPasswordCorrect = await user.validatePassword(password)

  if (isPasswordCorrect) {
      const payload = {
        id: user._id,
    }
    const accsesstoken = jwt.sign(
      payload,
      process.env.SECRET,
      {expiresIn: '60s'}
    )

    const refreshToken = jwt.sign(
      payload,
      process.env.REFRESH_TOKEN_SECRET,
      {expiresIn: '30d'}
    )

    await user.setToken(refreshToken);
    await user.save();

    return res.json({accsesstoken, refreshToken})
  } else {
    return res.status(401)
              .json({message: "Wrong password"})
  }
  
}

const refresh = (req, res) => {

  const refreshToken = req.headers.authorization
  
  if (!refreshToken) {
    return res.status(401
              .json({message: "Refresh token is required"})
    )
  }

  const splitToken = refreshToken.split(' ')[1]

  jwt.verify(splitToken, process.env.REFRESH_TOKEN_SECRET, async (err, decodedToken) => {
    if (err) {
      return res.status(403)
                .json({message: "Invalid refesh"})
    }

    const user = await Users.findOne({ _id: decodedToken.id })
    if (!user) {
      return res.status(400)
                .json({message: "User not found"})
    }

    const payload = {
      id: user._id,
    }
   
    const accsesstoken = jwt.sign(
      payload,
      process.env.SECRET,
      {expiresIn: '20s'}
    )



    const newRefreshToken = jwt.sign(
      payload,
      process.env.REFRESH_TOKEN_SECRET,
      {expiresIn: '30d'}
    )

    return res.json({
      acessToken: accsesstoken,
      refersToken: newRefreshToken
    })
  })
}

const logout = (req, res) => {
   const accsessToken = req.headers.authorization
  
  if (!accsessToken) {
    return res.status(401
              .json({message: "Refresh token is required"})
    )
  }

  const splitToken = accsessToken.split(' ')[1]

  jwt.verify(splitToken, process.env.SECRET, async (err, decodedToken) => {
    if (err) {
      return res.status(403)
                .json({message: "Invalid refesh"})
    }

    const user = await Users.findOne({ _id: decodedToken.id })
    if (!user) {
      return res.status(400)
                .json({message: "User not found"})
    }

    await user.setToken(null);
    await user.save();
   

    return res.status(401)
          .json({
            message: 'You are logged out'
          })
  })  
}

const current = (req, res) => {
  const accsessToken = req.headers.authorization
  
  if (!accsessToken) {
    return res.status(401
              .json({message: "Refresh token is required"})
    )
  }

  const splitToken = accsessToken.split(' ')[1]

  jwt.verify(splitToken, process.env.SECRET, async (err, decodedToken) => {
    if (err) {
      return res.status(403)
        .json({ message: "Invalid token" })
    }

    const user = await Users.findOne({ _id: decodedToken.id })
    if (!user) {
      return res.status(400)
        .json({ message: "User not found" })
    }
    res.json({ user: user, email: user.email, ubscription: user.subscription})
  }
  )
}

const page = async (req, res) => {
  const { pageNumber } = req.params;
  const skip = pageNumber * 10-10

  try {
    const pagination = await Contact.find().skip(skip).limit(10).lean()
    res.status(200)
    .json(pagination)
  }
  catch {
    res.status(400)
    .json({message: 'Not found'})
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
    login,
    refresh, 
    logout, 
    current,
    page
}