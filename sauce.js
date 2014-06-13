var IDs = [];
var TITLEs = {};
var TYPEs = {};
var player;
var lel = document.getElementsByTagName("SPAN");
var body = document.getElementsByTagName("body")[0];
var global = document.getElementById("globalYT");
var currentSong = 0;
var timette;
var height;

$('#subreddit').keyup(function(e){
	if(e.keyCode === 13){
		$('#go').click();
		$('#subreddit').blur();
	}
});

function download()
{
	var subreddit = $("#subreddit").val();
	//&sort=top&t=all 
	$.getJSON("http://www.reddit.com/r/" + subreddit + "/.json?jsonp=?&limit=50", function (data)
	{
		IDs = [];
		currentSong = 0;
		TITLEs = new Array(data.data.children.length);
		$.each(data.data.children, function (i, item)
		{

			var parser = document.createElement('a');
			parser.href = item.data.url;
			if(parser.hostname === "www.youtube.com")
			{
				try
				{
					var ID = $("<textarea />").html(decodeURIComponent(parser.href)).text().match(/v\=.{11}/)[0].replace(/v\=/, "");
					$.getJSON("https://gdata.youtube.com/feeds/api/videos/" + ID + "?alt=json", function (doto)
					{
						var ID2 = doto.entry.link[0].href.match(/v\=.{11}/)[0].replace(/v\=/, "");
						TITLEs[ID2] = doto.entry.title.$t;
						TYPEs[ID2] = "yt";
					});
					IDs.push(ID);
				}
				catch(ex)
				{
					console.log("HAS NO YOUTUBE URL: " + $("<textarea />").html(decodeURIComponent(parser.href)).text());
				}
			}
			else if(parser.hostname === "soundcloud.com")
			{
				$.getJSON("https://api.soundcloud.com/resolve.json?url=" + parser.href + "&client_id=bbc61dafe8680da53b475f005cd60459", function (doto)
				{
					TITLEs[doto.uri] = doto.title;
					IDs.push(doto.uri);
					TYPEs[doto.uri] = "sc";
				});
			}
		});
		height = $('body').height() - $('#subreddit').height();
		setCurrent(currentSong);
	});
}

function next()
{
	if(currentSong < IDs.length - 1)
	{
		currentSong++;
		setCurrent(currentSong);
	}
}

function prev()
{
	if(currentSong > 0)
	{
		currentSong--;
		setCurrent(currentSong);

	}
}

function setCurrent(_index)
{
	// create youtube player
	console.log(IDs[_index]);
	if(TYPEs[IDs[_index]] === "sc")
	{
		global.innerHTML = '<iframe id="sc-widget" scrolling="no" src="https://w.soundcloud.com/player/?url=' + IDs[_index] + '"></iframe>';
		var iframeElement = document.querySelector('#sc-widget');
		var widget = SC.Widget(iframeElement);
		widget.bind(SC.Widget.Events.READY, function ()
		{
			widget.play();

		});
		widget.bind(SC.Widget.Events.FINISH, function ()
		{
			next();
		});
		if(timette !== null)
		{
			clearTimeout(timette);
		}
	}
	else
	{

		global.innerHTML = "<div id='youtubeROX'></div>";

		function onReady(event)
		{
			event.target.playVideo();
			player.addEventListener('onStateChange', function (event)
			{
				if(event.data === 0)
				{
					next();
				}
			});
		}
		player = new YT.Player('youtubeROX',
		{
			videoId: IDs[_index],
			events:
			{
				'onReady': onReady
			}
		});
		if(timette !== null)
		{
			clearTimeout(timette);
		}
		timette = window.setTimeout(function ()
		{
			var state = player.k.playerState;
			console.log(">" + state);
			window.document.title = '[' + (_index + 1) + '/' + IDs.length + '] ' + TITLEs[IDs[_index]];
			if(state === -1)
			{
				next();
			}
		}, 10000);
	}
	var title = '[' + (_index + 1) + '/' + IDs.length + '] ' + TITLEs[IDs[_index]];
	console.log(title);
	window.document.title = title;

}

document.onkeydown = checkKey;

function checkKey(e)
{
	e = e || window.event;
	if(e.keyCode === 37)
	{
		prev();
	}
	else if(e.keyCode === 39)
	{
		next();
	}
}