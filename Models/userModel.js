const mongoose = require("mongoose");
const bcrypt = require('bcrypt')

const userSchema = mongoose.Schema(
  {
    userName: { type: String, required: true },
    email: { type: String, required: true, unique:true },
    password: { type: String, required: true },
    pic: {
      type: String,
      default:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
  },
  {
    timestamps: true,
  }
);

//HASHING AND SALTING  TH PASSWORD BEFORE SAVE TO THE DB
userSchema.pre('save', async function(next){
  if(!this.isModified){
    next()
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password,salt)
})

userSchema.methods.matchPassword= async function(enteredpassword){
  return await bcrypt.compare(enteredpassword,this.password)
}

const User = mongoose.model("User", userSchema);

module.exports = User;
