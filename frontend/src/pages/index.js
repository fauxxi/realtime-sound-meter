import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { customAlphabet } from 'nanoid';
import { Disclosure } from '@headlessui/react';
import { ChevronUpIcon } from '@heroicons/react/solid';

const Preparation = dynamic(() => import('../components/Preparation'), {
	ssr: false,
});

const Recorder = dynamic(() => import('../components/Recorder'), {
	ssr: false,
});

import { Visualizer } from '../components/Visualizer';

import { useStore } from '../utils/useStore';

function useWindowSize() {
	// Initialize state with undefined width/height so server and client renders match
	// Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
	const [windowSize, setWindowSize] = useState({
		width: undefined,
		height: undefined,
	});

	useEffect(() => {
		// only execute all the code below in client side
		if (typeof window !== 'undefined') {
			// Handler to call on window resize
			function handleResize() {
				// Set window width/height to state
				setWindowSize({
					width: window.innerWidth,
					height: window.innerHeight,
				});
			}

			// Add event listener
			window.addEventListener('resize', handleResize);

			// Call handler right away so state gets updated with initial window size
			handleResize();

			// Remove event listener on cleanup
			return () => window.removeEventListener('resize', handleResize);
		}
	}, []); // Empty array ensures that effect is only run on mount
	return windowSize;
}

function App() {
	const stage = useStore((state) => state.stage);
	const id = useStore((state) => state.id);
	const setId = useStore((state) => state.setId);

	const [barsArray, setbarsArray] = useState([]);
	const [length, setlength] = useState(0);
	const volLevel = useStore((state) => state.volHistory);
	const sliceVolLevel = useStore((state) => state.sliceVolHistory);
	const dB = useStore((state) => state.dB);

	const size = useWindowSize();

	useEffect(() => {
		if (id === '') {
			const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 10);
			setId(nanoid());
		}
	}, [id]);

	useEffect(() => {
		console.log('id', id);
	}, [id]);

	useEffect(() => {
		setlength(Math.floor(size.width / 4));
	}, [size]);

	useEffect(() => {
		sliceVolLevel(length);
	}, [length]);

	useEffect(() => {
		console.log('stage', stage);
	}, [stage]);

	return (
		<div>
			<main className='flex flex-col items-center gap-10 min-h-screen w-full bg-white overflow-x-hidden'>
				<div className='w-full px-4 pt-16'>
					<div className='mx-auto w-full rounded-2xl bg-white p-2'>
						<Disclosure>
							{({ open }) => (
								<>
									<Disclosure.Button className='flex w-full justify-between rounded-lg bg-blue-100 px-4 py-2 text-left  font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring focus-visible:ring-blue-500 focus-visible:ring-opacity-75'>
										<span>Introduction</span>
										<ChevronUpIcon
											className={`${
												open ? 'rotate-180 transform' : ''
											} h-5 w-5 text-blue-500`}
										/>
									</Disclosure.Button>
									<Disclosure.Panel className='px-4 pt-4 pb-2'>
										<p>
											Welcome! You are about to participate in audio samples
											collection! This HIT has two section:
										</p>
										<ul>
											<li>
												&bull;{' '}
												<span className='font-bold'>
													Qualification (just once)
												</span>
												: Check if you are eligible to perform this HIT
											</li>
											<li>
												&bull; <span className='font-bold'>Recording</span>:
												Record audio sample(s) according to label, and submit
											</li>
										</ul>
										<br />
										<p>
											You should follow the below mentioned rules &amp;
											preparations, otherwise your submission will be invalid.
										</p>
										<p className='font-bold'>Rules &amp; Preparations: </p>
										<ul>
											<li>
												&bull; You must perform the task in a quiet environment
											</li>
											<li>
												&bull; You will need a working{' '}
												<span className='font-bold'>microphone</span>, either
												internal or external.
											</li>
											<li>
												&bull; Each recording must be at least{' '}
												<span className='font-bold'>5 seconds</span> long,
												otherwise your recording will be invalid.
											</li>
										</ul>
										<br />
										<p className='font-bold'>Payment: </p>
										<p></p>
										<br />
										<p className='font-bold'>Instructions: </p>
										<ul>
											<li>
												&bull; Step 1: Record at least 5 seconds of audio
												according to the label, by pressing "Rec" for recording
												and "Stop" for stopping.
												<img src='/img/step1.png' />
											</li>
											<li>
												&bull; Step 2: After you've recorded at least one clip
												for each label, a SUBMIT button will appear. <br />
												However, make sure you've recorded the correct label.
												You can review them, and remove and repeat recording if
												needed.
												<img src='/img/step2.png' />
											</li>
										</ul>
									</Disclosure.Panel>
								</>
							)}
						</Disclosure>
						<Disclosure as='div' className='mt-2'>
							{({ open }) => (
								<>
									<Disclosure.Button className='flex w-full justify-between rounded-lg bg-blue-100 px-4 py-2 text-left  font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring focus-visible:ring-blue-500 focus-visible:ring-opacity-75'>
										<span>Qualification</span>
										<ChevronUpIcon
											className={`${
												open ? 'rotate-180 transform' : ''
											} h-5 w-5 text-blue-500`}
										/>
									</Disclosure.Button>
									<Disclosure.Panel className='px-4 pt-4 pb-2'>
										{stage === 0 ? (
											<Preparation />
										) : (
											<p>
												You can proceed the recordings in the "Recording"
												section below.
											</p>
										)}
									</Disclosure.Panel>
								</>
							)}
						</Disclosure>
						<Disclosure as='div' className='mt-2'>
							{({ open }) => (
								<>
									<Disclosure.Button className='flex w-full justify-between rounded-lg bg-blue-100 px-4 py-2 text-left  font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring focus-visible:ring-blue-500 focus-visible:ring-opacity-75'>
										<span>Recording</span>
										<ChevronUpIcon
											className={`${
												open ? 'rotate-180 transform' : ''
											} h-5 w-5 text-blue-500`}
										/>
									</Disclosure.Button>
									<Disclosure.Panel className='px-4 pt-4 pb-2'>
										{stage === 0 ? (
											<p>
												Please do a check first in the section "Qualification"
												section above.
											</p>
										) : (
											<Recorder />
										)}
									</Disclosure.Panel>
								</>
							)}
						</Disclosure>
					</div>
				</div>
				{/* <Visualizer /> */}
				{/* {stage === 0 && <Preparation />} */}
				{/* <div className='text-3xl'>{Math.floor(dB)}dB</div> */}

				{/* <div className='flex gap-[2px] items-center h-[100px]'>
          {volLevel &&
            volLevel.slice(-length / 2).map((x, i) => {
              return (
                <div
                  className={`w-[2px] bg-slate-600`}
                  style={{
                    height: `${x * 1000}px`,
                    maxHeight: '200px',
                    transition: 'height 100ms ease',
                  }}
                  key={i}
                ></div>
              );
            })}
        </div> */}
				{/* {stage === 1 && <Recorder />} */}
			</main>

			<footer></footer>
		</div>
	);
}

export default App;
