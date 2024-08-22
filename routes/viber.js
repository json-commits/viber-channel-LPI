const express = require('express');
const router = express.Router();

const fetch = require('node-fetch');
const fs = require('fs');

const playwright = require('playwright');
const { spawnSync } = require('child_process');

require('dotenv').config();
const AUTH_TOKEN_VISITS = process.env.VIBER_AUTH_TOKEN_VISITS;
const USER_ID_VISITS = process.env.VIBER_USER_ID_VISITS;

const AUTH_TOKEN_TARF = process.env.VIBER_AUTH_TOKEN_TARF;
const USER_ID_TARF = process.env.VIBER_USER_ID_TARF;

const AUTH_TOKEN_DEBUG = process.env.VIBER_AUTH_TOKEN_DEBUG;
const USER_ID_DEBUG= process.env.VIBER_USER_ID_DEBUG;

// const SPREADSHEET_ID_PROJECTS = process.env.SPREADSHEET_ID_PROJECTS;
// const SPREADSHEET_ID_CALENDAR = process.env.SPREADSHEET_ID_CALENDAR;
// const sheets = require('../models/sheets');
// sheets.authorize().catch(error => console.log(error));

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

    const page_with_files = "https://leprice.sharepoint.com/:f:/g/EuTbquoqgFFKojRpIaBpQqgBl9xy9eS0JDzP0vdldryFUw?e=4Ox1Z7";
    const page_with_ledgers = "https://leprice.sharepoint.com/Shared%20Documents/Forms/AllItems.aspx?ga=1&id=%2FShared%20Documents%2FLPI%20Hub%2DShared%20Folder%2FService%20Department%2FProject%20Engineering%20Cost%20Ledgers";

    await (async () => {
        const browser = await playwright['chromium'].launch();
        const context = await browser.newContext({acceptDownloads: true});
        const page = await context.newPage()

        console.log("Visiting Hub page");
        await page.goto(page_with_files, {timeout: 60000});

        console.log("Visiting Ledgers page");
        await page.goto(page_with_ledgers, {timeout: 60000});

        console.log("Clicking on `2023 Projects.xlsx`");
        await page.getByLabel("2023 Projects.xlsx").click({timeout: 60000});

        // console.log("Clicking on `Project Engineering Cost Ledgers` ");
        // await page.getByText("Project Engineering Cost Ledgers").dblclick();
        //
        // console.log("Clicking on `2023 Projects.xlsx`");
        // await page.getByText("2023 Projects.xlsx").click();
        // await page.getByLabel("2023 Projects.xlsx").getByTitle("Show more actions for this item").click();
        //
        console.log("Download promise initialized");
        const downloadPromise = page.waitForEvent("download");

        console.log("Clicking on `Download`")
        await page.getByText("Download").dblclick({timeout: 60000});

        console.log("Awaiting download");
        const download = await downloadPromise;
        await download.saveAs("./files/" + download.suggestedFilename());

        await browser.close();
    })();

    const pythonProcess = spawnSync('python', ['./files/project_data_export.py']);

    console.log(pythonProcess.output.toString());

    let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    let today = new Date();
    let todayString = today.toLocaleDateString("en-US", options);
    let message = `Upcoming Visit(s) [${todayString}]:\n`;

    const next_visits = JSON.parse(fs.readFileSync("./files/next_visits.json", "utf8"));
    if (next_visits.length > 0){
        for (const visitIndex in next_visits){
            let visit = next_visits[visitIndex]

            if (visit['POIC'] === "" || visit['POIC'] === undefined || visit['POIC'] === null){
                visit['POIC'] = "No one assigned"
            }

            message +=
                `\n[${Number(visitIndex) + 1}]
Code :   ${visit['CODE']}
Name :   ${visit['NAME']}
Title:   ${visit['PROJECT_TITLE']}
POIC :   ${visit['POIC']}
Date :   ${visit['DATE']}
`
        }
    }
    else{
        message += `\n None`
    }


//     for (const valueIndex in sheetData) {
//         const value = sheetData[valueIndex];
//         if(value[0] === "" || value[0] === undefined) continue;
//         message +=
// `\n[${Number(valueIndex) + 1}]
// Code :   ${value[7]}
// Name :   ${value[9]}
// Title:   ${value[10]}
// POIC :   ${value[92]}
// Date :   ${value[107]}
// `
//         if (!(value[19] === undefined || value[18] === "")){
//             message += `REMARKS: ${value[18].toUpperCase()}\n`
//         }
//     }
    fetch(
        "https://chatapi.viber.com/pa/post",
        {
            method: "POST",
            body: JSON.stringify(
                {
                    auth_token: AUTH_TOKEN_DEBUG,
                    from: USER_ID_DEBUG,
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

    let message = `Upcoming Calendar Event(s) \n[${todayString}]:\n`;
    let sheetObject = await sheets.getRangeData(`Filter!A:M`, SPREADSHEET_ID_CALENDAR);
    let sheetData = sheetObject.data.values.splice(1);

    let names_dictionary = {'JMB': 'Justine Bayanin', 'KUP': 'Kevin Padilla', 'RTR': 'Roland Ramilo',
        'KAM': 'Kalvin Morales', 'ROL': 'Ronniel Lambot', 'ARB': 'Arian Binadas', 'BLC': 'Benjie Cumbal',
        'DMP': 'Dave Perez', 'BCB': 'Bonifacio Baldo', 'JRE': 'Jose Elarco', 'JJC': 'Joseph Cajote'}
    let poic_list = ['JMB', 'KUP', 'RTR', 'KAM', 'ROL']
    let ase_list = ['ARB', 'BLC', 'DMP', 'BCB', 'JRE', 'JJC']

    for (const valueIndex in sheetData) {
        const value = sheetData[valueIndex];
        let poic = ''
        let ase  = ''

        try{
            let names_list = value[6].split(', ');

            for (let name of names_list) {
                let corrected_name = name;
                Object.keys(names_dictionary).forEach((key) => {
                    corrected_name = corrected_name.replaceAll(key, names_dictionary[key]);
                });

                if (poic_list.includes(name)) {
                    poic += `${corrected_name}, `
                    continue
                }
                if (ase_list.includes(name)){
                    ase += `${corrected_name}, `
                }
            }
        }
        catch(err){
            console.log(err)
            poic = value[6]
            ase = value[6]
        }

        let end_date = '';
        if(!(value[12] === undefined || value[12] === '' || value[12] === value[11])) {
            end_date = `- ${value[12]}`;
        }

        message +=
            `\n[${Number(valueIndex) + 1}]
Status :   ${value[0]}
Code   :   (${value[1]}) ${value[2]}
Name   :   ${value[3]}
Title  :   ${value[5]}
POIC   :   ${poic?.slice(0,-2)}
ASE    :   ${ase?.slice(0, -2)}
Date   :   ${value[11]} ${end_date}
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
