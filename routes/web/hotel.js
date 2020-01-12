var pool = require('../database')
const express = require('express')
const mysql=require('mysql')
const router=express.Router()

//FOR ADDING ROOMS IN ROOM MASTER
router.post('/addRoom',(req,res) => {
    const hotelId=req.query.id;
    const roomNo=req.query.roomNo;
    const roomType=req.query.roomType;
    const roomStatus=req.query.roomStatus;
    const roomDescription=req.query.roomDescription;
    const outerQuery="SELECT room_no FROM Rooms where hotel_id=? AND room_no=?"
    const query="INSERT INTO Rooms(hotel_id,room_no,status,type,description) VALUES (?,?,?,?,?)"
    pool.query(outerQuery,[hotelId,roomNo],(err,rows,fields) =>{
        if(err){
            console.log(err)
                    return
        }
        else if(rows.length){
            res.json({
                statusCode:res.statusCode,
                message:'Room already added'
            })
        }
        else{
            pool.query(query,[hotelId,roomNo,roomStatus,roomType,roomDescription],(err,rows,fields)=> {
                if(err){
                    console.log(err)
                    return
                }
                else{
                    if(res.statusCode == 200){
                        res.json({
                            statusCode:res.statusCode,
                            message:'Room added successfully'
                        })
                    }
                    else{
                        res.json({
                            statusCode:res.statusCode,
                            message:'Server Error'
                        })
                    }
                }
            })
        }
    })
})

//FOR CHECK-IN
router.get('/checkin', (req,res) => {
    const hotelId=req.query.id;
    const guestName=req.query.guestName;
    const checkin=req.query.checkIn;
    const roomNo=req.query.roomNo;
    const phoneNo=req.query.phoneNo;
    const tariff=req.query.tariff;
    const deposit=req.query.deposit;
    const checkout=req.query.checkOut;
    const outerQuery="SELECT name from Guests WHERE room_no=?"
    const query="INSERT INTO Guests (hotel_id,room_no,name,phone_no,check_in,check_out,deposit,actual_tariff) VALUES (?,?,?,?,?,?,?,?)"
    const updateQuery="UPDATE Rooms set status = 1 WHERE room_no = ? and hotel_id = ?"
    pool.query(outerQuery,[roomNo],(err,rows,fields)=>{
        if(err){
            console.log(err)
            return
        }
        else if(rows.length){
            res.json({
                statusCode:404,
                message:"Invalid Room entered/Guest already exists"
            })
        }
        else{
            pool.query(query,[hotelId,roomNo,guestName,phoneNo,checkin,checkout,deposit,tariff],(err,rows,fields) =>{
                if(err){
                    console.log(err)
                    res.json({
                        statusCode:500,
                        message:'Unsuccesfull'
                    })
                    return
                }
                else{
                    pool.query(updateQuery,[roomNo,hotelId], (err,rows,fields) => {
                        if(err){
                            console.log(err)
                            res.json({
                                statusCode:500,
                                message:'Unsuccesfull'
                            })
                            return
                        }
                        else{
                            res.json({
                                statusCode:res.statusCode,
                                message:"Successful"
                            })
                        }
                    })
                }
            })
        }
    })
})

//FOR CHECK-OUT
router.post('/checkout', (req,res) => {
    const hotelId=req.query.id;
    const roomNo=req.query.roomNo;
    const checkOutTime=req.query.checkOut;
    const query1="Select room_no from Guests where hotel_id=? and room_no=?"
    const query2="Update Rooms set status = 0 where hotel_id=? and room_no=?"
    const query3="Update Guests set check_out = ? where hotel_id=? and room_no=?"
    pool.query(query1, [hotelId,roomNo],(err,rows,fields) => {
        if(err){
            console.log(err)
            return
        }
        else if(rows.length){
            pool.query(query2,[hotelId,roomNo],(err,rows,fields)=>{
                if(err){
                    console.log(err)
                    return
                }
                else{
                    pool.query(query3,[checkOutTime,hotelId,roomNo], (err,rows,fields)=>{
                        if(err){
                            console.log(err)
                            return
                        }
                        else{
                            res.json({
                                statusCode:res.statusCode,
                                message:'Checkout successful'
                            })
                        }
                    })
                }
            })
        }
        else{
            res.json({
                statusCode:res.statusCode,
                message:'Invalid Room no'
            })
        }
    })
})

