const express =  require("express")
const moongoose = require("mongoose");
const dbConnection = require("./dbConnection/db");
const dotenv =  require("dotenv");
const authRouter = require("./router/user");
const app = express();
const PORT = 9090;

app.get("/",(req,res) =>{
 res.send("hello world")
})


app.use("/api/user",authRouter)

app.listen(PORT,()=>{
    console.log(`server is running on http://localhost:${PORT}`)
    dbConnection()
})