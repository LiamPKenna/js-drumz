// UTILITIES
import $ from 'jquery';
import 'bootstrap';
import './css/bootstrap.min.css';
import './css/styles.css';



// MAIN LOGIC
import { Sequencer } from './js/sequencer.js';
const sequencer = new Sequencer(1);
sequencer.loadSequence([[0,0],[0,8],[1,4],[1,12],[3,2],[6,10],[7,1],[7,3],[7,5],[7,7],[7,13],[8,14],[9,0]]);
// sequencer.loadGhostSequence([[0,1],[5,13],[7,20]]);
sequencer.changeSwing(10);


// USER INTERFACE
$(document).ready(function(){



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
  $('#chaos').mouseup(() => {
    sequencer.chaos.a.stop();
    sequencer.chaos.b.stop();
  });

  $('.chaos-mute-button').click(() => {
    sequencer.chaos.a.stop();
    sequencer.chaos.b.stop();
  });

  function doomCoords() {
    $( "#doom" ).mousemove(function( event ) {
      let a = parseInt(event.pageX/6);
      let b = parseInt(event.pageY/10);

      sequencer.doom.changeNote(a,b);
    });
  }


  // $('#doom').mousedown(() => {
  //   sequencer.doom.a.play();
  //   sequencer.doom.b.play();
  // });
  // $('#doom').mouseup(() => {
  //   sequencer.doom.a.stop();
  //   sequencer.doom.b.stop();
  // });



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

  $('.volume').change((event) => {
    const track = event.target.name;
    const volume = event.target.value;
    sequencer.changeVolume(track, volume);
  });

  $('.pitch-slider').change((event) => {
    const track = event.target.name;
    const pitch = event.target.value;
    sequencer.changePitch(track, pitch);
  });

  $('#dropdownMenuButton').change(() => {
    const kitSelected = $('#dropdownMenuButton option:selected').val();
    sequencer.selectKit(kitSelected);
  });

  $('#swing-slider').change(() => {
    const swing = event.target.value;
    sequencer.changeSwing(swing);
  });

  $('.a-b-buttons').click((event) => {
    $('.a-b-glow').removeClass('a-b-glow');
    sequencer.changeAB(event.target.name);
    $(event.target).addClass('a-b-glow');
    refreshSequence();
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


  refreshSequence();
  chaosCoords();


});
