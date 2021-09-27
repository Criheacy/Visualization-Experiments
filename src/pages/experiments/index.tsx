import { Route, Routes, useParams } from "react-router-dom";
import styled from "@emotion/styled";
import { ExperimentOne } from "./experiment-1";
import { ExperimentTwo } from "./experiment-2";

export const ExperimentPage = () => {
  return (
    <Routes>
      <Route path={":experimentId/*"} element={<Experiment />} />
    </Routes>
  );
};

export const Experiment = () => {
  const { experimentId } = useParams();

  return (
    <Container>
      {+experimentId === 1 ? (
        <ExperimentOne />
      ) : +experimentId === 2 ? (
        <ExperimentTwo />
      ) : null}
    </Container>
  );

  // return <div>{experimentId}</div>
};

const Container = styled.div`
  width: 100%;
  height: 100vh;
  padding: 20px;
`;
