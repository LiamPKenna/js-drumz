import Pizzicato from pizzicato;

export class Synth {

  sawtoothWave() {
    new Pizzicato.Sound({
        source: 'wave',
        options: {
            type: 'sawtooth'
        }
    });

    playMonk() {
      let monk = new Pizzicato.Sound('./../mp3/monk.mp3');

    }
  }



}
