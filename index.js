'use strict'

const express = require('express')
const request = require('request')
const bodyParser = require('body-parser')
const app = express()
const distance = require('./distance')

const TOKEN = process.env.FB_PAGE_ACCESS_TOKEN
const PORT = process.env.PORT || 5000

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.send('Hello, I am chat bot')
})

app.get('/webhook/', (req, res) => {
  if (req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
    res.send(req.query['hub.challenge'])
  }
  res.send('Error, wrong token')
})

app.post('/webhook/', (req, res) => {
  let messaging_events = req.body.entry[0].messaging
  for (let i = 0; i < messaging_events.length; i++) {
    let event = req.body.entry[0].messaging[i]
    let sender = event.sender.id
        /* setTimeout(function(){
                console.log("typing...");
        },5000); */
    if (event.message && event.message.attachments) {
      if (event.message.attachments[0].type === 'location') {
        let lat = event.message.attachments[0].payload.coordinates.lat
        let long = event.message.attachments[0].payload.coordinates.long
        distance(lat, long, (err, res) => {
          sendMessage(sender, res)
        })
      } else {
        sendMessage(sender, 'Posaljite svoju lokaciju')
      }
    } else if (event.message.text) {
      // let text = event.message.text
      sendMessage(sender, 'Posaljite svoju lokaciju')
    }
  }
  res.sendStatus(200)
})

function sendMessage (sender, msg) {
  let messageData
  if (msg.lat && msg.long) {
    messageData = {
      'attachment': {
        'type': 'template',
        'payload': {
          'template_type': 'generic',
          'elements': {
            'element': {
              'title': 'Najbliza Telenor prodavnica',
              'image_url': 'https://maps.googleapis.com/maps/api/staticmap?size=764x400&center=' + msg.lat + ',' + msg.long + '&zoom=17&markers=' + msg.lat + ',' + msg.long,
              'item_url': 'http://maps.apple.com/maps?q=' + msg.lat + ',' + msg.long + '&z=16'
            }
          }
        }
      }
    }
  } else {
    messageData = {text: msg}
  }
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token: TOKEN},
    method: 'POST',
    json: {
      recipient: {id: sender},
      message: messageData
    }
  }, (error, response, body) => {
    if (error) {
      console.log('Error sending messages: ', error)
    } else if (response.body.error) {
      console.log('Error: ', response.body.error)
    }
  })
}

app.listen(PORT, () => {
  console.log(`running on port ${PORT}`)
})
