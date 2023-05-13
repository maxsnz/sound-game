import styled from "styled-components";
import GameConstructor from "../utils/game";
import { useState } from "react";

const game = new GameConstructor();

const Container = styled.div`
  width: 800px;
  margin: 0 auto;
`;

const Canvas = styled.canvas`
  background: #fff;
`;

const Panels = styled.div`
  text-align: left;
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
`;

const Panel = styled.div`
  padding: 5px;
  background: #fff;
  font-size: 10px;
  display: inline-block;
  legend {
    font-weight: bold;
  }
`;

const Button = styled.button`
  padding: 20px 50px;
  background: #acacac;
  font-size: 20px;
`;

const Game: React.FC<{ volDiff: number }> = ({ volDiff }) => {
  const [state, setState] = useState("initial");

  const onEnd = () => {
    console.log("end");
    setState("finish");
  };

  const onStartClick = () => {
    setState("playing");
    game.startGame(volDiff, onEnd);
  };

  // const onRestartClick = () => {
  //   setState("playing");
  //   game.restartGame(onEnd);
  // };

  return (
    <Container>
      <Panels>
        <Panel>
          <legend>Tone level:</legend>
          <span id="note">0</span>
        </Panel>
        <Panel>
          <legend>Smoothing options:</legend>
          <input
            type="radio"
            id="smoothingNone"
            name="smoothing"
            value="none"
          />
          <label htmlFor="smoothingNone">No smoothing</label>
          <br />
          <input
            type="radio"
            id="smoothingMedium"
            name="smoothing"
            value="basic"
            checked
          />
          <label htmlFor="smoothingMedium">Basic smoothing</label>
          <br />
          <input
            type="radio"
            id="smoothingHard"
            name="smoothing"
            value="very"
          />
          <label htmlFor="smoothingHard">
            Very smoothed (note must be more consistent and held for longer)
          </label>
        </Panel>
        {/* <Panel>
          <legend>Tone correction factor:</legend>
          <input type="number" id="voldiff" name="voldiff" value={volDiff} />
        </Panel> */}
        {state === "initial" && (
          <Panel>
            <Button onClick={onStartClick}>Start</Button>
          </Panel>
        )}
        {state === "finish" && (
          <Panel>
            <Button onClick={onStartClick}>Restart</Button>
          </Panel>
        )}
      </Panels>
      <Canvas id="gameCanvas" width="800" height="600"></Canvas>
    </Container>
  );
};

export default Game;
