<!-- Google tag (gtag.js) -->
<script
  async
  src="https://www.googletagmanager.com/gtag/js?id=G-TSLJKQSFB3"
></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  gtag("js", new Date());

  gtag("config", "G-TSLJKQSFB3");
</script>

<script>
  function main() {
    let attributes = {};

    const docCookies = document.cookie;
    if (docCookies === "") {
      console.log("No cookies found.");
      return;
    }

    const cookies = docCookies.split("; ").map((cookie) => {
      return {
        name: decodeURIComponent(cookie.split("=")[0]),
        value: decodeURIComponent(cookie.split("=")[1]),
      };
    });

    const shopifyId1 = cookies.find((cookie) => cookie.name == "_shopify_y");

    attributes["_track_user_shopify_id_1"] = shopifyId1.value;

    randomValue = '';
    randomValue += Math.floor(Date.now() / 1000 - 60);

    const _gaCookie = cookies.find((cookie) => cookie.name == "_ga");
    let clientId = shopifyId1.value;
    let sessionId = randomValue;
    if (_gaCookie) {
      clientId = _gaCookie.value.split(".1.")[1];
      cookies
        .filter((cookie) => cookie.name.includes("_ga_"))
        .forEach((cookie) => {
          const session = cookie.value.split(".")[2];
          if (cookie.name.includes("TSLJKQSFB3")) sessionId = session;

          attributes[`_track${cookie.name}`] = cookie.value;
          attributes[`_track${cookie.name}_session`] = session;
          attributes[`_track${cookie.name}_clientID`] = clientId;
        });
    } else {
      attributes["_track_ga_"] = "no_information_received";
    }

    const orderId = "{{checkout.order_id}}";
    fetch("https://shopify-to-ga4.onrender.com/update_order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderId: orderId,
        note: "",
        attributes: attributes,
      }),
    })
      .then(function () {
        console.log("order note updated");
      })
      .catch(function (err) {
        console.log(err);
      });

    // Update GA
    {% liquid
      assign order_type = 'One-time Purchase'
      assign hasSubscribeProduct = false
      assign hasOneTimeProduct = false

      for line_item in checkout.line_items
        if line_item.selling_plan_allocation
          assign hasSubscribeProduct = true
        else
          assign hasOneTimeProduct = true
        endif
      endfor

      if hasSubscribeProduct and hasOneTimeProduct
        assign order_type = 'One-time Purchase/Subscribe'
      elsif hasSubscribeProduct
        assign order_type = 'Subscribe'
      endif
    %}

    let items = [];
    {% for line_item in checkout.line_items %}
      console.log({{ checkout.discount_applications[0] | json }});
      items.push({
        'item_list_id': '{{ 'Checkout_thank_you'  | append:  '_' | append: forloop.index  }}',
        'item_list_name': 'Checkout_thank_you',
        {%- if line_item.selected_or_first_available_variant.id != blank -%}
        'item_id': '{{ line_item.selected_or_first_available_variant.id }}',
        {%- else -%}
        'item_id': '{{ line_item.id }}',
        {%- endif -%}
        'item_name': `{{- line_item.product.title | replace: "'", '' | escape -}}`,
        'affiliation': 'Pulse Tracking Dev',
        {%- if checkout.discount_applications[0].title -%}
        'coupon': '{{ checkout.discount_applications[0].title }}',
        {%- else -%}
        'coupon': "null",
        {%- endif -%}
        'currency': '{{ checkout.currency }}',
        'index': {{ forloop.index }},
        'item_brand': 'Pulse Tracking Dev',
        {% if line_item.product_type != blank %}
        'item_category': '{{- line_item.product_type | downcase -}}',
        {% elsif line_item.type != blank %}
        'item_category': '{{- line_item.type | downcase -}}',
        {% elsif line_item.product.type != blank %}
        'item_category': '{{- line_item.product.type | downcase -}}',
        {% else %}
        'item_category': 'null',
        {% endif %}
        'item_category2':'null',
        'item_category3':'null',
        'item_category4':'null',
        'price': {{- line_item.price | divided_by: 100.0 -}},
        {% if line_item.selected_or_first_available_variant.title != blank %}
        'item_variant': '{{ line_item.selected_or_first_available_variant.title | replace: "'", '' | escape }}',
        {% elsif _product.variant_title != blank %}
        'item_variant': '{{ line_item.variant_title | replace: "'", '' | escape }}',
        {% elsif line_item.product.selected_or_first_available_variant.title != blank %}
        'item_variant': '{{- line_item.product.selected_or_first_available_variant.title | replace: "'", '' | escape -}}',
        {% elsif line_item.title != blank %}
        'item_variant': '{{ line_item.title | replace: "'", '' | escape }}',
        {% elsif line_item.product.title != blank %}
        'item_variant': '{{- line_item.product.title | replace: "'", '' | escape -}}',
        {% else %}
        'item_variant': "null",
        {% endif %}
        'quantity': {{ line_item.quantity }},
      });
    {% endfor %}

    let user_id = "undefined";
    {%- if customer -%}
      user_id = '{{ customer.id }}';
    {%- endif -%}

    const payload = {
      client_id: clientId,
      timestamp_micros: Math.floor(Date.now() * 1000),
      user_id: user_id,
      non_personalized_ads: false,
      events: [
        {
          name: "purchase",
          params: {
            session_id: sessionId,
            debug_mode: 1,
            currency: '{{ checkout.currency }}',
            {%- if checkout.discount_applications[0].title -%}
            coupon: '{{ checkout.discount_applications[0].title }}',
            {%- else -%}
            coupon: "null",
            {%- endif -%}
            value: {{ checkout.total_price | money_without_currency | remove: ".00" | remove: "," }},
            tax: {{ checkout.tax_price | money_without_currency | remove: ".00" | remove: "," }},
            shipping_tier: '{{ checkout.shipping_method.title }}',
            shipping: {{ checkout.shipping_price | money_without_currency | remove: ".00" | remove: "," }},
            payment_type: '{{ checkout.transactions[0].gateway_display_name }}',
            transaction_id: '{{ checkout.order_name }}',
            order_id: '{{checkout.order_id}}',
            order_type: '{{ order_type }}',
            items: items
          }
        }
      ]
    }

    fetch("https://shopify-to-ga4.onrender.com/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({payload})
    }).then(function (response) {
      console.log(response)
    }).catch(function (err) {
      console.log(err)
    })

    // gtag("event", "purchase_2", payload.events[0].params);
  }

  if (!sessionStorage.getItem('transaction_id') || sessionStorage.getItem('transaction_id') != '{{ checkout.order_name }}') {
    main();
    sessionStorage.setItem('transaction_id', '{{ checkout.order_name }}');
  }
