var pool=require('./database')
const express=require('express')
const mysql=require('mysql')
const router=express.Router()

//for inserting details via form-url-encoded / json
router.post('/insert',(req,res)=>{
    var email=req.body.email
    var password=req.body.password
    var queryString="Insert into Users (email,password) values (?,?)"
    pool.query(queryString,[email,password],(err,rows,fields)=>{
        if(err){
            console.log(err)
            return
        }
        res.json({
            statusCode:200,
            message: 'Data inserted successfully'
        })
    })
})

//for getting details by user id
router.get('/:id',(req,res) => {
    const paramId=req.params.id;
    const query="SELECT * from Users WHERE user_id = ?"
    pool.query(query,[paramId],(err,rows,fields)=> {
        if(err){
            console.log(err)
            return
        }

        const users=rows.map((row)=>{
            return {email:row.email}
        })

        res.json(rows)
    })
})

//for getting all users
router.get('/allUsers',(req,res) => {
    const query="SELECT email from Users"
    pool.query(query,[],(err,rows,fields)=> {
        console.log(rows)
        if(err){
            console.log(err)
            return
        }
        else{
            console.log(rows)
            res.json({
                statusCode:res.statusCode,
                email:rows[0].email
            })
        }
    })
})

router.get('/insertThroughURL',(req,res)=>{
    var email=req.query.email
    res.json({
        statusCode:res.statusCode,
        emailId:"You entered email "+email
    })
})

router.post('/login',(req,res) => {
    var emailId=req.body.email;
    var password=req.body.password;
    const query="SELECT h.hotel_id,h.name,h.city,h.state,h.country from Hotels h, Users u WHERE email = ? AND password = ? AND h.hotel_id=u.hotel_id"
    pool.query(query,[emailId,password],(err,row,fields)=>{
        if(row.length){
            res.json({
                statusCode:res.statusCode,
                message:'Login successful',
                hotelId:row[0].hotel_id,
                hotelName:row[0].name,
                hotelCity:row[0].city,
                hotelState:row[0].state,
                hotelCountry:row[0].country
            })
            console.log(row)
        }
        else{
            res.json({
                statusCode:404,
                message:'Login failed'
            })
        }
    })
})

router.post('/forgotPassword',(req,res)=>{
    const email=req.body.email;
    const queryString1="Select * from Users where email = ?"
    const queryString='Update Users set password = "hms@123" where email = ?'
    pool.query(queryString1,[email],(err,rows,fields)=>{
        if(err){
            console.log(err)
            res.json({
                statusCode:500,
                message:'Server error'
            })
            return
        }
        else if(rows.length){
            pool.query(queryString,[email],(err,rows,fields)=>{
                if(err){
                    console.log(err)
                    return
                }
                else{
                    res.json({
                        statusCode:res.statusCode,
                        message:'Password reset done'
                    })
                }
            })
        }
        else{
            res.json({
                statusCode:res.statusCode,
                message:'invalid email entered'
            })
        }
    })
})

module.exports=router