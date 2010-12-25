$(document).ready(function() {
	// Hide elements
	$(".feed-header").hide();
	
	// Set up tooltips
	$("#edit-button").tooltip({
		events: {
			def: ","
		},
		position: 'bottom center',
		direction: 'down',
		offset: [15, 20],
		effect: "slide"
	});

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
});

function collapseOrExpand() {
	$(".feed-item-body").slideToggle("fast");
	
	var button = $("#expand-collapse-button");
	if (button.text() == "Collapse") {
		button.text("Expand");
	}
	else {
		button.text("Collapse");
	}
}

function edit() {
	$(".feed-body").slideToggle("fast");
	$(".feed-header").slideToggle("fast");
	
	var button = $("#edit-button");
	if (button.text() == "Edit") {
		button.text("Done");
		$("#edit-button").data("tooltip").show();
	}
	else {
		button.text("Edit");
		$("#edit-button").data("tooltip").hide();
	}
}

function preview() {
	var feed_url = $("#add-url").val();
}
