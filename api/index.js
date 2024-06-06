import 'dotenv/config';
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import TransactionModel from "./models/Transaction.js"

import {ClerkExpressWithAuth} from '@clerk/clerk-sdk-node';
const Transaction = TransactionModel;
const app = express();
const port = process.env.PORT || 4040;
app.use(cors());
app.use(express.json());
app.get('/api/test', (req, res) => {
    res.json({ body: 'test ok' });
});



app.post('/api/addTransaction', ClerkExpressWithAuth(),async (req, res) => {
    await mongoose.connect(process.env.MONGO_URL);
    const user_id = req.auth.userId;
    const {name, price, category, date, dateNum, description} = req.body;
    const transaction = await Transaction.create({name, price, category, date, dateNum, description, user_id});
    res.json(transaction)
});

app.get('/api/getTransactions', ClerkExpressWithAuth(), async (req, res) => {
    await mongoose.connect(process.env.MONGO_URL);
    const id = req.auth.userId;
    // console.log("Here")
    // console.log(req.auth)
    // console.log(req.auth.userId);
    const transactions = await Transaction.find({user_id:id});
    res.json(transactions);
});

app.get('/api/getTransactions/category/:category', ClerkExpressWithAuth(), async (req, res) => {
    await mongoose.connect(process.env.MONGO_URL);
    const id = req.auth.userId;
    const c = req.params.category.replace('&', ' ').substring(1);
    const transactions = await Transaction.find({user_id:id, category:c}).exec();
    res.json(transactions)
});

app.get('/api/getTransactions/date/:date',ClerkExpressWithAuth(), async (req, res) => {
    await mongoose.connect(process.env.MONGO_URL);
    const id = req.auth.userId;
    const d = req.params.date.substring(1);
    const transactions = await Transaction.find({ user_id: id, date: { "$regex": d}}).exec();
    res.json(transactions)

});

app.get('/api/getTransactions/range/:month', ClerkExpressWithAuth(), async (req, res) => {
    await mongoose.connect(process.env.MONGO_URL);
    const id = req.auth.userId;
    const m = req.params.month;
    const transactions = await Transaction.find({user_id: id, dateNum: {$gte: m-10000, $lt: addMonth(m)}}).exec();
    res.json(transactions);
});

function addMonth(yyyymmdd){
    let year = parseInt(yyyymmdd.substring(0,4));
    let month = parseInt(yyyymmdd.substring(4,6));
    if(month === 12){
      year++;
      month = 1;
    } else {
      month++;
    }
    return String(year) + String(month).padStart(2, '0')+"00";
  }

app.get('/api/getTransactions/:category/:date',ClerkExpressWithAuth(), async (req, res) => {
    await mongoose.connect(process.env.MONGO_URL);
    const id = req.auth.userId;
    const c = req.params.category.replace('&', ' ').substring(1);
    const d = req.params.date;
    const transactions = await Transaction.find({user_id:id, category:c, date: {"$regex":d}}).exec();
    res.json(transactions)

});

app.delete('/api/deleteTransaction/:id', ClerkExpressWithAuth(), async (req, res) => {
    await mongoose.connect(process.env.MONGO_URL);
    const {id} = req.params;
    await Transaction.findByIdAndDelete(id);
    res.json({message: 'Transaction deleted'});
});

app.put('/api/editTransaction/:id', ClerkExpressWithAuth(), async (req, res)=>{
    await mongoose.connect(process.env.MONGO_URL);
    const {id} = req.params;
    const user_id = req.auth.userId;
    const {name, price, category, date, dateNum, description} = req.body;
    await Transaction.findByIdAndUpdate(id, {name, price, category, date, dateNum, description, user_id})
    res.json({message: "Transaction Edited"})
})



app.listen(port, () => {
    console.log('Server running on http://localhost:4040');
});