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
image.onload = init;
image.src = 'http://i.imgur.com/DbCf4Ab.jpg';

const resolution = 4; // ~3 seconds
//const resolution = 2; // ~13 seconds, I'd love to trim this to < 5 if possible :/ 
const grid = [];

function init() {
	console.time('generate');
	canvas.height = this.height;
	canvas.width = this.width;
	context.drawImage(this, 0, 0);
	const idata = context.getImageData(0, 0, this.width, this.height);
	for( let y = 0; y < this.height - resolution; y += resolution ) {
		const yIndex = y/resolution;
		grid[yIndex] = [];
		for( let x = 0; x < this.width - resolution; x += resolution ) {
			const xIndex = x / resolution;
			const o = x * 4 + y * 4 * this.width;
			const rgb = getColor(idata, x + resolution, y + resolution, resolution, resolution);
			const closest = getClosestColor(rgb);
			const lum = idata.data[o] * 0.2126 + idata.data[o+1] * 0.7152 + idata.data[o+2] * 0.0722;
			grid[yIndex][xIndex] = {dnc: closest, lum};
		}
	}
	console.timeEnd('generate');
	render();
}

function render() {
	context.clearRect(0, 0, canvas.width, canvas.height);
	for( let y = 0; y < grid.length; y++ ) {
		for( let x = 0; x < grid[y].length; x++ ) {
			const lum = grid[y][x].lum;
			const dnc = grid[y][x].dnc.code;
			context.beginPath();
			context.fillStyle = `rgb(${dnc.r},${dnc.g},${dnc.b})`;
			context.fillRect(x * resolution, y * resolution, resolution, resolution);
			context.closePath();
		}
	}
}
