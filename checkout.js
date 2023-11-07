function checkAdsBlocker() {
  return new Promise((resolve, reject) => {
    const URL =
      "https://pulsetrackingdev.com/cdn/shopifycloud/boomerang/shopify-boomerang-1.0.0.min.js";
    fetch(URL)
      .then(function (response) {
        resolve(true);
      })
      .catch((error) => {
        resolve(false);
      });
  });
}

async function getCookie() {
  const canRunAds = await checkAdsBlocker();
  const cookies = await window.cookieStore.getAll();
  let attributes = {};
  let orderNotes = "";

  const shopifyId1 = cookies.find((cookie) => cookie.name == "_shopify_y");
  const shopifyId2 = cookies.find((cookie) => cookie.name == "_y");

  attributes["_track_user_shopify_id_1"] = shopifyId1.value;
  attributes["_track_user_shopify_id_2"] = shopifyId2.value;

  orderNotes += `_track_user_shopify_id_1: ${shopifyId1.value}`;
  orderNotes += `_tracking_user_shopify_id_2: ${shopifyId2.value}`;

  if (canRunAds) {
    const _gaCookie = cookies.find((cookie) => cookie.name == "_ga");
    const clientId = _gaCookie.value.split(".1.")[1];

    cookies
      .filter((cookie) => cookie.name.includes("_ga_"))
      .forEach((cookie) => {
        const session = cookie.value.split(".")[2];

        attributes[`_track${cookie.name}`] = cookie.value;
        attributes[`_track${cookie.name}_session`] = session;
        attributes[`_track${cookie.name}_clientID`] = clientId;

        orderNotes += `
          _track${cookie.name}: ${cookie.value}
          _track${cookie.name}_session: ${session}
          _track${cookie.name}_clientID: ${clientId}
        `;
      });
  } else {
    attributes["_track_ga_"] = "no_information_received";
    orderNotes += `_track_ga_: no_information_received`;
  }

  console.log(orderNotes);
  const orderId = '{{checkout.order_id}}';
  fetch("https://update-order-note-api.onrender.com/update_order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
   },
   body: JSON.stringify({ orderId: orderId, note: orderNotes, attributes: attributes })
  }).then(function() {
   console.log("order note updated");
  }).catch(function(err) {
    console.log(err)
  })
}

getCookie();