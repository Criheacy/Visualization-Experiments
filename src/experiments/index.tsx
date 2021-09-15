import { Route, Routes, useParams } from "react-router-dom";
import { ExperimentOne } from "./exp1";
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
    <Container>
      <ExperimentOne />
    </Container>
  );

  // return <div>{experimentId}</div>
};

const Container = styled.div`
  width: 100%;
  height: 100vh;
  padding: 20px;
`;
