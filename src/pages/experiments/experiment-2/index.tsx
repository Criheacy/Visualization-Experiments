import * as d3 from "d3";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSVG } from "../../../hooks/useD3";
import styled from "@emotion/styled";
import chroma from "chroma-js";

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
  rawData
    .reduce((prev, rawDataItem) => {
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
    }, [] as ChartDataItem[])
    // city name with spaces works incorrectly in selector,
    // so replace it with dash character "-".
    .map((item) => ({ ...item, city: item.city.replaceAll(" ", "-") }));

export const ExperimentTwo = () => {
  const [data, setData] = useState<ChartDataItem[] | undefined>();
  const [mapSVG, setMapSVG] = useState<XMLDocument | undefined>();
  const { experimentId } = useParams();

  useEffect(() => {
    // load data from csv file
    d3.csv("../../experiment-data/experiment-2/sunshine.csv", d3.autoType).then(
      (data) => setData(toChartItem(data as SunshineDataItem[]))
    );
    // load US map from svg
    d3.xml("../../experiment-data/experiment-2/usa.svg").then((data) =>
      setMapSVG(data)
    );
  }, []);

  // map configurations
  const mapConfig = {
    canvasWidth: 1600,
    canvasHeight: 720,
    mapWidth: 1280,
    mapHeight: 720,
    margin: { left: 160, right: 160 },
    blockGap: 5,
    blockHeight: 24,
    offset: { x: 2865, y: 1355 },
    scale: { x: 21.5, y: -25.9 },
    fontSize: 20,

    blockStrokeWidth: 2,
  };

  // intermediate variable for simplifying calculations
  const contentWidth =
    mapConfig.canvasWidth - mapConfig.margin.left - mapConfig.margin.right;

  const colorMap = (
    value: number,
    type: "foreground" | "background" = "background"
  ) => {
    if (type === "foreground") {
      return 1 - value / 365 < 0.45 ? "black" : "white";
    } else {
      return chroma
        .bezier(["yellow", "red", "black"])(1 - value / 365)
        .hex();
    }
  };

  const svgRef = useSVG(
    (svg) => {
      if (mapSVG) {
        // place US map
        svg
          .append("g")
          .attr("class", "background-map")
          .attr("width", mapConfig.canvasWidth)
          .attr("height", mapConfig.canvasHeight)
          .node()
          ?.append(mapSVG.documentElement);
      }
      if (!data) return;

      // city plot container
      svg
        .append("g")
        .attr("class", "plot-area")
        .attr("width", mapConfig.mapWidth)
        .attr("height", mapConfig.mapHeight);

      const monthCount = data[0].sunshine.length; // 12

      // dividers
      // left divider
      svg
        .select(".plot-area")
        .append("line")
        .attr("class", "left-divider")
        .attr("x1", mapConfig.margin.left - mapConfig.blockGap)
        .attr("x2", mapConfig.margin.left - mapConfig.blockGap)
        .attr("y1", 0)
        .attr("y2", mapConfig.canvasHeight)
        .attr("stroke", "black");

      // right divider
      svg
        .select(".plot-area")
        .append("line")
        .attr("class", "right-divider")
        .attr("x1", mapConfig.canvasWidth - mapConfig.margin.right)
        .attr("x2", mapConfig.canvasWidth - mapConfig.margin.right)
        .attr("y1", 0)
        .attr("y2", mapConfig.canvasHeight)
        .attr("stroke", "black");

      // draw standard vertical axis for each month (top aligned)
      svg.select(".plot-area").append("g").attr("class", "top-label");
      data[0].sunshine.forEach((sunshineItem, index) => {
        svg
          .select(".top-label")
          .append("g")
          .attr("class", sunshineItem.month)
          .attr(
            "transform",
            `translate(${
              (index * contentWidth) / monthCount + mapConfig.margin.left
            }, 20)`
          );

        svg
          .select(`.${sunshineItem.month}`)
          .append("rect")
          .attr("x", mapConfig.blockStrokeWidth / 2)
          .attr("y", -mapConfig.blockHeight / 2)
          .attr(
            "width",
            contentWidth / monthCount -
              mapConfig.blockGap -
              mapConfig.blockStrokeWidth
          )
          .attr("height", mapConfig.blockHeight)
          .attr("fill", "black")
          .attr("fill-opacity", 0.05)
          .attr("stroke", "black")
          .attr("stroke-width", mapConfig.blockStrokeWidth)
          .attr("stroke-opacity", 0.15);

        svg
          .select(`.${sunshineItem.month}`)
          .append("text")
          .attr("x", contentWidth / monthCount / 2)
          .attr("y", "0.4em")
          .text(sunshineItem.month)
          .attr("font-size", mapConfig.fontSize)
          .attr("text-anchor", "middle");
      });

      // draw vertical axis for each city
      data.forEach((cityItem) => {
        const cityX =
          cityItem.longitude * mapConfig.scale.x + mapConfig.offset.x;
        const cityY =
          cityItem.latitude * mapConfig.scale.y + mapConfig.offset.y;

        // draw block for each month
        cityItem.sunshine.forEach((sunshineItem, index) => {
          // block container
          svg
            .select(".plot-area")
            .append("g")
            .attr("class", `${cityItem.city}-${sunshineItem.month}`)
            .attr(
              "transform",
              `translate(${
                (index * contentWidth) / monthCount + mapConfig.margin.left
              }, ${cityY})`
            );

          // sunshine value block for each month
          svg
            .select(`.${cityItem.city}-${sunshineItem.month}`)
            .append("rect")
            .attr("y", -mapConfig.blockHeight / 2)
            .attr("width", contentWidth / monthCount - mapConfig.blockGap)
            .attr("height", mapConfig.blockHeight)
            .attr("fill", colorMap(sunshineItem.value));

          // text on sunshine block
          svg
            .select(`.${cityItem.city}-${sunshineItem.month}`)
            .append("text")
            .attr("x", contentWidth / monthCount / 2)
            .attr("y", "0.4em")
            .text(sunshineItem.value)
            .attr("font-size", mapConfig.fontSize)
            .attr("text-anchor", "middle")
            .attr("fill", colorMap(sunshineItem.value, "foreground"));
        });

        // city marker container
        svg
          .select(".plot-area")
          .append("g")
          .attr("class", `city-${cityItem.city}`)
          .attr("transform", `translate(${cityX}, ${cityY})`);

        // longitude value of each city on y-axis label (left aligned)
        svg
          .select(`.plot-area`)
          .append("text")
          .attr(
            "transform",
            `translate(${mapConfig.margin.left - 20}, ${cityY})`
          )
          .attr("y", "0.4em")
          .attr("font-size", mapConfig.fontSize)
          .attr("text-anchor", "end")
          .text(cityItem.latitude.toFixed(1) + "°N");

        // city location marker
        svg
          .select(`.city-${cityItem.city}`)
          .append("circle")
          .attr("r", 5)
          .attr("fill", "#0000FF");

        // label on marker
        svg
          .select(`.city-${cityItem.city}`)
          .append("text")
          .text(cityItem.city)
          .attr("font-size", mapConfig.fontSize)
          .attr("text-anchor", "middle");
      });
    },
    [data, mapSVG]
  );

  return (
    <Container>
      <svg
        ref={svgRef}
        style={{
          width: "1600",
          height: "720",
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
