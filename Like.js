var VERBOSE_LOGGING = true;
var clientContext = null;

function BuildLikeDOMElements() {
	var mainContentDiv = document.getElementsByClassName('ms-rtestate-field')[0];
	var potentialDescriptionTextDiv = mainContentDiv.parentNode.previousSibling.previousSibling;

	if (potentialDescriptionTextDiv.className === 'ms-descriptiontext ewiki-margin') {
		if (VERBOSE_LOGGING) console.log('Correct DIV is available for the like DOM elements.');

		// Build primary GUI for liking.
	
		var spnLikeSectionSeparator = document.createElement('span');
		spnLikeSectionSeparator.id = 'LikeSeparator';

		var spnLikeSymbol = document.createElement('span');
		spnLikeSymbol.id = 'LikeSymbol';
		spnLikeSymbol.style.marginLeft = '5px';
		spnLikeSymbol.style.marginRight = '5px';
		spnLikeSymbol.style.cursor = 'pointer';
		
		var spnLikeCountText = document.createElement('span');
		spnLikeCountText.id = 'LikeCountText';
	
		var spnLikeCountTextSeparator = document.createElement('span');
		spnLikeCountTextSeparator.id = 'LikeCountTextSeparator';
	
		var spnLikeText1 = document.createElement('span');
		spnLikeText1.id = 'LikeText1';
	
		var spnLikeActionText = document.createElement('span');
		spnLikeActionText.id = 'LikeActionText';
		spnLikeActionText.style.color = '#3399ff';
		spnLikeActionText.style.cursor = 'pointer';
	
		var spnLikeText2 = document.createElement('span');
		spnLikeText2.id = 'LikeText2';

		potentialDescriptionTextDiv.appendChild(spnLikeSectionSeparator);
		potentialDescriptionTextDiv.appendChild(spnLikeSymbol);
		potentialDescriptionTextDiv.appendChild(spnLikeCountText);
		potentialDescriptionTextDiv.appendChild(spnLikeCountTextSeparator);
		potentialDescriptionTextDiv.appendChild(spnLikeText1);
		potentialDescriptionTextDiv.appendChild(spnLikeActionText);
		potentialDescriptionTextDiv.appendChild(spnLikeText2);

		return true;
	}
	else {
		console.log('Unable to build like DOM elements, as the correct container DIV does not exist on the page.');
		return false;
	}
}

function SetLike(e) {
	if (e.data.value === null) {
		// Should never actually get here, as we shouldn't be calling this method directly.
		console.warn('SetLike was called without having the e.data.value property set. Doing nothing.');
	}
	else {
		var like = e.data.value;

		$.getScript("/_layouts/15/reputation.js", function () {
			Microsoft.Office.Server.ReputationModel.Reputation.setLike(clientContext, _spPageContextInfo.pageListId.substring(1, 37), _spPageContextInfo.pageItemId, like);
	
			clientContext.executeQueryAsync(
				function () {
					if (VERBOSE_LOGGING) console.log('Like/Unlike image or link clicked. Setting like status to ' + String(like));
					GetLikeCount();
				}, function (sender, args) {
					console.warn('Like/Unlike image or link clicked; error occurred setting like status to ' + String(like) + '. \n\tSender: ' + sender + '\n\tMessage: ' + args.get_message() + '\n\tStackTrace: ' + args.get_stackTrace());
				}
			);
		});
	}    
}

