var express = require('express');
var router = express.Router();
var Admin = require('../models/admin')
var Institution = require('../models/institution')
var Event = require('../models/event')


/* GET users listing. */
router.get('/admin', function(req, res, next) {
    Admin.find().exec(function(err, result) {
        res.send(result);
    })
});

router.get('/institution', function(req, res, next) {
    Admin.findOne().exec(function(err, result) {
        res.send(result);
    })
});
router.post('/admin', function(req, res, next) {
    var obj = {
        email: 'em@gmail.com',
        name: 'Chack Norris',
        dateOfBirthday: '25/11/1970'
    }
    var admin = new Admin(obj);
    admin.save(function(err) {
        if (err) return next(err);
        res.send('saved')
    })
});

router.post('/institution', function(req, res, next) {
    var obj = {
        name: 'Kumpel',
        address: {
            street: 'Chornovola',
            number: 22,
            city: 'Lviv'
        },
        type: 'restaurant',
        admin: '571682326b47fe2a2cbd3903'
    }
    var venue = new Institution(obj);
    venue.save(function(err, result) {
        if (err) return next(err);
        Admin.findOne('571682326b47fe2a2cbd3903').exec(function(err, existingAdmin) {
            existingAdmin.manages.push(result._id);
            existingAdmin.save(function(err, updatedAdmin) {
                res.send({ venue: result, Admin: updatedAdmin })
            })
        })
    })
});
router.get('/event', function(req, res, next) {
    Event.find().exec(function(err, result) {
        res.send(result);
    })
})

router.post('/event', function(req, res, next) {
    var obj = {
        name: 'Disco in da house',
        price: '50uah',
        sex: 'mix',
        type: 'dance'
    }
    var event = new Event(obj);
    event.save(function(err, result) {
        if (err) return next(err);
        res.send(result)
    })
});

router.post('/createall', function(req, res, next) {
    var obj = {
        email: 'em@gmail.com',
        name: 'Viktor Kis',
        dateOfBirthday: '05/11/1993'
    }
    var admin = new Admin(obj);
    admin.save(function(err, adminResult) {
        if (err) return next(err);
        var obj = {
            name: 'Hubble Babble',
            address: {
                street: 'Valova',
                number: 19,
                city: 'Lviv'
            },
            type: 'hookah',
            admin: adminResult._id,
            working_hours: {
                day: 'Monday',
                open_time: '10:00',
                close_time: '22:00'
            }
        }
        var venue = new Institution(obj);
        venue.save(function(err, venueResult) {
            if (err) return next(err);
            var obj = {
                name: 'Dirty Apple',
                price: 'free',
                sex: 'mix',
                type: 'chillout',
                institution: venueResult._id
            }
            var event = new Event(obj);
            event.save(function(err, eventResult) {
                if (err) return next(err);
                Admin.findOne(venueResult.admin).exec(function(err, existingAdmin) {
                    existingAdmin.manages.push(venueResult._id)
                    existingAdmin.save(function(err) {
                        res.send({ adminResult: adminResult, venueResult: venueResult, eventResult: eventResult })
                    })
                })
            })
        })
    })
})

// SubTask #5: API which will add working_hours to institution and save it in DB
router.post('/institution/:id/working_hours', function(req, res, next) {
    Institution.findOne({_id: req.params.id}).exec(function(err, Inst) {
        Inst.working_hours.push({
            day: 'Sunday',
            open_time: '11:00',
            close_time: '19:10'
        })
            Inst.save(function(err) {
                res.send("Success")
            })
        })
});

// SubTask #7: API which will add start_time to event 
router.post('/event/:id/start_time', function(req, res, next) {
    Event.findOne({_id: req.params.id}).exec(function(err, ev) {
        if (err) throw err;

        ev.start_time = new Date('Jun 11, 2017 14:00');
        ev.start_time.setHours(ev.start_time.getHours() + 3);
        ev.save(function(err) {
           if (err) throw err;
           console.log('Saved start time for event');
        })
        res.send(ev);
    })
});

// SubTask #8: Get all events
router.get('/events', function(req, res, next) {
    Event.find({}, {name: 1, start_time: 1, _id: 0}).exec(function(err, ev) {
        res.send(ev);
    })
});

router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

router.get('/all', function(req, res, next) {
    Admin.find().populate('manages').exec(function(err,admins){
        Institution.find().populate('admin').exec(function(err,institutions){
            Event.find().populate('institution').exec(function(err,events){
                res.send({admins:admins,institutions:institutions,events:events})
            })
        })
    })
});

module.exports = router;