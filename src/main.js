// UTILITIES
import $ from 'jquery';
import './css/bootstrap.min.css';
import './css/styles.css';
import {Howl} from 'howler';
import {DrumKit} from './js/drumKit.js';

// MAIN LOGIC
// import { Class } from './js/class.js';

const drumKit = new DrumKit(1);

const kick = new Howl({
  src: [drumKit.kick]
});

// USER INTERFACE
$(document).ready(function(){
  $('#noAge').click(() => {
    kick.play();
  });
  $('#up').click(() => {
    kick.rate(kick.rate() + .5);
  });
  $('#down').click(() => {
    kick.rate(kick.rate() - .5);
  });
});
