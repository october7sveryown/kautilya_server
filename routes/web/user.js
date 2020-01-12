var pool = require('../database')
const express = require('express')
const mysql=require('mysql')
const router=express.Router()

router.post('/insert',(req,res)=>{
    var email=req.query.email
    var password=req.query.password
    var queryString="Insert into Users (email,password) values (?,?)"
    initiateMySQL().query(queryString,[email,password],(err,rows,fields)=>{
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

module.exports = router