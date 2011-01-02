/*
 * Initialization
 */
$(document).ready(function() {
	// Hide elements
	$("#edit-page #editing-control").hide();
	$("#collapse-expand #expand-control").hide();
	
	var feed_containers = $(".feed");
	var header_containers = feed_containers.children(".header");
	header_containers.hide();
	feed_containers.children(".preview").hide();
	feed_containers.children(".confirm-delete").hide();
	
	var edit_overlays = header_containers.children(".edit-overlay");
	edit_overlays.hide();
	edit_overlays.find("> .edit-delete > .delete > .deleting-control").hide();
	edit_overlays.find("> .edit-delete > .edit > .editing-control").hide();
	
	var column_containers = $(".column");
	var header_containers = column_containers.children(".header");
	header_containers.hide();
	column_containers.children(".confirm-delete").hide();
	
	var edit_overlays = header_containers.children(".edit-overlay");
	edit_overlays.hide();
	edit_overlays.find("> .delete > .deleting-control").hide();
	
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
	columns.children(".content").sortable({
		connectWith: ".column > .content",
		handle: $(".feed > .header")
	});
	
	var delete_container = columns.find("> .header > .edit-overlay > .delete"); 
	delete_container.find("> .default-control > .delete-button").click(columnDeleteClicked);
	delete_container.find("> .deleting-control > .cancel-button").click(columnDeleteCancelClicked);
	columns.find("> .confirm-delete > .delete-button").click(columnDeleteConfirmClicked);
	
	columns.hover(columnHoverIn, columnHoverOut);
}

function addFeedListeners(feeds) {
	var edit_delete_container = feeds.find("> .header > .edit-overlay > .edit-delete"); 

	var edit_container = edit_delete_container.children(".edit");
	edit_container.find("> .default-control > .edit-button").click(feedEditClicked);
	edit_container.find("> .editing-control > .done-button").click(feedDoneClicked);
	
	var delete_container = edit_delete_container.children(".delete");
	delete_container.find("> .default-control > .delete-button").click(feedDeleteClicked);
	delete_container.find("> .deleting-control > .cancel-button").click(feedDeleteCancelClicked);
	feeds.find("> .confirm-delete > .delete-button").click(feedDeleteConfirmClicked);
	
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
	
	var edit_containers = $(".feed").find("> .header > .edit-overlay > .edit-delete > .edit");
	edit_containers.children(".default-control").show();
	edit_containers.children(".editing-control").hide();
	
	editOrDoneClicked(e);
}

function editOrDoneClicked(e) {
	$(".feed > .body").slideToggle("fast");
	$(".feed > .header").slideToggle("fast");
	
	$(".column > .header").slideToggle("fast");
	
	$("#edit-page > #default-control").toggle();
	$("#edit-page > #editing-control").toggle();
	
	equallyWidenColumns();
}

function addFeedClicked(e) {
	var new_feed = $(".feed").last().clone();
	$(".column").last().children(".content").append(new_feed);
	
	addFeedListeners(new_feed);
	addColumnListeners($(".column"));
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
	var settings_container = $(this).parents(".feed").find("> .header > .settings");
	var feed_url = settings_container.children(".url").text();
	var title_selection = settings_container.children(".title-selection").text();
	var body_selection = settings_container.children(".body-selection").text();
	
	var edit_container = $(this).parents(".feed").find("> .header > .edit-overlay > .edit-delete > .edit");
	edit_container.children(".default-control").hide();
	edit_container.children(".editing-control").show();
	
	preview_container.html("Loading feed preview...");
	preview_container.slideDown("fast", function() {
		$.ajax({
			url: "/feed/preview",
			data: {
				url: feed_url
			},
			success: function(data) {
				preview_container.hide();
				preview_container.html(data);
				preview_container.slideDown("fast");
				
				resizeColumnDynamically(this_column, 50);
				
				// Mark selected settings
				var titles_form = preview_container.find("> .display > .titles > form");
				var bodies_form = preview_container.find("> .display > .bodies > form");
				if (title_selection == "item") {
					titles_form.find("> .item > .control > .input").click();
				}
				else if (title_selection == "webpage") {
					titles_form.find("> .webpage > .control > .input").click();
				}
				
				if (body_selection == "item") {
					bodies_form.find("> .item > .control > .input").click();
				}
				else if (body_selection == "webpage") {
					bodies_form.find("> .webpage > .control > .input").click();
				}
			},
			error: function() {
				// Test if this is hit when server is off
				preview_container.hide();
				preview_container.html("An error was encountered.");
				preview_container.slideDown("fast");
			}
		});
	});
}

function feedDoneClicked(e) {
	var edit_container = $(this).parents(".feed").find("> .header > .edit-overlay > .edit-delete > .edit");
	edit_container.children(".default-control").show();
	edit_container.children(".editing-control").hide();
	
	$(this).parents(".feed").children(".preview").slideUp("fast");
	equallyWidenColumns();
}

function feedDeleteClicked(e) {
	var feed_container = $(this).parents(".feed");
	feed_container.children(".confirm-delete").slideDown("fast");
	
	var delete_container = feed_container.find("> .header > .edit-overlay > .edit-delete > .delete");
	delete_container.children(".default-control").hide();
	delete_container.children(".deleting-control").show();
}

function feedDeleteCancelClicked(e) {
	var feed_container = $(this).parents(".feed");
	feed_container.children(".confirm-delete").slideUp("fast");
	
	var delete_container = feed_container.find("> .header > .edit-overlay > .edit-delete > .delete");
	delete_container.children(".default-control").show();
	delete_container.children(".deleting-control").hide();
}

function feedDeleteConfirmClicked(e) {
	var feed_container = $(this).parents(".feed");
	feed_container.hide("fast");
}

function feedHeaderHoverIn(e) {
	$(this).children(".edit-overlay").show();
}	

function feedHeaderHoverOut(e) {
	$(this).children(".edit-overlay").hide();
}	

function columnDeleteClicked(e) {
	var column_container = $(this).parents(".column");
	column_container.children(".confirm-delete").slideDown("fast");
	
	var delete_container = column_container.find("> .header > .edit-overlay > .delete");
	delete_container.children(".default-control").hide();
	delete_container.children(".deleting-control").show();
}

function columnDeleteCancelClicked(e) {
	var column_container = $(this).parents(".column");
	column_container.children(".confirm-delete").slideUp("fast");
	
	var delete_container = column_container.find("> .header > .edit-overlay > .delete");
	delete_container.children(".default-control").show();
	delete_container.children(".deleting-control").hide();
}

function columnDeleteConfirmClicked(e) {
	var column_container = $(this).parents(".column");
	
	// Fix column contents' width while animating the column away
	var column_width = column_container.width();
	column_container.find("> div").css("width", column_width+"px");
	
	resizeColumnDynamically(column_container, 0);
}

function columnHoverIn(e) {
	$(this).find("> .header > .edit-overlay").show();
}	

function columnHoverOut(e) {
	$(this).find("> .header > .edit-overlay").hide();
}	

/*
 * Helper functions
 */
function equallyWidenColumns() {
	var width = 99 / $(".column").length;
	$(".column").animate({"width" : width + "%"}, "fast");
}

function resizeColumnDynamically(column, width_percent) {
	var other_columns_width_percent = (99 - width_percent) / ($(".column").length - 1);
	
	column.animate({"width" : width_percent+"%"}, "fast", function() {
		if (width_percent == 0) {
			column.remove();
		}
	});
	$(".column").not(column).animate({"width" : other_columns_width_percent+"%"}, "fast");
}

function hideFeedPreviews() {
	$(".feed > .preview").hide("slide", {direction: "up"}, "fast");
}
