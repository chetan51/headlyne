$(document).ready(function() {
	// Hide elements
	$("#edit-page #editing-control").hide();
	$("#collapse-expand #expand-control").hide();
	
	$(".feed > .header").hide();
	$(".feed > .preview").hide();
	$(".feed > .header > .edit-overlay").hide();
	$(".feed > .header > .edit-overlay > .edit-delete > .delete > .deleting-control").hide();
	$(".feed > .header > .edit-overlay > .edit-delete > .edit > .editing-control").hide();
	
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
		handle: $(".feed .header")
	});
	
	// Set up UI elements
	$("button").button();
	
	// Set up event listeners
	$("#collapse-expand > #collapse-control > #collapse-button").click(expandOrCollapseClicked);
	$("#collapse-expand > #expand-control > #expand-button").click(expandOrCollapseClicked);
	
	$("#edit-page > #default-control > #edit-button").click(editClicked);
	$("#edit-page > #editing-control > #done-button").click(doneClicked);
	
	$("#add-column-button").click(addColumnClicked);
	
	$(".feed > .header > .edit-overlay > .edit-delete > .edit > .default-control > .edit-button").click(feedEditClicked);
	$(".feed > .header").hover(feedHeaderHoverIn, feedHeaderHoverOut);
});

function expandOrCollapseClicked(e) {
	$(".feed > .body > .item > .body").slideToggle("fast");
	
	$("#collapse-expand > #expand-control").toggle();
	$("#collapse-expand > #collapse-control").toggle();
}

function editClicked(e) {
	editOrDoneClicked(e);
}

function doneClicked(e) {
	$(".feed > .preview").hide("slide", {direction: "up"}, "fast");
	editOrDoneClicked(e);
}

function editOrDoneClicked(e) {
	$(".feed > .body").slideToggle("fast");
	$(".feed > .header").slideToggle("fast");
	
	$("#edit-page > #default-control").toggle();
	$("#edit-page > #editing-control").toggle();
	
	equallyWidenColumns();
}

function addColumnClicked(e) {
	var new_column = $("<div></div>").addClass("column ui-sortable");
	$(".page").append(new_column);
	
	equallyWidenColumns();
}

function feedEditClicked(e) {
	var this_column = $(this).parents(".column");
	var preview_container = $(this).parents(".feed").children(".preview");
	var url_container = $(this).parents(".feed").children(".header > .url");
	
	preview_container.html("Loading feed preview...");
	preview_container.show();
	
	$.ajax({
		url: "/feed/preview",
		data: {
			url: url_container.text()
		},
		success: function(data) {
			preview_container.html(data);
			
			// Resize all columns based on preview width
			var this_column_width_percent = 50;
			var other_columns_width_percent = (100 -this_column_width_percent) / ($(".column").length - 1);
			$(".column").css("width", other_columns_width_percent+"%");
			this_column.css("width", this_column_width_percent+"%");
		},
		error: function() {
			preview_container.html("An error was encountered.");
		}
	});

}

function feedHeaderHoverIn(e) {
	$(this).children(".header > .edit-overlay").show();
}	

function feedHeaderHoverOut(e) {
	$(this).children(".header > .edit-overlay").hide();
}	


/*
 * Helper functions
 */
function equallyWidenColumns() {
	var width = 100 / $(".column").length;
	$(".column").css("width", width + "%");
}
