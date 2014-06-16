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
    $.ajaxSetup({"async": false});
    var loadingText = $('#loadingText');
    $.getJSON("http://www.reddit.com/r/" + subreddit + "/" + sort + ".json?jsonp=?&limit=" + limit + "&t=all", function(data)
    {
        IDs = [];
        orders = new Array(data.data.children.length);
        currentSong = 0;
        TITLEs = new Array(data.data.children.length);
        loadingText.css('display', 'inline-block');
        var position = 1;
        $.each(data.data.children, function(i, item)
        {
            document.title='loading...'+ Math.round(position / data.data.children.length * 100) + '%';
            loadingText.text('loading...'+ Math.round(position / data.data.children.length * 100) + '%');
            var parser = document.createElement('a');
            parser.href = item.data.url;
            console.log(parser.href);
            if(item.data.downs >= item.data.ups)
            {
                return true;
            }
            if (parser.hostname === "www.youtube.com")
            {
                try
                {
                    var ID = $("<textarea />").html(decodeURIComponent(parser.href)).text().match(/v\=.{11}/)[0].replace(/v\=/, "");

                    $.getJSON("https://gdata.youtube.com/feeds/api/videos/" + ID + "?alt=json", {async: false}, function(doto)
                    {
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
                $.getJSON("https://api.soundcloud.com/resolve.json?url=" + parser.href + "&client_id=bbc61dafe8680da53b475f005cd60459", {async: false}, function(doto)
                {

                    TITLEs[doto.uri] = doto.title;
                    IDs.push(doto.uri);
                    TYPEs[doto.uri] = "sc";
                });
            }
            position++;
        });
        loadingText.css('display', 'none');
        console.log(TYPEs);
        console.log(TITLEs);
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
    console.log(IDs[_index]);
    if (TYPEs[IDs[_index]] === "sc")
    {
        global.innerHTML = '<iframe id="sc-widget" scrolling="no" src="https://w.soundcloud.com/player/?url=' + IDs[_index] + '"></iframe>';
        var iframeElement = document.querySelector('#sc-widget');
        var widget = SC.Widget(iframeElement);
        widget.bind(SC.Widget.Events.READY, function()
        {
            widget.play();

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
            var state = player.k.playerState;
            console.log(">" + state);
            window.document.title = '[' + (_index + 1) + '/' + IDs.length + '] ' + TITLEs[IDs[_index]];
            if (state === -1)
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
document.onclick = closeMenu;
$('select').on('change', notherSort);
$('#reachNum').on('change', beyondTheLimit);
$('#options').on('click', toggleOptions);
var Options = $('#optionBox');
var OptionsButton = $('#options');
Options.css('left', OptionsButton.position().left);
Options.css('top', OptionsButton.position().top + OptionsButton.height() + 8);

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