import { Route, Routes, useParams } from "react-router-dom";
import styled from "@emotion/styled";
import { ExperimentOne } from "./experiment-1";
import { ExperimentTwo } from "./experiment-2";
import { SignInGraph } from "../extra/sign-in-bot";
import { ExperimentList } from "./experiment-list";

export const ExperimentPage = () => {
  return (
    <Routes>
      <Route path={"/"} element={<ExperimentList />} />
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
      ) : experimentId === "extra" ? (
        <SignInGraph />
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
