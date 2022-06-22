import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

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

	const [barsArray, setbarsArray] = useState([]);
	const [length, setlength] = useState(0);
	const volLevel = useStore((state) => state.volHistory);
	const sliceVolLevel = useStore((state) => state.sliceVolHistory);
	const dB = useStore((state) => state.dB);

	const size = useWindowSize();

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
				<h1 className='text-4xl'>Record Audio</h1>
				{/* <Visualizer /> */}
				{stage === 0 && <Preparation />}
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
				{stage === 1 && <Recorder />}
			</main>

			<footer></footer>
		</div>
	);
}

export default App;
