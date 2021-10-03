import * as d3 from "d3";
import React, { useEffect, useState } from "react";
import { useSVG } from "../../../hooks/useD3";
import styled from "@emotion/styled";
import chroma from "chroma-js";
import { ExperimentHeader } from "../experiment-header";

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

interface MapConfig {
  canvasWidth: number;
  canvasHeight: number;
  mapWidth: number;
  mapHeight: number;
  margin: { left: number; right: number; top: number };
  blockGap: number;
  blockHeight: number;
  offset: Coordinate;
  scale: Coordinate;
  fontSize: number;
  blockStrokeWidth: number;
}

interface Coordinate {
  x: number;
  y: number;
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

const Illustration = ({
  title,
  content,
}: {
  title: string;
  content: string;
}) => {
  return (
    <IllustrationContainer>
      <IllustrationTitle>{title}</IllustrationTitle>
      <IllustrationContentBlock>{content}</IllustrationContentBlock>
    </IllustrationContainer>
  );
};

/**
 * Get the position of divider value appears throw interpolation.
 * @param data the number array.
 * @param divider the divider value.
 * @param numberOnEnd if true, then [-1, len+1] will be added in result.
 * @example
 * input:  [1, 2,   3, 4,    2, 1] divider=2.5
 * output: [     1.5,    3.75    ]
 * ---
 * input:  [2.5, 2,  3,    1,     10, 2.5] divider=2.5
 * output: [ 0,   1.5, 2.25, 3.167,    5 ]
 */
const getDataDivider = (
  data: number[],
  divider: number,
  numberOnEnd?: boolean
) =>
  data.reduce((prev, item, index, array) => {
    if (item === divider) return [...prev, index];
    if (numberOnEnd && index === 0 && divider < item)
      return [...prev, index - 1];
    if (numberOnEnd && index === array.length - 1 && divider < item)
      return [...prev, index + 1];
    if (index === 0) return prev;
    const midpoint = (divider - array[index - 1]) / (item - array[index - 1]);
    if (midpoint > 0 && midpoint < 1) {
      return [...prev, index + midpoint - 1];
    }
    return prev;
  }, [] as number[]);

const direction = (from: Coordinate, to: Coordinate) => {
  return { x: to.x - from.x, y: to.y - from.y };
};

const distance = (c1: Coordinate, c2?: Coordinate) => {
  return Math.sqrt(
    Math.pow(c1.x - (c2?.x || 0), 2) + Math.pow(c1.y - (c2?.y || 0), 2)
  );
};

const coordinatesToCurve = (coordinates: Coordinate[], roundValue: number) =>
  coordinates
    .map((item, index, array) => {
      const prevItem = array[(index + array.length - 1) % array.length];
      const nextItem = array[(index + 1) % array.length];

      const vector = direction(prevItem, nextItem);
      // fixed distance value
      if (distance(vector) > 600) {
        vector.y *= 6;
      }

      // closure function
      const distanceFactor = (targetItem: Coordinate) => ({
        x:
          (vector.x / distance(vector)) *
          distance(targetItem, item) *
          roundValue,
        y:
          (vector.y / distance(vector)) *
          distance(targetItem, item) *
          roundValue,
      });

      const prevDistanceFactor = distanceFactor(prevItem);
      const nextDistanceFactor = distanceFactor(nextItem);

      return {
        coordinate: item,
        prevControl: {
          x: item.x - prevDistanceFactor.x,
          y: item.y - prevDistanceFactor.y,
        },
        nextControl: {
          x: item.x + nextDistanceFactor.x,
          y: item.y + nextDistanceFactor.y,
        },
      };
    })
    .reduce((prev, item, index, array) => {
      const nextItem = array[(index + 1) % array.length];
      let path = "";

      // start of line
      if (index === 0) {
        path += `M ${item.coordinate.x} ${item.coordinate.y} `;
      }

      path += `C ${item.nextControl.x} ${item.nextControl.y} ${nextItem.prevControl.x} ${nextItem.prevControl.y} ${nextItem.coordinate.x} ${nextItem.coordinate.y} `;

      // end of line
      if (index === array.length - 1) {
        path += "Z ";
      }
      return prev + path;
    }, "");

const getDividerCoordinates = (
  data: ChartDataItem[],
  divider: number,
  configs: {
    contentWidth: number;
    monthCount: number;
    mapConfig: MapConfig;
  }
) => {
  const dividerShapeRaw = data
    .sort((first, second) => second.latitude - first.latitude)
    .map((cityItem) => {
      const dividers = getDataDivider(
        cityItem.sunshine.map((sunshineItem) => sunshineItem.value),
        divider,
        true
      );
      const cityX = (index: number) =>
        ((index + 0.5) * configs.contentWidth) / configs.monthCount +
        configs.mapConfig.margin.left;
      const cityY =
        cityItem.latitude * configs.mapConfig.scale.y +
        configs.mapConfig.offset.y;
      return [
        { x: cityX(dividers[0]), y: cityY },
        { x: cityX(dividers[dividers.length - 1]), y: cityY },
      ] as [Coordinate, Coordinate];
    })
    .reduce(
      (prev, item) => {
        prev[0].push(item[0]);
        prev[1].unshift(item[1]);
        return prev;
      },
      [[], []] as [Coordinate[], Coordinate[]]
    );

  return [...dividerShapeRaw[0], ...dividerShapeRaw[1]].filter(
    (item) => !isNaN(item.x) && !isNaN(item.y)
  );
};

const Chart = ({
  data,
  mapSVG,
  locationSVG,
}: {
  data: ChartDataItem[];
  mapSVG: XMLDocument;
  locationSVG: XMLDocument;
}) => {
  // map configurations
  const mapConfig: MapConfig = {
    canvasWidth: 1600,
    canvasHeight: 600,
    mapWidth: 1280,
    mapHeight: 600,
    margin: { left: 160, right: 160, top: 27.5 },
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

      // background shape mask
      svg
        .select(".plot-area")
        .append("mask")
        .attr("id", "background-mask")
        .append("rect")
        .attr("width", mapConfig.mapWidth - mapConfig.blockGap)
        .attr("height", mapConfig.mapHeight - mapConfig.margin.top)
        .attr("x", mapConfig.margin.left)
        .attr("y", mapConfig.margin.top)
        .attr("fill", "white");

      svg
        .select(".plot-area")
        .append("g")
        .attr("class", "background-shape-container");

      // draw background shape
      const roundFixedValue = 0.5;

      [50, 100, 150, 200, 250, 300, 335].forEach(
        (dividerValue, index, array) => {
          if (index === 0) return;

          const configs = {
            contentWidth,
            monthCount,
            mapConfig,
          };
          const outer = coordinatesToCurve(
            getDividerCoordinates(data, dividerValue, configs),
            roundFixedValue
          );

          const inner = coordinatesToCurve(
            getDividerCoordinates(data, array[index - 1], configs),
            roundFixedValue
          );

          svg
            .select(".background-shape-container")
            .append("path")
            .attr("class", "background-shape")
            .attr("d", outer + inner)
            .attr("mask", "url(#background-mask)")
            .attr("fill", colorMap(dividerValue))
            .attr("fill-opacity", 0.45)
            .attr("fill-rule", "evenodd")
            .attr("stroke", chroma(colorMap(dividerValue)).darken(1).hex())
            .attr("stroke-width", 2)
            .attr("stroke-opacity", 0.5);
        }
      );

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
          .attr("fill", "black")
          .attr("fill-opacity", 0.15);

        // label on marker
        svg
          .select(`.city-${cityItem.city}`)
          .append("text")
          .text(cityItem.city)
          .attr("x", labelWidth / 2 + labelXOffset)
          .attr("y", labelYOffset + mapConfig.fontSize / 2.5)
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
    <svg
      ref={svgRef}
      style={{
        width: "1600",
        height: "600",
        margin: "auto",
      }}
    />
  );
};

export const ExperimentTwo = () => {
  const [data, setData] = useState<ChartDataItem[] | undefined>();
  const [mapSVG, setMapSVG] = useState<XMLDocument | undefined>();
  const [locationSVG, setLocationSVG] = useState<XMLDocument | undefined>();

  const resourcePath = `../../experiment-data/experiment-2/`;

  useEffect(() => {
    // load data from csv file
    d3.csv(resourcePath + "sunshine.csv", d3.autoType).then((data) =>
      setData(toChartItem(data as SunshineDataItem[]))
    );

    // load US map from svg
    d3.xml(resourcePath + "usa.svg").then(setMapSVG);
    // load location map from svg
    d3.xml(resourcePath + "location.svg").then(setLocationSVG);
  }, [resourcePath]);

  return (
    <>
      <ExperimentHeader
        title={"CSE412 - Visualization Design of Sunshine in Major U.S. Cities"}
        customElement={
          <Illustration
            title={"Design Rationale\n设计说明"}
            content={"我的设计说明是这样的这样的这样的"}
          />
        }
      />
      <Container>
        {mapSVG && locationSVG && data ? (
          <Chart data={data} mapSVG={mapSVG} locationSVG={locationSVG} />
        ) : null}
      </Container>
    </>
  );
};

const Container = styled.div`
  width: 100%;
  margin: 5rem 0;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const IllustrationContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  flex-direction: row;
`;

const IllustrationTitle = styled.div`
  width: 10%;
  font-size: 2rem;
  font-weight: bold;
  text-align: right;
  padding-right: 2rem;
`;

const IllustrationContentBlock = styled.div`
  width: 40%;
  text-wrap: normal;
  padding-left: 1rem;
  padding-top: 0.5rem;
  border-left: 1rem solid #e7e7e7;
`;
