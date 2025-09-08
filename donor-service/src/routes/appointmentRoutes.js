const express = require("express");
const {
  sendCampOptions,
  scheduleAppointment,
} = require("../controllers/appointmentController.js");

const router = express.Router();

// Send camps email after donor registration
router.post("/send-camps", sendCampOptions);

// Handle scheduling when user clicks the email link
router.get("/schedule", scheduleAppointment);

module.exports = router;
