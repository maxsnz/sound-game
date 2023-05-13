import { analyser, audioContext } from "./audioContext";
import { autoCorrelate } from "./autoCorrelate";

export function startSoundCheck(
  minRef: React.MutableRefObject<number>,
  maxRef: React.MutableRefObject<number>,
  isFinishedRef: React.MutableRefObject<boolean>
) {
  if (!audioContext || !analyser) {
    setTimeout(() => {
      startSoundCheck(minRef, maxRef, isFinishedRef);
    }, 100);
    return;
  }

  startSound();

  function visualize() {
    let previousValueToDisplay = 0;
    let smoothingCount = 0;
    let smoothingThreshold = 5;
    let smoothingCountThreshold = 5;
    let min = 0;
    let max = 0;

    const drawNote = function () {
      if (isFinishedRef.current) return;
      requestAnimationFrame(drawNote);
      if (!analyser || !audioContext) return;

      const minEl = document.getElementById("sound-check-min");
      const maxEl = document.getElementById("sound-check-max");
      if (!minEl || !maxEl) throw Error();

      const bufferLength = analyser.fftSize;
      const buffer = new Float32Array(bufferLength);
      analyser.getFloatTimeDomainData(buffer);
      const autoCorrelateValue = autoCorrelate(buffer, audioContext.sampleRate);

      // Handle rounding
      let valueToDisplay = autoCorrelateValue;
      valueToDisplay = Math.round(valueToDisplay);
      if (autoCorrelateValue === -1) {
        return;
      }
      smoothingThreshold = 10;
      smoothingCountThreshold = 5;
      function noteIsSimilarEnough() {
        // Check threshold for number, or just difference for notes.
        if (typeof valueToDisplay == "number") {
          return (
            Math.abs(valueToDisplay - previousValueToDisplay) <
            smoothingThreshold
          );
        } else {
          return valueToDisplay === previousValueToDisplay;
        }
      }
      // Check if this value has been within the given range for n iterations
      if (noteIsSimilarEnough()) {
        if (smoothingCount < smoothingCountThreshold) {
          smoothingCount++;
          return;
        } else {
          previousValueToDisplay = valueToDisplay;
          smoothingCount = 0;
        }
      } else {
        previousValueToDisplay = valueToDisplay;
        smoothingCount = 0;
        return;
      }

      if (typeof valueToDisplay == "number") {
        if (valueToDisplay > max) {
          max = valueToDisplay;
          maxEl.innerHTML = max.toString();
          maxRef.current = max;
        }

        if (min === 0 || valueToDisplay < min) {
          min = valueToDisplay;
          minEl.innerHTML = min.toString();
          minRef.current = min;
        }
      }
    };

    drawNote();
  }

  function startSound() {
    if (!audioContext || !analyser) throw Error();
    let source;

    analyser.minDecibels = -100;
    analyser.maxDecibels = -10;
    analyser.smoothingTimeConstant = 0.85;
    if (!navigator?.mediaDevices?.getUserMedia) {
      // No audio allowed
      alert("Sorry, getUserMedia is required for the app.");
      return;
    } else {
      const constraints = { audio: true };
      navigator.mediaDevices
        .getUserMedia(constraints)
        .then(function (stream) {
          if (!audioContext || !analyser) throw Error();
          // Initialize the SourceNode
          source = audioContext.createMediaStreamSource(stream);
          // Connect the source node to the analyzer
          source.connect(analyser);
          visualize();
        })
        .catch(function (err) {
          console.log(err);
          alert("Error");
        });
    }
  }
}
