// Initialize a default application state.
var state = newDefaultState();

$( document ).ready(function() {
	processURLChange();
	calculateAndShowCost();
   $(window).on("onpopstate", processURLChange);
   $( ":input" ).on("keyup change", processDOMValueChange);
   $("#shareEstimate").click(function(){
   	this.select();
   });
   $(".expand-next").click(function() {
   	$(this).next().slideToggle("fast");
   	return false;
   });
});
  
 // file:///Users/ezra/dev/meeting-cost/site/public/index.html?people=1&length=4&frequency=daily&daysPTO=12&daysHoliday=10&salary=100000
function processURLChange() {
	var uri = new URI;
	queryParameters = uri.search(true);
	$.each(queryParameters, function(key, value) {
		if (state[key] != null) {
			state[key] = value;
		}
	});
	setDOMValues(state);
}

function newDefaultState(){
	var defaultState = {
		people: 5,
		length: 1,
		frequency: 'once',	
		daysPTO: 15,
		daysHoliday: 10,
		salary: 80000,
	};
	return defaultState;
}

function processDOMValueChange() {

	if (this.type == 'radio' && this.checked) {
		state.frequency = this.id;
	}
	else if (this.id == 'shareEstimate') {
		return;
	}
	else {
		state[this.id] = this.value;
	}
	// Update URL parameters so that the user can share the current state.
	var uri = new URI;
	history.pushState(null, null, uri.setSearch(state));
	calculateAndShowCost();
}


function setDOMValues(newState) {
	$.each(newState, function(key, value) {
		if (key == 'frequency') {
			$("#" + value).prop("checked", 'checked');
		}
		else {
			$("#" + key).val(value);
		}
  });
}

function calculateAndShowCost() {
	var costInHours = state.people * state.length * meetingOccurences();
	var costInMoney = costInHours * hourlyCost();
	var shareEstimateText = '';
	$("#hourlyCost").val(hourlyCost());
	$("#fullyLoadedCost").val(fullyLoadedCost());
	$("#daysWork").val(numberOfWorkDays());

	$( "#costInMoney" ).numerator({'toValue': costInMoney, 'delimiter': ','});
	$( "#costInHours" ).numerator({'toValue': costInHours, 'delimiter': ','});
	$( "#perUnitLabel" ).text(perUnitLabel());

	shareEstimateText = "This meeting costs $" + Math.round(costInMoney) + " and " + costInHours + " hours in opportunity cost. " + window.location.href;
	$( "#shareEstimate ").val(shareEstimateText);
}

function perUnitLabel() {
  if (state.frequency == "once") {
  	return "";
  }
  return "per year"
}

function meetingOccurences() {
	// TODO: This should read from state, not from the DOM.
	switch (state.frequency) {
		case "once":
			return 1;
		case "monthly":
			return 12;
		case "weekly":
			return numberOfWorkWeeks().toFixed(0);
		case "daily":
			return numberOfWorkDays().toFixed(0);
	}
}

function numberOfWorkDays() {
	// 260 = 52 weeks * 5 work days.
	return 260 - state.daysPTO - state.daysHoliday;
}

function numberOfWorkWeeks() {
	return numberOfWorkDays() / 5;
}
function numberOfWorkHours() {
	return numberOfWorkDays() * 8
}

function fullyLoadedCost() {
	return state.salary * 1.2;
}

function hourlyCost() {
	var hourlyCost = fullyLoadedCost() / (numberOfWorkHours());
	return hourlyCost.toFixed(2);
}

/*
TODO:
- format plural 
- Support different currency
- Pretty but restrictive number formatting
- Steppers
- Share button
*/