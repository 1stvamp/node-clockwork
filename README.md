node-clockwork
==============

Install
---
```bash
npm install clockwork
```

Usage
---
```js
ClockworkApi = require('clockwork').ClockworkApi;

client = ClockworkApi({key: 'YOUR_API_KEY_HERE'}); // Alternatively you can use username and password

client.getCredit(function(error, credit) {
    console.log(credit);
});

client.sendSms({ To: '44743743445335', Content: 'Test!'}, function(error, resp) {
    console.log(resp);
});
```
