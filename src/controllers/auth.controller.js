const connection = require('../databases');
const moment = require('moment');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const User = require('../models/auth.model');
exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const results = await User.findByEmailAndPassword(email, password);
    const user = results[0];
    if (user?.id) {
      const token = jwt.sign(
        {
          userId: user.id,
          userRole: user.role,
        },
        process.env.TOKEN_SECRET,
        { expiresIn: '24h' }
      );
      res.json({
        accessToken: token,
      });
      return;
    }
    next({ message: 'Đăng nhập thất bại' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.register = async (req, res, next) => {
  try {
    const { fullName, email, password, address, dob,gender } = req.body;
    const userResult = await User.findByEmail(email);
    if (userResult.length > 0) {
      return res.json({
        success: false,
        data: {
          message: 'Email đã được sử dụng',
        },
      });
    }
    const results = await User.create(fullName, email, password, address, dob,gender);
    return res.json({
      success: true,
      data: {
        message: 'Đăng ký thành công',
        results: results,
      },
    });
  } catch (err) {
    return res.json({
      success: false,
      data: {
        message: 'Đăng ký thất bại',
      },
    });
  }
};

exports.getMyInformation = async (req, res) => {
  const { userId } = req;
  try {
    const results = await User.getMyInformation(userId);
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.updateMyInformation = async (req, res) => {
  const { fullName, dateOfBirth, address,gender, avatar} = req.body;
  const formatDate = moment(dateOfBirth).format('YYYY-MM-DD');
  const { userId } = req;
  try {
    const results = await User.updateMyInformation(
      fullName,
      formatDate,
      address,
      avatar,
      gender,
      userId,
    );
    res.json({
      success: true,
      data: {
        message: 'Sửa thông tin thành công',
        results: results,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyTickets = async (req, res) => {
  const { userId } = req;
  const {handle}=req.query
  try {
    const result = await User.getMyTickets(userId);
    console.log(result);
    if(!handle)
    {
      res.json(result);
    }
    else{
      const response=[]
      const ticketId=[]
      result.forEach(ticket=>{
        if(!ticketId.includes(ticket.id))
        {
          ticketId.push(ticket.id)
        }
      })
      for(let i=0;i<ticketId.length;i++)
      {
        const allTicketDetail=result.filter(r=>r.id===ticketId[i])
        let ticketIndex={...allTicketDetail[0]};
        const allChairs=allTicketDetail.map(ticket=>`${ticket.xPosition}${ticket.yPosition}`)
        ticketIndex.chairs=[...new Set(allChairs)]
        const products=[]
        allTicketDetail.forEach(ticketDetail=>{
          if(!products.find(product=>product.id===ticketDetail.product_id))
          {
            products.push({
              id:ticketDetail.product_id,
              name:ticketDetail.product_name,
              quantity:ticketDetail.product_quantity,
            })
          }
        })
        ticketIndex.products=products
        response.push(ticketIndex)
      }
      // console.log(response);
      res.json(response);
    }
   
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
