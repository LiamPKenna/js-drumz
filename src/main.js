// UTILITIES
import $ from 'jquery';
import 'bootstrap';
import './css/bootstrap.min.css';
import './css/styles.css';
import arts from './js/art.js';
import keyMap from './js/keyMap.js';



// MAIN LOGIC
import { Sequencer } from './js/sequencer.js';
const sequencer = new Sequencer(1);
sequencer.loadSequence([[0,0],[0,6],[1,4],[1,12],[2,15],[3,14],[4,13],[5,4],[5,12],[6,4],[7,0],[7,4],[7,8],[7,12],[8,14],[9,0]]);
sequencer.aOrB = 1;
sequencer.loadSequence([[0,10],[4,2],[4,6],[4,12],[7,2],[7,6],[7,10],[7,14],[8,0],[8,12]]);
sequencer.aOrB = 0;
sequencer.changeSwing(10);


// USER INTERFACE
$(document).ready(function(){

  //add ascii art
  $('#hankhead').html(arts.hankhead);
  $('#hank').html(arts.hank);
  $('#doomhead').html(arts.doomHead);
  $('#doom').html(arts.doom);
  $('#chaos').html(arts.chaos);
  $('#chaoshead').html(arts.chaosHead);

  //CHAOS
  function chaosCoords() {
    $( "#chaos" ).mousemove(function( event ) {
      let a = parseInt(event.pageX/5);
      let b = parseInt(event.pageY/9);
      sequencer.chaos.changeNote(a,b);
    });
  }

  $('#chaos').mousedown(() => {
    sequencer.chaos.a.play();
    sequencer.chaos.b.play();
  });
  $('#chaos').dblclick(() => {
    sequencer.chaos.a.play();
    sequencer.chaos.b.play();
  });

  $('#chaos').mouseup(() => {
    sequencer.chaos.a.stop();
    sequencer.chaos.b.stop();
  });

  $('.chaos-mute-button').click(() => {
    sequencer.chaos.a.stop();
    sequencer.chaos.b.stop();
  });

  //DOOM
  function doomCoords() {
    $("#doom").mousemove(function( event ) {
      let c = parseInt(event.pageX/4);
      let d = parseInt(event.pageY/5);
      sequencer.doom.changeNote(c,d);
    });
  }

  $('#doom').mousedown(() => {
    sequencer.doom.c.play();
    sequencer.doom.d.play();
  });
  $('#doom').dblclick(() => {
    sequencer.doom.c.play();
    sequencer.doom.d.play();
  });
  $('#doom').mouseup(() => {
    sequencer.doom.c.stop();
    sequencer.doom.d.stop();
  });

  //HANK
  function hankCoords() {
    $("#hank").mousemove(function( event ) {
      let f = parseInt((event.pageY-event.pageX)/8);
      let e = parseInt((event.pageY-event.pageX)/4);
      sequencer.hank.changeNote(e,f);
    });
  }
  $('#hank').mousedown(() => {
    sequencer.hank.e.play();
    sequencer.hank.f.play();
  });
  $('#hank').dblclick(() => {
    sequencer.hank.e.play();
    sequencer.hank.f.play();
  });
  $('#hank').mouseup(() => {
    sequencer.hank.e.stop();
    sequencer.hank.f.stop();
  });

  //Refresh Functions
  const refreshSequence = () => {
    const currentSequence = sequencer.sequence[sequencer.selectedTrack][sequencer.aOrB];
    currentSequence.forEach((beat, index) => {
      const beatButton = $(`#${index}`);
      if (beat) {
        beatButton.addClass('on');
      } else {
        beatButton.removeClass('on');
      }
    });
  };

  const refreshGhost = () => {
    const currentStep = parseInt(ghostStep.text())-1;
    const currentNote = sequencer.getGhost(currentStep);
    $('.ghost-glow').removeClass('ghost-glow');
    $(`#g-${currentNote}`).addClass('ghost-glow');
  };

  //Logic triggered ui function
  sequencer.frontEndFunction = (currentStep) => {
    $('.glow').removeClass('glow');
    $(`#${currentStep}`).addClass('glow');
    $('.key-press').removeClass('key-press');
    if (sequencer.sequence[10][sequencer.aOrB][currentStep]) {
      const stepNote = sequencer.sequence[10][sequencer.aOrB][currentStep];
      const note = (sequencer.ghostOctaveDown) ? stepNote : stepNote - 12;
      if (note > 0 && note < 14) {
        $(`#g-${note}`).addClass('key-press');
      }
    }
  };

  //Drum/Sequencer event listeners
  $('#start-stop-button').click(() => {
    sequencer.togglePlay();
  });

  $('.sequence-button').on('click', (event) => {
    sequencer.toggleStepOnOff(event.target.id);
    refreshSequence();
  });

  $('#tempo-input').change((event) => {
    sequencer.changeTempo(event.target.value);
  });

  $('.instrument-button').click((event) => {
    sequencer.selectTrack(event.target.name);
    $('.instrument-glow').removeClass('instrument-glow');
    $(event.target).addClass('instrument-glow');
    refreshSequence();
  });

  $('.volume-slider').on('input', (event) => {
    const inputVolume = event.target.value;
    for (let i = 0; i < 10; i++) {
      const faderVolume = $(`.volume[name='${i}']`).val();
      sequencer.changeVolumeMaster(i, faderVolume, inputVolume);
    }
  });

  $('.volume').on('input', (event) => {
    const track = event.target.name;
    const volume = event.target.value;
    sequencer.changeVolume(track, volume);
  });

  $('.pitch-slider').on('input', (event) => {
    const track = event.target.name;
    const pitch = event.target.value;
    sequencer.changePitch(track, pitch);
  });

  $('#dropdownMenuButton').change(() => {
    const kitSelected = $('#dropdownMenuButton option:selected').val();
    sequencer.playing = false;
    sequencer.selectKit(kitSelected);
    sequencer.drumKit.drums.forEach(drum => drum.play('go'));
    for (let i = 0; i < 10; i++) {
      const volume = $(`.volume[name='${i}']`).val();
      const pitch = $(`.pitch-slider[name='${i}']`).val();
      sequencer.changeVolume(i, volume);
      sequencer.changePitch(i, pitch);
    }
  });

  $('#swing-slider').on('input', () => {
    const swing = event.target.value;
    sequencer.changeSwing(swing);
  });

  $('.a-b-buttons').click((event) => {
    $('.a-b-glow').removeClass('a-b-glow');
    sequencer.changeAB(event.target.name);
    $(event.target).addClass('a-b-glow');
    refreshSequence();
    refreshGhost();
  });

  //Ghost event listeners
  const ghostStep = $('.edit-step-input');

  $('.key-wrapper button').click((event) => {
    const step = parseInt(ghostStep.text())-1;
    const noteInput = parseInt(event.target.name);
    const note = (sequencer.ghostOctaveDown) ? noteInput : noteInput + 12;
    if (!sequencer.playing) sequencer.ghost.oOoO(note);
    sequencer.toggleGhostNote([step,note]);
    refreshGhost();
  });

  $('#g-0').click(() => {
    const step = parseInt(ghostStep.text())-1;
    sequencer.toggleGhostNote([step,0]);
    refreshGhost();
  });

  $('.ghost-back-button').click(() => {
    const oldStep = parseInt(ghostStep.text());
    const newStep = (oldStep === 1) ? 16 : oldStep - 1;
    ghostStep.text(newStep);
    refreshGhost();
  });

  $('.ghost-forward-button').click(() => {
    const oldStep = parseInt(ghostStep.text());
    const newStep = (oldStep === 16) ? 1 : oldStep + 1;
    ghostStep.text(newStep);
    refreshGhost();
  });

  $('.ghost-octave-button').click((event) => {
    $('.ghost-octave-glow').removeClass('ghost-octave-glow');
    const octaveLow = (event.target.name === 'low');
    sequencer.ghostOctaveDown = octaveLow;
    $(event.target).addClass('ghost-octave-glow');
  });

  $('.ghost-slider').on('input', (event) => {
    sequencer.ghost.changeVolume(event.target.value);
  });

  $('.dub-slider').on('input', (event) => {
    const slider = event.target.id;
    const value = event.target.value;
    sequencer.ghost.changeDub(slider, value);
  });

  $('.mix-slider').on('input', (event) => {
    const slider = event.target.id;
    const value = event.target.value;
    sequencer.ghost.changePanOrGrime(slider, value);
  });

  //MangleMachine event listeners
  $('.chaos-slider').on('input', (event) => {
    const inputVolume = event.target.value;
    sequencer.changeVolumeChaosAndDoom(inputVolume);
  });

  $('.chaos-kill-button').click(() => {
    sequencer.doom.ping.feedback = 0;
    sequencer.doom.dub.feedback = 0;
    sequencer.doom.c.stop();
    sequencer.doom.d.stop();
    sequencer.chaos.a.stop();
    sequencer.chaos.b.stop();
    sequencer.hank.dub.feedback = 0;
    sequencer.hank.e.stop();
    sequencer.hank.f.stop();
    setTimeout(function () {
      sequencer.doom.ping.feedback = 0.6;
      sequencer.doom.dub.feedback = 0.3;
      sequencer.hank.dub.feedback = 0.3;
    }, 1000);
  });

  //Keydown listeners to allow for playing drums, ghost, and start/stop
  $('body').keydown((event) => {
    event.preventDefault();
    const key = event.which;
    if (key === 32) {
      sequencer.togglePlay();
    } else if (keyMap.drumMap[key]) {
      const drum = keyMap.drumMap[key];
      sequencer.drumKit.drums[drum].play('go');
    } else if (keyMap.ghostMap[key]) {
      const note = keyMap.ghostMap[key];
      sequencer.ghost.oOoO(note);
      $(`#g-${note}`).addClass('key-press');
      setTimeout(() => {
        $(`#g-${note}`).removeClass('key-press');
      }, 100);
    }
  });

  refreshSequence();
  chaosCoords();
  doomCoords();
  hankCoords();

});
