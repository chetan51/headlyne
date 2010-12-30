$(document).ready(function() {
	// Hide elements
	$(".feed-header").hide();
	$(".feed-preview").hide();
	$(".feed-edit-overlay").hide();
	$(".feed-delete-deleting-control").hide();
	$(".feed-edit-editing-control").hide();
	$("#edit-editing-control").hide();
	$("#expand-control").hide();
	
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
	
	// Set up sortable
	$( ".column" ).sortable({
		connectWith: ".column",
		handle: $(".feed-header")
	});
	
	// Set up UI elements
	$("button").button();
	
	// Set up event listeners
	$("#expand-button").click(expandOrCollapseClicked);
	$("#collapse-button").click(expandOrCollapseClicked);
	
	$("#edit-button").click(editOrDoneClicked);
	$("#done-button").click(editOrDoneClicked);
	
	$("#add-column-button").click(addColumnClicked);
	
	$(".feed-edit-button").click(feedEditClicked);
	$(".feed-header").hover(feedHeaderHoverIn, feedHeaderHoverOut);
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

function addColumnClicked(e) {
	var new_column = $("<div></div>").addClass("column ui-sortable");
	$(".page").append(new_column);
	
	// Resize all the columns
	var width = 100 / $(".column").length;
	$(".column").css("width", width + "%");
}

function feedEditClicked(e) {
	var preview_container = $(this).parents(".feed").children(".feed-preview");
	var url_container = $(this).parents(".feed").children(".feed-url");
	
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

function feedHeaderHoverIn(e) {
	$(this).children(".feed-edit-overlay").show();
}	

function feedHeaderHoverOut(e) {
	$(this).children(".feed-edit-overlay").hide();
}	
