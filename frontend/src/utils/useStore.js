import create from 'zustand';

const getLocalStorage = (key) => {
	let value = null;
	if (typeof window !== 'undefined') {
		console.log('localStorage reached: ', key);
		value = JSON.parse(window.localStorage.getItem(key));
	}

	return value;
};
const setLocalStorage = (key, value) => {
	if (typeof window !== 'undefined') {
		window.localStorage.setItem(key, JSON.stringify(value));
	}
};

export const useStore = create((set) => ({
	stage: getLocalStorage('stage') || 0,
	setStage: (stage) =>
		set(() => {
			setLocalStorage('stage', stage);
			return { stage };
		}),
	dB: 0,
	volHistory: [],
	setdB: (dB) => set(() => ({ dB })),
	setVolHistory: (e) =>
		set((state) => ({ volHistory: [...state.volHistory, e] })),
	sliceVolHistory: (e) =>
		set((state) => ({ volHistory: state.volHistory.slice(0, e) })),
}));
