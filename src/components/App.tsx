// import { useState } from "react";

import { useState } from "react";
import Game from "./Game";
import SoundCheck from "./SoundCheck";

function App() {
  const [volDiff, setVolDiff] = useState<number>(0);

  const [soundCheckPassed, setSoundCheckPassed] = useState(false);

  const onFinishSoundCheck = (val: number) => {
    setVolDiff(val);
    setSoundCheckPassed(true);
  };

  return (
    <>
      {!soundCheckPassed && <SoundCheck onFinish={onFinishSoundCheck} />}
      {soundCheckPassed && <Game volDiff={volDiff} />}
    </>
  );
}

export default App;
