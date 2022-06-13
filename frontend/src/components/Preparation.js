import { useEffect, useState } from 'react';
import { shuffle } from '../utils/helper';
import { useStore } from '../utils/useStore';

const samples = [
	{
		0: [
			{
				sample:
					'https://audiosamplesp808.blob.core.windows.net/p808-assets/clips/sample_jnd/40S_female1.wav',
				label: 'A',
			},
			{
				sample:
					'https://audiosamplesp808.blob.core.windows.net/p808-assets/clips/sample_jnd/50S_female1.wav',
				label: 'B',
			},
		],
	},
	{
		1: [
			{
				sample:
					'https://audiosamplesp808.blob.core.windows.net/p808-assets/clips/sample_jnd/40S_female2.wav',
				label: 'A',
			},
			{
				sample:
					'https://audiosamplesp808.blob.core.windows.net/p808-assets/clips/sample_jnd/50S_female2.wav',
				label: 'B',
			},
		],
	},
	{
		2: [
			{
				sample:
					'https://audiosamplesp808.blob.core.windows.net/p808-assets/clips/sample_jnd/40S_male1.wav',
				label: 'A',
			},
			{
				sample:
					'https://audiosamplesp808.blob.core.windows.net/p808-assets/clips/sample_jnd/50S_male1.wav',
				label: 'B',
			},
		],
	},
	{
		3: [
			{
				sample:
					'https://audiosamplesp808.blob.core.windows.net/p808-assets/clips/sample_jnd/40S_male2.wav',
				label: 'A',
			},
			{
				sample:
					'https://audiosamplesp808.blob.core.windows.net/p808-assets/clips/sample_jnd/50S_male2.wav',
				label: 'B',
			},
		],
	},
];

const labels = ['A', 'B'];

const Preparation = () => {
	const stage = useStore((state) => state.stage);
	const setStage = useStore((state) => state.setStage);

	const [step, setstep] = useState(0);
	const [values, setvalues] = useState(['', '', '', '']);
	const [score, setscore] = useState(0);
	const [hasPassed, sethasPassed] = useState(false);
	const [hasSubmitted, sethasSubmitted] = useState(false);

	const Radio = ({ item, checked, onChange, idx, onAudioPlay }) => (
		<div>
			<label className='gap-2 flex items-center'>
				<input
					type='radio'
					value={item.sample}
					checked={checked}
					onChange={onChange}
					disabled={hasSubmitted}
				/>
				{labels[idx]}
			</label>
			<audio src={item.sample} controls onClick={onAudioPlay} />
		</div>
	);

	const RadioList = ({ items, value, onChange, onAudioPlay }) => (
		<div className='flex justify-center gap-24'>
			{items.map((item) => (
				<Radio
					item={item}
					key={item.sample}
					checked={item.sample === value}
					onChange={onChange}
					idx={items.indexOf(item)}
					onAudioPlay={onAudioPlay}
				/>
			))}
		</div>
	);

	const handleChange = (e, setValue, index) => {
		let vals = [...values];
		vals[index] = e.target.value;
		setValue(e.target.value);
		setvalues([...vals]);
		setstep(vals.filter((v) => v !== '').length);
		setscore(vals.filter((v) => v.includes('50S')).length);
	};

	const initSamples = () => {
		let arr = [];
		let obj = {};
		samples.forEach((sample, idx) => {
			console.log(sample[idx]);
			obj[idx] = shuffle(sample[idx]);
		});

		arr.push(obj);

		console.log(arr);
	};

	useEffect(() => {
		console.log('stage', stage);
	}, [stage]);

	useEffect(() => {
		initSamples();
	}, []);

	useEffect(() => {
		console.log('values', values);
		console.log('step', step);
		console.log('score', score);
	}, [values, step, score]);

	useEffect(() => {
		console.log('hasPassed', hasPassed);
	}, [hasPassed]);

	useEffect(() => {
		document.addEventListener(
			'play',
			function (e) {
				var audios = document.getElementsByTagName('audio');
				for (var i = 0, len = audios.length; i < len; i++) {
					if (audios[i] !== e.target) {
						audios[i].pause();
					}
				}
			},
			true
		);

		return () => {};
	}, []);

	return (
		<div className='w-full text-center'>
			<h3>Which sample has a better quality compared to the other one?</h3>
			{values.slice(0, step + 1).map((v, i) => (
				<RadioList
					key={i}
					items={samples[i][i]}
					value={values[i]}
					onChange={(e) => handleChange(e, setvalues, i)}
					onAudioPlay={(e) => console.log('play', e)}
				/>
			))}
			{step === 4 && !hasSubmitted && (
				<button
					className='bg-slate-200 p-2 rounded-full px-4 mt-10'
					onClick={() => {
						sethasSubmitted(true);
						if (score > 2) sethasPassed(true);
						else sethasPassed(false);
					}}
				>
					Submit
				</button>
			)}

			{hasSubmitted && !hasPassed && score < 3 && (
				<div className=' mt-10'>
					<h3>
						You didn't passed the audio test, you might want to adjust your
						speaker level.
					</h3>
					<button
						className='bg-slate-200 p-2 rounded-full px-4 mt-3'
						onClick={() => {
							setstep(0);
							setvalues(['', '', '', '']);
							initSamples();
							sethasSubmitted(false);
						}}
					>
						Repeat test?
					</button>
				</div>
			)}
			{hasSubmitted && hasPassed && score > 2 && (
				<div className=' mt-10'>
					<h3>
						You passed the audio test, you can proceed to audio sample
						recording.
					</h3>
					<button
						className='bg-slate-200 p-2 rounded-full px-4 mt-3'
						onClick={() => {
							console.log('continue');
							setStage(1);
						}}
					>
						Continue
					</button>
				</div>
			)}
		</div>
	);
};

export default Preparation;
