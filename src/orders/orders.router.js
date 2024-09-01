const router = require("express").Router();
const notAllowed = require("../errors/methodNotAllowed");

// TODO: Implement the /orders routes needed to make the tests pass

const ordersController = require("./orders.controller");


router.route("/").
get(ordersController.list).
post(ordersController.create).
all(notAllowed);


router.route("/:orderId").
get(ordersController.read).
put(ordersController.update).
delete(ordersController.delete).
all(notAllowed);

module.exports = router;
