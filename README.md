# Shopgate Connect - Pages custom redirects

Add custom redirects to Engage App.

## Configuration

### redirects (Array)

Redirect entry (object):

- `pattern (string)`: Pattern of the route to apply redirects.
```
Examples: `/category/:categoryId`, `/item/:productId`, `/category`, `/cart`
```
- `ids (string[])` (optional): Array of Ids for the provided pattern. If omitted it's a wildcard for every Id.  
The parameters of these pattern(s) (ids) will be auto-decoded:
    - `/category/:categoryId`
    - `/item/:productId`
- `redirect (string)`: Pattern of the redirect route
- `target (string)`: Redirect target. Use `_blank` to open redirects with `openPageExtern` command (eg. whatsapp, facebook)

Example to redirect a sale category to CMS page and external FB messenger app
```json
{
   "redirects": [
      {
          "pattern": "/category/:categoryId",
          "ids": [
            "sale"
          ],
          "redirect": "/page/sale"
      },
      {
          "pattern": "/category/:categoryId",
          "ids": [
            "9"
          ],
          "redirect": "https://m.me/company?context=my%20space%20string",
          "target": "_blank"
      }
   ]
 }
```

## About Shopgate

Shopgate is the leading mobile commerce platform.

Shopgate offers everything online retailers need to be successful in mobile. Our leading
software-as-a-service (SaaS) enables online stores to easily create, maintain and optimize native
apps and mobile websites for the iPhone, iPad, Android smartphones and tablets.
