$(document).ready(function() {
	// Hide elements
	$(".feed-header").hide();
	$("#edit-editing-control").hide();
	$("#collapse-control").hide();
	
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
	$("#expand-button").click(expandOrCollapseClicked);
	$("#collapse-button").click(expandOrCollapseClicked);
	
	$("#edit-button").click(editOrDoneClicked);
	$("#done-button").click(editOrDoneClicked);
});

function expandOrCollapseClicked(e) {
	$(".feed-item-body").slideToggle("fast");
	
	$("#expand-control").toggle();
	$("#collapse-control").toggle();
}

function editOrDoneClicked(e) {
	$(".feed-body").slideToggle("fast");
	$(".feed-header").slideToggle("fast");
	
	$("#edit-editing-control").toggle();
	$("#edit-default-control").toggle();
}
