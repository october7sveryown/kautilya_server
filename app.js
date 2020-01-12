const express = require('express')
const app=express()
const morgan=require('morgan')
const mysql=require('mysql')
const bodyParser=require('body-parser')
const portNumber=3306

const userRoutes=require('./routes/user.js')
const hotelRoutes=require('./routes/hotel.js')

const userThroughURL=require('./routes/web/user.js')
const hotelThroughURL=require('./routes/web/hotel.js')

app.use(bodyParser.urlencoded({extended:true}))

app.use(bodyParser.json())

app.use(morgan('short'))

app.use('/user',userRoutes)

app.use('/hotel',hotelRoutes)

app.use('/web/hotel',hotelThroughURL)

app.use('/web/user',userThroughURL)

//simple start
app.get('/', (req,res)=>{
    res.send({
        statusCode: res.statusCode,
        message: "Hello from Kautilya Software"
    });
})

app.post('/myData',(req,res)=>{
    res.send({
        message:"Hello"
    })
})

// app.listen(portNumber, () => {
//     console.log("Kautilya server is running on Port " + portNumber)
// })

app.listen(process.env.PORT || 500, ()=>{
    console.log('Hello from KESPL');
})