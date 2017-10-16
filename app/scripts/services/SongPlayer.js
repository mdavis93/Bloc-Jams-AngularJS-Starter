(function() {
  function SongPlayer($rootScope, Fixtures) {
    var SongPlayer = {};

    /**
    * @desc Album object containing all album details
    * @type {Object}
    **/
    var currentAlbum = Fixtures.getAlbum();

    /**
    * @desc Buzz object audio file
    * @type {Object}
    **/
    var currentBuzzObject = null;

    /**
    * @function setSong
    * @desc Stops currently playing song and loads new audio file as currentBuzzObject
    * @param {Object} song
    **/
    var setSong = function(song) {
      if (currentBuzzObject) {
        currentBuzzObject.stop();
        SongPlayer.currentSong.playing = null;
      }

      currentBuzzObject = new buzz.sound(song.audioUrl, {
        formats: ['mp3'],
        preload: true
      });

      /**
      * @event timeupdate
      * @desc Custom event to update the current location in the song's timeline
      *
      **/
      currentBuzzObject.bind('timeupdate', function() {
        $rootScope.$apply(function() {
          SongPlayer.currentTime = currentBuzzObject.getTime();

          // Check to see if we've reached the end of the song
          if (SongPlayer.currentTime == SongPlayer.currentSong.duration) {
            // If so, play the next song
            SongPlayer.next();
          }
        });
      });

      /**
      * @event volumechange
      * @desc Custom event to update the volume level
      **/
      currentBuzzObject.bind('volumechange', function() {
        $rootScope.$apply(function() {
          SongPlayer.volume = currentBuzzObject.getVolume();
        });
      });

      /**
      * @desc Active song object from list of songs
      * @type {Object}
      **/
      SongPlayer.currentSong = song;
    };

    /**
    * @function playSong
    * @desc Plays the currently selected song, and marks it as 'playing'
    * @param {Object} song
    **/
    var playSong = function(song) {
      currentBuzzObject.play();
      song.playing = true;
    };

    /**
    * @function stopSong
    * @desc Stop current song from playing
    * @param {Object} song
    **/
    var stopSong = function(song) {
      currentBuzzObject.stop();
      song.playing = null;
    }

    /**
    * @desc Get the index of the current song in the album
    * @param {Object} song
    **/
    var getSongIndex = function(song) {
      return currentAlbum.songs.indexOf(song);
    }

    /**
    * @desc Song object for the currently playing song
    * @type {Object}
    **/
    SongPlayer.currentSong = null;

    /**
    * @desc Current playback time (in seconds) of currently playing song
    * @type {Number}
    **/
    SongPlayer.currentTime = null;

    /**
    * @desc Current volume level percentage
    * @type {Number}
    **/
    SongPlayer.voume = null;

    /**
    * @desc boolean value reflecting if sound is currently muted
    * @type {boolean}
    **/
    SongPlayer.isMuted = false;

    /**
    * @function SongPlayer.play
    * @desc Play current or new song
    * @param {Object} song
    **/
    SongPlayer.play = function(song) {
      song = song || SongPlayer.currentSong;
      if (SongPlayer.currentSong !== song) {
        setSong(song);
        playSong(song);
      } else if ( SongPlayer.currentSong === song) {
          if (currentBuzzObject.isPaused()) {
            playSong(song);
          }
      }
    };

    /**
    * @function SongPlayer.pause
    * @desc Pauses the currently song
    * @param {Object} song
    **/
    SongPlayer.pause = function(song) {
      song = song || SongPlayer.currentSong;
      currentBuzzObject.pause();
      song.playing = false;
    };

    /**
    * @function SongPlayer.previous
    * @desc Play previous song in the album. If on the first song, stop playing.
    **/
    SongPlayer.previous = function() {
      var currentSongIndex = getSongIndex(SongPlayer.currentSong);
      currentSongIndex--;

      if (currentSongIndex < 0) {
        currentBuzzObject.stop();
        SongPlayer.currentSong.playing = null;
      } else {
        var song = currentAlbum.songs[currentSongIndex];
        setSong(song);
        playSong(song);
      }
    };

    /**
    * @function SongPlayer.next
    * @desc Play the next song in the album. If on the last song, stop playing.
    **/
    SongPlayer.next = function() {
      var currentSongIndex = getSongIndex(SongPlayer.currentSong);
      currentSongIndex++;

      if (currentSongIndex > currentAlbum.songs.length - 1) {
        currentBuzzObject.stop();
        SongPlayer.currentSong.playing = null;
      } else {
        var song = currentAlbum.songs[currentSongIndex];
        setSong(song);
        playSong(song);
      }
    };

    /**
    * @function setCurrentTime
    * @desc Set current time (in seconds) of currently playing song
    * @param {Number} time
    **/
    SongPlayer.setCurrentTime = function(time) {
      if (currentBuzzObject) {
        currentBuzzObject.setTime(time);
      }
    };

    /**
    * @function setVolume
    * @desc Set volume level
    * @param {Number} volume
    **/
    SongPlayer.setVolume = function(volume) {
      if (currentBuzzObject) {
        currentBuzzObject.setVolume(volume);
      }
    };

    /**
    * @function muteVolume
    * @desc Mute the volume if not already muted, Unmute if currently muted
    **/
    SongPlayer.toggleMute = function() {
      currentBuzzObject.toggleMute();
      SongPlayer.isMuted = !SongPlayer.isMuted;
    }

    return SongPlayer;
  }

  angular
    .module('blocJams')
    .factory('SongPlayer', ['$rootScope', 'Fixtures', SongPlayer]);

})();
