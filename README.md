# Linux Trend API

Get JSON data from DistroWatch Page Hit.

## Try it Run

this code here, in a console or from any site

```js
fetch("https://linux-trend.vercel.app/api/last1months")
  .then((response) => response.json())
  .then((json) => console.log(json))
```

## Resources

Following resources are available which you can access via our REST API.

- [Last 12 Months](https://linux-trend.vercel.app/api/last12months)
- [Last 6 Months](https://linux-trend.vercel.app/api/last6months)
- [Last 3 Months](https://linux-trend.vercel.app/api/last3months)
- [Last 1 Months](https://linux-trend.vercel.app/api/last1months)

## License