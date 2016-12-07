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
	}
}
export default UTILS

