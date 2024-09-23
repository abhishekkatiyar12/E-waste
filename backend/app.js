const express= require("express");
const mongoose=require("mongoose")
const sellerAuthRouter=require("./Routes/sellerAuthRoute")
const customerAuthRouter=require("./Routes/customerAuthRoute")




const app= express()

app.use(express.json());



const url="mongodb://localhost:27017/E-waste"
mongoose.connect(url)
.then(() => console.log('Database Connected!'));

app.use('/api/v1/home',(req,res)=>{
    res.send("home");
})


app.use('/api/v1/seller',sellerAuthRouter)

app.use('/api/v1/customer',customerAuthRouter);







app.listen(8000,()=>{
    console.log("successfully connected")
})