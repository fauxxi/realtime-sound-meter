import create from 'zustand';

export const useStore = create((set) => ({
	dB: 0,
	volHistory: [],
	setdB: (dB) => set((state) => ({ dB })),
	setVolHistory: (e) =>
		set((state) => ({ volHistory: [...state.volHistory, e] })),
	sliceVolHistory: (e) =>
		set((state) => ({ volHistory: state.volHistory.slice(0, e) })),
}));
