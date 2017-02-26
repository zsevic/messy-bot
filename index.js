"use strict";

var express=require("express");
var request=require("request");
var bodyParser=require("body-parser");

var app=express();

var distance=require("./distance");

var token=process.env.FB_PAGE_ACCESS_TOKEN;

app.set("port",(process.env.PORT||5000));

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.get("/",function(res,req){
	res.send("Hello, I am chat bot");
});

app.post('/webhook/',function(req,res){
    var messaging_events = req.body.entry[0].messaging;
    for (var i=0;i<messaging_events.length; i++) {
        var event=req.body.entry[0].messaging[i];
        var sender=event.sender.id;
        setTimeout(function(){
                console.log("typing...");
        },5000);
	if(event.message && event.message.attachments[0].type==="location"){
			var lat=event.message.attachments[0].payload.coordinates.lat;
			var long=event.message.attachments[0].payload.coordinates.long;
			distance(lat,long,function(err,res){
                sendLocation(sender, res);
			});
        }
    }
    res.sendStatus(200);
});

function sendLocation(sender, loc) {
    var messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": {
                    "element": {
                        "title": "Najbliza Telenor prodavnica",
                        "image_url": "https:\/\/maps.googleapis.com\/maps\/api\/staticmap?size=764x400&center="+loc.lat+","+loc.long+"&zoom=17&markers="+loc.lat+","+loc.long,
                        "item_url":"http:\/\/maps.apple.com\/maps?q="+loc.lat+","+loc.long+"&z=16"
                    }
                }
            }
        }
    };
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData
        }
    },function(error,response,body) {
        if (error){
            console.log('Error sending messages: ',error);
        } else if (response.body.error) {
            console.log('Error: ',response.body.error);
        }
    });
}

app.listen(app.get("port"),function(){
	console.log("running on port",app.get("port"));
});
