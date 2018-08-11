const { Router } = require('express')
const router = Router()
var bodyParser = require('body-parser')
var Base64 = require('js-base64').Base64;
var mongoose = require('mongoose');

mongoose.connect(process.env.MONGOLAB_URI);
var Schema = mongoose.Schema;
mongoose.model('Person', new Schema(
  {
    uid: String,
    id: Number,
    name: String,
    name64: String,
    school: String,
    phone: String,
    checkin: String,
    vegetarian: Boolean,
    lunchBox: String,
    dinner: String,
    lunchBox2: String
  }
));

var Person = mongoose.model('Person');
var jsonParser = bodyParser.json()


// set up dataResource router.
router.get('/person', function (req, res) {
  Person.find(req.query, function (err, data) {
    if (err) res.send(500, err);
    else res.json(data);
  });
});

router.post('/person', jsonParser, function (req, res) {
  if (!req.body) return res.sendStatus(400)
  else {
    console.log(req.body);
    var newData = new Person({
      uid: req.body.uid || "",
      id: req.body.id || "",
      name: req.body.name || "",
      name64: req.body.id ? Base64.encodeURI(req.body.name) : "",
      school: req.body.school || "",
      phone: req.body.phone || "",
      checkin: req.body.checkin || "",
      vegetarian: req.body.vegetarian || false,
      lunchBox: req.body.lunchBox || "",
      dinner: req.body.dinner || "",
      lunchBox2: req.body.lunchBox2 || ""
    });
    newData.save(function (err, newData) {
      if (err) res.send(500, err);
      else res.json({ id: newData._id });
    });
  }
});

router.post('/person/:_id', jsonParser, function (req, res) {
  if (!req.body) return res.sendStatus(400)
  else {
    Person.findById(req.params._id, function (err, doc) {
      if (err) res.send(500, err);
      else {
        for (var att in req.body) {
          doc[att] = req.body[att]
        }
        doc.name64 = Base64.encodeURI(doc.name)
        doc.save(function (err, doc) {
          if (err) res.send(500, err);
          else res.json(doc);
        });
      }
    });
  }
});

router.delete('/person/:_id', jsonParser, function (req, res) {
  Person.findByIdAndRemove(req.params._id, function (err, result) {
    if (err) res.send(500, err);
    else res.send(200);
  })
});

router.get('/person/:_id', jsonParser, function (req, res) {
  Person.findById(req.params._id, function (err, doc) {
    if (err) res.send(500, err);
    else {
      for (var att in req.query) {
        if (att === 'lunchBox' && (doc[att] !== '' || doc[att] !== 'notNeed')) {
          res.status(403).send('已經領過便當！')
          return
        }
        if (att === 'dinner' && (doc[att] !== '' || doc[att] !== 'notNeed')) {
          res.status(403).send('已經參加過晚宴！')
          return
        }
        if (att === 'lunchBox2' && (doc[att] !== '' || doc[att] !== 'notNeed')) {
          res.status(403).send('已經領過餐盒！')
          return
        }
      }
      for (var att in req.query) {
        doc[att] = req.query[att]
      }
      doc.name64 = Base64.encodeURI(doc.name)
      doc.save(function (err, doc) {
        if (err) res.send(500, err);
        else res.json(doc);
      });
    }
  });
});

module.exports = router
