const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");


function validateOrderInput(req, res, next) {
    const { id, deliverTo, mobileNumber, status,dishes} = req.body.data;

    isInputFieldEmpty(deliverTo, next, "deliverTo");
    isInputFieldEmpty(mobileNumber, next, "mobileNumber");
    isInputFieldEmpty(dishes, next, "dishes");

    if(!Array.isArray(dishes)) {
     return next({
            status: 400,
            message: `Order must include at leat one dish`
        })
    }
    // Validate dishes
    if(Array.isArray(dishes) && dishes.length === 0)
    {
       return  next({
            status: 400,
            message: `Order must include at leat one dish`
        }

        )
    }
    
  // Validate each dish in the dishes array
    if (dishes) {
        dishes.forEach((dish, index) => {
            // Check if quantity is missing
            if (dish.quantity === undefined) {
                return next({
                    status: 400,
                    message: `Dish ${index} must have a quantity`
                });
            }
            
            // Check if quantity is not an integer
            if (!Number.isInteger(dish.quantity)) {
                return next({
                    status: 400,
                    message: `Dish ${index} must have a quantity that is an integer`
                });
            }

            // Check if quantity is less than or equal to 0
            if (dish.quantity <= 0) {
                return next({
                    status: 400,
                    message: `Dish ${index} must have a quantity that is greater than 0`
                });
            }
        });
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

function isStatusInvalid(statusValue, next) {
  if (statusValue && statusValue === "invalid") {
       return next({
            status: 400,
            message: `Order status is invalid`
        });
    }
}

function doesOrderRecordExist(req, res, next) {
    const orderId = req.params.orderId;

    if (orderId) {
        const orderRec = orders.find( (order) => order.id === orderId);
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
    const newId = nextId();
  
    let newOrderRec = {
        id: newId,
        deliverTo: deliverTo,
        mobileNumber: mobileNumber, 
        status: status,
        dishes: dishes
    }

    orders.push(newOrderRec);

    res.status(201).json({ data: newOrderRec });

}

function update(req, res, next) {
    const orderId = req.params.orderId;

    if(res.locals.orderRec) {
        let userRecForUpdate = res.locals.orderRec;
        const {id, deliverTo, mobileNumber, status,dishes} = req.body.data;
      
         if(!status || status === "" || status === "invalid") {
           res.status(400).json({error: "status field is needed"})
         } else {

            if(!id || id === orderId) {
            userRecForUpdate.id = orderId;
            userRecForUpdate.deliverTo = deliverTo;
            userRecForUpdate.mobileNumber = mobileNumber;
            userRecForUpdate.status = status;
            userRecForUpdate.dishes = dishes;
            res.status(200).json({data: userRecForUpdate});
            } else {
            res.status(400).json({error: `Data.id ${id} does not match with order id parameter ${orderId}`})
            } 
         }
        
    } else {
      res.json(404).json({error: `No Order Record is not found for ${orderId}`});
    }

}

function destroy(req, res, next) {
      const orderId = req.params.orderId;

    if(res.locals.orderRec) {
      let userRecForDelete = res.locals.orderRec;
      
      if(userRecForDelete.status !== 'pending') {
        res.status(400).json({error: `Order Status is ${userRecForDelete.status} and not pending`})
      } else {
              const deleteIndex = orders.findIndex((order) => order.id === orderId);
              if(deleteIndex != -1) {
                orders.splice(deleteIndex, 1);
                res.status(204).end();
              }
      }
    } else {
      res.status(405).json({error: `No Order record forund for ${orderId}`})
    }

}

function read(req, res, next) {
    // GET http://localhost:5000/orders/f6069a542257054114138301947672ba
    const orderId = req.params.orderId;
    if(res.locals.orderRec) {
        res.status(200).json({data: res.locals.orderRec})
    } else {
      res.status(404).json({error: `No Record obtained for Order ${orderId}`})
    }
}

// TODO: Implement the /dishes handlers needed to make the tests pass
module.exports = {
    list: list,
    create: [validateOrderInput, create],
    read: [doesOrderRecordExist, read],
    update: [validateOrderInput,doesOrderRecordExist, update],
    delete: [doesOrderRecordExist, destroy],
}