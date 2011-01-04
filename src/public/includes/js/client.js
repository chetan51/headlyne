/*
 * Initialization
 */
$(document).ready(function() {
	// Set up event listeners
	$("#collapse-expand > #collapse-control > #collapse-button").click(expandOrCollapseClicked);
	$("#collapse-expand > #expand-control > #expand-button").click(expandOrCollapseClicked);
	
	$("#edit-page > #default-control > #edit-button").click(editClicked);
	$("#edit-page > #editing-control > #done-button").click(doneClicked);
	
	$("#add-feed-button").click(addFeedClicked);
	$("#add-column-button").click(addColumnClicked);
	
	addColumnListeners($(".column"));
	addFeedListeners($(".feed"));
	refreshColumnDeleteOptions($(".column"));
      enablePlaceholders();
});

/*
 * Functions that refresh elements on the page
 */

function addColumnListeners(columns) {
	// Set up sortable
	columns.children(".content").sortable({
		connectWith: ".column > .content",
		handle: $(".feed > .header")
	});
	
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
	delete_container.find("> .deleting-control > .delete-confirm-button").click(feedDeleteConfirmClicked);
	
	var feeditem_container = feeds.find("> .body > .item");
	var feeditem_body_container = feeditem_container.find("> .body");
	var snippet_container = feeditem_body_container.children(".snippet");
	snippet_container.click(snippetClicked);
	var article_container = feeditem_body_container.children(".full-article");
	article_container.click(fullArticleClicked);
	var feeditem_title = feeditem_container.find("> .header > .title");
	feeditem_title.click(feedItemTitleClicked);
	feeditem_title.overlay({  // reader overlay
		// some mask tweaks suitable for modal dialogs
		mask: {
			color: '#000000',
			loadSpeed: 200,
			opacity: 0.9
		},
		closeOnClick: true
	});
	
	feeds.children(".header").hover(feedHeaderHoverIn, feedHeaderHoverOut);
	
      enablePlaceholders(feeds);
}

function refreshColumnDeleteOptions(columns) {
	var delete_container = columns.find("> .header > .edit-overlay > .delete"); 
	delete_container.find("> .default-control > .delete-button").click(columnDeleteClicked);
	
	var deleting_controls = columns.find("> .header > .edit-overlay > .delete > .deleting-control");
	
	deleting_controls.children(".move-left-button").unbind("click");
	deleting_controls.children(".move-right-button").unbind("click");
	deleting_controls.children(".move-left-button").removeClass("disabled").attr("href", "#").click(columnMoveFeedsLeftClicked);
	deleting_controls.children(".move-right-button").removeClass("disabled").attr("href", "#").click(columnMoveFeedsRightClicked);
	
	deleting_controls.first().children(".move-left-button").addClass("disabled").removeAttr("href").unbind("click");
	deleting_controls.last().children(".move-right-button").addClass("disabled").removeAttr("href").unbind("click");
	
	deleting_controls.children(".delete-button").click(columnDeleteWithFeedsClicked);
	deleting_controls.children(".cancel-button").click(columnDeleteCancelClicked);
}

function enablePlaceholders(element) {
	$('[placeholder]', element).focus(function() {
	  var input = $(this);
	  if (input.val() == input.attr('placeholder')) {
	    input.val('');
	    input.removeClass('placeholder');
	  }
	}).blur(function() {
	  var input = $(this);
	  if (input.val() == '' || input.val() == input.attr('placeholder')) {
	    input.addClass('placeholder');
	    input.val(input.attr('placeholder'));
	  }
	}).blur();
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
	
	var feeds = $(".feed");
	
	var edit_containers = feeds.find("> .header > .edit-overlay > .edit-delete > .edit");
	edit_containers.children(".default-control").show();
	edit_containers.children(".editing-control").hide();
	
	var source_containers = feeds.children(".source");
	source_containers.hide();
	
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
	
	// Clear new feed
	var header = new_feed.children(".header");
	header.children(".title").html("New Feed");
	var settings = header.children(".settings");
	settings.children(".title-selection").html("");
	settings.children(".body-selection").html("");
	var source = new_feed.children(".source");
	var url_input = source.find(".url-control > .url-input");
	url_input.val("");
	
	// Show new feed
	new_feed.hide();
	$(".column").last().children(".content").append(new_feed);
	new_feed.slideDown("fast");
	
	// Set up new feed
	var edit = header.find("> .edit-overlay > .edit-delete > .edit");
	edit.children(".default-control").hide();
	edit.children(".editing-control").show();
	source.slideDown("fast");
	
	addFeedListeners(new_feed);
	addColumnListeners($(".column"));
}

