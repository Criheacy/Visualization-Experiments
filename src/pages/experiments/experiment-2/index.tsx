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
  const [locationSVG, setLocationSVG] = useState<XMLDocument | undefined>();
  const { experimentId } = useParams();

  const resourcePath = `../../experiment-data/experiment-${experimentId}/`;

  useEffect(() => {
    // load data from csv file
    d3.csv(resourcePath + "sunshine.csv", d3.autoType).then((data) =>
      setData(toChartItem(data as SunshineDataItem[]))
    );

    console.log(
      "../../experiment-data/experiment-2/usa.svg" === resourcePath + "usa.svg"
    );

    // load US map from svg
    d3.xml(resourcePath + "usa.svg").then((data) => setMapSVG(data));
    // load location map from svg
    d3.xml(resourcePath + "location.svg").then((data) => {
      console.log("data:", data);
      setLocationSVG(data);
    });
  }, [experimentId, resourcePath]);

  // map configurations
  const mapConfig = {
    canvasWidth: 1600,
    canvasHeight: 600,
    mapWidth: 1280,
    mapHeight: 600,
    margin: { left: 160, right: 160 },
    blockGap: 5,
    blockHeight: 20,
    offset: { x: 2519, y: 1130 },
    scale: { x: 17.9, y: -21.6 },
    fontSize: 18,

    blockStrokeWidth: 2,
  };

  const locationIconConfig = {
    offset: { x: -56.5, y: -40 },
    scale: { x: 0.07, y: 0.07 },
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
      if (!mapSVG || !locationSVG || !data) {
        return;
      }

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
        .attr("stroke", "black")
        .attr("stroke-opacity", 0.5);

      // right divider
      svg
        .select(".plot-area")
        .append("line")
        .attr("class", "right-divider")
        .attr("x1", mapConfig.canvasWidth - mapConfig.margin.right)
        .attr("x2", mapConfig.canvasWidth - mapConfig.margin.right)
        .attr("y1", 0)
        .attr("y2", mapConfig.canvasHeight)
        .attr("stroke", "black")
        .attr("stroke-opacity", 0.5);

      // draw standard vertical axis for each month (top aligned)
      svg.select(".plot-area").append("g").attr("class", "top-label");
      data[0].sunshine.forEach((sunshineItem, index) => {
        // container
        svg
          .select(".top-label")
          .append("g")
          .attr("class", sunshineItem.month)
          .attr(
            "transform",
            `translate(${
              (index * contentWidth) / monthCount + mapConfig.margin.left
            }, 12)`
          );

        // background-rect
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

        // label
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
      });

      data.forEach((cityItem) => {
        const cityX =
          cityItem.longitude * mapConfig.scale.x + mapConfig.offset.x;
        const cityY =
          cityItem.latitude * mapConfig.scale.y + mapConfig.offset.y;
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
          .append("g")
          .attr(
            "transform",
            `translate(${locationIconConfig.offset.x}, ${locationIconConfig.offset.y})` +
              `scale(${locationIconConfig.scale.x}, ${locationIconConfig.scale.y})`
          )
          .node()
          // ATTENTION: the append method will attach the document element to DOM tree,
          // and apparently you cannot attach one document element to multiple locations.
          // So you should create a deep clone of it to append.
          ?.append(locationSVG.documentElement?.cloneNode(true));

        let labelXOffset = 20;
        let labelYOffset = -30;

        // the label of New-York is blocked, so set specific value for it
        if (cityItem.city === "New-York") {
          labelXOffset = 0;
          labelYOffset = -55;
        }

        const labelWidth =
          (cityItem.city.length * mapConfig.fontSize) / 2.2 + 20;
        const labelHeight = mapConfig.fontSize + 6;

        // label frame on marker
        svg
          .select(`.city-${cityItem.city}`)
          .append("rect")
          .attr("x", labelXOffset)
          .attr("y", -labelHeight / 2 + labelYOffset)
          .attr("width", labelWidth)
          .attr("height", labelHeight)
          .attr("rx", labelHeight / 2)
          .attr("fill", "#E0E0E0");

        // label on marker
        svg
          .select(`.city-${cityItem.city}`)
          .append("text")
          .text(cityItem.city)
          .attr("x", labelWidth / 2 + labelXOffset)
          .attr("y", labelYOffset + mapConfig.fontSize / 2.5)
          // .attr("font-family", "monospace")
          .attr("font-size", mapConfig.fontSize)
          .attr("text-anchor", "middle");
      });

      // place US map
      svg
        .append("g")
        .attr("class", "background-map")
        .attr("width", mapConfig.canvasWidth)
        .attr("height", mapConfig.canvasHeight)
        .node()
        ?.append(mapSVG.documentElement?.cloneNode(true));
    },
    [data, mapSVG, locationSVG]
  );

  return (
    <Container>
      <svg
        ref={svgRef}
        style={{
          width: "1600",
          height: "600",
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
