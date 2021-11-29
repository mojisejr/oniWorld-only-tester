import { GoogleSpreadsheet } from "google-spreadsheet";
const creds = require("../../oniworld.json");

async function GoogleSheetInit() {
  try {
    const doc = new GoogleSpreadsheet(process.env.SHEET_ID);
    await doc.useServiceAccountAuth(creds);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];

    return sheet;
  } catch (e) {
    return null;
  }
}

async function saveReferral(sheet, req) {
  const { minter, tokenOwner, tokenId, score } = req.body;
  await sheet.addRow({
    time: new Date(Date.now()).toLocaleString(),
    tokenOwner,
    minter,
    tokenId,
    score,
  });
}

// async function getAllMinter(sheet) {
//   const minters = await sheet.getRows();
//   return minters;
// }

export default async function handler(req, res) {
  const sheet = await GoogleSheetInit();
  if (req.method === "POST") {
    try {
      await saveReferral(sheet, req);
      res.status(201).json({
        time: Date.now(),
        result: true,
      });
    } catch (e) {
      console.log(e);
      res.status(400).json({
        message: e.message,
        result: false,
      });
    }
  }

  // if (req.method === "GET") {
  //   try {
  //     const minters = await getAllMinter(sheet);
  //     console.log(minters);
  //     if (minters.length > 0) {
  //       res.status(200).json({
  //         data: minters,
  //         result: true,
  //       });
  //     } else {
  //       res.status(400).json({
  //         result: false,
  //       });
  //     }
  //   } catch (e) {
  //     console.log(e);
  //     res.status(400).json({
  //       message: e.message,
  //       result: false,
  //     });
  //   }
  // }
}
