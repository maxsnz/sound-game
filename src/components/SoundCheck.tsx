import { useRef, useState } from "react";
import styled from "styled-components";
import { startSoundCheck } from "../utils/soundCheck";

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
`;
const Inner = styled.div`
  padding: 20px;
  background: #fff;
`;
const Title = styled.div`
  font-size: 20px;
  margin-bottom: 10px;
`;
const Scale = styled.div`
  margin-bottom: 10px;
`;
const Description = styled.div`
  margin-bottom: 10px;
`;

const Button = styled.button`
  display: block;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.4);
  & + & {
    margin-top: 10px;
  }
`;

const SoundCheck: React.FC<{ onFinish: (volDiff: number) => void }> = ({
  onFinish,
}) => {
  const volDiff = useRef(parseInt(localStorage.getItem("VOLDIFF") || "0", 10));
  const min = useRef<number>(0);
  const max = useRef<number>(0);
  const isFinishedRef = useRef<boolean>(false);

  const [state, setState] = useState("initial");

  const onStartClick = () => {
    setState("started");
    startSoundCheck(min, max, isFinishedRef);
  };
  const onFinishClick = () => {
    if (max.current === 0 || min.current === 0) return;

    isFinishedRef.current = true;
    localStorage.setItem("VOLDIFF", (max.current - min.current).toString());
    onFinish(max.current - min.current);
  };

  const onSkipClick = () => {
    onFinish(volDiff.current);
  };

  return (
    <Container>
      <Inner>
        <Title>Саундчек</Title>
        {state === "initial" && (
          <Button onClick={onStartClick}>
            {volDiff.current ? "Пройти саундчек повторно" : "Начать"}
          </Button>
        )}
        {state === "initial" && volDiff.current ? (
          <Button onClick={onSkipClick}>Играть</Button>
        ) : null}
        {state === "started" && (
          <>
            <Description>
              Спойте свою самую низкую и самую высокую ноту. После этого нажмите
              "Продолжить"
            </Description>
            <Scale>
              <div>
                max: <span id="sound-check-max">0</span>
              </div>
              <div>
                min: <span id="sound-check-min">0</span>
              </div>
            </Scale>
            <Button onClick={onFinishClick}>Продолжить</Button>
          </>
        )}
      </Inner>
    </Container>
  );
};

export default SoundCheck;
