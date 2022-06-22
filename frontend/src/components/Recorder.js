import { useEffect, useRef, useState } from 'react';
import { shuffle } from '../utils/helper';
import { Tab } from '@headlessui/react';
import { useStore } from '../utils/useStore';

function classNames(...classes) {
	return classes.filter(Boolean).join(' ');
}

const Recorder = () => {
	const record = useRef(null);
	const stop = useRef(null);
	const soundClips = useRef(null);
	const setdB = useStore((state) => state.setdB);

	const [recordingLength, setrecordingLength] = useState(0);

	const [labels, setlabels] = useState([
		'music with 25% volume',
		'music with 75% volume',
		'music with 100% volume',
		'loud breath',
		'baby crying',
		'chair noise/being moved',
		'gentle scream',
		'phone vibrating',
		'footsteps',
		'TV noise',
		'window noise',
		'laughter',
		'people talking',
	]);

	const [mics, setmics] = useState([]);
	const [selectedMic, setselectedMic] = useState('');

	const [isPaused, setIsPaused] = useState(true);
	const [elapsedTime, setelapsedTime] = useState(0);

	const [isRecording, setisRecording] = useState(false);

	useEffect(() => {
		setlabels((labels) => shuffle(labels));
	}, []);

	useEffect(() => {
		console.log('mics', mics);
	}, [mics]);

	useEffect(() => {
		if (!navigator.getUserMedia)
			navigator.getUserMedia =
				navigator.webkitGetUserMedia ||
				navigator.mozGetUserMedia ||
				navigator.msGetUserMedia;

		window.AudioContext = window.AudioContext || window.webkitAudioContext;

		// audio sources

		if (!navigator.mediaDevices) {
			throw new Error('DecibelMeter: MediaStreamTrack not supported');
		}

		if (!navigator.mediaDevices.enumerateDevices) {
			throw new Error(
				'DecibelMeter: mediaDevices.enumerateDevices() not supported'
			);
		}

		var sources = [],
			sourcesIndex = {},
			sourcesReady = false;

		navigator.mediaDevices.enumerateDevices().then(function (srcs) {
			srcs.forEach(function (source) {
				if (source.kind === 'audiooutput') {
					sources.push(source);
					sourcesIndex[source.id] = source;
				}
			});

			sourcesReady = true;

			// let meters know that audio sources are ready now
		});
	}, []);

	useEffect(() => {
		let interval = null;

		if (isRecording && isPaused === false) {
			interval = setInterval(() => {
				setelapsedTime((time) => time + 10);
			}, 10);
		} else {
			clearInterval(interval);
		}

		return () => {
			clearInterval(interval);
		};
	}, [isRecording, isPaused]);

	useEffect(() => {
		console.log(navigator);

		if (!navigator.getUserMedia)
			navigator.getUserMedia =
				navigator.webkitGetUserMedia ||
				navigator.mozGetUserMedia ||
				navigator.msGetUserMedia;

		if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
			console.log('getUserMedia supported.');
			navigator.mediaDevices
				.enumerateDevices()
				.then(function (devices) {
					const audioInputDevices = devices.filter(function (device) {
						return (
							device.kind === 'audioinput' && device.deviceId === 'default'
						);
					});

					audioInputDevices.forEach(function (device) {
						setselectedMic(device.label);
					});

					setmics(audioInputDevices);
				})
				.catch(function (err) {
					console.log(err.name + ': ' + err.message);
				});

			console.log('selectedMic', selectedMic);

			navigator.mediaDevices
				.getUserMedia({
					audio: true,
				})
				.then(function (stream) {
					console.log('getUserMedia() got stream: ', stream);

					const mediaRecorder = new MediaRecorder(stream);
					console.log('mediaRecorder', mediaRecorder);
					let chunks = [];
					let recordingLength = [3, 4, 5];
					setrecordingLength(
						recordingLength[Math.floor(Math.random() * recordingLength.length)]
					);
					let clipName = '';

					record.current.onclick = () => {
						setisRecording(true);
						setIsPaused(false);
						setelapsedTime(0);
						mediaRecorder.start();

						console.log('MediaRecorder started', mediaRecorder.state);
					};

					mediaRecorder.ondataavailable = function (e) {
						chunks.push(e.data);
					};

					stop.current.onclick = () => {
						setrecordingLength(
							recordingLength[
								Math.floor(Math.random() * recordingLength.length)
							]
						);
						clipName = labels.pop();
						setisRecording(false);
						setIsPaused(true);
						mediaRecorder.stop();
						console.log('MediaRecorder stopped', mediaRecorder.state);
					};

					mediaRecorder.onstop = (e) => {
						console.log('Recorder stopped: ', e);

						const clipContainer = document.createElement('article');
						const clipLabel = document.createElement('p');
						const audio = document.createElement('audio');
						const uploadButton = document.createElement('button');
						const deleteButton = document.createElement('button');

						clipContainer.classList.add('clip', 'mb-10');
						audio.setAttribute('controls', '');
						audio.classList.add('my-1');
						uploadButton.innerHTML = 'Upload';
						uploadButton.classList.add(
							'mr-3',
							'bg-blue-500',
							'px-4',
							'py-2',
							'text-white',
							'rounded-full'
						);
						deleteButton.innerHTML = 'Delete';
						deleteButton.classList.add(
							'mr-3',
							'bg-red-500',
							'px-4',
							'py-2',
							'text-white',
							'rounded-full'
						);
						clipLabel.innerHTML = clipName;

						clipContainer.appendChild(clipLabel);
						clipContainer.appendChild(audio);
						clipContainer.appendChild(uploadButton);
						clipContainer.appendChild(deleteButton);
						soundClips.current.appendChild(clipContainer);

						const blob = new Blob(chunks, {
							type: 'audio/wav',
						});
						chunks = [];
						const audioURL = window.URL.createObjectURL(blob);
						audio.src = audioURL;

						deleteButton.onclick = function (e) {
							let evtTgt = e.target;
							setelapsedTime(0);
							evtTgt.parentNode.parentNode.removeChild(evtTgt.parentNode);
						};
					};
				})
				.catch(function (err) {
					console.log('The following gUM error occured: ' + err);
				});
		} else {
			console.log('getUserMedia not supported on your browser!');
		}
	}, [labels, selectedMic]);

	return (
		<div className='min-w-full px-5'>
			<div className='flex flex-col items-center'>
				<div>
					<p>
						Selected audio input:{' '}
						<i className=''>{selectedMic ? selectedMic : 'none'}</i>
					</p>
					<p className='mb-5'>
						Make sure the selected audio input above is correct. <br />
						Otherwise, re-select your audio input, and reload this page.
					</p>
					{/* {labels.map((label, index) => (
				<div key={index}>{label}</div>
			))} */}

					{/* {labels.length > 0 && (
						<p className='my-5'>
							Record{' '}
							<span className='font-bold'>{labels[labels.length - 1]}</span> for{' '}
							{recordingLength} seconds
						</p>
					)}
					{labels.length > 0 && (
						<p className='my-5 text-slate-500'>
							Next: {labels[labels.length - 2]}
						</p>
					)} */}

					{labels.length === 0 && (
						<p>
							Done! Please review and upload the recordings. You can repeat the
							recording process by reloading this page.
						</p>
					)}
				</div>
				<div className='w-full px-2 py-16 sm:px-0'>
					<Tab.Group>
						<Tab.List className='flex space-x-1 rounded-xl bg-blue-900/20 p-1'>
							{labels.map((label) => (
								<Tab
									key={label}
									className={({ selected }) =>
										classNames(
											'w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700',
											'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400',
											selected
												? 'bg-white shadow'
												: 'hover:bg-white/[0.12] hover:text-white'
										)
									}
								>
									{label}
								</Tab>
							))}
						</Tab.List>
						<Tab.Panels className='mt-2 flex justify-center'>
							{labels.map((label, idx) => (
								<Tab.Panel
									key={idx}
									className={classNames(
										'rounded-xl bg-white p-3',
										'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 '
									)}
								>
									{label}
								</Tab.Panel>
							))}
						</Tab.Panels>
					</Tab.Group>
				</div>
				{labels.length > 0 && (
					<div className='flex flex-col items-center mt-10'>
						<div className='text-3xl text-center mb-5'>
							{('0' + Math.floor((elapsedTime / 60000) % 60)).slice(-2)}:
							{('0' + Math.floor((elapsedTime / 1000) % 60)).slice(-2)}:
							{('0' + ((elapsedTime / 10) % 100)).slice(-2)}
						</div>

						<div className='flex gap-10 text-white'>
							<div
								ref={record}
								className={`cursor-pointer h-16 w-16 flex justify-center items-center ${
									isRecording ? 'bg-red-500' : 'bg-slate-600'
								} rounded-full`}
								disabled={true}
							>
								Rec
							</div>
							<div
								ref={stop}
								className='cursor-pointer h-16 w-16 flex justify-center items-center bg-slate-600 rounded-full'
								disabled={!isRecording}
							>
								Stop
							</div>
						</div>
					</div>
				)}
				<div ref={soundClips} className='sound-clips mt-2'></div>
			</div>
		</div>
	);
};

export default Recorder;
