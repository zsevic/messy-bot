module.exports=function(lat,long,done){
	var request=require("sync-request");
	var obj={
		lat:0,
		long:0
	};
	var res=request('get','http://www.telenor.rs/tpanel/api/stores');
	var body=JSON.parse(res.getBody()).data;
	body.reduce(function(acc,value){
		var distance=Math.sqrt(Math.pow((parseFloat(value.attributes.coordinate.latitude)-lat),2)
				+Math.pow((parseFloat(value.attributes.coordinate.longitude)-long),2));
		if(acc > distance){
			obj.lat=value.attributes.coordinate.latitude;
			obj.long=value.attributes.coordinate.longitude;
			return distance;
		}
		return acc;
	},Number.MAX_VALUE);
	return done(null,obj);
};
