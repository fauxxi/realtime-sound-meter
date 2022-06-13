import { useEffect, useRef } from 'react';
// import p5 from 'p5';

const sketch = (p) => {
	let mic, fft, canvas;
	p.setup = () => {
		canvas = p.createCanvas(710, 400);
		p.noFill();

		mic = new p5.AudioIn();
		mic.start();
		p.getAudioContext().resume();
		fft = new p5.FFT();
		fft.setInput(mic);
	};

	p.draw = () => {
		p.noFill();

		let spectrum = fft.analyze();
		console.log(mic.getLevel());

		p.beginShape();
		p.stroke('#000');
		p.strokeWeight('1');

		spectrum.forEach((spec, i) => {
			p.vertex(i, p.map(spec, 0, 255, p.height, 0));
		});

		p.endShape();
	};
};

const Visualizer = () => {
	const canvas = useRef();

	useEffect(() => {
		let newP5 = new p5(sketch, canvas.current);

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

export default Visualizer;
