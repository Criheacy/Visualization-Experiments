import { Route, Routes, useParams } from "react-router-dom";
import { ExperimentOne } from "./experiment-1";
import styled from "@emotion/styled";

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
    <Container>{+experimentId === 1 ? <ExperimentOne /> : null}</Container>
  );

  // return <div>{experimentId}</div>
};

const Container = styled.div`
  width: 100%;
  height: 100vh;
  padding: 20px;
`;
