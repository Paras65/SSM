import React, { useState, useEffect, useRef } from 'react';
import { SCHOOL_SONGS, type SchoolSong } from '../../data/songsData';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Music,
  Disc,
  Copy,
  Check,
  Sparkles,
  Drum,
  BookOpen,
  Share2
} from 'lucide-react';

export const SongPlayer: React.FC = () => {
  const [selectedSong, setSelectedSong] = useState<SchoolSong>(SCHOOL_SONGS[0]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'huge'>('large');
  const [copied, setCopied] = useState<boolean>(false);
  const [tempo, setTempo] = useState<number>(selectedSong.bpm);

  // Audio Context & Synth references
  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<any>(null);
  const synthVoiceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Filtered song list
  const filteredSongs = selectedCategory === 'ALL'
    ? SCHOOL_SONGS
    : SCHOOL_SONGS.filter(s => s.category === selectedCategory);

  // When selected song changes, reset audio
  useEffect(() => {
    stopPlayback();
    setTempo(selectedSong.bpm);
  }, [selectedSong]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopPlayback();
    };
  }, []);

  // Playback engine
  const stopPlayback = () => {
    setIsPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      try {
        audioCtxRef.current.close();
      } catch (e) {}
      audioCtxRef.current = null;
    }
  };

  // Play Ghosh Drum Cadence (Web Audio API synth)
  const playGhoshDrums = () => {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;

    let beat = 0;
    const intervalMs = (60 / tempo) * 1000;

    const tick = () => {
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const now = ctx.currentTime;

      // Bass drum (Aanak) on beat 0 and 2
      if (beat % 2 === 0) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(110, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);
        gain.gain.setValueAtTime(0.8, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.22);
      }

      // Snare drum (Panav) rattle on beats
      const snareNoise = ctx.createBufferSource();
      const bufferSize = ctx.sampleRate * 0.08;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      snareNoise.buffer = buffer;
      const snareGain = ctx.createGain();
      snareGain.gain.setValueAtTime(beat % 2 === 1 ? 0.6 : 0.3, now);
      snareGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      snareNoise.connect(snareGain);
      snareGain.connect(ctx.destination);
      snareNoise.start(now);

      beat = (beat + 1) % 4;
    };

    tick();
    intervalRef.current = setInterval(tick, intervalMs);
    setIsPlaying(true);
  };

  // Play Melodic Tanpura/Harmonium Tone + Hindi Recitation
  const playSongMelody = () => {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;
      
      // Drone base (Sa - Pa chord in Indian Classical)
      const droneOsc1 = ctx.createOscillator();
      const droneOsc2 = ctx.createOscillator();
      const droneGain = ctx.createGain();

      droneOsc1.type = 'triangle';
      droneOsc1.frequency.setValueAtTime(130.81, ctx.currentTime); // C3 (Sa)

      droneOsc2.type = 'sine';
      droneOsc2.frequency.setValueAtTime(196.00, ctx.currentTime); // G3 (Pa)

      droneGain.gain.setValueAtTime(0.12, ctx.currentTime);
      droneOsc1.connect(droneGain);
      droneOsc2.connect(droneGain);
      droneGain.connect(ctx.destination);

      droneOsc1.start();
      droneOsc2.start();
    }

    // Recite lyrics using SpeechSynthesis if available
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(selectedSong.lyrics);
      utterance.lang = 'hi-IN';
      utterance.rate = 0.85; // Calmer devotional pace
      utterance.pitch = 1.0;

      // Try finding a Hindi voice
      const voices = window.speechSynthesis.getVoices();
      const hiVoice = voices.find(v => v.lang.includes('hi') || v.name.toLowerCase().includes('hindi'));
      if (hiVoice) utterance.voice = hiVoice;

      utterance.onend = () => {
        stopPlayback();
      };
      utterance.onerror = () => {
        stopPlayback();
      };

      synthVoiceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }

    setIsPlaying(true);
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      if (selectedSong.category === 'Ghosh Band') {
        playGhoshDrums();
      } else {
        playSongMelody();
      }
    }
  };

  const handleCopyLyrics = () => {
    navigator.clipboard.writeText(`${selectedSong.hindiTitle}\n\n${selectedSong.lyrics}\n\nभावार्थ:\n${selectedSong.meaning}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="songs" className="py-16 bg-gradient-to-b from-stone-50 via-amber-50/50 to-orange-50/40 border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-bold border border-orange-200 uppercase tracking-wider">
            <Music className="w-3.5 h-3.5 text-orange-600" />
            <span>विद्या भारती संगीत एवं घोष विभाग</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            दैनिक वंदना, राष्ट्रभक्ति गीत एवं घोष वादक
          </h2>
          <p className="text-sm text-stone-600">
            सरस्वती शिशु मंदिर में नित्य गाई जाने वाली पावन प्रार्थनाएं, देशभक्ति गीत एवं घोष संचलन का सस्वर अभ्यास।
          </p>
        </div>

        {/* Categories Bar */}
        <div className="flex justify-center flex-wrap gap-2 mb-8">
          {[
            { id: 'ALL', label: 'सभी गीत एवं घोष (All)' },
            { id: 'Prarthana', label: 'दैनिक वंदना (Prarthana)' },
            { id: 'Deshbhakti', label: 'राष्ट्रभक्ति गीत (Patriotic)' },
            { id: 'Ghosh Band', label: 'घोष संचलन (Ghosh Band)' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-orange-600 text-white shadow-sm ring-2 ring-orange-400'
                  : 'bg-white text-stone-700 hover:bg-orange-100/60 border border-stone-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Main 2-Column Interface: Playlist + Active Player & Lyrics */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left: Song Playlist (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-stone-200 shadow-sm p-4 space-y-3">
            <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider px-2 flex items-center justify-between">
              <span>गीत संग्रह ({filteredSongs.length})</span>
              <Disc className="w-3.5 h-3.5 text-orange-600 animate-spin-slow" />
            </h3>

            <div className="space-y-2">
              {filteredSongs.map(song => {
                const isCurrent = selectedSong.id === song.id;
                return (
                  <div
                    key={song.id}
                    onClick={() => setSelectedSong(song)}
                    className={`p-3.5 rounded-xl cursor-pointer transition-all border ${
                      isCurrent
                        ? 'bg-orange-50 border-orange-300 ring-2 ring-orange-500/20 shadow-xs'
                        : 'bg-white hover:bg-stone-50 border-stone-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        song.category === 'Prarthana'
                          ? 'bg-amber-100 text-amber-800'
                          : song.category === 'Deshbhakti'
                          ? 'bg-orange-100 text-orange-900'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {song.category}
                      </span>
                      <span className="text-[10px] font-mono text-stone-500">{song.bpm} BPM</span>
                    </div>

                    <h4 className={`text-sm font-bold mt-1.5 ${isCurrent ? 'text-orange-950' : 'text-stone-800'}`}>
                      {song.hindiTitle}
                    </h4>
                    <p className="text-[11px] text-stone-500 truncate mt-0.5">
                      रचनाकार: {song.composer}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Active Player & Lyrics (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-3xl border-2 border-orange-200 shadow-md overflow-hidden flex flex-col">
            
            {/* Player Banner & Controls */}
            <div className="bg-gradient-to-r from-orange-800 via-amber-700 to-orange-900 text-white p-6 relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/25 text-[11px] font-semibold text-amber-200 mb-2">
                    {selectedSong.category === 'Ghosh Band' ? <Drum className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                    <span>{selectedSong.category}</span>
                    <span>• {selectedSong.composer}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-amber-50">
                    {selectedSong.hindiTitle}
                  </h3>
                  <p className="text-xs text-orange-200 font-mono mt-0.5">
                    {selectedSong.title}
                  </p>
                </div>

                {/* Play/Pause Button & Visualizer */}
                <div className="flex items-center gap-4">
                  {/* Equalizer animation */}
                  {isPlaying && (
                    <div className="flex items-end gap-1 h-8 px-2">
                      <span className="w-1.5 bg-yellow-300 rounded-full animate-bounce h-4" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 bg-yellow-300 rounded-full animate-bounce h-8" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 bg-yellow-300 rounded-full animate-bounce h-5" style={{ animationDelay: '300ms' }} />
                      <span className="w-1.5 bg-yellow-300 rounded-full animate-bounce h-7" style={{ animationDelay: '450ms' }} />
                    </div>
                  )}

                  <button
                    onClick={handleTogglePlay}
                    className="w-13 h-13 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-orange-950 font-bold flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
                    title={isPlaying ? 'रोकें (Pause)' : 'आरंभ करें (Play)'}
                  >
                    {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
                  </button>

                  <button
                    onClick={stopPlayback}
                    className="p-2 text-amber-200 hover:text-white rounded-full hover:bg-black/20"
                    title="पुनः स्थापित (Reset)"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

              </div>

              {/* Player Status Hint */}
              <div className="mt-4 pt-3 border-t border-orange-700/60 flex flex-wrap items-center justify-between text-xs text-orange-100">
                <span className="flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-yellow-300" />
                  {selectedSong.category === 'Ghosh Band'
                    ? 'सिंथेसाइजर द्वारा घोष वाद्य ताल (आनक एवं पणव ड्रम बीट)'
                    : 'तानपुरा स्वर-लहरी एवं सस्वर हिंदी वाचन (Audio Recitation)'}
                </span>
                <span className="font-mono text-yellow-200 font-bold">
                  लय (Tempo): {tempo} BPM
                </span>
              </div>
            </div>

            {/* Lyrics Toolbar */}
            <div className="bg-amber-50/70 border-b border-amber-200 px-6 py-2.5 flex items-center justify-between text-xs text-stone-700">
              <div className="flex items-center gap-2">
                <span className="font-bold text-orange-950">अक्षर आकार (Font Size):</span>
                <button
                  onClick={() => setFontSize('normal')}
                  className={`px-2 py-0.5 rounded font-semibold ${fontSize === 'normal' ? 'bg-orange-600 text-white' : 'bg-white border border-stone-200'}`}
                >
                  सामान्य
                </button>
                <button
                  onClick={() => setFontSize('large')}
                  className={`px-2 py-0.5 rounded font-semibold ${fontSize === 'large' ? 'bg-orange-600 text-white' : 'bg-white border border-stone-200'}`}
                >
                  बड़ा
                </button>
                <button
                  onClick={() => setFontSize('huge')}
                  className={`px-2 py-0.5 rounded font-semibold ${fontSize === 'huge' ? 'bg-orange-600 text-white' : 'bg-white border border-stone-200'}`}
                >
                  विशाल
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyLyrics}
                  className="flex items-center gap-1 px-3 py-1 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg font-semibold text-stone-700 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5 text-stone-500" />}
                  <span>{copied ? 'कॉपी हुआ!' : 'गीत कॉपी करें'}</span>
                </button>
              </div>
            </div>

            {/* Lyrics Content Display */}
            <div className="p-6 sm:p-8 space-y-6">
              <div
                className={`font-serif text-stone-900 leading-loose whitespace-pre-line tracking-wide text-center sm:text-left bg-stone-50/70 p-6 rounded-2xl border border-stone-200 ${
                  fontSize === 'normal'
                    ? 'text-base'
                    : fontSize === 'large'
                    ? 'text-lg sm:text-xl font-medium'
                    : 'text-xl sm:text-2xl font-bold'
                }`}
              >
                {selectedSong.lyrics}
              </div>

              {/* Meaning / भावार्थ */}
              <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-950 uppercase tracking-wider mb-2">
                  <BookOpen className="w-4 h-4 text-orange-600" />
                  <span>भावार्थ एवं प्रेरणा (Significance & Essence)</span>
                </div>
                <p className="text-xs sm:text-sm text-amber-950 leading-relaxed">
                  {selectedSong.meaning}
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

