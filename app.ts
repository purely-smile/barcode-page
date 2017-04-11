import Canvas = require('canvas');
import fs = require('fs');
import randomString = require('randomstring');
import { Observable } from 'rxjs';
import rp = require('request-promise');
const bwipjs = require('bwip-js');

const Image = Canvas.Image;
const canvas = new Canvas(2480, 3508);
let ctx = canvas.getContext('2d');

let hegeBuffer = fs.readFileSync('./hege.png');


bwipjs.loadFont('Inconsolata', 108, fs.readFileSync('./fonts/Inconsolata.ttf', 'binary'));
let i = 0;

Observable.interval(1)
    .take(120)
    .flatMap(() => {
        return Observable.fromPromise(rp.get('http://www.naertui.com:8888/bar-code'))
    })
    .map((str: any) => {
        return JSON.parse(str).code;
        // return randomString.generate({
        //     length: 10,
        //     charset: '0123456789'
        // });
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
        let offSetY = 50;
        ctx.drawImage(img, line * 500 + 50, row * 145 + offSetY, 300, 80);
        const hegeImg = new Image();
        hegeImg.src = hegeBuffer;
        ctx.drawImage(hegeImg, line * 500 + 360, row * 145 + offSetY );
        // ctx.font = '35px serif';
        // ctx.fillText('合', line * 500 + 390, row * 145 + offSetY + 30);
        // ctx.fillText('格', line * 500 + 390, row * 145 + offSetY + 70);
        i++;
    },
    (err) => {
        console.log(err);
    },
    () => {
        fs.writeFileSync('./out/3.png', canvas.toBuffer());
        console.log('complete');
    })