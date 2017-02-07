var music_list = null;
var music_player = new Audio();
var play_src = '/static/icons/play_1.png';
var pause_src = '/static/icons/pause_1.png';
var queue_src = '/static/icons/queue_0.png';
var stop_src = '/static/icons/stop_0.png';
var play = false;
var queue = [];
var index = 0;
var current = null;
var next = "";
var len = 0;

function createList(){
    $("#songs tbody > tr").remove();
    for(var i in music_list) {
        path = '/' + music_list[i].path + '/' + music_list[i].name;
        row = '';
        row += '<tr>';
        row += '<td>' + music_list[i].name.substring(0, music_list[i].name.length - 4) + '</td>';
        row += '<td> <img id="img_play" src=\"' + play_src + '\" onclick="playSong(\'' + path + '\')"/> </td>';
        row += '<td> <img id="img_pause" src=\"' + pause_src + '\" onclick="pauseSong(\'' + path + '\')"/> </td>';
        row += '<td> <img id="img_stop" src=\"' + stop_src + '\" onclick="stopSong()"/> </td>';
        row += '<td> <img id="img_next" src=\"' + queue_src + '\" onclick="nextSong()"/> </td>';
        row += '</tr>';
        $("#songs > tbody:last").append(row);
    }
}

function getIndex(song){
    for(var i in music_list){
        path = '/' + music_list[i].path + '/' + music_list[i].name;
        if (song == path) {
            return i;
        }
    }
    return 0;
}

function nextSong(){
    song = current;
    index = (getIndex(song) + 1) % len;
    next = '/' + music_list[index].path + '/' + music_list[index].name;
    playSong(next);
}

function playSong(song){
    if (!music_player.paused){
        music_player.src = song;
        music_player.load();
        index = getIndex(song);
    }
    current = song;
    var h2 = document.getElementById('currently_playing');
    h2.innerText = music_list[index].name;
    make_queue();
    music_player.play();
}

function stopSong(){
    music_player.pause();
    music_player.currentTime = 0;
}

function pauseSong(song){
    music_player.pause();
}

function make_queue() {
    var h2 = document.getElementById('a1').children[0];
    var a1 = document.getElementById('a1');
    while (a1.firstChild) {
        a1.removeChild(a1.firstChild);
    }
    a1.appendChild(h2);
    for (m in music_list) {
        var sibling = document.createElement('p');
        sibling.innerText = music_list[m].name;
        h2.parentNode.insertBefore(sibling, h2.nextSibling);
    }
}

function loadList(){
    $.getJSON("/list", function(list){
        music_list = list;
        music_player.addEventListener('ended', function() {
            index++;
            nextsong = '/' + music_list[index].path + '/' + music_list[index].name;
            var h2 = document.getElementById('currently_playing');
            h2.innerText = nextsong;
            music_player.src = nextsong;
            music_player.load();
            music_player.play();
            if (index == (len - 1)) {
                index = 0;
            }
        }, false);
    len = music_list.length;
    createList();
    });
}

$(document).ready(function(){
    loadList();

});

