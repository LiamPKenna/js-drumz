import sound1 from "./../mp3/sound1.mp3";
import sound2 from "./../mp3/sound2.mp3";
import sound3 from "./../mp3/sound3.mp3";
import sound4 from "./../mp3/sound4.mp3";
import sound5 from "./../mp3/sound5.mp3";
import sound6 from "./../mp3/sound6.mp3";
import sound7 from "./../mp3/sound7.mp3";
import sound8 from "./../mp3/sound8.mp3";
import sound9 from "./../mp3/sound9.mp3";
import sound10 from "./../mp3/sound10.mp3";
import sound11 from "./../mp3/sound11.mp3";
import sound12 from "./../mp3/sound12.mp3";
import sound13 from "./../mp3/sound13.mp3";
import sound14 from "./../mp3/sound14.mp3";
import sound15 from "./../mp3/sound15.mp3";
import sound16 from "./../mp3/sound16.mp3";
import sound17 from "./../mp3/sound17.mp3";
import sound18 from "./../mp3/sound18.mp3";
import sound19 from "./../mp3/sound19.mp3";
import sound20 from "./../mp3/sound20.mp3";
import sound21 from "./../mp3/sound21.mp3";
import sound22 from "./../mp3/sound22.mp3";
import sound23 from "./../mp3/sound23.mp3";
import sound24 from "./../mp3/sound24.mp3";
import sound25 from "./../mp3/sound25.mp3";
import sound26 from "./../mp3/sound26.mp3";
import sound27 from "./../mp3/sound27.mp3";
import sound28 from "./../mp3/sound28.mp3";
import sound29 from "./../mp3/sound29.mp3";
import sound30 from "./../mp3/sound30.mp3";
import sound31 from "./../mp3/sound31.mp3";
import sound32 from "./../mp3/sound32.mp3";
import sound33 from "./../mp3/sound33.mp3";
import sound34 from "./../mp3/sound34.mp3";
import sound35 from "./../mp3/sound35.mp3";
import sound36 from "./../mp3/sound36.mp3";
import sound37 from "./../mp3/sound37.mp3";
import sound38 from "./../mp3/sound38.mp3";
import sound39 from "./../mp3/sound39.mp3";
import sound40 from "./../mp3/sound40.mp3";
import sound41 from "./../mp3/sound41.mp3";
import sound42 from "./../mp3/sound42.mp3";
import sound43 from "./../mp3/sound43.mp3";
import sound44 from "./../mp3/sound44.mp3";
import sound45 from "./../mp3/sound45.mp3";
import sound46 from "./../mp3/sound46.mp3";
import sound47 from "./../mp3/sound47.mp3";
import sound48 from "./../mp3/sound48.mp3";
import sound49 from "./../mp3/sound49.mp3";
import sound50 from "./../mp3/sound50.mp3";

const kit1 = [sound1, sound2, sound3, sound4, sound5, sound6, sound7, sound8, sound9, sound10];
const kit2 = [sound11, sound12, sound13, sound14, sound15, sound16, sound17, sound18, sound19, sound20];
const kit3 = [sound21, sound22, sound23, sound24, sound25, sound26, sound27, sound28, sound29, sound30];
const kit4 = [sound31, sound32, sound33, sound34, sound35, sound36, sound37, sound38, sound39, sound40];
const kit5 = [sound41, sound42, sound43, sound44, sound45, sound46, sound47, sound48, sound49, sound50];

const getKit = (n) => {
  const kits = {
    kit1: kit1,
    kit2: kit2,
    kit3: kit3,
    kit4: kit4,
    kit5: kit5
  };
  return kits[`kit${n}`];
};

export default getKit;
