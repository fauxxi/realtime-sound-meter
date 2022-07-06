import { useEffect, useRef, useState } from 'react';
import { shuffle } from '../utils/helper';
import { Tab } from '@headlessui/react';
import { useStore } from '../utils/useStore';
import { customAlphabet } from 'nanoid';

import axios from 'axios';
const BUCKET_URL =
	'https://recorded-audio-files.s3.eu-central-1.amazonaws.com/';

function classNames(...classes) {
	return classes.filter(Boolean).join(' ');
}

const Recorder = () => {
	const id = useStore((state) => state.id);
	const sessionId = useStore((state) => state.sessionId);
	const setSessionId = useStore((state) => state.setSessionId);

	const record = useRef(null);
	const stop = useRef(null);
	const soundClips = useRef([]);
	const setdB = useStore((state) => state.setdB);
	const [uploadingStatus, setUploadingStatus] = useState('');

	const [recordingLength, setrecordingLength] = useState(0);

	const [selectedTab, setselectedTab] = useState(0);

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

	const [recordedData, setrecordedData] = useState([]);

	const [mics, setmics] = useState([]);
	const [selectedMic, setselectedMic] = useState('');

	const [isPaused, setIsPaused] = useState(true);
	const [elapsedTime, setelapsedTime] = useState(0);

	const [isRecording, setisRecording] = useState(false);

	useEffect(() => {
		if (sessionId === '') {
			const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 5);
			setSessionId(nanoid());
		}
	}, [sessionId]);

	useEffect(() => {
		console.log('sessionId', sessionId);
	}, [sessionId]);

	useEffect(() => {
		labels.forEach((label, idx) =>
			setrecordedData((recordedData) =>
				[...recordedData, { id: idx, label, data: [] }].filter(
					(v, i, a) => a.findIndex((v2) => v2.id === v.id) === i
				)
			)
		);
	}, []);

	useEffect(() => {
		console.log(recordedData);
	}, [recordedData]);

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
		// console.log(navigator);

		if (!navigator.getUserMedia)
			navigator.getUserMedia =
				navigator.webkitGetUserMedia ||
				navigator.mozGetUserMedia ||
				navigator.msGetUserMedia;

		if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
			// console.log('getUserMedia supported.');
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

			// console.log('selectedMic', selectedMic);

			navigator.mediaDevices
				.getUserMedia({
					audio: true,
				})
				.then(function (stream) {
					// console.log('getUserMedia() got stream: ', stream);

					const mediaRecorder = new MediaRecorder(stream);
					// console.log('mediaRecorder', mediaRecorder);
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

						// console.log('MediaRecorder started', mediaRecorder.state);
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
						clipName = labels[selectedTab];
						setisRecording(false);
						setIsPaused(true);
						mediaRecorder.stop();
						// console.log('MediaRecorder stopped', mediaRecorder.state);
					};

					mediaRecorder.onstop = (e) => {
						const fileId = customAlphabet(
							'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
							2
						);
						let recordedDataCopy = [...recordedData];
						let objData = { ...recordedDataCopy[selectedTab] };

						// console.log('Recorder stopped: ', e);
						setelapsedTime(0);

						const blob = new Blob(chunks, {
							type: 'audio/wav',
						});
						chunks = [];
						const audioURL = window.URL.createObjectURL(blob);

						objData.data.push({
							file: new File(
								[blob],
								`${labels[selectedTab]
									.split(' ')
									.join('-')
									.toLocaleLowerCase()
									.replace('/', '')
									.replace('%', '')}/${id}-${sessionId}-${fileId()}.wav`,
								{
									type: 'audio/wav',
								}
							),
							blobUrl: audioURL,
						});

						recordedDataCopy[selectedTab] = objData;
						setrecordedData(recordedDataCopy);

						// audio.src = audioURL;

						// deleteButton.onclick = function (e) {
						// 	let evtTgt = e.target;
						// 	setelapsedTime(0);
						// 	evtTgt.parentNode.parentNode.removeChild(evtTgt.parentNode);
						// };
					};
				})
				.catch(function (err) {
					console.log('The following gUM error occured: ' + err);
				});
		} else {
			console.log('getUserMedia not supported on your browser!');
		}
	}, [labels, selectedMic, selectedTab]);

	useEffect(() => {
		console.log('recordedData', recordedData);
	}, [recordedData]);

	useEffect(() => {
		console.log(selectedTab);
	}, [selectedTab]);

	const uploadFile = async (file) => {
		setUploadingStatus('Uploading the file to AWS S3');

		let { data } = await axios.post('/api/upload-file', {
			name: file.name,
			type: file.type,
		});

		console.log(data);

		const url = data.url;
		let { data: newData } = await axios.put(url, file, {
			headers: {
				'Content-type': file.type,
				'Access-Control-Allow-Origin': '*',
			},
		});

		console.log(newData);

		// setUploadedFile(BUCKET_URL + file.name);
	};

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

					{labels.length === 0 && (
						<p>
							Done! Please review and upload the recordings. You can repeat the
							recording process by reloading this page.
						</p>
					)}
				</div>
				<div className='w-full px-2 py-16 sm:px-0'>
					<Tab.Group
						onChange={(index) => {
							setselectedTab(index);
						}}
					>
						<Tab.List className='flex space-x-1 rounded-xl bg-blue-900/20 p-1'>
							{labels.map((label) => (
								<Tab
									key={label}
									className={({ selected }) =>
										classNames(
											'outline-none w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700',
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
										'border-none focus:ring-0'
									)}
								>
									<div
										// ref={(el) => (soundClips.current[idx] = el)}
										className='mt-2'
									>
										{recordedData[idx]?.data?.map((data, idx) => {
											return (
												<article key={idx}>
													<p>{data?.file?.name}</p>
													<audio src={data?.blobUrl} controls></audio>
													<button
														onClick={() => {
															let recordedDataCopy = [...recordedData];
															let objData = {
																...recordedDataCopy[selectedTab],
															};
															objData.data.splice(idx, 1);
															recordedDataCopy[selectedTab] = objData;
															setrecordedData(recordedDataCopy);
														}}
													>
														Delete
													</button>
												</article>
											);
										})}
									</div>
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
								className={`disabled cursor-pointer h-16 w-16 flex justify-center items-center ${
									isRecording
										? 'bg-red-500 pointer-events-none '
										: 'bg-slate-600 pointer-events-auto'
								} rounded-full`}
							>
								Rec
							</div>
							<div
								ref={stop}
								className={`cursor-pointer h-16 w-16 flex justify-center items-center bg-slate-600 rounded-full ${
									isRecording ? 'pointer-events-auto' : 'pointer-events-none'
								}`}
							>
								Stop
							</div>
						</div>
						<button
							className='mt-10 p-2 bg-blue-500 text-white'
							onClick={() => {
								recordedData.map((data, idx) => {
									// console.log('each recordedData: ', data);
									data.data.map((dat) => {
										// console.log('each data.data: ', dat.file);
										uploadFile(dat.file);
									});
								});
							}}
						>
							UPLOAD
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default Recorder;
