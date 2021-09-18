import { useSVG } from "hooks/useD3";
import * as d3 from "d3";
import React from "react";
import { ChartDataProps } from "./index";

const PieChart = (props: ChartDataProps) => {
  const svgRef = useSVG(
    (svg) => {
      const width = 360;
      const height = 360;
      const margin = {
        top: 40,
        right: 40,
        bottom: 40,
        left: 40,
      };

      const radius =
        Math.min(
          width - margin.left - margin.right,
          height - margin.top - margin.bottom
        ) / 2;

      svg
        .append("g")
        .attr("class", "plot-area")
        .attr("width", width)
        .attr("height", height)
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

      const pieChartData = d3.pie<[string, number]>().value((d) => d[1]);

      props.data.forEach((item, index, array) => {
        const arc = d3
          .arc<any>()
          .innerRadius((radius * (index + 1)) / (array.length + 1) + 5)
          .outerRadius((radius * (index + 2)) / (array.length + 1));

        const subData = Object.entries(item.count);

        svg
          .selectAll("plot-area")
          .data(pieChartData(subData))
          .join("path")

          .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
          .attr("d", arc)
          .attr("fill", (d) =>
            props.colorMap(props.data[index].class, d.data[0])
          );
      });
    },
    [props.data]
  );

  return (
    <svg
      ref={svgRef}
      style={{
        width: "360",
        height: "360",
        margin: "auto",
      }}
    />
  );
};

export default PieChart;
