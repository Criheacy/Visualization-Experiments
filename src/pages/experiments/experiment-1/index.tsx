import React, { useEffect, useState } from "react";
import * as d3 from "d3";
import styled from "@emotion/styled";
import BarChart from "./bar-chart";
import PieChart from "./pie-chart";
import TreeChart from "./tree-chart";
import NumericChart from "./numeric-chart";
import chroma from "chroma-js";
import { ExperimentHeader } from "../experiment-header";

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

export interface ChartDataProps {
  data: ChartDataItem[];
  colorMap: (className: string, gender: string) => string;
  // dimensions: [number, number];
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

const Legend = ({
  data,
  colorMap,
}: {
  data: ChartDataItem[];
  colorMap: (className: string, gender: string) => string;
}) => {
  return (
    <>
      <LegendGroup>
        <LegendLabel>female:</LegendLabel>
        {data.map((item) => (
          <LegendCard color={colorMap(item.class, "female")}>
            {item.class}
          </LegendCard>
        ))}
      </LegendGroup>
      <LegendGroup>
        <LegendLabel>male:</LegendLabel>
        {data.map((item) => (
          <LegendCard color={colorMap(item.class, "male")}>
            {item.class}
          </LegendCard>
        ))}
      </LegendGroup>
    </>
  );
};

export const ExperimentOne = () => {
  const [data, setData] = useState<ChartDataItem[] | undefined>();

  useEffect(() => {
    d3.csv(
      "../../experiment-data/experiment-1/titanic_disaster.csv",
      d3.autoType
    ).then((data) => setData(toChartItem(data as TitanicDisasterItem[])));
  }, []);

  const colorMap = (className: string, gender: string) =>
    chroma(
      d3
        .scaleOrdinal()
        .domain(data?.map((item) => item.class) || [])
        .range(["#ff9600", "#00cd77", "#36bfff", "#ba7cff"])(
        className
      ) as string
    )
      .brighten(gender === "female" ? 0.4 : -0.4)
      .hex();

  return (
    <Container>
      {data ? (
        <>
          <ExperimentHeader
            title={"可视化入门"}
            customElement={<Legend data={data} colorMap={colorMap} />}
          />
          <ChartContainer id={"1"}>
            <BarChart data={data} colorMap={colorMap} />
          </ChartContainer>
          <ChartContainer id={"2"}>
            <PieChart data={data} colorMap={colorMap} />
          </ChartContainer>
          <ChartContainer id={"3"}>
            <TreeChart data={data} colorMap={colorMap} />
          </ChartContainer>
          <ChartContainer id={"4"}>
            <NumericChart data={data} colorMap={colorMap} />
          </ChartContainer>
        </>
      ) : null}
    </Container>
  );
};

const Container = styled.div`
  display: grid;
  width: 100%;
  height: 100%;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 15rem 1fr 1fr;
  grid-template-areas:
    "header header"
    "chart-1 chart-2"
    "chart-3 chart-4";
  grid-gap: 1rem;
`;

const LegendGroup = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 1rem;
`;

const LegendLabel = styled.div`
  width: 5rem;
  text-align: right;
`;

const LegendCard = styled.div<{ color: string }>`
  margin: 0 0.6rem;
  padding: 0.2rem 0;
  width: 6.5rem;
  background-color: ${(props) => props.color};
  text-align: center;
`;

const ChartContainer = styled.div<{ id: string }>`
  grid-area: chart-${(props) => props.id};
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 3rem;
  color: #808080;
`;
