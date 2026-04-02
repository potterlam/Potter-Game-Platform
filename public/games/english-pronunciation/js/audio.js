/**
 * AudioManager – handles BGM, SFX, and TTS
 */
class AudioManager {
    constructor() {
        this.bgm          = document.getElementById('bgmAudio');
        this.clickSound    = document.getElementById('clickSound');
        this.correctSound  = document.getElementById('correctSound');
        this.wrongSound    = document.getElementById('wrongSound');
        this.isMuted  = false;
        this.bgmVol   = 0.03;
        this.sfxVol   = 0.15;

        if (this.bgm)          this.bgm.volume          = this.bgmVol;
        if (this.clickSound)   this.clickSound.volume    = this.sfxVol;
        if (this.correctSound) this.correctSound.volume  = this.sfxVol;
        if (this.wrongSound)   this.wrongSound.volume    = this.sfxVol;
    }

    playBGM()   { if (!this.isMuted && this.bgm) { this.bgm.currentTime = 0; this.bgm.play().catch(() => {}); } }
    stopBGM()   { if (this.bgm) this.bgm.pause(); }
    playClick() { this._sfx(this.clickSound); }
    playCorrect() { this._sfx(this.correctSound); }
    playWrong()   { this._sfx(this.wrongSound); }

    _sfx(el) {
        if (!this.isMuted && el) { el.currentTime = 0; el.play().catch(() => {}); }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.bgm) this.bgm.volume = this.isMuted ? 0 : this.bgmVol;
    }

    /** Set BGM volume from 0–1 */
    setBGMVolume(val) {
        this.bgmVol = Math.max(0, Math.min(1, val));
        if (this.bgm && !this.isMuted) this.bgm.volume = this.bgmVol;
    }

    /** Set SFX volume from 0–1 */
    setSFXVolume(val) {
        this.sfxVol = Math.max(0, Math.min(1, val));
        if (this.clickSound)   this.clickSound.volume   = this.sfxVol;
        if (this.correctSound) this.correctSound.volume  = this.sfxVol;
        if (this.wrongSound)   this.wrongSound.volume    = this.sfxVol;
    }

    /** Text-to-Speech helper */
    speak(text, lang = 'en-US', rate = 0.8) {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = lang;
        u.rate = rate;
        window.speechSynthesis.speak(u);
    }
}

window.audioManager = null;  // initialised after DOM ready
