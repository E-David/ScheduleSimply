import STORE from "./store"

const UTILS = {
	DAYS: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],

	addMinutes: function(date, minutes) {
		return new Date(date.getTime() + minutes * 60000)
	},

	arraysEqual: function(arr1, arr2) {
		var biggerArray, smallerArray 
		[biggerArray,smallerArray] = (arr1.length > arr2.length) ? [arr1,arr2] : [arr2,arr1]
		for (var i = 0; i < biggerArray.length; i ++) {
			if (biggerArray[i] !== smallerArray[i]) return false
		}
		return true
	},

	// change DateTime object to DayOfWeek: Month/Day
	formatDate: function(date) {
		return `${this.DAYS[date.getDay()]}: ${date.getMonth() % 12 + 1}/${date.getDate()}`
	},

	// change DateTime object to Hour:Minutes
	formatTime: function(date) {
		var hours = new Date(date).getHours() % 12
		var minutes = new Date(date).getMinutes()
		
		if(minutes === 0) minutes = minutes + "0"
		return `${hours}:${minutes}`
	},
	getCurrentUser: function() {
		return localStorage.getItem('userName')
	},
	getNextWeek: function() {
	    var weekArr = []

	    for(var i = 0; i < 8; i ++){
	    	//pushes copy of date Object, since the copy is not changed when setDate is used
	        var date = new Date()
	        date.setDate(date.getDate() + i)
	        weekArr.push(date)
	    }
	    return weekArr
	},
		getElNextWeek: function() {
	    var weekArr = []

	    for(var i = 8; i < 16; i ++){
	    	//pushes copy of date Object, since the copy is not changed when setDate is used
	        var date = new Date()
	        date.setDate(date.getDate() + i)
	        weekArr.push(date)
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

