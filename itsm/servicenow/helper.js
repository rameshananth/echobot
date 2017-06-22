var builder=require('botbuilder');
var serviceNow = require("service-now");

var lib=new builder.Library('ServiceNow');
lib.dialog('/GetTickets',[
	function(session,args,next){
		console.log("In the ServiceNow:/GetTickets function");
		var uName=session.message.address.user.name;
		var Snow=new serviceNow('https://wiprodemo4.service-now.com/','admin','LWP@2015');
		var tickets;
		var arName=session.message.address.user.name.split(' ');
		Snow.getRecords(
			{table:'incident',query:{'caller_id.first_name':'Abel',
					 'caller_id.last_name':'Tuter'
					}
			},
			function (err,data){
 				tickets=data;
				session.endDialogWithResult({'Tickets':tickets});
			}
		);
	}
]);

lib.dialog('/GetTicket',[
		function(session,args,next){
			console.log("In the ServiceNow:/GetTicket function");
			var uName=session.message.address.user.name;
			var Snow=new serviceNow('https://wiprodemo4.service-now.com/','admin','LWP@2015');
			var tickets;
			var arName=session.message.address.user.name.split(' ');
			Snow.getRecords(
			{table:'incident',query:{'number':args.ticket_number}},
			function (err,data){
 				tickets=data;
				session.endDialogWithResult({'Tickets':tickets});
			}
		);
	}




]);

module.exports.createLibrary = function () {
    return lib.clone();
};