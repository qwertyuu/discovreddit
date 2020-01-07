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

var liSelected;
var li;
var currentAJAX;
$('#subreddit').keyup(function(e) {
    if (e.keyCode === 13) {
		if($("#intellisense .i_element.i_element_hover").length){
			$("#intellisense .i_element.i_element_hover").click();
		}
		else{
			$('#go').click();
			$('#subreddit').blur();
			
		}
    }
	else if(e.keyCode === 40 || e.keyCode === 38){
		//selectionnerIntellisense();
	}
	else{
		intellisense(e);
	}
	//console.log(e.keyCode);
});

$("#subreddit").keydown(function(e){
	li = $('.i_element');
	//console.log(e.keyCode);
	if(e.keyCode === 40){
		descendreIntellisense();
	}
	else if(e.keyCode === 38){
		monterIntellisense();
	}

});

function descendreIntellisense(){
	if(liSelected){
		liSelected.removeClass('i_element_hover');
		next = liSelected.next();
		if(next.length > 0){
			liSelected = next.addClass('i_element_hover');
		}else{
			liSelected = li.eq(0).addClass('i_element_hover');
		}
    }
	else{
        liSelected = li.eq(0).addClass('i_element_hover');
    }
}

function monterIntellisense(){
	if(liSelected){
		liSelected.removeClass('i_element_hover');
		next = liSelected.prev();
		if(next.length > 0){
			liSelected = next.addClass('i_element_hover');
		}else{
			liSelected = li.last().addClass('i_element_hover');
		}
	}
	else{
		liSelected = li.last().addClass('i_element_hover');
	}
	
}


function download()
{
    var subreddit = $("#subreddit").val();
    //&sort=top&t=all 
    //$.ajaxSetup({"async": false});
    var loadingText = $('#loadingText');
	var aTraiter = limit;
	var traite = 0;
	loadingText.text('loading...'+ Math.round(traite / aTraiter * 100) + '%');
    $.getJSON("https://www.reddit.com/r/" + subreddit + "/" + sort + ".json?jsonp=?&limit=" + limit + "&t=" + time, function(data)
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
						var ID = $("<textarea />").html(decodeURIComponent(parser.href)).text().match(/\.be\/.{11}/)[0].slice(4);
					}
					TYPEs[ID] = "yt";
					var loadingText = $('#loadingText');
					traite++;
					loadingText.text('loading...'+ Math.round(traite / aTraiter * 100) + '%');
                    IDs.push(ID);
                }
                catch (ex)
                {
                    console.log("HAS NO YOUTUBE URL: " + $("<textarea />").html(decodeURIComponent(parser.href)).text());
                }
            }
            else if (parser.hostname === "soundcloud.com")
            {
				IDs.push(parser.href);
				var loadingText = $('#loadingText');
				traite++;
				loadingText.text('loading...'+ Math.round(traite / aTraiter * 100) + '%');
				TYPEs[parser.href] = "sc";

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
	if(currentAJAX){
		currentAJAX.abort();
	}
    if (currentSong < IDs.length - 1)
    {
        currentSong++;
        setCurrent(currentSong);
    }
}

function prev()
{	
	if(currentAJAX){
		currentAJAX.abort();
	}
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
		currentAJAX = $.getJSON("https://api.soundcloud.com/resolve.json?url=" + IDs[_index] + "&client_id=bbc61dafe8680da53b475f005cd60459", /*{async: false},*/ function(doto)
		{
			
			TITLEs[doto.uri] = doto.title;
			global.innerHTML = '<iframe id="sc-widget" frameBorder="0" scrolling="no" src="https://w.soundcloud.com/player/?url=' + doto.uri + '"></iframe>';
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
		});
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
        player = new YT.Player('youtubeROX',
                {
                    videoId: IDs[_index],
                    events:
                            {
                                'onReady': onReady
                            }
                });
		player.addEventListener('onStateChange', function(event)
        {
                if (event.data === 0)
                {
                    next();
                }
        });
        if (timette !== null)
        {
            clearTimeout(timette);
        }

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
$("body").on("click", ".i_element", peuplerSub);
$("#subreddit").on("focus", intellisense);
var Options = $('#optionBox');
var OptionsButton = $('#options');
Options.css('left', OptionsButton.position().left);
Options.css('top', OptionsButton.position().top + OptionsButton.height() + 8);

var i_save = {};
function intellisense(e){
	
	if(e.target.value == "" || e.target.value == undefined || e.target.value == $('#subreddit').data('oldVal') ){
		if(!e.target.value){
			$('#subreddit').data('oldVal', "");
		}
		else{
			$('#subreddit').data('oldVal', e.target.value);
			
		}
		return;
	}
	if(e.target.value in i_save){
		creerIntellisense(i_save[e.target.value].rep);
	}
	else{
		//i_save[e.target.value] = {};
		$.ajax({
			url: "https://www.reddit.com/subreddits/search.json",
			method: "GET",
			data:{q:e.target.value, limit:8 },
			dataType: "json",
			success:function(rep){
				creerIntellisense(rep, this.url.match(/\?q.+&/)[0].substring(3).slice(0, -1));
			}
		});
	}
	$('#subreddit').data('oldVal', e.target.value);

}

function creerIntellisense(rep, save=false){
	supprimerIntellisense();
	var divIntellisense = $('<div id="intellisense"></div>');
	if(save){
		i_save[save] = {rep:{data:{children:[] } } };
	}
	if(rep.data && rep.data.children.length > 0){
		$("#intelliWrapper").append(divIntellisense);
		for (var i = 0, len = rep.data.children.length; i < len; i++) {
			if(save){
				i_save[save].rep.data.children.push({data:{display_name: rep.data.children[i].data.display_name } });
			}
			divIntellisense.append('<div class="i_element">' + rep.data.children[i].data.display_name + '</div>');
		}
	}
}

function peuplerSub(e){
	$("#subreddit").val(e.target.innerHTML);
	supprimerIntellisense();
	$('#go').click();
	$('#subreddit').blur();
	
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
