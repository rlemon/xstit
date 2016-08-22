function getColorWeight(clr1, clr2) {
	return 	Math.sqrt(Math.pow((clr2.r - clr1.r), 2) + 
			Math.pow((clr2.g - clr1.g), 2) + 
			Math.pow((clr2.b - clr1.b), 2))
}

function getClosestColor(clr) {
	const chosen = {
		code: null,
		value: 1e9,
		key: null
	};
	for( const key of Object.keys(dnc_codes) ) {
		const code = dnc_codes[key];
		const weight = getColorWeight(clr, code);
		if( weight < chosen.value ) {
			chosen.value = weight;
			chosen.code = code;
			chosen.key = key;
		}
	}
	return chosen;
}

const codes = document.getElementById('codes');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const image = new Image();
image.crossOrigin = 'Anonymous';
image.onload = init;
image.src = 'http://i.imgur.com/DbCf4Ab.jpg';

const resolution = 4; // change me for the resolution of the image
const pScale = 1.5;
const cellSize = 10;
let scale = 4; // I don't really matter unless you want to make me yuge

function init() {
	context.font = '7pt courier';
	const min = context.measureText('00000').width; // sue me, text has to be readable. 
	while( scale * resolution < min ) {
		scale += 0.1;
	}
	canvas.height = this.height * scale + scale*resolution;
	canvas.width = this.width * scale + scale*resolution;
	context.drawImage(this, 0, 0);
	context.font = '7pt courier';
	const data = context.getImageData(0, 0, this.width, this.height).data;
	context.fillStyle = '#000';
	context.fillRect(0, 0, canvas.width, canvas.height);
	let pX = 0;
	let pY = 0;
	for( let y = 0; y < this.height; y += resolution ) {
		pX = 0;
		if( (y/resolution) % cellSize === 0 ) {
			pY+=pScale;
		}
		for( let x = 0; x < this.width; x += resolution ) {
			const o = x * 4 + y * 4 * this.width;
			if( (x/resolution) % cellSize === 0 ){
				pX+=pScale;
				if( (y/resolution) % cellSize === 0  ) { // ugh, yes
					context.fillStyle = '#fff';
					context.fillText(`${pX/pScale},${pY/pScale}`, (x+pX)*scale, (y+pY)*scale - 2);
				}
			}
			// todo, get the avg colour and not just the top-left corner for the cells.
			const rgb = {
				r: data[o],
				g: data[o+1],
				b: data[o+2]
			};
			const closest = getClosestColor(rgb);
			const lum = data[o] * 0.2126 + data[o+1] * 0.7152 + data[o+2] * 0.0722;
			context.beginPath();
			context.fillStyle = `rgb(${closest.code.r},${closest.code.g},${closest.code.b})`;
			context.rect((x+pX)*scale,(y+pY)*scale,resolution*scale,resolution*scale);
			context.fill();
			context.strokeStyle = 'rgba(255, 255, 255, 0.25)';
			context.stroke();
			if( lum > 100 ) {
				context.fillStyle = '#000';
			} else {
				context.fillStyle = '#fff';
			}
			context.fillText(closest.key, (x+pX)*scale, (y+pY)*scale + 8);
			context.closePath();
		}
	}
	document.body.appendChild(this);
}