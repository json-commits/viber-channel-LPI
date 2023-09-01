const {google} = require('googleapis');
const spreadsheetId = '1YTdM2i0pd6Nc5SGtVwcm3Q-HXgZXn6cvliMT-fVedjU';
const serviceAccountFile = './service-account.json';

const auth = new google.auth.GoogleAuth({
    keyFile: serviceAccountFile,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});


// const authClient = await authJWT.authorize();
// console.log("Authorized!");

let sheetsAPI;
async function authorize() {
    const authClient = await auth.getClient();
    console.log("Authorized!");
    sheetsAPI = google.sheets({version: 'v4', auth: authClient, });
}

async function getRangeData(range) {
    return await sheetsAPI.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: range,
    });
}

async function setRangeData(range, values) {
    return await sheetsAPI.spreadsheets.values.update({
        spreadsheetId: spreadsheetId,
        range: range,
        valueInputOption: 'USER_ENTERED',
        resource: { values: [values] },
    });
}

async function appendRangeData(range, values) {
    return await sheetsAPI.spreadsheets.values.append({
        spreadsheetId: spreadsheetId,
        range: range,
        valueInputOption: "USER_ENTERED",
        resource: {values: [values]},
    });
}

module.exports = {
    authorize, getRangeData, setRangeData, appendRangeData,
}