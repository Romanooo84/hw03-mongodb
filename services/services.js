const Contact = require('../models/models.js')

const fetchContacts = () => {
    return Contact.find() 
}

const fetchContact = (id) => {
    return Contact.findOne({
        _id: id
    })
}

const fetchCreateContact = ({ name, phone, email, favourite }) => {
    return Contact.create({ name, phone, email, favourite })
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

module.exports = {
    fetchContacts,
    fetchContact, 
    fetchCreateContact,
    deleteContactById,
    updateContact
}