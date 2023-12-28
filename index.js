const express = require("express");
const app = express();
const port = 3000;
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

app.use(bodyParser.json());
app.use(cors());

app.post("/update_order", (req, res) => {
  const { orderId, note, attributes } = req.body;
  const noteAttributes = [];
  Object.keys(attributes).forEach((attr) => {
    noteAttributes.push({
      name: attr,
      value: attributes[attr],
    });
  });

  axios
    .put(
      `https://8cf85f.myshopify.com/admin/api/2023-10/orders/${orderId}.json`,
      JSON.stringify({
        order: { id: orderId, note: note, note_attributes: noteAttributes },
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": "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",
        },
      }
    )
    .then(function (response) {
      res.send("updated!");
    })
    .catch(function (err) {
      res.send(err);
    });
});

app.post("/update", (req, res) => {
  const { payload } = req.body;

  const mesurementID = "G-TSLJKQSFB3";
  const apiSecretKey = "rRCZXTRsTQKFx-fvygSD3w";

  axios
    .post(
      `https://www.google-analytics.com/mp/collect?measurement_id=${mesurementID}&api_secret=${apiSecretKey}`,
      JSON.stringify(payload)
    )
    .then(function (response) {
      console.log(response.statusCode);
      res.send("updated!");
    })
    .catch(function (err) {
      res.send("error");
    });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
