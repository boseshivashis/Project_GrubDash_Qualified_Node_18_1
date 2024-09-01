const router = require("express").Router();
const dishesController = require("./dishes.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");

// TODO: Implement the /dishes routes needed to make the tests pass

// Define routes for /dishes
router.route("/")
  .get(dishesController.list)        // List all dishes
  .post(dishesController.create)     // Create a new dish
  .all(methodNotAllowed);            // Handle unsupported methods

router.route("/:dishId")
  //.all(dishesController.doesDishRecordExist) // Middleware to check if dish exists
  .get(dishesController.read)                // Read a specific dish
  .put(dishesController.update)              // Update a specific dish
  .delete(dishesController.delete)           // Delete a specific dish
  .all(methodNotAllowed);     


module.exports = router;
