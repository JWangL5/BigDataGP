$(document).ready(function () {
	$("#uplaod_icon").click(function () {
		var div = $('#uplaod_data');
		if (div.is(':hidden')) {
			div.show();
		}else {
			div.hide();
		}
	});
}) 