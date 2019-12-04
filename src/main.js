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

  refreshSequence();

});
