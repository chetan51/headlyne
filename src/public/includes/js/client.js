/*
 * Initialization
 */
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
	
	// Set up event listeners
	$("#collapse-expand > #collapse-control > #collapse-button").click(expandOrCollapseClicked);
	$("#collapse-expand > #expand-control > #expand-button").click(expandOrCollapseClicked);
	
	$("#edit-page > #default-control > #edit-button").click(editClicked);
	$("#edit-page > #editing-control > #done-button").click(doneClicked);
	
	$("#add-feed-button").click(addFeedClicked);
	$("#add-column-button").click(addColumnClicked);
	
	addColumnListeners($(".column"));
	
	addFeedListeners($(".feed"));
});

/*
 * Functions that add listeners
 */

function addColumnListeners(columns) {
	// Set up sortable
	columns.sortable({
		connectWith: ".column",
		handle: $(".feed .header")
	});
}

function addFeedListeners(feeds) {
	feeds.find(".header > .edit-overlay > .edit-delete > .edit > .default-control > .edit-button").click(feedEditClicked);
	feeds.find(".header > .edit-overlay > .edit-delete > .edit > .editing-control > .done-button").click(feedDoneClicked);
	feeds.children(".header").hover(feedHeaderHoverIn, feedHeaderHoverOut);
}

/*
 * Listeners
 */

function expandOrCollapseClicked(e) {
	$(".feed > .body > .item > .body").slideToggle("fast");
	
	$("#collapse-expand > #expand-control").toggle();
	$("#collapse-expand > #collapse-control").toggle();
}

function editClicked(e) {
	editOrDoneClicked(e);
}

function doneClicked(e) {
	hideFeedPreviews();
	
	var edit_containers = $(".feed").find(".header > .edit-overlay > .edit-delete > .edit");
	edit_containers.children(".default-control").show();
	edit_containers.children(".editing-control").hide();
	
	editOrDoneClicked(e);
}

function editOrDoneClicked(e) {
	$(".feed > .body").slideToggle("fast");
	$(".feed > .header").slideToggle("fast");
	
	$("#edit-page > #default-control").toggle();
	$("#edit-page > #editing-control").toggle();
	
	equallyWidenColumns();
}

function addFeedClicked(e) {
	var new_feed = $(".feed").last().clone();
	$(".column").last().children(".content").append(new_feed);
	
	addFeedListeners(new_feed);
}

function addColumnClicked(e) {
	var new_column = $(".column").last().clone();
	new_column.children(".content").html("");
	$(".page").append(new_column);
	
	equallyWidenColumns();
	addColumnListeners(new_column);
}

function feedEditClicked(e) {
	var this_column = $(this).parents(".column");
	var preview_container = $(this).parents(".feed").children(".preview");
	var url_container = $(this).parents(".feed").find(".header > .url");
	
	var edit_container = $(this).parents(".feed").find(".header > .edit-overlay > .edit-delete > .edit");
	edit_container.children(".default-control").hide();
	edit_container.children(".editing-control").show();
	
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
			
			$(".column").not(this_column).animate({"width" : other_columns_width_percent+"%"});
			this_column.animate({"width" : this_column_width_percent+"%"});
		},
		error: function() {
			// Test if this is hit when server is off
			preview_container.html("An error was encountered.");
		}
	});
}

function feedDoneClicked(e) {
	var edit_container = $(this).parents(".feed").find(".header > .edit-overlay > .edit-delete > .edit");
	edit_container.children(".default-control").show();
	edit_container.children(".editing-control").hide();
	
	$(this).parents(".feed").children(".preview").hide("slide", {direction: "up"}, "fast");
	equallyWidenColumns();
}

function feedHeaderHoverIn(e) {
	$(this).children(".edit-overlay").show();
}	

function feedHeaderHoverOut(e) {
	$(this).children(".edit-overlay").hide();
}	

/*
 * Helper functions
 */
function equallyWidenColumns() {
	var width = 100 / $(".column").length;
	$(".column").animate({"width" : width + "%"});
}

function hideFeedPreviews() {
	$(".feed > .preview").hide("slide", {direction: "up"}, "fast");
}	
