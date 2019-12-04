import P5 from 'p5';
import 'p5/lib/addons/p5.sound.js';

const runSynth = () => {

  const p5 = new P5();
  let carrier;
  let modulator;
  let analyzer;
  let modFreq;
  let modDepth;


  const radius = 200;
  let modMaxFreq = 100;
  let modMinFreq = 80;
  let modMaxDepth = 100;
  let modMinDepth = -100;



  const setup = () => {


    let cnv = p5.createCanvas(400, 200, p5.WEBGL);
    cnv.parent('chaos');
    p5.noFill();

    carrier = new P5.Oscillator('sine');
    carrier.amp(0);
    carrier.freq(100);
    carrier.start();


    modulator = new P5.Oscillator('triangle');
    modulator.disconnect();
    modulator.freq(5);
    modulator.amp(1);
    modulator.start();
    carrier.freq(modulator);

    analyzer = new P5.FFT();


    const toggleAudio = (cnv) => {

      p5.waveform = analyzer.waveform();
      cnv.mouseClicked(function() {
        modFreq = p5.map(p5.mouseY, p5.height, 0, modMinFreq, modMaxFreq);
        modulator.freq(modFreq);


        modDepth = p5.map(p5.mouseX, 0, p5.width, modMinDepth, modMaxDepth);
        modulator.amp(modDepth);
        carrier.amp(1,1);
      });

    };

    toggleAudio(cnv);

  };



  const draw = () => {
    p5.background(0);
    // noStroke();
    p5.fill(200);

    const dirY = (p5.mouseY / p5.height - 1) * 10;
    const dirX = (p5.mouseX / p5.width - 1) * 5;
    p5.directionalLight(78, 33, 117, dirY, dirX, 1);
    p5.translate(-1.5 * radius, 0, 0);
    p5.sphere(radius);
    // translate(3 * radius, 0, 0);
    // sphere(radius);

    p5.waveform = analyzer.waveform();
    p5.stroke(78, 33, 117, 100);
    p5.strokeWeight(1);
    p5.beginShape();
    for (let i = 0; i < p5.waveform.length/100; i++) {
      let x = p5.map(i, 100, p5.waveform.length,750, p5.width/2);
      let y = p5.map(p5.waveform[i], .25, -1, -p5.height/4, p5.height / 2);
      p5.ellipse(p5.width, p5.height/50, x, y);
    }
    p5.endShape();

  };
  setup();
  draw();

};

export default runSynth;
