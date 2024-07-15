const mongoose = require('mongoose')
const bCrypt = require('bcrypt')

const contactsSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, 'Set name for contact'],
    },
    email: {
      type: String, 
    },
    phone: {
      type: String,
    },
    favorite: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }
   }, {
      versionKey: false,
      timestamps: true,
})

const userSchema = new mongoose.Schema({
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
  },
  subscription: {
    type: String,
    enum: ["starter", "pro", "business"],
    default: "starter"
  },
  token: {
    type: String,
    default: null,
  },
}, { timestamps: true });

userSchema.methods.setPassword = async function (password) {
  this.password = await bCrypt.hash(password, 10)
}

userSchema.methods.validatePassword = async function (password) {
    return await bCrypt.compare(password, this.password);
}

userSchema.methods.setToken = async function (token) {
  this.token = token
}
    
const Contact = mongoose.model('contact', contactsSchema, 'contacts');
const Users = mongoose.model('User', userSchema, 'users');

module.exports = { Contact, Users }