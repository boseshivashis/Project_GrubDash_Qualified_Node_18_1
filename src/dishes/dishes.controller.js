const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));
const notFound = require("../errors/notFound");

// Use this function to assign IDs when necessary
const nextId = require("../utils/nextId");

function validateDishInput(req, res, next) {
    const { id, name, description, price, image_url } = req.body.data;

    isInputFieldEmpty(name, next, "name");
    isInputFieldEmpty(description, next, "description");
    isInputFieldEmpty(price, next, "price");
    isInputFieldEmpty(image_url, next, "image_url");

    // Check price for valid number
    if (Number.isNaN(price)) {
         return next({
            status: 400,
            message: `Dish must have a price that is an integer greater than 0`
        });
    }
  
    if(!Number.isNaN(price) && Number(price) <= 0){
      return next({
            status: 400,
            message: `Dish must have a price that is an integer greater than 0`
        });
    }

    // All Validations passed. Proceed with the request
    next();
}

function isInputFieldEmpty(fieldValue, next, fieldName) {
    if (!fieldValue || fieldValue === "") {
       return  next({
            status: 400,
            message: `Dish must include a ${fieldName}`
        });
    }
}

function doesDishRecordExist(req, res, next) {
    const dishId = req.params.dishId;

    if (dishId) {
        const dishRecord = dishes.find(dish => dish.id === dishId);
        if (dishRecord) {
            res.locals.dishRecord = dishRecord;
            next();
        } else {
             next({
                status: 404,
                message: `Dish with id ${dishId} not found`
            });
        }
    } else {
         //notFound(req, res, next);
   next({
            status: 500,
            message: `Order Id is null and not available`
        })    }
}

function list(req, res) {
    res.status(200).json({ data: dishes });
}

function create(req, res, next) {
    const { name, description, price, image_url } = req.body.data;
  const newDishId = nextId();

    const newDishRec = {
        id: newDishId, 
        name: name,
        description: description,
        price: Number(price), // Ensure price is a number
        image_url: image_url
    };

    // Add this record to list of dishes
    dishes.push(newDishRec);

    res.status(201).json({ data: newDishRec });
}

function update(req, res, next) {
    const dishId = req.params.dishId;

  if(res.locals.dishRecord) {
        let dishRecordToUpdate = res.locals.dishRecord;

        const { id, name, description, price, image_url } = req.body.data;
        
    if (!id || id === dishId) {
            dishRecordToUpdate.id = id;
            dishRecordToUpdate.name = name;
            dishRecordToUpdate.description = description;
            dishRecordToUpdate.price = Number(price); // Ensure price is a number
            dishRecordToUpdate.image_url = image_url;
            res.status(200).json({ data: dishRecordToUpdate });
    } else {
          res.status(400).json({error: `Dish Id Parameter ${dishId} does not match data.id ${id}`})
        }
  } else {
          res.json(404).json({error: `No Order Record is not found for ${orderId}`});
  }
    
}

function destroy(req, res, next) {
    const dishId = req.params.dishId;
  
  
    if(res.locals.dishRecord) {
          const index = dishes.findIndex( (dish) => dish.id === dishId);
          console.log("Deelte index is ", index);
      
          if(index != -1) {
            dishes.splice(index, 1);
            res.status(204).end();
          } else {
             res.status(405).json({error: `Delete could not be done for dish id: ${dishId}`})
          }
    } else {
      res.status(405).json({error: `Delete could not be done for dish id: ${dishId}`})
    }

//     if (index !== -1) {
//         dishes.splice(index, 1);
//         res.status(204).end();
//     } else {
//       res.status(405).json({error: `Dish with id ${dishId} not found for delete`})
//     }
}

function read(req, res) {
    res.status(200).json({ data: res.locals.dishRecord
                      });
}

module.exports = {
    list,
    create: [validateDishInput, create],
    read: [doesDishRecordExist, read],
    update: [validateDishInput, doesDishRecordExist, update],
    delete: [doesDishRecordExist, destroy]
};