function GetLikeCount() {
	if (!clientContext) {
		if (VERBOSE_LOGGING) console.log('clientContext variable not set; loading current client context.');
		clientContext = SP.ClientContext.get_current();
	}

	var list = clientContext.get_web().get_lists().getById(_spPageContextInfo.pageListId);
	var listProps = list.get_rootFolder().get_properties();

	clientContext.load(listProps);
	clientContext.executeQueryAsync(Function.createDelegate(this, function (success) {
		var ratingSetting = listProps.get_item('Ratings_VotingExperience');

		if (ratingSetting === 'Likes') {
			if (VERBOSE_LOGGING) console.log('List supports likes; continuing with evaluating likes.');

			// Check for DOM support and build out required elements.
			if (BuildLikeDOMElements()) {
				var item = list.getItemById(_spPageContextInfo.pageItemId);

				clientContext.load(item, "LikedBy", "LikesCount");
				clientContext.executeQueryAsync(Function.createDelegate(this, function () {
					// Check if the current user has already liked this page.
					var likeStateForCurrentUser = false;
					var likers = item.get_item('LikedBy');
					var likeCount = item.get_item('LikesCount');
					if (likeCount === null) likeCount = 0;
					if (!SP.ScriptHelpers.isNullOrUndefined(likers)) {
						for (var i = 0; i < likers.length; i++) {
							if (likers[i].get_email() === _spPageContextInfo.userEmail) {
								if (VERBOSE_LOGGING) console.log('Page is liked by me.');
								likeStateForCurrentUser = true;
								break;
							}
						}
		
						if (VERBOSE_LOGGING && !likeStateForCurrentUser) console.log('Page not liked by me.');
					}
					else {
						if (VERBOSE_LOGGING && !likeStateForCurrentUser) console.log('Page not liked by anyone.');
					}
					
					// Update the link text based on whether our potential action is to like or unlike a page.
					SetLikeText(likeStateForCurrentUser, likeCount);
				}), Function.createDelegate(this, function (sender, args) {
					// Don't show the like symbol if the like APIs don't seem to be working.
					SetLikeText(false, -1);
					console.warn('Error occurred checking like status. \n\tSender: ' + sender + '\n\tMessage: ' + args.get_message() + '\n\tStackTrace: ' + args.get_stackTrace());
				}));
			}
			else {
				if (VERBOSE_LOGGING) console.log('List supports likes, but the required DOM elements are not available to build the like GUI; doing nothing.');
			}			
		}
		else if (SP.ScriptUtility.isNullOrEmptyString(ratingSetting)) {
			if (VERBOSE_LOGGING) console.log('Rating system is disabled for this list.');
		}
		else {
			if (VERBOSE_LOGGING) console.log('List does not support likes as the rating system. Rating system set to "' + ratingSetting + '".');
		}
	}), Function.createDelegate(this, function (sender, args) {
		// Don't show the like symbol if the like APIs don't seem to be working.
		SetLikeText(false, -1);
        console.warn('Error occurred checking list reputation feature state. \n\tSender: ' + sender + '\n\tMessage: ' + args.get_message() + '\n\tStackTrace: ' + args.get_stackTrace());
    }));
}

function SetLikeText(likeState, likeCount) {
    $("#LikeSeparator").html('&nbsp;&nbsp;•');
	$("#LikeSymbol").off('click');
	$("#LikeSymbol").off('mouseenter mouseleave');
    $("#LikeActionText").off('click');

	if (likeCount > 0) {
		$("#LikeSymbol").html('&#10084;');

		if (likeState) {
			if (likeCount === 1) {
				$("#LikeCountText").html('You like this article')
			}
			else if (likeCount === 2) {
				$("#LikeCountText").html('You and one other person like this article')
			}
			else {
				$("#LikeCountText").html('You and ' + (likeCount - 1) + ' other people like this article')
			}
	
			$("#LikeSymbol").attr("title", "Unlike")
			$("#LikeSymbol").css({"color":"Red"});
			$("#LikeSymbol").hover(
				function() {
					$(this).css({"color":"Gray"});
				}, function() {
					$(this).css({"color":"Red"});
				}
			);
			$("#LikeSymbol").on('click', {value: false}, SetLike);
			$("#LikeCountTextSeparator").html('');
			$("#LikeText1").html('');
			$("#LikeActionText").html('');
			$("#LikeText2").html('');
		}
		else {
			if (likeCount === 1) {
				$("#LikeCountText").html('One person likes this article')
			}
			else {
				$("#LikeCountText").html(likeCount + ' people like this article')
			}

			$("#LikeSymbol").attr("title", "Like")
			$("#LikeSymbol").css({"color":"Gray"});
			$("#LikeSymbol").hover(
				function() {
					$(this).css({"color":"Red"});
				}, function() {
					$(this).css({"color":"Gray"});
				}
			);
			$("#LikeSymbol").on('click', {value: true}, SetLike);
			$("#LikeCountTextSeparator").html('&nbsp;•&nbsp;');
			$("#LikeText1").html('Was this page helpful? ');
			$("#LikeActionText").html('Like it');
			$("#LikeActionText").on('click', {value: true}, SetLike);
			$("#LikeText2").html(' to let us know');
		}
	}
	else if (likeCount === 0) {
		// If likeCount is zero, we automatically know that likeState is false, so process the logic for both of those here.

		// If no one likes the item, we don't want to show the count information, since this seems negative.
		$("#LikeSymbol").html('');
		$("#LikeSymbol").attr('title', '')
		$("#LikeCountText").html('');
		$("#LikeCountTextSeparator").html('');

		// However, we do want to show the action information, since we want them to like the item.
		$("#LikeText1").html('Was this page helpful? ');
		$("#LikeActionText").html('Like it');
		$("#LikeActionText").on('click', {value: true}, SetLike);
		$("#LikeText2").html(' to let us know');
	}
	else {
		// likeCount of -1 means that an error occurred determining the likeCount, so we hide the GUI related to like functionality.
		$("#LikeSymbol").html('');
		$("#LikeSymbol").attr('title', '')
		$("#LikeCountText").html('');
		$("#LikeCountTextSeparator").html('');
		$("#LikeText1").html('');
		$("#LikeActionText").html('');
		$("#LikeText2").html('');
	}
}

setTimeout(GetLikeCount, 2000);