function addColumnClicked(e) {
	var new_column = $(".column").last().clone();
	new_column.children(".content").html("");
	$(".page").append(new_column);
	
	equallyWidenColumns();
	addColumnListeners(new_column);
	refreshColumnDeleteOptions($(".column"));
}

function feedEditClicked(e) {
	var this_column = $(this).parents(".column");
	var source_container = $(this).parents(".feed").children(".source");
	var preview_container = $(this).parents(".feed").children(".preview");
	var settings_container = $(this).parents(".feed").find("> .header > .settings");
	var feed_url = source_container.find("> .url-control > .url-input").val();
	var title_selection = settings_container.children(".title-selection").text();
	var body_selection = settings_container.children(".body-selection").text();
	
	var edit_container = $(this).parents(".feed").find("> .header > .edit-overlay > .edit-delete > .edit");
	edit_container.children(".default-control").hide();
	edit_container.children(".editing-control").show();
	
	source_container.slideDown("fast");
	
	if (feed_url && feed_url != "") {
		preview_container.html("Loading feed preview...");
		preview_container.slideDown("fast", function() {
			$.ajax({
				url: "/feed/preview",
				type: 'POST',
				data: {
					feed_url: feed_url
				},
				datatype: 'json',
				success: function(data) {
					if (data.error || !data.preview) {
						previewError(preview_container);
					}
					else {
						preview_container.hide();
						preview_container.html(data.preview);
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
					}
				},
				error: function() {
					// Test if this is hit when server is off
					previewError(preview_container);
				}
			});
		});
	}
}

function feedDoneClicked(e) {
	var edit_container = $(this).parents(".feed").find("> .header > .edit-overlay > .edit-delete > .edit");
	edit_container.children(".default-control").show();
	edit_container.children(".editing-control").hide();
	
	var source_container = $(this).parents(".feed").children(".source");
	source_container.slideUp("fast");
	
	$(this).parents(".feed").children(".preview").slideUp("fast");
	equallyWidenColumns();
}

function feedDeleteClicked(e) {
	var feed_container = $(this).parents(".feed");
	var delete_container = feed_container.find("> .header > .edit-overlay > .edit-delete > .delete");
	delete_container.children(".default-control").hide();
	delete_container.children(".deleting-control").show();
}

function feedDeleteCancelClicked(e) {
	var feed_container = $(this).parents(".feed");
	resetFeedDelete(feed_container);
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
	resetFeedDelete(feed_container);
}

function snippetClicked(e) {
	var feeditem_container = $(this).parents(".item");
	var snippet_container = feeditem_container.find("> .body > .snippet");
	var article_container = feeditem_container.find("> .body > .full-article");
	
	loadFullArticle(feeditem_container, function(err, data) {
		if (err || data.error || !data.page) {
			fullArticleError(article_container);
		}
		else {
			snippet_container.slideUp("fast");
			article_container.html(data.page);
			article_container.slideDown("fast");
		}
	});
}

function fullArticleClicked(e) {
	var feeditem_container = $(this).parents(".item");
	var snippet_container = feeditem_container.find("> .body > .snippet");
	var article_container = feeditem_container.find("> .body > .full-article");
	
	article_container.slideUp("fast");
	snippet_container.slideDown("fast");
}

function feedItemTitleClicked(e) {
	var feeditem_container = $(this).parents(".item");
	
	var reader_title_container = $("#reader > .content > .title");
	var reader_body_container = $("#reader > .content > .body");
	var feeditem_title = feeditem_container.find(".header > .title").text();
	reader_title_container.html(feeditem_title);
	reader_body_container.html("Loading...");
	
	loadFullArticle(feeditem_container, function(err, data) {
		if (err || data.error || !data.page) {
			readerError();
		}
		else {
			reader_body_container.html(data.page);
		}
	});
}

