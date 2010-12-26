$(document).ready(function() {
	// Hide elements
	$(".feed-header").hide();
	
	// Set up overlays
	var triggers = $(".modalInput").overlay({
		// some mask tweaks suitable for modal dialogs
		mask: {
			color: '#000000',
			loadSpeed: 200,
			opacity: 0.9
		},
		closeOnClick: true
	});
	
	// Set up event listeners
	$("#expand-collapse-button").click(function(e) {
		$(".feed-item-body").slideToggle("fast");
		
		if ($(this).text() == "Collapse") {
			$(this).text("Expand");
		}
		else {
			$(this).text("Collapse");
		}
	});
	
	$("#edit-button").click(function(e) {
		$(".feed-body").slideToggle("fast");
		$(".feed-header").slideToggle("fast");
		
		var button = $("#edit-button");
		if ($(this).text() == "Edit") {
			$(this).text("Done");
		}
		else {
			$(this).text("Edit");
		}
	});
});
