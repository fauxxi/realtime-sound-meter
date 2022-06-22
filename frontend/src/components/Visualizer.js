import { useEffect, useRef } from 'react';
import { useStore } from '../utils/useStore';

function log10(x) {
	return Math.log(x) / Math.LN10;
}

let CalculateRMS = function (arr) {
	// Map will return another array with each
	// element corresponding to the elements of
	// the original array mapped according to
	// some relation
	let Squares = arr.map((val) => Math.abs(val) * Math.abs(val));

	// Function reduce the array to a value
	// Here, all the elements gets added to the first
	// element which acted as the accumulator initially.
	let Sum = Squares.reduce((acum, val) => acum + val);

	let Mean = Sum / (arr.length / 2);
	return Math.sqrt(Mean);
};

export const Visualizer = () => {
	const canvas = useRef();
	const setvolHistory = useStore((state) => state.setVolHistory);
	const setdB = useStore((state) => state.setdB);

	const sketch = (p) => {
		let mic, fft, canvas;
		p.setup = () => {
			canvas = p.createCanvas(window.innerWidth / 2, window.innerHeight / 2);
			p.getAudioContext().suspend();
			canvas.mousePressed(p.userStartAudio);
			p.noFill();

			mic = new window.p5.AudioIn();
			mic.start();
			p.getAudioContext().resume();
			fft = new window.p5.FFT();
			fft.setInput(mic);
		};

		p.draw = () => {
			p.background('#fff');
			let spectrum = fft.analyze();
			let prms = ((2 ^ 0.5) / 2) * Math.max(...spectrum);
			let dB = 20 * log10(CalculateRMS(spectrum) / 32768) + 120;
			// console.log('rms', CalculateRMS(spectrum));
			// console.log('dB', dB);
			setdB(dB);
			setvolHistory(mic.getLevel());
			p.beginShape();
			p.stroke('#000');
			p.strokeWeight('1');
			spectrum.forEach((spec, i) => {
				p.vertex(i, p.map(spec, 0, 255, p.height / 2, 0));
			});
			p.endShape();
		};
	};

	useEffect(() => {
		let newP5 = new window.p5(sketch, canvas.current);

		return () => {
			newP5.remove();
		};
	}, []);

	return (
		<div className='w-full'>
			<div ref={canvas}></div>
		</div>
	);
};
