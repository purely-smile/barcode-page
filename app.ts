import Canvas = require('canvas');
import fs = require('fs');
import randomString = require('randomstring');
import { Observable } from 'rxjs';
const bwipjs = require('bwip-js');

const Image = Canvas.Image;
const canvas = new Canvas(2480, 3508);
let ctx = canvas.getContext('2d');

bwipjs.loadFont('Inconsolata', 108, fs.readFileSync('./fonts/Inconsolata.ttf', 'binary'));
let i = 0;
Observable.interval(1)
    .take(120)
    .map(() => {
        return randomString.generate({
            length: 10,
            charset: '0123456789'
        });
    })
    .flatMap((str) => {
        let fn: any = Observable.bindNodeCallback(bwipjs.toBuffer);
        return fn({
            bcid: 'code128',       // Barcode type
            text: str,    // Text to encode
            scale: 4,               // 3x scaling factor
            height: 5,              // Bar height, in millimeters
            includetext: true,            // Show human-readable text
            textxalign: 'center',        // Always good to set this
            textfont: 'Inconsolata',   // Use your custom font
            textsize: 10               // Font size, in points
        });

    })
    .subscribe(
    png => {
        let img = new Image();
        img.src = png;
        let row = Math.floor(i / 5);
        let line = i % 5;
        let offSetY = i < 5 ? 50 : 50;
        ctx.drawImage(img, line * 500 + 50, row * 145 + offSetY);
        i++;
    },
    (err) => {
        console.log(err);
    },
    () => {
        fs.writeFileSync('./1.png', canvas.toBuffer());
        console.log('complete');
    })
