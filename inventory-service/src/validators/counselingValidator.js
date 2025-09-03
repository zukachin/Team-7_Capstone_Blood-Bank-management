const Joi = require("joi");

const counselingSchema = Joi.object({
  donor_id: Joi.number().integer().required(),
  camp_id: Joi.number().integer().allow(null),
  centre_id: Joi.alternatives().try(Joi.string(), Joi.number()).allow(null),
  height: Joi.number().required(),
  weight: Joi.number().required(),
  hb_level: Joi.number().required(),
  previous_donation_date: Joi.date().required(),
  drunk_last_12hrs: Joi.boolean().required(),
  well_today: Joi.boolean().required(),
  under_medication: Joi.boolean().required(),
  fever_in_2_weeks: Joi.boolean().required(),
  recently_delivered: Joi.boolean().required(),
  pregnancy: Joi.boolean().required(),
  surgery: Joi.boolean().required(),
  disease_history: Joi.string().allow("")
}).or("camp_id", "centre_id"); 





const campIdValidator = Joi.object({
  campId: Joi.number().integer().positive().required(),
});


const centreIdValidator = Joi.object({
  centreId: Joi.string().pattern(/^[A-Z]$/).required(),
});

const validateCampId = (req, res, next) => {
  const { error } = campIdValidator.validate(req.params);
  if (error) {
    return res.status(400).json({ msg: "Validation failed", error: error.details[0].message });
  }
  next();
};

const validateCentreId = (req, res, next) => {
  const { error } = centreIdValidator.validate(req.params);
  if (error) {
    return res.status(400).json({ msg: "Validation failed", error: error.details[0].message });
  }
  next();
};




module.exports = { counselingSchema , validateCampId, validateCentreId};
