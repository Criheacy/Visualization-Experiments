import styled from "@emotion/styled";
import { ExperimentList } from "../experiments/experiment-list";

export const HomePage = () => {
  const redirect = (url: string) => {
    window.location.href = url;
  };

  return (
    <>
      <TitleBlock>
        <CenterBlock>
          <MainTitle>Criheacy 的可视化实验展示</MainTitle>
          <SubTitle>
            The Visualization Experiments Exhibition of Criheacy
          </SubTitle>
          <TitleButton>下拉查看所有实验</TitleButton>
        </CenterBlock>
        <AsideBlock>
          <Button
            onClick={() =>
              redirect("https://github.com/Criheacy/Visualization-Experiments")
            }
          >
            <i className="fab fa-github" style={{ marginRight: "1rem" }} />
            GitHub
          </Button>
          <Button
            onClick={() =>
              redirect("https://docs.qq.com/sheet/DQ3ZHaUxscEFyR1VS?tab=BB08J2")
            }
          >
            Guide
          </Button>
          <Button
            onClick={() => {
              redirect("mailto: hekaiqi@mail.sdu.edu.cn");
            }}
          >
            Contact Me
          </Button>
        </AsideBlock>
      </TitleBlock>
      <ExperimentList />
    </>
  );
};

const TitleBlock = styled.div`
  width: 100%;
  height: 100vh;
  border-bottom: 0.1rem solid black;
`;

const CenterBlock = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const MainTitle = styled.div`
  font-weight: bold;
  font-size: 6rem;
`;

const SubTitle = styled.div`
  margin-top: -0.5rem;
  font-size: 2.5rem;
  color: #404040;
`;

const AsideBlock = styled.div`
  position: absolute;
  width: 100%;
  top: 0;
  padding: 2rem 3rem;
  font-size: 3rem;
  display: flex;
  justify-content: end;
  flex-direction: row;
  // background-color: #ffffff80;
`;

const Button = styled.div`
  margin-left: 2rem;
  border: 0.2rem solid #404040;
  padding: 0 1rem;
  color: #404040;
  cursor: pointer;
  :hover {
    border: 0.2rem dashed black;
    color: black;
  }
`;

const TitleButton = styled.div`
  margin-top: 3rem;
  font-size: 2.8rem;
  border: 0.2rem solid black;
  padding: 0.35rem 1.35rem;
  cursor: pointer;
  :hover {
    border: 0.2rem dashed black;
    color: black;
  }
`;
