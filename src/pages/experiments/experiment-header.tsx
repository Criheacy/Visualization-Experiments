import React from "react";
import styled from "@emotion/styled";
import { useParams } from "react-router-dom";

export const ExperimentHeader = ({
  title,
  customElement,
}: {
  title: string;
  customElement?: JSX.Element;
}) => {
  const { experimentId } = useParams();

  return (
    <Header>
      <Title>
        实验#{experimentId} - {title}
      </Title>
      <Divider />
      {customElement}
    </Header>
  );
};

const Header = styled.div`
  grid-area: header;
  display: flex;
  width: 100%;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Title = styled.div`
  font-size: 3rem;
  font-weight: bold;
`;

const Divider = styled.div`
  margin: 1rem 2rem;
  background-color: #e0e0e0;
  height: 2px;
  width: 100%;
`;
