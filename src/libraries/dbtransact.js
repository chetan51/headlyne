/* dbtransact.js is a wrapper for our database queries.
 * Makes it easier to access/add/modify user settings 
 * and templates.
 *
 * Functions:
 *      getData(username, password, callback, errback):
 *      	Retrieves data for the given username&pass,
 *      	or calls errback.
 *
 *      	callback(settings, feeds, views):
 *      		settings[][key, value]
 *      		feeds[]{
 *      			id,
 *      			url:'',
 *      			feedobj:'',
 *      			feedstrhash:'',
 *      			url_list:[]
 *      		}
 *
 *      		views[]{
 *      			id,
 *      			feeds:[],
 *      			css:'',
 *      		}
 *
 *      	errback(err): err is of type Error.
 *      
 *      addView(username, password, view)
 *      editView(username, password, view)
 *      deleteView(username, password, view)
 *      mergeView(username, password, view, view_merge)
 *	
 *      editSetting(username, password, key, new_value)
 *      
 *      addFeed(username, password, feed)
 *      deleteFeed(username, password, feed)
 *      editFeed(username, password, feed)
 *      
 *      
 *
