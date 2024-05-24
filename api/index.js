const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 4040;

require('dotenv').config();
const mongoose = require('mongoose');
const Transaction = require('./models/Transaction.js');
app.use(cors());
app.use(express.json());
app.get('/api/test', (req, res) => {
    res.json({ body: 'test ok' });
});


app.post('/api/addTransaction', async (req, res) => {
    await mongoose.connect(process.env.MONGO_URL);
    const {name, price, category, date, dateNum, description} = req.body;
    const transaction = await Transaction.create({name, price, category, date, dateNum, description});
    res.json(transaction)
});

app.get('/api/getTransactions', async (req, res) => {
    await mongoose.connect(process.env.MONGO_URL);
    const transactions = await Transaction.find();
    res.json(transactions);
});

app.get('/api/getTransactions/category/:category', async (req, res) => {
    await mongoose.connect(process.env.MONGO_URL);
    const c = req.params.category.replace('&', ' ').substring(1);
    const transactions = await Transaction.find({category:c}).exec();
    res.json(transactions)
});

app.get('/api/getTransactions/date/:date', async (req, res) => {
    await mongoose.connect(process.env.MONGO_URL);
    const d = req.params.date.substring(1);
    const transactions = await Transaction.find({ date: { "$regex": d}}).exec();
    res.json(transactions)

});

app.get('/api/getTransactions/range/:month', async (req, res) => {
    await mongoose.connect(process.env.MONGO_URL);
    const m = req.params.month;
    const transactions = await Transaction.find({dateNum: {$gte: m-10000, $lt: addMonth(m)}}).exec();
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

app.get('/api/getTransactions/:category/:date', async (req, res) => {
    await mongoose.connect(process.env.MONGO_URL);
    const c = req.params.category.replace('&', ' ').substring(1);
    const d = req.params.date;
    const transactions = await Transaction.find({category:c, date: {"$regex":d}}).exec();
    res.json(transactions)

});

app.delete('/api/deleteTransaction/:id', async (req, res) => {
    await mongoose.connect(process.env.MONGO_URL);
    const {id} = req.params;
    await Transaction.findByIdAndDelete(id);
    res.json({message: 'Transaction deleted'});
});



app.listen(port, () => {
    console.log('Server running on http://localhost:4040');
});