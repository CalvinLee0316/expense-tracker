import mongoose from 'mongoose'
const {model, Schema} = mongoose;
const TransactionSchema = new Schema({
    name: {type:String, required:true},
    price: {type:String, required:true},
    category: {type:String, required:true},
    date: {type:String, required:true},
    dateNum: {type:Number, required:true},
    description: {type:String, required:true},
    user_id:{type:String, required:true}
});

const TransactionModel = model("Transaction", TransactionSchema, "transactions");
export default TransactionModel;
