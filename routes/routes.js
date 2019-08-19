const express = require('express')
const router = express.Router();

var config = require('../data/config.js');
const sql = require('mssql');



function ConnectToDB() {
    sql.connect(config, (err) => {
        if (err) return console.log('Could not create DB Connection!');
        console.log('Successfully Connected to Database!');
    });
}


require('dotenv').config()
var err = false;

var NotifyClient = require('notifications-node-client').NotifyClient,
    notify = new NotifyClient(process.env.NotifyKey);


// Add your routes here - above the module.exports line

router.get('/', (req, res) => {
    req.session.data = {};
    res.render('index')
})

router.get('/register', (req, res) => {
    res.render('register')
})

router.get('/register-profile', (req, res) => {
    res.render('register-profile')
})

router.get('/register-gambling', (req, res) => {
    res.render('register-gambling')
})

router.get('/register-optional', (req, res) => {
    res.render('register-optional')
})

router.get('/register-contact', (req, res) => {
    res.render('register-contact')
})

router.post('/register', (req, res) => {



    err = false;
    var err_first_name = false;
    var err_last_name = false;


    if (req.body['first-name'] === "") {
        err = true;
        err_first_name = true;
    }

    if (req.body['last-name'] === "") {
        err = true;
        err_last_name = true;
    }

    if (req.session.cya === 'y') {
        res.redirect('register-check')
    } else {

        if (err) {
            res.render('register', {
                err,
                err_first_name,
                err_last_name
            })
        } else {

            res.redirect('register-profile')
        }
    }
})

router.post('/register-profile', (req, res) => {

    err = false;
    var describe = false;


    if (req.body['describe'] === undefined) {
        err = true;
        describe = true;
    }



    if (req.session.cya === 'y') {
        res.redirect('register-check')
    } else {
        if (err) {
            res.render('register-profile', {
                err,
                describe
            })
        } else {

            res.redirect('register-gambling')
        }
    }
})



router.post('/register-gambling', (req, res) => {
    err = false;
    var licensed = false;


    if (req.body['licensed'] === undefined) {
        err = true;
        licensed = true;
    }



    if (req.session.cya === 'y') {
        res.redirect('register-check')
    } else {
        if (err) {
            res.render('register-gambling', {
                err,
                licensed
            })
        } else {
            res.redirect('register-contact')
        }
    }
})

router.post('/register-contact', (req, res) => {
    err = false;
    var err_email = false;
    var err_telephone_number = false;


    if (req.body['email'] === "") {
        err = true;
        err_email = true;
    }

    if (req.body['telephone-number'] === "") {
        err = true;
        err_telephone_number = true;
    }

    if (req.session.cya === 'y') {
        res.redirect('register-check')
    } else {

        if (err) {
            res.render('register-contact', {
                err,
                err_email,
                err_telephone_number
            })
        } else {

            res.redirect('register-optional')
        }
    }
})

router.post('/register-optional', (req, res) => {

    res.redirect('register-check')
})

router.get('/register-check', (req, res) => {
    req.session.cya = 'y';

    res.render('register-check')
})

router.post('/register-check', (req, res) => {

    sql.close();
    var firstname = req.session.data['first-name'];
    var lastname = req.session.data['last-name'];
    var describe = req.session.data['describe'];
    var licensed = req.session.data['licensed'];
    var email = req.session.data['email'];
    var telephone = req.session.data['telephone-number'];
    var disabled = req.session.data['disabled'];
    var moredetail = req.session.data['more-detail'];
    var method = req.session.data['method'];

    if(describe === 'I am a member of the public'){
        describe = 'Public'
    }

    if(describe === 'I work in the gambling industry'){
        describe = 'Gambling industry'
    }

    if(describe === 'I work for a charity'){
        describe = 'Charity sector'
    }

    if(describe === 'I work in the media/news industry'){
        describe = 'Media'
    }
    
    if(describe === 'I work in the medical profession'){
        describe = 'Healthcare'
    }

    if(describe === 'I work in the education sector'){
        describe = 'Education'
    }

    if (disabled === undefined) {
        disabled = "skipped";
        moredetail = "skipped";
    }

    if (disabled === 'No') {
        moredetail = "N/A";
    }

    // Save to DB



    var date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    console.log(date);

    const addParticipant = require('../data/addParticipant.js');
    

    addParticipant(firstname,lastname,email, telephone, method, disabled, moredetail, describe, licensed, date)

    // Send notification
    notify
        .sendEmail(process.env.newregistrationemail, process.env.recipient, {
            personalisation: {
                'first-name': firstname,
                'last-name': lastname,
                'describe': describe,
                'licensed': licensed,
                'email': email,
                'telephone-number': telephone,
                'disabled': disabled,
                'more-detail': moredetail
            }
        })
        .then(response => console.log("Sent"))
        .catch(err => console.error("errored"))

    notify
        .sendEmail(process.env.useremail, email, {
            personalisation: {
                'first-name': firstname
            }
        })
        .then(response => console.log("Sent"))
        .catch(err => console.error("errored"))


    res.redirect('register-complete')
})

router.get('/register-complete', (req, res) => {
    req.session.data = {}

    res.render('register-complete')
})

module.exports = router