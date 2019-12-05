// UTILITIES
import $ from 'jquery';
import 'bootstrap';
import './css/bootstrap.min.css';
import './css/styles.css';



// MAIN LOGIC
import { Sequencer } from './js/sequencer.js';
const sequencer = new Sequencer(1);
sequencer.loadSequence([[0,0],[0,8],[1,4],[1,12],[3,2],[6,10],[7,1],[7,3],[7,5],[7,7],[7,13],[8,14],[9,0]]);
sequencer.changeSwing(10);


// USER INTERFACE
$(document).ready(function(){

  //CHAOS
  function chaosCoords() {
    $( "#chaos" ).mousemove(function( event ) {
      let a = parseInt(event.pageX/6);
      let b = parseInt(event.pageY/10);
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

  sequencer.frontEndFunction = (currentStep) => {
    $('.glow').removeClass('glow');
    $(`#${currentStep}`).addClass('glow');
  };

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

  $('.chaos-slider').on('input', (event) => {
    const inputVolume = event.target.value;
    sequencer.changeVolumeChaosAndDoom(inputVolume);
  });

  $('.chaos-kill-button').click(() => {
    sequencer.doom.ping.feedback = 0;
    sequencer.doom.dub.feedback = 0;
    sequencer.doom.c.stop();
    sequencer.doom.d.stop();
    setTimeout(function () {
      sequencer.doom.ping.feedback = 0.6;
      sequencer.doom.dub.feedback = 0.3;
    }, 1000);
  });

  refreshSequence();
  chaosCoords();
  doomCoords();

});
