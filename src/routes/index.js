const movieRoute = require('./movie.route');
const cinemaRoute = require('./cinema.route');
const productRoute = require('./product.route');
const empRoute = require('./emp.route');
const scheduleRoute = require('./schedule.route');
const authRoute = require('./auth.route');
const authMiddleware = require('../middlewares/auth.middleware');
const vnPayRouter = require('./vnpay.route.js');

const initRoute = app => {
  app.use('/movies', movieRoute);
  app.use('/cinemas', authMiddleware.checkLogin, cinemaRoute);
  app.use('/products', authMiddleware.checkLogin, productRoute);
  app.use('/employees', authMiddleware.checkAdmin, empRoute);
  app.use('/schedules',authMiddleware.checkLogin, scheduleRoute);
  app.use('/auth', authRoute);
  app.use("/checkout", vnPayRouter);
  app.use((data, req, res, next) => {
    console.log('Handling error middleware', data);
    res.status(500).json({
      success: false,
      data,
    });
  });
};
module.exports = initRoute;
