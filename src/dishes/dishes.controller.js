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
    if (Number.isNaN(Number(price)) || Number(price) <= 0) {
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
        return next({
            status: 400,
            message: `Dish must include a ${fieldName}`
        });
    }
}

function doesDishRecordExist(req, res, next) {
    const dishId = Number(req.params.dishId);

    if (dishId) {
        const dishRecord = dishes.find(dish => dish.id === Number(dishId));
        if (dishRecord) {
            res.locals.dishRecord = dishRecord;
            next();
        } else {
            return next({
                status: 404,
                message: `Dish with id ${dishId} not found`
            });
        }
    } else {
        return notFound(req, res, next);
    }
}

function list(req, res) {
    res.status(200).json({ data: dishes });
}

function create(req, res, next) {
    const { name, description, price, image_url } = req.body.data;

    const newDishRec = {
        id: nextId(), // Make sure nextId is a function and not a variable
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
    const dishRecordToUpdate = res.locals.dishRecord;
    const { id, name, description, price, image_url } = req.body.data;
    const dishId = req.params.dishId;

    if (!dishId) {
        if (dishRecordToUpdate) {
            dishRecordToUpdate.id = id;
            dishRecordToUpdate.name = name;
            dishRecordToUpdate.description = description;
            dishRecordToUpdate.price = Number(price); // Ensure price is a number
            dishRecordToUpdate.image_url = image_url;
            
            res.status(200).json({ data: dishRecordToUpdate });
        } else {
            return next({
                status: 404,
                message: `Dish not found`
            });
        }
    }
    
}

function destroy(req, res, next) {
    const dishId = Number(req.params.dishId);
    const index = dishes.findIndex(dish => dish.id === Number(dishId));

    if (index !== -1) {
        dishes.splice(index, 1);
        res.status(204).end();
    } else {
        return next({
            status: 405,
            message: `Dish with id ${dishId} not found for delete`
        });
    }
}

function read(req, res) {
    res.status(200).json({ data: res.locals.dishRecord });
}

module.exports = {
    list,
    create: [validateDishInput, create],
    read: [doesDishRecordExist, read],
    update: [validateDishInput, doesDishRecordExist, update],
    delete: [doesDishRecordExist, destroy],
    doesDishRecordExist
};