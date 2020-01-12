var pool = require('./database')
const express = require('express')
const mysql=require('mysql')
const router=express.Router()

router.post('/getRooms',(req,res) => {
    var occupied,type,roomid;
    const paramId=req.body.id;
    const query="SELECT type,status,description,room_no from Rooms WHERE hotel_id = ?"
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
                        type:row.type
                    }
                })

                res.json(rooms)
            }
            else{
                res.json({
                    rooms:'Data not found'
                })
            }
        }
    })
})

router.post('/getGuests',(req,res) => {
    var occupied,type,roomid;
    const paramId=req.body.id;
    const query="SELECT room_no,name,check_in,check_out from Guests WHERE hotel_id = ?"
    pool.query(query,[paramId],(err,rows,fields)=> {
        if(err){
            console.log(err)
            return
        }
        else{
            if(rows.length){
                console.log(rows)
                const guests=rows.map((row) => {
                    return{
                        roomno:row.room_no,
                        guestName:row.name,
                        checkInDate:new Date(row.check_in).toLocaleString('indian', { timeZone: 'asia/kolkata' }).replace(/(\w+)\/(\w+)\/(\w+), (\w+)/, '$3-$2-$1 $4'),
                        checkOutDate:new Date(row.check_out).toLocaleString('indian', { timeZone: 'asia/kolkata' }).replace(/(\w+)\/(\w+)\/(\w+), (\w+)/, '$3-$2-$1 $4')
                    }
                })

                res.json(guests)
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

router.post('/addRoom',(req,res) => {
    const hotelId=req.body.id;
    const roomNo=req.body.roomNo;
    const roomType=req.body.roomType;
    //const roomStatus=req.body.roomStatus;
    const roomDescription=req.body.roomDescription;
    const outerQuery="SELECT room_no FROM Rooms where hotel_id=? AND room_no=?"
    const query="INSERT INTO Rooms(hotel_id,room_no,type,description) VALUES (?,?,?,?)"
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
            pool.query(query,[hotelId,roomNo,roomType,roomDescription],(err,rows,fields)=> {
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

router.post('/checkin', (req,res) => {
    const hotelId=req.body.id;
    const guestName=req.body.guestName;
    const checkin=req.body.checkIn;
    const roomNo=req.body.roomNo;
    const roomStatus=req.body.roomStatus;
    const phoneNo=req.body.phoneNo;
    const tariff=req.body.tariff;
    const deposit=req.body.deposit;
    const checkout=req.body.checkOut;
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
                statusCode:res.statusCode,
                message:"Invalid Room entered/Guest already exists"
            })
        }
        else{
            pool.query(query,[hotelId,roomNo,guestName,phoneNo,checkin,checkout,deposit,tariff],(err,rows,fields) =>{
                if(err){
                    console.log(err)
                    return
                }
                else{
                    pool.query(updateQuery,[roomNo,hotelId], (err,rows,fields) => {
                        if(err){
                            console.log(err)
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

router.post('/checkout', (req,res) => {
    const hotelId=req.body.id;
    const roomNo=req.body.roomNo;
    const checkOutTime=req.body.checkOut;
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

router.post('/roomPosition',(req,res)=>{
    const hotelId=req.body.id;
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
                statusCode:res.statusCode,
                message:'Rooms fetched successfully',
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

router.post('/getGuestDetails',(req,res)=>{
    const id=req.body.hotelId
    const room_no=req.body.roomNo
    const query="SELECT name,check_in,check_out,deposit,actual_tariff from Guests where hotel_id=? and room_no=?"
    pool.query(query,[id,room_no],(err,rows,fields)=>{
        if(err){
            console.log(err)
        }
        else if(rows.length){
                console.log(rows[0].name);
                res.json({
                    name:rows[0].name,
                    check_in:new Date(rows[0].check_in).toLocaleString('indian', { timeZone: 'asia/kolkata' }).replace(/(\w+)\/(\w+)\/(\w+), (\w+)/, '$3-$2-$1 $4'),
                    check_out:new Date(rows[0].check_out).toLocaleString('indian', { timeZone: 'asia/kolkata' }).replace(/(\w+)\/(\w+)\/(\w+), (\w+)/, '$3-$2-$1 $4'),
                    deposit:rows[0].deposit,
                    actual_tariff:rows[0].actual_tariff
                })
           
        }
        else{
            res.json({
                name:'NA',
                check_in:'NA',
                check_out:'NA',
                deposit:0,
                actual_tariff:0
            })
        }
    })

})

router.post('/reserveRoom',(req,res)=>{
    const hotelId=req.body.hotelId;
    const no_of_rooms=parseInt(req.body.totalRooms);
    const name=req.body.name;
    const phone=req.body.phone;
    const checkin=req.body.checkInDate;
    const checkout=req.body.checkOutDate;
    const deposit=parseInt(req.body.deposit);
    const actual_tariff=parseInt(req.body.actual_tariff);
    const type=req.body.type;

    const query1="SELECT room_no from Rooms where status=0 and hotel_id=? LIMIT ?";
    const query2="Update Rooms set status=2 where room_no=? and hotel_id=?";
    const query3="Insert into Guests(hotel_id,room_no,name,phone_no,check_in,deposit,actual_tariff)VALUES(?,?,?,?,?,?,?)"
    pool.query(query1,[hotelId,no_of_rooms],(err,rows,fields)=>{
        if(err){
            console.log(err)
        }
        else if(rows.length==no_of_rooms){
            console.log(rows.length)
            const rooms = rows.map((row)=>{
                return {
                    rooms:row.room_no
                }
            })
            for(var i=0;i<rows.length;i++){
                var room_no=rows[i].room_no;
                pool.query(query2,[rows[i].room_no,hotelId],(err,rowss,fields)=>{
                    if(err){
                        console.log(error);
                    }
                    else{
                        pool.query(query3,[hotelId,room_no,name,phone,checkin,deposit,actual_tariff],(err,rowsss,fields)=>{
                            if(err){
                                console.log(err)
                            }
                            else{
                                console.log('guest list updated')
                            }
                        })
                    }
                })
            }
            res.json({
                statusCode:200,
                message:'Rooms Reserved'
            });
        }
        else{
            console.log(rows.length)
            res.json({
                statusCode:200,
                message:'No Rooms available'
            });
        }
    })

})

module.exports = router