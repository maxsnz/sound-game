export let audioContext: AudioContext | undefined;
export let analyser: AnalyserNode | undefined;

declare global {
  interface Window {
    webkitAudioContext: AudioContext;
  }
}

document.addEventListener("click", init, false);

function init() {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  document.removeEventListener("click", init, false);
  audioContext = new (AudioContext || window.webkitAudioContext)();
  analyser = audioContext.createAnalyser();
}
