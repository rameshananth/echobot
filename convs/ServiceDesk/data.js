var gjGetIncident={
	name:"MSBotFramework:/CheckPrereqs",
	parameters:{
		check:{
			name:"MSBotFramework:/GetText",
			parameters:{message:"Please describe your problem"}
		},
		success:{
			name:"",
			parameters:{message:null}
		},
		failure:{
			name:"",
			parameters:{message:null}
		}
	}
};


var gjNewTicketConv={
	name:"MSBotFramework:/CheckPrereqs",
	parameters:{
		check:{
			name:"MSBotFramework:/GetConfirm",
			parameters:{
				message:"Umm.. You don't seem to have any tickets. Do you want to open a new one?"
			}
		},
		success:{
			name:gjGetIncident.name,
			parameters:gjGetIncident.parameters
		},
		failure:{
			name:"",
			parameters:{message:null}
		}
	}		
};

var gjGetAndDisplayOneTicket={
	name:"MSBotFramework:/CheckPrereqs",
	parameters:{
		check:{
			name:"ServiceNow:/GetTicket",
			parameters:{
				message:null,
				persistResponse:true,
				persistVariable:'Tickets'
			}
		},
		success:{
			name:"ServiceNow:/MakeIncidents",
			parameters:{message:null}
		},
		failure:{
			name:gjNewTicketConv.name,
			parameters:gjNewTicketConv.parameters
		}
	}
};

var gjGetAndDisplayAllTickets={
	name:"MSBotFramework:/CheckPrereqs",
	parameters:{
		check:{
			name:"ServiceNow:/GetTickets",
			parameters:{
				message:null,
				persistResponse:true,
				persistVariable:'Tickets'
			}
		},
		success:{
			name:"ServiceNow:/MakeIncidents",
			parameters:{message:null}
		},
		failure:{
			name:gjNewTicketConv.name,
			parameters:gjNewTicketConv.parameters
		}
	}
};

var gjPromptUserForTicketNumber={
name:"MSBotFramework:/CheckPrereqs",
parameters:{
	check:{ 
		name: "MSBotFramework:/GetConfirm",
	        parameters:{ message:
			    "Do you have the ticket number handy? It should start with a INC, SRQ or CHG and be followed by a 7 digit number"
			   }
	      },
	 success:{
		 name: "MSBotFramework:/CheckPrereqs",
		 parameters:{
		 		check:{ name:"MSBotFramework:/GetText",
			 		parameters:{ 
				 		message:"Great. Can you enter the ticket number?",
						persistResponse:true,
				 		persistVariable:'Ticket'
			 		}
		 		},
		 		success:{
			 		name:gjGetAndDisplayOneTicket.name,
			 		parameters:gjGetAndDisplayOneTicket.parameters
	 	 		},
		 		failure:{
		 			name:"",
		 			parameters:{message:null}
		 		}
		 }
	},
	failure:{
		name:gjGetAndDisplayAllTickets.name,
		parameters:gjGetAndDisplayAllTickets.parameters
	}
}
};

var gjGetTicketStatusConv={
	name:"MSBotFramework:/CheckPrereqs",
	parameters:{
		check:{
			name:"MSBotFramework:/GetEntity",
			parameters:{
				persistResponse:true,
				persistVariable:'Ticket'
			}
		},
		success:{
			name:gjGetAndDisplayOneTicket.name,
			parameters:gjGetAndDisplayOneTicket.parameters
		},
		failure:{
			name:gjPromptUserForTicketNumber.name,
			parameters:gjPromptUserForTicketNumber.parameters
		}
	}
};

var _mapping={
	name:'ServiceDesk',
	maps:[
		{intentName: 'ServiceDesk.Update',
		 dialogName: '/GetUpdate',
		 entryPoint:gjGetTicketStatusConv
		}
	]
};

module.exports._mapping=function(){
	return _mapping;
}
