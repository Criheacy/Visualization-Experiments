import styled from "@emotion/styled";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";

export const IndexPage = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <li>
        {Array.from(Array(1).keys(), (index) => index + 1).map((index) => (
          <ul>
            <Button onClick={() => navigate(`experiments/${index}`)}>
              实验{index}
            </Button>
          </ul>
        ))}
      </li>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  height: 100vh;
  padding: 20px;
`;
