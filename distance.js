module.exports = (lat, long, done) => {
  let request = require('sync-request')
  let obj = {
    lat: 0,
    long: 0
  }
  let res = request('get', 'http://www.telenor.rs/tpanel/api/stores')
  let body = JSON.parse(res.getBody()).data
  body.reduce((acc, value) => {
    let distance = Math.sqrt(Math.pow((parseFloat(value.attributes.coordinate.latitude) - lat), 2) +
    Math.pow((parseFloat(value.attributes.coordinate.longitude) - long), 2))
    if (acc > distance) {
      obj.lat = value.attributes.coordinate.latitude
      obj.long = value.attributes.coordinate.longitude
      return distance
    }
    return acc
  }, Number.MAX_VALUE)
  return done(null, obj)
}
