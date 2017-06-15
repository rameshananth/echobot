var restify = require('restify');
var builder = require('botbuilder');
var serviceNow = require("service-now");

debug=1;
// Get secrets from server environment
var botConnectorOptions = { 
    appId: process.env.BOTFRAMEWORK_APPID, 
    appPassword: process.env.BOTFRAMEWORK_APPSECRET
};

// Create bot
var sGreeting="Hi this is crashcart! How can I help you? You can type out your problem (I cannot print a file) or ask for an update on an existing ticket (what's the status of IN2030?) and I will respond";
var connector = new builder.ChatConnector(botConnectorOptions);
var bot = new builder.UniversalBot(connector,function(session){
						session.send("Hi");
					     }
);
var luisModel = process.env.LUIS_ENDPOINT;
bot.recognizer(new builder.LuisRecognizer(luisModel));

//If you have an Update request
bot.dialog('ServiceDesk.Update',[
	function(session,args,next){
		if(debug==1){session.send("Debug:In ServiceDesk.Update dialog");}
		var ticket=builder.EntityRecognizer.findEntity(args.intent.entities, 'ServiceDesk.TicketType');
		if(ticket){
			session.send("Finding the status of ticket :"+ticket.entity);
		}
		else{
			next();
						
		}
		//session.send(luisModel);
		//var intent = args.intent;
		//session.send("Identified a request for an update for an incident"+args.intent);
	},
	function(session,results,next){
		session.dialogData.TicketNumberAvailable=false;
		session.beginDialog('ServiceDesk.Update/GetTicketNumber');
		//session.send("Finding the status of the ticket :"+session.dialogData.TicketNumber);

	},
	function(session,results){
		console.log("TicketNumber:"+typeof(results.response.TicketNumber)+":tickets:"+results.response.Tickets);
		if(typeof results.response.TicketNumber==="undefined"){
			session.send("Here are your tickets and ticket status"+results.response.Tickets);
		}
		else{
			session.send("Finding the status of the ticket :"+results.response.TicketNumber);
		
		}
	}
]).triggerAction({matches: 'ServiceDesk.Update'})
;

bot.dialog('ServiceDesk.Update/GetTicketNumber',[
	function(session,args,next){
		builder.Prompts.confirm(session,"Do you have the ticket number handy?");		
	},
	function(session,results,next){
		if(debug==1){
			console.log(results.response+":"+typeof(results.response));
		}
		if(results.response==true){
		   session.dialogData.ticketNumberAvailable=true;
		   builder.Prompts.text(session,"Great. Can you enter the ticket number? It should start with a INC, SRQ or CHG and a 7 digit number");
		}
		else{
		   session.dialogData.ticketNumberAvailable=false;
		   session.send("Getting your tickets off the service portal");
		   session.sendTyping();
		   session.beginDialog('ServiceDesk.Update/GetTickets');
		   //getTickets(session);
		   /*
		   if(debug==1){console.log("Return value:"+session.userData.Tickets);}
		   setTimeout(function(){},5000);
		   */
		   //next();
		}
	},
	function(session,results){
		if(session.dialogData.ticketNumberAvailable==true){
			if(debug==1){
				console.log("The ticket number is:"+results.response+":"+session.userData.Tickets);
				session.send("The ticket number is:"+results.response);
			}
			session.userData.TicketNumber=results.response;
			//session.dialogData.TicketNumberAvailable=true;
		}
		else{
			session.userData.Tickets=results.response.tickets;
			
		}
		session.endDialogWithResult({response:session.userData});

	}
		
]);
/*
bot.dialog('/proactive',function(session,args,next){
	session.send("Ola!");
	session.endDialog();
}
);
*/



bot.dialog('ServiceDesk.Greet',[
function(session,args,next){
	if(debug==1){session.send("Debug:In the ServiceDesk.Greet dialog");}
	session.endDialog(sGreeting);
	//session.send("OK. Calling the service desk...");
	//startProactiveDialog(endUser);
}
]).triggerAction({matches:'ServiceDesk.Greet'});

bot.dialog('ServiceDesk.Update/GetTickets',[
	function(session,args,next){
		if(debug==1){
		console.log("In the getTickets function");
		console.log(session.message.address);
		//session.send("In the getTickets function");
	}
	var uName=session.message.address.user.name;
	var Snow=new serviceNow('https://wiprodemo4.service-now.com/','admin','LWP@2015');
	var tickets;
	Snow.getRecords(
		{table:'incident',query:{'caller_id.user_name':'Abel.Tuter'}},
		(err,data)=>{
 			tickets=data;
			session.endDialogWithResult({response:tickets});
		}
	);
	}

]);
/*
function startProactiveDialog(address){
	bot.beginDialog(address,'*:/proactive');
}
*/


function getTickets(session){
	if(debug==1){
		console.log("In the getTickets function");
		console.log(session.message.address);
		//session.send("In the getTickets function");
	}
	var uName=session.message.address.user.name;
	var Snow=new serviceNow('https://wiprodemo4.service-now.com/','admin','LWP@2015');
	var tickets;
	Snow.getRecords(
		{table:'incident',query:{'caller_id.user_name':'Abel.Tuter'}},
		(err,data)=>{
 			tickets=data;
			console.log("The returned data is:"+data+":"+tickets);
		}
	);
	setTimeout(function(){},5000);
	return tickets;
	//mock getTickets function
	//return [1,2,3];
	//return tickets;
}
// Setup Restify Server
var server = restify.createServer();

// Handle Bot Framework messages
server.post('/api/messages', connector.listen());

// Serve a static web page
server.get(/.*/, restify.serveStatic({
	'directory': '.',
	'default': 'index.html'
}));

server.get('/api/CustomWebApi', function (req, res, next) {
  //startProactiveDialog(endUser);
  res.send('triggered');
  next();
});

server.listen(process.env.port || 3978, function () {
    console.log('%s listening to %s', server.name, server.url); 
});
