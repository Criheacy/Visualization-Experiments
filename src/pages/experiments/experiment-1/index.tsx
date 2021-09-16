import React, { useEffect, useState } from "react";
import * as d3 from "d3";
import BarChart from "./bar-chart";
import styled from "@emotion/styled";
import PieChart from "./pie-chart";
import TreeChart from "./tree-chart";

interface TitanicDisasterItem {
  Class: string;
  Sex: string;
  Count: number;
}

export interface ChartDataItem {
  class: string;
  count: {
    female: number;
    male: number;
  };
}

const toChartItem = (rawData: TitanicDisasterItem[]): ChartDataItem[] =>
  rawData.reduce((prev, rawDataItem) => {
    let prevItem = prev.find((item) => item.class === rawDataItem.Class);
    if (!prevItem) {
      prevItem = { class: rawDataItem.Class, count: { female: 0, male: 0 } };
      prev.push(prevItem);
    }
    prevItem.count[rawDataItem.Sex as "female" | "male"] += rawDataItem.Count;
    return prev;
  }, [] as ChartDataItem[]);

export const ExperimentOne = () => {
  const [data, setData] = useState<ChartDataItem[] | undefined>();

  useEffect(() => {
    d3.csv(
      process.env.PUBLIC_URL +
        "/experiment-data/experiment-1/titanic_disaster.csv",
      d3.autoType
    ).then((data) => setData(toChartItem(data as TitanicDisasterItem[])));
  }, []);

  return (
    <ContentContainer>
      {data ? (
        <>
          <ChartContainer id={"1"}>
            <BarChart data={data} />
          </ChartContainer>
          <ChartContainer id={"2"}>
            <PieChart data={data} />
          </ChartContainer>
          <ChartContainer id={"3"}>
            <TreeChart data={data} />
          </ChartContainer>
          <ChartContainer id={"4"}></ChartContainer>
        </>
      ) : null}
    </ContentContainer>
  );
};

const ContentContainer = styled.div`
  display: grid;
  width: 100%;
  height: 100%;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  grid-template-areas:
    "chart-1 chart-2"
    "chart-3 chart-4";
  grid-gap: 1rem;
`;

const ChartContainer = styled.div<{ id: string }>`
  grid-area: chart-${(props) => props.id};
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 3rem;
  color: #808080;
`;
