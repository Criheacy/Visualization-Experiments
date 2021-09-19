import styled from "@emotion/styled";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";

export const IndexPage = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <ul>
        {Array.from(Array(1).keys(), (index) => index + 1).map((index) => (
          <li>
            <Button onClick={() => navigate(`experiments/${index}`)}>
              实验{index}
            </Button>
          </li>
        ))}
      </ul>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  height: 100vh;
  padding: 20px;
`;
