




const session = require('express-session');
const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
import { Users } from '../Models/Users';
const { LoginValidator, RegisterValidator } = require("../Validators/userValidators");
// const jwt = require("jsonwebtoken");
const env = require("dotenv").config();


// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY ,   
  api_secret: process.env.CLOUDINARY_API_SECRET   
});

// Set up multer storage with Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'Profile-Pictures', 
    allowed_formats: ['jpg', 'jpeg', 'png'], 
    transformation: [{ width: 150, height: 150, crop: 'thumb', gravity: 'face' }] 
  }
});


const upload = multer({ storage: storage });










// Create A User 


async function CreateUser (req, res) {
    console.log(req.body)
    const {errors, isValid} = RegisterValidator(req.body);
    if (!isValid) {
        res.json({success: false, errors});
    } else {
        const {firstName, lastName, email, password} = req.body;
        const registerUser = new Users({
            firstName, 
            lastName,
            userName: `${firstName} + ${lastName}`,
            email,
            password,
            profilePicture: result.secure_url,
            createdAt: new Date()
        });
        if (!req.file) {
            return res.status(400).json({ message: 'Please provide a valid image file' });
          }
          const imageUrl = req.file.path;
          const result = await cloudinary.uploader.upload(imageUrl, { folder: 'Profile-Pictures' });
        await bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(password, salt, (hashErr, hash) => {
                if (err || hashErr) {
                    res.json({"message": "Error Ocurred While Hashing", success: false});
                    return;
                }

                registerUser.password = hash;
                registerUser.save().then(() => {
                    res.json({message: "User Created Successfully", "success": true});
                })
            })
        })
    }
}




// Login A User

async function LoginUser (req, res) {
    const {errors, isValid} = LoginValidator(req.body);

    if (!isValid) {
        res.json({success: false, errors});
    } else {
        Users.findOne({email: req.body.email}).then(user => {
            if (!user) {
                res.json({message: "Email not found", success: false})
            } else {
                bcrypt.compare(req.body.password, user.password).then(success => {
                    if (!success) {
                        res.json({message: "Invalid Password", success: false})
                    } else {
                        req.session.user = user;
                        req.session.loggedIn = true;
                        res.json({
                            user,
                            session,
                            success: true
                        })
                        // const payload = {
                        //     id: user._id,
                        //     name: user.firstName
                        // }
                        // jwt.sign(
                        //     payload,
                        //     process.env.APP_SECRET, {expiresIn: 2155926},
                        //     (err, token) => {
                        //         res.json({
                        //             user,
                        //             token: `Bearer Token: ` + token,
                        //             success: true
                        //         })
                        //     }
                        // )
                    }
                })
            }
        })
    }
}




// logout A User

async function Logout (req, res) {

    // Destroy the session to log out the user
    
    await req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
      } else {
        res.send('User logged out successfully.');
      }
    });
  }




// Get A User By Id

async function GetUser (req, res) {
    await Users.findOne({_id: req.params.id}).then(user => {
        res.json({user, success: true}).catch(er => {
            res.json({success: false, message: er.message})
        })
    })
}




async function EditUserName (req, res) {
    const {newUserName} = req.body

    const newValues = { $set: { userName: newUserName } };
    await Users.findOneAndUpdate({id: req.params._id}, newValues).then(user => {
        user.save()
        res.json({user, success: true, message: "Edited User Profile Successfully"}).catch(error => {
            res.json({message: "Can't Update User Profile", success: false})
        })
    })
}


async function EditProfilePicture (req, res) {
    if (!req.file) {
      return res.status(400).json({ message: 'Please provide a valid image file' });
    }
  
    const imageUrl = req.file.path;
    const result = await cloudinary.uploader.upload(imageUrl, { folder: 'Profile-Pictures' });
  
    try {
      // Save the secure URL in the userSchema
      const user = await Users.findByIdAndUpdate(req.params.userId, { profilePicture: result.secure_url }, { new: true });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      return res.json({ imageUrl: result.secure_url });
    } catch (error) {
      return res.status(500).json({ message: 'Error updating profile picture' });
    }
  }
  








module.exports = {
    CreateUser: CreateUser,
    LoginUser: LoginUser,
    GetUser: GetUser,
    Logout: Logout,
    EditUserName: EditUserName,
    EditProfilePicture: EditProfilePicture
  };

 