</script>

{%- if customer -%}
<script>
  console.log({{ customer.default_address | json}})
  console.log(window.dataLayer)
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    'event': 'user_id',
    'user_id': '{{ customer.id }}',
    'user_type': 'registered',
    'user_phonenumber' : '{{ customer.phone }}',
    'user_email' : '{{ customer.email }}',
    'user_firstname' : '{{ customer.first_name }}',
    'user_countrycode' : '{{ customer.default_address.country_code }}',
    'new_customer' : {% if customer.orders_count > 1 %}'No'{% else %} 'Yes' {% endif %},
    'user_postcode' : '{{ customer.default_address.zip }}',
    'total_order_count' : {{customer.orders_count}}
  });
</script>
{%- else -%}
<script>
  console.log({{ customer.default_address | json}})
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    'event': 'user_id',
    'user_id': null,
    'client_id': window.ShopifyAnalytics.lib.trekkie.defaultAttributes.uniqToken,
    'user_type': 'guest',
    'user_phonenumber' : null,
    'user_email' : null,
    'user_firstname' : null,
    'user_countrycode' : null,
    'new_customer' : 'No',
    'user_postcode' : null,
    'total_order_count' : null
  });
</script>
{%- endif -%}
<!-- Google Tag Manager -->

<!-- START DATALAYER PUSH FOR CHECKOUT CONV -->
<script>
  // data layers events
  window.addEventListener('DOMContentLoaded', function() {
    // Add content
    if (Shopify.Checkout) {
      var litems = [];
      {% for line_item in checkout.line_items %}
        litems.push({
          item_list_id: '{{ line_item.sku }}',
          item_list_name: '{{ line_item.product.title }}',
          item_id: '{{ line_item.product_id }}',
          item_name: '{{ line_item.product.title }}',
          affiliation: 'Pulse Tracking Dev',
          coupon: null,
          discount: {{ line_item.line_level_total_discount | money_without_currency | remove: ".00" | remove: "," }},
          index: {{ forloop.index }},
          item_brand: 'Pulse Tracking Dev',
          item_category: '{{ line_item.product.type }}',
          item_category2: '{{ line_item.selling_plan_allocation.selling_plan.name }}',
          item_category3: null,
          item_category4: null,
          item_variant: '{{ line_item.variant_title }}',
          price: {{ line_item.final_price | money_without_currency | remove: ".00" | remove: "," }},
          quantity: {{ line_item.quantity }},
        });
      {% endfor %}

      var ShopifyCheckoutstep = Shopify.Checkout.step;

      switch (ShopifyCheckoutstep) {
        case 'thank_you':
        dataLayer.push({ ecommerce: null });
        dataLayer.push({
          'event': 'saras_ga4_add_payment_info',
          'ecommerce': {
            'currency': 'USD',
            'coupon': '{% if checkout.discount_applications[0].title %}{{ checkout.discount_applications[0].title }}{% else %}null{% endif checkout.discount_applications[0].title %}',
            'shipping': {{ checkout.shipping_price | money_without_currency | remove: ".00" | remove: "," }},
            'shipping_tier': '{{ checkout.shipping_method.title }}',
            'payment_type': '{{ checkout.transactions[0].gateway_display_name }}',
            'value': {{ checkout.total_price | money_without_currency | remove: ".00" | remove: "," }},
            'items': litems
          }
        });

        // Step 4/5: Thank You
        dataLayer.push({
          'event': 'saras_ga4_purchase',
          'ecommerce': {
            'currency': 'USD',
            'coupon': '{% if checkout.discount_applications[0].title %}{{ checkout.discount_applications[0].title }}{% else %}null{% endif checkout.discount_applications[0].title %}',
            'shipping': {{ checkout.shipping_price | money_without_currency | remove: ".00" | remove: "," }},
            'shipping_tier': '{{ checkout.shipping_method.title }}',
            'payment_type': '{{ checkout.transactions[0].gateway_display_name }}',
            'value': {{ checkout.total_price | money_without_currency | remove: ".00" | remove: "," }},
            'tax': {{ checkout.tax_price | money_without_currency | remove: ".00" | remove: "," }},
            'transaction_id': '{{ checkout.order_name }}',
            'order_id': '{{checkout.order_id}}',
            'order_number': "{{ checkout.order_number }}",
            'items': litems
          }
        });
        break;
      }
    }
  });
</script>
