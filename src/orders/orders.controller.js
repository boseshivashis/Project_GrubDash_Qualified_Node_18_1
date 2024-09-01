const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
//router.route("/").get(ordersController.list).post(ordersController.create);
//router.route("/:orderId").get(ordersController.read).put(ordersController.update).delete(ordersController.delete);


// deliverTo property is missing	Order must include a deliverTo
// deliverTo property is empty ""	Order must include a deliverTo
// mobileNumber property is missing	Order must include a mobileNumber
// mobileNumber property is empty ""	Order must include a mobileNumber
// dishes property is missing	Order must include a dish
// dishes property is not an array	Order must include at least one dish
// dishes array is empty	Order must include at least one dish
// A dish quantity property is missing	dish ${index} must have a quantity that is an integer greater than 0
// A dish quantity property is zero or less	dish ${index} must have a quantity that is an integer greater than 0
// A dish quantity property is not an integer	dish ${index} must have a quantity that is an integer greater than 0

function validateOrderInput(req, res, next) {
    const { id, deliverTo, mobileNumber, status,dishes} = req.body.data;

    isInputFieldEmpty(deliverTo, next, "deliverTo");
    isInputFieldEmpty(mobileNumber, next, "mobileNumber");
    isInputFieldEmpty(dishes, next, "dishes");

    if(dishes && !Array.isArray(dishes)) {
      next({
            status: 400,
            message: `Order must include at leat one dish`
        })
    }
    // Validate dishes
    if(dishes && dishes.length === 0)
    {
        next({
            status: 400,
            message: `Order must include at leat one dish`
        }

        )
    }

      if(dishes) {
         dishes.forEach( (dish, index) => {
           
          
        if(dish && (!dish.quantity || 
            Number.isNaN(dish.quantity) ||
            dish.quantity <= 0) )
             {
            next({
                status: 400,
                message: `dish ${index} must have a quantity that is an integer greater than 0`
            })
        }
    })
      }
   
    // All Validations passed. Proceed with the request
    next();
}

function isInputFieldEmpty(fieldValue, next, fieldName) {
    if (!fieldValue || fieldValue === "") {
        return next({
            status: 400,
            message: `Order must include a  ${fieldName}`
        });
    }
}

function doesOrderRecordExist(req, res, next) {
    const orderId = req.params.orderId;

    if (orderId) {
        const orderRec = orders.find( (order) => order.id === Number(orderId));
        if(orderRec) {
            res.locals.orderRec = orderRec;
            next();
        } else {
            next({
                status: 404,
                message: `No Matching Record found for Order id ${orderId}`
            })
        }
    } else {
        next({
            status: 500,
            message: `Order Id is null and not available`
        })
    }
}


function list(req, res, next) {
    res.status(200).json({data: orders})
}


function create(req, res, next) {
    const {deliverTo, mobileNumber, status,dishes} = req.body.data;

    let newOrderRec = {
        id: nextId,
        deliverTo: deliverTo,
        mobileNumber: mobileNumber, 
        status: status,
        dishes: dishes
    }

    orders.push(newOrderRec);

    next({
        status: 201,
        data: newOrderRec
    })


}

function update(req, res, next) {
    const orderId = req.params.orderId;

    if(res.locals.orderRec) {
        let userRecForUpdate = res.locals.orderRec;
        const {deliverTo, mobileNumber, status,dishes} = req.body.data;

        userRecForUpdate.id = orderId;
        userRecForUpdate.deliverTo = deliverTo;
        userRecForUpdate.mobileNumber = mobileNumber;
        userRecForUpdate.status = status;
        userRecForUpdate.dishes = dishes;
        res.status(200).json({data: userRecForUpdate});
    } else {
        next({
            status: 404,
            message: `No Order Record is not found for ${orderId}`
        })
    }

}

function destroy(req, res, next) {


}

function read(req, res, next) {
    // GET http://localhost:5000/orders/f6069a542257054114138301947672ba
    const orderId = req.params.orderId;
    if(res.locals.orderRec) {
        res.status(200).json({data: res.locals.orderRec})
    } 
}

// TODO: Implement the /dishes handlers needed to make the tests pass
module.exports = {
    list: list,
    create: [validateOrderInput, create],
    read: [doesOrderRecordExist, read],
    update: [validateOrderInput,doesOrderRecordExist, update],
    delete: [doesOrderRecordExist, destroy]
}