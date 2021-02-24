function playOrPause(){
    if(!testTrack.paused && !testTrack.ended){
        testTrack.pause();
        playButton.style.backgroundImage = 'url(images/playButton.svg)';
        window.clearInterval(updateTime);
    }
    else{
        testTrack.play();
        playButton.style.backgroundImage = 'url(images/pauseButton.svg)';
        updateTime = setInterval(update,60);
    }
}

function muteOrUnmute(){
    if(testTrack.muted == true){
        testTrack.muted = false;
        muteButton.style.backgroundImage = 'url(images/speakerButton.svg)';
    }
    else{
        testTrack.muted = true;
        muteButton.style.backgroundImage = 'url(images/muteButton.svg)';
    }
}

function formatTime(fullTime){
    var minutes = parseInt(fullTime/60);
    var seconds = parseInt(fullTime%60);
    seconds = seconds.toString();
    var formatedTime = minutes + ':' + seconds.padStart(2, '0')
    return formatedTime
}

function update(){
    if(!testTrack.ended){
        var size = testTrack.currentTime*barSize/testTrack.duration
        currentTime.innerHTML   = formatTime(testTrack.currentTime);
        progressBar.style.width = size + "px";
    }
    else{
        currentTime.innerHTML = "0:00";
        playButton.style.backgroundImage = 'url(images/playButton.svg)';
        progressBar.style.width = "0px";
        window.clearInterval(updateTime);
    }
}

function clickedBar(e){
    if(!testTrack.ended){
        var mouseX = e.pageX - bar.offsetLeft;
        var newTime = mouseX*testTrack.duration / barSize;
        testTrack.currentTime = newTime;
        progressBar.style.width = mouseX + "px";
    }
    else{

    }
}

var testTrack      = document.getElementById('testTrack');

testTrack.onloadedmetadata = function(){
    duration.innerHTML = formatTime(testTrack.duration);
}

var playButton     = document.getElementById('playButton');
var muteButton     = document.getElementById('muteButton');

var duration       = document.getElementById('fullDuration');
var currentTime    = document.getElementById('currentTime');

var barSize        = 640;
var bar            = document.getElementById('defaultBar');
var progressBar    = document.getElementById('progressBar');

playButton.addEventListener('click', playOrPause, false);
// muteButton.addEventListener('click', muteOrUnmute, false);
bar.addEventListener('click', clickedBar, false);
