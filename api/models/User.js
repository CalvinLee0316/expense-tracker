import mongoose from 'mongoose'
const {model, Schema} = mongoose;
const UserSchema = new Schema({
    user_id: {type:String, required:true},
    fullName: {type:String, required:true},
    firstName: {type:String, required:true},
});

const UserModel = model("User", UserSchema, "users");
export default UserModel;
