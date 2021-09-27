import * as d3 from "d3";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSVG } from "../../../hooks/useD3";
import styled from "@emotion/styled";

interface SunshineDataItem {
  city: string;
  lon: number;
  lat: number;
  month: string;
  monthnum: number;
  sunshine: number;
}

interface ChartDataItem {
  city: string;
  longitude: number; // horizontal lines
  latitude: number; // vertical lines
  sunshine: {
    month: string;
    value: number;
  }[];
}

const toChartItem = (rawData: SunshineDataItem[]): ChartDataItem[] =>
  rawData.reduce((prev, rawDataItem) => {
    let prevItem = prev.find((item) => item.city === rawDataItem.city);
    if (!prevItem) {
      prevItem = {
        city: rawDataItem.city,
        longitude: rawDataItem.lon,
        latitude: rawDataItem.lat,
        sunshine: [],
      };
      prev.push(prevItem);
    }
    prevItem.sunshine.push({
      month: rawDataItem.month,
      value: rawDataItem.sunshine,
    });
    return prev;
  }, [] as ChartDataItem[]);

export const ExperimentTwo = () => {
  const [data, setData] = useState<ChartDataItem[] | undefined>();
  const [mapSVG, setMapSVG] = useState<XMLDocument | undefined>();
  const { experimentId } = useParams();

  useEffect(() => {
    d3.csv("../../experiment-data/experiment-2/sunshine.csv", d3.autoType).then(
      (data) => setData(toChartItem(data as SunshineDataItem[]))
    );
    d3.xml("../../experiment-data/experiment-2/usa.svg").then((data) =>
      setMapSVG(data)
    );
  }, []);

  console.log(mapSVG?.documentElement);

  const svgRef = useSVG(
    (svg) => {
      if (mapSVG) {
        svg
          .append("g")
          .attr("class", "background-map")
          .node()
          ?.append(mapSVG.documentElement);
      }
    },
    [data, mapSVG]
  );

  return (
    <Container>
      <svg
        ref={svgRef}
        style={{
          width: "1280",
          height: "760",
          margin: "auto",
        }}
      />
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;
