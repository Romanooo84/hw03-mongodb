const { Contact, Users }  = require('../models/models.js')

const fetchContacts = (id) => {
    return Contact.find({owner: id}) 
}

const fetchContact = (id) => {
    return Contact.findOne({
        _id: id
    })
}

const fetchCreateContact = ({ name, phone, email, favourite, owner }) => {
    return Contact.create({ name, phone, email, favourite, owner })
}

const deleteContactById = (id) => {
    return Contact.findByIdAndDelete({
        _id:id
    })
}

const updateContact = (id, fields) => {
    return Contact.findOneAndUpdate(
    { _id: id },
    { $set: fields },
    { new: true }
  );
};

const updateUser = (id, fields) => {
       return Users.findOneAndUpdate(
    { _id: id },
    { $set: fields },
    { new: true }
  );
}

module.exports = {
    fetchContacts,
    fetchContact, 
    fetchCreateContact,
    deleteContactById,
    updateContact, 
    updateUser
}