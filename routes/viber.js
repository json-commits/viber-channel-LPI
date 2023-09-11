const express = require('express');
const router = express.Router();

const fetch = require('node-fetch');

require('dotenv').config();
const AUTH_TOKEN_VISITS = process.env.VIBER_AUTH_TOKEN_VISITS;
const USER_ID_VISITS = process.env.VIBER_USER_ID_VISITS;

const AUTH_TOKEN_TARF = process.env.VIBER_AUTH_TOKEN_TARF;
const USER_ID_TARF = process.env.VIBER_USER_ID_TARF;

const SPREADSHEET_ID_PROJECTS = process.env.SPREADSHEET_ID_PROJECTS;
const SPREADSHEET_ID_CALENDAR = process.env.SPREADSHEET_ID_CALENDAR;
const sheets = require('../models/sheets');
sheets.authorize().catch(error => console.log(error));

router.post('/webhook', (req, res) => {
    console.log('POST /viber/webhook');
    console.log(req.body);
    res.send(JSON.stringify({status: 0, status_message: "OK"}));
});

router.get('/send_webhook', (req, res) => {
    console.log('GET /viber/send_webhook');
    fetch(
        "https://chatapi.viber.com/pa/set_webhook",
        {
            method: "POST",
            body: JSON.stringify({
                url: "https://5e3e-156-146-56-117.ngrok-free.app/viber/webhook",
                auth_token: AUTH_TOKEN_VISITS
            }),
            headers: {"Content-Type": "application/json"}
        },
    ).then(r => {
        console.log('r:');
        console.log(r);
    });
    res.send(JSON.stringify({status: 0, status_message: "OK"}));
});

router.get('/get_account_info', (req, res) => {
    console.log('GET /viber/get_account_info');
    fetch(
        "https://chatapi.viber.com/pa/get_account_info",
        {
            method: "POST",
            body: JSON.stringify({
                auth_token: AUTH_TOKEN_VISITS
            }),
            headers: {"Content-Type": "application/json"}
        }).then(r => {
        console.log('r:');
        console.log(r);
    });
    res.send(JSON.stringify({status: 0, status_message: "OK"}));
});

router.get('/send_visit_notif', async (req, res) => {
    console.log('GET /viber/send_message');
    let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    let today = new Date();
    let todayString = today.toLocaleDateString("en-US", options);
    let message = `Upcoming Visit(s) [${todayString}]:\n`;
    let sheetObject = await sheets.getRangeData(`Upcoming Visits!A:DH`, SPREADSHEET_ID_PROJECTS);
    let sheetData = sheetObject.data.values.splice(1);
    // console.log(sheetData);
    for (const valueIndex in sheetData) {
        const value = sheetData[valueIndex];
        message +=
`\n[${Number(valueIndex) + 1}]
Code :   ${value[7]}
Name :   ${value[9]}
Title:   ${value[10]}
POIC :   ${value[85]}
Date :   ${value[111]}
`
    }
    fetch(
        "https://chatapi.viber.com/pa/post",
        {
            method: "POST",
            body: JSON.stringify(
                {
                    auth_token: AUTH_TOKEN_VISITS,
                    from: USER_ID_VISITS,
                    type: "text",
                    text: message
                }
            )
        },
    ).then(r => {
        console.log('r:');
        console.log(r);
    });
    res.send(JSON.stringify({status: 0, status_message: "OK"}));
});

router.get('/send_tarf_notif', async (req, res) => {
    console.log('GET /viber/send_message');
    let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    let today = new Date();
    let todayString = today.toLocaleDateString("en-US", options);

    let message = `Upcoming TARF(s) [${todayString}]:\n`;
    let sheetObject = await sheets.getRangeData(`Upcoming TARF!A:X`, SPREADSHEET_ID_PROJECTS);
    let sheetData = sheetObject.data.values.splice(1);
    // console.log(sheetData);
    for (const valueIndex in sheetData) {
        const value = sheetData[valueIndex];
        message +=
            `\n[${Number(valueIndex) + 1}]
Code :   ${value[2]}
Name :   ${value[3]}
Title:   ${value[4]}
POIC :   ${value[7]}
Date :   ${value[8]}
`
    }

    message += `\n-----------------------------------------------------
Upcoming Calendar Event(s) \n[${todayString}]:\n`;
    sheetObject = await sheets.getRangeData(`Filter!A:M`, SPREADSHEET_ID_CALENDAR);
    sheetData = sheetObject.data.values.splice(1);
    for (const valueIndex in sheetData) {
        const value = sheetData[valueIndex];
        message +=
            `\n[${Number(valueIndex) + 1}]
Code :   (${value[1]}) ${value[2]}
Name :   ${value[3]}
Title:   ${value[5]}
POIC :   ${value[6]}
Date :   ${value[11]}
`
    }

    fetch(
        "https://chatapi.viber.com/pa/post",
        {
            method: "POST",
            body: JSON.stringify(
                {
                    auth_token: AUTH_TOKEN_TARF,
                    from: USER_ID_TARF,
                    type: "text",
                    text: message
                }
            )
        },
    ).then(r => {
        console.log('r:');
        console.log(r);
    });


    res.send(JSON.stringify({status: 0, status_message: "OK"}));
});

module.exports = router;
