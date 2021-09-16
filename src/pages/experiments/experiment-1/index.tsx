import React, { useEffect, useState } from "react";
import * as d3 from "d3";
import BarChart from "./bar-chart";
import styled from "@emotion/styled";
import PieChart from "./pie-chart";

interface TitanicDisasterItem {
  Class: string;
  Sex: string;
  Count: number;
}

export interface BarChartItem {
  class: string;
  count: {
    female: number;
    male: number;
  };
}

const toChartItem = (rawData: TitanicDisasterItem[]): BarChartItem[] =>
  rawData.reduce((prev, rawDataItem) => {
    let prevItem = prev.find((item) => item.class === rawDataItem.Class);
    if (!prevItem) {
      prevItem = { class: rawDataItem.Class, count: { female: 0, male: 0 } };
      prev.push(prevItem);
    }
    prevItem.count[rawDataItem.Sex as "female" | "male"] += rawDataItem.Count;
    return prev;
  }, [] as BarChartItem[]);

export const ExperimentOne = () => {
  const [data, setData] = useState<BarChartItem[] | undefined>();

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
          <ChartContainer id={"3"}></ChartContainer>
          <ChartContainer id={"4"}></ChartContainer>
        </>
      ) : null}
    </ContentContainer>
  );
};
