import { useSVG } from "hooks/useD3";
import * as d3 from "d3";
import React from "react";
import { BarChartItem } from "./index";

const BarChart = ({ data }: { data: BarChartItem[] }) => {
  const svgRef = useSVG(
    (svg) => {
      if (!data) {
        return;
      }
      const height = 300; // +svg.style("height");
      const width = 400; // +svg.style("width");

      const margin = {
        top: 40,
        right: 40,
        bottom: 40,
        left: 40,
      };

      const x = d3
        .scaleBand()
        .domain(data.map((item) => item.class))
        .range([margin.left, width - margin.right])
        .padding(0.2);

      const y = d3
        .scaleLinear()
        .domain([
          d3.max(data, (item) =>
            Math.max(item.count.female, item.count.male)
          ) || 0,
          0,
        ])
        .range([margin.top, height - margin.bottom])
        .interpolate(d3.interpolateRound); // only returns integer

      svg
        .append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(x));

      svg
        .append("g")
        .attr("class", "y-axis")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(y));

      svg
        .append("g")
        .attr("class", "plot-area")
        .selectAll(".bar")
        .data(data)
        .join((enter) => {
          const g = enter.append("g");
          g.append("rect")
            .attr("class", "bar")
            .attr("fill", "steelblue")
            .attr("x", (item) => x(item.class) || null)
            .attr("width", x.bandwidth() / 2)
            .attr("y", (item) => y(item.count.female))
            .attr("height", (item) => y(0) - y(item.count.female));

          g.append("text")
            .attr("class", "label")
            .text((item) => item.count.female)
            .attr("x", (item) => (x(item.class) || 0) + x.bandwidth() / 4)
            .attr("y", (item) => y(item.count.female) - 4)
            .attr("font-size", 12)
            .attr("text-anchor", "middle");

          g.append("rect")
            .attr("class", "bar")
            .attr("fill", "red")
            .attr("x", (item) => (x(item.class) || 0) + x.bandwidth() / 2)
            .attr("width", x.bandwidth() / 2)
            .attr("y", (item) => y(item.count.male))
            .attr("height", (item) => y(0) - y(item.count.male));

          g.append("text")
            .attr("class", "label")
            .text((item) => item.count.male)
            .attr("x", (item) => (x(item.class) || 0) + (x.bandwidth() * 3) / 4)
            .attr("y", (item) => y(item.count.male) - 4)
            .attr("font-size", 12)
            .attr("text-anchor", "middle");

          return g;
        });
    },
    [data]
  );

  return (
    <svg
      ref={svgRef}
      style={{
        width: "100%",
        height: "100%",
        marginRight: "10px",
        marginLeft: "10px",
      }}
    />
  );
};

export default BarChart;