//For updating Room Status
router.post('/updateRoomStatus',(req,res) => {
    const hotelId=req.query.id;
    const roomNo=req.query.roomNo;
    const status=req.query.status;

    const outerQuery='Select room_no from Rooms where hotel_id=? and room_no';
    const mainQuery='Update Rooms set status = ? where hotel_id=? and room_no=?';

    pool.query(outerQuery,[hotelId,roomNo],(err,rows,fields) =>{
        if(err){
            console.log(err)
        }
        else if(rows.length){
            pool.query(mainQuery,[status,hotelId,roomNo],(err,rows,fields)=>{
                if(err){
                    console.log(err)
                }
                else{
                    res.json({
                        statusCode:res.statusCode,
                        message:'Room Status Updated'
                    })
                }
            })
        }
        else{
            res.json({
                statusCode:res.statusCode,
                message:'Room not found'
            })
        }
    })

})

//For fetching Rooms
router.get('/getRooms',(req,res) => {
    var occupied,type,roomid;
    const paramId=req.query.id;
    const query="SELECT type,status,room_no,description from Rooms WHERE hotel_id = ?"
    pool.query(query,[paramId],(err,rows,fields)=> {
        if(err){
            console.log(err)
            return
        }
        else{
            if(rows.length){
                const rooms=rows.map((row) => {
                    return{
                        roomno:row.room_no,
                        status:row.status,
                        description:row.description,
                        type:row.type,
                    }
                })

                res.json({
                    statusCode:res.statusCode,
                    message:"Data found",
                    rooms:rooms
                })
            }
            else{
                res.json({
                    statusCode:404,
                    message:"Data not found"
                })
            }
        }
    })
})

//For fetching Live Room View
router.get('/roomPosition',(req,res)=>{
    const hotelId=req.query.id;
    const queries='Select count(room_no) as total_rooms from Rooms where hotel_id=?;'
    + 'Select count(room_no) as vacant from Rooms where hotel_id=? and status=0;'
    + 'Select count(room_no) as occupied from Rooms where hotel_id=? and status=1;'
    + 'Select count(room_no) as reserved from Rooms where hotel_id=? and status=2;'
    + 'Select count(room_no) as in_guest from Rooms where hotel_id=? and status=3;'
    + 'Select count(room_no) as out_guest from Rooms where hotel_id=? and status=4;'
    + 'Select count(room_no) as to_sale from Rooms where hotel_id=? and status=5;'
    + 'Select count(room_no) as maintenance from Rooms where hotel_id=? and status=6;'
    + 'Select count(room_no) as housekeeping from Rooms where hotel_id=? and status=7;'
   

    pool.query(queries,[hotelId,hotelId,hotelId,hotelId,hotelId,hotelId,hotelId,hotelId,hotelId], (err,rows,fields)=>{
        if(err){
            console.log(err)
        }
        else if(rows.length){

            
            res.json({
                total_rooms:rows[0][0].total_rooms,
                vacant:rows[1][0].vacant,
                occupied:rows[2][0].occupied,
                reserved:rows[3][0].reserved,
                in_guest:rows[4][0].in_guest,
                out_guest:rows[5][0].out_guest,
                to_sale:rows[6][0].to_sale,
                maintenance:rows[7][0].maintenance,
                housekeeping:rows[8][0].housekeeping
                
            })
        }
        else{
            res.json({
                statusCode:res.statusCode,
                message:'Invalid hotel id'
            })
        }
    })
})


module.exports = router