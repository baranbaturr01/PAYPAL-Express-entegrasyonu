const express = require('express');
const app = express();
require('dotenv').config();
//create server
const paypal = require('paypal-rest-sdk');

const client_id = process.env.CLIENT_ID
const secret = process.env.CLIENT_SECRET

paypal.configure({
    mode: 'sandbox', //sandbox or live
    client_id: 'Afxg2_Ab6PqnX0BYS0aBSvWD_y9Z3bAEehJFr_TeOrjTMrXJn_pXYtaSqb6GGkPnp3PW6L5aDonG7Y2k',
    client_secret: 'EE4Lxq1Yr_xJ6ciW9bDYvUPQREzqJgKxicMQlVpOH8goh17saHSQTnqfTD4QaJ0GlA3IdlPEpBPNOsnx'
})

app.get('/create', (req, res) => {
    //build paypal payment request
    var payReq = JSON.stringify({
        intent: 'sale',
        redirect_urls: {
            return_url: 'http://localhost:3005/process',
            cancel_url: 'http://localhost:3005/cancel'
        },
        payer: {
            payment_method: 'paypal'
        },
        transactions: [{
            amount: {
                total: '0.10',// Eğer amount değeri 0 girilirse paypal hata veriyor(amount değeri 0 dan büyük olmalıdır) 
                currency: 'USD'
            },
            description: 'This is the payment description.'
        }]
    })

    paypal.payment.create(payReq, (err, payment) => {
        if (err) {
            console.log(err);
        }
        else {
            const links = {}
            payment.links.forEach(linkObj => {
                links[linkObj.rel] = {
                    href: linkObj.href,
                    method: linkObj.method
                }
            })
            //if redirect url present, redirect user
            if (links.hasOwnProperty('approval_url')) {
                res.redirect(links['approval_url'].href);
            } else {
                console.error('no redirect URI present');
            }
        }
    })
})

app.get('/process', (req, res, next) => {

    const paymentId = req.query.paymentId;
    const payerId = {
        payer_id: req.query.PayerID
    }
    paypal.payment.execute(paymentId, payerId, (err, payment) => {
        if (err) {
            console.log(err)
        }
        else {
            if (payment.state === 'approved') {
                res.send('payment success')
            }
            else {
                res.send('payment not success')
            }
        }
    })

})

app.listen(3005, function () {
    console.log('listening on port 3005');
})