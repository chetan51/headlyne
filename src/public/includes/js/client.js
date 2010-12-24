$(document).ready(function() {
	var triggers = $(".modalInput").overlay({
		// some mask tweaks suitable for modal dialogs
		mask: {
			color: '#000000',
			loadSpeed: 200,
			opacity: 0.9
		},
		closeOnClick: true
	});
});

function collapseOrExpand() {
	$(".feed-item-body").slideToggle("fast");
	
	var button = $("#expand_collapse_button");
	if (button.text() == "Collapse") {
		button.text("Expand");
	}
	else {
		button.text("Collapse");
	}
}
