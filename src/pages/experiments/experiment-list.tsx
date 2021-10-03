import styled from "@emotion/styled";
import { useNavigate } from "react-router-dom";

export const ExperimentList = () => {
  const navigate = useNavigate();

  return (
    <Container id={"experiment-list"}>
      <TitleBlock>
        <Title>实验列表</Title>
      </TitleBlock>
      <ContentBlock>
        <ContentCard onClick={() => navigate("experiments/1")}>
          <CardTitleContainer>
            <CardTitle>实验#1 - Titanic Disaster</CardTitle>
            <CardSubTitle>
              1. 学会 D3 or vega 基本开发 2. 基于至少3钟不同的方法(bar chart,
              parallel set, scatter matrix，star
              plot等）把这个数据（如后图）可视化出来。
            </CardSubTitle>
          </CardTitleContainer>
          <CardChartContainer>
            我还不知道怎么调整图的大小能让它放进这个框里
          </CardChartContainer>
        </ContentCard>
        <ContentCard onClick={() => navigate("experiments/2")}>
          <CardTitleContainer>
            <CardTitle>实验#2 - Sunshine in U.S. Cities</CardTitle>
            <CardSubTitle>
              https://courses.cs.washington.edu/courses/cse412/21wi/a1.html 2.
              加上熟悉d3中的log scale 与tick mark 生成
            </CardSubTitle>
          </CardTitleContainer>
          <CardChartContainer />
        </ContentCard>
        <ContentCard onClick={() => navigate("experiments/3")}>
          <CardTitleContainer>
            <CardTitle>实验#3 -（尚未发布）</CardTitle>
          </CardTitleContainer>
          <CardChartContainer />
        </ContentCard>
      </ContentBlock>
    </Container>
  );
};

const Container = styled.div`
  // to be added
  padding-bottom: 2rem;
`;

const TitleBlock = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 5rem 0 3.5rem 0;
`;

const Title = styled.div`
  font-size: 4rem;
  font-weight: bold;
`;

const ContentBlock = styled.div`
  margin: 0 10rem;
`;

const ContentCard = styled.div`
  margin: 0 auto 3.5rem auto;
  border: 0.2rem solid #000000;
  border-left: 1rem solid #000000;
  max-width: 100rem;
  display: flex;
  justify-content: space-between;
  cursor: pointer;
`;

const CardTitleContainer = styled.div`
  padding: 1rem 2rem;
  height: 12rem;
  width: calc(100% - 20rem);
  overflow: hidden;
`;

const CardTitle = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
`;

const CardSubTitle = styled.div`
  font-size: 2.05rem;
  color: #404040;
`;

const CardChartContainer = styled.div`
  height: 12rem;
  width: 20rem;
  background-color: #e0e0e0;
  font-size: 2rem;
  padding: 1rem;
`;
