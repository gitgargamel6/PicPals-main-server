const express = require("express")
const bodyParser = require('body-parser')
const cookieParser = require("cookie-parser");
const connectDB = require("./db")/*
const { adminAuth, userAuth } = require("./middleware/auth")
*/

connectDB();
const app = express()

app.use(bodyParser.json())
app.use(cookieParser())


const PORT = 5000
const server = app.listen(PORT, () => console.log(`server listening on port ${PORT}`))

process.on("unhandledRejection", err => {
    console.log(`an error occured: ${err.message}`)
    server.close(() => process.exit(1))
})

app.use("/api/auth", require("./auth/route"))
/*
app.get("/admin", adminAuth, (req, res) => res.send("admin route"))
app.get("/basic", userAuth, (req, res) => res.send("user route"))*/