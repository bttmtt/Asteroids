function Sound(src, maxStreams = 1, vol = 1.0, music = false) {
    this.streams = [];
    for (var i = 0; i < maxStreams; i++) {
        this.streams.push(new Audio(src));
        this.streams[i].volume = vol;
    }

    this.streamNum = 0;
    this.play = function () {
        if (soundOn || music) {
            this.streamNum = (this.streamNum + 1) % maxStreams;
            this.streams[this.streamNum].play();
        }
    }

    this.stop = function () {
        this.streams[this.streamNum].pause();
        this.streams[this.streamNum].currentTime = 0;
    }
}

function Music(srcLow, srcHigh) {
    this.soundLow = new Sound(srcLow, 1, 0.5, true);
    this.soundHigh = new Sound(srcHigh, 1, 0.5, true);
    this.low = true;
    this.tempo = 1; // seconds per beat
    this.beatTime = 0; // frames left until the next beat

    this.play = function () {
        if (musicOn) {
            if (this.low) {
                this.soundLow.play();
            } else {
                this.soundHigh.play();
            }
            this.low = !this.low;
        }
    }

    this.tick = function () {
        if (this.beatTime == 0) {
            this.play();
            this.beatTime = Math.ceil(this.tempo * FPS);
        } else {
            this.beatTime--;
        }
    }

    this.setTempo = function (n) {
        this.tempo = (n < 20) ? (1.0 - n / 80 * 3) : (0.25);
    }
}

function switchAudioOnOff() {
    soundOn = !soundOn;
    musicOn = !musicOn;

    if (soundOn) {
        document.getElementById("soundOnIcon").style.display = "block";
        document.getElementById("soundOffIcon").style.display = "none";
    } else {
        document.getElementById("soundOnIcon").style.display = "none";
        document.getElementById("soundOffIcon").style.display = "block";
    }
}