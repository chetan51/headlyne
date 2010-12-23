// Helper functions

function stopClickPropagation(e) {
	if (!e) {
		e = window.event;
	}
	if (e.cancelBubble) {
		e.cancelBubble = true;
	}
	else {
		e.stopPropagation();
	}
}

function ajaxPostToServer(URL, successHandler) {
	jQuery.ajax({
		type: 'post',
		dataType: 'json',
		url: URL,
		success: function(response){
			if (response && response.success) {
				successHandler(response.successMessage)
			}
			else {
				if (response.failure && response.errorMessage) {
					var notification = errorNotification("Error: " + response.errorMessage)
					notifyAnimated(notification)
				}
				else {
					var notification = serverErrorNotification()
					notifyAnimated(notification)
				}
			}
		},
		error: function (xhr, ajaxOptions, thrownError){
			var notification = serverErrorNotification()
			notifyAnimated(notification)
		}    
	})
}