const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser')
const cors = require('cors')

app.use(bodyParser.json())
app.use(cors())

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post("/update_order", (req, res) => {
  const { orderId, note, attributes } = req.body;
  console.log(req.body)
  
  const noteAttributes = [];
  Object.keys(attributes).forEach(attr => {
    noteAttributes.push({
      name: attr,
      value: attributes[attr]
    })
  })

  fetch(`https://8cf85f.myshopify.com/admin/api/2023-10/orders/${orderId}.json`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": "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"
    },
    body: JSON.stringify({ order: { id: orderId, note: note, note_attributes: noteAttributes } })
  }).then(function (response) {
    res.send("updated!")
  }).catch(function (err) {
    res.send("error")
  })

})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})