$(document).ready(function() {
	// Hide elements
	$(".feed-header").hide();
	$(".feed-edit-control").hide();
	$(".feed-preview").hide();
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
	
	$(".feed-edit-control").click(feedEditClicked);
});

function expandOrCollapseClicked(e) {
	$(".feed-item-body").slideToggle("fast");
	
	$("#expand-control").toggle();
	$("#collapse-control").toggle();
}

function editOrDoneClicked(e) {
	$(".feed-body").slideToggle("fast");
	$(".feed-header").slideToggle("fast");
	$(".feed-edit-control").toggle();
	
	$("#edit-editing-control").toggle();
	$("#edit-default-control").toggle();
}

function feedEditClicked(e) {
	var preview_container = $(this).siblings(".feed-preview");
	var url_container = $(this).siblings(".feed-url");
	
	preview_container.html("Loading feed preview...");
	preview_container.show();
	
	$.ajax({
		url: "/feed/preview",
		data: {
			url: url_container.text(),
		},
		success: function(data) {
			preview_container.html(data);
		},
		error: function() {
			preview_container.html("An error was encountered.");
		}
	});

}
