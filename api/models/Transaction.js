const mongoose = require('mongoose')
const {model, Schema} = mongoose;
const TransactionSchema = new Schema({
    name: {type:String, required:true},
    price: {type:Number, required:true},
    category: {type:String, required:true},
    date: {type:String, required:true},
    dateNum: {type:Number, required:true},
    description: {type:String, required:true},
});

const TransactionModel = model("Transaction", TransactionSchema, "transactions");
module.exports = TransactionModel;
