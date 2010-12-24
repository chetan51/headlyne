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
