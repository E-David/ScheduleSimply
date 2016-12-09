const UTILS = {
	DAYS: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],

	addMinutes: function(date, minutes) {
		return new Date(date.getTime() + minutes * 60000)
	},

	// change DateTime object to DayOfWeek: Month/Day
	formatDate: function(date) {
		return `${this.DAYS[date.getDay()]}: ${date.getMonth() % 12 + 1}/${date.getDate()}`
	},

	// change DateTime object to Hour:Minutes
	formatTime: function(date) {
		var hours = date.getHours() % 12
		var minutes = date.getMinutes()
		if(minutes === 0) minutes = minutes + "0"
		return `${hours}:${minutes}`
	},
	getCurrentUser: function() {
		return localStorage.getItem('userName')
	},
	getNextWeek: function() {
	    var dateToGet = new Date(),
	        weekArr = []

	    for(var i = 0; i < 8; i ++){
	    	//pushes copy of date Object, since the copy is not changed when setDate is used
	        weekArr.push(new Date(dateToGet))
	        dateToGet = new Date(dateToGet.setDate(dateToGet.getDate() + 1))
	    }
	    return weekArr
	},
	getThirtyMinIncrements: function(start,end) {
	    var timeBlocksArr = []

	    while(start.getHours() <= new Date(end).getHours()) {
	        timeBlocksArr.push(start)
	    	start = this.addMinutes(start,30)
	    }
	    return timeBlocksArr
	}
}
export default UTILS

