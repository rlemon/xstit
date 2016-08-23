function getColorWeight(clr1, clr2) {
	// return 	Math.sqrt(Math.pow((clr2.r - clr1.r), 2) + 
	// 		Math.pow((clr2.g - clr1.g), 2) + 
	// 		Math.pow((clr2.b - clr1.b), 2)) // because I'm not checking an actual distance, just weight, fuck sqrt
	return 	Math.pow((clr2.r - clr1.r), 2) + 
			Math.pow((clr2.g - clr1.g), 2) + 
			Math.pow((clr2.b - clr1.b), 2)
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

function getColor(idata, x, y, w, h) {
    var r = 0, g = 0, b = 0, i = 0;
    for (var _x = x; _x < x + w; _x++) {
        for (var _y = y; _y < y + h; _y++) {
            var o = Math.floor((_x - w) + Math.floor( (_y - h) * idata.width)) * 4;
            i++;
            r += idata.data[o];
            g += idata.data[o + 1];
            b += idata.data[o + 2];
        }
    }
    return {
        r: r / i | 0,
        g: g / i | 0,
        b: b / i | 0
    };
}

const codes = document.getElementById('codes');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const image = new Image();
image.crossOrigin = 'Anonymous';
image.onload = main;
image.src = 'http://i.imgur.com/DbCf4Ab.jpg';

const resolution = 4; // ~3 seconds
//const resolution = 2; // ~13 seconds, I'd love to trim this to < 5 if possible :/ 

function main() {
	console.time('generate new matrix');
	canvas.height = this.height;
	canvas.width = this.width;
	context.drawImage(this, 0, 0);
	const idata = context.getImageData(0, 0, this.width, this.height);
	const grid = [];
	for( let y = 0; y < this.height - resolution; y += resolution ) {
		const yIndex = y/resolution;
		grid[yIndex] = [];
		for( let x = 0; x < this.width - resolution; x += resolution ) {
			const xIndex = x / resolution;
			const o = x * 4 + y * 4 * this.width;
			const rgb = getColor(idata, x + resolution, y + resolution, resolution, resolution);
			const closest = getClosestColor(rgb);
			const trgb = closest.code;
			const lum = trgb.r * 0.2126 + trgb.g * 0.7152 + trgb.b * 0.0722;
			grid[yIndex][xIndex] = {dnc: closest, lum};
		}
	}
	console.timeEnd('generate new matrix');
	// 
	console.time('render full image')
	let cX = 0;
	let cY = 0;
	let pY = 0;
	let pX = 0;
	const pScale = 2;
	const scale = 10;
	context.clearRect(0, 0, canvas.width, canvas.height);
	canvas.height *= scale;
	canvas.width *= scale;
	canvas.width += (pScale * (canvas.width / resolution / 10));
	canvas.height += (pScale * (canvas.height / resolution / 10));
	context.font = '7pt courier';
	context.lineWidth = 1;
	context.fillStyle = '#fff';
	context.fillRect(0, 0, canvas.width, canvas.height);
	for( let y = 0; y < grid.length; y++ ) {
		pX = 0;
		if( (y+1) % 10 === 0 ) {
			pY += pScale;
		}
		cY = (y) * resolution;
		for( let x = 0; x < grid[y].length; x++ ) {
			const lum = grid[y][x].lum;
			const {code,key} = grid[y][x].dnc;
			if( (x+1) % 10 === 0 ) {
				pX += pScale;
			}
			cX = (x) * resolution;
			context.beginPath();
			context.fillStyle = `rgb(${code.r},${code.g},${code.b})`;
			context.rect(cX*scale+pX, cY*scale+pY, resolution*scale, resolution*scale);
			context.strokeStyle = 'rgba(0, 0, 0, 1)';
			context.fill();
			context.stroke();
			context.fillStyle = lum > 100 ? '#000' : '#fff';
			context.fillText(key, cX*scale+4+pX, cY*scale+(resolution*scale)/2+pY);
			context.closePath();
		}
	}
	console.timeEnd('render full image');
	//split();
}
// non working code to split the full image into printer friendly images
// function split() {
// 	const w = resolution * 10 * 4;
// 	const h = resolution * 10 * 5;
// 	let cX = 0;
// 	let cY = 0;
// 	const scale = 10;
// 	while( cY < canvas.height ) {
// 		cX = 0;
// 		while( cX < canvas.width )  {
// 			const img = document.createElement('canvas');
// 			const ctx = img.getContext('2d');
// 			img.height = h * scale;
// 			img.width = w * scale;
// 			ctx.drawImage(canvas, cX, cY, canvas.width, canvas.height, 0, 0, canvas.width * scale, canvas.height * scale);
// 			document.body.appendChild(img);
// 			cX += w;
// 		}
// 		cY += h;
// 		document.body.appendChild(document.createElement('BR'));
// 	}
// 	canvas.hidden = true;
// }
