import express from 'express';
import mongoose from 'mongoose';
import { UserModel as User } from '../models/user';
import chalk from 'chalk';

let router = express.Router();

/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
let ObjectId = mongoose.Types.ObjectId;

/*======================
  operations for /users
=======================*/

router.get('/', (req, res) => {
  User.find()
  .select('_id name address email phone')
  .exec()
  .then(docs => {
    const response = {
      count: docs.length,
      users: docs.map(doc => {
        return {
          _id: doc._id,
          name: doc.name,
          address: doc.address,
          email: doc.email,
          phone: doc.phone,
          request: {
            type: 'GET',
            url: `http://localhost:3000/users/${doc._id}`
          }
        }
      })
    };
    res.status(200).json(response);
    console.log( chalk.greenBright('\nGET users request successful! \n\nRunning at http://localhost:3000/users/\n') );
  })
  .catch(err => {
    res.status(500).json({
        error: `${err}`
    });
    console.log( chalk.redBright(`\nError retriving users: ${err}\n`) );
  });
});

router.post('/', (req, res) => {
  let user = new User({
    name: req.body.name,
    address: req.body.address,
    email: req.body.email,
    phone: req.body.phone
  });

  user.save()
  .then(doc => {
    res.status(201).json({
      message: 'User created successfully!',
      newUser: {
        _id: doc._id,
        name: doc.name,
        address: doc.address,
        email: doc.email,
        phone: doc.phone,
        request: {
          type: 'GET',
          url: `http://localhost:3000/users/${doc._id}`
        }
      }
    });
    console.log( chalk.greenBright(`\nUser CREATED successfully! \n\nCreated User url: http://localhost:3000/users/${doc._id}\n`) );
  })
  .catch(err => {
    res.status(500).json({
      error: `${err}`
    });
    console.log( chalk.redBright(`\nError saving user: ${err}\n`) );
  });
});


/*=============================
  operations for /users/userId
==============================*/

router.get('/:userId', (req, res, next) => {
  const id = req.params.userId;
  User.findById(id)
  .select('_id name address email phone')
  .exec()
  .then(doc => {
    if (doc) {
      res.status(200).json({
        _id: doc._id,
        name: doc.name,
        address: doc.address,
        email: doc.email,
        phone: doc.phone,
        request: {
          type: 'GET',
          description: 'Url link to all users',
          url: 'http://localhost:3000/users/'
        }
      });
      console.log( chalk.greenBright(`\nGET user request successful! \n\nUser url: http://localhost:3000/users/${doc._id}\n`) );
    }else {
      console.log( chalk.redBright('\nNo record found for provided ID\n') );
      return res.status(404).json({
        message: 'No record found for provided ID'
      });
    }
  })
  .catch(err => {
    res.status(500).json({
      message: 'Invalid ID',
      error: `${err}`
    });
    console.log( chalk.redBright(`\nError retriving user: ${err}\n`) );
  });
});

router.patch('/:userId', (req, res, next) => {
  const id = req.params.userId;
  const updateOps = {};
  for  (const ops of req.body) {
      updateOps[ops.propName] = ops.value;
  }
  User.updateOne({_id: id}, { $set: updateOps })
  .exec()
  .then(() => {
    console.log( chalk.greenBright(`\nPATCH request for ID ${id} successful! \n\nUpdated user url: http://localhost:3000/users/${id}\n`) );
    return res.status(200).json({
      message: 'Patch user request successful!',
      request: {
        type: 'GET',
        description: 'Url link to updated user',
        url: `http://localhost:3000/users/${id}`
      }
    });
  })
  .catch(err => {
    res.status(500).json({
      message: 'Error updating user property & value',
      error: `${err}`
    });
    console.log( chalk.redBright(`\nError updating user property & value: ${err}\n`) );
  });
});

router.put('/:id', (req, res) => {
  let id = req.params.id;
  let resetUser = {
      name: req.body.name,
      address: req.body.address,
      email: req.body.email,
      phone: req.body.phone
  }

  User.findByIdAndUpdate(id, { $set: resetUser }, { new: true })
  .exec()
  .then(response => {
    console.log( chalk.greenBright(`\nPUT request for ID ${response._id} successful! \n\nUpdated user url: http://localhost:3000/users/${id}\n`) );
    return res.status(200).json({
      message: 'Put user request successful!',
      request: {
        type: 'GET',
        description: 'Url link to updated user',
        url: `http://localhost:3000/users/${id}`
      }
    });
  })
  .catch(err => {
    res.status(500).json({
      message: 'Error updating user',
      error: `${err}`
    });
    console.log( chalk.redBright(`\nError updating user: ${err}\n`) );
  });
});

router.delete('/:userId', (req, res, next) => {
  const id = req.params.userId;
  User.deleteOne({_id: id})
  .exec()
  .then(doc => {
    console.log( chalk.greenBright('\nUser DELETED successfully!\n') );
    res.status(200).json({
      message: 'User deleted successfully!',
      request: {
        type: 'POST',
        description: 'Url link to make post request to',
        url: 'http://localhost:3000/users/',
        body: {
          name: 'String',
          address: 'String',
          email: 'String',
          phone: 'Number'
        }
      }
    });
  })
  .catch(err => {
    res.status(500).json({
      message: 'Error deleting user',
      error: `${err}`
    });
    console.log( chalk.redBright(`\nError deleting user: ${err}\n`) );
  });
});

export { router };
