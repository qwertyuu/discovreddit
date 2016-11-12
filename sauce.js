var IDs;
var TITLEs = {};
var TYPEs = {};
var player;
var lel = document.getElementsByTagName("SPAN");
var body = document.getElementsByTagName("body")[0];
var global = document.getElementById("globalYT");
var currentSong = 0;
var timette;
var height;
var optionsOpen = false;
var limit = 50;
var sort = "hot";
var time = "week";

$('#subreddit').keyup(function(e) {
    if (e.keyCode === 13) {
        $('#go').click();
        $('#subreddit').blur();
    }
});



function download()
{
    var subreddit = $("#subreddit").val();
    //&sort=top&t=all 
    //$.ajaxSetup({"async": false});
    var loadingText = $('#loadingText');
	var aTraiter = limit;
	var traite = 0;
	loadingText.text('loading...'+ Math.round(traite / aTraiter * 100) + '%');
    $.getJSON("http://www.reddit.com/r/" + subreddit + "/" + sort + ".json?jsonp=?&limit=" + limit + "&t=" + time, function(data)
    {
		
		var loadingText = $('#loadingText');
        IDs = [];
        orders = new Array(data.data.children.length);
        currentSong = 0;
        TITLEs = new Array(data.data.children.length);
        //loadingText.css('display', 'inline-block');
        var position = 1;
		loadingText.text('loading...'+ Math.round(traite / aTraiter * 100) + '%');
        $.each(data.data.children, function(i, item)
        {
            document.title='loading...'+ Math.round(position / data.data.children.length * 100) + '%';
            var parser = document.createElement('a');
            parser.href = item.data.url;
            if(item.data.downs >= item.data.ups)
            {
                return true;
            }
            if (parser.hostname === "www.youtube.com" || parser.hostname === "youtu.be")
            {
                try
                {
					if(parser.hostname === "www.youtube.com"){
						var ID = $("<textarea />").html(decodeURIComponent(parser.href)).text().match(/v\=.{11}/)[0].replace(/v\=/, "");
					}
					else{
						var ID = $("<textarea />").html(decodeURIComponent(parser.href)).text().match(/\/.{11}$/)[0].replace(/\//, "");
					}

                    $.getJSON("https://gdata.youtube.com/feeds/api/videos/" + ID + "?alt=json", /*{async: false},*/ function(doto)
                    {
						var loadingText = $('#loadingText');
						traite++;
						loadingText.text('loading...'+ Math.round(traite / aTraiter * 100) + '%');
                        var ID2 = doto.entry.link[0].href.match(/v\=.{11}/)[0].replace(/v\=/, "");
                        TITLEs[ID2] = doto.entry.title.$t;
                        TYPEs[ID2] = "yt";
                    });
                    IDs.push(ID);
                }
                catch (ex)
                {
                    console.log("HAS NO YOUTUBE URL: " + $("<textarea />").html(decodeURIComponent(parser.href)).text());
                }
            }
            else if (parser.hostname === "soundcloud.com")
            {
                $.getJSON("https://api.soundcloud.com/resolve.json?url=" + parser.href + "&client_id=bbc61dafe8680da53b475f005cd60459", /*{async: false},*/ function(doto)
                {

					var loadingText = $('#loadingText');
					traite++;
					loadingText.text('loading...'+ Math.round(traite / aTraiter * 100) + '%');
                    TITLEs[doto.uri] = doto.title;
                    IDs.push(doto.uri);
                    TYPEs[doto.uri] = "sc";
                });
            }
            position++;
        });
		
		var loadingText = $('#loadingText');
		loadingText.text('loading...'+ Math.round(traite / aTraiter * 100) + '%');
        //loadingText.css('display', 'none');
		
        setCurrent(currentSong);
        height = $('body').height() - $('#subreddit').height();
    });
}

function next()
{
    if (currentSong < IDs.length - 1)
    {
        currentSong++;
        setCurrent(currentSong);
    }
}

function prev()
{
    if (currentSong > 0)
    {
        currentSong--;
        setCurrent(currentSong);

    }
}

function setCurrent(_index)
{
    // create youtube player
    if (TYPEs[IDs[_index]] === "sc")
    {
        global.innerHTML = '<iframe id="sc-widget" scrolling="no" src="https://w.soundcloud.com/player/?url=' + IDs[_index] + '"></iframe>';
        var iframeElement = document.querySelector('#sc-widget');
        var widget = SC.Widget(iframeElement);
        widget.bind(SC.Widget.Events.READY, function()
        {
            widget.play();
			widget.getCurrentSound(function(son){
				TITLEs[son.uri] = son.title;
				window.document.title = '[' + (_index + 1) + '/' + IDs.length + '] ' + TITLEs[son.uri];
				
			});

        });
        widget.bind(SC.Widget.Events.FINISH, function()
        {
            next();
        });
        if (timette !== null)
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
			var vid_data = player.getVideoData();
			TITLEs[vid_data.video_id] = vid_data.title;
            window.document.title = '[' + (_index + 1) + '/' + IDs.length + '] ' + TITLEs[vid_data.video_id];
            player.addEventListener('onStateChange', function(event)
            {
                if (event.data === 0)
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
        if (timette !== null)
        {
            clearTimeout(timette);
        }
        timette = window.setTimeout(function()
        {
            var state = player.getPlayerState();
            window.document.title = '[' + (_index + 1) + '/' + IDs.length + '] ' + TITLEs[IDs[_index]];
            if (state === -1)
            {
                next();
            }
        }, 5000);
    }
    var title = '[' + (_index + 1) + '/' + IDs.length + '] ';
    window.document.title = title;

}




document.onkeydown = checkKey;
document.onclick = closeMenu;
$('#group').on('change', notherSort);
$('#time').on('change', notherTime);
$('#reachNum').on('change', beyondTheLimit);
$('#options').on('click', toggleOptions);
$("#subreddit").on("input", intellisense);
$("body").on("click", ".i_element", peuplerSub);
$("#subreddit").on("focus", intellisense);
var Options = $('#optionBox');
var OptionsButton = $('#options');
Options.css('left', OptionsButton.position().left);
Options.css('top', OptionsButton.position().top + OptionsButton.height() + 8);

function intellisense(e){
	$.getJSON("https://www.reddit.com/subreddits/search.json?q=" + e.target.value + "&limit=8", function(rep){
		supprimerIntellisense();
		var divIntellisense = $('<div id="intellisense"></div>');
		if(rep.data && rep.data.children.length > 0){
			$("#intelliWrapper").append(divIntellisense);
			for (var i = 0, len = rep.data.children.length; i < len; i++) {
				divIntellisense.append('<div class="i_element">' + rep.data.children[i].data.display_name + '</div>');
			}
		}

	});
}
function peuplerSub(e){
	$("#subreddit").val(e.target.innerHTML);
	supprimerIntellisense();
	
}

function supprimerIntellisense(){
	$("#intellisense").remove();
}

function notherTime(e){
	time = e.target.value;
}

function notherSort(e)
{
    sort = e.target.value;
}

function beyondTheLimit(e)
{
    limit = e.target.value;
}

function closeMenu(e)
{
    if ($('#optionBox').css('display') === 'block' && (e.target.nodeName === 'BODY' || (e.target.id !== 'options' && e.target.type === 'button') || e.target.id === 'subreddit'))
    {
        closeOptions();
    }
	if($("#intellisense").length && !(e.target.class == "i_element" || e.target.id == "subreddit")){
		supprimerIntellisense();
	}
}


function toggleOptions()
{
    if ($('#optionBox').css('display') === 'block')
    {
        closeOptions();
    }
    else
    {
        openOptions();
    }
}

function closeOptions()
{
    $('#optionBox').css('display', 'none');

}

function openOptions()
{
    var Options = $('#optionBox');
    Options.css('display', 'block');


}

function checkKey(e)
{
    e = e || window.event;
    if (e.keyCode === 37)
    {
        prev();
    }
    else if (e.keyCode === 39)
    {
        next();
    }
    else
    {
        $('#subreddit').focus();
    }
}