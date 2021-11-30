const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const csvWriter = createCsvWriter({
  path: "./score.csv",
  header: [
    { id: "time", title: "TIME" },
    { id: "minter", title: "MINTER" },
    { id: "tokenOwner", title: "TOKEN_OWNER" },
    { id: "TokenId", title: "TOKEN_ID" },
  ],
});

async function saveScore(req) {
  const data = [
    {
      time: new Date(Date.now).toLocaleString(),
      minter: req.body.minter,
      tokenOwner: req.body.tokenOwner,
      tokenId: req.body.tokenId,
    },
  ];
  try {
    await csvWriter.writeRecords(data);
    return true;
  } catch (e) {
    return false;
  }
}

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const result = await saveScore(req);
      if (result === true) {
        res.status(201).json({
          time: Date.now(),
          result: true,
        });
      } else {
        res.status(400).json({
          message: "Error Cannot Save Score.",
          result: false,
        });
      }
    } catch (e) {
      console.log(e);
      res.status(400).json({
        message: e.message,
        result: false,
      });
    }
  }
}