function columnDeleteClicked(e) {
	var column_container = $(this).parents(".column");
	var delete_container = column_container.find("> .header > .edit-overlay > .delete");
	delete_container.children(".default-control").hide();
	delete_container.children(".deleting-control").show();
}

function columnDeleteCancelClicked(e) {
	var column_container = $(this).parents(".column");
	resetColumnDelete(column_container);
}

function columnDeleteWithFeedsClicked(e) {
	var column_container = $(this).parents(".column");
	removeColumn(column_container);
}

function columnMoveFeedsLeftClicked(e) {
	var column_container = $(this).parents(".column");
	var left_column_container = column_container.prev();
	
	var feeds = column_container.find("> .content > .feed").clone();
	feeds.hide();
	addFeedListeners(feeds);
	feeds.appendTo(left_column_container.children(".content"));
	feeds.show("slide", {direction: "right"}, "fast");
	
	removeColumn(column_container);
	addColumnListeners(left_column_container);
}

function columnMoveFeedsRightClicked(e) {
	var column_container = $(this).parents(".column");
	var right_column_container = column_container.next();
	
	var feeds = column_container.find("> .content > .feed").clone();
	feeds.hide();
	addFeedListeners(feeds);
	feeds.appendTo(right_column_container.children(".content"));
	feeds.show("slide", {direction: "left"}, "fast");
	
	removeColumn(column_container);
	addColumnListeners(right_column_container);
}

function columnHoverIn(e) {
	$(this).find("> .header > .edit-overlay").show();
}	

function columnHoverOut(e) {
	var edit_overlay = $(this).find("> .header > .edit-overlay");
	edit_overlay.hide();
	
	var column_container = $(this);
	resetColumnDelete(column_container);
}	

/*
 * Helper functions
 */
function equallyWidenColumns() {
	var width = 99 / $(".column").length;
	$(".column").animate({"width" : width + "%"}, "fast");
}

function resizeColumnDynamically(column, width_percent, callback) {
	var other_columns_width_percent = (99 - width_percent) / ($(".column").length - 1);
	
	column.animate({"width" : width_percent+"%"}, "fast", callback);
	$(".column").not(column).animate({"width" : other_columns_width_percent+"%"}, "fast");
}

function hideFeedPreviews() {
	$(".feed > .preview").hide("slide", {direction: "up"}, "fast");
}

function previewError(preview_container) {
	preview_container.hide();
	preview_container.html("There was an error while loading the feed preview. Please refresh the page and try again.");
	preview_container.slideDown("fast");
}

function fullArticleError(article_container) {
	article_container.html("There was an error while loading the article. Please refresh the page and try again.<br><br>");
	article_container.slideDown("fast");
}

function readerError() {
	$("#reader > .content > .body").html("There was an error while loading the article. Please refresh the page and try again.");
}

function resetFeedDelete(feed_container) {
	var delete_container = feed_container.find("> .header > .edit-overlay > .edit-delete > .delete");
	delete_container.children(".default-control").show();
	delete_container.children(".deleting-control").hide();
}

function resetColumnDelete(column_container) {
	var delete_container = column_container.find("> .header > .edit-overlay > .delete");
	delete_container.children(".default-control").show();
	delete_container.children(".deleting-control").hide();
}	

function removeColumn(column_container) {
	// Fix column contents' width while animating the column away
	var column_width = column_container.width();
	column_container.find("> div").css("width", column_width+"px");
	
	resizeColumnDynamically(column_container, 0, function() {
		column_container.remove();
		refreshColumnDeleteOptions($(".column"));
	});
}

function loadFullArticle(feeditem_container, callback) {
	var webpage_url = feeditem_container.find("> .header > .url").text();

	$.ajax({
		url: "/feed/webpage",
		type: 'POST',
		data: {
			webpage_url: webpage_url
		},
		datatype: 'json',
		success: function(data) {
			callback(null, data);
		},
		error: function() {
			callback(new Error("Error loading full article"));
		}
	});
}
